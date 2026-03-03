// Aylık kullanım ve maliyet özetini üretir.
// microcents, USD'nin çok küçük birimidir: 1 USD = 100,000,000 microcents.

const USD_PER_MICROCENT = 1 / 100_000_000;
const CACHE_TTL_MS = 60_000;
const DEFAULT_TIMEOUT_MS = 20_000;

let usageCache = { snapshot: null, fetchedAt: 0 };
let baselineSnapshot = null;

function now() {
  return Date.now();
}

function makeUsageError(code, retryable, details = null) {
  return {
    code,
    messageKey: `usage.error.${String(code).toLowerCase()}`,
    retryable,
    ts: now(),
    details,
  };
}

function withTimeout(promise, timeoutMs = DEFAULT_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'TIMEOUT' })), timeoutMs);
    promise.then((value) => {
      clearTimeout(timer);
      resolve(value);
    }).catch((error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

function getPuterUsageApi() {
  if (typeof puter === 'undefined') return null;
  if (typeof puter?.usage?.getMonthlyUsage === 'function') return () => puter.usage.getMonthlyUsage();
  if (typeof puter?.ai?.getMonthlyUsage === 'function') return () => puter.ai.getMonthlyUsage();
  return null;
}

export function microcentsToUsdNumber(microcents = 0) {
  return Number(microcents || 0) * USD_PER_MICROCENT;
}

export function microcentsToUsdText(microcents = 0) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(microcentsToUsdNumber(microcents));
}

// FX bilgisi yoksa TL karşılığı bilinemez; bu nedenle "₺—" döndürülür.
export function microcentsToTlText(microcents = 0, fxTry = null) {
  if (typeof fxTry !== 'number' || Number.isNaN(fxTry) || fxTry <= 0) return '₺—';
  const tlValue = microcentsToUsdNumber(microcents) * fxTry;
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(tlValue);
}

export function formatTlUsdPair(microcents = 0, fxTry = null) {
  const tlText = microcentsToTlText(microcents, fxTry);
  const usdText = microcentsToUsdText(microcents);
  const combinedText = `${tlText} / ${usdText}`;
  return {
    tlText,
    usdText,
    combinedText,
    tl: tlText,
    usd: usdText,
    text: combinedText,
  };
}

export function normalizeUsage(raw) {
  const totalMicrocents = Number(raw?.totalMicrocents ?? raw?.appTotalsMicrocents ?? NaN);
  if (Number.isNaN(totalMicrocents)) {
    throw makeUsageError('MISSING_FIELD', false, { field: 'totalMicrocents' });
  }

  const byModel = Array.isArray(raw?.byModel)
    ? raw.byModel.map((item) => ({
      model: item.model || item.modelId || 'unknown',
      microcents: Number(item.microcents || 0),
    }))
    : [];

  const byDay = Array.isArray(raw?.byDay)
    ? raw.byDay.map((item) => ({
      dateISO: item.dateISO || item.date || null,
      microcents: Number(item.microcents || 0),
    }))
    : [];

  return {
    totalMicrocents,
    byModel,
    byDay,
    ts: now(),
  };
}

export async function fetchMonthlyUsage({ signedIn = true, forceRefresh = false, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  if (!signedIn) return { ok: false, error: makeUsageError('AUTH_REQUIRED', false) };

  const currentTs = now();
  if (!forceRefresh && usageCache.snapshot && (currentTs - usageCache.fetchedAt) < CACHE_TTL_MS) {
    return { ok: true, snapshot: usageCache.snapshot, fromCache: true };
  }

  const getUsage = getPuterUsageApi();
  if (!getUsage) {
    return { ok: false, error: makeUsageError('UNKNOWN', false, { reason: 'PUTER_USAGE_API_UNAVAILABLE' }) };
  }

  try {
    const raw = await withTimeout(Promise.resolve(getUsage()), timeoutMs);
    const snapshot = normalizeUsage(raw);
    usageCache = { snapshot, fetchedAt: currentTs };
    return { ok: true, snapshot, fromCache: false };
  } catch (error) {
    const message = String(error?.message || '').toLowerCase();
    if (error?.code === 'TIMEOUT') return { ok: false, error: makeUsageError('TIMEOUT', true) };
    if (message.includes('rate')) return { ok: false, error: makeUsageError('RATE_LIMIT', true, error) };
    if (message.includes('network') || message.includes('fetch')) return { ok: false, error: makeUsageError('NETWORK', true, error) };
    if (error?.code === 'MISSING_FIELD') return { ok: false, error };
    return { ok: false, error: makeUsageError('UNKNOWN', true, error) };
  }
}

// Diff hesabı: current.totalMicrocents - baseline.totalMicrocents.
// Baseline yoksa yanlış 0 üretmemek için null döndürülür.
export function beginBaseline(snapshot) {
  baselineSnapshot = snapshot ? { ...snapshot } : null;
  return baselineSnapshot;
}

export function computeDiff(currentSnapshot) {
  if (!baselineSnapshot || !currentSnapshot) {
    return {
      microcentsDelta: null,
      baselineTs: baselineSnapshot?.ts || null,
      sinceTs: now(),
    };
  }

  return {
    microcentsDelta: Number(currentSnapshot.totalMicrocents || 0) - Number(baselineSnapshot.totalMicrocents || 0),
    baselineTs: baselineSnapshot.ts || null,
    sinceTs: currentSnapshot.ts || now(),
  };
}

export function buildUsageCards(snapshot, diff, limits = {}, fxTry = null) {
  const totalPair = formatTlUsdPair(snapshot?.totalMicrocents || 0, fxTry);
  const deltaPair = diff?.microcentsDelta === null
    ? { combinedText: '₺— / $—' }
    : formatTlUsdPair(diff?.microcentsDelta || 0, fxTry);

  const limitKnown = typeof limits?.monthlyCapMicrocents === 'number';
  const limitPair = limitKnown ? formatTlUsdPair(limits.monthlyCapMicrocents, fxTry) : { combinedText: '₺— / $—' };
  const remainingMicrocents = limitKnown ? (limits.monthlyCapMicrocents - Number(snapshot?.totalMicrocents || 0)) : null;
  const remainingPair = remainingMicrocents === null ? { combinedText: '₺— / $—' } : formatTlUsdPair(remainingMicrocents, fxTry);

  const planCode = limitKnown ? null : 'PLAN_UNKNOWN';
  const usageLevel = limitKnown && remainingMicrocents < 0 ? 'danger' : (limitKnown && remainingMicrocents < limits.monthlyCapMicrocents * 0.1 ? 'warn' : 'info');

  return [
    { id: 'kalan', titleKey: 'usage.card.remaining', valueText: remainingPair.combinedText, level: usageLevel, iconKey: 'wallet', code: planCode },
    { id: 'bu_ay_toplam', titleKey: 'usage.card.total', valueText: totalPair.combinedText, level: 'info', iconKey: 'chart' },
    { id: 'fark', titleKey: 'usage.card.diff', valueText: deltaPair.combinedText, level: diff?.microcentsDelta > 0 ? 'warn' : 'info', iconKey: 'delta' },
    { id: 'limit', titleKey: 'usage.card.limit', valueText: limitPair.combinedText, subValueText: planCode, level: limitKnown ? 'info' : 'warn', iconKey: 'limit', code: planCode },
  ];
}

export function buildByModelBreakdown(snapshot, fxTry = null) {
  if (!Array.isArray(snapshot?.byModel) || snapshot.byModel.length === 0) return [];
  const total = Number(snapshot.totalMicrocents || 0);

  return snapshot.byModel.map((row) => ({
    modelId: row.model,
    costTextCombined: formatTlUsdPair(row.microcents, fxTry).combinedText,
    sharePct: total > 0 ? Number(((Number(row.microcents || 0) / total) * 100).toFixed(2)) : 0,
  }));
}

export function buildDailySeries(snapshot, fxTry = null) {
  if (!Array.isArray(snapshot?.byDay) || snapshot.byDay.length === 0) return [];
  return snapshot.byDay.map((row) => ({
    dateISO: row.dateISO,
    microcents: Number(row.microcents || 0),
    costTextCombined: formatTlUsdPair(row.microcents, fxTry).combinedText,
  }));
}


export function computeMicrocentsDiff(baseline = 0, current = 0) {
  return Number(current || 0) - Number(baseline || 0);
}
