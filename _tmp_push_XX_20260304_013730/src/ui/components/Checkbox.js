export function renderCheckbox({ checked = false, label = '' }) {
  const labelEl = document.createElement('label');
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = checked;
  const span = document.createElement('span');
  span.textContent = label;
  labelEl.append(input, span);
  return { root: labelEl, input };
}
