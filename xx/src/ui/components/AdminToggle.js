import { isAdminLoggedIn, getTestMode, setTestMode, setAdminLogin } from '../../config/admin.js';
import { showAdminLogin } from './AdminLogin.js';

function updateTestModeIndicator() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  let indicator = document.getElementById('test-mode-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'test-mode-indicator';
    indicator.style.marginLeft = '8px';
    topbar.appendChild(indicator);
  }

  if (!isAdminLoggedIn) {
    indicator.style.display = 'none';
    indicator.textContent = '';
    return;
  }

  indicator.style.display = 'inline-flex';
  indicator.style.alignItems = 'center';
  indicator.style.gap = '6px';
  indicator.style.padding = '6px 10px';
  indicator.style.borderRadius = '999px';
  indicator.style.fontWeight = '900';
  indicator.style.fontSize = '12px';
  indicator.style.border = '1px solid #333';

  if (getTestMode()) {
    indicator.style.background = '#ff9800';
    indicator.style.color = '#111';
    indicator.textContent = '🧪 TEST MODU';
  } else {
    indicator.style.background = '#2ecc71';
    indicator.style.color = '#111';
    indicator.textContent = '⚡ GERÇEK MOD';
  }
}

function showAdminPanel() {
  const existing = document.getElementById('admin-panel');
  if (existing) return existing.remove();

  const panel = document.createElement('div');
  panel.id = 'admin-panel';
  panel.style.cssText = 'position:fixed;top:64px;right:16px;width:260px;background:#111;color:#fff;border:1px solid #2a2a2a;border-radius:14px;padding:12px;z-index:9998;box-shadow:0 10px 30px rgba(0,0,0,.35);font-family:system-ui,-apple-system;';

  const checked = getTestMode();
  panel.innerHTML = `
    <div style="font-weight:800;margin-bottom:10px;">Admin Panel</div>
    <label style="display:flex;align-items:center;gap:10px;cursor:pointer;">
      <input id="test-mode-toggle" type="checkbox" ${checked ? 'checked' : ''} />
      <span style="font-weight:700;">🧪 Test Modu</span>
    </label>
    <div style="margin-top:10px;font-size:12px;color:#bbb;line-height:1.4;">Test modu açıkken çağrılar kredi tüketmez.</div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;">
      <button id="admin-logout" style="padding:8px 10px;border-radius:10px;border:1px solid #333;background:#151515;color:#fff;cursor:pointer;">Admin Çıkış</button>
      <button id="close-admin-panel" style="padding:8px 10px;border-radius:10px;border:none;background:#2f7cf6;color:#fff;cursor:pointer;font-weight:800;">Kapat</button>
    </div>
  `;

  document.body.appendChild(panel);

  document.getElementById('test-mode-toggle').onchange = (event) => {
    setTestMode(event.target.checked);
    updateTestModeIndicator();
  };

  document.getElementById('admin-logout').onclick = () => {
    setAdminLogin(false);
    updateTestModeIndicator();
    panel.remove();
    location.reload();
  };

  document.getElementById('close-admin-panel').onclick = () => panel.remove();
}

export function initAdminToggle() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  let adminBtn = document.getElementById('admin-btn');
  if (!adminBtn) {
    adminBtn = document.createElement('button');
    adminBtn.id = 'admin-btn';
    adminBtn.textContent = '⚙️ Admin';
    adminBtn.style.cssText = 'padding:8px 10px;border-radius:10px;border:1px solid #2a2a2a;background:#151515;color:#fff;cursor:pointer;margin-left:8px;font-weight:700;';
    topbar.appendChild(adminBtn);
  }

  adminBtn.onclick = () => {
    if (!isAdminLoggedIn) return showAdminLogin();
    showAdminPanel();
  };

  updateTestModeIndicator();
}
