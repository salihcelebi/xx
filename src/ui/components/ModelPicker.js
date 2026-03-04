import { getLogoGlyph } from './icons/logoMap.js';
import { canSelectModel, filterModelsByPolicy } from '../../services/policyService.js';

const QUICK_MODELS = [
  'mistralai/mistral-small-3.2-24b-instruct',
  'google/gemma-2-27b-it',
  'openai/gpt-5.1',
  'x-ai/grok-4',
  'openai/gpt-5.2-pro',
];

export function renderModelPicker({
  models = [],
  activeMode = 'chat',
  policy = null,
  selectedPackage = 'free',
  selectedModelId = null,
  onSelect,
  onLockedSelect,
  featuredModels = QUICK_MODELS,
}) {
  const root = document.createElement('div');
  root.className = 'model-picker-ui';
  const search = document.createElement('input');
  search.type = 'search';
  search.placeholder = 'Model ara…';
  search.setAttribute('aria-label', 'Model ara');

  const select = document.createElement('select');
  select.setAttribute('aria-label', 'Model Seç');

  const allUnique = [...new Map(models.map((m) => [m.id, m])).values()];
  const modePolicyFiltered = filterModelsByPolicy(allUnique, { policy, selectedPackage, activeMode });

  const renderOptions = () => {
    const q = search.value.trim().toLowerCase();
    const searchable = q
      ? modePolicyFiltered.filter((model) => (
        model.displayName.toLowerCase().includes(q)
        || model.provider.toLowerCase().includes(q)
        || model.id.toLowerCase().includes(q)
      ))
      : modePolicyFiltered;

    const featuredSet = new Set(featuredModels);
    const quick = searchable.filter((model) => featuredSet.has(model.id));

    select.innerHTML = '';
    const quickGroup = document.createElement('optgroup');
    quickGroup.label = 'Hızlı Seçim';
    quick.forEach((model) => {
      const option = document.createElement('option');
      const perm = canSelectModel(model, { policy, selectedPackage, activeMode });
      option.value = model.id;
      option.disabled = !perm.allowed;
      option.textContent = `${getLogoGlyph(model.logoKey)} ${model.displayName || model.id}${perm.allowed ? '' : ' 🔒'}`;
      quickGroup.append(option);
    });

    const allGroup = document.createElement('optgroup');
    allGroup.label = 'Mode + Policy Uyumlu';
    searchable.forEach((model) => {
      const option = document.createElement('option');
      const perm = canSelectModel(model, { policy, selectedPackage, activeMode });
      option.value = model.id;
      option.disabled = !perm.allowed;
      option.textContent = `${getLogoGlyph(model.logoKey)} ${model.displayName || model.id}${perm.allowed ? '' : ' 🔒'}`;
      allGroup.append(option);
    });

    select.append(quickGroup, allGroup);
    if (selectedModelId) select.value = selectedModelId;
  };

  renderOptions();

  let timer = null;
  search.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(renderOptions, 120);
  });

  select.addEventListener('change', () => {
    const selected = modePolicyFiltered.find((model) => model.id === select.value);
    const perm = canSelectModel(selected, { policy, selectedPackage, activeMode });
    if (!perm.allowed) {
      onLockedSelect?.(perm.reason || 'MODEL_LOCKED');
      renderOptions();
      return;
    }
    onSelect?.(select.value);
  });

  root.append(search, select);
  return root;
}
