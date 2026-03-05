export async function render() {
  const section = document.createElement('section');
  section.className = 'content-grid';

  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    <h2>PuterLab Entegrasyonu</h2>
    <p>Bu ekran, <code>/puter-lab.html</code> dosyasını tek panel mimari içinde iframe ile gömer.</p>
    <iframe title="PuterLab" src="/puter-lab.html" style="width:100%; min-height:720px; border:1px solid #e5e7eb; border-radius:12px;"></iframe>
  `;

  section.append(card);
  return section;
}

export function destroy() {}
