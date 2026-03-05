const STORAGE_KEY = 'nisai:code:canvas:v1';

function readDraft() {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function writeDraft(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value || '');
  } catch {
    // ignore
  }
}

export async function render({ els }) {
  const section = document.createElement('section');
  section.className = 'content-grid';
  section.innerHTML = `
    <article class="card">
      <h2>Kodlama Modu</h2>
      <p>Chat → Canvas akışında kodu düzenleyip kopyalayabilirsiniz.</p>
      <div style="display:flex; gap:8px; margin-bottom:8px;">
        <button id="code-lang-py" type="button">Python</button>
        <button id="code-lang-js" type="button">JavaScript</button>
        <button id="code-copy" type="button">Kopyala</button>
      </div>
      <textarea id="code-editor" style="min-height:280px; width:100%;"></textarea>
      <small id="code-lang">Dil: metin</small>
    </article>
  `;

  const editor = section.querySelector('#code-editor');
  const lang = section.querySelector('#code-lang');
  editor.value = readDraft();
  editor.setSelectionRange(editor.value.length, editor.value.length);

  editor.addEventListener('input', () => {
    writeDraft(editor.value);
  });

  section.querySelector('#code-lang-py').addEventListener('click', () => {
    lang.textContent = 'Dil: python';
    els.statusBar.textContent = 'Kodlama dili Python olarak ayarlandı.';
  });
  section.querySelector('#code-lang-js').addEventListener('click', () => {
    lang.textContent = 'Dil: javascript';
    els.statusBar.textContent = 'Kodlama dili JavaScript olarak ayarlandı.';
  });
  section.querySelector('#code-copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(editor.value);
      els.statusBar.textContent = 'Kod panoya kopyalandı.';
    } catch {
      els.statusBar.textContent = 'Kopyalama başarısız.';
    }
  });

  return section;
}

export function destroy() {}
