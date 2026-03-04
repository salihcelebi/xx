import { isAdminLoggedIn } from '../config/admin.js';

// Global guard katmanı: log buffer, fetch timeout+retry, offline queue, circuit breaker.
const defaultOptions = {
  overlayRequiresAdmin: true,
  isAdmin: () => isAdminLoggedIn,
  fetchTimeoutMs: 12_000,
  fetchRetryCount: 1,
  circuitBreakerThreshold: 3,
  circuitBreakerCooldownMs: 15_000,
  watchdogEnabled: false,
};

const state = {
  logBuffer: [],
  offlineQueue: [],
  consecutiveFetchFailures: 0,
  circuitOpenUntil: 0,
  originalFetch: null,
};

function now() {
  return Date.now();
}

function pushLog(kind, details = {}) {
  state.logBuffer.push({ kind, details, ts: now() });
  if (state.logBuffer.length > 200) state.logBuffer.shift();
}

function createOverlay(options) {
  const existing = document.getElementById('guard-overlay');
  if (existing) existing.remove();

  if (options.overlayRequiresAdmin && !options.isAdmin()) return;

  const overlay = document.createElement('div');
  overlay.id = 'guard-overlay';
  overlay.style.cssText = 'position:fixed;left:12px;bottom:12px;background:#111;color:#fff;border:1px solid #333;border-radius:10px;padding:8px 10px;font-size:12px;z-index:9997;opacity:.9;';
  overlay.textContent = 'Guard: aktif';
  document.body.appendChild(overlay);
}

function withTimeout(promise, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'TIMEOUT' })), timeoutMs);
    promise.then((value) => {
      clearTimeout(timer);
      resolve(value);
    }).catch((error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

function isCircuitOpen() {
  return state.circuitOpenUntil > now();
}

function openCircuit(options) {
  state.circuitOpenUntil = now() + options.circuitBreakerCooldownMs;
  pushLog('circuit.open', { until: state.circuitOpenUntil });
}

function closeCircuit() {
  state.circuitOpenUntil = 0;
  state.consecutiveFetchFailures = 0;
  pushLog('circuit.close');
}

function enqueueOfflineRequest(input, init) {
  state.offlineQueue.push({ input, init, ts: now() });
  if (state.offlineQueue.length > 100) state.offlineQueue.shift();
  pushLog('offline.queue.add', { size: state.offlineQueue.length });
}

function installFetchGuard(options) {
  if (typeof window === 'undefined' || typeof window.fetch !== 'function') return;
  if (state.originalFetch) return;

  state.originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init = {}) => {
    if (isCircuitOpen()) {
      pushLog('fetch.blocked.circuit');
      throw Object.assign(new Error('circuit-open'), { code: 'CIRCUIT_OPEN' });
    }

    if (!navigator.onLine) {
      enqueueOfflineRequest(input, init);
      throw Object.assign(new Error('offline'), { code: 'OFFLINE' });
    }

    const retries = Number(options.fetchRetryCount || 0);
    let attempt = 0;
    while (attempt <= retries) {
      try {
        const response = await withTimeout(state.originalFetch(input, init), options.fetchTimeoutMs);
        closeCircuit();
        pushLog('fetch.ok', { url: String(input) });
        return response;
      } catch (error) {
        attempt += 1;
        state.consecutiveFetchFailures += 1;
        pushLog('fetch.fail', { attempt, code: error?.code || 'UNKNOWN', url: String(input) });
        if (state.consecutiveFetchFailures >= options.circuitBreakerThreshold) openCircuit(options);
        if (attempt > retries) throw error;
      }
    }

    throw Object.assign(new Error('fetch-failed'), { code: 'FETCH_FAILED' });
  };
}

function installNetworkGuards() {
  window.addEventListener('online', () => {
    pushLog('network.online', { queued: state.offlineQueue.length });
    state.offlineQueue.length = 0;
    closeCircuit();
  });

  window.addEventListener('offline', () => {
    pushLog('network.offline');
  });
}

function installWatchdogIfEnabled(options) {
  if (!options.watchdogEnabled) return;
  setInterval(() => {
    pushLog('watchdog.tick', {
      logSize: state.logBuffer.length,
      queueSize: state.offlineQueue.length,
      circuitOpen: isCircuitOpen(),
    });
  }, 10_000);
}

export function installGlobalGuardsV2(customOptions = {}) {
  const options = { ...defaultOptions, ...customOptions };
  createOverlay(options);
  installFetchGuard(options);
  installNetworkGuards();
  installWatchdogIfEnabled(options);
  pushLog('guard.installed', {
    overlayRequiresAdmin: options.overlayRequiresAdmin,
    watchdogEnabled: options.watchdogEnabled,
  });

  return {
    getLogBuffer: () => [...state.logBuffer],
    getOfflineQueue: () => [...state.offlineQueue],
  };
}
