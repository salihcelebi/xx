import { computeMicrocentsDiff, formatTlUsdPair } from '../../services/puterUsage.js';

// NISAI.MD gereksinim: ödeme kanalları sabit liste olarak tutulur.
export const ODEME_KANALLARI_TR = Object.freeze(['iyzico', 'paytr', 'param', 'shopier']);
export const ODEME_KANALLARI_GLOBAL = Object.freeze(['paypal', 'stripe']);

const ALERT_DEDUPE_WINDOW_MS = 30_000;

function ts() {
  return Date.now();
}

function makeAlertId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `alert_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function formatAmounts(totalMicrocents = 0, remainingMicrocents = 0, diffMicrocents = 0) {
  const total = formatTlUsdPair(totalMicrocents);
  const remaining = formatTlUsdPair(remainingMicrocents);
  const diff = formatTlUsdPair(diffMicrocents);

  return {
    totalTLText: total.tl,
    totalUSDText: total.usd,
    remainingTLText: remaining.tl,
    remainingUSDText: remaining.usd,
    diffTLText: diff.tl,
    diffUSDText: diff.usd,
    totalText: total.text,
    remainingText: remaining.text,
    diffText: diff.text,
  };
}

export const initialBillingState = {
  // NISAI.MD gereksinim 1: sade ama tam state şeması.
  monthlyUsage: {
    totalMicrocents: 0,
    byModel: null,
    byDay: null,
    empty: true,
    updatedAt: null,
    receivedAt: null,
  },
  amounts: formatAmounts(0, 0, 0),
  diff: {
    microcentsDelta: 0,
    sinceTs: null,
    baselineTs: null,
  },
  limits: {
    monthlyCapMicrocents: null,
    warnAtPct: null,
    hardStop: false,
    uretimKapali: false,
  },
  alerts: [],
  plan: {
    tier: 'free',
    isPro: false,
    renewAt: null,
  },
  paywall: {
    isOpen: false,
    reasonCode: null,
    requiredTier: null,
  },
  ui: {
    isLoadingUsage: false,
    isLoadingPlan: false,
    lastError: null,
    lastRequestType: null,
  },
  preferences: {
    seciliOdemeKanali: null,
    sonGorulenUyariId: null,
  },
  providersTR: ODEME_KANALLARI_TR,
  providersGlobal: ODEME_KANALLARI_GLOBAL,
};

export const billingActions = {
  setMonthlyUsage: (payload) => ({ type: 'billing/setMonthlyUsage', payload }),
  beginDiff: (payload) => ({ type: 'billing/beginDiff', payload }),
  setDiff: (payload) => ({ type: 'billing/setDiff', payload }),
  setLimits: (payload) => ({ type: 'billing/setLimits', payload }),
  addAlert: (payload) => ({ type: 'billing/addAlert', payload }),
  removeAlert: (payload) => ({ type: 'billing/removeAlert', payload }),
  clearAlerts: () => ({ type: 'billing/clearAlerts' }),
  setPlan: (payload) => ({ type: 'billing/setPlan', payload }),
  openPaywall: (payload) => ({ type: 'billing/openPaywall', payload }),
  closePaywall: () => ({ type: 'billing/closePaywall' }),
  setLoading: (payload) => ({ type: 'billing/setLoading', payload }),
  setError: (payload) => ({ type: 'billing/setError', payload }),
  clearError: () => ({ type: 'billing/clearError' }),
  setPreference: (payload) => ({ type: 'billing/setPreference', payload }),
};

function maybeGenerateLimitAlerts(state, next) {
  const cap = next.limits.monthlyCapMicrocents;
  const warnAtPct = next.limits.warnAtPct;
  if (!cap || !warnAtPct) return next;

  const usage = Number(next.monthlyUsage.totalMicrocents || 0);
  const ratio = (usage / cap) * 100;
  if (ratio >= warnAtPct) {
    return billingReducer(next, billingActions.addAlert({ level: 'warn', code: 'BILLING_LIMIT_WARNING', meta: { ratio } }));
  }

  return next;
}

export function billingReducer(state = initialBillingState, action) {
  switch (action.type) {
    // NISAI.MD gereksinim 4: snapshot güncelleme.
    case 'billing/setMonthlyUsage': {
      const usage = action.payload || {};
      const totalMicrocents = Number(usage.totalMicrocents ?? usage.appTotalsMicrocents ?? 0);
      const remainingMicrocents = Number(usage.remainingMicrocents ?? 0);
      const next = {
        ...state,
        monthlyUsage: {
          totalMicrocents,
          byModel: usage.byModel || null,
          byDay: usage.byDay || null,
          empty: !totalMicrocents,
          updatedAt: usage.updatedAt || null,
          receivedAt: ts(),
        },
        amounts: formatAmounts(totalMicrocents, remainingMicrocents, state.diff.microcentsDelta),
      };
      return maybeGenerateLimitAlerts(state, next);
    }

    // NISAI.MD gereksinim 5: baseline akışı.
    case 'billing/beginDiff': {
      const baselineMicrocents = Number(action.payload?.baselineMicrocents ?? state.monthlyUsage.totalMicrocents ?? 0);
      return {
        ...state,
        diff: {
          ...state.diff,
          microcentsDelta: 0,
          baselineTs: action.payload?.baselineTs || ts(),
          sinceTs: action.payload?.baselineTs || ts(),
          baselineMicrocents,
        },
      };
    }

    case 'billing/setDiff': {
      const nextDelta = typeof action.payload === 'object'
        ? Number(action.payload.microcentsDelta ?? 0)
        : Number(action.payloadMicrocents ?? 0);

      // app.js eski akışta metin gönderebilir; geriye dönük uyum.
      if (typeof action.payload === 'string') {
        return {
          ...state,
          amounts: {
            ...state.amounts,
            diffText: action.payload,
            diffTLText: action.payload,
            diffUSDText: action.payload,
          },
        };
      }

      const currentTotal = Number(state.monthlyUsage.totalMicrocents || 0);
      const currentRemaining = Number(action.payload?.remainingMicrocents ?? 0);

      return {
        ...state,
        diff: {
          ...state.diff,
          microcentsDelta: nextDelta,
          sinceTs: action.payload?.sinceTs || ts(),
        },
        amounts: formatAmounts(currentTotal, currentRemaining, nextDelta),
      };
    }

    case 'billing/setLimits':
      return {
        ...state,
        limits: {
          ...state.limits,
          ...action.payload,
          uretimKapali: Boolean(action.payload?.hardStop && state.monthlyUsage.totalMicrocents >= (action.payload?.monthlyCapMicrocents || Infinity)),
        },
      };

    // NISAI.MD gereksinim 8: alert dedupe.
    case 'billing/addAlert': {
      const incoming = action.payload || {};
      const nowTs = ts();
      const duplicate = state.alerts.find((alert) => alert.code === incoming.code && (nowTs - alert.ts) < ALERT_DEDUPE_WINDOW_MS);
      if (duplicate) return state;

      return {
        ...state,
        alerts: [
          {
            id: incoming.id || makeAlertId(),
            level: incoming.level || 'info',
            code: incoming.code || 'BILLING_GENERIC',
            ts: nowTs,
            meta: incoming.meta || {},
          },
          ...state.alerts,
        ],
      };
    }

    case 'billing/removeAlert':
      return { ...state, alerts: state.alerts.filter((alert) => alert.id !== action.payload?.id) };

    case 'billing/clearAlerts':
      return { ...state, alerts: [] };

    // NISAI.MD gereksinim 9: plan + paywall.
    case 'billing/setPlan':
      return { ...state, plan: { ...state.plan, ...action.payload } };

    case 'billing/openPaywall':
      return {
        ...state,
        paywall: {
          isOpen: true,
          reasonCode: action.payload?.reasonCode || null,
          requiredTier: action.payload?.requiredTier || null,
        },
      };

    case 'billing/closePaywall':
      return { ...state, paywall: { isOpen: false, reasonCode: null, requiredTier: null } };

    // Geriye dönük uyum: önceki appSlice action'ı.
    case 'billing/setUsage': {
      const usage = action.payload || {};
      const totalMicrocents = Number(usage.monthlyUsage?.appTotalsMicrocents ?? 0);
      const remainingMicrocents = Number(usage.monthlyUsage?.remainingMicrocents ?? 0);
      return {
        ...state,
        monthlyUsage: {
          ...state.monthlyUsage,
          totalMicrocents,
          empty: !totalMicrocents,
          receivedAt: ts(),
        },
        amounts: formatAmounts(totalMicrocents, remainingMicrocents, state.diff.microcentsDelta),
      };
    }

    case 'billing/setLoading':
      return { ...state, ui: { ...state.ui, ...action.payload } };

    case 'billing/setError':
      return {
        ...state,
        ui: {
          ...state.ui,
          lastError: {
            code: action.payload?.code || 'BILLING_ERROR',
            details: action.payload?.details || null,
            ts: ts(),
          },
        },
      };

    case 'billing/clearError':
      return { ...state, ui: { ...state.ui, lastError: null } };

    case 'billing/setPreference':
      return { ...state, preferences: { ...state.preferences, ...action.payload } };

    default:
      return state;
  }
}

// NISAI.MD gereksinim 13: temel selector seti.
export const selectMonthlyUsageTotalMicrocents = (state) => state.billing.monthlyUsage.totalMicrocents;
export const selectAmountsTLUSD = (state) => ({
  toplam: `${state.billing.amounts.totalTLText} / ${state.billing.amounts.totalUSDText}`,
  kalan: `${state.billing.amounts.remainingTLText} / ${state.billing.amounts.remainingUSDText}`,
  fark: `${state.billing.amounts.diffTLText} / ${state.billing.amounts.diffUSDText}`,
});
export const selectDiffMicrocents = (state) => state.billing.diff.microcentsDelta;
export const selectDiffTextTLUSD = (state) => `${state.billing.amounts.diffTLText} / ${state.billing.amounts.diffUSDText}`;
export const selectBillingAlerts = (state) => state.billing.alerts;
export const selectPaywallState = (state) => state.billing.paywall;
export const selectPaymentProviders = (state) => ({ tr: state.billing.providersTR, global: state.billing.providersGlobal });

export function calculateDiffFromSnapshots(baselineMicrocents, currentMicrocents) {
  return computeMicrocentsDiff(baselineMicrocents, currentMicrocents);
}

// TODO (NISAI.MD'de netleştir):
// - Döviz kuru kaynağı canlı servise taşınacak mı?
// - hardStop + warnAtPct eşiklerinin kesin ürün kuralı.
// - Seçili ödeme kanalı persistence kapsamı.
