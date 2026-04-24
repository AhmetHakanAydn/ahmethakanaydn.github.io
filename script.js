/* ============================================================
   AHMET HAKAN AYDIN — V3 · Derin Uzay / Yüksek Teknoloji Lab
   script-v3.js   (Tüm UI metinleri Türkçe)
   ============================================================ */

'use strict';

const CV = {
  name: 'Ahmet Hakan Aydın',
  role: 'Yazılım Geliştirici · AI-first',
  location: 'Kocaeli, TR',
  university: 'Isparta Üniversitesi',
  status: 'MÜSAİT',
  email: 'ahmethakan@example.dev',
  linkedin: 'linkedin.com/in/ahmethakan-aydin',
  github: 'AhmetHakanAydn',
  summary: 'Problem çözmeyi seven, temiz ve işleyen yazılımlar peşinde koşan bir geliştiriciyim. Üretkenliğimin merkezinde yapay zeka var — kod üretimi, mimari kararlar, hata ayıklama, prototipleme. AI, benim en iyi takım arkadaşım.',
  skills: {
    'Diller':     ['C#', 'Python', 'JavaScript', 'SQL'],
    'Backend':    ['.NET', 'ASP.NET Core', 'N-katmanlı Mimari', 'REST API'],
    'Mobil':      ['React Native'],
    'Veritabanı': ['MS SQL Server', 'PostgreSQL'],
    'Yapay Zeka': ['ChatGPT', 'Claude', 'Copilot', 'Cursor'],
    'Güvenlik':   ['Güvenli Kodlama', 'OWASP', 'Kimlik Doğrulama'],
  },
  experience: [
    { role: 'Yazılım Geliştirme Stajyeri', company: 'TrTek', date: '2023 — Günümüz',
      desc: 'N-katmanlı mimari, .NET ve SQL Server kullanarak kurumsal yazılım geliştirdim. Katmanlı servisler yazdım, veri erişim katmanında çalıştım ve iç araçlar için iş mantığı entegrasyonu sağladım.',
      tags: ['C#', '.NET', 'N-katmanlı', 'MS SQL'] },
    { role: 'Teknik Danışman', company: 'Casper', date: '2022 — 2023',
      desc: 'Müşterilere donanım ve yazılım çözümleri konusunda danışmanlık yaptım, teknik sorunları teşhis ettim ve kullanıcı gereksinimleriyle mühendislik kısıtları arasında köprü kurdum.',
      tags: ['C#', 'Python', 'Araç'] },
    { role: 'Üniversite Personeli', company: 'Akademik', date: '2020 — 2022',
      desc: 'Akademik BT operasyonlarına destek verdim, kampüs sistemleriyle ilgili çalışmalar yaptım ve teknik lojistik konularında departmanlarla koordinasyon sağladım.',
      tags: ['Destek', 'Scripting', 'Mentorluk'] },
  ],
  certs: [
    { title: 'Siber Güvenlik Temelleri', org: 'Verkosis', desc: 'Savunma odaklı güvenlik, güvenli kodlama ve tehdit modelleme.' },
    { title: 'Yazılım Mühendisliği Programı', org: 'BTK Akademi', desc: 'Backend, veritabanı ve sistem tasarımı.' },
    { title: '.NET & N-katmanlı Mimari', org: 'Bissatek', desc: 'C# ile katmanlı mimari ve kurumsal kalıplar.' },
  ]
};

/* ============================================================
   1) BOOT
   ============================================================ */
(function boot() {
  const host = document.getElementById('bootLines');
  if (!host) return;
  const lines = [
    ['[ OK ]', 'çekirdek v3.0.0 başlatılıyor ...', 'ok'],
    ['[ OK ]', 'nöral ağ modülü yükleniyor ...', 'ok'],
    ['[ OK ]', 'LLM yardımcı-pilotu hazırlanıyor ...', 'ok'],
    ['[UYAR]', 'güvenli kanal: hazır', 'warn'],
    ['[ OK ]', 'github.com genel anahtarları alınıyor ...', 'ok'],
    ['[ OK ]', '/bin/aha-sh başlatılıyor ...', 'ok'],
    ['[TAMM]', 'hoş geldin operatör.', 'ok'],
  ];
  let i = 0;
  const step = () => {
    if (i >= lines.length) {
      setTimeout(() => {
        document.getElementById('boot').classList.add('done');
        setTimeout(() => {
          document.getElementById('boot').remove();
          document.body.dispatchEvent(new CustomEvent('boot:done'));
        }, 700);
      }, 260);
      return;
    }
    const [tag, text, cls] = lines[i++];
    const el = document.createElement('div');
    el.className = 'boot-line';
    el.innerHTML = `<span class="boot-${cls}">${tag}</span> ${text}`;
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(step, 160 + Math.random() * 120);
  };
  setTimeout(step, 200);
})();

/* ============================================================
   2) THREE.JS — Neural Network with click ripples
   ============================================================ */
function initNeural() {
  if (typeof THREE === 'undefined') return;
  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 14, 50);
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 120);
  camera.position.set(0, 0, 14);

  const NODE_COUNT = 70;
  const nodeBase = new Float32Array(NODE_COUNT * 3);
  const nodePos = new Float32Array(NODE_COUNT * 3);
  const activations = new Float32Array(NODE_COUNT);

  for (let i = 0; i < NODE_COUNT; i++) {
    const r = 10 + Math.random() * 6;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta) * 0.65;
    const z = r * Math.cos(phi) - 4;
    nodeBase[i*3] = x; nodeBase[i*3+1] = y; nodeBase[i*3+2] = z;
  }

  // edges
  const edges = [];
  const neighbors = Array.from({ length: NODE_COUNT }, () => []);
  const MAX_DIST = 6.5, MAX_CONN = 3;
  for (let i = 0; i < NODE_COUNT; i++) {
    const dists = [];
    for (let j = 0; j < NODE_COUNT; j++) {
      if (i === j) continue;
      const dx = nodeBase[j*3] - nodeBase[i*3];
      const dy = nodeBase[j*3+1] - nodeBase[i*3+1];
      const dz = nodeBase[j*3+2] - nodeBase[i*3+2];
      const d = Math.sqrt(dx*dx + dy*dy + dz*dz);
      if (d < MAX_DIST) dists.push({ j, d });
    }
    dists.sort((a, b) => a.d - b.d);
    for (let k = 0; k < Math.min(MAX_CONN, dists.length); k++) {
      const { j } = dists[k];
      if (j > i) {
        edges.push({ a: i, b: j });
        neighbors[i].push(j); neighbors[j].push(i);
      }
    }
  }

  const linePositions = new Float32Array(edges.length * 6);
  const lineColors = new Float32Array(edges.length * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
  const lineMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
  const linesObj = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(linesObj);

  // node points
  const pCanvas = document.createElement('canvas');
  pCanvas.width = pCanvas.height = 64;
  const pctx = pCanvas.getContext('2d');
  const grd = pctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(192, 132, 252, 1)');
  grd.addColorStop(0.35, 'rgba(59, 130, 246, 0.85)');
  grd.addColorStop(1, 'rgba(59, 130, 246, 0)');
  pctx.fillStyle = grd; pctx.fillRect(0, 0, 64, 64);
  const pTex = new THREE.CanvasTexture(pCanvas);

  const ptGeo = new THREE.BufferGeometry();
  ptGeo.setAttribute('position', new THREE.BufferAttribute(nodePos, 3));
  const nodeColors = new Float32Array(NODE_COUNT * 3);
  for (let i = 0; i < NODE_COUNT; i++) {
    nodeColors[i*3] = 0.23; nodeColors[i*3+1] = 0.51; nodeColors[i*3+2] = 0.96;
  }
  ptGeo.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));
  const ptMat = new THREE.PointsMaterial({ size: 0.5, map: pTex, transparent: true, vertexColors: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const points = new THREE.Points(ptGeo, ptMat);
  scene.add(points);

  // pulses
  const pulses = [];
  function spawnPulse() {
    if (!edges.length) return;
    const eIdx = Math.floor(Math.random() * edges.length);
    pulses.push({ eIdx, t: 0, speed: 0.6 + Math.random() * 0.8, dir: Math.random() < 0.5 ? 1 : -1 });
  }
  let pulseTimer = 0;

  // ripples (from clicks)
  const ripples = []; // {originIdx, age, maxAge}

  // pointer & click
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const raycaster = new THREE.Raycaster();
  const worldMouse = new THREE.Vector3();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  window.addEventListener('pointermove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
  }, { passive: true });

  // click anywhere on canvas -> ripple from closest node to click point
  canvas.addEventListener('click', (e) => {
    const mx = (e.clientX / window.innerWidth) * 2 - 1;
    const my = -((e.clientY / window.innerHeight) * 2 - 1);
    raycaster.setFromCamera(new THREE.Vector2(mx, my), camera);
    raycaster.ray.intersectPlane(plane, worldMouse);
    // find closest node
    let best = -1, bestD = Infinity;
    for (let i = 0; i < NODE_COUNT; i++) {
      const dx = nodeBase[i*3] - worldMouse.x;
      const dy = nodeBase[i*3+1] - worldMouse.y;
      const dz = nodeBase[i*3+2] - worldMouse.z;
      const d = dx*dx + dy*dy + dz*dz;
      if (d < bestD) { bestD = d; best = i; }
    }
    if (best >= 0) {
      ripples.push({ origin: best, age: 0, maxAge: 1.6, front: 0 });
      activations[best] = 1;
    }
  });

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  const clock = new THREE.Clock();
  const COL_BASE = new THREE.Color(0x3b82f6);
  const COL_HOT  = new THREE.Color(0xc084fc);
  const tmpA = new THREE.Color(), tmpB = new THREE.Color();

  function animate() {
    const t = clock.getElapsedTime();
    const dt = Math.min(clock.getDelta(), 0.05);

    mouse.x += (mouse.tx - mouse.x) * 0.06;
    mouse.y += (mouse.ty - mouse.y) * 0.06;

    // decay
    for (let i = 0; i < NODE_COUNT; i++) activations[i] *= 0.93;

    // proximity
    raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);
    raycaster.ray.intersectPlane(plane, worldMouse);
    for (let i = 0; i < NODE_COUNT; i++) {
      const dx = nodeBase[i*3] - worldMouse.x;
      const dy = nodeBase[i*3+1] - worldMouse.y;
      const d = Math.sqrt(dx*dx + dy*dy);
      const boost = Math.max(0, 1 - d / 6);
      if (boost > 0.05) activations[i] = Math.max(activations[i], boost);
    }

    // pulses
    pulseTimer -= dt;
    if (pulseTimer <= 0) { spawnPulse(); pulseTimer = 0.18 + Math.random() * 0.25; }
    for (let p = pulses.length - 1; p >= 0; p--) {
      const pu = pulses[p];
      pu.t += dt * pu.speed * pu.dir;
      if (pu.t > 1 || pu.t < 0) {
        const e = edges[pu.eIdx];
        const endIdx = pu.dir > 0 ? e.b : e.a;
        activations[endIdx] = Math.min(1, activations[endIdx] + 0.6);
        pulses.splice(p, 1);
      }
    }

    // ripples — front expands outward via neighbor BFS
    for (let r = ripples.length - 1; r >= 0; r--) {
      const ri = ripples[r];
      ri.age += dt;
      const newFront = Math.floor(ri.age / 0.12); // one hop every 120ms
      if (newFront > ri.front) {
        // activate all nodes at distance == newFront from origin
        const visited = new Set([ri.origin]);
        let frontier = [ri.origin];
        for (let step = 0; step < newFront; step++) {
          const next = [];
          for (const n of frontier) {
            for (const m of neighbors[n]) if (!visited.has(m)) { visited.add(m); next.push(m); }
          }
          frontier = next;
        }
        const intensity = Math.max(0, 1 - ri.age / ri.maxAge);
        for (const n of frontier) activations[n] = Math.max(activations[n], intensity);
        ri.front = newFront;
      }
      if (ri.age > ri.maxAge) ripples.splice(r, 1);
    }

    // colors
    const lc = lineGeo.attributes.color.array;
    for (let e = 0; e < edges.length; e++) {
      const { a, b } = edges[e];
      tmpA.copy(COL_BASE).lerp(COL_HOT, Math.min(1, activations[a]));
      tmpB.copy(COL_BASE).lerp(COL_HOT, Math.min(1, activations[b]));
      lc[e*6]   = tmpA.r; lc[e*6+1] = tmpA.g; lc[e*6+2] = tmpA.b;
      lc[e*6+3] = tmpB.r; lc[e*6+4] = tmpB.g; lc[e*6+5] = tmpB.b;
    }
    lineGeo.attributes.color.needsUpdate = true;

    // node positions & colors
    const np = ptGeo.attributes.position.array;
    const nc = ptGeo.attributes.color.array;
    for (let i = 0; i < NODE_COUNT; i++) {
      np[i*3]   = nodeBase[i*3]   + Math.sin(t * 0.4 + i * 0.13) * 0.15;
      np[i*3+1] = nodeBase[i*3+1] + Math.cos(t * 0.35 + i * 0.17) * 0.12;
      np[i*3+2] = nodeBase[i*3+2] + Math.sin(t * 0.2 + i) * 0.1;
      tmpA.copy(COL_BASE).lerp(COL_HOT, Math.min(1, activations[i]));
      nc[i*3] = tmpA.r; nc[i*3+1] = tmpA.g; nc[i*3+2] = tmpA.b;
    }
    ptGeo.attributes.position.needsUpdate = true;
    ptGeo.attributes.color.needsUpdate = true;

    // sync line positions
    const lp = lineGeo.attributes.position.array;
    for (let e = 0; e < edges.length; e++) {
      const { a, b } = edges[e];
      lp[e*6]   = np[a*3];   lp[e*6+1] = np[a*3+1]; lp[e*6+2] = np[a*3+2];
      lp[e*6+3] = np[b*3];   lp[e*6+4] = np[b*3+1]; lp[e*6+5] = np[b*3+2];
    }
    lineGeo.attributes.position.needsUpdate = true;

    camera.position.x = mouse.x * 1.8;
    camera.position.y = mouse.y * 1.0;
    camera.lookAt(0, 0, -4);
    scene.rotation.y = Math.sin(t * 0.05) * 0.1;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}

/* ============================================================
   3) Scroll-triggered 3D reveal
   ============================================================ */
let __io = null;
function initReveal() {
  __io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); __io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal-3d').forEach(el => __io.observe(el));
}
function observeReveal(root) {
  if (!__io || !root) return;
  root.querySelectorAll('.reveal-3d').forEach(el => {
    if (!el.classList.contains('in')) __io.observe(el);
  });
}

/* ============================================================
   4) 3D Tilt for cards
   ============================================================ */
function attachTilt(root) {
  root.querySelectorAll('.tilt-card').forEach(card => {
    let raf = null;
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const rx = ((y / r.height) - 0.5) * -10;
      const ry = ((x / r.width)  - 0.5) *  12;
      card.style.setProperty('--mx', `${x}px`);
      card.style.setProperty('--my', `${y}px`);
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

/* ============================================================
   5) Data rendering (TR)
   ============================================================ */
function renderSkills() {
  const grid = document.getElementById('skillsGrid');
  if (!grid) return;
  const cards = [
    { code: 'C#',  title: 'C# / .NET',              desc: 'Kurumsal servisler, ASP.NET Core ve N-katmanlı mimari.',     stack: ['ASP.NET Core', 'N-katmanlı', 'EF'] },
    { code: 'PY',  title: 'Python',                  desc: 'Otomasyon, veri işleme ve AI boru hatları.',                 stack: ['Script', 'AI', 'Araç'] },
    { code: 'RN',  title: 'React Native',            desc: 'Çapraz platform mobil — temiz, işleyen uygulamalar.',        stack: ['iOS', 'Android', 'TS'] },
    { code: 'SEC', title: 'Siber Güvenlik',          desc: 'Güvenli kodlama ve OWASP farkındalığı.',                     stack: ['OWASP', 'Kimlik Doğrulama', 'SDLC'] },
    { code: 'SQL', title: 'SQL / Veritabanı',        desc: 'MS SQL Server, şema tasarımı, performanslı sorgular.',       stack: ['T-SQL', 'İndeks', 'Join'] },
    { code: 'AI',  title: 'Yapay Zeka Odaklı Akış',  desc: 'LLM’ler ile eş-programlama — günler saatlere iniyor.',       stack: ['Prompt', 'Ajan', 'Co-pilot'] },
  ];
  grid.innerHTML = cards.map((c, i) => `
    <article class="skill-card reveal-3d" style="transition-delay:${i * 60}ms">
      <div class="skill-icon">${c.code}</div>
      <h3 class="skill-title">${c.title}</h3>
      <p class="skill-desc">${c.desc}</p>
      <div class="skill-stack">${c.stack.map(s => `<span>${s}</span>`).join('')}</div>
    </article>
  `).join('');
  observeReveal(grid);
}

function renderTimeline() {
  const tl = document.getElementById('timeline');
  if (!tl) return;
  tl.innerHTML = CV.experience.map((e, i) => `
    <div class="tl-item reveal-3d" style="transition-delay:${i * 80}ms">
      <div class="tl-dot"></div>
      <div class="tl-card">
        <div class="tl-head">
          <h3 class="tl-role">${e.role} <span class="co">@ ${e.company}</span></h3>
          <span class="tl-date">${e.date}</span>
        </div>
        <p class="tl-desc">${e.desc}</p>
        <div class="tl-tags">${e.tags.map(t => `<span>${t}</span>`).join('')}</div>
      </div>
    </div>
  `).join('');
  observeReveal(tl);
}

function renderCerts() {
  const grid = document.getElementById('certsGrid');
  if (!grid) return;
  grid.innerHTML = CV.certs.map((c, i) => `
    <article class="tilt-card reveal-3d" style="transition-delay:${i * 70}ms">
      <span class="glow"></span>
      <div class="tilt-inner">
        <span class="cert-badge">● DOĞRULANDI</span>
        <h3 class="repo-name">${c.title}</h3>
        <p class="repo-desc">${c.desc}</p>
        <div class="repo-stats"><span>${c.org}</span></div>
      </div>
    </article>
  `).join('');
  attachTilt(grid);
  observeReveal(grid);
}

/* ============================================================
   6) GitHub fetch with Turkish summaries
   ============================================================ */
const LANG_COLORS = {
  'JavaScript': '#F1E05A', 'TypeScript': '#3178C6', 'Python': '#3572A5',
  'C#': '#178600', 'Java': '#B07219', 'HTML': '#E34C26', 'CSS': '#563D7C',
  'C++': '#F34B7D', 'C': '#555555', 'Go': '#00ADD8', 'Rust': '#DEA584',
  'Shell': '#89E051', 'Kotlin': '#A97BFF', 'Swift': '#FFAC45', 'Dart': '#00B4AB'
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// Rough English→Turkish summary heuristic: leaves non-English descriptions intact,
// rewrites common English description stubs into concise Turkish.
function summarizeTR(desc, name) {
  if (!desc) return `${name} adlı proje deposu.`;
  const d = desc.trim();
  // Already looks Turkish (contains TR-only chars) — keep.
  if (/[çğıöşüÇĞİÖŞÜ]/.test(d)) return d;
  // Otherwise prepend a brief TR label and keep original text for context.
  return `Proje özeti: ${d}`;
}

async function fetchRepos() {
  const username = 'AhmetHakanAydn';
  const grid = document.getElementById('reposGrid');
  const statusEl = document.getElementById('reposStatus');
  const metaEl = document.getElementById('reposMeta');
  if (!grid) return;
  grid.innerHTML = Array.from({length: 6}).map(() => `<div class="repos-skeleton"></div>`).join('');

  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, { headers: { 'Accept': 'application/vnd.github+json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const repos = await res.json();
    if (!Array.isArray(repos) || repos.length === 0) {
      grid.innerHTML = `<div class="repos-empty" style="padding:2rem;border:1px dashed var(--border);text-align:center;color:var(--text-dim);font-family:var(--mono)">Genel depo bulunamadı: <code>${username}</code></div>`;
      if (statusEl) statusEl.innerHTML = `<span class="dot" style="background:var(--gold);box-shadow:0 0 8px var(--gold)"></span> boş`;
      if (metaEl) metaEl.textContent = `0 depo`;
      return;
    }
    const sorted = repos.filter(r => !r.fork)
      .sort((a, b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.updated_at) - new Date(a.updated_at)))
      .slice(0, 9);

    if (statusEl) statusEl.innerHTML = `<span class="dot"></span> canlı · kalan çağrı: ${res.headers.get('x-ratelimit-remaining') || '—'}`;
    if (metaEl) metaEl.textContent = `${repos.length} depo · gösterilen ${sorted.length}`;

    grid.innerHTML = sorted.map(r => repoCardHTML(r)).join('');
    attachTilt(grid);
    observeReveal(grid);

  } catch (err) {
    const fallback = [
      { name: 'kisisel-portfolyo', description: '3B kişisel portfolyo sitesi.', language: 'JavaScript', stargazers_count: 0, html_url: `https://github.com/${username}` },
      { name: 'dotnet-ntier-ornek', description: 'Temiz N-katmanlı .NET mimari örneği.', language: 'C#', stargazers_count: 0, html_url: `https://github.com/${username}` },
      { name: 'rn-mobil-kit', description: 'Navigasyon ve kimlik iskeletli React Native başlangıcı.', language: 'TypeScript', stargazers_count: 0, html_url: `https://github.com/${username}` },
    ];
    grid.innerHTML = fallback.map(r => repoCardHTML(r)).join('');
    attachTilt(grid);
    observeReveal(grid);
    if (statusEl) statusEl.innerHTML = `<span class="dot" style="background:var(--rose);box-shadow:0 0 8px var(--rose)"></span> çevrimdışı · örnek`;
    if (metaEl) metaEl.textContent = `github.com’a ulaşılamadı — ${err.message}`;
  }
}

function repoCardHTML(r) {
  const color = LANG_COLORS[r.language] || '#3B82F6';
  const desc = summarizeTR(r.description, r.name);
  return `
    <a class="tilt-card reveal-3d" href="${r.html_url}" target="_blank" rel="noopener">
      <span class="glow"></span>
      <div class="tilt-inner">
        <div class="repo-head">
          <div class="repo-name">${escapeHtml(r.name)}</div>
          <div class="repo-ext">↗</div>
        </div>
        <p class="repo-desc">${escapeHtml(desc)}</p>
        <div class="repo-stats">
          <span class="repo-lang"><span class="sw" style="background:${color};color:${color}"></span>${r.language || '—'}</span>
          <span><span class="star">★</span> ${r.stargazers_count ?? 0}</span>
        </div>
      </div>
    </a>
  `;
}

/* ============================================================
   7) Terminal — "decoding" reveal animation, TR commands
   ============================================================ */
const Terminal = (() => {
  const term = document.getElementById('terminal');
  const body = document.getElementById('termBody');
  const input = document.getElementById('termInput');
  const dock = document.getElementById('termDock');
  const btnMin = document.getElementById('termMin');
  const btnClose = document.getElementById('termClose');
  if (!term) return { ready: false };

  const history = []; let histIdx = -1; let busy = false;
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const CHARSET = '▓▒░#@%&*01!?$=+-<>/|';
  const rand = () => CHARSET[Math.floor(Math.random() * CHARSET.length)];

  // drag (desktop)
  (function drag() {
    const bar = term.querySelector('.term-bar');
    let sx=0, sy=0, ox=0, oy=0, dragging=false;
    bar.addEventListener('pointerdown', (e) => {
      if (window.innerWidth < 860) return;
      dragging = true; sx = e.clientX; sy = e.clientY;
      const r = term.getBoundingClientRect(); ox = r.left; oy = r.top;
      term.style.right='auto'; term.style.bottom='auto';
      bar.setPointerCapture(e.pointerId);
    });
    bar.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const nx = Math.max(8, Math.min(window.innerWidth - term.offsetWidth - 8, ox + (e.clientX - sx)));
      const ny = Math.max(8, Math.min(window.innerHeight - term.offsetHeight - 8, oy + (e.clientY - sy)));
      term.style.left = nx + 'px'; term.style.top = ny + 'px';
    });
    bar.addEventListener('pointerup', () => { dragging = false; });
  })();

  function setShown(s) {
    if (s) { term.classList.remove('hidden'); dock.classList.remove('show'); setTimeout(() => input.focus(), 50); }
    else { term.classList.add('hidden'); dock.classList.add('show'); }
  }
  btnMin.addEventListener('click', () => term.classList.toggle('minimized'));
  btnClose.addEventListener('click', () => setShown(false));
  dock.addEventListener('click', () => setShown(true));

  function print(html, cls='out') {
    const div = document.createElement('div');
    div.className = `term-line ${cls}`;
    div.innerHTML = html;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }
  function promptHtml() { return `<span class="prompt">aha@uzay</span><span class="path">:~$</span> `; }
  function printCmd(c) { print(`${promptHtml()}<span class="cmd">${escapeHtml(c)}</span>`); }

  // "decoding" effect: each character scrambles through random glyphs before settling
  async function decode(html, cls='out', speed=24) {
    const line = print('', cls);
    // split html into tokens: tags and text
    const tokens = [];
    const re = /<[^>]+>|[^<]+/g; let m;
    while ((m = re.exec(html)) !== null) {
      if (m[0].startsWith('<')) tokens.push({ t: 'tag', v: m[0] });
      else tokens.push({ t: 'text', v: m[0] });
    }
    let built = '';
    for (const tok of tokens) {
      if (tok.t === 'tag') { built += tok.v; line.innerHTML = built; continue; }
      for (let i = 0; i < tok.v.length; i++) {
        const ch = tok.v[i];
        if (ch === ' ' || ch === '\n') { built += ch; line.innerHTML = built; continue; }
        // scramble for a few ticks then settle
        const ticks = 3;
        for (let k = 0; k < ticks; k++) {
          line.innerHTML = built + `<span style="color:var(--purple-bright)">${rand()}</span>`;
          body.scrollTop = body.scrollHeight;
          await sleep(speed);
        }
        built += ch;
        line.innerHTML = built;
      }
    }
  }

  const COMMANDS = {
    yardim: async () => {
      await decode(`Kullanılabilir komutlar:`);
      const rows = [
        ['hakkimda',    'operatör profili'],
        ['yetenekler',  'teknik araç kutusu'],
        ['deneyim',     'iş geçmişi'],
        ['projeler',    'GitHub depolarına git'],
        ['sertifikalar','sertifikalar listesi'],
        ['egitim',      'eğitim bilgileri'],
        ['iletisim',    'iletişim kanalları'],
        ['temizle',     'ekranı temizle'],
        ['yardim',      'bu menü'],
      ];
      for (const [c, d] of rows) await decode(`  <span class="accent">${c.padEnd(14)}</span> ${d}`, 'out', 10);
    },
    hakkimda: async () => {
      await decode(`<span class="accent">${CV.name}</span>`, 'accent', 30);
      await decode(`rol       : ${CV.role}`);
      await decode(`konum     : ${CV.location}`);
      await decode(`üniversite: <span class="purple">${CV.university}</span>`);
      await decode(`durum     : <span class="ok">${CV.status}</span>`);
      await decode(``);
      await decode(CV.summary, 'out', 12);
    },
    yetenekler: async () => {
      for (const [g, items] of Object.entries(CV.skills)) {
        await decode(`<span class="accent">${g.padEnd(12)}</span> ${items.join(', ')}`, 'out', 10);
      }
    },
    deneyim: async () => {
      for (const e of CV.experience) {
        await decode(`<span class="accent">${e.date}</span>  ${e.role} @ ${e.company}`, 'out', 10);
        await decode(`            ${e.desc}`, 'out', 6);
      }
    },
    projeler: async () => {
      await decode(`github.com/${CV.github} depoları yükleniyor ...`, 'out', 14);
      await sleep(300);
      await decode(`<span class="ok">→ Projelerim bölümüne atlanıyor.</span>`, 'ok', 12);
      document.getElementById('projeler')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    sertifikalar: async () => {
      for (const c of CV.certs) await decode(`• ${c.title} — <span class="accent">${c.org}</span>`);
    },
    egitim: async () => {
      await decode(`• ${CV.university} — Bilgisayar Mühendisliği`);
      await decode(`  N-katmanlı mimari ve backend sistemlere odak.`);
    },
    iletisim: async () => {
      await decode(`e-posta  : <span class="accent">${CV.email}</span>`);
      await decode(`linkedin : <span class="accent">${CV.linkedin}</span>`);
      await decode(`github   : <span class="accent">github.com/${CV.github}</span>`);
    },
    temizle: async () => { body.innerHTML = ''; },
    // English aliases for convenience
    help: async () => COMMANDS.yardim(),
    whoami: async () => COMMANDS.hakkimda(),
    skills: async () => COMMANDS.yetenekler(),
    experience: async () => COMMANDS.deneyim(),
    projects: async () => COMMANDS.projeler(),
    contact: async () => COMMANDS.iletisim(),
    clear: async () => COMMANDS.temizle(),
  };

  async function run(raw) {
    if (busy) return;
    const cmd = raw.trim();
    if (!cmd) { printCmd(''); return; }
    printCmd(cmd);
    busy = true;
    const fn = COMMANDS[cmd.toLowerCase()] || null;
    if (fn) await fn();
    else await decode(`komut bulunamadı: <span class="err">${escapeHtml(cmd)}</span> — <span class="accent">yardim</span> yazarak listeyi görebilirsin`, 'err', 14);
    busy = false;
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const v = input.value;
      if (v.trim()) { history.push(v); histIdx = history.length; }
      input.value = ''; run(v);
    } else if (e.key === 'ArrowUp') {
      if (history.length && histIdx > 0) { histIdx--; input.value = history[histIdx]; }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (histIdx < history.length - 1) { histIdx++; input.value = history[histIdx]; }
      else { histIdx = history.length; input.value = ''; }
      e.preventDefault();
    }
  });

  document.body.addEventListener('boot:done', async () => {
    await decode(`<span class="accent">aha-sh v3.0.0</span> · yüksek-teknoloji konsolu`, 'out', 16);
    await decode(`komutları görmek için <span class="accent">yardim</span> yaz.`, 'out', 14);
    await decode(``);
  });

  document.addEventListener('click', (e) => {
    const ev = e.target.closest('[data-cmd]');
    if (!ev) return;
    e.preventDefault();
    setShown(true);
    term.classList.remove('minimized');
    run(ev.getAttribute('data-cmd'));
  });

  return { ready: true, run, setShown };
})();

/* ============================================================
   8) Nav (mobile)
   ============================================================ */
(function nav() {
  const btn = document.getElementById('navToggle');
  const nav = document.querySelector('.nav');
  btn?.addEventListener('click', () => nav.classList.toggle('open'));
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => nav.classList.remove('open'));
  });
})();

/* ============================================================
   9) INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  renderSkills();
  renderTimeline();
  renderCerts();
  initReveal();
  initNeural();
  fetchRepos();
});
