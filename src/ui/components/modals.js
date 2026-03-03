export function setupModalEscape(modalElements) {
  // Gereksinim B22: ESC ile tüm modal/dropdown kapanışı.
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    modalElements.forEach((modal) => {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
    });
  });
}
