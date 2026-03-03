import { ADMIN_CREDENTIALS, setAdminLogin } from '../../config/admin.js';

// SHA-256 yardımcısı
async function sha256Hex(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function showAdminLogin() {
  const modal = document.createElement('div');
  modal.id = 'admin-login-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:9999;';

  modal.innerHTML = `
    <div style="width:360px;background:#111;color:#fff;border:1px solid #2a2a2a;border-radius:14px;padding:16px;font-family:system-ui,-apple-system;box-shadow:0 10px 30px rgba(0,0,0,.35);">
      <div style="font-weight:700;font-size:16px;margin-bottom:10px;">Admin Girişi</div>
      <label style="font-size:12px;color:#bbb;">Kullanıcı Adı</label>
      <input id="admin-user" autocomplete="username" style="width:100%;margin-top:6px;margin-bottom:10px;padding:10px;border-radius:10px;border:1px solid #333;background:#0b0b0b;color:#fff;outline:none;" />
      <label style="font-size:12px;color:#bbb;">Şifre</label>
      <input id="admin-pass" type="password" autocomplete="current-password" style="width:100%;margin-top:6px;margin-bottom:12px;padding:10px;border-radius:10px;border:1px solid #333;background:#0b0b0b;color:#fff;outline:none;" />
      <div style="display:flex;gap:8px;justify-content:flex-end;">
        <button id="admin-cancel-btn" style="padding:10px 12px;border-radius:10px;border:1px solid #333;background:#151515;color:#fff;cursor:pointer;">İptal</button>
        <button id="admin-login-btn" style="padding:10px 12px;border-radius:10px;border:none;background:#2f7cf6;color:#fff;cursor:pointer;font-weight:700;">Giriş</button>
      </div>
      <div id="admin-login-error" style="margin-top:10px;color:#ffb3b3;font-size:12px;display:none;"></div>
    </div>
  `;

  document.body.appendChild(modal);

  const showError = (msg) => {
    const el = document.getElementById('admin-login-error');
    el.textContent = msg;
    el.style.display = 'block';
  };

  document.getElementById('admin-login-btn').onclick = async () => {
    const user = (document.getElementById('admin-user').value || '').trim();
    const pass = document.getElementById('admin-pass').value || '';
    if (!user || !pass) return showError('Kullanıcı adı ve şifre zorunludur.');
    if (user !== ADMIN_CREDENTIALS.username) return showError('Hatalı kullanıcı adı veya şifre.');

    const passHash = await sha256Hex(pass);
    if (passHash !== ADMIN_CREDENTIALS.passwordSha256) return showError('Hatalı kullanıcı adı veya şifre.');

    setAdminLogin(true);
    modal.remove();
    location.reload();
  };

  document.getElementById('admin-cancel-btn').onclick = () => modal.remove();
}
