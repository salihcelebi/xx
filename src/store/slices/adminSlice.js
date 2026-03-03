// NISAI.MD gereksinim: admin state model catalog + usage monitor + settings snapshot tutar.
export const initialAdminState = {
  modelCatalogSnapshot: null,
  usageMonitoringSnapshot: null,
  settings: {},
  errors: null,
};

export function adminReducer(state = initialAdminState, action) {
  switch (action.type) {
    case 'admin/setModelCatalogSnapshot':
      return { ...state, modelCatalogSnapshot: action.payload };
    case 'admin/setUsageMonitoringSnapshot':
      return { ...state, usageMonitoringSnapshot: action.payload };
    case 'admin/setSettings':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'admin/setError':
      return { ...state, errors: action.payload };
    default:
      return state;
  }
}
