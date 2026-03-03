import { listModelsByMode } from '../../services/modelCatalog.js';
import { renderModelPicker } from '../components/ModelPicker.js';
import { renderToolsMenu } from '../components/ToolsMenu.js';
import { renderToggle } from '../components/Toggle.js';
import { renderStatusLine } from '../components/StatusLine.js';

// GPT benzeri üst bar: başlık + model + araçlar + geçici sohbet.
export async function mountTopbar({ root, state, mode = 'chat', onModelChange, onToolsChange, onTempChange }) {
  if (!root) return;

  const statusEl = document.querySelector('#status-bar');
  root.innerHTML = '';

  const left = document.createElement('div');
  left.className = 'topbar-left';
  left.innerHTML = `<h1>${mode === 'video' ? 'Video Üretimi' : (state?.chat?.activeThreadTitle || 'Yeni Sohbet')}</h1>`;

  const right = document.createElement('div');
  right.className = 'topbar-right';

  const modelSlot = document.createElement('div');
  modelSlot.className = 'topbar-model-slot';
  modelSlot.textContent = 'Yükleniyor…';
  right.append(modelSlot);

  const toolWrap = document.createElement('details');
  toolWrap.innerHTML = '<summary>Araçlar</summary>';
  toolWrap.append(renderToolsMenu({
    enabled: state?.chat?.toolsEnabled || {},
    onChange: onToolsChange,
  }));
  right.append(toolWrap);

  const temp = renderToggle({
    checked: Boolean(state?.app?.temporaryChat),
    label: 'Geçici Sohbet',
    ariaLabel: 'Geçici sohbet anahtarı',
  });
  temp.input.addEventListener('change', () => onTempChange?.(temp.input.checked));
  right.append(temp.root);

  root.append(left, right);

  try {
    const result = await listModelsByMode(mode);
    if (!result.ok) {
      modelSlot.innerHTML = '<button type="button">Yenile</button>';
      return;
    }
    modelSlot.innerHTML = '';
    modelSlot.append(renderModelPicker({
      models: result.models,
      selectedModelId: state?.app?.selectedModel,
      onSelect: onModelChange,
    }));
  } catch {
    modelSlot.textContent = 'Model yüklenemedi';
  }

  renderStatusLine(statusEl, mode === 'video' ? 'Video üretiliyor…' : 'Yazıyor…');
}
