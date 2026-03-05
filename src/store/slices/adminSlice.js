import { fetchModelCatalog } from '../../services/modelCatalog.js';

const ADMIN_TABS = Object.freeze(['Modeller', 'Kullanım', 'Ayarlar']);
const MODEL_CATALOG_TTL_MS = 5 * 60 * 1000; // NISAI.MD'de netleştir: TTL değeri.

function now() {
  return Date.now();
}

function makeError(code, details = null) {
  return { code, details, ts: now() };
}

export const initialAdminState = {
  // NISAI.MD gereksinim 1: minimal admin state şeması.
  access: {
    isAdmin: false,
    checkedAt: null,
    forbiddenReasonCode: null,
  },
  settings: {
    defaultLanguage: 'tr',
    featureFlags: null,
    limits: null,
  },
  modelCatalog: {
    items: [],
    lastFetchedAt: null,
    lastError: null,
  },
  usageMonitoring: {
    snapshot: null,
    filters: { period: '30d' },
    lastFetchedAt: null,
    lastError: null,
  },
  ui: {
    isLoading: false,
    modelsLoading: false,
    usageLoading: false,
    settingsLoading: false,
    activeTab: 'Modeller',
    lastError: null,
  },
  logs: [],
};

export const adminActions = {
  checkAccess: (payload) => ({ type: 'admin/checkAccess', payload }),
  setForbidden: (payload) => ({ type: 'admin/setForbidden', payload }),
  setActiveTab: (payload) => ({ type: 'admin/setActiveTab', payload }),
  setSettings: (payload) => ({ type: 'admin/setSettings', payload }),
  setModelCatalog: (payload) => ({ type: 'admin/setModelCatalog', payload }),
  setModelCatalogError: (payload) => ({ type: 'admin/setModelCatalogError', payload }),
  setUsageMonitoring: (payload) => ({ type: 'admin/setUsageMonitoring', payload }),
  setUsageMonitoringError: (payload) => ({ type: 'admin/setUsageMonitoringError', payload }),
  setLoadingFlags: (payload) => ({ type: 'admin/setLoadingFlags', payload }),
  setError: (payload) => ({ type: 'admin/setError', payload }),
  clearError: () => ({ type: 'admin/clearError' }),
  addLog: (payload) => ({ type: 'admin/addLog', payload }),
  clearLogs: () => ({ type: 'admin/clearLogs' }),
};

export function adminReducer(state = initialAdminState, action) {
  switch (action.type) {
    // NISAI.MD gereksinim 2: role kontrolü.
    case 'admin/checkAccess': {
      const isAdmin = Boolean(action.payload?.isAdmin);
      return {
        ...state,
        access: {
          isAdmin,
          checkedAt: now(),
          forbiddenReasonCode: isAdmin ? null : 'ADMIN_FORBIDDEN',
        },
      };
    }

    case 'admin/setForbidden':
      return {
        ...state,
        access: {
          isAdmin: false,
          checkedAt: now(),
          forbiddenReasonCode: action.payload?.reasonCode || 'ADMIN_FORBIDDEN',
        },
      };

    // NISAI.MD gereksinim 7: aktif tab.
    case 'admin/setActiveTab': {
      const nextTab = action.payload?.tab;
      if (!ADMIN_TABS.includes(nextTab)) return state;
      return { ...state, ui: { ...state.ui, activeTab: nextTab } };
    }

    case 'admin/setSettings':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case 'admin/setModelCatalog':
      return {
        ...state,
        modelCatalog: {
          items: action.payload?.items || [],
          lastFetchedAt: action.payload?.lastFetchedAt || now(),
          lastError: null,
        },
      };

    case 'admin/setModelCatalogError':
      return {
        ...state,
        modelCatalog: {
          ...state.modelCatalog,
          lastError: action.payload,
        },
      };

    case 'admin/setUsageMonitoring':
      return {
        ...state,
        usageMonitoring: {
          ...state.usageMonitoring,
          snapshot: action.payload?.snapshot || null,
          lastFetchedAt: action.payload?.lastFetchedAt || now(),
          lastError: null,
        },
      };

    case 'admin/setUsageMonitoringError':
      return {
        ...state,
        usageMonitoring: {
          ...state.usageMonitoring,
          lastError: action.payload,
        },
      };

    case 'admin/setLoadingFlags': {
      const nextUi = { ...state.ui, ...action.payload };
      nextUi.isLoading = Boolean(nextUi.modelsLoading || nextUi.usageLoading || nextUi.settingsLoading);
      return { ...state, ui: nextUi };
    }

    case 'admin/setError':
      return { ...state, ui: { ...state.ui, lastError: action.payload } };

    case 'admin/clearError':
      return { ...state, ui: { ...state.ui, lastError: null } };


    case 'admin/addLog': {
      const nextItem = {
        level: action.payload?.level || 'info',
        code: action.payload?.code || 'ADMIN_LOG',
        message: action.payload?.message || '',
        details: action.payload?.details || null,
        ts: action.payload?.ts || now(),
      };
      const logs = [...(state.logs || []), nextItem];
      if (logs.length > 200) logs.shift();
      return { ...state, logs };
    }

    case 'admin/clearLogs':
      return { ...state, logs: [] };

    default:
      return state;
  }
}

export async function checkAdminAccessEffect({ dispatch, getState }) {
  // NISAI.MD'de netleştir: role kaynağı app slice mı auth service mi?
  const role = getState().app.userRole;
  dispatch(adminActions.checkAccess({ isAdmin: role === 'admin' }));
}

export async function fetchModelCatalogEffect({ dispatch, getState }, { force = false } = {}) {
  const state = getState();
  const lastFetchedAt = state.admin.modelCatalog.lastFetchedAt;
  if (!force && lastFetchedAt && (now() - lastFetchedAt) < MODEL_CATALOG_TTL_MS) {
    return state.admin.modelCatalog.items;
  }

  dispatch(adminActions.setLoadingFlags({ modelsLoading: true }));

  try {
    const response = await fetchModelCatalog();
    dispatch(adminActions.setModelCatalog({
      items: response.items || [],
      lastFetchedAt: response.fetchedAt || now(),
    }));
    return response.items || [];
  } catch (error) {
    const payload = makeError(error.code || 'ADMIN_MODEL_CATALOG_FAILED', error.message || error);
    dispatch(adminActions.setModelCatalogError(payload));
    dispatch(adminActions.setError(payload));
    return [];
  } finally {
    dispatch(adminActions.setLoadingFlags({ modelsLoading: false }));
  }
}

export async function fetchUsageMonitoringEffect({ dispatch }) {
  // NISAI.MD'de netleştir: puterUsage usage monitoring gerçek endpoint/stub kapsamı.
  dispatch(adminActions.setLoadingFlags({ usageLoading: true }));

  try {
    const snapshot = { total: 0, trend: [] };
    dispatch(adminActions.setUsageMonitoring({ snapshot, lastFetchedAt: now() }));
    return snapshot;
  } catch (error) {
    const payload = makeError(error.code || 'ADMIN_USAGE_MONITORING_FAILED', error.message || error);
    dispatch(adminActions.setUsageMonitoringError(payload));
    dispatch(adminActions.setError(payload));
    return null;
  } finally {
    dispatch(adminActions.setLoadingFlags({ usageLoading: false }));
  }
}

export const selectIsAdmin = (state) => state.admin.access.isAdmin;
export const selectAdminForbidden = (state) => Boolean(state.admin.access.forbiddenReasonCode);
export const selectModelCatalogItems = (state) => state.admin.modelCatalog.items;
export const selectModelCatalogStatus = (state) => ({
  lastFetchedAt: state.admin.modelCatalog.lastFetchedAt,
  lastError: state.admin.modelCatalog.lastError,
  loading: state.admin.ui.modelsLoading,
});
export const selectAdminUsageSnapshot = (state) => state.admin.usageMonitoring.snapshot;
export const selectAdminBusy = (state) => state.admin.ui.isLoading;
export const selectAdminActiveTab = (state) => state.admin.ui.activeTab;

// TODO (NISAI.MD'de netleştir):
// - admin olmayan kullanıcıda redirect mi, sadece forbidden panel mi?
// - model catalog cache TTL kesin değeri.
// - usage monitoring veri modeli ve service contract.

export const selectAdminLogs = (state) => state.admin.logs || [];
