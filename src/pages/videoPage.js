import { renderVideoJobCard } from '../ui/components/VideoJobCard.js';
import { renderVideoGallery } from '../ui/components/VideoGallery.js';
import {
  submitVideo,
  cancelJob,
  retryVideo,
  selectJobs,
  selectGallery,
} from '../store/slices/videoSlice.js';

let cleanupFns = [];

function renderJobs(slot, jobs, { onCancel, onRetry }) {
  slot.innerHTML = '';
  jobs.forEach((job) => {
    const card = document.createElement('div');
    card.append(renderVideoJobCard(job));

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '8px';

    if (['queued', 'running'].includes(job.status)) {
      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.textContent = 'İptal';
      cancelBtn.addEventListener('click', () => onCancel(job.id));
      actions.append(cancelBtn);
    }

    if (job.status === 'failed') {
      const retryBtn = document.createElement('button');
      retryBtn.type = 'button';
      retryBtn.textContent = 'Tekrar Dene';
      retryBtn.addEventListener('click', () => onRetry(job.id));
      actions.append(retryBtn);
    }

    card.append(actions);
    slot.append(card);
  });
}

export async function render({ store }) {
  const wrapper = document.createElement('section');
  wrapper.className = 'content-grid';

  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    <h2>Video Üretimi</h2>
    <textarea id="video-prompt" placeholder="Bir prompt yaz ve Üret'e bas."></textarea>
    <div style="display:flex; gap:8px; margin-top:8px;">
      <button id="video-generate" type="button">Üret</button>
      <small id="video-cost">Tahmini maliyet: ₺—</small>
    </div>
    <div id="video-current" style="display:grid; gap:10px; margin-top:10px;"></div>
    <div id="video-gallery" style="margin-top:10px;"></div>
  `;

  const promptEl = card.querySelector('#video-prompt');
  const currentEl = card.querySelector('#video-current');
  const galleryEl = card.querySelector('#video-gallery');

  const rerender = () => {
    const state = store.getState();
    renderJobs(currentEl, selectJobs(state), {
      onCancel: async (jobId) => {
        await cancelJob({ dispatch: store.dispatch, getState: store.getState }, jobId);
        rerender();
      },
      onRetry: async (jobId) => {
        await retryVideo({ dispatch: store.dispatch, getState: store.getState }, jobId);
        rerender();
      },
    });

    galleryEl.innerHTML = '';
    galleryEl.append(renderVideoGallery(selectGallery(state)));
  };

  card.querySelector('#video-generate').addEventListener('click', async () => {
    const prompt = promptEl.value.trim();
    if (!prompt) return;
    await submitVideo({ dispatch: store.dispatch, getState: store.getState }, {
      prompt,
      options: { duration: 4, quality: 'draft', estimatedCost: '₺—' },
    });
    rerender();
  });

  rerender();

  const unsubscribe = store.subscribe(rerender);
  cleanupFns = [unsubscribe];

  wrapper.append(card);
  return wrapper;
}

export function destroy() {
  cleanupFns.forEach((fn) => fn?.());
  cleanupFns = [];
}
