export function renderPageHeader(root, title, description) {
  root.innerHTML = `
    <div>
      <h1>${title}</h1>
      <p>${description}</p>
    </div>
    <div class="actions">
      <button id="generate-command">Generate (G)</button>
    </div>
  `;
}
