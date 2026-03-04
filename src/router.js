// Router sadece route parse + page render orkestrasyonu yapar.
// NISAI.MD'de netleştir: Router listener sorumluluğunun tamamen app.js'te mi kalacağı.

export const DEFAULT_ROUTE = '/chat';
export const ROUTES = Object.freeze(['/chat', '/video', '/history', '/billing', '/admin']);

// Pure helper: hash veya route girdisini normalize eder.
export function normalizeRoute(input = '') {
  const raw = String(input || '').trim();
  const cleaned = raw.replace(/^#/, '');
  const withSlash = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
  const [path] = withSlash.split('?');
  return path === '/' ? DEFAULT_ROUTE : path;
}

// Pure helper: whitelist doğrulaması.
export function isValidRoute(route) {
  return ROUTES.includes(normalizeRoute(route));
}

// Pure helper: mevcut hash'i parse eder (test için parametre kabul eder).
export function getCurrentRoute(hash = window.location.hash) {
  const parsed = normalizeRoute(hash || DEFAULT_ROUTE);
  return isValidRoute(parsed) ? parsed : DEFAULT_ROUTE;
}

// Küçük page registry: video gibi ağır sayfalar için lazy-load hazır.
// NISAI.MD'de netleştir: Registry büyüyünce ayrı dosyaya alınacak mı?
const pageRegistry = {
  '/chat': () => import('./pages/chatPage.js'),
  '/video': () => import('./pages/videoPage.js'),
  '/history': () => import('./pages/historyPage.js'),
  '/billing': () => import('./pages/billingPage.js'),
  '/admin': () => import('./pages/adminPage.js'),
};

let currentRoute = DEFAULT_ROUTE;
let currentMode = 'chat';
let activePageModule = null;

function getModeFromRoute(route) {
  return route === '/video' ? 'video' : 'chat';
}

function createErrorPanel(route) {
  return `
    <section class="card" role="alert">
      <h2>Route yüklenemedi</h2>
      <p>Sayfa oluşturulurken bir hata oluştu: <code>${route}</code></p>
      <button id="route-retry-btn" type="button">Tekrar dene</button>
    </section>
  `;
}

function createNotFoundPanel(route) {
  return `
    <section class="card" role="alert">
      <h2>Route bulunamadı</h2>
      <p>İstenen yol tanınmadı: <code>${route}</code></p>
      <button id="route-back-chat-btn" type="button">Chat sayfasına dön</button>
    </section>
  `;
}

async function loadPageModule(route) {
  const loader = pageRegistry[route];
  if (!loader) return null;
  return loader();
}

function ensureContract(module) {
  return module && typeof module.render === 'function';
}

export function navigateTo(route) {
  const normalized = normalizeRoute(route);
  const target = isValidRoute(normalized) ? normalized : DEFAULT_ROUTE;
  if (window.location.hash === `#${target}`) return;
  window.location.hash = `#${target}`;
}

export async function renderCurrentRoute(els, store, hooks = {}) {
  const { onModeChanged, onWarning, onLoadingChange } = hooks;
  const outlet = els.outlet;
  const parsed = normalizeRoute(window.location.hash || DEFAULT_ROUTE);
  const route = isValidRoute(parsed) ? parsed : DEFAULT_ROUTE;

  if (!isValidRoute(parsed) && typeof onWarning === 'function') {
    onWarning(`Route bulunamadı, varsayılan sayfaya dönüldü: ${parsed}`);
  }

  if (activePageModule && typeof activePageModule.destroy === 'function') {
    activePageModule.destroy();
  }

  outlet.innerHTML = '<div class="global-loader">Yükleniyor...</div>';
  onLoadingChange?.(true);

  try {
    const pageModule = await loadPageModule(route);

    if (!pageModule) {
      outlet.innerHTML = createNotFoundPanel(parsed);
      outlet.querySelector('#route-back-chat-btn')?.addEventListener('click', () => navigateTo(DEFAULT_ROUTE));
      currentRoute = route;
      onLoadingChange?.(false);
      return route;
    }

    if (!ensureContract(pageModule)) {
      throw new Error('Page module kontratı bozuk: render({els, store}) bulunamadı.');
    }

    const view = await pageModule.render({ els, store });
    if (typeof view === 'string') {
      outlet.innerHTML = view;
    }

    activePageModule = pageModule;
    currentRoute = route;

    const nextMode = getModeFromRoute(route);
    if (nextMode !== currentMode) {
      currentMode = nextMode;
      onModeChanged?.(nextMode);
    }

    return route;
  } catch (error) {
    outlet.innerHTML = createErrorPanel(route);
    outlet.querySelector('#route-retry-btn')?.addEventListener('click', () => {
      renderCurrentRoute(els, store, hooks);
    });
    onWarning?.(`Route render hatası: ${error.message}`);
    return route;
  } finally {
    onLoadingChange?.(false);
  }
}

export function mountRouter({ els, store, onRoute, onModeChanged, onWarning, onLoadingChange } = {}) {
  // NISAI.MD'de netleştir: popstate de desteklenecekse eklenebilir.
  const run = async () => {
    const route = await renderCurrentRoute(els, store, { onModeChanged, onWarning, onLoadingChange });
    onRoute?.(route);
  };

  window.addEventListener('hashchange', run);

  if (!window.location.hash) {
    window.location.hash = `#${DEFAULT_ROUTE}`;
  }

  run();

  return () => {
    window.removeEventListener('hashchange', run);
  };
}

export function getRouterState() {
  return { currentRoute, currentMode };
}
