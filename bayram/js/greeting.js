import { detectBayram, daysUntil } from './bayram-detect.js';

function sanitizeName(raw) {
  if (!raw) return '';
  const trimmed = raw.trim().slice(0, 40);
  return trimmed.replace(/[<>&"']/g, '');
}

export function readParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    name: sanitizeName(params.get('isim') || params.get('ad') || ''),
    bayramOverride: (params.get('tur') || '').toLowerCase() || null,
  };
}

export function renderGreeting() {
  const { name, bayramOverride } = readParams();
  const info = detectBayram({ override: bayramOverride });

  const eyebrow = document.getElementById('bayram-type');
  const greeting = document.getElementById('greeting');
  const subtitle = document.getElementById('subtitle');

  if (eyebrow) eyebrow.textContent = info.eyebrow;
  if (subtitle) subtitle.textContent = info.subtitle;

  if (greeting) {
    const personal = name ? `İyi Bayramlar, ${name}!` : 'İyi Bayramlar!';
    greeting.textContent = `${personal} ${info.emoji}`;
  }

  document.title = name ? `İyi Bayramlar ${name} ${info.emoji}` : `İyi Bayramlar ${info.emoji}`;

  renderCountdown(info);

  return { name, info };
}

function renderCountdown(info) {
  const wrapper = document.getElementById('countdown');
  const value = document.getElementById('countdown-value');
  if (!wrapper || !value) return;

  if (info.state === 'today') {
    wrapper.hidden = false;
    value.textContent = 'Bugün bayram! 🎉';
    return;
  }

  if (info.state === 'upcoming' && info.upcoming) {
    const days = daysUntil(info.upcoming.startDate);
    if (days <= 0) {
      wrapper.hidden = true;
      return;
    }
    wrapper.hidden = false;
    const label = info.upcoming.type === 'ramazan' ? 'Ramazan Bayramı' : 'Kurban Bayramı';
    value.textContent = `${label}'na ${days} gün kaldı`;
    const labelEl = wrapper.querySelector('.countdown__label');
    if (labelEl) labelEl.textContent = '';
    return;
  }

  wrapper.hidden = true;
}
