// Gereksinim MULTILANG: TR varsayılan, EN ikinci dil; sözlükler doğrudan hardcoded tutulur.
export const DEFAULT_LANGUAGE = 'tr';

export const SUPPORTED_STATIC_LANGUAGES = ['tr', 'en'];

export const dictionaries = {
  tr: {
    appTitle: 'Nisai Studio',
    empty: 'Henüz içerik yok.',
    translationFailed: 'Çeviri alınamadı',
    queueIdle: 'Kuyruk beklemede.',
    estimate: 'Tahmini maliyet',
  },
  en: {
    appTitle: 'Nisai Studio',
    empty: 'No content yet.',
    translationFailed: 'Translation could not be fetched',
    queueIdle: 'Queue is idle.',
    estimate: 'Estimated cost',
  },
};
