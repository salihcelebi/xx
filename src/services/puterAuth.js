// Puter kimlik doğrulama işlemlerini tek noktadan yönetir.

const AUTH_CODES = Object.freeze({
  POPUP_BLOCKED: 'POPUP_BLOCKED',
  CANCELLED: 'CANCELLED',
  NETWORK: 'NETWORK',
  UNAUTHORIZED: 'UNAUTHORIZED',
  UNKNOWN: 'UNKNOWN',
  NOT_SUPPORTED: 'NOT_SUPPORTED',
});

const AUTH_STATUS = Object.freeze({
  SIGNED_IN: 'SIGNED_IN',
  SIGNED_OUT: 'SIGNED_OUT',
  ERROR: 'ERROR',
});

let inMemorySession = null;

function now() {
  return Date.now();
}

function makeCorrelationId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `auth_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function getPuterAuth() {
  if (typeof puter === 'undefined' || !puter?.auth) {
    return null;
  }
  return puter.auth;
}

function normalizeUserLite(rawUser) {
  if (!rawUser) return null;
  return {
    id: rawUser.id || rawUser.uuid || null,
    name: rawUser.name || rawUser.username || null,
    email: rawUser.email || null,
    avatarUrl: rawUser.avatar || rawUser.avatarUrl || null,
    role: 'user',
  };
}

function makeAuthError(code, details, retryable) {
  return {
    code,
    messageKey: `auth.error.${code.toLowerCase()}`,
    details,
    retryable,
    ts: now(),
  };
}

function mapAuthError(error) {
  const message = String(error?.message || '').toLowerCase();
  if (message.includes('popup') || message.includes('blocked')) return makeAuthError(AUTH_CODES.POPUP_BLOCKED, error, true);
  if (message.includes('cancel')) return makeAuthError(AUTH_CODES.CANCELLED, error, false);
  if (message.includes('network') || message.includes('fetch')) return makeAuthError(AUTH_CODES.NETWORK, error, true);
  if (message.includes('unauthorized') || message.includes('401')) return makeAuthError(AUTH_CODES.UNAUTHORIZED, error, false);
  return makeAuthError(AUTH_CODES.UNKNOWN, error, true);
}

function makeMeta(startedAt) {
  const endedAt = now();
  return {
    correlationId: makeCorrelationId(),
    startedAt,
    endedAt,
    durationMs: endedAt - startedAt,
  };
}

export async function signIn({ mode = 'NORMAL', testMode = false } = {}) {
  const startedAt = now();

  if (testMode) {
    return {
      status: AUTH_STATUS.SIGNED_IN,
      provider: 'puter',
      user: { id: 'test-user', name: 'Test Kullanıcı', email: null, avatarUrl: null, role: 'user' },
      session: null,
      isTempUser: mode === 'TEMP_GUEST',
      ts: now(),
      meta: makeMeta(startedAt),
    };
  }

  const auth = getPuterAuth();
  if (!auth) {
    return { status: AUTH_STATUS.ERROR, error: makeAuthError(AUTH_CODES.NOT_SUPPORTED, { reason: 'PUTER_AUTH_MISSING' }, false), meta: makeMeta(startedAt) };
  }

  try {
    const result = mode === 'TEMP_GUEST'
      ? await auth.signIn({ attempt_temp_user_creation: true })
      : await auth.signIn();

    inMemorySession = result?.session || null;

    return {
      status: AUTH_STATUS.SIGNED_IN,
      provider: 'puter',
      user: normalizeUserLite(result?.user || result),
      session: inMemorySession,
      isTempUser: mode === 'TEMP_GUEST',
      ts: now(),
      meta: makeMeta(startedAt),
    };
  } catch (error) {
    return {
      status: AUTH_STATUS.ERROR,
      error: mapAuthError(error),
      provider: 'puter',
      user: null,
      session: null,
      isTempUser: false,
      ts: now(),
      meta: makeMeta(startedAt),
    };
  }
}

export async function signOut() {
  const startedAt = now();
  const auth = getPuterAuth();
  if (!auth) {
    return { status: AUTH_STATUS.ERROR, error: makeAuthError(AUTH_CODES.NOT_SUPPORTED, { reason: 'PUTER_AUTH_MISSING' }, false), meta: makeMeta(startedAt) };
  }

  try {
    if (typeof auth.signOut === 'function') {
      await auth.signOut();
    }
    inMemorySession = null;
    return { status: AUTH_STATUS.SIGNED_OUT, provider: 'puter', ts: now(), meta: makeMeta(startedAt) };
  } catch (error) {
    return { status: AUTH_STATUS.ERROR, error: mapAuthError(error), meta: makeMeta(startedAt) };
  }
}

export async function checkSignedIn() {
  const auth = getPuterAuth();
  if (!auth) {
    return { signedIn: false, user: null, ts: now(), error: makeAuthError(AUTH_CODES.NOT_SUPPORTED, { reason: 'PUTER_AUTH_MISSING' }, false) };
  }

  try {
    if (typeof auth.isSignedIn === 'function') {
      const signedIn = await auth.isSignedIn();
      if (!signedIn) return { signedIn: false, user: null, ts: now() };
    }

    const user = await getUserLite();
    return { signedIn: Boolean(user), user, ts: now() };
  } catch {
    return { signedIn: false, user: null, ts: now() };
  }
}

export async function getUserLite() {
  const auth = getPuterAuth();
  if (!auth) return null;

  if (typeof auth.getUser === 'function') {
    try {
      const user = await auth.getUser();
      return normalizeUserLite(user);
    } catch {
      return null;
    }
  }

  return null;
}

export function getSession() {
  return inMemorySession;
}

export { AUTH_CODES, AUTH_STATUS };
