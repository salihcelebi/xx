import { isDevelopment } from './env.js';

// Admin kimliği (kullanıcı adı sabit, şifre hash)
export const ADMIN_CREDENTIALS = {
  username: 'scelebi',
  passwordSha256: '434f71ea0d63d10b886461a4cd37012c4f2e1fa571a9a226e2925f242563731c',
};

export let isAdminLoggedIn = false;
export let testModeEnabled = isDevelopment ? true : false;

function getStorage() {
  if (typeof localStorage !== 'undefined') return localStorage;
  return {
    getItem: () => null,
    setItem: () => {},
  };
}

export function setAdminLogin(status) {
  isAdminLoggedIn = !!status;
  getStorage().setItem('adminLoggedIn', isAdminLoggedIn ? 'true' : 'false');
}

export function setTestMode(status) {
  testModeEnabled = !!status;
  getStorage().setItem('testModeEnabled', testModeEnabled ? 'true' : 'false');
}

export function getTestMode() {
  return !!testModeEnabled;
}

export function initAdmin() {
  isAdminLoggedIn = getStorage().getItem('adminLoggedIn') === 'true';
  const stored = getStorage().getItem('testModeEnabled');
  if (stored === null) {
    testModeEnabled = isDevelopment ? true : false;
  } else {
    testModeEnabled = stored === 'true';
  }
}
