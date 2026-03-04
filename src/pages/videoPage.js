import { renderVideoJobCard } from '../ui/components/VideoJobCard.js';
import { renderVideoGallery } from '../ui/components/VideoGallery.js';
import { createVideoJob, runVideoJob } from '../services/generation/videoService.js';

let activeAbortController = null;

export async function render({ store }) {
  const wrapper = document.createElement('section');
  wrapper.className = 'content-grid';

  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    <h2>Video Üretimi</h2>
    <textarea id="video-prompt" placeholder="Bir prompt yaz ve Üret'e bas."></textarea>
    <button id="video-generate">Üret</button>
    <div id="video-current"></div>
  `;

  card.querySelector('#video-generate').addEventListener('click', async () => {
    const prompt = card.querySelector('#video-prompt').value;
    const created = createVideoJob({ prompt, modelId: 'video-fast', testMode: true });
    if (!created.ok) return;

    activeAbortController = new AbortController();
    await runVideoJob({
      jobId: created.job.id,
      signal: activeAbortController.signal,
      onProgress: (job) => {
        const slot = card.querySelector('#video-current');
        slot.innerHTML = '';
        slot.append(renderVideoJobCard(job));
      },
    });
  });

  const gallery = renderVideoGallery(store.getState().video.gallery || []);
  wrapper.append(card, gallery);
  return wrapper.outerHTML;
}

export function destroy() {
  activeAbortController?.abort?.();
}
