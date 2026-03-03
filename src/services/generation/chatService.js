// Chat üretim ve stream akışını Puter AI adaptörü ile yönetir.

const CHAT_TIMEOUT_MS = 30_000;
const CHAT_STREAM_TIMEOUT_MS = 90_000;
const VALID_ROLES = new Set(['user', 'assistant', 'system']);

function now() {
  return Date.now();
}

function makeRequestId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `chat_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function makeError(code, retryable, details = null) {
  return {
    code,
    messageKey: `chat.error.${code.toLowerCase()}`,
    retryable,
    ts: now(),
    details,
  };
}

function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) throw makeError('BAD_INPUT', false, { reason: 'MESSAGES_EMPTY' });
  messages.forEach((message) => {
    if (!VALID_ROLES.has(message.role)) throw makeError('BAD_INPUT', false, { reason: 'INVALID_ROLE', role: message.role });
    if (!String(message.content || '').trim()) throw makeError('BAD_INPUT', false, { reason: 'EMPTY_CONTENT' });
  });
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

function whitelistOptions(options = {}) {
  const allowed = ['temperature', 'top_p', 'max_tokens', 'tools'];
  return allowed.reduce((acc, key) => {
    if (Object.hasOwn(options, key)) acc[key] = options[key];
    return acc;
  }, {});
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
  return makeError('UNKNOWN', true, error);
}

function getPuterAi() {
  if (typeof puter === 'undefined' || !puter?.ai) return null;
  return puter.ai;
}

async function puterChatCall({ messages, modelId, options }) {
  const ai = getPuterAi();
  if (!ai) throw makeError('NOT_SUPPORTED', false, { reason: 'PUTER_AI_UNAVAILABLE' });

  // NISAI.MD'de netleştir: SDK'daki kesin chat metodu adı.
  if (typeof ai.chat === 'function') {
    return ai.chat(messages, { model: modelId, ...options });
  }

  throw makeError('NOT_SUPPORTED', false, { reason: 'PUTER_CHAT_METHOD_MISSING' });
}

export async function sendMessage({ messages, modelId, options = {}, signal, testMode = false }) {
  const startedAt = now();
  const requestId = makeRequestId();
  const correlationId = makeRequestId();

  try {
    validateMessages(messages);

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

    const response = await withTimeout(
      Promise.resolve(puterChatCall({ messages, modelId, options: whitelistOptions(options), signal })),
      CHAT_TIMEOUT_MS,
    );

    return {
      text: response?.text || response?.message || '',
      modelUsed: response?.model || modelId,
      ts: now(),
      usageMeta: response?.usage || null,
      requestId,
      correlationId,
      latencyMs: now() - startedAt,
    };
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
  const requestId = makeRequestId();
  const correlationId = makeRequestId();

  try {
    validateMessages(messages);

    if (testMode) {
      const text = 'Merhaba! (Test modu)';
      const chunks = ['Mer', 'ha', 'ba', '! ', '(Test modu)'];
      for (const chunk of chunks) {
        if (signal?.aborted) throw Object.assign(new Error('aborted'), { name: 'AbortError' });
        onChunk?.(chunk);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      onDone?.({ text, usageMeta: null, modelUsed: modelId, requestId, correlationId, latencyMs: now() - startedAt });
      return;
    }

    const response = await withTimeout(
      Promise.resolve(puterChatCall({ messages, modelId, options: whitelistOptions(options), signal })),
      CHAT_STREAM_TIMEOUT_MS,
    );

    const finalText = String(response?.text || response?.message || '');
    const chunks = finalText.split(' ');
    chunks.forEach((chunk) => onChunk?.(`${chunk} `));

    onDone?.({
      text: finalText,
      usageMeta: response?.usage || null,
      modelUsed: response?.model || modelId,
      requestId,
      correlationId,
      latencyMs: now() - startedAt,
    });
  } catch (error) {
    onError?.(mapServiceError(error));
  }
}

// Geriye dönük uyum: chatSlice mevcut fonksiyonu kullanıyor.
export async function sendChatCompletion({ messages, model, onChunk, signal }) {
  let text = '';
  await streamMessage({
    messages,
    modelId: model,
    onChunk: (chunk) => {
      text += chunk;
      onChunk?.(chunk);
    },
    onDone: () => {},
    onError: (error) => {
      throw error;
    },
    signal,
  });

  return {
    requestId: makeRequestId(),
    assistantMessage: text.trim(),
    meta: {
      usedModel: model,
      tokens: null,
      cost: null,
    },
  };
}

export async function loadThreadHistory(threadId) {
  // NISAI.MD'de netleştir: History için kalıcı kaynak servis sözleşmesi.
  return [{ id: `${threadId}:seed`, role: 'assistant', content: '', ts: now(), meta: { labelKey: 'chat.history.seed' } }];
}
