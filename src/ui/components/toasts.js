export function createToastManager(root) {
  return {
    show(type, message, timeout = 3000) {
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.innerHTML = `<span>${message}</span><button aria-label="close">×</button>`;
      toast.querySelector('button').addEventListener('click', () => toast.remove());
      root.appendChild(toast);
      setTimeout(() => toast.remove(), timeout);
    },
  };
}
