import { DEFAULT_LANGUAGE } from '../../config/i18n.js';
import { setLanguage as setLanguagePreferenceInService, getInitialLanguage } from '../../services/translationService.js';
import { fetchMonthlyUsage, microcentsToUsd } from '../../services/usageService.js';

// NISAI.MD gereksinim: app slice yalnız app alanını yönetir.
export const initialAppState = {
  mode: 'chat',
  language: DEFAULT_LANGUAGE,
  userRole: 'user',
  featureFlags: { testMode: false },
  lastRoute: '/chat',
  busy: { routeLoading: false, usagePolling: false },
  lastError: null,
  selectedModel: null,
};

export function appReducer(state = initialAppState, action) {
  switch (action.type) {
    case 'app/setLanguage':
      return { ...state, language: action.payload };
    case 'app/setMode':
      return { ...state, mode: action.payload };
    case 'app/setRoute':
      return { ...state, lastRoute: action.payload };
    case 'app/setUserRole':
      return { ...state, userRole: action.payload };
    case 'app/setFeatureFlags':
      return { ...state, featureFlags: { ...state.featureFlags, ...action.payload } };
    case 'app/setBusy':
      return { ...state, busy: { ...state.busy, ...action.payload } };
    case 'app/setLastError':
      return { ...state, lastError: action.payload };
    case 'app/setSelectedModel':
      return { ...state, selectedModel: action.payload || null };
    default:
      return state;
  }
}

export const appActions = {
  setLanguage: (language) => ({ type: 'app/setLanguage', payload: language }),
  setMode: (mode) => ({ type: 'app/setMode', payload: mode }),
  setRoute: (route) => ({ type: 'app/setRoute', payload: route }),
  setBusy: (busyPatch) => ({ type: 'app/setBusy', payload: busyPatch }),
  setLastError: (error) => ({ type: 'app/setLastError', payload: error }),
  setSelectedModel: (modelId) => ({ type: 'app/setSelectedModel', payload: modelId }),
};

// NISAI.MD gereksinim: async süreç slice/service tarafında, UI doğrudan service çağırmaz.
export async function setAppLanguage(dispatch, language) {
  setLanguagePreferenceInService(language);
  dispatch(appActions.setLanguage(language));
}

export function hydrateAppPreferences(dispatch, configLanguage = DEFAULT_LANGUAGE) {
  const initialLanguage = getInitialLanguage() || configLanguage;
  dispatch(appActions.setLanguage(initialLanguage));
}

export async function refreshUsage(dispatch) {
  const usage = await fetchMonthlyUsage();
  dispatch({
    type: 'billing/setUsage',
    payload: {
      monthlyUsage: usage,
      remaining: microcentsToUsd(usage.remainingMicrocents),
      appTotals: microcentsToUsd(usage.appTotalsMicrocents),
    },
  });
}
