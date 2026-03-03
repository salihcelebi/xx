import assert from 'node:assert/strict';
import { microcentsToUsd, computeDiff, beginDiff } from '../src/services/usageService.js';
import { DEFAULT_ROUTE, normalizeRoute, isValidRoute, getCurrentRoute } from '../src/router.js';
import { createStore, rootReducer, selectLanguage, selectMode } from '../src/store/store.js';

assert.equal(microcentsToUsd(100_000_000), '$1.00');
beginDiff({ appTotalsMicrocents: 10 });
assert.equal(computeDiff({ appTotalsMicrocents: 25 }), 15);

assert.equal(normalizeRoute('#/video'), '/video');
assert.equal(normalizeRoute('chat'), '/chat');
assert.equal(isValidRoute('/admin'), true);
assert.equal(isValidRoute('/assets'), false);
assert.equal(getCurrentRoute('#/unknown'), DEFAULT_ROUTE);

const preloaded = {
  app: { mode: 'chat', language: 'tr', userRole: 'user', featureFlags: { testMode: false }, lastRoute: '/chat', busy: { routeLoading: false, usagePolling: false }, lastError: null, uiPrefs: {} },
  chat: { threads: [], activeThreadId: null, messages: [], streaming: { isStreaming: false }, errors: null },
  video: { jobs: [], progress: {}, gallery: [], retryFlags: {}, errors: null },
  billing: { monthlyUsage: null, remaining: '-', appTotals: '-', diff: '-', plan: { name: 'free', paywallOpen: false }, alerts: [], errors: null },
  admin: { modelCatalogSnapshot: null, usageMonitoringSnapshot: null, settings: {}, errors: null },
};

const store = createStore(preloaded);
let called = 0;
const unsubscribe = store.subscribe(() => {
  called += 1;
});
store.dispatch({ type: 'app/setLanguage', payload: 'en' });
assert.equal(selectLanguage(store.getState()), 'en');
store.dispatch({ type: 'app/setMode', payload: 'video' });
assert.equal(selectMode(store.getState()), 'video');
assert.equal(called, 2);
unsubscribe();

const sameState = rootReducer(store.getState(), { type: 'unknown/action' });
assert.equal(sameState, store.getState());

console.log('smoke tests passed');
