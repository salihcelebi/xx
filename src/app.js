import { renderRoute, getCurrentRoute } from './router.js';
import { dispatch, getState, subscribe } from './store/index.js';
import { refreshUsage, setAppLanguage } from './store/slices/appSlice.js';
import { listModelsWithCache } from './services/aiService.js';
import { beginDiff, computeDiff, fetchMonthlyUsage, microcentsToUsd } from './services/usageService.js';
import { logEvent } from './services/telemetryService.js';
import { createToastManager } from './ui/components/toasts.js';
import { setupModalEscape } from './ui/components/modals.js';
import { renderPageHeader } from './ui/components/pageHeader.js';
import { dictionaries } from './config/i18n.js';

const commandBus = new Map();
let usagePollTimer = null;

function getEls() {
  return {
    outlet: document.querySelector('#route-outlet'),
    pageHeader: document.querySelector('#page-header'),
    empty: document.querySelector('#global-empty-state'),
    loader: document.querySelector('#global-loader'),
    searchModal: document.querySelector('#global-search-modal'),
    searchInput: document.querySelector('#global-search-input'),
    errorModal: document.querySelector('#error-modal'),
    paywallModal: document.querySelector('#paywall-modal'),
    toasts: document.querySelector('#toasts'),
    modeSwitch: document.querySelector('#mode-switch'),
    modelTrigger: document.querySelector('#model-picker-trigger'),
    modelList: document.querySelector('#model-picker-list'),
    modelPicker: document.querySelector('#model-picker'),
    credits: document.querySelector('#credits-indicator'),
    userMenu: document.querySelector('#user-menu'),
    lang: document.querySelector('#language-switcher'),
    adminLink: document.querySelector('#admin-nav-link'),
    statusBar: document.querySelector('#status-bar'),
  };
}

function setupGlobalErrorHandling(els, toast) {
  // Gereksinim B10: window hata yakalayıp hata modalına yönlendir.
  window.addEventListener('error', (event) => {
    els.errorModal.hidden = false;
    els.errorModal.textContent = event.message;
    toast.show('error', 'Beklenmeyen hata algılandı.');
  });

  window.addEventListener('unhandledrejection', (event) => {
    els.errorModal.hidden = false;
    els.errorModal.textContent = String(event.reason);
    toast.show('error', 'İşlem tamamlanamadı.');
  });
}

function setupSearchPalette(els) {
  const focusablesSelector = 'input, button, [href], select, textarea';
  const trap = (event) => {
    if (event.key !== 'Tab') return;
    const focusables = [...els.searchModal.querySelectorAll(focusablesSelector)];
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      last.focus();
      event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === last) {
      first.focus();
      event.preventDefault();
    }
  };

  document.addEventListener('keydown', (event) => {
    // Gereksinim B3/B22: Ctrl/⌘+K aç, Esc kapat.
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      els.searchModal.hidden = false;
      els.searchInput.focus();
    }
    if (event.key === 'Escape') {
      els.searchModal.hidden = true;
    }
  });

  els.searchModal.addEventListener('keydown', trap);
}

function setupModeSwitch(els) {
  els.modeSwitch.addEventListener('click', (event) => {
    const mode = event.target?.dataset?.mode;
    if (!mode) return;
    window.location.hash = `/${mode}`;
  });
}

async function setupModelPicker(els) {
  const state = getState();
  const models = await listModelsWithCache(state.mode);
  els.modelList.innerHTML = models.map((model, idx) => `<li role="option" tabindex="${idx === 0 ? 0 : -1}" data-id="${model.id}">${model.label} <small>${model.unitCost}</small></li>`).join('');

  els.modelTrigger.addEventListener('click', () => {
    const isHidden = els.modelList.hidden;
    els.modelList.hidden = !isHidden;
    els.modelPicker.setAttribute('aria-expanded', String(isHidden));
  });

  els.modelList.addEventListener('keydown', (event) => {
    const options = [...els.modelList.querySelectorAll('[role="option"]')];
    const currentIndex = options.findIndex((it) => it === document.activeElement);
    if (event.key === 'ArrowDown') options[Math.min(currentIndex + 1, options.length - 1)]?.focus();
    if (event.key === 'ArrowUp') options[Math.max(currentIndex - 1, 0)]?.focus();
    if (event.key === 'Enter') document.activeElement?.click();
  });
}

function setupLanguageSwitcher(els, toast) {
  els.lang.innerHTML = `
    <label for="lang-select">Dil</label>
    <select id="lang-select" aria-label="Language switcher">
      <option value="tr">TR</option>
      <option value="en">EN</option>
      <option value="de">DE</option>
      <option value="es">ES</option>
    </select>
  `;

  const select = els.lang.querySelector('select');
  select.value = getState().language;
  select.addEventListener('change', async () => {
    await setAppLanguage(select.value);
    if (!dictionaries[select.value]) {
      toast.show('info', dictionaries.tr.translationFailed);
    }
    renderFromState(els);
  });
}

function setupUserMenu(els) {
  els.userMenu.innerHTML = '<button id="user-menu-trigger">Kullanıcı</button><div id="user-menu-list" hidden><button>Profile</button><button>Settings</button><button>Admin</button></div>';
  const trigger = els.userMenu.querySelector('#user-menu-trigger');
  const list = els.userMenu.querySelector('#user-menu-list');
  trigger.addEventListener('click', () => {
    list.hidden = !list.hidden;
    els.userMenu.setAttribute('aria-expanded', String(!list.hidden));
  });
}

function setupCommandBus(els) {
  commandBus.set('generate', () => {
    logEvent('generate_clicked', { route: getCurrentRoute() });
    els.statusBar.textContent = 'Generate komutu tetiklendi.';
  });

  document.addEventListener('keydown', (event) => {
    // Gereksinim B14: G kısayolu command bus üzerinden.
    if (event.key.toLowerCase() === 'g' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
      commandBus.get('generate')?.();
    }
  });
}

function setupPaywallHook(els, toast) {
  // Gereksinim B16/B24: Pro kilidi tıklandığında paywall açacak örnek hook.
  document.addEventListener('click', (event) => {
    if (!event.target.matches('[data-pro-only="true"]')) return;
    els.paywallModal.hidden = false;
    toast.show('warn', 'Bu özellik için üst plan gerekli.');
  });
}

async function pollUsage(els) {
  const usage = await fetchMonthlyUsage();
  const state = getState();
  beginDiff(usage);
  const diff = computeDiff(usage);

  els.credits.querySelector('[data-credit="remaining"]').textContent = `Remaining: ${microcentsToUsd(usage.remainingMicrocents)}`;
  els.credits.querySelector('[data-credit="appTotals"]').textContent = `App total: ${microcentsToUsd(usage.appTotalsMicrocents)}`;
  els.credits.querySelector('[data-credit="diff"]').textContent = `Diff: ${microcentsToUsd(diff)}`;

  // Gereksinim B7: debug amaçlı ham microcents tooltip.
  els.credits.title = `raw remaining=${usage.remainingMicrocents}, raw total=${usage.appTotalsMicrocents}`;

  dispatch((draft) => {
    draft.usage = state.usage;
  });
}

function setupUsagePolling(els) {
  const run = async () => {
    await pollUsage(els);
    const nextInterval = document.hidden ? 30_000 : 10_000;
    usagePollTimer = setTimeout(run, nextInterval);
  };
  run();
}

function renderFromState(els) {
  const state = getState();
  els.adminLink.hidden = !state.user.isAdmin;
  els.empty.textContent = state.translatedEmpty || dictionaries.tr.empty;
  renderPageHeader(els.pageHeader, state.mode === 'video' ? 'Video' : 'Chat', 'NISAI.MD gereksinimlerine uygun standart başlık alanı.');
  els.statusBar.textContent ||= dictionaries[state.language]?.queueIdle ?? dictionaries.tr.queueIdle;
}

async function renderCurrentRoute(els) {
  const route = getCurrentRoute();
  dispatch((draft) => {
    draft.route = route;
    draft.mode = route.includes('video') ? 'video' : 'chat';
  });
  await renderRoute(route, els.outlet);
  const isEmpty = els.outlet.querySelector('[data-empty="true"]');
  els.empty.hidden = !isEmpty;
}

async function init() {
  const els = getEls();
  const toast = createToastManager(els.toasts);

  setupModalEscape([els.searchModal, els.errorModal, els.paywallModal]);
  setupGlobalErrorHandling(els, toast);
  setupSearchPalette(els);
  setupModeSwitch(els);
  await setupModelPicker(els);
  setupLanguageSwitcher(els, toast);
  setupUserMenu(els);
  setupCommandBus(els);
  setupPaywallHook(els, toast);
  setupUsagePolling(els);

  // Gereksinim B11: global busy flag görünürlüğü.
  subscribe((state) => {
    els.loader.hidden = !state.busy;
  });

  await setAppLanguage(getState().language);
  await refreshUsage();
  await renderCurrentRoute(els);
  renderFromState(els);

  window.addEventListener('hashchange', async () => {
    logEvent('route_change', { route: getCurrentRoute() });
    await renderCurrentRoute(els);
    renderFromState(els);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Gereksinim B2: bootstrap DOMContentLoaded sonrası.
  init();
});
