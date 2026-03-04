export async function render() {
  const section = document.createElement('section');
  section.className = 'content-grid';
  section.innerHTML = `
    <article class="card">
      <h2>Kodlama Modu</h2>
      <p>Kod odaklı model seçimi için mode=code filtresi etkin.</p>
    </article>
  `;
  return section.outerHTML;
}

export function destroy() {}
