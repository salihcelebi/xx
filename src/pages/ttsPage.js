import { synthesizeSpeech } from '../services/generation/ttsService.js';
import { renderAudioPlayer } from '../ui/components/AudioPlayer.js';

let audioSrc = '';

export async function render({ els, store }) {
  const section = document.createElement('section');
  section.className = 'content-grid';

  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    <h2>Ses Üretimi (TTS)</h2>
    <textarea id="tts-text" placeholder="Seslendirilecek metin"></textarea>
    <div style="display:flex; gap:8px; margin-top:8px;">
      <select id="tts-engine">
        <option value="standard">standard</option>
        <option value="neural">neural</option>
      </select>
      <button id="tts-generate" type="button">Oluştur</button>
    </div>
    <div id="tts-output" style="margin-top:10px;"></div>
  `;

  const output = card.querySelector('#tts-output');
  const renderOutput = () => {
    output.innerHTML = '';
    if (audioSrc) output.append(renderAudioPlayer(audioSrc));
  };

  card.querySelector('#tts-generate').addEventListener('click', async () => {
    const text = card.querySelector('#tts-text').value.trim();
    if (!text) return;
    els.statusBar.textContent = 'Ses üretiliyor…';

    const result = await synthesizeSpeech({
      text,
      modelId: store.getState().app.selectedModel || 'tts-standard',
      options: { engine: card.querySelector('#tts-engine').value },
      testMode: true,
    });

    if (!result.ok) {
      els.statusBar.textContent = `Hata: ${result.error?.code || 'BİLİNMEYEN'}`;
      return;
    }

    audioSrc = result.audioEl?.src || 'about:blank';
    renderOutput();
    els.statusBar.textContent = 'Ses hazır.';
  });

  renderOutput();
  section.append(card);
  return section;
}

export function destroy() {
  audioSrc = '';
}
