import { showToast } from './toast.js';
import { buildShareData, openExternalShare } from './share.js';

const IBAN_TR_REGEX = /^TR\d{24}$/;

function normalizeIban(raw) {
  return (raw || '').replace(/\s+/g, '').toUpperCase();
}

function formatIban(raw) {
  return normalizeIban(raw).replace(/(.{4})/g, '$1 ').trim();
}

function validIban(raw) {
  return IBAN_TR_REGEX.test(normalizeIban(raw));
}

function buildLink({ name, iban, tur }) {
  const base = `${window.location.origin}${window.location.pathname}`;
  const params = new URLSearchParams();
  if (name) params.set('isim', name);
  params.set('iban', iban);
  if (tur) params.set('tur', tur);
  return `${base}?${params}`;
}

export function initSetup() {
  const form = document.getElementById('setup-form');
  if (!form) return;

  const nameInput = document.getElementById('field-name');
  const ibanInput = document.getElementById('field-iban');
  const turInput = document.getElementById('field-tur');
  const ibanHint = document.getElementById('field-iban-hint');
  const result = document.getElementById('setup-result');
  const linkEl = document.getElementById('setup-link');
  const copyButton = document.getElementById('setup-copy');
  const previewButton = document.getElementById('setup-preview');
  const shareButtons = document.getElementById('setup-share-buttons');

  let currentLink = '';
  let currentData = null;

  ibanInput?.addEventListener('blur', () => {
    if (ibanInput.value.trim()) {
      ibanInput.value = formatIban(ibanInput.value);
    }
  });

  ibanInput?.addEventListener('input', () => {
    ibanInput.removeAttribute('aria-invalid');
    if (ibanHint) {
      ibanHint.textContent = 'Boşlukları biz hallederiz. TR + 24 rakam.';
      ibanHint.classList.remove('field__hint--error');
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = (nameInput?.value || '').trim();
    const ibanRaw = ibanInput?.value || '';
    const iban = normalizeIban(ibanRaw);
    const tur = turInput?.value || '';

    if (!validIban(iban)) {
      ibanInput?.setAttribute('aria-invalid', 'true');
      if (ibanHint) {
        ibanHint.textContent = 'IBAN geçersiz görünüyor. TR ile başlamalı, 26 karakter olmalı.';
        ibanHint.classList.add('field__hint--error');
      }
      ibanInput?.focus();
      return;
    }

    currentLink = buildLink({ name, iban, tur });
    currentData = buildShareData({ url: currentLink, name });

    if (linkEl) linkEl.textContent = currentLink;
    if (result) {
      result.hidden = false;
      result.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    showToast('🎉 Bağlantın hazır! Aşağıdan paylaşabilirsin.');
  });

  copyButton?.addEventListener('click', async () => {
    if (!currentLink) return;
    try {
      await navigator.clipboard.writeText(currentLink);
      showToast('🔗 Link kopyalandı');
    } catch {
      const range = document.createRange();
      range.selectNode(linkEl);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
      showToast('Linki seçtim, Cmd/Ctrl + C ile kopyala.');
    }
  });

  previewButton?.addEventListener('click', () => {
    if (!currentLink) return;
    window.open(currentLink, '_blank', 'noopener');
  });

  shareButtons?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-share]');
    if (!button || !currentData) return;
    openExternalShare(button.dataset.share, currentData);
  });
}
