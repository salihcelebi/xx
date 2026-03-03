export function renderVideoJobCard(job) {
  const card = document.createElement('article');
  card.className = 'video-job-card';
  card.innerHTML = `
    <h4>${job.prompt}</h4>
    <p>${job.status}</p>
    <progress max="100" value="${job.progress || 0}"></progress>
  `;
  return card;
}
