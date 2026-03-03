/**
 * /src/utils/guard.js
 * Amaç: Uygulamayı kolay çökmeyecek hale getirmek + hataları merkezi yakalamak (TR log).
 * Admin-only görünürlük: Overlay yalnızca admin oturumunda açılır.
 *
 * V2 ekleri (bayraklı):
 * - enableOverlay (admin-only), enableLogBuffer, enableCircuitBreaker, enableWatchdog,
 * - enableFetchTimeout, enableFetchRetry, enableOfflineQueue
 *
 * Notlar:
 * - Syntax error (parse-time) yakalanamaz.
 * - OOM / tarayıcı crash gibi durumlar engellenemez.
 */

export function installGlobalGuardsV2({
  // Görünürlük / admin
  isDev = true,
  isAdmin = () => false,         // admin tespit fonksiyonu (örn: () => window.__USER?.role === 'admin')
  showOverlay = true,            // admin ise overlay
  overlayRequiresAdmin = true,   // overlay sadece admin

  // Davranış bayrakları
  enableLogBuffer = true,
  enableCircuitBreaker = true,
  enableWatchdog = false,        // default kapalı: UX riski düşük olsun
  enableFetchTimeout = true,
  enableFetchRetry = true,
  enableOfflineQueue = true,

  // Fetch ayarları
  fetchTimeoutMs = 15000,
  fetchRetryCount = 2,
  fetchRetryBaseDelayMs = 400,
  fetchRetryMaxDelayMs = 3000,

  // Circuit breaker ayarları
  breakerWindowMs = 30000,       // 30 sn
  breakerTripCount = 3,          // 3 hata -> trip
  breakerCooldownMs = 60000,     // 60 sn kapalı
  breakerStorageKey = 'nisai_guard_breakers',

  // Log buffer
  logBufferSize = 200,

  // Offline queue
  offlineQueueKey = 'nisai_offline_queue_v1',
  offlineQueueMax = 100,

  // Telemetry callback (admin görünür değil, arka planda rapor)
  onError,                       // (payload) => void
  onStateChange,                 // (state) => void  safeMode/featureDisabled vb.

  // Opsiyonel: feature kapatma/etkileme hook’u
  onFeatureDisabled,             // (featureKey, info) => void
} = {}) {
  const state = {
    lastErrorAt: 0,
    overlayEl: null,
    logBuffer: [],
    breakers: loadBreakers(),
    // safeMode gibi global modlar eklenebilir:
    safeMode: false,
  };

  const now = () => Date.now();
  const adminOk = () => (typeof isAdmin === 'function' ? !!isAdmin() : !!isAdmin);

  // ---------- utils ----------
  function safeSerializeError(err) {
    if (err instanceof Error) {
      return { name: err.name || 'Error', message: err.message || String(err), stack: err.stack || '' };
    }
    // object / string / number vb.
    try {
      const msg = typeof err === 'string' ? err : JSON.stringify(err);
      const e = new Error(msg);
      return { name: e.name || 'Error', message: e.message || String(err), stack: e.stack || '' };
    } catch (_) {
      const e = new Error(String(err));
      return { name: e.name || 'Error', message: e.message || String(err), stack: e.stack || '' };
    }
  }

  function safeStringify(v) {
    try {
      if (typeof v === 'string') return v;
      return JSON.stringify(v);
    } catch (_) {
      return String(v);
    }
  }

  function buildPayload(kind, err, extra = {}) {
    const base = safeSerializeError(err);
    const payload = {
      kind,
      ts: new Date().toISOString(),
      ...base,
      ...extra,
    };

    // log buffer ekle (admin-only içerik değil; telemetry’de de işe yarar)
    if (enableLogBuffer && state.logBuffer.length) {
      payload.logTail = state.logBuffer.slice(-50); // payload şişmesin
    }

    // environment context (hafif)
    payload.ctx = {
      href: typeof location !== 'undefined' ? location.href : '',
      ua: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      online: typeof navigator !== 'undefined' ? navigator.onLine : true,
      uptimeMs: typeof performance !== 'undefined' ? Math.round(performance.now()) : null,
    };

    return payload;
  }

  function kindRateLimit() {
    // Basit global rate limit (istersen kind bazlı yapılır)
    const t = now();
    if (t - state.lastErrorAt < 800) return false;
    state.lastErrorAt = t;
    return true;
  }

  function pushLog(level, args) {
    if (!enableLogBuffer) return;
    const item = {
      ts: new Date().toISOString(),
      level,
      msg: args.map(safeStringify).join(' '),
    };
    state.logBuffer.push(item);
    if (state.logBuffer.length > logBufferSize) {
      state.logBuffer.splice(0, state.logBuffer.length - logBufferSize);
    }
  }

  function notifyState() {
    if (typeof onStateChange === 'function') {
      try { onStateChange({ safeMode: state.safeMode, breakers: state.breakers }); } catch (_) {}
    }
  }

  // ---------- overlay (admin-only) ----------
  function ensureOverlay() {
    if (!showOverlay) return null;
    if (overlayRequiresAdmin && !adminOk()) return null;
    if (state.overlayEl) return state.overlayEl;

    // body henüz yoksa geciktir
    if (!document.body) return null;

    const el = document.createElement('div');
    el.id = 'nisai-dev-error-overlay';
    el.style.cssText = `
      position: fixed; inset: 12px; z-index: 99999;
      background: rgba(15,15,15,0.92); color: #fff;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 14px; padding: 14px;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
      display: none; overflow: auto;
    `;
    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
        <div style="font-weight:900;">⚠️ ADMIN HATA PANELİ</div>
        <div style="display:flex; gap:8px;">
          <button id="nisai-overlay-copy" style="
            padding:8px 10px; border-radius:10px; border:1px solid #333;
            background:#151515; color:#fff; cursor:pointer;
          ">Kopyala</button>
          <button id="nisai-overlay-close" style="
            padding:8px 10px; border-radius:10px; border:1px solid #333;
            background:#151515; color:#fff; cursor:pointer;
          ">Kapat</button>
        </div>
      </div>
      <div id="nisai-overlay-body" style="margin-top:12px; white-space:pre-wrap; font-size:12px; line-height:1.45;"></div>
    `;

    document.body.appendChild(el);

    el.querySelector('#nisai-overlay-close')?.addEventListener('click', () => {
      el.style.display = 'none';
    });

    el.querySelector('#nisai-overlay-copy')?.addEventListener('click', async () => {
      const body = el.querySelector('#nisai-overlay-body');
      const txt = body?.textContent || '';
      try {
        await navigator.clipboard.writeText(txt);
      } catch (_) {
        // clipboard yetmezse sessiz geç
      }
    });

    state.overlayEl = el;
    return el;
  }

  function showAdminOverlay(payload) {
    if (!isDev) return; // prod’da default kapalı kalsın
    const el = ensureOverlay();
    if (!el) return;

    const body = el.querySelector('#nisai-overlay-body');
    if (body) {
      body.textContent =
        `TÜR: ${payload.kind}\n` +
        `ZAMAN: ${payload.ts}\n` +
        `HATA: ${payload.name}: ${payload.message}\n\n` +
        (payload.stack ? `STACK:\n${payload.stack}\n\n` : '') +
        (payload.url ? `DOSYA: ${payload.url}\nSATIR: ${payload.line}:${payload.col}\n\n` : '') +
        (payload.reason ? `REASON:\n${payload.reason}\n\n` : '') +
        (payload.ctx ? `CTX:\n${JSON.stringify(payload.ctx, null, 2)}\n\n` : '') +
        (payload.logTail ? `LOG TAIL:\n${payload.logTail.map(x => `[${x.ts}] ${x.level}: ${x.msg}`).join('\n')}\n\n` : '') +
        `EK:\n${JSON.stringify(payload.extra || {}, null, 2)}`;
    }
    el.style.display = 'block';
  }

  // ---------- circuit breaker ----------
  function loadBreakers() {
    if (!enableCircuitBreaker) return {};
    try {
      const raw = localStorage.getItem(breakerStorageKey);
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  function saveBreakers() {
    if (!enableCircuitBreaker) return;
    try {
      localStorage.setItem(breakerStorageKey, JSON.stringify(state.breakers));
    } catch (_) {}
  }

  function breakerKeyFor(payload) {
    // aynı hataları grupla: kind + message (kısaltılmış)
    const msg = (payload.message || '').slice(0, 120);
    return `${payload.kind}::${msg}`;
  }

  function recordBreaker(payload) {
    if (!enableCircuitBreaker) return;
    const k = breakerKeyFor(payload);
    const t = now();
    const b = state.breakers[k] || { count: 0, firstAt: t, trippedUntil: 0 };

    // cooldown içindeyse dokunma
    if (b.trippedUntil && t < b.trippedUntil) {
      state.breakers[k] = b;
      return;
    }

    // window dışına çıktıysa reset
    if (t - b.firstAt > breakerWindowMs) {
      b.count = 0;
      b.firstAt = t;
    }

    b.count += 1;

    if (b.count >= breakerTripCount) {
      b.trippedUntil = t + breakerCooldownMs;
      // safeMode’a geçmek istersen burada tetikleyebilirsin:
      // state.safeMode = true;

      if (typeof onFeatureDisabled === 'function') {
        try { onFeatureDisabled(k, { until: b.trippedUntil, payload }); } catch (_) {}
      }
      notifyState();
    }

    state.breakers[k] = b;
    saveBreakers();
  }

  function isBreakerTripped(featureKeyOrPayloadKey) {
    if (!enableCircuitBreaker) return false;
    const t = now();
    const b = state.breakers[featureKeyOrPayloadKey];
    return !!(b && b.trippedUntil && t < b.trippedUntil);
  }

  // ---------- emit ----------
  function emit(payload) {
    if (!kindRateLimit()) return;

    // breaker kaydı
    recordBreaker(payload);

    // dev log
    if (isDev) {
      console.warn('⚠️ [NISAI] Hata yakalandı:', payload);
    }

    // admin overlay (dev + admin)
    showAdminOverlay(payload);

    // telemetry callback
    if (typeof onError === 'function') {
      try { onError(payload); } catch (_) {}
    }
  }

  // ---------- global listeners ----------
  window.addEventListener('error', (event) => {
    const payload = buildPayload(
      'window.onerror',
      event.error || new Error(event.message || 'Bilinmeyen hata'),
      {
        url: event.filename,
        line: event.lineno,
        col: event.colno,
        extra: { message: event.message }
      }
    );
    emit(payload);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const payload = buildPayload(
      'unhandledrejection',
      event.reason || new Error('Unhandled rejection'),
      { reason: safeStringify(event.reason || ''), extra: {} }
    );
    emit(payload);
  });

  // ---------- console hooks (log buffer) ----------
  const originalConsoleLog = console.log.bind(console);
  const originalConsoleWarn = console.warn.bind(console);
  const originalConsoleError = console.error.bind(console);

  console.log = (...args) => { pushLog('log', args); originalConsoleLog(...args); };
  console.warn = (...args) => { pushLog('warn', args); originalConsoleWarn(...args); };
  console.error = (...args) => {
    pushLog('error', args);
    originalConsoleError(...args);
    const err = args.find(a => a instanceof Error) || new Error(args.map(safeStringify).join(' '));
    emit(buildPayload('console.error', err, { extra: { args: args.map(safeStringify) } }));
  };

  // ---------- guard wrapper ----------
  function guard(fn, context = {}) {
    return (...args) => {
      try {
        // breaker aktifse bu handler’ı çalıştırma (UX bozulmasın: sessiz geç)
        if (enableCircuitBreaker && context?.breakerKey && isBreakerTripped(context.breakerKey)) {
          pushLog('warn', [`[GUARD] breaker aktif: ${context.breakerKey}`]);
          return undefined;
        }

        const r = fn(...args);

        if (r && typeof r.then === 'function') {
          r.catch((e) => emit(buildPayload('guard.async', e, { extra: context })));
        }
        return r;
      } catch (e) {
        emit(buildPayload('guard.sync', e, { extra: context }));
        return undefined;
      }
    };
  }

  // ---------- fetch wrapper (timeout + retry + offline queue) ----------
  function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  function jitter(ms) {
    // 0.8x - 1.2x
    const f = 0.8 + Math.random() * 0.4;
    return Math.round(ms * f);
  }

  function computeDelay(attempt) {
    const d = Math.min(fetchRetryMaxDelayMs, fetchRetryBaseDelayMs * (2 ** attempt));
    return jitter(d);
  }

  function readQueue() {
    try {
      const raw = localStorage.getItem(offlineQueueKey);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  function writeQueue(q) {
    try { localStorage.setItem(offlineQueueKey, JSON.stringify(q)); } catch (_) {}
  }

  function enqueueOffline(item) {
    if (!enableOfflineQueue) return false;
    const q = readQueue();
    q.push(item);
    if (q.length > offlineQueueMax) q.splice(0, q.length - offlineQueueMax);
    writeQueue(q);
    pushLog('warn', ['[OFFLINE_QUEUE] enqueue', item?.context?.area || 'unknown']);
    return true;
  }

  async function drainOfflineQueue() {
    if (!enableOfflineQueue) return;
    if (!navigator.onLine) return;

    const q = readQueue();
    if (!q.length) return;

    // Kuyruğu kopyala, başarılı olunca sil
    const remaining = [];
    for (const item of q) {
      try {
        await safeFetch(item.input, item.init, item.context, { _fromQueue: true });
      } catch (_) {
        remaining.push(item);
      }
    }
    writeQueue(remaining);
  }

  window.addEventListener('online', () => {
    // online gelince kuyruğu erit
    drainOfflineQueue().catch(() => {});
  });

  async function safeFetch(input, init = {}, context = {}, _opts = {}) {
    const ctx = { ...context };
    const online = typeof navigator !== 'undefined' ? navigator.onLine : true;

    // offline ise kuyruğa al (UX: kullanıcıya anında hata basma; çağıran isterse sonuç yönetir)
    if (enableOfflineQueue && !online && !_opts._fromQueue) {
      enqueueOffline({ input, init, context: ctx, ts: Date.now() });
      const err = new Error('OFFLINE: istek kuyruğa alındı');
      emit(buildPayload('fetch.offline', err, { extra: ctx }));
      throw err;
    }

    const attempts = enableFetchRetry ? (fetchRetryCount + 1) : 1;

    for (let attempt = 0; attempt < attempts; attempt++) {
      let controller = null;
      let timeoutId = null;

      try {
        const useTimeout = enableFetchTimeout && fetchTimeoutMs > 0;

        if (useTimeout) {
          controller = new AbortController();
          init = { ...init, signal: controller.signal };
          timeoutId = setTimeout(() => controller.abort(), fetchTimeoutMs);
        }

        const res = await fetch(input, init);

        if (timeoutId) clearTimeout(timeoutId);

        if (!res.ok) {
          const err = new Error(`HTTP ${res.status} ${res.statusText}`);
          emit(buildPayload('fetch.http', err, { extra: { ...ctx, status: res.status, attempt } }));
        }

        return res;
      } catch (e) {
        if (timeoutId) clearTimeout(timeoutId);

        const isAbort = e?.name === 'AbortError';
        const kind = isAbort ? 'fetch.timeout' : 'fetch.network';
        emit(buildPayload(kind, e, { extra: { ...ctx, attempt } }));

        // retry koşulu
        const canRetry = enableFetchRetry && attempt < attempts - 1 && !isAbort;
        if (canRetry) {
          await sleep(computeDelay(attempt));
          continue;
        }

        throw e;
      }
    }

    // buraya normalde düşmez
    throw new Error('safeFetch: unreachable');
  }

  // ---------- watchdog (opsiyonel, UX güvenli) ----------
  // Default kapalı: açarsan sadece admin log/overlay üretir, kullanıcıya popup basmaz.
  function startWatchdog() {
    if (!enableWatchdog) return;
    let last = now();

    setInterval(() => {
      const t = now();
      const drift = t - last - 1000;
      last = t;

      // 2.5s üzeri drift -> donma/long task olası
      if (drift > 2500) {
        const err = new Error(`Watchdog: event loop drift ${drift}ms`);
        emit(buildPayload('watchdog.freeze', err, { extra: { driftMs: drift } }));
      }
    }, 1000);
  }

  // body hazırsa overlay oluşturma şansı
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      ensureOverlay();
      startWatchdog();
      drainOfflineQueue().catch(() => {});
    }, { once: true });
  } else {
    ensureOverlay();
    startWatchdog();
    drainOfflineQueue().catch(() => {});
  }

  // dışarı API
  return {
    guard,
    safeFetch,
    // admin-only helpers
    getLogTail: (n = 50) => state.logBuffer.slice(-n),
    isBreakerTripped,
    resetBreakers: () => {
      state.breakers = {};
      saveBreakers();
      notifyState();
    }
  };
}

/*
KULLANIM (app.js)
import { installGlobalGuardsV2 } from './utils/guard.v2.js';

const guards = installGlobalGuardsV2({
  isDev: true,
  isAdmin: () => window.__USER?.role === 'admin',
  showOverlay: true,
  overlayRequiresAdmin: true,

  enableWatchdog: false, // istersen aç
  onError: (payload) => {
    // telemetry/dispatch (kullanıcıya UI basma, sadece admin paneline/loga)
  }
});

document.getElementById('send-btn')?.addEventListener(
  'click',
  guards.guard(() => { ... }, { area: 'composer.send', breakerKey: 'feature:composer.send' })
);
*/
