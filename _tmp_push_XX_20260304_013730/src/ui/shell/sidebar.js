import { renderChatList } from '../components/ChatList.js';
import { renderChatSearchInput } from '../components/ChatSearchInput.js';
import { debounce } from '../components/utils/debounce.js';

// GPT benzeri sol panel: yeni sohbet, arama, sabitlenenler ve sohbet listesi.
export function mountSidebar({ root, state, onNewChat, onOpenThread, onSearch }) {
  if (!root) return;
  root.innerHTML = '';

  const header = document.createElement('section');
  header.className = 'sidebar-header';
  header.innerHTML = '<h2>Nisai Studio</h2>';
  const newBtn = document.createElement('button');
  newBtn.type = 'button';
  newBtn.textContent = 'Yeni Sohbet';
  newBtn.addEventListener('click', () => onNewChat?.());
  header.append(newBtn);

  const searchInput = renderChatSearchInput({
    value: '',
    onInput: debounce((value) => onSearch?.(value), 200),
  });

  const list = renderChatList({
    threads: state?.chat?.threads || [],
    pinnedIds: state?.chat?.pinnedThreadIds || [],
    onOpen: onOpenThread,
    onMenu: () => {},
  });

  const footer = document.createElement('section');
  footer.className = 'sidebar-footer';
  footer.innerHTML = `
    <button type="button">Derin Araştırma</button>
    <button type="button">Ayarlar</button>
    <button type="button">Kullanım ve Maliyet</button>
    <button type="button">Ödeme Ayarları</button>
    <button type="button">Çıkış</button>
  `;

  root.append(header, searchInput, list, footer);
}
