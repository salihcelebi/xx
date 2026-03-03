import { renderCheckbox } from './Checkbox.js';

const TOOLS = [
  { key: 'web_search', label: 'Web Araması' },
  { key: 'file_search', label: 'Dosyalarda Ara' },
  { key: 'image', label: 'Görsel Üretimi' },
  { key: 'video', label: 'Video Üretimi' },
  { key: 'tts', label: 'Ses Üretimi' },
  { key: 'dubbing', label: 'Dublaj' },
  { key: 'coding', label: 'Kodlama' },
];

export function renderToolsMenu({ enabled = {}, onChange }) {
  const root = document.createElement('div');
  root.className = 'tools-menu';
  TOOLS.forEach((tool) => {
    const row = renderCheckbox({ checked: Boolean(enabled[tool.key]), label: tool.label });
    row.input.addEventListener('change', () => onChange?.(tool.key, row.input.checked));
    root.append(row.root);
  });
  return root;
}
