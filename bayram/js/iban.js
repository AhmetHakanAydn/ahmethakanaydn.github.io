import QRCode from 'https://cdn.jsdelivr.net/npm/qrcode@1/+esm';
import { config } from './config.js';
import { showToast } from './toast.js';
import { miniBurst } from './fireworks.js';

function normalizeIban(iban) {
  return (iban || '').replace(/\s+/g, '').toUpperCase();
}

function formatIban(iban) {
  return normalizeIban(iban).replace(/(.{4})/g, '$1 ').trim();
}

async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* fallback to execCommand */
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(textarea);
  return ok;
}

async function renderQr(container, iban) {
  if (!container) return;
  try {
    const svg = await QRCode.toString(iban, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 1,
      color: { dark: '#0a0e2a', light: '#ffffff' },
    });
    container.innerHTML = svg;
  } catch (error) {
    container.textContent = 'QR oluşturulamadı';
  }
}

function resolveIban() {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get('iban');
  return normalizeIban(fromUrl || config.iban);
}

export function initIban() {
  const button = document.getElementById('iban-copy');
  const textEl = document.getElementById('iban-text');
  const qrEl = document.getElementById('iban-qr');
  if (!button || !textEl) return;

  const iban = resolveIban();
  if (!iban) {
    button.disabled = true;
    textEl.textContent = 'IBAN ayarlanmamış';
    return;
  }
  textEl.textContent = formatIban(iban);

  renderQr(qrEl, iban);

  button.addEventListener('click', async () => {
    const ok = await copyToClipboard(iban);
    if (ok) {
      showToast('✅ IBAN kopyalandı! Bereketli olsun :)');
      miniBurst(button);
    } else {
      showToast('Kopyalanamadı, IBAN’ı manuel seçip kopyalayabilirsin.');
    }
  });
}
