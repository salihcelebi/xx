import { renderAudioPlayer } from '../ui/components/AudioPlayer.js';
import { dubSpeech } from '../services/generation/dubbingService.js';

let audioSrc = '';

export async function render({ els, store }) {
  const section = document.createElement('section');
  section.className = 'content-grid';
  section.innerHTML = `
    <article class="card">
      <h2>Dublaj (Speech2Speech)</h2>
      <input id="dub-file" type="file" accept="audio/*" />
      <div style="display:flex; gap:8px; margin-top:8px;">
        <input id="dub-voice" placeholder="voice id" />
        <button id="dub-run" type="button">Dönüştür</button>
      </div>
      <div id="dub-output" style="margin-top:10px;"></div>
    </article>
  `;

  const output = section.querySelector('#dub-output');
  const repaint = () => {
    output.innerHTML = '';
    if (audioSrc) output.append(renderAudioPlayer(audioSrc));
  };

  section.querySelector('#dub-run').addEventListener('click', async () => {
    const file = section.querySelector('#dub-file').files?.[0];
    if (!file) return;

    els.statusBar.textContent = 'Dublaj işleniyor…';
    const result = await dubSpeech({
      file,
      options: { voice: section.querySelector('#dub-voice').value, model: store.getState().app.selectedModel || 'dubbing-base' },
      testMode: true,
    });

    if (!result.ok) {
      els.statusBar.textContent = `Hata: ${result.error?.code || 'BİLİNMEYEN'}`;
      return;
    }

    audioSrc = result.audioEl?.src || 'about:blank';
    repaint();
    els.statusBar.textContent = 'Dublaj hazır.';
  });

  repaint();
  return section;
}

export function destroy() {
  audioSrc = '';
}
