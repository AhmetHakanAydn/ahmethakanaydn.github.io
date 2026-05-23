let timer = null;

export function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('is-visible');

  if (timer) window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    toast.classList.remove('is-visible');
  }, duration);
}
