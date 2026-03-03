export async function render() {
  return `
    <section class="content-grid">
      <article class="card">
        <h2>Chat Studio</h2>
        <p>Prompt girip Generate kısayolu ile üretim başlat.</p>
      </article>
    </section>
  `;
}

export function destroy() {
  // Sayfa cleanup hook'u (gerekirse event unsubscribe burada yapılır).
}
