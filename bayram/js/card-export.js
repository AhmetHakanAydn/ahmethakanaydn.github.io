import { toPng } from 'https://cdn.jsdelivr.net/npm/html-to-image@1/+esm';
import { showToast } from './toast.js';

export async function exportCard() {
  const target = document.getElementById('celebration');
  if (!target) return;

  showToast('🎨 Kart hazırlanıyor…', 1800);

  const dataUrl = await toPng(target, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: '#0a0e2a',
    skipFonts: false,
  });

  const params = new URLSearchParams(window.location.search);
  const name = params.get('isim') || params.get('ad') || 'bayram';
  const filename = `iyi-bayramlar-${name.toLocaleLowerCase('tr')}.png`;

  if (navigator.canShare) {
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], filename, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'İyi Bayramlar! 🎉',
          text: 'Bayramın kutlu olsun!',
        });
        return;
      }
    } catch (error) {
      if (error?.name === 'AbortError') return;
      // share başarısız olursa indirme fallback'ine geç
    }
  }

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('🖼️ Kart indirildi');
}
