/*
 * ahmethakanaydin.dev — portfolio runtime
 * Modules:
 *   A. CodeMorph    — hero canvas; drifting code that locks into the author name
 *   B. DecryptText  — binary scramble that "brute-force" decrypts to readable copy
 *   C. NeuralGraph  — interactive skill constellation on HTML5 canvas
 *   D. Sentinel     — terminal autonomy + regex NLP responder
 *
 * Performance: each canvas module runs its own requestAnimationFrame loop and is
 * paused via IntersectionObserver when the section is offscreen. No external libs.
 */
(() => {
  'use strict';

  // ====================================================================
  // Shared utilities
  // ====================================================================

  const prefersReducedMotion =
    typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  const escapeHtml = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));

  const debounce = (fn, ms) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  const lerp = (a, b, t) => a + (b - a) * t;

  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  const waitFonts = async () => {
    if (document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch (_) { /* ignore */ }
    }
  };

  const initIcons = () => { if (window.lucide) window.lucide.createIcons(); };

  // ====================================================================
  // Page chrome: year, navbar, reveal
  // ====================================================================

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  // ====================================================================
  // GitHub projects (preserved)
  // ====================================================================

  const GITHUB_USER = 'AhmetHakanAydn';
  const API_URL = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`;

  const languageColors = {
    JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3572A5',
    'C#': '#178600', 'C++': '#f34b7d', C: '#555555', Java: '#b07219',
    HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051', Go: '#00ADD8',
    Rust: '#dea584', PHP: '#4F5D95', Ruby: '#701516', Kotlin: '#A97BFF',
    Swift: '#F05138', Dart: '#00B4AB',
  };

  const grid = document.getElementById('projects-grid');
  const messageEl = document.getElementById('projects-message');

  const renderProjects = (repos) => {
    if (!grid) return;
    grid.innerHTML = '';
    if (!repos.length) {
      grid.innerHTML =
        '<p class="text-slate-500 col-span-full text-center">Henüz genel bir repo bulunmuyor.</p>';
      return;
    }
    const frag = document.createDocumentFragment();
    repos.forEach((r) => {
      const color = languageColors[r.language] || '#10b981';
      const card = document.createElement('article');
      card.className = 'project-card';
      card.innerHTML = `
        <h4>
          <i data-lucide="folder-git-2" class="w-4 h-4 text-emerald-400"></i>
          ${escapeHtml(r.name)}
        </h4>
        <p>${escapeHtml(r.description) || '<span class="text-slate-600">Açıklama bulunmuyor.</span>'}</p>
        <div class="meta">
          <span>
            ${r.language ? `<span class="lang-dot" style="background:${color}"></span>${escapeHtml(r.language)}` : '<span class="text-slate-600">—</span>'}
            <span class="ml-3">★ ${r.stargazers_count ?? 0}</span>
          </span>
          <a class="view-code" href="${encodeURI(r.html_url)}" target="_blank" rel="noopener">
            Kodu Görüntüle →
          </a>
        </div>`;
      frag.appendChild(card);
    });
    grid.appendChild(frag);
    initIcons();
  };

  const fallbackProjects = [
    { name: 'portfoy-sitesi', description: 'Tailwind CSS ve Vanilla JS ile geliştirilen, GitHub Pages üzerinde yayınlanan kişisel portföy.', language: 'HTML', stargazers_count: 0, html_url: `https://github.com/${GITHUB_USER}` },
    { name: 'dotnet-ntier-demo', description: '.NET ve SQL ile N-katmanlı mimari demosu — TrTek deneyimimden esinlenilmiş katmanlı servisler.', language: 'C#', stargazers_count: 0, html_url: `https://github.com/${GITHUB_USER}` },
    { name: 'python-araclari', description: 'Otomasyon, veri görevleri ve deneysel öğrenme için Python betikleri koleksiyonu.', language: 'Python', stargazers_count: 0, html_url: `https://github.com/${GITHUB_USER}` },
  ];

  const fetchProjects = async () => {
    if (!grid) return;
    try {
      const res = await fetch(API_URL, { headers: { Accept: 'application/vnd.github+json' } });
      if (res.status === 403) {
        messageEl.textContent = 'GitHub API istek limitine ulaşıldı — seçili yedek projeler gösteriliyor. Lütfen daha sonra tekrar deneyin.';
        renderProjects(fallbackProjects);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const filtered = data
        .filter((r) => !r.fork)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 9);
      if (!filtered.length) {
        messageEl.textContent = 'Gösterilecek genel repo bulunamadı — yedek projeler listeleniyor.';
        renderProjects(fallbackProjects);
      } else {
        renderProjects(filtered);
      }
    } catch (err) {
      messageEl.innerHTML = `GitHub'a ulaşılamadı — yedek projeler gösteriliyor. <span class="text-slate-600">(${escapeHtml(err.message)})</span>`;
      renderProjects(fallbackProjects);
    }
  };

  fetchProjects();

  // ====================================================================
  // Module A — CodeMorph (hero)
  // Drifting source code characters lock into pixel coordinates sampled
  // from an offscreen-rasterized rendering of the author name.
  // ====================================================================

  const CodeMorph = (() => {
    const SOURCE = (
      'public class Engineer { public void build() { return AI + Code; } } ' +
      'def neural(graph): return sum(activations) ' +
      'async function deploy() { await ship(code); } ' +
      'SELECT name, passion FROM engineers WHERE shipped = TRUE; ' +
      'const dream = () => future.map(build); using System.Linq; ' +
      'if (problem.hard) solve(); else learn(); git push origin main'
    );
    const CHARS = SOURCE.replace(/\s+/g, '').split('');
    const NAME = 'Ahmet Hakan Aydın';

    let canvas, ctx;
    let width = 0, height = 0, dpr = 1;
    let particles = [];
    let running = false, rafId = 0;

    const computeTargets = () => {
      const slot = document.getElementById('hero-name-slot');
      if (!slot || !canvas) return [];
      const slotR = slot.getBoundingClientRect();
      const heroR = canvas.getBoundingClientRect();
      const slotX = slotR.left - heroR.left;
      const slotY = slotR.top - heroR.top;
      const slotW = slotR.width;
      const slotH = slotR.height;

      // Fit the name width to the slot; vertical metric pinned to slot height.
      const off = document.createElement('canvas');
      const pxW = Math.max(1, Math.floor(slotW * dpr));
      const pxH = Math.max(1, Math.floor(slotH * dpr));
      off.width = pxW;
      off.height = pxH;
      const octx = off.getContext('2d');
      octx.scale(dpr, dpr);

      // Binary-search for a font size that fits the slot width.
      let fontSize = Math.floor(slotH * 0.95);
      octx.textBaseline = 'middle';
      octx.textAlign = 'left';
      for (let i = 0; i < 6; i++) {
        octx.font = `800 ${fontSize}px Inter, system-ui, sans-serif`;
        const m = octx.measureText(NAME).width;
        if (m <= slotW * 0.98) break;
        fontSize = Math.floor(fontSize * (slotW * 0.98) / m);
      }
      octx.font = `800 ${fontSize}px Inter, system-ui, sans-serif`;
      octx.fillStyle = '#fff';
      octx.fillText(NAME, 0, slotH / 2);

      const img = octx.getImageData(0, 0, pxW, pxH).data;
      const step = Math.max(3, Math.round(fontSize / 14));
      const pts = [];
      for (let y = 0; y < pxH; y += step) {
        for (let x = 0; x < pxW; x += step) {
          const alpha = img[(y * pxW + x) * 4 + 3];
          if (alpha > 140) {
            pts.push({ x: slotX + x / dpr, y: slotY + y / dpr });
          }
        }
      }
      return pts;
    };

    const buildParticles = () => {
      const targets = computeTargets();
      // ambient drifters + one particle per target coordinate
      const ambientCount = Math.max(80, Math.floor((width * height) / 18000));
      particles = [];
      for (const t of targets) {
        particles.push({
          char: CHARS[(Math.random() * CHARS.length) | 0],
          x: t.x + (Math.random() - 0.5) * 120,
          y: Math.random() * height,
          vy: 0.35 + Math.random() * 0.55,
          tx: t.x,
          ty: t.y,
          locked: false,
          lockProgress: 0,
          size: 12,
          hue: 'emerald',
          isTarget: true,
        });
      }
      for (let i = 0; i < ambientCount; i++) {
        particles.push({
          char: CHARS[(Math.random() * CHARS.length) | 0],
          x: Math.random() * width,
          y: Math.random() * height,
          vy: 0.15 + Math.random() * 0.55,
          tx: null, ty: null,
          locked: false, lockProgress: 0,
          size: 10 + Math.random() * 3,
          hue: Math.random() < 0.35 ? 'cyan' : 'emerald',
          isTarget: false,
        });
      }
    };

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
    };

    const frame = () => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      ctx.textBaseline = 'middle';

      for (const p of particles) {
        if (p.isTarget) {
          if (!p.locked) {
            p.y += p.vy;
            if (p.y >= p.ty) { p.locked = true; p.lockProgress = 0; }
            if (p.y > height) p.y = -20;
          } else {
            p.lockProgress = Math.min(1, p.lockProgress + 0.05);
            p.x = lerp(p.x, p.tx, 0.14);
            p.y = lerp(p.y, p.ty, 0.14);
          }
        } else {
          p.y += p.vy;
          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
            p.char = CHARS[(Math.random() * CHARS.length) | 0];
          }
        }

        ctx.font = `500 ${p.size}px 'JetBrains Mono', ui-monospace, monospace`;
        if (p.locked) {
          ctx.globalAlpha = 0.4 + 0.6 * p.lockProgress;
          ctx.fillStyle = '#e2f6ec';
          ctx.shadowColor = 'rgba(16,185,129,0.75)';
          ctx.shadowBlur = 10 * p.lockProgress;
        } else if (p.isTarget) {
          ctx.globalAlpha = 0.55;
          ctx.fillStyle = 'rgba(16,185,129,0.9)';
          ctx.shadowBlur = 0;
        } else {
          ctx.globalAlpha = 0.22;
          ctx.fillStyle = p.hue === 'cyan'
            ? 'rgba(34,211,238,1)'
            : 'rgba(16,185,129,1)';
          ctx.shadowBlur = 0;
        }
        ctx.fillText(p.char, p.x, p.y);
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      rafId = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };

    const paintStatic = () => {
      // Locked single-frame render for reduced motion
      for (const p of particles) {
        if (p.isTarget) { p.locked = true; p.lockProgress = 1; p.x = p.tx; p.y = p.ty; }
      }
      running = true;
      frame();
      running = false;
    };

    const init = async () => {
      canvas = document.getElementById('hero-canvas');
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      await waitFonts();
      resize();
      const onResize = debounce(() => resize(), 150);
      window.addEventListener('resize', onResize);

      if (prefersReducedMotion) { paintStatic(); return; }

      const hero = document.getElementById('home');
      if (hero && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((e) => (e.isIntersecting ? start() : stop()));
        }, { threshold: 0.03 });
        io.observe(hero);
      }
      start();

      // The hero text lives inside a `.reveal` element that slides in over
      // ~700ms. Recompute targets once the layout has settled so the locked
      // name lines up exactly with where the H1 would have been.
      window.addEventListener('load', () => setTimeout(resize, 900), { once: true });
    };

    return { init };
  })();

  // ====================================================================
  // Module B — DecryptText (Binary DNA)
  // Any element tagged [data-decrypt] initially renders as 0/1 noise,
  // then "brute-forces" back to the real copy on scroll-in and on hover.
  // Preserves inline markup by snapshotting innerHTML and restoring it
  // once the reveal completes.
  // ====================================================================

  const DecryptText = (() => {
    const SCRAMBLE = '01▓▒░#$%&@*+=<>/\\|01';
    const DURATION = 1100;
    const completed = new WeakSet();

    const scrambleChar = (source) => {
      if (source === ' ' || source === '\n' || source === '\t') return source;
      return SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0];
    };

    const snapshot = (el) => {
      if (!el.dataset.decryptHtml) el.dataset.decryptHtml = el.innerHTML;
      if (!el.dataset.decryptText) el.dataset.decryptText = el.textContent.replace(/\s+/g, ' ').trim();
    };

    const seedNoise = (el) => {
      const plain = el.dataset.decryptText || el.textContent;
      el.textContent = plain.split('').map((c) =>
        (c === ' ') ? ' ' : (Math.random() < 0.5 ? '0' : '1')
      ).join('');
      el.classList.add('is-decrypting');
    };

    const animate = (el) => {
      if (el.dataset.decryptBusy === '1') return;
      el.dataset.decryptBusy = '1';
      const plain = el.dataset.decryptText;
      const chars = plain.split('');
      const len = chars.length;
      el.classList.add('is-decrypting');
      const startedAt = performance.now();

      const tick = (now) => {
        const t = Math.min(1, (now - startedAt) / DURATION);
        // ease-out cubic on reveal rate; last ~10% is pure noise-free.
        const eased = 1 - Math.pow(1 - t, 3);
        const revealCount = Math.floor(eased * len);
        let out = '';
        for (let i = 0; i < len; i++) {
          out += i < revealCount ? chars[i] : scrambleChar(chars[i]);
        }
        el.textContent = out;
        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          el.innerHTML = el.dataset.decryptHtml;
          el.classList.remove('is-decrypting');
          el.dataset.decryptBusy = '';
          completed.add(el);
        }
      };
      requestAnimationFrame(tick);
    };

    const init = () => {
      const els = document.querySelectorAll('[data-decrypt]');
      if (!els.length) return;
      els.forEach((el) => { snapshot(el); seedNoise(el); });

      if (prefersReducedMotion) {
        els.forEach((el) => {
          el.innerHTML = el.dataset.decryptHtml;
          el.classList.remove('is-decrypting');
          completed.add(el);
        });
        return;
      }

      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              animate(e.target);
              io.unobserve(e.target);
            }
          });
        }, { threshold: 0.25 });
        els.forEach((el) => io.observe(el));
      } else {
        els.forEach((el) => animate(el));
      }

      // Hover re-triggers — refresh original HTML snapshot first so any
      // DOM that the site mutates later is respected.
      els.forEach((el) => {
        el.addEventListener('mouseenter', () => {
          if (el.dataset.decryptBusy === '1') return;
          if (completed.has(el)) {
            el.dataset.decryptHtml = el.innerHTML;
            el.dataset.decryptText = el.textContent.replace(/\s+/g, ' ').trim();
          }
          animate(el);
        });
      });
    };

    return { init };
  })();

  // ====================================================================
  // Module C — NeuralGraph (skill matrix)
  // Nodes breathe and drift; hover reveals related nodes via glowing edges.
  // ====================================================================

  const NeuralGraph = (() => {
    const SKILLS = [
      { id: 'csharp',  label: 'C#',           group: 'backend' },
      { id: 'dotnet',  label: '.NET',         group: 'backend' },
      { id: 'sql',     label: 'SQL',          group: 'backend' },
      { id: 'python',  label: 'Python',       group: 'backend' },
      { id: 'cpp',     label: 'C++',          group: 'backend' },
      { id: 'js',      label: 'JavaScript',   group: 'frontend' },
      { id: 'html',    label: 'HTML / CSS',   group: 'frontend' },
      { id: 'tailwind',label: 'Tailwind',     group: 'frontend' },
      { id: 'rn',      label: 'React Native', group: 'frontend' },
      { id: 'ai',      label: 'AI / LLM',     group: 'ai' },
      { id: 'prompt',  label: 'Prompt Eng.',  group: 'ai' },
      { id: 'linux',   label: 'Linux',        group: 'net' },
      { id: 'tcpip',   label: 'TCP / IP',     group: 'net' },
      { id: 'sec',     label: 'Siber Güvenlik', group: 'sec' },
    ];

    const EDGES = [
      ['csharp','dotnet'], ['csharp','sql'], ['dotnet','sql'],
      ['python','ai'],     ['python','sql'], ['cpp','csharp'],
      ['js','html'],       ['js','tailwind'],['js','rn'],
      ['html','tailwind'], ['ai','prompt'],  ['ai','js'],
      ['ai','dotnet'],     ['ai','rn'],      ['tcpip','linux'],
      ['linux','sec'],     ['tcpip','sec'],  ['sql','python'],
    ];

    const GROUP_COLOR = {
      backend:  '#10b981',
      frontend: '#22d3ee',
      ai:       '#a78bfa',
      net:      '#f59e0b',
      sec:      '#f87171',
    };

    let canvas, ctx, stage, label;
    let width = 0, height = 0, dpr = 1;
    let nodes = [];
    let hoverId = null;
    let running = false, rafId = 0;

    const neighborsOf = (id) => {
      const s = new Set();
      for (const [a, b] of EDGES) {
        if (a === id) s.add(b);
        if (b === id) s.add(a);
      }
      return s;
    };

    const layout = () => {
      const cx = width / 2, cy = height / 2;
      const rx = width * 0.40;
      const ry = height * 0.38;
      nodes = SKILLS.map((s, i) => {
        const angle = (i / SKILLS.length) * Math.PI * 2 - Math.PI / 2;
        const ringFactor = s.group === 'ai' ? 0.52 : 1.0;
        return {
          ...s,
          baseX: cx + Math.cos(angle) * rx * ringFactor,
          baseY: cy + Math.sin(angle) * ry * ringFactor,
          x: 0, y: 0,
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: 0.0007 + Math.random() * 0.0008,
          drift: 6 + Math.random() * 6,
          breath: Math.random() * Math.PI * 2,
          radius: 5 + Math.random() * 1.4,
        };
      });
    };

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout();
    };

    const drawEdge = (a, b, active) => {
      ctx.strokeStyle = active ? 'rgba(16,185,129,0.85)' : 'rgba(30,41,59,0.75)';
      ctx.lineWidth = active ? 1.4 : 1;
      ctx.shadowColor = active ? 'rgba(16,185,129,0.55)' : 'transparent';
      ctx.shadowBlur = active ? 10 : 0;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    };

    const drawNode = (n, t, highlighted) => {
      const breath = 1 + Math.sin(t * 0.0018 + n.breath) * 0.18;
      const color = GROUP_COLOR[n.group] || '#10b981';
      const r = n.radius * breath * (highlighted ? 1.6 : 1);

      const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 4.5);
      halo.addColorStop(0, hexToRgba(color, highlighted ? 0.5 : 0.22));
      halo.addColorStop(1, hexToRgba(color, 0));
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fill();

      if (highlighted) {
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const frame = (now) => {
      if (!running) return;
      const t = now || performance.now();
      ctx.clearRect(0, 0, width, height);

      for (const n of nodes) {
        const p = n.phase + t * n.phaseSpeed;
        n.x = n.baseX + Math.cos(p) * n.drift;
        n.y = n.baseY + Math.sin(p * 0.85) * n.drift * 0.7;
      }

      const hovered = hoverId ? neighborsOf(hoverId) : null;
      for (const [a, b] of EDGES) {
        const na = nodes.find((n) => n.id === a);
        const nb = nodes.find((n) => n.id === b);
        if (!na || !nb) continue;
        const active = hoverId && (a === hoverId || b === hoverId);
        drawEdge(na, nb, active);
      }
      ctx.shadowBlur = 0;

      for (const n of nodes) {
        const highlighted = hoverId === n.id || (hovered && hovered.has(n.id));
        drawNode(n, t, highlighted);
      }

      rafId = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };

    const HIT_RADIUS_SQ = 22 * 22;
    const pickNode = (mx, my) => {
      let pick = null, bestDist = HIT_RADIUS_SQ;
      for (const n of nodes) {
        const dx = mx - n.x, dy = my - n.y;
        const d = dx * dx + dy * dy;
        if (d < bestDist) { bestDist = d; pick = n; }
      }
      return pick;
    };

    const updateHoverFromClient = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const n = pickNode(clientX - rect.left, clientY - rect.top);
      hoverId = n ? n.id : null;
      if (n && label) {
        label.textContent = n.label;
        label.style.left = `${n.x}px`;
        label.style.top = `${n.y}px`;
        label.classList.add('visible');
      } else if (label) {
        label.classList.remove('visible');
      }
    };

    const init = () => {
      canvas = document.getElementById('neural-canvas');
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      label = document.getElementById('neural-label');
      stage = canvas.parentElement;

      resize();
      window.addEventListener('resize', debounce(resize, 150));

      stage.addEventListener('mousemove', (e) => updateHoverFromClient(e.clientX, e.clientY));
      stage.addEventListener('mouseleave', () => {
        hoverId = null;
        if (label) label.classList.remove('visible');
      });
      stage.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        if (t) updateHoverFromClient(t.clientX, t.clientY);
      }, { passive: true });

      if (prefersReducedMotion) { running = true; frame(); running = false; return; }

      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((e) => (e.isIntersecting ? start() : stop()));
        }, { threshold: 0.08 });
        io.observe(stage);
      } else {
        start();
      }
    };

    return { init };
  })();

  // ====================================================================
  // Module D — Sentinel (terminal autonomy + NLP)
  // Integrates with the existing terminal. Two responsibilities:
  //   1. Emit autonomous system-status lines every 15–20 s while open.
  //   2. Answer natural-language questions via regex patterns.
  // ====================================================================

  const Sentinel = (() => {
    const NLP = [
      {
        re: /\b(kim(s[iı]n)?|who\s*(are|r)\s*(you|u)|who\b)/i,
        reply: () =>
          'Ben Ahmet Hakan Aydın — Bilgisayar Mühendisi ve AI-destekli Full-Stack geliştirici. ' +
          'Tasarımdan dağıtıma tüm yığın hakkında konuşabiliriz.',
      },
      {
        re: /\b(yetenek|skill|stack|ne\s*biliyorsun|teknoloj)/i,
        reply: () =>
          'Omurga: .NET · C# · SQL. Frontend: JavaScript · Tailwind · React Native. ' +
          'AI refleksim; Copilot, Claude ve Cursor günlük rutin.',
      },
      {
        re: /\b(deneyim|experience|cv|nerede\s*çal|i[sş]\s*ge[çc])/i,
        reply: () =>
          'TrTek (.NET / SQL / N-katmanlı, 2024–2025), Casper (Teknik Danışman, 2023–2024), ' +
          'Üniversite Personeli ve Royal Doğa. Ayrıntı için "deneyim" komutu.',
      },
      {
        re: /\b(ileti[sş]im|contact|mail|e-?posta|email|ula[sş])/i,
        reply: () =>
          'E-posta: ahmettaydin88@gmail.com · LinkedIn: ahmethakan-aydin · GitHub: AhmetHakanAydn. Kapı açık.',
      },
      {
        re: /\b(proje|project|github|repo)/i,
        reply: () =>
          'Projeler canlı olarak GitHub REST API\'den çekiliyor. "projeler" komutu seni oraya ışınlar.',
      },
      {
        re: /\b(ai|yapay\s*zek|llm|gpt|claude|copilot|cursor)/i,
        reply: () =>
          'AI bir tercih değil, çalışma biçimimin parçası. Prompt tasarımı, mimari diyaloglar, hata ayıklama — her aşamada.',
      },
      {
        re: /\b(python|c\#|csharp|dotnet|\.net|sql|react|javascript|js|cpp|c\+\+|linux|tcp|html|css|tailwind)/i,
        reply: (m) =>
          `"${m[0]}" üzerine uzun konuşabilirim. Tam liste için: yetenekler.`,
      },
      {
        re: /\b(merhaba|selam|hi|hello|hey|hola)\b/i,
        reply: () => 'Merhaba. Sentinel çevrimiçi. "yardim" yazabilir ya da doğrudan sorabilirsin.',
      },
      {
        re: /\b(te[sş]ekk[uü]r|thanks|thank\s*you|sa[gğ]\s*ol)/i,
        reply: () => 'Rica ederim. Başka bir şey?',
      },
      {
        re: /\b(nas[ıi]ls[ıi]n|how\s*(are|r)\s*(you|u))/i,
        reply: () => 'CPU %7, RAM %12, moral %98. Kod yazmaya hazır.',
      },
      {
        re: /\b(neden|why|niye)\b.*\b(ai|yapay)/i,
        reply: () => 'AI işleri saatlere, hatta dakikalara indiriyor — ve ben hız + kalite arıyorum.',
      },
    ];

    const STATUS_LINES = [
      'GitHub repo\'ları analiz ediliyor...',
      '.NET projelerinde yüksek aktivite algılandı.',
      'Optimizasyon motoru: aktif.',
      'LLM bağlamı yenileniyor — cache warm.',
      'N-katmanlı mimari şablonu taranıyor...',
      'Yeni prompt deseni indekslendi.',
      'SQL sorgu kuyruğu boş — sistem rahat.',
      'Siber savunma sensörleri: yeşil.',
      'Ağ gecikmesi 12ms — TCP rükuu sağlam.',
      'Lint denetimi: 0 uyarı.',
      'Claude oturumu hazır — düşünme kipi açık.',
      'React Native paketi yeniden derlendi.',
      'Yedekleme başarılı (02:14 UTC).',
      'Prompt telemetrisi senkron.',
    ];

    let bridge = null;
    let timerId = 0;

    const scheduleNext = () => {
      clearTimeout(timerId);
      const delay = 15000 + Math.random() * 5000;
      timerId = setTimeout(() => {
        if (bridge && bridge.isOpen()) {
          const msg = STATUS_LINES[(Math.random() * STATUS_LINES.length) | 0];
          bridge.print(escapeHtml(msg), 'sentinel-line');
        }
        scheduleNext();
      }, delay);
    };

    const tryAnswer = (raw) => {
      for (const p of NLP) {
        const m = raw.match(p.re);
        if (m) return p.reply(m);
      }
      return null;
    };

    const install = (_bridge) => {
      bridge = _bridge;
      scheduleNext();
    };

    return { install, tryAnswer };
  })();

  // ====================================================================
  // Terminal — existing UX, now wired to Sentinel
  // ====================================================================

  const modal = document.getElementById('terminal-modal');
  const output = document.getElementById('terminal-output');
  const termForm = document.getElementById('terminal-form');
  const termInput = document.getElementById('terminal-input');
  const openButtons = [
    document.getElementById('terminal-toggle'),
    document.getElementById('hero-terminal-link'),
    document.getElementById('contact-terminal'),
  ].filter(Boolean);

  if (modal && output && termForm && termInput) {
    const history = [];
    let historyIdx = -1;

    const print = (html, cls = 'text-slate-300') => {
      const line = document.createElement('div');
      line.className = cls;
      line.innerHTML = html;
      output.appendChild(line);
      output.scrollTop = output.scrollHeight;
    };

    const printPrompt = (cmd) => {
      print(
        `<span class="text-emerald-400">ziyaretci@aha:~$</span> <span class="text-slate-200">${escapeHtml(cmd)}</span>`
      );
    };

    const printBanner = () => {
      print('┌─────────────────────────────────────────────┐', 'text-emerald-400');
      print('│   siber-terminal · v2.0 · <span class="text-cyan-400">yardim</span> yazın       │', 'text-emerald-400');
      print('└─────────────────────────────────────────────┘', 'text-emerald-400');
      print('Sentinel modülü aktif — istediğini doğrudan sor.', 'text-slate-400');
      print('');
    };

    const openTerminal = () => {
      modal.classList.add('open');
      if (!output.children.length) printBanner();
      setTimeout(() => termInput.focus(), 50);
    };
    const closeTerminal = () => modal.classList.remove('open');

    const commandHandlers = {
      yardim: () => {
        print('Kullanılabilir komutlar:', 'text-emerald-400 font-semibold');
        [
          ['yardim',     'komut listesini göster'],
          ['hakkimda',   'Ahmet Hakan Aydın kimdir'],
          ['yetenekler', 'teknik yetenek matrisi'],
          ['deneyim',    'iş geçmişini göster'],
          ['projeler',   'projeler bölümüne git'],
          ['iletisim',   'iletişim bilgilerini göster'],
          ['sosyal',     'LinkedIn ve GitHub bağlantıları'],
          ['whoami',     'aktif kullanıcı'],
          ['tarih',      'güncel tarih/saat'],
          ['sentinel',   'sentinel durumu'],
          ['temizle',    'terminali temizle'],
          ['cikis',      'terminali kapat'],
        ].forEach(([c, d]) =>
          print(`  <span class="text-cyan-400">${c.padEnd(11)}</span> ${d}`)
        );
        print('');
        print('Doğal dil de çalışır: "kimsin?", "skills?", "contact"...', 'text-slate-500');
      },
      hakkimda: () => {
        print('Ahmet Hakan Aydın — Bilgisayar Mühendisliği öğrencisi.', 'text-slate-200');
        print('Full-Stack Geliştirici · Ağ ve siber güvenlik meraklısı.');
        print('TrTek (.NET/SQL, N-katmanlı) ve Casper (Teknik Danışman) deneyimi.');
      },
      yetenekler: () => {
        print('Teknoloji Yığını:', 'text-emerald-400 font-semibold');
        print('  <span class="text-cyan-400">Frontend</span>   HTML · CSS · JavaScript · Tailwind · React Native');
        print('  <span class="text-cyan-400">Backend</span>    C# · .NET · Python · C++ · SQL');
        print('  <span class="text-cyan-400">Ağ</span>         TCP/IP · Sistem Yönetimi · Linux Temelleri');
        print('  <span class="text-cyan-400">Güvenlik</span>   Ağ Güvenliği · Güvenli Kod Yazımı');
      },
      deneyim: () => {
        print('İş Geçmişi:', 'text-emerald-400 font-semibold');
        print('  2024–2025  TrTek          Yazılım Stajyeri (.NET / SQL / N-katmanlı)');
        print('  2023–2024  Casper         Teknik Danışman');
        print('  2022–2023  Üniversite     Personel / BT Operasyonları');
        print('  2021–2022  Royal Doğa     Ekip Üyesi');
      },
      projeler: () => {
        print('Projeler bölümüne gidiliyor...', 'text-emerald-400');
        closeTerminal();
        setTimeout(
          () => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }),
          150
        );
      },
      iletisim: () => {
        print('İletişim:', 'text-emerald-400 font-semibold');
        print('  E-posta  : <a href="mailto:ahmettaydin88@gmail.com" class="text-cyan-400 underline">ahmettaydin88@gmail.com</a>');
        print('  LinkedIn : <a href="https://linkedin.com/in/ahmethakan-aydin" target="_blank" class="text-cyan-400 underline">linkedin.com/in/ahmethakan-aydin</a>');
        print('  GitHub   : <a href="https://github.com/AhmetHakanAydn" target="_blank" class="text-cyan-400 underline">github.com/AhmetHakanAydn</a>');
      },
      sosyal: () => commandHandlers.iletisim(),
      whoami: () => print('ziyaretci@aha — Ahmet Hakan Aydın\'ın portföyüne hoş geldiniz.'),
      tarih: () => print(new Date().toLocaleString('tr-TR')),
      sentinel: () => {
        print('sentinel :: status', 'text-emerald-400 font-semibold');
        print('  nlp-patterns : 11');
        print('  telemetry    : online');
        print('  autonomy     : 15–20s döngü');
      },
      temizle: () => { output.innerHTML = ''; printBanner(); },
      cikis: () => closeTerminal(),
    };

    const aliases = {
      help: 'yardim', about: 'hakkimda', skills: 'yetenekler',
      experience: 'deneyim', projects: 'projeler', contact: 'iletisim',
      social: 'sosyal', date: 'tarih', clear: 'temizle', exit: 'cikis',
    };

    const normalize = (s) =>
      s.toLowerCase()
        .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
        .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c');

    const runCommand = (raw) => {
      const trimmed = raw.trim();
      if (!trimmed) return;
      printPrompt(raw);
      const token = normalize(trimmed);
      const target = aliases[token] || token;
      if (commandHandlers[target]) {
        commandHandlers[target]();
        return;
      }
      // Fallback: Sentinel NLP
      const answer = Sentinel.tryAnswer(trimmed);
      if (answer) {
        print(escapeHtml(answer), 'bot-line');
        return;
      }
      print(
        `komut bulunamadı: <span class="text-red-400">${escapeHtml(token)}</span> — ` +
        `<span class="text-cyan-400">yardim</span> yazın ya da doğrudan sor.`
      );
    };

    openButtons.forEach((b) =>
      b.addEventListener('click', (e) => { e.preventDefault(); openTerminal(); })
    );
    modal.querySelectorAll('[data-close]').forEach((el) =>
      el.addEventListener('click', closeTerminal)
    );

    termForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = termInput.value;
      if (val.trim()) { history.unshift(val); historyIdx = -1; }
      runCommand(val);
      termInput.value = '';
    });

    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') {
        if (historyIdx < history.length - 1) {
          historyIdx++;
          termInput.value = history[historyIdx];
          setTimeout(
            () => termInput.setSelectionRange(termInput.value.length, termInput.value.length),
            0
          );
        }
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        if (historyIdx > 0) {
          historyIdx--;
          termInput.value = history[historyIdx];
        } else {
          historyIdx = -1;
          termInput.value = '';
        }
        e.preventDefault();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeTerminal();
    });

    // Hand the terminal surface to Sentinel so it can emit status lines.
    Sentinel.install({
      print,
      isOpen: () => modal.classList.contains('open'),
    });
  }

  // ====================================================================
  // Contact form (preserved)
  // ====================================================================

  const contactForm = document.getElementById('contact-form');
  const statusEl = document.getElementById('cf-status');
  const TARGET_EMAIL = 'ahmettaydin88@gmail.com';

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(contactForm);
      const name = (data.get('name') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const subject = (data.get('subject') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();

      if (!name || !email || !subject || !message) {
        statusEl.textContent = 'Lütfen tüm alanları doldurun.';
        statusEl.className = 'text-sm font-mono error';
        return;
      }

      const body =
        `Gönderen: ${name}\n` +
        `E-posta:  ${email}\n\n` +
        `${message}\n`;

      const mailto =
        `mailto:${TARGET_EMAIL}` +
        `?subject=${encodeURIComponent('[Portföy] ' + subject)}` +
        `&body=${encodeURIComponent(body)}`;

      window.location.href = mailto;
      statusEl.innerHTML =
        `E-posta istemciniz açıldı. Açılmadıysa doğrudan ` +
        `<a href="mailto:${TARGET_EMAIL}" class="underline text-emerald-400">${TARGET_EMAIL}</a> ` +
        `adresine yazabilirsiniz.`;
      statusEl.className = 'text-sm font-mono success';
    });
  }

  // ====================================================================
  // Boot
  // ====================================================================

  const boot = () => {
    initIcons();
    CodeMorph.init();
    DecryptText.init();
    NeuralGraph.init();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  window.addEventListener('load', initIcons);
})();
