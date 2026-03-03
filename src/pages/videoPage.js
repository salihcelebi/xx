export async function render() {
  // Ağır bileşenler için lazy-load noktası.
  await Promise.resolve();
  return `
    <section class="content-grid">
      <article class="card">
        <h2>Video Studio</h2>
        <p>Queue + gallery alanı video üretimi için hazır.</p>
      </article>
    </section>
  `;
}

export function destroy() {
  // Video sayfasına özel cleanup burada tutulur.
}
