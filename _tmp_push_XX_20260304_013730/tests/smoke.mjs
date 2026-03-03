import assert from 'node:assert/strict';
import { microcentsToUsd, computeDiff, beginDiff } from '../src/services/usageService.js';
import { DEFAULT_ROUTE, normalizeRoute, isValidRoute, getCurrentRoute } from '../src/router.js';
import { createStore, rootReducer, selectLanguage, selectMode } from '../src/store/store.js';
import { chatActions, chatReducer, initialChatState, selectChatBusy } from '../src/store/slices/chatSlice.js';
import { videoActions, videoReducer, initialVideoState, selectGallery } from '../src/store/slices/videoSlice.js';
import {
  billingActions,
  billingReducer,
  initialBillingState,
  ODEME_KANALLARI_TR,
  ODEME_KANALLARI_GLOBAL,
  selectPaymentProviders,
} from '../src/store/slices/billingSlice.js';
import { adminActions, adminReducer, initialAdminState, selectAdminActiveTab, selectAdminForbidden } from '../src/store/slices/adminSlice.js';
import { beginBaseline, computeDiff as computeUsageDiff, microcentsToTlText } from '../src/services/puterUsage.js';

import { createVideoJob, getJobSnapshot } from '../src/services/generation/videoService.js';
import { synthesizeSpeech } from '../src/services/generation/ttsService.js';
import { generateImage } from '../src/services/generation/imageService.js';

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
  billing: initialBillingState,
  admin: initialAdminState,
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

// billing reducer minimum scenarios
let billingState = billingReducer(initialBillingState, billingActions.beginDiff({ baselineMicrocents: 1000, baselineTs: 1 }));
assert.equal(billingState.diff.baselineMicrocents, 1000);
billingState = billingReducer(billingState, billingActions.setMonthlyUsage({ totalMicrocents: 2500, remainingMicrocents: 500 }));
billingState = billingReducer(billingState, billingActions.setDiff({ microcentsDelta: 1500, sinceTs: 2, remainingMicrocents: 500 }));
assert.equal(billingState.diff.microcentsDelta, 1500);
assert.ok(billingState.amounts.diffTLText.includes('₺'));
assert.ok(billingState.amounts.diffUSDText.includes('$'));
billingState = billingReducer(billingState, billingActions.addAlert({ level: 'warn', code: 'BILLING_WARN' }));
billingState = billingReducer(billingState, billingActions.addAlert({ level: 'warn', code: 'BILLING_WARN' }));
assert.equal(billingState.alerts.length, 1);
const providers = selectPaymentProviders({ billing: billingState });
assert.deepEqual(providers.tr, ODEME_KANALLARI_TR);
assert.deepEqual(providers.global, ODEME_KANALLARI_GLOBAL);

// admin reducer minimum scenarios
let adminState = adminReducer(initialAdminState, adminActions.checkAccess({ isAdmin: false }));
assert.equal(selectAdminForbidden({ admin: adminState }), true);
adminState = adminReducer(adminState, adminActions.setModelCatalog({ items: [{ id: 'm1' }], lastFetchedAt: 5 }));
assert.equal(adminState.modelCatalog.items.length, 1);
adminState = adminReducer(adminState, adminActions.setLoadingFlags({ modelsLoading: true }));
adminState = adminReducer(adminState, adminActions.setError({ code: 'ADMIN_ERR' }));
assert.equal(adminState.ui.lastError.code, 'ADMIN_ERR');
adminState = adminReducer(adminState, adminActions.setActiveTab({ tab: 'Ayarlar' }));
assert.equal(selectAdminActiveTab({ admin: adminState }), 'Ayarlar');


// puterUsage minimum scenarios
beginBaseline(null);
assert.equal(computeUsageDiff({ totalMicrocents: 10 }).microcentsDelta, null);
assert.equal(microcentsToTlText(1000, null), '₺—');



// generation service minimum scenarios
const createdVideo = createVideoJob({ prompt: 'test', modelId: 'video-fast', options: { duration: 4 }, testMode: true });
assert.equal(createdVideo.ok, true);
assert.equal(getJobSnapshot({ jobId: createdVideo.job.id }).status, 'queued');

const tts = await synthesizeSpeech({ text: 'Merhaba', options: { engine: 'standard' }, testMode: true });
assert.equal(tts.ok, true);
assert.ok(tts.meta.requestType === 'tts');

const image = await generateImage({ prompt: 'dağ manzarası', modelId: 'image-fast', testMode: true });
assert.equal(image.ok, true);
assert.ok(image.meta.requestType === 'image');

console.log('smoke tests passed');
