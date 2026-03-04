export async function render() {
  const section = document.createElement('section');
  section.className = 'content-grid';
  section.innerHTML = `
    <article class="card">
      <h2>Ses Üretimi (TTS)</h2>
      <p>Bu sayfa txt2speech akışını modüler route yapısında sunar.</p>
    </article>
  `;
  return section.outerHTML;
}

export function destroy() {}
