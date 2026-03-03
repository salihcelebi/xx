export function renderCitationList(citations = []) {
  const root = document.createElement('section');
  root.className = 'citation-list';
  root.innerHTML = '<h3>Kaynaklar</h3>';
  const list = document.createElement('ol');
  citations.forEach((citation) => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${citation.url}" target="_blank" rel="noreferrer">${citation.title || citation.url}</a>`;
    list.append(li);
  });
  root.append(list);
  return root;
}
