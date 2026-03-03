export function renderChip({ label = '', removable = false }) {
  const chip = document.createElement('span');
  chip.className = 'chip';
  chip.textContent = label;
  if (removable) {
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = '×';
    removeBtn.setAttribute('aria-label', `${label} kaldır`);
    chip.append(removeBtn);
  }
  return chip;
}
