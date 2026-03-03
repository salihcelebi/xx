import { timeAgoTR } from './utils/timeAgoTR.js';

export function renderChatListItem(thread, { onOpen, onMenu } = {}) {
  const item = document.createElement('button');
  item.type = 'button';
  item.className = 'chat-list-item';
  item.innerHTML = `<strong>${thread.title}</strong><small>${timeAgoTR(thread.updatedAt)}</small>`;
  item.addEventListener('click', () => onOpen?.(thread.id));
  item.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    onMenu?.(thread.id, event);
  });
  return item;
}
