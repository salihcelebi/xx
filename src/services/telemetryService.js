// Gereksinim B21: tek log fonksiyonu.
// NISAI.MD'de netleştir: telemetry hedef sistemi (sentry, endpoint vb.)
export function logEvent(type, payload = {}) {
  console.info('[telemetry]', type, payload);
}
