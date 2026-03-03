import { state } from './slices/appSlice.js';

const listeners = new Set();

export function getState() {
  return state;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function dispatch(mutator) {
  // Gereksinim 1: UI yalnız dispatch/select yapar, servis çağrısını slice/fonksiyonlar yönetir.
  mutator(state);
  listeners.forEach((listener) => listener(state));
}
