// Decoración temporal de Halloween. Se elimina al desactivar este script en index.html.
(function initializeHalloweenTheme() {
  if (document.querySelector('.halloween-decor')) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  let enabled = true;
  try { enabled = localStorage.getItem('halloween-enabled') !== 'false'; } catch (e) {}

  // ---------- Telaraña SVG generada por código ----------
  function buildWebSVG() {
    const size = 200;
    const rays = 6;
    const rings = [38, 72, 108, 146, 186];
    const angles = Array.from({ length: rays }, (_, i) => (i * Math.PI) / 2 / (rays - 1));
    const pt = (r, a) => [(r * Math.cos(a)).toFixed(1), (r * Math.sin(a)).toFixed(1)];
    let paths = '';

    angles.forEach((a) => {
      const [x, y] = pt(size, a);
      paths += `<path d="M0 0 L${x} ${y}"/>`;
    });

    rings.forEach((r) => {
      for (let i = 0; i < angles.length - 1; i++) {
        const [x1, y1] = pt(r, angles[i]);
        const [x2, y2] = pt(r, angles[i + 1]);
        const [cx, cy] = pt(r * 0.78, (angles[i] + angles[i + 1]) / 2);
        paths += `<path d="M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}"/>`;
      }
    });

    return `<svg viewBox="0 0 ${size} ${size}" fill="none" stroke="rgba(235,220,255,0.85)" stroke-width="1" stroke-linecap="round">${paths}</svg>`;
  }

  // ---------- Estructura base ----------
  const webSVG = buildWebSVG();
  const decor = document.createElement('div');
  decor.className = 'halloween-decor';
  decor.setAttribute('aria-hidden', 'true');
  decor.innerHTML = `
    <div class="halloween-vignette"></div>
    <div class="halloween-moon"></div>
    <div class="halloween-fog halloween-fog--back"></div>
    <div class="halloween-fog"></div>
    <div class="halloween-web halloween-web--tl">${webSVG}</div>
    <div class="halloween-web halloween-web--tr">${webSVG}</div>
    <div class="halloween-web halloween-web--br">${webSVG}</div>
    <div class="halloween-web halloween-web--bl">${webSVG}</div>
    <div class="halloween-lightning"></div>
    <div class="halloween-banner"></div>
  `;

  // Arañas colgando de distintos hilos
  [
    { left: '12%', len: 90,  size: '1.7rem', delay: -1 },
    { left: '27%', len: 150, size: '1.3rem', delay: -2.5 },
    { left: '58%', len: 70,  size: '1.4rem', delay: -3.2 },
    { left: '76%', len: 125, size: '1.9rem', delay: -0.6 },
    { left: '91%', len: 60,  size: '1.2rem', delay: -4 },
  ].forEach((s) => {
    const spider = document.createElement('div');
    spider.className = 'halloween-spider';
    spider.style.left = s.left;
    spider.style.setProperty('--len', s.len + 'px');
    spider.style.setProperty('--size', s.size);
    spider.style.animationDelay = s.delay + 's';
    spider.innerHTML = '<span class="halloween-spider-thread"></span><span class="halloween-spider-body">🕷</span>';
    decor.appendChild(spider);
  });

  // Fila de cementerio en la parte inferior
  const ground = document.createElement('div');
  ground.className = 'halloween-ground';
  ['🪦', '🎃', '🕯️', '💀', '🎃', '🪦', '🕸️', '🎃', '👻', '🪦'].forEach((emoji) => {
    const item = document.createElement('span');
    item.textContent = emoji;
    if (emoji === '🎃' || emoji === '🕯️') {
      item.className = 'is-lit';
      item.style.animationDelay = rand(-2, 0).toFixed(2) + 's';
    }
    if (emoji === '🪦') item.className = 'is-tomb';
    ground.appendChild(item);
  });
  decor.appendChild(ground);

  // Botón para activar / desactivar
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'halloween-toggle';
  toggle.textContent = '🎃';
  toggle.title = 'Activar / desactivar Halloween';
  toggle.setAttribute('aria-label', 'Activar o desactivar la decoración de Halloween');

  document.body.classList.add('halloween-active');
  document.body.appendChild(decor);
  document.body.appendChild(toggle);

  // ---------- Mensajes rotativos ----------
  const banner = decor.querySelector('.halloween-banner');
  const messages = [
    '🎃 ¡Feliz Halloween!',
    '👻 ¿Truco o trato?',
    '🦇 ¿Listo para ver algo?',
    '🕸️ Cuidado con las arañas…',
    '💀 La web está embrujada',
    '🧙‍♀️ Bienvenido a la noche más oscura',
    '🕯️ No mires detrás de ti',
  ];
  let messageIndex = 0;
  function showMessage() {
    banner.textContent = messages[messageIndex % messages.length];
    messageIndex++;
  }
  showMessage();
  setInterval(() => {
    if (!enabled || reduceMotion) return;
    banner.classList.add('is-fading');
    setTimeout(() => {
      showMessage();
      banner.classList.remove('is-fading');
    }, 500);
  }, 5000);

  // ---------- Utilidad para elementos temporales ----------
  function spawn(className, html, setup, maxCount) {
    if (!enabled || reduceMotion || document.hidden) return;
    if (maxCount && decor.querySelectorAll('.' + className.split(' ')[0]).length >= maxCount) return;
    const el = document.createElement('span');
    el.className = className;
    el.innerHTML = html;
    if (setup) setup(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
    decor.appendChild(el);
    return el;
  }

  function loop(fn, minMs, maxMs) {
    (function tick() {
      fn();
      setTimeout(tick, rand(minMs, maxMs));
    })();
  }

  // ---------- Murciélagos ----------
  loop(() => {
    spawn('halloween-bat', '<span>🦇</span>', (el) => {
      const rtl = Math.random() > 0.5;
      if (rtl) el.classList.add('is-rtl');
      el.style.top = rand(4, 62).toFixed(0) + 'vh';
      el.style.setProperty('--size', rand(1.1, 2.2).toFixed(2) + 'rem');
      el.style.setProperty('--dur', rand(8, 15).toFixed(1) + 's');
    }, 6);
  }, 2500, 6000);

  // ---------- Lluvia de elementos de Halloween ----------
  const particles = ['🍂', '🎃', '🍬', '💀', '🍁', '🦴', '🕸️', '🍭', '✨'];
  loop(() => {
    spawn('halloween-particle', pick(particles), (el) => {
      el.style.setProperty('--x', rand(0, 98).toFixed(0) + '%');
      el.style.setProperty('--size', rand(0.9, 1.8).toFixed(2) + 'rem');
      el.style.setProperty('--dur', rand(11, 20).toFixed(1) + 's');
      el.style.setProperty('--drift', rand(-120, 120).toFixed(0) + 'px');
      el.style.setProperty('--spin', rand(-540, 540).toFixed(0) + 'deg');
    }, 18);
  }, 700, 1600);

  // ---------- Fantasma que cruza la pantalla ----------
  const ghostMessages = ['¡Buuu!', '¡Uuuuh!', '¿Truco o trato?', '👀', '¡Te vi!'];
  loop(() => {
    spawn('halloween-ghost', '👻', (el) => {
      if (Math.random() > 0.5) el.classList.add('is-rtl');
      el.dataset.msg = pick(ghostMessages);
      el.style.setProperty('--y', rand(22, 62).toFixed(0) + 'vh');
      el.style.setProperty('--dur', rand(12, 18).toFixed(1) + 's');
    }, 1);
  }, 18000, 34000);

  // ---------- Relámpagos ----------
  const lightning = decor.querySelector('.halloween-lightning');
  loop(() => {
    if (!enabled || reduceMotion || document.hidden) return;
    lightning.classList.remove('is-flashing');
    void lightning.offsetWidth; // reinicia la animación
    lightning.classList.add('is-flashing');
  }, 14000, 32000);

  // ---------- Explosión de emojis al hacer clic ----------
  const burstEmojis = ['🎃', '👻', '🦇', '🍬', '💀', '🕷'];
  document.addEventListener('pointerdown', (event) => {
    if (!enabled || reduceMotion || event.target.closest('.halloween-toggle')) return;
    for (let i = 0; i < 7; i++) {
      const angle = (Math.PI * 2 * i) / 7 + rand(-0.3, 0.3);
      const distance = rand(50, 110);
      spawn('halloween-burst', pick(burstEmojis), (el) => {
        el.style.left = event.clientX + 'px';
        el.style.top = event.clientY + 'px';
        el.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
        el.style.setProperty('--dy', Math.sin(angle) * distance + 'px');
      });
    }
  });

  // ---------- Activar / desactivar ----------
  function applyState() {
    decor.hidden = !enabled;
    document.body.classList.toggle('halloween-active', enabled);
    toggle.classList.toggle('is-off', !enabled);
    if (!enabled) {
      decor.querySelectorAll('.halloween-bat, .halloween-particle, .halloween-ghost, .halloween-burst')
        .forEach((el) => el.remove());
    }
  }

  toggle.addEventListener('click', () => {
    enabled = !enabled;
    try { localStorage.setItem('halloween-enabled', String(enabled)); } catch (e) {}
    applyState();
  });

  applyState();
})();