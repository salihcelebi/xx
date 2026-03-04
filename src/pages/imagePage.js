import { generateImage, generateImageFromImage } from '../services/generation/imageService.js';
import { renderImageGrid } from '../ui/components/ImageGrid.js';

let images = [];

export async function render({ els, store }) {
  const section = document.createElement('section');
  section.className = 'content-grid';

  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    <h2>Görsel Üretimi</h2>
    <textarea id="img-prompt" placeholder="Görsel promptu"></textarea>
    <div style="display:flex; gap:8px; margin-top:8px;">
      <input id="img-file" type="file" accept="image/*" />
      <button id="img-generate" type="button">Üret</button>
    </div>
    <div id="img-grid" style="margin-top:10px;"></div>
  `;

  const promptEl = card.querySelector('#img-prompt');
  const fileEl = card.querySelector('#img-file');
  const gridEl = card.querySelector('#img-grid');

  const repaint = () => {
    gridEl.innerHTML = '';
    gridEl.append(renderImageGrid(images));
  };

  card.querySelector('#img-generate').addEventListener('click', async () => {
    const prompt = promptEl.value.trim();
    if (!prompt) return;

    els.statusBar.textContent = 'Görsel üretiliyor…';
    const file = fileEl.files?.[0];
    const result = file
      ? await generateImageFromImage({ prompt, inputImageUrl: URL.createObjectURL(file), modelId: store.getState().app.selectedModel || 'image-fast', testMode: true })
      : await generateImage({ prompt, modelId: store.getState().app.selectedModel || 'image-fast', testMode: true });

    if (!result.ok) {
      els.statusBar.textContent = `Hata: ${result.error?.code || 'BİLİNMEYEN'}`;
      return;
    }

    images = [{ imgUrl: result.imageUrl }, ...images].slice(0, 12);
    repaint();
    els.statusBar.textContent = 'Görsel hazır.';
  });

  repaint();
  section.append(card);
  return section;
}

export function destroy() {}
