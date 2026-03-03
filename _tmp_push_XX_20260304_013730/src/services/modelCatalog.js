// Puter model kataloğunu runtime'dan alır, normalize eder ve mode bazında sunar.

const CACHE_TTL_MS = 5 * 60 * 1000;
const APP_MODES = ['chat', 'video', 'tts', 'image', 'code', 'dubbing'];

let cache = { models: null, fetchedAt: 0 };

function now() {
  return Date.now();
}

function makeCatalogError(code, retryable, details = null) {
  return {
    code,
    messageKey: `modelCatalog.error.${String(code).toLowerCase()}`,
    retryable,
    ts: now(),
    details,
  };
}

function getPuterModelListApi() {
  if (typeof puter === 'undefined' || !puter?.ai) return null;
  if (typeof puter.ai.listModels === 'function') return () => puter.ai.listModels();
  return null;
}

function getProvider(modelId = '') {
  return String(modelId).split('/')[0] || 'unknown';
}

function getLogoKey(provider = '') {
  const p = provider.toLowerCase();
  if (p === 'openai') return 'GPT';
  if (p === 'google') return 'GEMINI';
  if (p === 'anthropic') return 'CLAUDE';
  if (p === 'deepseek') return 'DEEPSEEK';
  return p.toUpperCase();
}

function inferModes(raw = {}) {
  const id = String(raw?.id || raw?.model || '').toLowerCase();
  const type = String(raw?.type || raw?.kind || '').toLowerCase();
  const tags = Array.isArray(raw?.tags) ? raw.tags.map((tag) => String(tag).toLowerCase()) : [];

  const has = (token) => id.includes(token) || type.includes(token) || tags.some((tag) => tag.includes(token));
  const modes = new Set();

  if (has('video') || has('txt2vid') || has('text-to-video')) modes.add('video');
  if (has('tts') || has('text-to-speech') || has('speech')) modes.add('tts');
  if (has('dubbing') || has('speech-to-speech') || has('voice changer') || has('voice-changer')) modes.add('dubbing');
  if (has('image') || has('text-to-image') || has('image-edit')) modes.add('image');

  if (has('code') || has('coder') || has('devstral')) modes.add('code');

  if (modes.size === 0 || has('chat') || has('text') || has('gpt') || has('gemini') || has('claude') || has('deepseek')) {
    modes.add('chat');
  }

  if (modes.has('code')) modes.add('chat');

  return [...modes].filter((mode) => APP_MODES.includes(mode));
}

function normalizeModel(raw = {}) {
  const id = raw?.id || raw?.model || null;
  const provider = getProvider(id);

  return {
    id,
    displayName: raw?.displayName || raw?.name || id,
    provider,
    modes: inferModes(raw),
    isLocked: Boolean(raw?.isLocked || raw?.locked || raw?.requiresPro),
    priceHint: raw?.priceHint || null,
    logoKey: getLogoKey(provider),
  };
}

function pickByPriority(models, provider, includes = []) {
  return models.find((model) => model.provider === provider && includes.every((term) => model.id.toLowerCase().includes(term)));
}

function buildFeaturedChatModels(models) {
  const selected = [];
  const seen = new Set();

  const candidates = [
    pickByPriority(models, 'openai', ['gpt']),
    pickByPriority(models, 'google', ['gemini']),
    pickByPriority(models, 'anthropic', ['claude']),
    pickByPriority(models, 'deepseek'),
    models.find((model) => model.provider === 'openai' && /mini|light|fast|flash/.test(model.id.toLowerCase())),
  ].filter(Boolean);

  for (const model of candidates) {
    if (!seen.has(model.id) && selected.length < 5) {
      seen.add(model.id);
      selected.push(model);
    }
  }

  for (const model of models) {
    if (selected.length >= 5) break;
    if (!seen.has(model.id)) {
      seen.add(model.id);
      selected.push(model);
    }
  }

  return selected;
}

function sortModels(models, featuredIds = []) {
  const featuredSet = new Set(featuredIds);
  return [...models].sort((a, b) => {
    const aFeatured = featuredSet.has(a.id) ? 0 : 1;
    const bFeatured = featuredSet.has(b.id) ? 0 : 1;
    if (aFeatured !== bFeatured) return aFeatured - bFeatured;
    return a.displayName.localeCompare(b.displayName, 'tr');
  });
}

export async function listAllModels({ forceRefresh = false } = {}) {
  const getModels = getPuterModelListApi();
  if (!getModels) {
    return { ok: false, error: makeCatalogError('UNKNOWN', false, { reason: 'PUTER_MODEL_LIST_UNAVAILABLE' }) };
  }

  if (!forceRefresh && cache.models && (now() - cache.fetchedAt) < CACHE_TTL_MS) {
    return { ok: true, models: cache.models, fromCache: true };
  }

  try {
    const response = await getModels();
    const rawList = Array.isArray(response) ? response : (response?.models || []);
    const models = rawList.map(normalizeModel).filter((item) => Boolean(item.id));
    cache = { models, fetchedAt: now() };
    return { ok: true, models, fromCache: false };
  } catch (error) {
    const message = String(error?.message || '').toLowerCase();
    if (message.includes('auth') || message.includes('401')) return { ok: false, error: makeCatalogError('AUTH_REQUIRED', false, error) };
    if (message.includes('timeout')) return { ok: false, error: makeCatalogError('TIMEOUT', true, error) };
    if (message.includes('network') || message.includes('fetch')) return { ok: false, error: makeCatalogError('NETWORK', true, error) };
    return { ok: false, error: makeCatalogError('UNKNOWN', true, error) };
  }
}

export async function listModelsByMode(mode, { forceRefresh = false } = {}) {
  const all = await listAllModels({ forceRefresh });
  if (!all.ok) return all;
  return {
    ok: true,
    models: all.models.filter((model) => model.modes.includes(mode)),
    fromCache: all.fromCache,
  };
}

export function getDefaultModelForMode(mode, models = []) {
  if (!Array.isArray(models) || models.length === 0) return null;

  if (mode === 'chat') {
    return pickByPriority(models, 'openai', ['gpt'])
      || pickByPriority(models, 'google', ['gemini'])
      || pickByPriority(models, 'anthropic', ['claude'])
      || pickByPriority(models, 'deepseek')
      || models[0];
  }

  if (mode === 'code') {
    return models.find((model) => /coder|code|devstral/.test(model.id.toLowerCase())) || getDefaultModelForMode('chat', models);
  }

  return models[0];
}

export function getFeaturedModels(mode, models = []) {
  if (!Array.isArray(models) || models.length === 0) return [];
  if (mode !== 'chat') return models.slice(0, 5);
  return buildFeaturedChatModels(models);
}

export function searchModels(models = [], query = '') {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return models;

  return models.filter((model) => (
    model.displayName.toLowerCase().includes(q)
    || model.provider.toLowerCase().includes(q)
    || model.id.toLowerCase().includes(q)
  ));
}

export function sortCatalogModels(mode, models = []) {
  if (mode !== 'chat') return sortModels(models);
  const featuredIds = getFeaturedModels('chat', models).map((model) => model.id);
  return sortModels(models, featuredIds);
}

export async function fetchModelCatalog(options = {}) {
  const result = await listAllModels(options);
  if (!result.ok) {
    return {
      items: [],
      fetchedAt: now(),
      error: result.error,
    };
  }

  return {
    items: result.models.map((model) => ({
      id: model.id,
      name: model.displayName,
      modeSupport: model.modes,
      priceHints: model.priceHint?.usdText || null,
      logoKey: model.logoKey,
      isLocked: model.isLocked,
    })),
    fetchedAt: now(),
    error: null,
  };
}
