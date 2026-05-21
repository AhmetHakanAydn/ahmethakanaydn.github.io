const OPEN_DURATION = 1000;
const FADE_DURATION = 480;

export function initEnvelope({ onOpen } = {}) {
  const intro = document.getElementById('intro');
  const envelope = document.getElementById('envelope');
  const celebration = document.getElementById('celebration');
  if (!intro || !envelope || !celebration) return;

  let opened = false;

  const open = () => {
    if (opened) return;
    opened = true;

    envelope.classList.add('is-opening');
    envelope.setAttribute('disabled', '');

    window.setTimeout(() => {
      intro.classList.add('is-leaving');
    }, OPEN_DURATION - FADE_DURATION);

    window.setTimeout(() => {
      intro.hidden = true;
      intro.style.display = 'none';
      celebration.hidden = false;
      celebration.classList.remove('is-hidden');
      celebration.focus?.();
      onOpen?.();
    }, OPEN_DURATION);
  };

  envelope.addEventListener('click', open);
  envelope.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      open();
    }
  });
}
