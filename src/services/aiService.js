// Gereksinim 1: Puter/AI çağrıları yalnızca service katmanından geçer.
// NISAI.MD'de netleştir: Gerçek router API ve Puter SDK import yöntemi.

const modelCache = new Map();

export async function listModelsWithCache(mode) {
  const key = `models:${mode}`;
  const now = Date.now();
  const hit = modelCache.get(key);
  // Gereksinim B18: model listesi cache hook'u (TTL netleştirme notu ile).
  if (hit && now - hit.timestamp < 60_000) {
    return hit.data;
  }

  // NISAI.MD'de netleştir: puter.ai.listModels() parametreleri ve provider filtreleri.
  const data = [
    { id: `${mode}-fast`, label: `${mode.toUpperCase()} Fast`, unitCost: '$0.01' },
    { id: `${mode}-pro`, label: `${mode.toUpperCase()} Pro`, unitCost: '$0.08' },
  ];

  modelCache.set(key, { data, timestamp: now });
  return data;
}

export async function generateByMode(mode, payload) {
  // Gereksinim B14/B17: sayfa bazlı generate komutu bu service üstünden tek kapıdan yürür.
  if (mode === 'video') {
    // NISAI.MD'de netleştir: txt2vid options ve queue/cancel davranışı.
    return { jobId: crypto.randomUUID(), status: 'queued', payload };
  }

  // NISAI.MD'de netleştir: chat completion API alanları.
  return { id: crypto.randomUUID(), status: 'ok', text: 'Demo yanıtı' };
}
