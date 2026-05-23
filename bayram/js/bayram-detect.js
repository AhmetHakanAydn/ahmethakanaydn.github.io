/**
 * 2024-2030 arası yaklaşık Ramazan ve Kurban Bayramı başlangıç tarihleri.
 * Hicri takvim ay gözlemine göre ±1 gün kayabilir; resmi açıklamayla güncellenmesi tavsiye edilir.
 */
const BAYRAMS = [
  { type: 'ramazan', start: '2024-04-10', end: '2024-04-12' },
  { type: 'kurban',  start: '2024-06-16', end: '2024-06-19' },
  { type: 'ramazan', start: '2025-03-30', end: '2025-04-01' },
  { type: 'kurban',  start: '2025-06-06', end: '2025-06-09' },
  { type: 'ramazan', start: '2026-03-20', end: '2026-03-22' },
  { type: 'kurban',  start: '2026-05-27', end: '2026-05-30' },
  { type: 'ramazan', start: '2027-03-09', end: '2027-03-11' },
  { type: 'kurban',  start: '2027-05-16', end: '2027-05-19' },
  { type: 'ramazan', start: '2028-02-26', end: '2028-02-28' },
  { type: 'kurban',  start: '2028-05-05', end: '2028-05-08' },
  { type: 'ramazan', start: '2029-02-14', end: '2029-02-16' },
  { type: 'kurban',  start: '2029-04-24', end: '2029-04-27' },
  { type: 'ramazan', start: '2030-02-04', end: '2030-02-06' },
  { type: 'kurban',  start: '2030-04-13', end: '2030-04-16' },
];

const COPY = {
  ramazan: {
    eyebrow: 'Ramazan Bayramınız mübarek olsun 🌙',
    subtitle: 'Sevdiklerinle huzurlu, bereketli ve mutlu bir bayram dilerim.',
    emoji: '🌙',
  },
  kurban: {
    eyebrow: 'Kurban Bayramınız mübarek olsun 🐑',
    subtitle: 'Bu bayram da paylaştıkça çoğalsın, bereket eksik olmasın.',
    emoji: '🐑',
  },
  default: {
    eyebrow: 'Bayramınız mübarek olsun ✨',
    subtitle: 'Sağlık, huzur ve bereket dolu günler dilerim.',
    emoji: '✨',
  },
};

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function detectBayram({ override, now = new Date() } = {}) {
  if (override && COPY[override]) {
    return { type: override, ...COPY[override], state: 'override' };
  }

  const today = startOfDay(now);

  for (const entry of BAYRAMS) {
    const start = parseDate(entry.start);
    const end = parseDate(entry.end);
    if (today >= start && today <= end) {
      return { type: entry.type, ...COPY[entry.type], state: 'today', range: entry };
    }
  }

  const upcoming = BAYRAMS
    .map((entry) => ({ ...entry, startDate: parseDate(entry.start) }))
    .filter((entry) => entry.startDate >= today)
    .sort((a, b) => a.startDate - b.startDate)[0];

  if (upcoming) {
    return {
      type: upcoming.type,
      ...COPY[upcoming.type],
      state: 'upcoming',
      upcoming,
    };
  }

  return { type: 'default', ...COPY.default, state: 'unknown' };
}

export function daysUntil(date, now = new Date()) {
  const ms = startOfDay(date) - startOfDay(now);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}
