(() => {
  'use strict';

  const GITHUB_USER = 'AhmetHakanAydn';
  const API_URL = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`;

  // ---------- Lucide ikonları ----------
  const initIcons = () => { if (window.lucide) window.lucide.createIcons(); };

  // ---------- Yıl ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Navbar scroll ----------
  const navbar = document.getElementById('navbar');
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Scroll'da görünür ol ----------
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  // ---------- GitHub projeleri ----------
  const grid = document.getElementById('projects-grid');
  const messageEl = document.getElementById('projects-message');

  const languageColors = {
    JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3572A5',
    'C#': '#178600', 'C++': '#f34b7d', C: '#555555', Java: '#b07219',
    HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051', Go: '#00ADD8',
    Rust: '#dea584', PHP: '#4F5D95', Ruby: '#701516', Kotlin: '#A97BFF',
    Swift: '#F05138', Dart: '#00B4AB',
  };

  const escapeHtml = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

  const renderProjects = (repos) => {
    grid.innerHTML = '';
    if (!repos.length) {
      grid.innerHTML = '<p class="text-slate-500 col-span-full text-center">Henüz genel bir repo bulunmuyor.</p>';
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
        </div>
      `;
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

  // ---------- Terminal ----------
  const modal = document.getElementById('terminal-modal');
  const output = document.getElementById('terminal-output');
  const form = document.getElementById('terminal-form');
  const input = document.getElementById('terminal-input');
  const openButtons = [
    document.getElementById('terminal-toggle'),
    document.getElementById('hero-terminal-link'),
    document.getElementById('contact-terminal'),
  ].filter(Boolean);

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
    print(`<span class="text-emerald-400">ziyaretci@aha:~$</span> <span class="text-slate-200">${escapeHtml(cmd)}</span>`);
  };

  const commandHandlers = {
    yardim: () => {
      print('Kullanılabilir komutlar:', 'text-emerald-400 font-semibold');
      [
        ['yardim', 'komut listesini göster'],
        ['hakkimda', 'Ahmet Hakan Aydın kimdir'],
        ['yetenekler', 'teknik yetenek matrisi'],
        ['deneyim', 'iş geçmişini göster'],
        ['projeler', 'projeler bölümüne git'],
        ['iletisim', 'iletişim bilgilerini göster'],
        ['sosyal', 'LinkedIn ve GitHub bağlantıları'],
        ['whoami', 'aktif kullanıcı'],
        ['tarih', 'güncel tarih/saat'],
        ['temizle', 'terminali temizle'],
        ['cikis', 'terminali kapat'],
      ].forEach(([c, d]) => print(`  <span class="text-cyan-400">${c.padEnd(11)}</span> ${d}`));
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
      setTimeout(() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }), 150);
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
    temizle: () => { output.innerHTML = ''; printBanner(); },
    cikis: () => closeTerminal(),
  };

  // İngilizce takma adlar — kullanıcı 'help', 'clear' vb. yazarsa da çalışsın
  const aliases = {
    help: 'yardim',
    about: 'hakkimda',
    skills: 'yetenekler',
    experience: 'deneyim',
    projects: 'projeler',
    contact: 'iletisim',
    social: 'sosyal',
    date: 'tarih',
    clear: 'temizle',
    exit: 'cikis',
  };

  const normalize = (s) => s
    .toLowerCase()
    .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
    .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c');

  const runCommand = (raw) => {
    const cmd = normalize(raw.trim());
    if (!cmd) return;
    printPrompt(raw);
    const target = aliases[cmd] || cmd;
    if (commandHandlers[target]) {
      commandHandlers[target]();
    } else {
      print(`komut bulunamadı: <span class="text-red-400">${escapeHtml(cmd)}</span> — <span class="text-cyan-400">yardim</span> yazın`);
    }
  };

  const printBanner = () => {
    print('┌─────────────────────────────────────────────┐', 'text-emerald-400');
    print('│   siber-terminal · v1.0 · <span class="text-cyan-400">yardim</span> yazın       │', 'text-emerald-400');
    print('└─────────────────────────────────────────────┘', 'text-emerald-400');
    print('Hoş geldin, ziyaretçi. Bana bir şey sor.', 'text-slate-400');
    print('');
  };

  const openTerminal = () => {
    modal.classList.add('open');
    if (!output.children.length) printBanner();
    setTimeout(() => input.focus(), 50);
  };
  const closeTerminal = () => modal.classList.remove('open');

  openButtons.forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); openTerminal(); }));
  modal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeTerminal));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = input.value;
    if (val.trim()) { history.unshift(val); historyIdx = -1; }
    runCommand(val);
    input.value = '';
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      if (historyIdx < history.length - 1) {
        historyIdx++;
        input.value = history[historyIdx];
        setTimeout(() => input.setSelectionRange(input.value.length, input.value.length), 0);
      }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (historyIdx > 0) {
        historyIdx--;
        input.value = history[historyIdx];
      } else {
        historyIdx = -1;
        input.value = '';
      }
      e.preventDefault();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeTerminal();
  });

  // ---------- İletişim formu (mailto üzerinden) ----------
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

      statusEl.innerHTML = `E-posta istemciniz açıldı. Açılmadıysa doğrudan <a href="mailto:${TARGET_EMAIL}" class="underline text-emerald-400">${TARGET_EMAIL}</a> adresine yazabilirsiniz.`;
      statusEl.className = 'text-sm font-mono success';
    });
  }

  // ---------- DOM bağlandıktan sonra ikonları başlat ----------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIcons);
  } else {
    initIcons();
  }
  window.addEventListener('load', initIcons);
})();
