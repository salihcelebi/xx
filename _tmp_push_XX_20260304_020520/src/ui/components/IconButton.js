export function renderIconButton({ icon = '•', ariaLabel = '', title = '' }) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'icon-btn';
  button.textContent = icon;
  button.title = title;
  button.setAttribute('aria-label', ariaLabel || title || 'ikon');
  return button;
}
