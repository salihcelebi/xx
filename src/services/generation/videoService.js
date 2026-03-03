// NISAI.MD'de netleştir: txt2vid servis endpoint sözleşmesi, polling interval ve cancel davranışı.

const jobStore = new Map();

function createJobId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `job_${Date.now()}`;
}

export async function submitTxt2Vid({ prompt, options }) {
  const id = createJobId();
  jobStore.set(id, {
    id,
    prompt,
    options,
    status: 'queued',
    progress: 0,
    result: null,
    error: null,
  });

  return { remoteJobId: id, status: 'queued' };
}

export async function fetchJobStatus(jobId) {
  const job = jobStore.get(jobId);
  if (!job) {
    throw Object.assign(new Error('Job not found'), { code: 'VIDEO_NOT_FOUND' });
  }

  if (job.status === 'queued') {
    job.status = 'running';
    job.progress = 15;
  } else if (job.status === 'running') {
    job.progress = Math.min(100, job.progress + 30);
    if (job.progress >= 100) {
      job.status = 'succeeded';
      job.result = {
        videoUrl: `https://example.invalid/video/${job.id}.mp4`,
        posterUrl: `https://example.invalid/video/${job.id}.jpg`,
        duration: job.options?.duration || 4,
        size: '720p',
        meta: { provider: 'demo' },
      };
    }
  }

  return { ...job };
}

export async function cancelRemoteJob(jobId) {
  const job = jobStore.get(jobId);
  if (!job) return { canceled: false };
  job.status = 'canceled';
  return { canceled: true };
}
