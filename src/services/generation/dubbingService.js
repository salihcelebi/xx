import { convertSpeech } from '../aiService.js';

const TIMEOUT_MS = 45_000;

function makeError(code, retryable, details = null) {
  return {
    code,
    retryable,
    details,
    messageKey: `dubbing.error.${String(code).toLowerCase()}`,
    ts: Date.now(),
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

function mapError(error) {
  if (error?.code && error?.messageKey) return error;
  if (error?.name === 'AbortError') return makeError('CANCELLED', false, error);
  const message = String(error?.message || '').toLowerCase();
  if (error?.code === 'TIMEOUT' || message.includes('timeout')) return makeError('TIMEOUT', true, error);
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

export async function dubSpeech({ file, options = {}, testMode = false, signal } = {}) {
  if (!file) return { ok: false, error: makeError('BAD_INPUT', false, { field: 'file' }) };

  try {
    const audioEl = testMode
      ? createTestAudioElement()
      : await withTimeout(Promise.resolve(convertSpeech(file, { ...options, signal })), TIMEOUT_MS);

    if (signal?.aborted) throw Object.assign(new Error('aborted'), { name: 'AbortError' });

    return {
      ok: true,
      audioEl,
      meta: {
        modelUsed: options.model || null,
        voice: options.voice || null,
        requestType: 'dubbing',
        durationMs: Date.now(),
      },
    };
  } catch (error) {
    return { ok: false, error: mapError(error) };
  }
}
