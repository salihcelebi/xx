import { fetchMonthlyUsage, microcentsToUsd } from '../../services/usageService.js';
import { getInitialLanguage, setLanguage, translateText } from '../../services/translationService.js';

export const state = {
  route: '/chat',
  mode: 'chat',
  language: getInitialLanguage(),
  busy: false,
  usage: { remaining: '-', appTotals: '-', diff: '-' },
  user: { isAdmin: false },
};

export async function refreshUsage() {
  const usage = await fetchMonthlyUsage();
  state.usage.remaining = microcentsToUsd(usage.remainingMicrocents);
  state.usage.appTotals = microcentsToUsd(usage.appTotalsMicrocents);
}

export async function setAppLanguage(language) {
  state.language = language;
  setLanguage(language);
  state.translatedEmpty = await translateText('empty', language);
}
