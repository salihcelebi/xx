/**
 * kame-ui.js
 * - DELİL2: app.py’ye dokunmadan çalışacak şekilde “frontend-only” tasarım.
 * - Puter SDK global: window.puter beklenir.
 * - Hata yönetimi: UI kırılmaz, status satırı bilgilendirir.
 */

/* -------------------------
   0) UI yardımcıları
------------------------- */
function $(id) { return document.getElementById(id); } // DELİL11: tek noktadan DOM erişimi

function ensurePlaceholders() { // DELİL12: placeholder doğrulama (somut ispat: eksik ID yazdırır)
  const required = [
    "kame-badge","mode-badge","topbar-right","model-picker",
    "tools-menu","kame-hint","billing-link","global-status",
    "message-input","send-btn","chat"
  ];
  for (const id of required) {
    if (!$(id)) throw new Error(`UI placeholder eksik: #${id}`);
  }
}

function setGlobalStatus(text) { $("global-status").textContent = String(text ?? ""); } // DELİL6

function setKameBadge(score) { $("kame-badge").textContent = `KAME: ${Number(score).toFixed(3)}`; } // DELİL4
function setModeBadge(emoji) { $("mode-badge").textContent = String(emoji ?? ""); } // DELİL4

function mountAdminIndicator(isAdmin) { // DELİL13: admin göstergesi index’te değil JS ile eklenir
  if (!isAdmin) return;
  const el = document.createElement("span");
  el.id = "admin-test-indicator";
  el.textContent = "🧪 TEST";
  $("topbar-right").appendChild(el);
}

function renderModelPickerAuto(catalog) { // DELİL7: AUTO slot + paket uygun model listesi
  const picker = $("model-picker");
  picker.innerHTML = `
    <label>
      <input type="radio" name="model" value="AUTO" checked />
      Otomatik (KAME) — AUTO
    </label>
    <div class="available-models"></div>
  `;
  const list = picker.querySelector(".available-models");
  list.textContent = `Paket uygun modeller: ${catalog.ids.slice(0, 8).join(", ")}${catalog.ids.length > 8 ? "..." : ""}`;
}

function setKameHint({ mode, model, risk, cost, roi }) { // DELİL9: maliyet/kalite uyarısı
  $("kame-hint").textContent = `mode=${mode} model=${model ?? "-"} risk=${risk.toFixed(2)} cost≈${cost} ROI≈${roi.toFixed(2)}x`;
}

function attachFeedbackButtons(container) { // DELİL14: meme sinyali toplayacak butonlar
  const tb = document.createElement("div");
  tb.className = "assistant-toolbar";
  tb.innerHTML = `
    <button data-fb="up">👍</button>
    <button data-fb="down">👎</button>
    <button data-fb="complaint">Şikayet Et</button>
  `;
  container.appendChild(tb);
}

/* -------------------------
   1) Model stratejisi
------------------------- */
const MODEL_GROUPS = { // DELİL15: gerçek model ID’leri sabit listelerde
  M0: [
    "openai/gpt-4.1-nano",
    "openai/gpt-4o-mini",
    "mistralai/mistral-small-24b-instruct-2501",
  ],
  Mmid: [
    "openai/gpt-4.1-mini",
    "mistralai/mistral-small-3.2-24b-instruct",
  ],
  M1: [
    "deepseek/deepseek-r1",
    "deepseek/deepseek-reasoner",
    "x-ai/grok-4",
  ],
  Mcode: [
    "openai/gpt-5.1-codex-mini",
    "openai/gpt-5.1-codex-max",
  ],
};

async function listAvailableModels(puter, packageName) { // DELİL16: listModels + paket filtresi
  const all = await puter.ai.listModels();
  const normalize = (m) => (typeof m === "string" ? m : m?.id);
  const idsAll = (all ?? []).map(normalize).filter(Boolean);

  function allowByPackage(id) {
    if (packageName === "free") {
      return id.includes("nano") || id.includes("mini") || id.includes("mistral-small");
    }
    return true;
  }

  const ids = idsAll.filter(allowByPackage);
  return { ids, has: (id) => ids.includes(id) };
}

function pickFirstAvailable(catalog, candidates) { // DELİL16: fallback zinciri destekler
  for (const id of candidates) if (catalog.has(id)) return id;
  return null;
}

/* -------------------------
   2) Mode/Risk/Meme
------------------------- */
function detectMode(text) { // DELİL17: mode tespiti
  const t = (text ?? "").toLowerCase();
  if (t.includes("video üret") || t.includes("txt2vid") || t.includes("video")) return "video";
  if (t.includes("görsel üret") || t.includes("txt2img") || t.includes("image") || t.includes("resim")) return "image";
  if (t.includes("ses üret") || t.includes("oku") || t.includes("tts") || t.includes("txt2speech")) return "tts";
  if (t.includes("ses yazıya") || t.includes("stt") || t.includes("speech2txt") || t.includes("transcribe")) return "stt";
  if (t.includes("dublaj") || t.includes("dubbing") || t.includes("speech2speech")) return "dubbing";
  if (t.includes("kod üret") || t.includes("refactor") || t.includes("bug") || t.includes("hata ayıkla")) return "code";
  return "chat";
}

function wordCount(text) { return String(text ?? "").trim().split(/\s+/).filter(Boolean).length; } // DELİL18
function clamp01(x) { return Math.max(0, Math.min(1, Number(x))); } // DELİL19
function sigmoid(x) { return 1 / (1 + Math.exp(-Number(x))); } // DELİL19

function computeRisk(text) { // DELİL18: hızlı risk hesabı
  const t = text ?? "";
  const W = wordCount(t);
  let risk = 0.20;

  if (W > 100) risk += 0.20;
  if (/(stack trace|exception|error|bug|refactor|log|hata|debug|trace)/i.test(t)) risk += 0.20;
  if (/(adım|kural|zorunlu|mutlaka|şart|constraint|requirements)/i.test(t)) risk += 0.20;
  if (/(ödeme|para|fatura|hukuk|legal|güvenlik|security|kvkk|gdpr|pii)/i.test(t)) risk += 0.20;

  return clamp01(risk);
}

function signalDelta(type) { // DELİL20: meme sinyali delta
  if (type === "up") return +0.25;
  if (type === "down") return -0.25;
  if (type === "complaint") return -0.35;
  return 0;
}

function computeMeme(signals) { // DELİL20
  let sum = 0;
  for (const s of signals) sum += signalDelta(s);
  return clamp01(0.50 + sum);
}

/* -------------------------
   3) ROI/KAME
------------------------- */
function computeKAM(R, Cost) { return Number(R) - Number(Cost); } // DELİL21
function computeROI(KAM, Cost, minCost = 0.01) { // DELİL21
  const denom = Math.max(Number(Cost), Number(minCost));
  return Number(KAM) / denom;
}

function computePenalty({ packageViolation, risk, pickedCheapModel, retryCount, meme }) { // DELİL21
  let p = 0;
  if (packageViolation) p += 1.0;
  if (risk > 0.75 && pickedCheapModel) p += 0.10;
  if (retryCount > 1) p += 0.10;
  if (meme < 0.25) p += 0.15;
  return clamp01(p);
}

function computeKAME({ R, Cost, meme, alpha = 0.60, scale = 25, penalty = 0 }) { // DELİL21
  const KAM = computeKAM(R, Cost);
  const normKAM = sigmoid(KAM / scale);
  return (alpha * normKAM) + ((1 - alpha) * clamp01(meme)) - Number(penalty);
}

function baselineVsOptimize() { // DELİL22: örnek senaryo hesapları
  const R = 100;

  const base = { Cost: 30, meme: 0.62, penalty: 0.05 };
  const opt  = { Cost: 18, meme: 0.74, penalty: 0.03 };

  const KAM_base = computeKAM(R, base.Cost);
  const ROI_base = computeROI(KAM_base, base.Cost);
  const KAME_base = computeKAME({ R, Cost: base.Cost, meme: base.meme, penalty: base.penalty });

  const KAM_opt = computeKAM(R, opt.Cost);
  const ROI_opt = computeROI(KAM_opt, opt.Cost);
  const KAME_opt = computeKAME({ R, Cost: opt.Cost, meme: opt.meme, penalty: opt.penalty });

  return {
    baseline: { R, ...base, KAM: KAM_base, ROI: ROI_base, KAME: KAME_base },
    optimize: { R, ...opt,  KAM: KAM_opt,  ROI: ROI_opt,  KAME: KAME_opt },
    delta: { KAM: KAM_opt - KAM_base, ROI: ROI_opt - ROI_base, KAME: KAME_opt - KAME_base }
  };
}

/* -------------------------
   4) Seçim + Upgrade + Cost
------------------------- */
function isCheapModel(modelId) { // DELİL23
  const id = modelId ?? "";
  return id.includes("nano") || id.includes("mini") || id.includes("mistral-small");
}

function pickByRules({ mode, risk, catalog }) { // DELİL24: mode bazlı IF/ELSE
  if (mode === "chat") {
    if (risk <= 0.45) return { model: pickFirstAvailable(catalog, MODEL_GROUPS.M0) };
    if (risk <= 0.70) return { model: pickFirstAvailable(catalog, MODEL_GROUPS.Mmid) };
    return { model: pickFirstAvailable(catalog, MODEL_GROUPS.M1) };
  }
  if (mode === "code") return { model: (risk <= 0.55 ? "openai/gpt-5.1-codex-mini" : "openai/gpt-5.1-codex-max") };
  if (mode === "video") return { model: (risk > 0.70 ? "sora-2-pro" : "sora-2"), seconds: 8 };
  if (mode === "image") return { provider: "openai-image-generation", quality: (risk > 0.70 ? "high" : undefined) };
  if (mode === "tts") return { language: "tr-TR", engine: (risk > 0.70 ? "neural" : "standard") };
  if (mode === "stt") return { model: "gpt-4o-mini-transcribe" };
  if (mode === "dubbing") return { voiceId: (window.__DUB_VOICE_ID__ ?? "default-voice") };
  return { model: pickFirstAvailable(catalog, MODEL_GROUPS.M0) };
}

function maybeUpgrade({ mode, catalog, chosen }) { // DELİL25: 1 kez yükseltme
  if (mode === "chat") {
    const up = pickFirstAvailable(catalog, MODEL_GROUPS.M1);
    if (up && up !== chosen.model) return { ...chosen, model: up };
  }
  if (mode === "code" && chosen.model !== "openai/gpt-5.1-codex-max") return { ...chosen, model: "openai/gpt-5.1-codex-max" };
  if (mode === "video" && chosen.model !== "sora-2-pro") return { ...chosen, model: "sora-2-pro" };
  if (mode === "image" && chosen.quality !== "high") return { ...chosen, quality: "high" };
  if (mode === "tts" && chosen.engine !== "neural") return { ...chosen, engine: "neural" };
  return null;
}

function estimateCost({ mode, model, risk, W }) { // DELİL26: deterministik maliyet tahmini
  const base = (mode === "video") ? 8 : (mode === "image") ? 3 : (mode === "tts") ? 2 : (mode === "stt") ? 4 : 1;
  const modelMult =
    String(model ?? "").includes("reasoner") ? 3.0 :
    String(model ?? "").includes("r1") ? 2.8 :
    String(model ?? "").includes("codex-max") ? 2.5 :
    String(model ?? "").includes("mini") ? 1.2 :
    String(model ?? "").includes("nano") ? 1.0 : 1.5;

  const riskMult = 1 + (risk * 0.5);
  const lengthMult = 1 + Math.min(W / 400, 1) * 0.5;
  return Number((base * modelMult * riskMult * lengthMult).toFixed(2));
}

/* -------------------------
   5) Puter çağrıları (fonksiyon)
------------------------- */
async function runChat({ puter, model, messages, testMode, onChunk }) { // DELİL27
  try {
    const res = await puter.ai.chat({
      model,
      messages,
      testMode,
      stream: Boolean(onChunk),
      onToken: onChunk,
    });
    return { text: res?.text ?? res?.output ?? String(res ?? "") };
  } catch (e) {
    throw new Error(`chat hata: ${e?.message ?? "unknown"}`);
  }
}

async function runTxt2Vid({ puter, model, prompt, seconds, testMode }) { // DELİL28
  try { return await puter.ai.txt2vid({ model, prompt, seconds, testMode }); }
  catch (e) { throw new Error(`video hata: ${e?.message ?? "unknown"}`); }
}

async function runTxt2Img({ puter, provider, prompt, quality, testMode }) { // DELİL29
  try {
    return await puter.ai.txt2img({ provider, prompt, options: quality ? { quality } : undefined, testMode });
  } catch (e) {
    throw new Error(`image hata: ${e?.message ?? "unknown"}`);
  }
}

async function runTTS({ puter, text, language, engine, voice, testMode }) { // DELİL30
  try { return await puter.ai.txt2speech({ text, language, engine, voice, testMode }); }
  catch (e) { throw new Error(`tts hata: ${e?.message ?? "unknown"}`); }
}

async function runSTT({ puter, audio, model, diarize, testMode }) { // DELİL31
  try {
    return await puter.ai.speech2txt({ audio, model, options: diarize ? { diarize: true } : undefined, testMode });
  } catch (e) {
    throw new Error(`stt hata: ${e?.message ?? "unknown"}`);
  }
}

async function runDubbing({ puter, audio, voiceId, stability, similarity, testMode }) { // DELİL32
  try {
    return await puter.ai.speech2speech({ audio, voiceId, options: { stability, similarity }, testMode });
  } catch (e) {
    throw new Error(`dubbing hata: ${e?.message ?? "unknown"}`);
  }
}

/* -------------------------
   6) KAME ENGINE
------------------------- */
function normalize(s) { return String(s ?? "").trim().toLowerCase().replace(/\s+/g, " "); } // DELİL33

async function executeOnce({ puter, isAdmin, mode, chosen, userText }) { // DELİL34
  const testMode = Boolean(isAdmin); // Somut ispat: admin -> testMode true

  if (mode === "chat" || mode === "code") {
    const messages = [
      { role: "system", content: "Kısa ve net yanıt ver." },
      { role: "user", content: userText },
    ];
    const res = await runChat({ puter, model: chosen.model, messages, testMode });
    return res.text;
  }

  if (mode === "video") {
    const res = await runTxt2Vid({ puter, model: chosen.model, prompt: userText, seconds: chosen.seconds ?? 8, testMode });
    return `Video hazır: ${String(res?.url ?? res?.id ?? "ok")}`;
  }

  if (mode === "image") {
    const res = await runTxt2Img({ puter, provider: chosen.provider, prompt: userText, quality: chosen.quality, testMode });
    return `Görsel hazır: ${String(res?.url ?? res?.id ?? "ok")}`;
  }

  if (mode === "tts") {
    const res = await runTTS({ puter, text: userText, language: chosen.language, engine: chosen.engine, testMode });
    return `Ses hazır: ${String(res?.url ?? res?.id ?? "ok")}`;
  }

  if (mode === "stt") {
    const audio = window.__LAST_AUDIO_BLOB__;
    if (!audio) throw new Error("STT için audio bulunamadı."); // Beklenmeyen durum açıklaması
    const res = await runSTT({ puter, audio, model: chosen.model, diarize: false, testMode });
    return `Transkript: ${String(res?.text ?? res?.output ?? "ok")}`;
  }

  if (mode === "dubbing") {
    const audio = window.__LAST_AUDIO_BLOB__;
    if (!audio) throw new Error("Dublaj için audio bulunamadı.");
    const res = await runDubbing({ puter, audio, voiceId: chosen.voiceId, testMode });
    return `Dublaj hazır: ${String(res?.url ?? res?.id ?? "ok")}`;
  }

  throw new Error(`Bilinmeyen mode: ${mode}`);
}

async function createKameEngine({ packageName, isAdmin, isKameEnabled }) { // DELİL35
  const puter = window.puter;
  if (!puter?.ai?.listModels) throw new Error("puter.ai.listModels yok; Puter SDK eksik.");

  const catalog = await listAvailableModels(puter, packageName);
  renderModelPickerAuto(catalog);

  const memeSignals = [];
  let lastUserText = null;

  function recordMemeSignal(type) { memeSignals.push(type); } // DELİL20

  async function run(userText) {
    const enabled = Boolean(isKameEnabled?.());
    const mode = detectMode(userText);
    const W = wordCount(userText);
    const risk = computeRisk(userText);

    setModeBadge(enabled ? "⚡" : "🧪");
    setGlobalStatus("KAME seçiyor...");

    const chosen = enabled ? pickByRules({ mode, risk, catalog }) : pickByRules({ mode: "chat", risk: 0.2, catalog });
    const packageViolation = chosen?.model ? !catalog.has(chosen.model) : false;

    const meme = computeMeme(memeSignals);
    const Cost = estimateCost({ mode, model: chosen.model, risk, W });
    const R = 100;

    let retryCount = 0;
    let outputText = null;

    try {
      retryCount++;
      outputText = await executeOnce({ puter, isAdmin, mode, chosen, userText });

      // DELİL25: meme düşükse sadece 1 kez yükselt
      if (meme < 0.75) {
        const up = maybeUpgrade({ mode, catalog, chosen });
        if (up) {
          retryCount++;
          outputText = await executeOnce({ puter, isAdmin, mode, chosen: up, userText });
        }
      }
    } catch (e) {
      outputText = `Hata: ${e?.message ?? "Bilinmeyen"}`; // UI kırılmasın
    }

    // Aynı mesaj tekrar proxy (meme -0.25): somut kural
    if (lastUserText && normalize(lastUserText) === normalize(userText)) memeSignals.push("down");
    lastUserText = userText;

    const penalty = computePenalty({
      packageViolation,
      risk,
      pickedCheapModel: isCheapModel(chosen?.model),
      retryCount,
      meme
    });

    const KAM = computeKAM(R, Cost);
    const ROI = computeROI(KAM, Cost);
    const KAME = computeKAME({ R, Cost, meme, penalty });

    setKameBadge(KAME);
    setKameHint({ mode, model: chosen.model, risk, cost: Cost, roi: ROI });

    setGlobalStatus("Hazır");
    return { outputText, debug: { mode, W, risk, meme, R, Cost, KAM, ROI, KAME, chosen, penalty, retryCount } };
  }

  return { run, recordMemeSignal };
}

/* -------------------------
   7) APP BOOTSTRAP (APP.PY DOKUNMADAN)
------------------------- */
(async function main() {
  try {
    ensurePlaceholders(); // DELİL12
    setKameBadge("--");   // DELİL4
    setModeBadge("⚡");    // DELİL4

    const packageName = window.__USER_PACKAGE__ ?? "free";
    const isAdmin = Boolean(window.__IS_ADMIN__);
    mountAdminIndicator(isAdmin); // DELİL13

    const isKameEnabled = () => document.querySelector('[data-tool="kame"]')?.checked ?? true;

    const engine = await createKameEngine({ packageName, isAdmin, isKameEnabled });

    // DELİL7: tüm feedback click’lerini engine’e bağla
    document.addEventListener("click", (e) => {
      const btn = e.target?.closest?.("[data-fb]");
      if (!btn) return;
      engine.recordMemeSignal(btn.getAttribute("data-fb"));
    });

    // Gönder butonu
    $("send-btn").addEventListener("click", async () => {
      const input = $("message-input");
      const text = (input.value || "").trim();
      if (!text) return;

      const chat = $("chat");

      const userMsg = document.createElement("div");
      userMsg.className = "msg user";
      userMsg.textContent = text;
      chat.appendChild(userMsg);

      input.value = "";

      setGlobalStatus("Çalışıyor...");
      const result = await engine.run(text);

      const botMsg = document.createElement("div");
      botMsg.className = "msg assistant";
      botMsg.textContent = result.outputText ?? "(boş yanıt)";
      attachFeedbackButtons(botMsg); // DELİL14
      chat.appendChild(botMsg);
    });

    // Opsiyonel: baseline vs optimize konsola yaz (kanıt amaçlı)
    console.log("ROI demo:", baselineVsOptimize()); // DELİL22

    setGlobalStatus("Hazır");

  } catch (err) {
    console.error("[kame-ui] fatal:", err);
    setGlobalStatus("Hata: " + (err?.message ?? "Bilinmeyen"));
  }
})();

/* 10 kelime: "app.py değişmeden çalışır; index ayrı, kame-ui.js ayrı yüklendi." */
