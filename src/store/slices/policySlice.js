import {
  DEFAULT_POLICY,
  loadDraft,
  loadPolicy,
  publishPolicy,
  saveDraft,
  validatePolicy,
} from '../../services/policyService.js';
import { adminActions } from './adminSlice.js';


function pushAdminPolicyLog(dispatch, level, code, message, details = null) {
  dispatch(adminActions.addLog({
    level,
    code,
    message,
    details,
    ts: Date.now(),
  }));
}

export const initialPolicyState = {
  activePolicy: loadPolicy(),
  draftPolicy: loadDraft(),
  selectedPackage: 'free',
  lastError: null,
};

export const policyActions = {
  setSelectedPackage: (selectedPackage) => ({ type: 'policy/setSelectedPackage', payload: selectedPackage }),
  setDraftPolicy: (draftPolicy) => ({ type: 'policy/setDraftPolicy', payload: draftPolicy }),
  setActivePolicy: (activePolicy) => ({ type: 'policy/setActivePolicy', payload: activePolicy }),
  setError: (error) => ({ type: 'policy/setError', payload: error }),
  clearError: () => ({ type: 'policy/clearError' }),
};

export function policyReducer(state = initialPolicyState, action) {
  switch (action.type) {
    case 'policy/setSelectedPackage':
      return { ...state, selectedPackage: action.payload || 'free' };
    case 'policy/setDraftPolicy':
      return { ...state, draftPolicy: action.payload || state.draftPolicy };
    case 'policy/setActivePolicy':
      return { ...state, activePolicy: action.payload || state.activePolicy };
    case 'policy/setError':
      return { ...state, lastError: action.payload };
    case 'policy/clearError':
      return { ...state, lastError: null };
    default:
      return state;
  }
}

export function loadPolicyEffect({ dispatch }) {
  const active = loadPolicy();
  const draft = loadDraft();
  dispatch(policyActions.setActivePolicy(active));
  dispatch(policyActions.setDraftPolicy(draft));
  pushAdminPolicyLog(dispatch, 'info', 'POLICY_LOADED', 'Policy verileri yüklendi.');
}

export function savePolicyDraftEffect({ dispatch, getState }, draftPolicy) {
  const nextDraft = draftPolicy || getState().policy.draftPolicy;
  const checked = validatePolicy(nextDraft);
  if (!checked.ok) {
    dispatch(policyActions.setError(checked.reason));
    pushAdminPolicyLog(dispatch, 'error', 'POLICY_DRAFT_INVALID', 'Policy taslağı doğrulama hatası.', { reason: checked.reason });
    return { ok: false, error: checked.reason };
  }
  const result = saveDraft(nextDraft);
  if (!result.ok) {
    dispatch(policyActions.setError(result.error));
    pushAdminPolicyLog(dispatch, 'error', 'POLICY_DRAFT_SAVE_FAILED', 'Policy taslağı kaydedilemedi.', { reason: result.error });
  } else {
    dispatch(policyActions.clearError());
    pushAdminPolicyLog(dispatch, 'info', 'POLICY_DRAFT_SAVED', 'Policy taslağı kaydedildi.');
  }
  return result;
}

export function publishPolicyEffect({ dispatch, getState }, draftPolicy) {
  const nextDraft = draftPolicy || getState().policy.draftPolicy;
  const checked = validatePolicy(nextDraft);
  if (!checked.ok) {
    dispatch(policyActions.setError(checked.reason));
    pushAdminPolicyLog(dispatch, 'error', 'POLICY_PUBLISH_INVALID', 'Policy yayınlama doğrulama hatası.', { reason: checked.reason });
    return { ok: false, error: checked.reason };
  }
  const result = publishPolicy(nextDraft);
  if (!result.ok) {
    dispatch(policyActions.setError(result.error));
    pushAdminPolicyLog(dispatch, 'error', 'POLICY_PUBLISH_FAILED', 'Policy yayınlama başarısız.', { reason: result.error });
    return result;
  }
  dispatch(policyActions.setActivePolicy(nextDraft));
  dispatch(policyActions.clearError());
  pushAdminPolicyLog(dispatch, 'info', 'POLICY_PUBLISHED', 'Policy yayınlandı ve aktif hale getirildi.');
  return { ok: true };
}

export const selectPolicy = (state) => state.policy.activePolicy || DEFAULT_POLICY;
export const selectPolicyDraft = (state) => state.policy.draftPolicy || DEFAULT_POLICY;
export const selectSelectedPackage = (state) => state.policy.selectedPackage || 'free';
