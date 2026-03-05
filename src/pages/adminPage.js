import { listAllModels } from '../services/modelCatalog.js';
import { policyActions, publishPolicyEffect, savePolicyDraftEffect } from '../store/slices/policySlice.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function modeOptions() {
  return ['chat', 'video', 'image', 'tts', 'dubbing', 'code'];
}

export async function render({ store }) {
  const isAdmin = store.getState().app.userRole === 'admin';
  if (!isAdmin) {
    return '<section class="content-grid"><article class="card">Bu sayfaya erişim izniniz yok.</article></section>';
  }

  const modelsResult = await listAllModels();
  const models = modelsResult.ok ? modelsResult.models : [];
  const state = store.getState();
  const selectedPackage = state.policy?.selectedPackage || 'free';
  let activeMode = 'chat';
  let draft = clone(state.policy?.draftPolicy || state.policy?.activePolicy);

  const root = document.createElement('section');
  root.className = 'content-grid';

  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    <h2>Admin / Policy Editörü</h2>
    <p>Paket + mod + model allow-list yönetimi (Türkçe).</p>
    <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
      <select id="policy-package">
        <option value="free">free</option>
        <option value="pro">pro</option>
        <option value="enterprise">enterprise</option>
      </select>
      <select id="policy-mode">${modeOptions().map((mode) => `<option value="${mode}">${mode}</option>`).join('')}</select>
      <input id="policy-search" placeholder="Model ara (id/provider/ad)" />
      <button id="policy-save" type="button">Taslağı Kaydet</button>
      <button id="policy-publish" type="button">Yayınla</button>
    </div>
    <div id="policy-hint" style="font-size:12px; color:#6b7280; margin-bottom:8px;"></div>
    <div id="policy-list" style="display:grid; gap:6px; max-height:420px; overflow:auto;"></div>
    <h3 style="margin-top:12px;">Admin Teknik Log</h3>
    <div id="policy-log" style="font-size:12px; background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:8px; max-height:180px; overflow:auto;"></div>
  `;

  root.append(card);

  const packageSelect = card.querySelector('#policy-package');
  const modeSelect = card.querySelector('#policy-mode');
  const searchInput = card.querySelector('#policy-search');
  const listEl = card.querySelector('#policy-list');
  const hintEl = card.querySelector('#policy-hint');
  const logEl = card.querySelector('#policy-log');
  packageSelect.value = selectedPackage;


  const renderLogs = () => {
    const logs = store.getState().admin?.logs || [];
    if (!logs.length) {
      logEl.textContent = 'Henüz log yok.';
      return;
    }
    logEl.innerHTML = logs.slice(-12).reverse().map((item) => (`<div>[${new Date(item.ts).toLocaleTimeString('tr-TR')}] <strong>${item.level}</strong> ${item.code} - ${item.message}</div>`)).join('');
  };

  const renderList = () => {
    const q = searchInput.value.trim().toLowerCase();
    const pkg = packageSelect.value;
    const allowList = new Set(draft.packages?.[pkg]?.[activeMode]?.allowList || []);

    const items = models
      .filter((model) => model.modes.includes(activeMode))
      .filter((model) => !q || model.id.toLowerCase().includes(q) || model.provider.toLowerCase().includes(q) || model.displayName.toLowerCase().includes(q));

    hintEl.textContent = `${pkg}/${activeMode} için ${items.length} model listelendi. Seçilen: ${allowList.size}`;
    listEl.innerHTML = '';

    items.forEach((model) => {
      const row = document.createElement('label');
      row.style.display = 'flex';
      row.style.gap = '8px';
      row.style.alignItems = 'center';
      row.style.border = '1px solid #e5e7eb';
      row.style.borderRadius = '8px';
      row.style.padding = '8px';

      const check = document.createElement('input');
      check.type = 'checkbox';
      check.checked = allowList.has(model.id);
      check.addEventListener('change', () => {
        const next = new Set(draft.packages?.[pkg]?.[activeMode]?.allowList || []);
        if (check.checked) next.add(model.id);
        else next.delete(model.id);
        draft.packages[pkg][activeMode].allowList = [...next];
      });

      const text = document.createElement('span');
      text.textContent = `${model.displayName} (${model.provider})${model.isLocked ? ' 🔒' : ''}`;
      row.append(check, text);
      listEl.append(row);
    });
    renderLogs();
  };

  packageSelect.addEventListener('change', () => {
    store.dispatch(policyActions.setSelectedPackage(packageSelect.value));
    renderList();
  });

  modeSelect.addEventListener('change', () => {
    activeMode = modeSelect.value;
    renderList();
  });

  searchInput.addEventListener('input', renderList);

  card.querySelector('#policy-save').addEventListener('click', () => {
    store.dispatch(policyActions.setDraftPolicy(clone(draft)));
    const result = savePolicyDraftEffect({ dispatch: store.dispatch, getState: store.getState }, clone(draft));
    hintEl.textContent = result.ok ? 'Taslak kaydedildi.' : `Hata: ${result.error}`;
    renderLogs();
  });

  card.querySelector('#policy-publish').addEventListener('click', () => {
    store.dispatch(policyActions.setDraftPolicy(clone(draft)));
    const result = publishPolicyEffect({ dispatch: store.dispatch, getState: store.getState }, clone(draft));
    hintEl.textContent = result.ok ? 'Policy yayınlandı. Model filtreleri canlı güncellendi.' : `Yayın hatası: ${result.error}`;
    renderLogs();
  });

  renderList();
  return root;
}
