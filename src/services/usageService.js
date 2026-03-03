// Gereksinim B6/B8: CreditsIndicator için monthly usage snapshot + diff hesaplama burada tutulur.
// NISAI.MD'de netleştir: gerçek monthly usage alan adları.

let beforeSnapshot = null;

export async function fetchMonthlyUsage() {
  // NISAI.MD'de netleştir: puter.MonthlyUsage çağrısı ve appTotals alanları.
  return {
    remainingMicrocents: 85000000,
    appTotalsMicrocents: 15000000,
    lastUpdatedAt: Date.now(),
  };
}

export function beginDiff(usage) {
  beforeSnapshot = usage;
}

export function computeDiff(afterUsage) {
  if (!beforeSnapshot) return 0;
  return Math.max(0, afterUsage.appTotalsMicrocents - beforeSnapshot.appTotalsMicrocents);
}

export function microcentsToUsd(value) {
  return `$${(value / 100_000_000).toFixed(2)}`;
}
