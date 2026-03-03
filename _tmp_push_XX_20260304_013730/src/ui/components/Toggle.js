export function renderToggle({ checked = false, label = '', ariaLabel = '' }) {
  const labelEl = document.createElement('label');
  labelEl.className = 'toggle';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = checked;
  input.setAttribute('aria-label', ariaLabel || label);
  const span = document.createElement('span');
  span.textContent = label;
  labelEl.append(input, span);
  return { root: labelEl, input };
}
