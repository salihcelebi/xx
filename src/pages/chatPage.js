import { renderChatView } from '../ui/components/ChatView.js';
import { renderComposer } from '../ui/components/Composer.js';
import { renderCitationList } from '../ui/components/CitationList.js';
import { sendMessage } from '../store/slices/chatSlice.js';

let unsubscribe = null;

function deriveThreadTitle(content = '') {
  const trimmed = String(content || '').trim();
  if (!trimmed) return 'Yeni Sohbet';
  return trimmed.slice(0, 48);
}

function bindComposerBehavior(composer, { store, threadId, statusBar }) {
  const textarea = composer.querySelector('textarea');
  const sendButton = composer.querySelector('[data-action="send"]');

  const syncBusyState = () => {
    const busy = store.getState().chat.ui.isStreaming || store.getState().chat.ui.isSending;
    sendButton.disabled = busy;
    sendButton.textContent = busy ? 'Yanıt üretiliyor…' : 'Gönder';
  };

  textarea?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      composer.requestSubmit();
    }
  });

  syncBusyState();
  return store.subscribe(syncBusyState);
}

export async function render({ els, store }) {
  const state = store.getState();
  const threadId = state.chat.activeThreadId;
  const messages = threadId ? (state.chat.messagesByThread[threadId] || []) : [];

  const root = document.createElement('section');
  root.className = 'content-grid';

  const chatView = renderChatView({ messages });
  const composer = renderComposer({
    onSubmit: async (value) => {
      const content = String(value || '').trim();
      if (!content) return;

      if (!store.getState().chat.activeThreadId) {
        store.dispatch({ type: 'chat/newThread', payload: { title: deriveThreadTitle(content) } });
      }

      els.statusBar.textContent = 'Yanıt üretiliyor…';
      await sendMessage({ dispatch: store.dispatch, getState: store.getState }, { content, threadId: store.getState().chat.activeThreadId });
      els.statusBar.textContent = store.getState().chat.ui.lastError ? 'İşlem tamamlanamadı.' : 'Hazır';
    },
    onAttach: () => {
      els.statusBar.textContent = 'Dosya ekleme yakında bu akışta aktif olacak.';
    },
    onVoice: () => {
      els.statusBar.textContent = 'Sesli mod: STT → Chat → TTS akışı başlatılıyor.';
    },
  });

  const citation = renderCitationList([]);
  root.append(chatView, citation, composer);

  unsubscribe?.();
  unsubscribe = bindComposerBehavior(composer, { store, threadId, statusBar: els.statusBar });

  return root;
}

export function destroy() {
  unsubscribe?.();
  unsubscribe = null;
}
