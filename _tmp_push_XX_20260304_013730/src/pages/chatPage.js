import { renderChatView } from '../ui/components/ChatView.js';
import { renderComposer } from '../ui/components/Composer.js';
import { renderCitationList } from '../ui/components/CitationList.js';

let cleanup = [];

export async function render({ els, store }) {
  const state = store.getState();
  const threadId = state.chat.activeThreadId;
  const messages = threadId ? (state.chat.messagesByThread[threadId] || []) : [];

  const root = document.createElement('section');
  root.className = 'content-grid';

  const chatView = renderChatView({ messages });
  const composer = renderComposer({
    onSubmit: (value) => {
      if (!value.trim()) return;
      const id = threadId || 'local-thread';
      if (!threadId) store.dispatch({ type: 'chat/newThread', payload: { id, title: 'Yeni Sohbet' } });
      store.dispatch({ type: 'chat/addMessage', payload: { threadId: id, message: { role: 'user', content: value } } });
      store.dispatch({ type: 'chat/addMessage', payload: { threadId: id, message: { role: 'assistant', content: '...' } } });
    },
    onAttach: () => {
      els.statusBar.textContent = 'Dosya okunuyor…';
    },
    onVoice: () => {
      els.statusBar.textContent = 'Ses üretiliyor…';
    },
  });

  const citation = renderCitationList([]);
  root.append(chatView, citation, composer);

  cleanup = [];
  return root.outerHTML;
}

export function destroy() {
  cleanup.forEach((fn) => fn?.());
  cleanup = [];
}
