export function renderChatSearchInput({ value = '', onInput }) {
  const input = document.createElement('input');
  input.type = 'search';
  input.value = value;
  input.placeholder = 'Sohbetlerde ara…';
  input.setAttribute('aria-label', 'Sohbetlerde ara');
  input.addEventListener('input', () => onInput?.(input.value));
  return input;
}
