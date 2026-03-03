import { loadThreadHistory, sendChatCompletion } from '../../services/generation/chatService.js';

const CHAT_PERSIST_VERSION = 'v1';
const CHAT_PERSIST_KEY = `nisai:chat:threads:${CHAT_PERSIST_VERSION}`;
const MESSAGE_ROLES = new Set(['user', 'assistant', 'system']);

function now() {
  return Date.now();
}

function makeId(prefix = 'id') {
  // NISAI.MD'de netleştir: UUID standardı kesinleştirilecek.
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function makeError(code, message, details = null, scope = 'chat') {
  return { code, message, details, ts: now(), scope };
}

function getStorage() {
  if (typeof localStorage !== 'undefined') return localStorage;
  return { getItem: () => null, setItem: () => {} };
}

function persistThreads(state) {
  // NISAI.MD'de netleştir: full history persist edilmez, sadece küçük thread özeti tutulur.
  const payload = {
    threads: state.threads,
    activeThreadId: state.activeThreadId,
  };
  getStorage().setItem(CHAT_PERSIST_KEY, JSON.stringify(payload));
}

export const initialChatState = {
  // NISAI.MD gereksinim 1: minimal chat state şeması.
  threads: [],
  activeThreadId: null,
  messagesByThread: {},
  ui: {
    isSending: false,
    isStreaming: false,
    isLoadingHistory: false,
    streamBuffer: '',
    lastError: null,
    streamRequestId: null,
    pendingInput: null,
  },
};

export const chatActions = {
  newThread: (payload = {}) => ({ type: 'chat/newThread', payload }),
  setActiveThread: (threadId) => ({ type: 'chat/setActiveThread', payload: { threadId } }),
  addMessage: (payload) => ({ type: 'chat/addMessage', payload }),
  startStream: (payload) => ({ type: 'chat/startStream', payload }),
  appendStreamChunk: (payload) => ({ type: 'chat/appendStreamChunk', payload }),
  finishStream: (payload) => ({ type: 'chat/finishStream', payload }),
  cancelStream: (payload) => ({ type: 'chat/cancelStream', payload }),
  setSending: (isSending) => ({ type: 'chat/setSending', payload: { isSending } }),
  setLoadingHistory: (isLoadingHistory) => ({ type: 'chat/setLoadingHistory', payload: { isLoadingHistory } }),
  setError: (payload) => ({ type: 'chat/setError', payload }),
  clearError: () => ({ type: 'chat/clearError' }),
  setThreadMessages: (payload) => ({ type: 'chat/setThreadMessages', payload }),
};

function ensureThreadState(state, threadId) {
  if (state.messagesByThread[threadId]) return state;
  return {
    ...state,
    messagesByThread: {
      ...state.messagesByThread,
      [threadId]: [],
    },
  };
}

function normalizeMessage(input) {
  if (!MESSAGE_ROLES.has(input.role)) {
    throw makeError('CHAT_INVALID_ROLE', 'Invalid role');
  }

  return {
    id: input.id || makeId('msg'),
    role: input.role,
    content: String(input.content || ''),
    ts: input.ts || now(),
    meta: input.meta || {},
  };
}

export function chatReducer(state = initialChatState, action) {
  switch (action.type) {
    case 'chat/newThread': {
      // NISAI.MD gereksinim 4: newThread activeThread'i yeni id'ye alır.
      const threadId = action.payload?.id || makeId('thread');
      const ts = now();
      const title = action.payload?.title || 'New chat';
      const next = {
        ...state,
        threads: [{ id: threadId, title, createdAt: ts, updatedAt: ts }, ...state.threads],
        activeThreadId: threadId,
        messagesByThread: { ...state.messagesByThread, [threadId]: [] },
        ui: { ...state.ui, streamBuffer: '', lastError: null },
      };
      persistThreads(next);
      return next;
    }

    case 'chat/setActiveThread': {
      // NISAI.MD gereksinim 5: invalid thread no-op + error.
      const threadId = action.payload?.threadId;
      const exists = state.threads.some((thread) => thread.id === threadId);
      if (!exists) {
        return {
          ...state,
          ui: { ...state.ui, lastError: makeError('CHAT_THREAD_NOT_FOUND', 'Thread not found', { threadId }) },
        };
      }

      const next = {
        ...state,
        activeThreadId: threadId,
        ui: { ...state.ui, streamBuffer: '' },
      };
      persistThreads(next);
      return next;
    }

    case 'chat/addMessage': {
      // NISAI.MD gereksinim 6: role whitelist + updatedAt güncelle.
      try {
        const threadId = action.payload?.threadId || state.activeThreadId;
        if (!threadId) return state;

        let ensured = ensureThreadState(state, threadId);
        const message = normalizeMessage(action.payload.message);
        const messages = [...ensured.messagesByThread[threadId], message];

        return {
          ...ensured,
          messagesByThread: {
            ...ensured.messagesByThread,
            [threadId]: messages,
          },
          threads: ensured.threads.map((thread) => (thread.id === threadId ? { ...thread, updatedAt: now() } : thread)),
        };
      } catch (error) {
        return {
          ...state,
          ui: {
            ...state.ui,
            lastError: makeError(error.code || 'CHAT_ADD_MESSAGE_FAILED', error.message, error.details),
          },
        };
      }
    }

    case 'chat/startStream':
      // NISAI.MD gereksinim 8: stream başlatıldığında flags temiz ve tutarlı olur.
      return {
        ...state,
        ui: {
          ...state.ui,
          isStreaming: true,
          streamBuffer: '',
          streamRequestId: action.payload?.requestId || null,
          lastError: null,
        },
      };

    case 'chat/appendStreamChunk':
      return {
        ...state,
        ui: {
          ...state.ui,
          streamBuffer: `${state.ui.streamBuffer}${action.payload?.chunk || ''}`,
        },
      };

    case 'chat/finishStream': {
      const threadId = action.payload?.threadId || state.activeThreadId;
      if (!threadId) return { ...state, ui: { ...state.ui, isStreaming: false, streamBuffer: '' } };

      const ensured = ensureThreadState(state, threadId);
      const assistantMessage = {
        id: action.payload?.messageId || makeId('msg'),
        role: 'assistant',
        content: action.payload?.content || ensured.ui.streamBuffer,
        ts: now(),
        meta: action.payload?.meta || {},
      };

      return {
        ...ensured,
        messagesByThread: {
          ...ensured.messagesByThread,
          [threadId]: [...ensured.messagesByThread[threadId], assistantMessage],
        },
        ui: {
          ...ensured.ui,
          isStreaming: false,
          streamBuffer: '',
          streamRequestId: null,
        },
      };
    }

    case 'chat/cancelStream':
      return {
        ...state,
        ui: {
          ...state.ui,
          isStreaming: false,
          streamBuffer: '',
          streamRequestId: null,
          lastError: action.payload?.reason ? makeError('CHAT_STREAM_CANCELED', 'Stream canceled', action.payload) : state.ui.lastError,
        },
      };

    case 'chat/setSending':
      return { ...state, ui: { ...state.ui, isSending: Boolean(action.payload?.isSending) } };

    case 'chat/setLoadingHistory':
      return { ...state, ui: { ...state.ui, isLoadingHistory: Boolean(action.payload?.isLoadingHistory) } };

    case 'chat/setError':
      // NISAI.MD gereksinim 10: standart error objesi.
      return { ...state, ui: { ...state.ui, lastError: action.payload } };

    case 'chat/clearError':
      return { ...state, ui: { ...state.ui, lastError: null } };

    case 'chat/setThreadMessages': {
      const { threadId, messages } = action.payload;
      if (!threadId) return state;
      const current = state.messagesByThread[threadId] || [];
      const existingIds = new Set(current.map((message) => message.id));
      const normalized = messages
        .map((message) => normalizeMessage(message))
        .filter((message) => !existingIds.has(message.id));

      return {
        ...state,
        messagesByThread: {
          ...state.messagesByThread,
          [threadId]: [...current, ...normalized],
        },
      };
    }

    default:
      return state;
  }
}

export async function sendMessage({ dispatch, getState }, { content, threadId = null }) {
  const state = getState();
  const activeThreadId = threadId || state.chat.activeThreadId;

  // NISAI.MD gereksinim 9: stream/send çakışması için davranış.
  if (state.chat.ui.isStreaming) {
    // NISAI.MD'de netleştir: queue mu reject mi? Şimdilik reject + pendingInput.
    dispatch(chatActions.setError(makeError('CHAT_STREAM_ACTIVE', 'Cannot send while stream is active', null, 'chat.sendMessage')));
    return;
  }

  const finalThreadId = activeThreadId || makeId('thread');
  if (!activeThreadId) {
    dispatch(chatActions.newThread({ id: finalThreadId }));
  }

  dispatch(chatActions.setSending(true));
  dispatch(chatActions.clearError());
  dispatch(chatActions.addMessage({
    threadId: finalThreadId,
    message: { id: makeId('msg'), role: 'user', content, ts: now(), meta: {} },
  }));

  const root = getState();
  // NISAI.MD'de netleştir: chat model kaynağı app slice mı chat override mı?
  const selectedModel = root.app.selectedModel || 'chat-fast';

  try {
    const requestId = makeId('stream');
    dispatch(chatActions.startStream({ requestId }));

    const messages = (getState().chat.messagesByThread[finalThreadId] || []).map((message) => ({
      role: message.role,
      content: message.content,
    }));

    const response = await sendChatCompletion({
      messages,
      model: selectedModel,
      onChunk: (chunk) => dispatch(chatActions.appendStreamChunk({ chunk })),
    });

    dispatch(chatActions.finishStream({
      threadId: finalThreadId,
      content: response.assistantMessage,
      meta: {
        ...response.meta,
        usedModel: response.meta?.usedModel || selectedModel,
      },
    }));
  } catch (error) {
    dispatch(chatActions.cancelStream({ reason: error.message }));
    dispatch(chatActions.setError(makeError(error.code || 'CHAT_SEND_FAILED', error.message, error, 'chat.sendMessage')));
  } finally {
    dispatch(chatActions.setSending(false));
  }
}

export async function loadThreadHistoryEffect({ dispatch }, threadId) {
  dispatch(chatActions.setLoadingHistory(true));
  dispatch(chatActions.clearError());

  try {
    const history = await loadThreadHistory(threadId);
    dispatch(chatActions.setThreadMessages({ threadId, messages: history }));
  } catch (error) {
    dispatch(chatActions.setError(makeError(error.code || 'CHAT_HISTORY_FAILED', error.message, error, 'chat.loadHistory')));
  } finally {
    dispatch(chatActions.setLoadingHistory(false));
  }
}

export const selectThreads = (state) => state.chat.threads;
export const selectActiveThread = (state) => state.chat.threads.find((thread) => thread.id === state.chat.activeThreadId) || null;
export const selectMessagesForActiveThread = (state) => state.chat.messagesByThread[state.chat.activeThreadId] || [];
export const selectChatBusy = (state) => state.chat.ui.isSending || state.chat.ui.isStreaming || state.chat.ui.isLoadingHistory;
export const selectChatError = (state) => state.chat.ui.lastError;
