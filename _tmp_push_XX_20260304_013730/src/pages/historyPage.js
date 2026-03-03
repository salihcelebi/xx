export async function render({ store }) {
  const state = store.getState();
  const rows = [
    ...(state.chat.threads || []).map((t) => ({ tur: 'chat', baslik: t.title, zaman: t.updatedAt })),
    ...(state.video.jobs || []).map((j) => ({ tur: 'video', baslik: j.prompt, zaman: j.updatedAt })),
  ];

  if (!rows.length) return '<section class="content-grid" data-empty="true"><article class="card">Henüz kayıt yok.</article></section>';

  return `
    <section class="content-grid">
      <article class="card">
        <h2>Geçmiş</h2>
        <ul>${rows.map((r) => `<li><strong>${r.tur}</strong> · ${r.baslik || '—'}</li>`).join('')}</ul>
      </article>
    </section>
  `;
}
