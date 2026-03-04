export function renderButton({ label, variant = 'primary', disabled = false, loading = false, ariaLabel = '' }) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `btn btn-${variant}`;
  button.disabled = disabled || loading;
  button.setAttribute('aria-label', ariaLabel || label);
  button.textContent = loading ? '…' : label;
  return button;
}
