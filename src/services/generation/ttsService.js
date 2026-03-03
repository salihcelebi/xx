import { generateVoice as aiGenerateVoice } from '../aiService.js';
// Metinden ses üretimini tek noktadan yönetir.

const MAX_TEXT_LENGTH = 3000;
const TIMEOUT_MS = 30_000;
const ENGINE_WHITELIST = new Set(['standard', 'neural', 'generative']);

function now() {
  return Date.now();
}

function makeId(prefix = 'tts') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

function makeError(code, retryable, details = null) {
  return {
    code,
    messageKey: `tts.error.${String(code).toLowerCase()}`,
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

function normalizeOptions(options = {}, modelId) {
  const engine = options.engine || 'standard';
  if (!ENGINE_WHITELIST.has(engine)) throw makeError('BAD_INPUT', false, { field: 'engine', engine });

  return {
    voice: options.voice || null,
    engine,
    language: options.language || 'tr-TR',
    model: modelId || options.model || null,
  };
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
  return makeError('UNKNOWN', true, error);
}

function createTestAudioElement() {
  return {
    dataset: { source: 'testMode', mimeType: 'audio/mpeg' },
    play: async () => {},
    pause: () => {},
    currentTime: 0,
    src: 'about:blank',
  };
}

export async function synthesizeSpeech({ text, modelId = null, options = {}, testMode = false, signal } = {}) {
  const startedAt = now();
  const correlationId = makeId('tts_corr');
  const value = String(text || '').trim();
  if (!value) return { ok: false, error: makeError('BAD_INPUT', false, { field: 'text' }) };
  if (value.length > MAX_TEXT_LENGTH) return { ok: false, error: makeError('TEXT_TOO_LONG', false, { max: MAX_TEXT_LENGTH }) };

  try {
    const normalized = normalizeOptions(options, modelId);

    let audioEl;
    if (testMode) {
      audioEl = createTestAudioElement();
    } else {
      audioEl = await withTimeout(
        Promise.resolve(aiGenerateVoice(value, { ...normalized, signal })),
        TIMEOUT_MS,
      );
      if (signal?.aborted) throw Object.assign(new Error('aborted'), { name: 'AbortError' });
    }

    return {
      ok: true,
      audioEl,
      mimeType: audioEl?.dataset?.mimeType || null,
      source: audioEl?.dataset?.source || null,
      duration: Number(audioEl?.duration || 0) || null,
      meta: {
        correlationId,
        durationMs: now() - startedAt,
        engine: normalized.engine,
        voice: normalized.voice,
        language: normalized.language,
        modelUsed: normalized.model,
        requestType: 'tts',
      },
    };
  } catch (error) {
    return { ok: false, error: mapError(error) };
  }
}

export async function play({ audioEl } = {}) {
  if (!audioEl?.play) return { ok: false, error: makeError('BAD_INPUT', false, { field: 'audioEl' }) };
  await audioEl.play();
  return { ok: true };
}

export function stop({ audioEl } = {}) {
  if (!audioEl) return { ok: false, error: makeError('BAD_INPUT', false, { field: 'audioEl' }) };
  if (typeof audioEl.pause === 'function') audioEl.pause();
  if (typeof audioEl.currentTime === 'number') audioEl.currentTime = 0;
  return { ok: true };
}

export function getSupportedVoices() {
  return [];
}

// Teknik notlar: text > 3000 => TEXT_TOO_LONG; timeout => TIMEOUT; paket kilidi => PLAN_REQUIRED.
