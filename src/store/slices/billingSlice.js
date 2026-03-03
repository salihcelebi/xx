// NISAI.MD gereksinim: billing state monthlyUsage/remaining/diff/plan/paywall/alerts tutar.
export const initialBillingState = {
  monthlyUsage: null,
  remaining: '-',
  appTotals: '-',
  diff: '-',
  plan: { name: 'free', paywallOpen: false },
  alerts: [],
  errors: null,
};

export function billingReducer(state = initialBillingState, action) {
  switch (action.type) {
    case 'billing/setUsage':
      return {
        ...state,
        monthlyUsage: action.payload.monthlyUsage,
        remaining: action.payload.remaining,
        appTotals: action.payload.appTotals,
      };
    case 'billing/setDiff':
      return { ...state, diff: action.payload };
    case 'billing/setPaywallOpen':
      return { ...state, plan: { ...state.plan, paywallOpen: action.payload } };
    case 'billing/setAlerts':
      return { ...state, alerts: action.payload };
    case 'billing/setError':
      return { ...state, errors: action.payload };
    default:
      return state;
  }
}
