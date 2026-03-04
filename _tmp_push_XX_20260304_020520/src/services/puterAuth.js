// Puter kimlik doğrulama işlemlerini tek noktadan yönetir.

export const AUTH_CODES = Object.freeze({
  POPUP_BLOCKED: 'POPUP_BLOCKED',
  CANCELLED: 'CANCELLED',
  NETWORK: 'NETWORK',
  UNAUTHORIZED: 'UNAUTHORIZED',
  UNKNOWN: 'UNKNOWN',
  NOT_SUPPORTED: 'NOT_SUPPORTED',
});

export const AUTH_STATUS = Object.freeze({
  SIGNED_IN: 'SIGNED_IN',
  SIGNED_OUT: 'SIGNED_OUT',
  ERROR: 'ERROR',
});

let inMemorySession = null;

function now() {
  return Date.now();
}

function makeCorrelationId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `auth_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

function makeMeta(startedAt, correlationId) {
  const endedAt = now();
  return {
    correlationId,
    startedAt,
    endedAt,
    durationMs: endedAt - startedAt,
  };
}

function makeAuthError(code, retryable, details = null) {
  return {
    code,
    messageKey: `auth.error.${String(code).toLowerCase()}`,
    details,
    retryable,
    ts: now(),
  };
}

function getPuterAuth() {
  if (typeof puter === 'undefined' || !puter?.auth) return null;
  return puter.auth;
}

function normalizeUserLite(rawUser) {
  if (!rawUser) return null;
  return {
    id: rawUser.id || rawUser.uuid || null,
    name: rawUser.username || rawUser.name || null,
    email: rawUser.email || null,
    avatarUrl: rawUser.avatarUrl || rawUser.avatar || null,
    role: 'user',
  };
}

function normalizeAuthResult({ status, user = null, session = null, isTempUser = false, error = null, meta }) {
  return {
    status,
    provider: 'puter',
    user,
    session,
    isTempUser,
    ts: now(),
    error,
    meta,
  };
}

function mapAuthError(error) {
  const message = String(error?.message || '').toLowerCase();

  if (error?.name === 'AbortError') return makeAuthError(AUTH_CODES.CANCELLED, false, error);
  if (message.includes('popup') || message.includes('blocked')) return makeAuthError(AUTH_CODES.POPUP_BLOCKED, true, error);
  if (message.includes('cancel') || message.includes('closed')) return makeAuthError(AUTH_CODES.CANCELLED, false, error);
  if (message.includes('network') || message.includes('fetch')) return makeAuthError(AUTH_CODES.NETWORK, true, error);
  if (message.includes('unauthorized') || message.includes('401')) return makeAuthError(AUTH_CODES.UNAUTHORIZED, false, error);

  return makeAuthError(AUTH_CODES.UNKNOWN, true, error);
}

export async function signIn({ mode = 'NORMAL', testMode = false } = {}) {
  const startedAt = now();
  const correlationId = makeCorrelationId();

  if (testMode) {
    const fakeUser = {
      id: 'test-user',
      name: 'Test Kullanıcı',
      email: null,
      avatarUrl: null,
      role: 'user',
    };

    return normalizeAuthResult({
      status: AUTH_STATUS.SIGNED_IN,
      user: fakeUser,
      session: null,
      isTempUser: mode === 'TEMP_GUEST',
      meta: makeMeta(startedAt, correlationId),
    });
  }

  const auth = getPuterAuth();
  if (!auth || typeof auth.signIn !== 'function') {
    return normalizeAuthResult({
      status: AUTH_STATUS.ERROR,
      error: makeAuthError(AUTH_CODES.NOT_SUPPORTED, false, { reason: 'PUTER_AUTH_UNAVAILABLE' }),
      meta: makeMeta(startedAt, correlationId),
    });
  }

  try {
    const response = mode === 'TEMP_GUEST'
      ? await auth.signIn({ attempt_temp_user_creation: true })
      : await auth.signIn();

    const rawUser = response?.user || response;
    inMemorySession = response?.session || inMemorySession;

    return normalizeAuthResult({
      status: AUTH_STATUS.SIGNED_IN,
      user: normalizeUserLite(rawUser),
      session: inMemorySession,
      isTempUser: mode === 'TEMP_GUEST',
      meta: makeMeta(startedAt, correlationId),
    });
  } catch (error) {
    return normalizeAuthResult({
      status: AUTH_STATUS.ERROR,
      error: mapAuthError(error),
      session: null,
      isTempUser: false,
      meta: makeMeta(startedAt, correlationId),
    });
  }
}

export async function signOut() {
  const startedAt = now();
  const correlationId = makeCorrelationId();
  const auth = getPuterAuth();

  if (!auth || typeof auth.signOut !== 'function') {
    inMemorySession = null;
    return normalizeAuthResult({
      status: AUTH_STATUS.ERROR,
      error: makeAuthError(AUTH_CODES.NOT_SUPPORTED, false, { reason: 'PUTER_SIGNOUT_UNAVAILABLE' }),
      meta: makeMeta(startedAt, correlationId),
    });
  }

  try {
    await auth.signOut();
    inMemorySession = null;

    return normalizeAuthResult({
      status: AUTH_STATUS.SIGNED_OUT,
      user: null,
      session: null,
      isTempUser: false,
      meta: makeMeta(startedAt, correlationId),
    });
  } catch (error) {
    return normalizeAuthResult({
      status: AUTH_STATUS.ERROR,
      error: mapAuthError(error),
      meta: makeMeta(startedAt, correlationId),
    });
  }
}

export async function checkSignedIn() {
  const auth = getPuterAuth();
  if (!auth) {
    return { signedIn: false, user: null, ts: now() };
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
  if (!auth || typeof auth.getUser !== 'function') return null;

  try {
    const user = await auth.getUser();
    return normalizeUserLite(user);
  } catch {
    return null;
  }
}

export function getSession() {
  return inMemorySession;
}
