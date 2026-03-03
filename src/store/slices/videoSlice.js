// NISAI.MD gereksinim: video state, jobs/progress/gallery/errors/retry tutar.
export const initialVideoState = {
  jobs: [],
  progress: {},
  gallery: [],
  retryFlags: {},
  errors: null,
};

export function videoReducer(state = initialVideoState, action) {
  switch (action.type) {
    case 'video/setJobs':
      return { ...state, jobs: action.payload };
    case 'video/jobProgress':
      return { ...state, progress: { ...state.progress, [action.payload.jobId]: action.payload.status } };
    case 'video/setGallery':
      return { ...state, gallery: action.payload };
    case 'video/setRetryFlag':
      return { ...state, retryFlags: { ...state.retryFlags, [action.payload.jobId]: action.payload.value } };
    case 'video/setError':
      return { ...state, errors: action.payload };
    default:
      return state;
  }
}
