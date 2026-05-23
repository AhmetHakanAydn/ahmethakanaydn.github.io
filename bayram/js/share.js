import { config } from './config.js';
import { showToast } from './toast.js';
import { exportCard } from './card-export.js';

export function buildShareData({ url, name } = {}) {
  let resolvedUrl = url;
  if (!resolvedUrl) {
    const base = config.shareUrl || `${window.location.origin}${window.location.pathname}`;
    const params = new URLSearchParams(window.location.search);
    resolvedUrl = params.toString() ? `${base}?${params}` : base;
  }

  const params = new URLSearchParams(window.location.search);
  const recipient = name || params.get('isim') || params.get('ad') || '';
  const title = recipient ? `İyi Bayramlar ${recipient}! 🎉` : 'İyi Bayramlar! 🎉';
  const text = recipient
    ? `Sevgili ${recipient}, bayramın kutlu olsun! Sana ufak bir sürprizim var:`
    : 'Bayramın kutlu olsun! Sana ufak bir sürprizim var:';

  return { url: resolvedUrl, title, text };
}

const HANDLERS = {
  whatsapp({ url, text }) {
    const msg = encodeURIComponent(`${text}\n${url}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank', 'noopener');
  },
  x({ url, text }) {
    const params = new URLSearchParams({ text, url });
    window.open(`https://twitter.com/intent/tweet?${params}`, '_blank', 'noopener');
  },
  telegram({ url, text }) {
    const params = new URLSearchParams({ url, text });
    window.open(`https://t.me/share/url?${params}`, '_blank', 'noopener');
  },
  async copy({ url }) {
    try {
      await navigator.clipboard.writeText(url);
      showToast('🔗 Link kopyalandı');
    } catch {
      showToast('Link kopyalanamadı, manuel kopyalayabilirsin.');
    }
  },
  async card() {
    try {
      await exportCard();
    } catch (error) {
      console.error(error);
      showToast('Kart oluşturulamadı.');
    }
  },
};

export function openExternalShare(action, data) {
  const handler = HANDLERS[action];
  if (handler) handler(data);
}

export function initShare() {
  const primary = document.getElementById('share-primary');
  const list = document.getElementById('share-list');
  if (!primary || !list) return;

  primary.addEventListener('click', async () => {
    const data = buildShareData();

    if (navigator.share) {
      try {
        await navigator.share({ title: data.title, text: data.text, url: data.url });
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }

    list.hidden = !list.hidden;
  });

  list.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-share]');
    if (!button) return;
    openExternalShare(button.dataset.share, buildShareData());
  });
}
