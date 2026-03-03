// Aylık kullanım ve maliyet özetini üretir.
// microcents: 1 USD = 100,000,000 microcents.

const USD_PER_MICROCENT = 1 / 100_000_000;
const DEFAULT_TTL_MS = 60_000;
const DEFAULT_TIMEOUT_MS = 20_000;

let baselineSnapshot = null;
let cache = { snapshot: null, fetchedAt: 0 };

function now() {
  return Date.now();
}

function withTimeout(promise, timeoutMs = DEFAULT_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'TIMEOUT' })), timeoutMs);
    promise.then((v) => {
      clearTimeout(timer);
      resolve(v);
    }).catch((e) => {
      clearTimeout(timer);
      reject(e);
    });
  });
}

function getPuterUsageGetter() {
  if (typeof puter === 'undefined') return null;
  if (puter?.usage?.getMonthlyUsage) return () => puter.usage.getMonthlyUsage();
  if (puter?.objects?.monthlyUsage?.get) return () => puter.objects.monthlyUsage.get();
  // NISAI.MD'de netleştir: kesin SDK yöntemi.
  return null;
}

function makeUsageError(code, retryable, details = null) {
  return {
    code,
    messageKey: `usage.error.${code.toLowerCase()}`,
    retryable,
    ts: now(),
    details,
  };
}

export function microcentsToUsdNumber(microcents = 0) {
  return Number(microcents || 0) * USD_PER_MICROCENT;
}

export function microcentsToUsdText(microcents = 0) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(microcentsToUsdNumber(microcents));
}

// FX yoksa TL gösterimi "₺—" olur; bu bilinçli davranıştır.
export function microcentsToTlText(microcents = 0, fxTry = null) {
  if (typeof fxTry !== 'number' || Number.isNaN(fxTry)) return '₺—';
  const tlAmount = microcentsToUsdNumber(microcents) * fxTry;
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(tlAmount);
}

export function formatTlUsdPair(microcents = 0, fxTry = null) {
  const tl = microcentsToTlText(microcents, fxTry);
  const usd = microcentsToUsdText(microcents);
  return { tl, usd, text: `${tl} / ${usd}` };
}

export function normalizeUsage(raw) {
  const totalMicrocents = Number(raw?.totalMicrocents ?? raw?.appTotalsMicrocents ?? raw?.total ?? NaN);
  if (Number.isNaN(totalMicrocents)) {
    throw makeUsageError('MISSING_FIELD', false, { field: 'totalMicrocents' });
  }

  const byModel = Array.isArray(raw?.byModel) ? raw.byModel.map((item) => ({
    model: item.model || item.modelId || 'unknown',
    microcents: Number(item.microcents || 0),
  })) : [];

  const byDay = Array.isArray(raw?.byDay) ? raw.byDay.map((item) => ({
    dateISO: item.dateISO || item.date || null,
    microcents: Number(item.microcents || 0),
  })) : [];

  return { totalMicrocents, byModel, byDay, ts: now(), remainingMicrocents: Number(raw?.remainingMicrocents || 0) };
}

export async function fetchMonthlyUsage({ signedIn = true, forceRefresh = false, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  if (!signedIn) {
    return { ok: false, error: makeUsageError('AUTH_REQUIRED', false) };
  }

  const currentTs = now();
  if (!forceRefresh && cache.snapshot && (currentTs - cache.fetchedAt) < DEFAULT_TTL_MS) {
    return { ok: true, snapshot: cache.snapshot, fromCache: true };
  }

  const getter = getPuterUsageGetter();
  if (!getter) {
    return { ok: false, error: makeUsageError('NOT_SUPPORTED', false, { reason: 'PUTER_USAGE_API_UNAVAILABLE' }) };
  }

  try {
    const raw = await withTimeout(Promise.resolve(getter()), timeoutMs);
    const snapshot = normalizeUsage(raw);
    cache = { snapshot, fetchedAt: currentTs };
    return { ok: true, snapshot, fromCache: false };
  } catch (error) {
    const msg = String(error?.message || '').toLowerCase();
    if (error?.code === 'TIMEOUT') return { ok: false, error: makeUsageError('TIMEOUT', true) };
    if (msg.includes('rate')) return { ok: false, error: makeUsageError('RATE_LIMIT', true, error) };
    if (msg.includes('network') || msg.includes('fetch')) return { ok: false, error: makeUsageError('NETWORK', true, error) };
    if (error?.code === 'MISSING_FIELD') return { ok: false, error };
    return { ok: false, error: makeUsageError('UNKNOWN', true, error) };
  }
}

// Diff hesabı: baseline yoksa null döner, 0 dönmez.
export function beginBaseline(snapshot) {
  baselineSnapshot = snapshot ? { ...snapshot } : null;
  return baselineSnapshot;
}

export function computeDiff(currentSnapshot) {
  if (!baselineSnapshot || !currentSnapshot) {
    return { microcentsDelta: null, baselineTs: baselineSnapshot?.ts || null, sinceTs: now() };
  }

  return {
    microcentsDelta: Math.max(0, Number(currentSnapshot.totalMicrocents || 0) - Number(baselineSnapshot.totalMicrocents || 0)),
    baselineTs: baselineSnapshot.ts || null,
    sinceTs: currentSnapshot.ts || now(),
  };
}

export function buildUsageCards(snapshot, diff, limits = {}, fxTry = null) {
  const total = formatTlUsdPair(snapshot?.totalMicrocents || 0, fxTry);
  const remaining = formatTlUsdPair(snapshot?.remainingMicrocents || 0, fxTry);
  const delta = formatTlUsdPair(diff?.microcentsDelta || 0, fxTry);

  const limitPair = limits?.monthlyCapMicrocents
    ? formatTlUsdPair(limits.monthlyCapMicrocents, fxTry)
    : { text: '₺— / $—' };

  return [
    { id: 'kalan', titleKey: 'usage.card.remaining', valueText: remaining.text, level: 'info', iconKey: 'wallet' },
    { id: 'bu_ay_toplam', titleKey: 'usage.card.total', valueText: total.text, level: 'info', iconKey: 'chart' },
    { id: 'fark', titleKey: 'usage.card.diff', valueText: diff?.microcentsDelta === null ? '₺— / $—' : delta.text, level: 'info', iconKey: 'delta' },
    { id: 'limit', titleKey: 'usage.card.limit', valueText: limitPair.text, level: limits?.hardStop ? 'danger' : 'info', iconKey: 'limit' },
  ];
}

export function buildByModelBreakdown(snapshot, fxTry = null) {
  if (!Array.isArray(snapshot?.byModel)) return [];
  const total = Number(snapshot.totalMicrocents || 0);

  return snapshot.byModel.map((row) => ({
    modelId: row.model,
    costTextCombined: formatTlUsdPair(row.microcents, fxTry).text,
    sharePct: total > 0 ? Number(((row.microcents / total) * 100).toFixed(2)) : 0,
  }));
}

export function buildDailySeries(snapshot, fxTry = null) {
  if (!Array.isArray(snapshot?.byDay)) return [];
  return snapshot.byDay.map((row) => ({
    dateISO: row.dateISO,
    microcents: row.microcents,
    costTextCombined: formatTlUsdPair(row.microcents, fxTry).text,
  }));
}

export function computeMicrocentsDiff(baseline = 0, current = 0) {
  return Math.max(0, Number(current || 0) - Number(baseline || 0));
}
