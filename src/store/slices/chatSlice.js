// NISAI.MD gereksinim: chat state, thread/messages/flags/errors tutar.
export const initialChatState = {
  threads: [],
  activeThreadId: null,
  messages: [],
  streaming: { isStreaming: false },
  errors: null,
};

export function chatReducer(state = initialChatState, action) {
  switch (action.type) {
    case 'chat/setActiveThread':
      return { ...state, activeThreadId: action.payload };
    case 'chat/setMessages':
      return { ...state, messages: action.payload };
    case 'chat/setStreaming':
      return { ...state, streaming: { ...state.streaming, ...action.payload } };
    case 'chat/setError':
      return { ...state, errors: action.payload };
    default:
      return state;
  }
}
