// Puter model kataloğunu runtime'da çekip mode bazlı filtreler.

const CACHE_TTL_MS = 5 * 60 * 1000;

let cache = { models: null, fetchedAt: 0 };

function now() {
  return Date.now();
}

function getPuterModelListApi() {
  if (typeof puter === 'undefined' || !puter?.ai) return null;
  if (typeof puter.ai.listModels === 'function') return () => puter.ai.listModels();
  return null;
}

function mapProvider(id = '') {
  return String(id).split('/')[0] || 'unknown';
}

function inferModes(raw) {
  const id = String(raw?.id || raw?.model || '').toLowerCase();
  const tags = Array.isArray(raw?.tags) ? raw.tags.map((tag) => String(tag).toLowerCase()) : [];
  const kind = String(raw?.type || raw?.kind || '').toLowerCase();

  const has = (needle) => id.includes(needle) || tags.some((tag) => tag.includes(needle)) || kind.includes(needle);

  const modes = new Set();
  if (has('video') || has('txt2vid') || has('vidu')) modes.add('video');
  if (has('speech') || has('tts') || has('voice')) modes.add('tts');
  if (has('image') || has('img')) modes.add('image');
  if (has('dubbing') || has('speech2speech') || has('voice-changer')) modes.add('dubbing');

  // Text modeli varsayılan olarak chat kabul edilir.
  if (modes.size === 0 || has('chat') || has('text') || has('gpt') || has('gemini') || has('claude') || has('deepseek')) {
    modes.add('chat');
  }

  if (has('code') || has('coder') || has('devstral')) {
    modes.add('code');
    modes.add('chat');
  }

  return [...modes];
}

function providerLogoKey(provider = '') {
  const p = provider.toLowerCase();
  if (p === 'openai') return 'GPT';
  if (p === 'google') return 'GEMINI';
  if (p === 'anthropic') return 'CLAUDE';
  if (p === 'deepseek') return 'DEEPSEEK';
  return p.toUpperCase();
}

function normalizeModel(raw) {
  const id = raw?.id || raw?.model;
  const provider = mapProvider(id);
  return {
    id,
    displayName: raw?.displayName || raw?.name || id,
    provider,
    modes: inferModes(raw),
    isLocked: Boolean(raw?.isLocked || raw?.locked),
    priceHint: raw?.priceHint || null,
    logoKey: providerLogoKey(provider),
  };
}

function selectFeaturedChat(models) {
  const pickByProvider = (provider, includes = []) => models.find((m) => m.provider === provider && includes.every((k) => m.id.toLowerCase().includes(k)));
  const pickFirstByProvider = (provider) => models.find((m) => m.provider === provider);

  const picks = [
    pickByProvider('openai', ['gpt']) || pickFirstByProvider('openai'),
    pickByProvider('google', ['gemini']) || pickFirstByProvider('google'),
    pickByProvider('anthropic', ['claude']) || pickFirstByProvider('anthropic'),
    pickByProvider('deepseek', []) || pickFirstByProvider('deepseek'),
    models.find((m) => m.provider === 'openai' && /mini|flash|light|fast/.test(m.id.toLowerCase())) || pickFirstByProvider('openai'),
  ].filter(Boolean);

  const uniq = [];
  const seen = new Set();
  picks.forEach((item) => {
    if (!seen.has(item.id) && uniq.length < 5) {
      seen.add(item.id);
      uniq.push(item);
    }
  });

  for (const item of models) {
    if (uniq.length >= 5) break;
    if (!seen.has(item.id)) {
      seen.add(item.id);
      uniq.push(item);
    }
  }

  return uniq;
}

function filterByMode(models, mode) {
  return models.filter((model) => model.modes.includes(mode));
}

function makeCatalogError(code, retryable, details = null) {
  return {
    code,
    messageKey: `modelCatalog.error.${code.toLowerCase()}`,
    retryable,
    ts: now(),
    details,
  };
}

export async function listAllModels({ forceRefresh = false } = {}) {
  const api = getPuterModelListApi();
  if (!api) {
    return { ok: false, error: makeCatalogError('NOT_SUPPORTED', false, { reason: 'PUTER_MODEL_LIST_API_MISSING' }) };
  }

  if (!forceRefresh && cache.models && (now() - cache.fetchedAt) < CACHE_TTL_MS) {
    return { ok: true, models: cache.models, fromCache: true };
  }

  try {
    const raw = await api();
    const inputList = Array.isArray(raw) ? raw : (raw?.models || []);
    const models = inputList.map(normalizeModel).filter((m) => Boolean(m.id));
    cache = { models, fetchedAt: now() };
    return { ok: true, models, fromCache: false };
  } catch (error) {
    const msg = String(error?.message || '').toLowerCase();
    if (msg.includes('network') || msg.includes('fetch')) return { ok: false, error: makeCatalogError('NETWORK', true, error) };
    if (msg.includes('timeout')) return { ok: false, error: makeCatalogError('TIMEOUT', true, error) };
    return { ok: false, error: makeCatalogError('UNKNOWN', true, error) };
  }
}

export async function listModelsByMode(mode, { forceRefresh = false } = {}) {
  const all = await listAllModels({ forceRefresh });
  if (!all.ok) return all;
  return { ok: true, models: filterByMode(all.models, mode) };
}

export function getDefaultModelForMode(mode, models = []) {
  if (!models.length) return null;

  if (mode === 'chat') {
    return models.find((m) => m.provider === 'openai' && m.id.toLowerCase().includes('gpt'))
      || models.find((m) => m.provider === 'google' && m.id.toLowerCase().includes('gemini'))
      || models.find((m) => m.provider === 'anthropic' && m.id.toLowerCase().includes('claude'))
      || models.find((m) => m.provider === 'deepseek')
      || models[0];
  }

  if (mode === 'code') {
    return models.find((m) => /coder|code|devstral/.test(m.id.toLowerCase())) || models[0];
  }

  return models[0];
}

export function getFeaturedModels(mode, models = []) {
  if (mode === 'chat') return selectFeaturedChat(models);
  return models.slice(0, 5);
}

export function searchModels(models = [], query = '') {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return models;
  return models.filter((model) => model.displayName.toLowerCase().includes(q)
    || model.provider.toLowerCase().includes(q)
    || model.id.toLowerCase().includes(q));
}

export async function fetchModelCatalog(options = {}) {
  // Geriye dönük uyum: admin slice bu fonksiyonu çağırıyor.
  const result = await listAllModels(options);
  if (!result.ok) {
    return { items: [], fetchedAt: now(), error: result.error };
  }

  return {
    items: result.models.map((model) => ({
      id: model.id,
      name: model.displayName,
      modeSupport: model.modes,
      priceHints: model.priceHint?.usdText || null,
      logoKey: model.logoKey,
    })),
    fetchedAt: now(),
    error: null,
  };
}
