export async function render() {
  const section = document.createElement('section');
  section.className = 'content-grid';
  section.innerHTML = `
    <article class="card">
      <h2>Dublaj (Speech2Speech)</h2>
      <p>Bu sayfa dublaj modunu ayrı page sözleşmesiyle sağlar.</p>
    </article>
  `;
  return section.outerHTML;
}

export function destroy() {}
