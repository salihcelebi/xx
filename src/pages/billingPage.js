import { buildUsageCards, computeDiff } from '../services/puterUsage.js';
import { renderBillingSummaryCards } from '../ui/components/BillingSummaryCards.js';
import { renderPaymentProviders } from '../ui/components/PaymentProviders.js';

export async function render({ store }) {
  const billing = store.getState().billing;
  const snapshot = billing.monthlyUsage || { totalMicrocents: 0, byModel: [], byDay: [] };
  const diff = computeDiff(snapshot);
  const cards = buildUsageCards(snapshot, diff, billing.limits || {});

  const section = document.createElement('section');
  section.className = 'content-grid';
  section.append(renderBillingSummaryCards(cards), renderPaymentProviders());
  return section.outerHTML;
}
