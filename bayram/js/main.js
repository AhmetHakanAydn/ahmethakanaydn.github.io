import { initEnvelope } from './envelope.js';
import { initFireworks, celebrationBurst, attachClickBursts } from './fireworks.js';
import { renderGreeting } from './greeting.js';
import { initIban } from './iban.js';
import { initShare } from './share.js';
import { initSetup } from './setup.js';
import { registerPwa } from './pwa.js';

function showScreen(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.hidden = false;
  el.classList.remove('is-hidden');
}

function hideScreen(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.hidden = true;
  el.classList.add('is-hidden');
}

function isRecipientLink(params) {
  return params.has('iban');
}

function boot() {
  const params = new URLSearchParams(window.location.search);
  registerPwa();

  if (isRecipientLink(params)) {
    showScreen('intro');
    renderGreeting();
    initIban();
    initShare();

    initEnvelope({
      onOpen: async () => {
        try {
          await initFireworks();
        } catch (error) {
          console.warn('Fireworks could not start:', error);
        }
        celebrationBurst();
        attachClickBursts();
      },
    });
  } else {
    showScreen('setup');
    initSetup();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
