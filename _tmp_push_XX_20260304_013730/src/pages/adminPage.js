import { listAllModels } from '../services/modelCatalog.js';

export async function render({ store }) {
  const isAdmin = store.getState().app.userRole === 'admin';
  if (!isAdmin) {
    return '<section class="content-grid"><article class="card">Bu sayfaya erişim izniniz yok.</article></section>';
  }

  const models = await listAllModels();
  if (!models.ok) {
    return '<section class="content-grid"><article class="card">Model kataloğu yüklenemedi.</article></section>';
  }

  return `
    <section class="content-grid">
      <article class="card">
        <h2>Admin / Modeller</h2>
        <p>Toplam model: ${models.models.length}</p>
      </article>
    </section>
  `;
}
