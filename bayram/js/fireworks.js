import { tsParticles } from 'https://cdn.jsdelivr.net/npm/@tsparticles/engine@3/+esm';
import { loadFireworksPreset } from 'https://cdn.jsdelivr.net/npm/@tsparticles/preset-fireworks@3/+esm';
import { confetti } from 'https://cdn.jsdelivr.net/npm/@tsparticles/confetti@3/+esm';

const PALETTE = ['#f5c842', '#ec5435', '#ffffff', '#ffd1dc', '#7fd1e0'];
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let initialized = false;

export async function initFireworks() {
  if (initialized) return;
  initialized = true;

  if (prefersReducedMotion) return;

  await loadFireworksPreset(tsParticles);

  await tsParticles.load({
    id: 'tsparticles',
    options: {
      preset: 'fireworks',
      background: { color: 'transparent' },
      fullScreen: { enable: false },
      detectRetina: true,
      fpsLimit: 60,
    },
  });
}

export function clickBurst(x, y) {
  if (prefersReducedMotion) return;

  const origin = {
    x: x / window.innerWidth,
    y: y / window.innerHeight,
  };

  confetti({
    particleCount: 24,
    spread: 60,
    startVelocity: 28,
    gravity: 0.9,
    ticks: 70,
    colors: PALETTE,
    origin,
    scalar: 0.8,
    disableForReducedMotion: true,
  });
}

export function celebrationBurst() {
  if (prefersReducedMotion) return;

  confetti({
    particleCount: 140,
    spread: 100,
    startVelocity: 42,
    gravity: 0.95,
    ticks: 180,
    colors: PALETTE,
    origin: { x: 0.5, y: 0.6 },
    scalar: 1.1,
    disableForReducedMotion: true,
  });

  window.setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 120,
      startVelocity: 35,
      colors: PALETTE,
      origin: { x: 0.2, y: 0.7 },
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 80,
      spread: 120,
      startVelocity: 35,
      colors: PALETTE,
      origin: { x: 0.8, y: 0.7 },
      disableForReducedMotion: true,
    });
  }, 250);
}

export function miniBurst(element) {
  if (prefersReducedMotion || !element) return;

  const rect = element.getBoundingClientRect();
  const origin = {
    x: (rect.left + rect.width / 2) / window.innerWidth,
    y: (rect.top + rect.height / 2) / window.innerHeight,
  };

  confetti({
    particleCount: 30,
    spread: 50,
    startVelocity: 22,
    ticks: 60,
    colors: PALETTE,
    origin,
    scalar: 0.7,
    disableForReducedMotion: true,
  });
}

export function attachClickBursts() {
  if (prefersReducedMotion) return;

  let lastBurst = 0;
  document.addEventListener('pointerdown', (event) => {
    const now = performance.now();
    if (now - lastBurst < 120) return;
    lastBurst = now;
    clickBurst(event.clientX, event.clientY);
  }, { passive: true });
}
