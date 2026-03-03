import { renderChatListItem } from './ChatListItem.js';

export function renderChatList({ threads = [], pinnedIds = [], onOpen, onMenu }) {
  const root = document.createElement('div');
  const pinned = threads.filter((t) => pinnedIds.includes(t.id));
  const normal = threads.filter((t) => !pinnedIds.includes(t.id));

  const section = (title, rows) => {
    const wrap = document.createElement('section');
    wrap.innerHTML = `<h4>${title}</h4>`;
    rows.forEach((thread) => wrap.append(renderChatListItem(thread, { onOpen, onMenu })));
    return wrap;
  };

  if (pinned.length) root.append(section('Sabitlenenler', pinned));
  root.append(section('Sohbetler', normal));
  return root;
}
