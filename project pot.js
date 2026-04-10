/* project_pot.js — Kirubananthan T Portfolio JS */

/* ══ UTILITIES ══════════════════════════════════════════════ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ══ NAV ════════════════════════════════════════════════════ */
const menuToggle = $('#menuToggle');
const siteNav = $('#siteNav');
if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    menuToggle.classList.toggle('active');
    siteNav.classList.toggle('open');
  });
  $$('a', siteNav).forEach(a => a.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.classList.remove('active');
    siteNav.classList.remove('open');
  }));
}

/* ══ YEAR ═══════════════════════════════════════════════════ */
const yearEl = $('#currentYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ══ REVEAL ON SCROLL ════════════════════════════════════════ */
const revealItems = $$('.reveal-up');
if ('IntersectionObserver' in window && revealItems.length) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealItems.forEach(el => obs.observe(el));
} else {
  revealItems.forEach(el => el.classList.add('visible'));
}

/* ══ CUSTOM CURSOR ═══════════════════════════════════════════ */
const dot = $('#cursorDot');
const ring = $('#cursorRing');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
let rafCursor;

if (dot && ring && window.innerWidth > 760) {
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    rafCursor = requestAnimationFrame(animateRing);
  }
  animateRing();

  $$('a, button, .magnetic, .chip, .focus-pill, .project-card, .skill-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });

  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
}

/* ══ MAGNETIC BUTTON EFFECT ══════════════════════════════════ */
if (window.innerWidth > 760) {
  $$('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.35;
      const dy = (e.clientY - cy) * 0.35;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)';
      el.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      setTimeout(() => el.style.transition = '', 500);
    });
    el.addEventListener('mouseenter', () => { el.style.transition = 'transform 0.1s ease'; });
  });
}

/* ══ CANVAS PARTICLE SYSTEM ══════════════════════════════════ */
(function initCanvas() {
  const canvas = $('#bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: -9999, y: -9999 }, animId;
  const COUNT_FACTOR = 8000;
  const CONNECTION_DIST = 130;
  const MOUSE_DIST = 180;
  const MOUSE_REPEL = false; // true = repel, false = attract

  const COLORS = [
    'rgba(0,212,255,',
    'rgba(124,58,237,',
    'rgba(255,107,53,',
    'rgba(0,255,136,',
    'rgba(168,176,204,'
  ];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initParticles();
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function initParticles() {
    particles = [];
    const count = Math.max(40, Math.floor((W * H) / COUNT_FACTOR));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: rand(0, W), y: rand(0, H),
        vx: rand(-0.18, 0.18), vy: rand(-0.18, 0.18),
        baseVx: 0, baseVy: 0,
        r: rand(1.2, 2.8),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: rand(0.35, 0.75),
        phase: rand(0, Math.PI * 2),
        phaseSpeed: rand(0.008, 0.022)
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* draw connections first */
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const a = (1 - dist / CONNECTION_DIST) * 0.2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(0,212,255,${a})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    /* update + draw particles */
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.phase += p.phaseSpeed;

      const mdx = mouse.x - p.x;
      const mdy = mouse.y - p.y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

      if (mdist < MOUSE_DIST && mdist > 0) {
        const force = ((MOUSE_DIST - mdist) / MOUSE_DIST) * 0.06;
        const dir = MOUSE_REPEL ? -1 : 1;
        p.vx += (mdx / mdist) * force * dir;
        p.vy += (mdy / mdist) * force * dir;

        /* mouse → particle line */
        const la = (1 - mdist / MOUSE_DIST) * 0.45;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(0,212,255,${la})`;
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }

      /* friction */
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.x += p.vx;
      p.y += p.vy;

      /* wrap */
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;

      /* pulsating size */
      const pulse = p.r * (0.82 + 0.18 * Math.sin(p.phase));
      const alpha = p.alpha * (0.75 + 0.25 * Math.sin(p.phase));

      ctx.beginPath();
      ctx.arc(p.x, p.y, pulse, 0, Math.PI * 2);
      ctx.fillStyle = p.color + alpha + ')';
      ctx.fill();
    }

    /* soft radial glow at cursor */
    if (mouse.x > -100) {
      const grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 160);
      grd.addColorStop(0, 'rgba(0,212,255,0.055)');
      grd.addColorStop(1, 'rgba(0,212,255,0)');
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 160, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    }

    animId = requestAnimationFrame(draw);
  }

  /* mouse tracking */
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
    draw();
  });

  resize();
  draw();
})();

/* ══ COUNTER ANIMATION ══════════════════════════════════════ */
const counters = $$('.counter[data-target]');
if (counters.length) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.target, 10);
      let current = 0;
      const step = Math.ceil(target / 40);
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current;
        if (current >= target) clearInterval(timer);
      }, 35);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(el => obs.observe(el));
}

/* ══ ACTIVE NAV HIGHLIGHT ════════════════════════════════════ */
const sections = $$('section[id]');
const navLinks = $$('.nav-link');
if (sections.length && navLinks.length) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(a => {
          a.style.color = '';
          if (a.getAttribute('href') === '#' + e.target.id) {
            a.style.color = 'var(--accent)';
          }
        });
      }
    });
  }, { threshold: 0.45 });
  sections.forEach(s => obs.observe(s));
}

/* ══ PARALLAX HERO TITLE ════════════════════════════════════ */
const heroTitle = $('.hero-title');
if (heroTitle && window.innerWidth > 760) {
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    heroTitle.style.transform = `translateY(${sy * 0.18}px)`;
    heroTitle.style.opacity = Math.max(0, 1 - sy / 500);
  }, { passive: true });
}

/* ══ TILT EFFECT ON PROJECT CARDS ═══════════════════════════ */
if (window.innerWidth > 760) {
  $$('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const rx = ((e.clientY - cy) / rect.height) * 8;
      const ry = ((e.clientX - cx) / rect.width) * -8;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
      setTimeout(() => card.style.transition = '', 500);
    });
    card.addEventListener('mouseenter', () => card.style.transition = 'transform 0.1s ease');
  });
}

/* ══ HEADER SCROLL SHRINK ════════════════════════════════════ */
const header = $('.site-header');
if (header) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      header.style.background = 'rgba(8,12,16,0.95)';
    } else {
      header.style.background = 'rgba(8,12,16,0.8)';
    }
  }, { passive: true });
}
