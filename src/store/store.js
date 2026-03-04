import { DEFAULT_LANGUAGE } from '../config/i18n.js';
import { appReducer, initialAppState } from './slices/appSlice.js';
import { chatReducer, initialChatState } from './slices/chatSlice.js';
import { videoReducer, initialVideoState } from './slices/videoSlice.js';
import { billingReducer, initialBillingState } from './slices/billingSlice.js';
import { adminReducer, initialAdminState } from './slices/adminSlice.js';

// NISAI.MD gereksinim: persistence sadece gerekli alanlarda ve version'lı anahtarla tutulur.
const PERSIST_VERSION = 'v1';

function getStorage() {
  if (typeof localStorage !== 'undefined') return localStorage;
  return {
    getItem: () => null,
    setItem: () => {},
  };
}

const PERSIST_KEYS = {
  language: `nisai:lang:${PERSIST_VERSION}`,
  lastRoute: `nisai:lastRoute:${PERSIST_VERSION}`,
  selectedModel: `nisai:selectedModel:${PERSIST_VERSION}`,
  uiPrefs: `nisai:uiPrefs:${PERSIST_VERSION}`,
};

function readPersistedState() {
  const storage = getStorage();
  return {
    language: storage.getItem(PERSIST_KEYS.language) || DEFAULT_LANGUAGE,
    lastRoute: storage.getItem(PERSIST_KEYS.lastRoute) || '/chat',
    uiPrefs: JSON.parse(storage.getItem(PERSIST_KEYS.uiPrefs) || '{}'),
    // NISAI.MD'de netleştir: selectedModel alanı hangi slice altında kalacak.
    selectedModel: storage.getItem(PERSIST_KEYS.selectedModel) || null,
  };
}

function persistState(state) {
  const storage = getStorage();
  storage.setItem(PERSIST_KEYS.language, state.app.language);
  storage.setItem(PERSIST_KEYS.lastRoute, state.app.lastRoute);
  storage.setItem(PERSIST_KEYS.uiPrefs, JSON.stringify(state.app.uiPrefs || {}));
}

function buildInitialState() {
  const persisted = readPersistedState();

  return {
    app: {
      ...initialAppState,
      language: persisted.language,
      lastRoute: persisted.lastRoute,
      // NISAI.MD'de netleştir: featureFlags kaynağı config dosyasında merkezlenebilir.
      featureFlags: { ...initialAppState.featureFlags, testMode: false },
      uiPrefs: persisted.uiPrefs,
    },
    chat: initialChatState,
    video: initialVideoState,
    billing: initialBillingState,
    admin: initialAdminState,
  };
}

// NISAI.MD gereksinim: combine reducer referans korumalı, değişmeyen slice aynı kalır.
export function rootReducer(state, action) {
  const nextApp = appReducer(state.app, action);
  const nextChat = chatReducer(state.chat, action);
  const nextVideo = videoReducer(state.video, action);
  const nextBilling = billingReducer(state.billing, action);
  const nextAdmin = adminReducer(state.admin, action);

  if (
    nextApp === state.app
    && nextChat === state.chat
    && nextVideo === state.video
    && nextBilling === state.billing
    && nextAdmin === state.admin
  ) {
    return state;
  }

  return {
    app: nextApp,
    chat: nextChat,
    video: nextVideo,
    billing: nextBilling,
    admin: nextAdmin,
  };
}

// NISAI.MD gereksinim: createStore + dispatch + getState + subscribe, sync dispatch.
export function createStore(preloadedState = buildInitialState()) {
  let state = preloadedState;
  const listeners = new Set();
  const actionHistory = [];

  function getState() {
    return state;
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function dispatch(action) {
    state = rootReducer(state, action);
    persistState(state);

    // NISAI.MD gereksinim: debug ring buffer opsiyonel.
    if (state.app.featureFlags.testMode) {
      actionHistory.push({ type: action.type, ts: Date.now() });
      if (actionHistory.length > 20) actionHistory.shift();
    }

    listeners.forEach((listener) => listener(state, action));
    return action;
  }

  return {
    dispatch,
    getState,
    subscribe,
    getDebugActions: () => [...actionHistory],
  };
}

// App.js tek girişten store kullanır.
export const store = createStore();
export const dispatch = store.dispatch;
export const getState = store.getState;
export const subscribe = store.subscribe;

// NISAI.MD gereksinim: minimal selector kümesi.
export const selectMode = (state) => state.app.mode;
export const selectLanguage = (state) => state.app.language;
export const selectCredits = (state) => ({
  remaining: state.billing.amounts?.remainingText || '-',
  appTotals: state.billing.amounts?.totalText || '-',
  diff: state.billing.amounts?.diffText || '-',
});
export const selectBusy = (state) => state.app.busy;
