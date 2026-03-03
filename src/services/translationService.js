import { DEFAULT_LANGUAGE, dictionaries, SUPPORTED_STATIC_LANGUAGES } from '../config/i18n.js';

// Gereksinim MULTILANG: memory + localStorage cache.
const memoryCache = new Map();
const CACHE_KEY = 'nisai.translation.cache.v1';

function loadPersistedCache() {
  const raw = localStorage.getItem(CACHE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    Object.entries(parsed).forEach(([k, v]) => memoryCache.set(k, v));
  } catch {
    // Hata yönetimi: bozuk cache sessizce sıfırlanır.
  }
}

function persistCache() {
  const obj = Object.fromEntries(memoryCache.entries());
  localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
}

loadPersistedCache();

export function getInitialLanguage() {
  return localStorage.getItem('nisai.lang') || DEFAULT_LANGUAGE;
}

export function setLanguage(lang) {
  localStorage.setItem('nisai.lang', lang);
}

export async function translateText(key, lang) {
  // Gereksinim: TR/EN API çağrısı olmadan doğrudan sözlükten gelsin.
  if (SUPPORTED_STATIC_LANGUAGES.includes(lang)) {
    return dictionaries[lang]?.[key] ?? dictionaries.tr[key] ?? key;
  }

  const cacheKey = `${lang}:${key}`;
  if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey);

  // Gereksinim: diğer diller auto translate + fallback.
  try {
    // NISAI.MD'de netleştir: kullanılacak çeviri sağlayıcısı/endpoint detayları.
    const translated = `[${lang}] ${dictionaries.tr[key] ?? key}`;
    memoryCache.set(cacheKey, translated);
    persistCache();
    return translated;
  } catch {
    return dictionaries.tr[key] ?? key;
  }
}
