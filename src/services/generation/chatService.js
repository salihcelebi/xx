// Chat üretimini Puter AI üzerinden yönetir; validasyon, timeout ve hata eşlemesini merkezileştirir.

const NON_STREAM_TIMEOUT_MS = 30_000;
const STREAM_TIMEOUT_MS = 90_000;
const ALLOWED_ROLES = new Set(['user', 'assistant', 'system']);
const RETRY_DELAY_MS = 1000;

function now() {
  return Date.now();
}

function makeId(prefix = 'chat') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

function makeError(code, retryable, details = null) {
  return {
    code,
    messageKey: `chat.error.${String(code).toLowerCase()}`,
    retryable,
    ts: now(),
    details,
  };
}

function withTimeout(promise, timeoutMs) {
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

function validateInput(messages, modelId) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw makeError('BAD_INPUT', false, { reason: 'MESSAGES_EMPTY' });
  }

  if (!String(modelId || '').trim()) {
    throw makeError('BAD_INPUT', false, { reason: 'MODEL_ID_REQUIRED' });
  }

  for (const message of messages) {
    if (!ALLOWED_ROLES.has(message?.role)) {
      throw makeError('BAD_INPUT', false, { reason: 'INVALID_ROLE', role: message?.role });
    }
    if (!String(message?.content || '').trim()) {
      throw makeError('BAD_INPUT', false, { reason: 'EMPTY_CONTENT' });
    }
  }
}

function sanitizeOptions(options = {}) {
  const allowed = ['temperature', 'top_p', 'max_tokens', 'tools'];
  return allowed.reduce((acc, key) => {
    if (Object.hasOwn(options, key)) acc[key] = options[key];
    return acc;
  }, {});
}

function getPuterAi() {
  if (typeof puter === 'undefined' || !puter?.ai) return null;
  return puter.ai;
}

function normalizeResponse(raw, modelId, metaBase) {
  return {
    text: String(raw?.text || raw?.message || ''),
    modelUsed: raw?.model || modelId,
    ts: now(),
    usageMeta: raw?.usage || null,
    ...metaBase,
  };
}

function mapServiceError(error) {
  if (error?.code === 'BAD_INPUT') return error;
  if (error?.name === 'AbortError') return makeError('CANCELLED', false, error);

  const message = String(error?.message || '').toLowerCase();
  if (error?.code === 'TIMEOUT' || message.includes('timeout')) return makeError('TIMEOUT', true, error);
  if (message.includes('plan') || message.includes('premium') || message.includes('upgrade')) return makeError('PLAN_REQUIRED', false, error);
  if (message.includes('model') && message.includes('not')) return makeError('MODEL_UNAVAILABLE', true, error);
  if (message.includes('rate')) return makeError('RATE_LIMIT', true, error);
  if (message.includes('quota')) return makeError('QUOTA', true, error);
  if (message.includes('network') || message.includes('fetch')) return makeError('NETWORK', true, error);
  if (message.includes('unauthorized') || message.includes('401')) return makeError('UNAUTHORIZED', false, error);
  if (message.includes('not supported') || message.includes('unsupported')) return makeError('NOT_SUPPORTED', false, error);

  return makeError('UNKNOWN', true, error);
}

async function callPuterChat({ messages, modelId, options, signal }) {
  const ai = getPuterAi();
  if (!ai || typeof ai.chat !== 'function') {
    throw makeError('NOT_SUPPORTED', false, { reason: 'PUTER_CHAT_UNAVAILABLE' });
  }

  return ai.chat(messages, { model: modelId, ...options, signal });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callWithSingleNetworkRetry({ messages, modelId, options, signal, timeoutMs }) {
  try {
    return await withTimeout(callPuterChat({ messages, modelId, options, signal }), timeoutMs);
  } catch (firstError) {
    const mapped = mapServiceError(firstError);
    if (mapped.code !== 'NETWORK' || signal?.aborted) throw firstError;
    await sleep(RETRY_DELAY_MS);
    return withTimeout(callPuterChat({ messages, modelId, options, signal }), timeoutMs);
  }
}

export async function sendMessage({ messages, modelId, options = {}, signal, testMode = false }) {
  const startedAt = now();
  const requestId = makeId('request');
  const correlationId = makeId('corr');

  try {
    validateInput(messages, modelId);

    if (testMode) {
      return {
        text: 'Merhaba! (Test modu)',
        modelUsed: modelId,
        ts: now(),
        usageMeta: null,
        requestId,
        correlationId,
        latencyMs: now() - startedAt,
      };
    }

    const raw = await callWithSingleNetworkRetry({
      messages,
      modelId,
      options: sanitizeOptions(options),
      signal,
      timeoutMs: NON_STREAM_TIMEOUT_MS,
    });

    return normalizeResponse(raw, modelId, {
      requestId,
      correlationId,
      latencyMs: now() - startedAt,
    });
  } catch (error) {
    throw mapServiceError(error);
  }
}

export async function streamMessage({
  messages,
  modelId,
  options = {},
  onChunk,
  onDone,
  onError,
  signal,
  testMode = false,
}) {
  const startedAt = now();
  const requestId = makeId('request');
  const correlationId = makeId('corr');

  try {
    validateInput(messages, modelId);

    if (testMode) {
      const chunks = ['Mer', 'ha', 'ba', '! ', '(Test modu)'];
      const text = chunks.join('');
      for (const chunk of chunks) {
        if (signal?.aborted) throw Object.assign(new Error('aborted'), { name: 'AbortError' });
        onChunk?.(chunk);
        await sleep(200);
      }
      onDone?.({
        text,
        usageMeta: null,
        modelUsed: modelId,
        requestId,
        correlationId,
        latencyMs: now() - startedAt,
      });
      return;
    }

    const raw = await callWithSingleNetworkRetry({
      messages,
      modelId,
      options: sanitizeOptions(options),
      signal,
      timeoutMs: STREAM_TIMEOUT_MS,
    });

    const finalText = String(raw?.text || raw?.message || '');
    if (finalText) {
      finalText.split(/(\s+)/).forEach((delta) => {
        if (delta) onChunk?.(delta);
      });
    }

    onDone?.({
      text: finalText,
      usageMeta: raw?.usage || null,
      modelUsed: raw?.model || modelId,
      requestId,
      correlationId,
      latencyMs: now() - startedAt,
    });
  } catch (error) {
    onError?.(mapServiceError(error));
  }
}

// Geriye dönük uyumluluk için korunur; chatSlice bu API'yi kullanır.
export async function sendChatCompletion({ messages, model, onChunk, signal }) {
  let assistantMessage = '';
  let lastError = null;

  await streamMessage({
    messages,
    modelId: model,
    onChunk: (chunk) => {
      assistantMessage += chunk;
      onChunk?.(chunk);
    },
    onDone: () => {},
    onError: (error) => {
      lastError = error;
    },
    signal,
  });

  if (lastError) throw lastError;

  return {
    requestId: makeId('legacy'),
    assistantMessage: assistantMessage.trim(),
    meta: {
      usedModel: model,
      tokens: null,
      cost: null,
    },
  };
}

export async function loadThreadHistory(threadId) {
  return [{
    id: `${threadId}:seed`,
    role: 'assistant',
    content: '',
    ts: now(),
    meta: { labelKey: 'chat.history.seed' },
  }];
}
