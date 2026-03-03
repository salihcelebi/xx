export function renderComposer({ onSubmit, onAttach, onVoice }) {
  const root = document.createElement('form');
  root.className = 'composer';
  root.innerHTML = `
    <textarea aria-label="Mesaj yaz" placeholder="Mesaj yaz…"></textarea>
    <div class="composer-actions">
      <button type="button" data-action="attach">Dosya Ekle</button>
      <button type="button" data-action="voice">Sesli Mod</button>
      <button type="submit" data-action="send">Gönder</button>
    </div>
  `;
  const textarea = root.querySelector('textarea');
  root.addEventListener('submit', (event) => {
    event.preventDefault();
    onSubmit?.(textarea.value);
    textarea.value = '';
  });
  root.querySelector('[data-action="attach"]').addEventListener('click', () => onAttach?.());
  root.querySelector('[data-action="voice"]').addEventListener('click', () => onVoice?.());
  return root;
}
