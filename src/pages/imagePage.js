export async function render() {
  const section = document.createElement('section');
  section.className = 'content-grid';

  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    <h2>Görsel Üretimi</h2>
    <p>Mode filtresi ve policy kurallarıyla model listesi bu sayfada da geçerlidir.</p>
  `;

  section.append(card);
  return section.outerHTML;
}

export function destroy() {}
