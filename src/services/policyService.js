import { POLICY_STORAGE_KEYS } from '../config/env.js';

const SCHEMA_VERSION = 1;

export const DEFAULT_POLICY = Object.freeze({
  schemaVersion: SCHEMA_VERSION,
  packages: {
    free: {
      chat: { allowList: [], flags: { allowLocked: false } },
      video: { allowList: [], flags: { allowLocked: false } },
      image: { allowList: [], flags: { allowLocked: false } },
      tts: { allowList: [], flags: { allowLocked: false } },
      dubbing: { allowList: [], flags: { allowLocked: false } },
      code: { allowList: [], flags: { allowLocked: false } },
    },
    pro: {
      chat: { allowList: [], flags: { allowLocked: false } },
      video: { allowList: [], flags: { allowLocked: false } },
      image: { allowList: [], flags: { allowLocked: false } },
      tts: { allowList: [], flags: { allowLocked: false } },
      dubbing: { allowList: [], flags: { allowLocked: false } },
      code: { allowList: [], flags: { allowLocked: false } },
    },
    enterprise: {
      chat: { allowList: [], flags: { allowLocked: true } },
      video: { allowList: [], flags: { allowLocked: true } },
      image: { allowList: [], flags: { allowLocked: true } },
      tts: { allowList: [], flags: { allowLocked: true } },
      dubbing: { allowList: [], flags: { allowLocked: true } },
      code: { allowList: [], flags: { allowLocked: true } },
    },
  },
});

function getStorage() {
  if (typeof localStorage !== 'undefined') return localStorage;
  return { getItem: () => null, setItem: () => {} };
}

function clonePolicy(policy = DEFAULT_POLICY) {
  return JSON.parse(JSON.stringify(policy));
}

export function validatePolicy(policy) {
  if (!policy || typeof policy !== 'object') return { ok: false, reason: 'POLICY_INVALID_OBJECT' };
  if (!policy.packages || typeof policy.packages !== 'object') return { ok: false, reason: 'POLICY_INVALID_PACKAGES' };
  if (!Number.isInteger(policy.schemaVersion)) return { ok: false, reason: 'POLICY_INVALID_SCHEMA' };
  return { ok: true };
}

export function loadPolicy() {
  try {
    const raw = getStorage().getItem(POLICY_STORAGE_KEYS.published);
    if (!raw) return clonePolicy(DEFAULT_POLICY);
    const parsed = JSON.parse(raw);
    return validatePolicy(parsed).ok ? parsed : clonePolicy(DEFAULT_POLICY);
  } catch {
    return clonePolicy(DEFAULT_POLICY);
  }
}

export function loadDraft() {
  try {
    const raw = getStorage().getItem(POLICY_STORAGE_KEYS.draft);
    if (!raw) return loadPolicy();
    const parsed = JSON.parse(raw);
    return validatePolicy(parsed).ok ? parsed : loadPolicy();
  } catch {
    return loadPolicy();
  }
}

export function saveDraft(policy) {
  const checked = validatePolicy(policy);
  if (!checked.ok) return { ok: false, error: checked.reason };
  getStorage().setItem(POLICY_STORAGE_KEYS.draft, JSON.stringify(policy));
  return { ok: true };
}

export function publishPolicy(policy) {
  const checked = validatePolicy(policy);
  if (!checked.ok) return { ok: false, error: checked.reason };
  getStorage().setItem(POLICY_STORAGE_KEYS.published, JSON.stringify(policy));
  return { ok: true };
}

export function filterModelsByPolicy(models = [], { policy, selectedPackage = 'free', activeMode = 'chat' } = {}) {
  const safePolicy = policy || DEFAULT_POLICY;
  const pkg = safePolicy.packages?.[selectedPackage] || {};
  const modeRule = pkg?.[activeMode] || { allowList: [], flags: { allowLocked: false } };
  const allowed = new Set(modeRule.allowList || []);

  return models.filter((model) => {
    const byMode = Array.isArray(model.modes) ? model.modes.includes(activeMode) : activeMode === 'chat';
    if (!byMode) return false;
    if (allowed.size === 0) return true;
    return allowed.has(model.id);
  });
}

export function canSelectModel(model, { policy, selectedPackage = 'free', activeMode = 'chat' } = {}) {
  const safePolicy = policy || DEFAULT_POLICY;
  const pkg = safePolicy.packages?.[selectedPackage] || {};
  const modeRule = pkg?.[activeMode] || { allowList: [], flags: { allowLocked: false } };
  const allowed = new Set(modeRule.allowList || []);
  const isInMode = Array.isArray(model?.modes) ? model.modes.includes(activeMode) : activeMode === 'chat';
  if (!isInMode) return { allowed: false, reason: 'MODE_UNSUPPORTED' };
  if (allowed.size > 0 && !allowed.has(model.id)) return { allowed: false, reason: 'PACKAGE_POLICY_BLOCK' };
  if (model?.isLocked && !modeRule?.flags?.allowLocked) return { allowed: false, reason: 'LOCKED_MODEL_BLOCKED' };
  return { allowed: true, reason: null };
}
