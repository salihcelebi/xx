import { isAdminLoggedIn, getTestMode } from '../config/admin.js';

const modelCache = new Map();

// Test modu kararı: manuel override > admin toggle > false
export function resolveTestMode(options = {}) {
  if (typeof options.testMode === 'boolean') return options.testMode;
  if (!isAdminLoggedIn) return false;
  return !!getTestMode();
}

export async function listModelsWithCache(mode) {
  const key = `models:${mode}`;
  const now = Date.now();
  const hit = modelCache.get(key);
  if (hit && now - hit.timestamp < 60_000) return hit.data;

  if (typeof puter !== 'undefined' && puter?.ai?.listModels) {
    const raw = await puter.ai.listModels();
    const items = (Array.isArray(raw) ? raw : raw?.models || [])
      .filter((model) => String(model?.id || model?.model || '').toLowerCase().includes(mode));
    modelCache.set(key, { data: items, timestamp: now });
    return items;
  }

  const fallback = [
    { id: `${mode}-fast`, label: `${mode.toUpperCase()} Fast`, unitCost: '$0.01' },
    { id: `${mode}-pro`, label: `${mode.toUpperCase()} Pro`, unitCost: '$0.08' },
  ];
  modelCache.set(key, { data: fallback, timestamp: now });
  return fallback;
}

export async function generateChat(promptOrMessages, options = {}) {
  const testMode = resolveTestMode(options);
  const opts = { ...options };
  delete opts.testMode;
  return puter.ai.chat(promptOrMessages, testMode, opts);
}

export async function streamChat(promptOrMessages, options = {}) {
  const testMode = resolveTestMode(options);
  const opts = { ...options, stream: true };
  delete opts.testMode;
  return puter.ai.chat(promptOrMessages, testMode, opts);
}

export async function generateVideo(prompt, options = {}) {
  const testMode = resolveTestMode(options);
  const opts = { ...options };
  delete opts.testMode;
  if (Object.keys(opts).length > 0) {
    return puter.ai.txt2vid({ prompt, ...opts, test_mode: testMode });
  }
  return puter.ai.txt2vid(prompt, testMode);
}

export async function generateImage(prompt, options = {}) {
  const testMode = resolveTestMode(options);
  const opts = { ...options };
  delete opts.testMode;
  if (Object.keys(opts).length > 0) {
    return puter.ai.txt2img({ prompt, ...opts, test_mode: testMode });
  }
  return puter.ai.txt2img(prompt, testMode);
}

export async function generateVoice(text, options = {}) {
  const testMode = resolveTestMode(options);
  const opts = { ...options };
  delete opts.testMode;
  if (Object.keys(opts).length > 0) {
    return puter.ai.txt2speech(text, { ...opts, test_mode: testMode });
  }
  return puter.ai.txt2speech(text, testMode);
}

export async function transcribeSpeech(audioFileOrBlob, options = {}) {
  const testMode = resolveTestMode(options);
  const opts = { ...options };
  delete opts.testMode;
  if (Object.keys(opts).length > 0) {
    return puter.ai.speech2txt(audioFileOrBlob, { ...opts, test_mode: testMode });
  }
  return puter.ai.speech2txt(audioFileOrBlob, testMode);
}

export async function convertSpeech(audioFileOrBlob, options = {}) {
  const testMode = resolveTestMode(options);
  const opts = { ...options };
  delete opts.testMode;
  if (Object.keys(opts).length > 0) {
    return puter.ai.speech2speech(audioFileOrBlob, { ...opts, test_mode: testMode });
  }
  return puter.ai.speech2speech(audioFileOrBlob, testMode);
}
