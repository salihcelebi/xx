import assert from 'node:assert/strict';
import { microcentsToUsd, computeDiff, beginDiff } from '../src/services/usageService.js';
import { DEFAULT_ROUTE, normalizeRoute, isValidRoute, getCurrentRoute } from '../src/router.js';
import { createStore, rootReducer, selectLanguage, selectMode } from '../src/store/store.js';
import { chatActions, chatReducer, initialChatState, selectChatBusy } from '../src/store/slices/chatSlice.js';
import { videoActions, videoReducer, initialVideoState, selectGallery } from '../src/store/slices/videoSlice.js';

assert.equal(microcentsToUsd(100_000_000), '$1.00');
beginDiff({ appTotalsMicrocents: 10 });
assert.equal(computeDiff({ appTotalsMicrocents: 25 }), 15);

assert.equal(normalizeRoute('#/video'), '/video');
assert.equal(normalizeRoute('chat'), '/chat');
assert.equal(isValidRoute('/admin'), true);
assert.equal(isValidRoute('/assets'), false);
assert.equal(getCurrentRoute('#/unknown'), DEFAULT_ROUTE);

const preloaded = {
  app: {
    mode: 'chat', language: 'tr', userRole: 'user', featureFlags: { testMode: false }, lastRoute: '/chat', busy: { routeLoading: false, usagePolling: false }, lastError: null, uiPrefs: {},
  },
  chat: initialChatState,
  video: initialVideoState,
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

// chat reducer minimum scenarios
let chatState = chatReducer(initialChatState, chatActions.newThread({ id: 't1', title: 'Thread 1' }));
assert.equal(chatState.activeThreadId, 't1');
chatState = chatReducer(chatState, chatActions.addMessage({ threadId: 't1', message: { id: 'm1', role: 'user', content: 'hi' } }));
assert.equal(chatState.messagesByThread.t1.length, 1);
chatState = chatReducer(chatState, chatActions.startStream({ requestId: 'r1' }));
chatState = chatReducer(chatState, chatActions.appendStreamChunk({ chunk: 'hello ' }));
assert.equal(chatState.ui.streamBuffer, 'hello ');
chatState = chatReducer(chatState, chatActions.finishStream({ threadId: 't1', content: 'hello world' }));
assert.equal(chatState.messagesByThread.t1.at(-1).role, 'assistant');
assert.equal(selectChatBusy({ chat: chatState }), false);

// video reducer minimum scenarios
let videoState = videoReducer(initialVideoState, videoActions.queueJob({
  id: 'j1', prompt: 'p', model: 'video-fast', status: 'queued', progress: 0, createdAt: 1, updatedAt: 1, result: null, error: null, meta: {},
}));
assert.equal(videoState.jobs.length, 1);
videoState = videoReducer(videoState, videoActions.updateJobFromPoll({ jobId: 'j1', status: 'running', progress: 120 }));
assert.equal(videoState.jobs[0].progress, 100);
videoState = videoReducer(videoState, videoActions.setJobResult({ jobId: 'j1', result: { videoUrl: 'x' } }));
assert.equal(selectGallery({ video: videoState }).length, 1);
videoState = videoReducer(videoState, videoActions.setJobError({ jobId: 'j1', error: { code: 'E', retryable: true } }));
assert.equal(videoState.jobs[0].status, 'failed');

console.log('smoke tests passed');
