export function renderBillingSummaryCards(cards = []) {
  const wrap = document.createElement('section');
  wrap.className = 'billing-summary-cards';
  cards.forEach((card) => {
    const article = document.createElement('article');
    article.className = 'card';
    article.innerHTML = `<h4>${card.titleKey}</h4><strong>${card.valueText}</strong>`;
    wrap.append(article);
  });
  return wrap;
}
