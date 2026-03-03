import { cancelRemoteJob, fetchJobStatus, submitTxt2Vid } from '../../services/generation/videoService.js';

const VALID_VIDEO_STATUSES = new Set(['queued', 'running', 'succeeded', 'failed', 'canceled']);
const POLL_INTERVAL_MS = 3000; // NISAI.MD'de netleştir: interval stratejisi.
const MAX_RETRY_COUNT = 2; // NISAI.MD'de netleştir: retry limit politikası.

const pollingTimers = new Map();

function now() {
  return Date.now();
}

function makeId(prefix = 'video') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function clampProgress(value) {
  return Math.max(0, Math.min(100, Number(value || 0)));
}

function makeVideoError(code, message, details = null, retryable = false) {
  return { code, message, details, ts: now(), retryable };
}

function normalizeOptions(options = {}) {
  // NISAI.MD'de netleştir: seçeneklerin nihai listesi.
  return {
    duration: Math.max(1, Number(options.duration || 4)),
    aspectRatio: options.aspectRatio || '16:9',
    quality: options.quality || 'draft',
    seed: options.seed ?? null,
  };
}

function buildGallery(jobs) {
  return jobs
    .filter((job) => job.status === 'succeeded' && job.result)
    .map((job) => ({ id: job.id, ...job.result, updatedAt: job.updatedAt }));
}

export const initialVideoState = {
  // NISAI.MD gereksinim 1: job merkezli state.
  jobs: [],
  activeJobId: null,
  ui: {
    isSubmitting: false,
    isPolling: false,
    lastError: null,
    filters: {
      status: 'all',
      sort: 'newest-first',
      model: 'all',
    },
  },
  gallery: [],
  lastFailedPayloadByJobId: {}, // NISAI.MD'de netleştir: saklama kapsamı.
};

export const videoActions = {
  queueJob: (payload) => ({ type: 'video/queueJob', payload }),
  setSubmitting: (value) => ({ type: 'video/setSubmitting', payload: { value } }),
  setPolling: (value) => ({ type: 'video/setPolling', payload: { value } }),
  setActiveJob: (jobId) => ({ type: 'video/setActiveJob', payload: { jobId } }),
  updateJobFromPoll: (payload) => ({ type: 'video/updateJobFromPoll', payload }),
  setJobResult: (payload) => ({ type: 'video/setJobResult', payload }),
  setJobError: (payload) => ({ type: 'video/setJobError', payload }),
  setJobStatus: (payload) => ({ type: 'video/setJobStatus', payload }),
  setFilters: (payload) => ({ type: 'video/setFilters', payload }),
  setError: (payload) => ({ type: 'video/setError', payload }),
  setJobMeta: (payload) => ({ type: 'video/setJobMeta', payload }),
  clearError: () => ({ type: 'video/clearError' }),
  setLastFailedPayload: (payload) => ({ type: 'video/setLastFailedPayload', payload }),
};

function validateStatus(status) {
  return VALID_VIDEO_STATUSES.has(status);
}

export function videoReducer(state = initialVideoState, action) {
  switch (action.type) {
    case 'video/queueJob': {
      const job = action.payload;
      const nextJobs = [job, ...state.jobs];
      return {
        ...state,
        jobs: nextJobs,
        activeJobId: job.id,
      };
    }

    case 'video/setSubmitting':
      return { ...state, ui: { ...state.ui, isSubmitting: Boolean(action.payload.value) } };

    case 'video/setPolling':
      return { ...state, ui: { ...state.ui, isPolling: Boolean(action.payload.value) } };

    case 'video/setActiveJob':
      return { ...state, activeJobId: action.payload.jobId };

    case 'video/updateJobFromPoll': {
      const { jobId, status, progress, result } = action.payload;
      if (!validateStatus(status)) {
        return {
          ...state,
          ui: {
            ...state.ui,
            lastError: makeVideoError('VIDEO_INVALID_STATUS', 'Invalid video status received', { jobId, status }, true),
          },
        };
      }

      const nextJobs = state.jobs.map((job) => {
        if (job.id !== jobId) return job;
        const nextProgress = Math.max(job.progress || 0, clampProgress(progress));
        return {
          ...job,
          status,
          progress: nextProgress,
          result: result || job.result,
          updatedAt: now(),
        };
      });

      return {
        ...state,
        jobs: nextJobs,
        gallery: buildGallery(nextJobs),
      };
    }

    case 'video/setJobResult': {
      const { jobId, result } = action.payload;
      const nextJobs = state.jobs.map((job) => (job.id === jobId ? {
        ...job,
        status: 'succeeded',
        progress: 100,
        result,
        updatedAt: now(),
      } : job));

      return {
        ...state,
        jobs: nextJobs,
        gallery: buildGallery(nextJobs),
      };
    }

    case 'video/setJobStatus': {
      const { jobId, status } = action.payload;
      if (!validateStatus(status)) {
        return {
          ...state,
          ui: {
            ...state.ui,
            lastError: makeVideoError('VIDEO_INVALID_STATUS', 'Invalid status transition', { jobId, status }, false),
          },
        };
      }

      return {
        ...state,
        jobs: state.jobs.map((job) => (job.id === jobId ? { ...job, status, updatedAt: now() } : job)),
      };
    }

    case 'video/setJobError': {
      const { jobId, error } = action.payload;
      const nextJobs = state.jobs.map((job) => (job.id === jobId ? {
        ...job,
        status: 'failed',
        error,
        updatedAt: now(),
      } : job));
      return {
        ...state,
        jobs: nextJobs,
        ui: { ...state.ui, lastError: error },
      };
    }


    case 'video/setJobMeta': {
      const { jobId, meta } = action.payload;
      return {
        ...state,
        jobs: state.jobs.map((job) => (job.id === jobId ? { ...job, meta: { ...(job.meta || {}), ...meta } } : job)),
      };
    }

    case 'video/setFilters':
      return { ...state, ui: { ...state.ui, filters: { ...state.ui.filters, ...action.payload } } };

    case 'video/setError':
      return { ...state, ui: { ...state.ui, lastError: action.payload } };

    case 'video/clearError':
      return { ...state, ui: { ...state.ui, lastError: null } };

    case 'video/setLastFailedPayload': {
      const { jobId, payload } = action.payload;
      return {
        ...state,
        lastFailedPayloadByJobId: {
          ...state.lastFailedPayloadByJobId,
          [jobId]: payload,
        },
      };
    }

    default:
      return state;
  }
}

function findJob(state, jobId) {
  return state.video.jobs.find((job) => job.id === jobId) || null;
}

function resolveVideoModel(state, options = {}) {
  const appModel = state.app.selectedModel;
  const model = options.model || appModel || 'video-fast';
  if (!model.startsWith('video-')) {
    throw makeVideoError('VIDEO_MODEL_INVALID', 'Video model is incompatible', { model }, false);
  }
  return model;
}

function stopPolling(jobId) {
  const timer = pollingTimers.get(jobId);
  if (timer) {
    clearTimeout(timer);
    pollingTimers.delete(jobId);
  }
}

function schedulePoll(context, jobId) {
  const state = context.getState();
  if (state.app.lastRoute !== '/video') {
    // NISAI.MD gereksinim 18: video route dışına çıkınca poll cleanup.
    stopPolling(jobId);
    return;
  }

  stopPolling(jobId);
  const timer = setTimeout(() => {
    pollJob(context, jobId);
  }, POLL_INTERVAL_MS);
  pollingTimers.set(jobId, timer);
}

export async function submitVideo(context, { prompt, options = {} }) {
  const { dispatch, getState } = context;
  dispatch(videoActions.setSubmitting(true));
  dispatch(videoActions.clearError());

  try {
    const model = resolveVideoModel(getState(), options);
    const normalizedOptions = normalizeOptions({ ...options, model });

    const localJobId = makeId('local_video');
    dispatch(videoActions.queueJob({
      id: localJobId,
      prompt,
      model,
      status: 'queued',
      progress: 0,
      createdAt: now(),
      updatedAt: now(),
      result: null,
      error: null,
      meta: {
        estimatedCost: options.estimatedCost || '—',
        remoteJobId: null,
        retryCount: Number(options.retryCount || 0),
      },
    }));

    const remote = await submitTxt2Vid({ prompt, options: normalizedOptions });

    dispatch(videoActions.setJobStatus({ jobId: localJobId, status: remote.status || 'queued' }));
    dispatch(videoActions.setJobMeta({ jobId: localJobId, meta: { remoteJobId: remote.remoteJobId || localJobId } }));
    dispatch(videoActions.setLastFailedPayload({
      jobId: localJobId,
      payload: { prompt, options: normalizedOptions },
    }));
    // remote id eşlemesi için job meta güncellemesi.
    dispatch({
      type: 'video/updateJobFromPoll',
      payload: {
        jobId: localJobId,
        status: remote.status || 'queued',
        progress: 0,
        result: null,
      },
    });
    dispatch(videoActions.setPolling(true));

    schedulePoll({ dispatch, getState }, localJobId);

    return localJobId;
  } catch (error) {
    dispatch(videoActions.setError(error.code ? error : makeVideoError('VIDEO_SUBMIT_FAILED', error.message, error, true)));
    return null;
  } finally {
    dispatch(videoActions.setSubmitting(false));
  }
}

export async function pollJob(context, jobId) {
  const { dispatch, getState } = context;
  const state = getState();
  const job = findJob(state, jobId) || findJob(state, state.video.activeJobId);

  if (!job) {
    dispatch(videoActions.setError(makeVideoError('VIDEO_JOB_NOT_FOUND', 'Job not found for polling', { jobId }, false)));
    return;
  }

  dispatch(videoActions.setPolling(true));

  try {
    const remoteJobId = job.meta?.remoteJobId || job.id;
    const result = await fetchJobStatus(remoteJobId);
    dispatch(videoActions.updateJobFromPoll({
      jobId: job.id,
      status: result.status,
      progress: result.progress,
      result: result.result,
    }));

    if (result.status === 'succeeded') {
      dispatch(videoActions.setJobResult({ jobId: job.id, result: result.result }));
      stopPolling(jobId);
      dispatch(videoActions.setPolling(false));
      return;
    }

    if (result.status === 'failed' || result.status === 'canceled') {
      stopPolling(jobId);
      dispatch(videoActions.setPolling(false));
      return;
    }

    schedulePoll(context, jobId);
  } catch (error) {
    dispatch(videoActions.setJobError({
      jobId: job.id,
      error: makeVideoError(error.code || 'VIDEO_POLL_FAILED', error.message, error, true),
    }));
    stopPolling(jobId);
    dispatch(videoActions.setPolling(false));
  }
}

export async function retryVideo(context, jobId) {
  const { dispatch, getState } = context;
  const state = getState();
  const job = findJob(state, jobId);

  if (!job) {
    dispatch(videoActions.setError(makeVideoError('VIDEO_RETRY_NOT_FOUND', 'Retry target job was not found', { jobId }, false)));
    return null;
  }

  const retryCount = Number(job.meta?.retryCount || 0);
  if (retryCount >= MAX_RETRY_COUNT) {
    dispatch(videoActions.setError(makeVideoError('VIDEO_RETRY_LIMIT', 'Retry limit reached', { jobId, retryCount }, false)));
    return null;
  }

  dispatch(videoActions.setLastFailedPayload({
    jobId,
    payload: { prompt: job.prompt, options: { model: job.model } },
  }));

  return submitVideo(context, {
    prompt: job.prompt,
    options: {
      model: job.model,
      estimatedCost: job.meta?.estimatedCost,
      retryCount: retryCount + 1,
    },
  });
}

export async function cancelJob(context, jobId) {
  const { dispatch, getState } = context;
  const state = getState();
  const job = findJob(state, jobId);

  if (!job) {
    dispatch(videoActions.setError(makeVideoError('VIDEO_CANCEL_NOT_FOUND', 'Cancel target was not found', { jobId }, false)));
    return;
  }

  if (!['queued', 'running'].includes(job.status)) {
    dispatch(videoActions.setError(makeVideoError('VIDEO_CANCEL_INVALID_STATE', 'Cancel is only allowed for queued/running jobs', { jobId, status: job.status }, false)));
    return;
  }

  await cancelRemoteJob(job.id);
  dispatch(videoActions.setJobStatus({ jobId: job.id, status: 'canceled' }));
  stopPolling(job.id);
  dispatch(videoActions.setPolling(false));
}

export function stopAllVideoPolling() {
  [...pollingTimers.keys()].forEach(stopPolling);
}

export const selectJobs = (state) => state.video.jobs;
export const selectJobById = (state, jobId) => state.video.jobs.find((job) => job.id === jobId) || null;
export const selectActiveJob = (state) => selectJobById(state, state.video.activeJobId);
export const selectVideoBusy = (state) => state.video.ui.isSubmitting || state.video.ui.isPolling;
export const selectVideoErrors = (state) => state.video.ui.lastError;
export const selectGallery = (state) => state.video.gallery;
