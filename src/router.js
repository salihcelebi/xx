import { renderChatPage } from './pages/chatPage.js';
import { renderVideoPage } from './pages/videoPage.js';
import { renderHistoryPage } from './pages/historyPage.js';
import { renderAssetsPage } from './pages/assetsPage.js';
import { renderModelsPage } from './pages/modelsPage.js';
import { renderUsagePage } from './pages/usagePage.js';
import { renderBillingPage } from './pages/billingPage.js';
import { renderAdminPage } from './pages/adminPage.js';

const routes = {
  '/chat': renderChatPage,
  '/video': renderVideoPage,
  '/history': renderHistoryPage,
  '/assets': renderAssetsPage,
  '/models': renderModelsPage,
  '/usage': renderUsagePage,
  '/billing': renderBillingPage,
  '/admin': renderAdminPage,
};

export async function renderRoute(route, outlet) {
  // Gereksinim B15: route'a göre sadece outlet render edilir.
  const renderer = routes[route] || renderChatPage;
  outlet.innerHTML = await renderer();
}

export function getCurrentRoute() {
  return window.location.hash.replace('#', '') || '/chat';
}
