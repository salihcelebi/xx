import { generateVideo as aiGenerateVideo } from '../aiService.js';
// Metinden video üretimini yönetir.

const JOB_KIND = 'video';
const STATUS = Object.freeze({
  QUEUED: 'queued',
  RUNNING: 'running',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELED: 'canceled',
});

const DEFAULT_TIMEOUT_MS = 120_000;
const PROGRESS_TICK_MS = 500;
const MAX_RETRY = 2;
const JOB_STORE = new Map();

function now() {
  return Date.now();
}

function makeId(prefix = 'video_job') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

function makeCorrelationId() {
  return makeId('video_corr');
}

function makeError(code, retryable, details = null) {
  return {
    code,
    messageKey: `video.error.${String(code).toLowerCase()}`,
    retryable,
    ts: now(),
    details,
  };
}

function simpleHash(input = '') {
  let hash = 0;
  const str = String(input);
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `h_${Math.abs(hash)}`;
}

function clampProgress(value) {
  return Math.max(0, Math.min(100, Number(value || 0)));
}

function normalizeOptions(options = {}) {
  const normalized = {};
  if (options.duration != null) normalized.duration = Number(options.duration);
  if (options.aspectRatio != null) normalized.aspectRatio = options.aspectRatio;
  if (options.seed != null) normalized.seed = options.seed;
  if (options.fps != null) normalized.fps = Number(options.fps);
  if (options.qualityPreset != null) normalized.qualityPreset = options.qualityPreset;
  if (options.inputImageUrl != null) normalized.inputImageUrl = options.inputImageUrl;
  if (options.model != null) normalized.model = options.model;
  return normalized;
}

function updateJob(jobId, patch) {
  const previous = JOB_STORE.get(jobId);
  if (!previous) return null;
  const next = { ...previous, ...patch, updatedAt: now() };
  JOB_STORE.set(jobId, next);
  return next;
}

function getStatusFromError(error) {
  const message = String(error?.message || '').toLowerCase();
  if (error?.name === 'AbortError') return makeError('CANCELLED', false, error);
  if (error?.code === 'TIMEOUT' || message.includes('timeout')) return makeError('TIMEOUT', true, error);
  if (message.includes('plan') || message.includes('payment') || message.includes('pro')) return makeError('PLAN_REQUIRED', false, error);
  if (message.includes('quota') || message.includes('credit') || message.includes('limit')) return makeError('QUOTA', true, error);
  if (message.includes('rate')) return makeError('RATE_LIMIT', true, error);
  if (message.includes('network') || message.includes('fetch')) return makeError('NETWORK', true, error);
  if (message.includes('model') && message.includes('not')) {
    return makeError('MODEL_UNAVAILABLE', true, { ...error, suggestionFlag: 'FORCE_REFRESH_MODEL_CATALOG' });
  }
  return makeError('UNKNOWN', true, error);
}

function normalizeResult(videoEl, modelId, correlationId, startedAt) {
  const videoUrl = videoEl?.currentSrc || videoEl?.src || null;
  const mimeType = videoEl?.dataset?.mimeType || null;
  const source = videoEl?.dataset?.source || null;

  return {
    result: {
      videoEl: videoEl || null,
      videoUrl,
      mimeType,
      source,
    },
    meta: {
      correlationId,
      durationMs: now() - startedAt,
      modelId,
      status: STATUS.SUCCEEDED,
      errorCode: null,
    },
  };
}

function withTimeout(promise, timeoutMs = DEFAULT_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'TIMEOUT' })), timeoutMs);
    promise.then((value) => {
      clearTimeout(timer);
      resolve(value);
    }).catch((error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

function startProgressTicker(jobId, onProgress) {
  const ticker = setInterval(() => {
    const current = JOB_STORE.get(jobId);
    if (!current || current.status !== STATUS.RUNNING) {
      clearInterval(ticker);
      return;
    }

    const increment = 1 + Math.floor(Math.random() * 3);
    const nextProgress = clampProgress(Math.min(85, current.progress + increment));
    const updated = updateJob(jobId, { progress: nextProgress });
    if (updated) onProgress?.({ ...updated });
  }, PROGRESS_TICK_MS);

  return ticker;
}

function createTestVideoElement() {
  return {
    currentSrc: 'about:blank',
    dataset: { source: 'testMode', mimeType: 'video/mp4' },
  };
}

export function createVideoJob({ prompt, modelId, options = {}, testMode = false } = {}) {
  if (!String(prompt || '').trim()) return { ok: false, error: makeError('BAD_INPUT', false, { field: 'prompt' }) };
  if (!String(modelId || '').trim()) return { ok: false, error: makeError('BAD_INPUT', false, { field: 'modelId' }) };

  const normalizedOptions = normalizeOptions({ ...options, model: modelId });
  const id = makeId();
  const correlationId = makeCorrelationId();

  const job = {
    id,
    kind: JOB_KIND,
    status: STATUS.QUEUED,
    progress: 0,
    createdAt: now(),
    updatedAt: now(),
    prompt,
    modelId,
    optionsHash: simpleHash(JSON.stringify(normalizedOptions)),
    options: normalizedOptions,
    error: null,
    result: null,
    retryCount: Number(options.retryCount || 0),
    testMode: Boolean(testMode || options.testMode),
    telemetry: { correlationId, startedAt: null, endedAt: null, durationMs: null },
    controller: null,
  };

  JOB_STORE.set(id, job);
  return { ok: true, job: { ...job } };
}

export async function runVideoJob({ jobId, onProgress, signal, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const job = JOB_STORE.get(jobId);
  if (!job) return { ok: false, error: makeError('NOT_FOUND', false, { jobId }) };

  const startedAt = now();
  const controller = new AbortController();
  let canceled = false;

  const cancelListener = () => {
    canceled = true;
    controller.abort();
  };

  signal?.addEventListener?.('abort', cancelListener, { once: true });
  updateJob(jobId, { status: STATUS.RUNNING, progress: 5, controller, telemetry: { ...job.telemetry, startedAt } });
  onProgress?.({ ...JOB_STORE.get(jobId) });

  const ticker = startProgressTicker(jobId, onProgress);

  try {
    let videoEl;
    if (job.testMode) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (canceled) throw Object.assign(new Error('cancelled'), { name: 'AbortError' });
      videoEl = createTestVideoElement();
    } else {
      videoEl = await withTimeout(
        Promise.resolve(aiGenerateVideo(job.prompt, { ...job.options, model: job.modelId, signal: controller.signal })),
        timeoutMs,
      );
      if (canceled) throw Object.assign(new Error('cancelled'), { name: 'AbortError' });
    }

    clearInterval(ticker);
    const normalized = normalizeResult(videoEl, job.modelId, job.telemetry.correlationId, startedAt);
    const updated = updateJob(jobId, {
      status: STATUS.SUCCEEDED,
      progress: 100,
      result: normalized.result,
      error: null,
      telemetry: { ...job.telemetry, endedAt: now(), durationMs: now() - startedAt },
    });
    onProgress?.({ ...updated });

    return {
      ok: true,
      job: { ...updated },
      ...normalized,
    };
  } catch (error) {
    clearInterval(ticker);
    const mapped = error?.code && error?.messageKey ? error : getStatusFromError(error);
    const status = mapped.code === 'CANCELLED' ? STATUS.CANCELED : STATUS.FAILED;
    const updated = updateJob(jobId, {
      status,
      error: mapped,
      telemetry: { ...job.telemetry, endedAt: now(), durationMs: now() - startedAt },
    });
    onProgress?.({ ...updated });
    return { ok: false, error: mapped, job: { ...updated } };
  } finally {
    signal?.removeEventListener?.('abort', cancelListener);
  }
}

export function cancelVideoJob({ jobId } = {}) {
  const job = JOB_STORE.get(jobId);
  if (!job) return { ok: false, error: makeError('NOT_FOUND', false, { jobId }) };
  job.controller?.abort?.();
  const updated = updateJob(jobId, {
    status: STATUS.CANCELED,
    error: makeError('CANCELLED', false, { jobId }),
  });

  return {
    ok: true,
    status: STATUS.CANCELED,
    job: { ...updated },
  };
}

export function retryVideoJob({ jobId } = {}) {
  const job = JOB_STORE.get(jobId);
  if (!job) return { ok: false, error: makeError('NOT_FOUND', false, { jobId }) };
  if (![STATUS.FAILED, STATUS.CANCELED].includes(job.status)) {
    return { ok: false, error: makeError('RETRY_DISABLED', false, { status: job.status }) };
  }
  if (Number(job.retryCount || 0) >= MAX_RETRY) {
    return { ok: false, error: makeError('RETRY_LIMIT', false, { maxRetry: MAX_RETRY }) };
  }

  return createVideoJob({
    prompt: job.prompt,
    modelId: job.modelId,
    options: { ...job.options, retryCount: Number(job.retryCount || 0) + 1, retriesFromJobId: job.id },
    testMode: job.testMode,
  });
}

export function getJobSnapshot({ jobId } = {}) {
  const job = JOB_STORE.get(jobId);
  return job ? { ...job } : null;
}

// Geriye dönük uyumluluk: videoSlice eski fonksiyonları kullanır.
export async function submitTxt2Vid({ prompt, options = {} } = {}) {
  const created = createVideoJob({
    prompt,
    modelId: options?.model,
    options,
    testMode: options?.testMode,
  });
  if (!created.ok) throw created.error;
  return { remoteJobId: created.job.id, status: created.job.status };
}

export async function fetchJobStatus(jobId) {
  const snapshot = getJobSnapshot({ jobId });
  if (!snapshot) throw makeError('VIDEO_NOT_FOUND', false, { jobId });

  if (snapshot.status === STATUS.QUEUED) {
    const run = await runVideoJob({ jobId });
    if (!run.ok) {
      return {
        id: run.job.id,
        status: run.job.status,
        progress: run.job.progress,
        result: run.job.result,
        error: run.error,
      };
    }
  }

  const current = getJobSnapshot({ jobId });
  return {
    id: current.id,
    status: current.status,
    progress: current.progress,
    result: current.result,
    error: current.error,
  };
}

export async function cancelRemoteJob(jobId) {
  const result = cancelVideoJob({ jobId });
  return { canceled: result.ok };
}
