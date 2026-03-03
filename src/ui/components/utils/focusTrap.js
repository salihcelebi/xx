export function createFocusTrap(rootEl) {
  return (event) => {
    if (event.key !== 'Tab') return;
    const focusables = [...rootEl.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')];
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
}
