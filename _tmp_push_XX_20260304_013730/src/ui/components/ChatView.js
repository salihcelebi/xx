import { renderMessageBubble } from './MessageBubble.js';

export function renderChatView({ messages = [] }) {
  const root = document.createElement('section');
  root.className = 'chat-view';
  messages.forEach((message) => root.append(renderMessageBubble(message)));
  queueMicrotask(() => {
    root.scrollTop = root.scrollHeight;
  });
  return root;
}
