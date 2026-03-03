import { generateImage as aiGenerateImage } from '../aiService.js';
// Görsel üretimini tek noktadan yönetir.

const TIMEOUT_MS = 45_000;
const MAX_PROMPT_LENGTH = 2000;

function now() {
  return Date.now();
}

function makeId(prefix = 'img') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

function makeError(code, retryable, details = null) {
  return {
    code,
    messageKey: `image.error.${String(code).toLowerCase()}`,
    retryable,
    ts: now(),
    details,
  };
}

function withTimeout(promise, timeoutMs = TIMEOUT_MS) {
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

function simpleHash(input = '') {
  let hash = 0;
  const str = String(input);
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `h_${Math.abs(hash)}`;
}

function normalizeOptions(options = {}, modelId, inputImageUrl = null) {
  const normalized = { model: modelId };
  if (options.size != null) normalized.size = options.size;
  if (options.width != null) normalized.width = Number(options.width);
  if (options.height != null) normalized.height = Number(options.height);
  if (options.aspectRatio != null) normalized.aspectRatio = options.aspectRatio;
  if (options.steps != null) normalized.steps = Number(options.steps);
  if (options.qualityPreset != null) normalized.qualityPreset = options.qualityPreset;
  if (options.seed != null) normalized.seed = options.seed;
  if (inputImageUrl != null) normalized.inputImageUrl = inputImageUrl;
  return normalized;
}

function mapError(error) {
  if (error?.code && error?.messageKey) return error;
  if (error?.name === 'AbortError') return makeError('CANCELLED', false, error);

  const message = String(error?.message || '').toLowerCase();
  if (error?.code === 'TIMEOUT' || message.includes('timeout')) return makeError('TIMEOUT', true, error);
  if (message.includes('plan') || message.includes('premium') || message.includes('pro')) return makeError('PLAN_REQUIRED', false, error);
  if (message.includes('quota') || message.includes('credit')) return makeError('QUOTA', true, error);
  if (message.includes('rate')) return makeError('RATE_LIMIT', true, error);
  if (message.includes('network') || message.includes('fetch')) return makeError('NETWORK', true, error);
  if (message.includes('model') && message.includes('not')) return makeError('MODEL_UNAVAILABLE', true, error);
  return makeError('UNKNOWN', true, error);
}

function createTestImageElement() {
  return {
    currentSrc: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgA0nVwEAAAAASUVORK5CYII=',
    src: 'about:blank',
    dataset: { source: 'testMode', mimeType: 'image/png' },
  };
}

async function runGenerate({ prompt, modelId, options = {}, inputImageUrl = null, testMode = false, signal }) {
  const startedAt = now();
  const correlationId = makeId('img_corr');

  const normalizedPrompt = String(prompt || '').trim();
  if (!normalizedPrompt) return { ok: false, error: makeError('BAD_INPUT', false, { field: 'prompt' }) };
  if (normalizedPrompt.length > MAX_PROMPT_LENGTH) {
    return { ok: false, error: makeError('BAD_INPUT', false, { field: 'prompt', max: MAX_PROMPT_LENGTH }) };
  }
  if (!String(modelId || '').trim()) return { ok: false, error: makeError('BAD_INPUT', false, { field: 'modelId' }) };
  if (inputImageUrl !== null && !String(inputImageUrl || '').trim()) return { ok: false, error: makeError('BAD_INPUT', false, { field: 'inputImageUrl' }) };

  try {
    const normalizedOptions = normalizeOptions(options, modelId, inputImageUrl);
    const promptHash = simpleHash(normalizedPrompt);
    const optionsHash = simpleHash(JSON.stringify(normalizedOptions));

    let imgEl;
    if (testMode) {
      imgEl = createTestImageElement();
    } else {
      imgEl = await withTimeout(
        Promise.resolve(aiGenerateImage(normalizedPrompt, { ...normalizedOptions, signal })),
        TIMEOUT_MS,
      );
      if (signal?.aborted) throw Object.assign(new Error('aborted'), { name: 'AbortError' });
    }

    return {
      ok: true,
      imgEl,
      imgUrl: imgEl?.currentSrc || imgEl?.src || null,
      mimeType: imgEl?.dataset?.mimeType || null,
      source: imgEl?.dataset?.source || null,
      meta: {
        correlationId,
        durationMs: now() - startedAt,
        status: 'succeeded',
        modelUsed: modelId,
        seed: normalizedOptions.seed ?? null,
        size: normalizedOptions.size || (normalizedOptions.width && normalizedOptions.height ? `${normalizedOptions.width}x${normalizedOptions.height}` : null),
        promptHash,
        optionsHash,
        requestType: 'image',
        isTest: Boolean(testMode),
      },
    };
  } catch (error) {
    return { ok: false, error: mapError(error) };
  }
}

export async function generateImage({ prompt, modelId, options = {}, testMode = false, signal } = {}) {
  return runGenerate({ prompt, modelId, options, testMode, signal });
}

export async function generateImageFromImage({ prompt, inputImageUrl, modelId, options = {}, testMode = false, signal } = {}) {
  return runGenerate({ prompt, modelId, options, inputImageUrl, testMode, signal });
}

export function getImageMeta({ imgEl } = {}) {
  if (!imgEl) return null;
  return {
    imgUrl: imgEl.currentSrc || imgEl.src || null,
    mimeType: imgEl?.dataset?.mimeType || null,
    source: imgEl?.dataset?.source || null,
  };
}
