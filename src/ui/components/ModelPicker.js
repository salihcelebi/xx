import { getLogoGlyph } from './icons/logoMap.js';

const QUICK_MODELS = [
  'mistralai/mistral-small-3.2-24b-instruct',
  'google/gemma-2-27b-it',
  'openai/gpt-5.1',
  'x-ai/grok-4',
  'openai/gpt-5.2-pro',
];

export function renderModelPicker({ models = [], selectedModelId = null, onSelect }) {
  const root = document.createElement('div');
  root.className = 'model-picker-ui';
  const select = document.createElement('select');
  select.setAttribute('aria-label', 'Model Seç');

  const all = [...new Map(models.map((m) => [m.id, m])).values()];
  const quick = QUICK_MODELS.map((id) => all.find((model) => model.id === id)).filter(Boolean);
  const quickGroup = document.createElement('optgroup');
  quickGroup.label = 'Hızlı Seçim';
  quick.forEach((model) => {
    const option = document.createElement('option');
    option.value = model.id;
    option.textContent = `${getLogoGlyph(model.logoKey)} ${model.displayName || model.id}`;
    quickGroup.append(option);
  });

  const allGroup = document.createElement('optgroup');
  allGroup.label = 'Tüm Modeller';
  all.forEach((model) => {
    const option = document.createElement('option');
    option.value = model.id;
    option.textContent = `${getLogoGlyph(model.logoKey)} ${model.displayName || model.id}`;
    allGroup.append(option);
  });

  select.append(quickGroup, allGroup);
  if (selectedModelId) select.value = selectedModelId;
  select.addEventListener('change', () => onSelect?.(select.value));

  root.append(select);
  return root;
}
