export function renderPaymentProviders() {
  const section = document.createElement('section');
  section.className = 'payment-providers';
  section.innerHTML = `
    <h3>Ödeme Ayarları</h3>
    <p>Türkiye: iyzico, PayTR, Param, Shopier</p>
    <p>Global: PayPal, Stripe</p>
  `;
  return section;
}
