/* ============================================================
   KIRUBANANTHAN T — PORTFOLIO  |  Developer Edition
   ============================================================ */

:root {
  --bg: #080c10;
  --bg-2: #0c1118;
  --bg-3: #111820;
  --surface: rgba(255,255,255,0.03);
  --surface-2: rgba(255,255,255,0.06);
  --surface-hover: rgba(255,255,255,0.08);
  --text: #e8f0f8;
  --muted: #6b8099;
  --muted-2: #9ab0c6;
  --accent: #00d4ff;
  --accent-2: #ff6b35;
  --accent-3: #7c3aed;
  --green: #00ff88;
  --line: rgba(255,255,255,0.07);
  --line-2: rgba(0,212,255,0.2);
  --font-mono: 'JetBrains Mono', monospace;
  --font-sans: 'Space Grotesk', sans-serif;
  --font-display: 'Bebas Neue', sans-serif;
  --radius: 12px;
  --radius-lg: 20px;
  --transition: 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; font-size: 16px; }

body {
  font-family: var(--font-sans);
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  overflow-x: hidden;
  cursor: none;
}

/* ── CANVAS BACKGROUND ─────────────────────────────────── */
#bgCanvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

/* ── NOISE OVERLAY ──────────────────────────────────────── */
.noise-overlay {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 200px 200px;
}

/* ── CUSTOM CURSOR ──────────────────────────────────────── */
.cursor-dot {
  position: fixed;
  width: 6px;
  height: 6px;
  background: var(--accent);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  transition: opacity 0.3s;
  mix-blend-mode: screen;
}

.cursor-ring {
  position: fixed;
  width: 36px;
  height: 36px;
  border: 1px solid rgba(0, 212, 255, 0.5);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9998;
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease, border-color 0.3s ease, background 0.3s ease;
}

.cursor-ring.hover {
  width: 56px;
  height: 56px;
  border-color: var(--accent);
  background: rgba(0, 212, 255, 0.05);
}

/* ── TYPOGRAPHY ─────────────────────────────────────────── */
.mono { font-family: var(--font-mono); }
.small { font-size: 0.78rem; }
.tiny { font-size: 0.7rem; }

h1, h2, h3 { line-height: 1.1; }

.eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.15em;
  color: var(--accent);
  text-transform: uppercase;
}

.outline-text {
  -webkit-text-stroke: 1px var(--accent);
  color: transparent;
}

/* ── LAYOUT ─────────────────────────────────────────────── */
.container {
  width: min(1160px, 92%);
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.section { padding: 6rem 0; }

/* ── HEADER ─────────────────────────────────────────────── */
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(8, 12, 16, 0.8);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.nav-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 72px;
}

.brand {
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
}

.brand-text {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text);
  letter-spacing: 0.05em;
}

.brand-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.6); }
}

.site-nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0.45rem 0.8rem;
  text-decoration: none;
  color: var(--muted-2);
  font-size: 0.88rem;
  font-weight: 500;
  border-radius: 8px;
  transition: color 0.25s, background 0.25s;
}

.nav-link:hover {
  color: var(--text);
  background: var(--surface-2);
}

.nav-num {
  font-family: var(--font-mono);
  font-size: 0.64rem;
  color: var(--accent);
  opacity: 0.7;
}

.header-cta {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  border: 1px solid var(--line-2);
  background: rgba(0, 212, 255, 0.05);
  color: var(--accent);
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 600;
  transition: background 0.25s, border-color 0.25s, transform 0.25s;
}

.header-cta:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: var(--accent);
  transform: translateY(-1px);
}

.menu-toggle {
  display: none;
  border: 0;
  background: transparent;
  cursor: none;
  width: 40px;
  height: 36px;
  padding: 0;
}

.menu-toggle span {
  display: block;
  width: 22px;
  height: 1.5px;
  margin: 5px auto;
  background: var(--text);
  transition: 0.3s ease;
}

/* ── HERO ───────────────────────────────────────────────── */
.hero { padding-top: 5rem; padding-bottom: 4rem; }

.hero-layout {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 3rem;
  align-items: start;
}

.hero-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  background: rgba(0, 255, 136, 0.07);
  border: 1px solid rgba(0, 255, 136, 0.2);
  font-size: 0.82rem;
  font-weight: 500;
  color: #00ff88;
  margin-bottom: 1rem;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--green);
  animation: pulse-dot 1.8s ease-in-out infinite;
}

.hero-tag {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.78rem;
  color: var(--muted);
  margin-bottom: 1.4rem;
}

.hero-tag .sep { color: var(--accent); opacity: 0.6; }

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(4rem, 7vw, 7rem);
  letter-spacing: 0.02em;
  line-height: 0.96;
  margin-bottom: 1.6rem;
  display: flex;
  flex-direction: column;
}

.title-line { display: block; }

.accent-line {
  -webkit-text-stroke: 2px var(--accent);
  color: transparent;
}

.hero-lead {
  font-size: 1.05rem;
  color: var(--muted-2);
  max-width: 56ch;
  line-height: 1.7;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

/* ── BUTTONS ────────────────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 1.6rem;
  border-radius: 8px;
  border: 1px solid transparent;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: var(--font-sans);
  transition: var(--transition);
  position: relative;
  overflow: hidden;
  cursor: none;
}

.btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.08);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s ease;
}

.btn:hover::before { transform: scaleX(1); }

.btn-primary {
  background: var(--accent);
  color: #080c10;
  font-weight: 700;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 212, 255, 0.3);
}

.btn-ghost {
  background: transparent;
  border-color: var(--line-2);
  color: var(--text);
}

.btn-ghost:hover {
  border-color: var(--accent);
  color: var(--accent);
  transform: translateY(-2px);
}

/* ── CHIPS ──────────────────────────────────────────────── */
.trust-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.chip {
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  background: var(--surface);
  border: 1px solid var(--line);
  color: var(--muted-2);
  font-size: 0.8rem;
  font-weight: 500;
  font-family: var(--font-mono);
  transition: border-color 0.25s, color 0.25s;
}

.chip:hover {
  border-color: rgba(0, 212, 255, 0.3);
  color: var(--accent);
}

/* ── PROFILE CARD ───────────────────────────────────────── */
.profile-card {
  position: relative;
  background: var(--bg-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 2rem;
  overflow: hidden;
  transition: border-color 0.3s, transform 0.3s;
}

.profile-card:hover {
  border-color: rgba(0, 212, 255, 0.25);
}

.profile-glow {
  position: absolute;
  top: -80px;
  right: -80px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: rgba(0, 212, 255, 0.06);
  filter: blur(50px);
  pointer-events: none;
}

.profile-img-wrap {
  position: relative;
  width: 90px;
  height: 90px;
  margin-bottom: 1.2rem;
}

.profile-img {
  width: 90px;
  height: 90px;
  border-radius: 14px;
  object-fit: cover;
  border: 2px solid var(--line-2);
  display: block;
}

.profile-ring {
  position: absolute;
  inset: -5px;
  border-radius: 18px;
  border: 1px dashed rgba(0, 212, 255, 0.3);
  animation: spin 12s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.profile-info {
  margin-bottom: 1.4rem;
}

.profile-info .small { color: var(--accent); margin-bottom: 0.4rem; }
.profile-name { font-size: 1.4rem; font-weight: 700; color: var(--text); margin-bottom: 0.2rem; }
.profile-role { color: var(--muted); font-size: 0.9rem; }

.profile-stats {
  display: flex;
  align-items: center;
  gap: 0;
  background: var(--surface);
  border-radius: var(--radius);
  border: 1px solid var(--line);
  margin-bottom: 1.2rem;
  overflow: hidden;
}

.stat-item {
  flex: 1;
  padding: 0.9rem 0.6rem;
  text-align: center;
}

.stat-num {
  display: block;
  font-family: var(--font-mono);
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--accent);
}

.stat-item span { font-size: 0.8rem; color: var(--accent); opacity: 0.7; }
.stat-item p { font-size: 0.7rem; color: var(--muted); margin-top: 3px; }

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--line);
  flex-shrink: 0;
}

.focus-pills { display: flex; flex-direction: column; gap: 0.6rem; }

.focus-pill {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.8rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  transition: border-color 0.25s, background 0.25s;
}

.focus-pill:hover {
  background: var(--surface-hover);
  border-color: rgba(0, 212, 255, 0.2);
}

.pill-icon { font-size: 1.1rem; flex-shrink: 0; line-height: 1; padding-top: 2px; }
.focus-pill strong { font-size: 0.85rem; font-weight: 600; color: var(--text); display: block; margin-bottom: 2px; }
.focus-pill p { font-size: 0.76rem; color: var(--muted); line-height: 1.4; }

/* ── SCROLL HINT ────────────────────────────────────────── */
.scroll-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-top: 4rem;
  color: var(--muted);
  animation: fade-up 1s ease 1.2s both;
}

.scroll-line {
  width: 1px;
  height: 48px;
  background: linear-gradient(to bottom, var(--accent), transparent);
  animation: scroll-drop 2s ease-in-out infinite;
}

@keyframes scroll-drop {
  0%, 100% { transform: scaleY(1); transform-origin: top; }
  50% { transform: scaleY(0.4); transform-origin: bottom; }
}

/* ── ABOUT STRIP ────────────────────────────────────────── */
.about-strip { padding: 2.5rem 0; }

.strip-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.strip-card {
  position: relative;
  padding: 2rem;
  background: var(--bg-2);
  transition: background 0.3s;
  overflow: hidden;
}

.strip-card:hover { background: var(--bg-3); }

.strip-card-highlight {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--accent), var(--accent-3));
}

.strip-num {
  font-size: 0.7rem;
  color: var(--accent);
  opacity: 0.7;
  margin-bottom: 0.8rem;
}

.strip-card h3 { font-size: 1rem; font-weight: 600; margin-bottom: 0.6rem; }
.strip-card p { font-size: 0.85rem; color: var(--muted); line-height: 1.6; }

/* ── SECTION HEADS ──────────────────────────────────────── */
.section-head {
  margin-bottom: 2.5rem;
}

.section-title {
  font-family: var(--font-display);
  font-size: clamp(2.8rem, 5vw, 4.5rem);
  letter-spacing: 0.03em;
  margin-top: 0.3rem;
  line-height: 1;
}

/* ── SKILL GRID ─────────────────────────────────────────── */
.skill-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.skill-card {
  background: var(--bg-2);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 1.5rem;
  transition: border-color 0.3s, transform 0.3s, background 0.3s;
  position: relative;
  overflow: hidden;
}

.skill-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.skill-card:hover::after { transform: scaleX(1); }
.skill-card:hover {
  border-color: rgba(0, 212, 255, 0.25);
  transform: translateY(-3px);
  background: var(--bg-3);
}

.skill-icon {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  color: var(--accent);
  margin-bottom: 0.8rem;
  font-weight: 500;
}

.skill-card h3 { font-size: 0.92rem; font-weight: 600; margin-bottom: 0.5rem; }
.skill-card p { font-size: 0.82rem; color: var(--muted); line-height: 1.6; }

/* ── TIMELINE ───────────────────────────────────────────── */
.timeline { display: flex; flex-direction: column; gap: 0; }

.timeline-item {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 1.5rem;
  position: relative;
}

.tl-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 4px;
}

.tl-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--muted);
  background: var(--bg);
  flex-shrink: 0;
  transition: border-color 0.3s;
  z-index: 1;
}

.tl-dot.active {
  border-color: var(--accent);
  background: var(--accent);
  box-shadow: 0 0 0 4px rgba(0, 212, 255, 0.15);
}

.tl-line {
  width: 1px;
  flex: 1;
  background: var(--line);
  margin: 6px 0;
  min-height: 40px;
}

.tl-body {
  padding-bottom: 2.5rem;
}

.tl-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.tl-head h3 { font-size: 1.05rem; font-weight: 600; }
.tl-company { font-size: 0.85rem; color: var(--accent); margin-top: 3px; }

.tl-badge {
  padding: 0.3rem 0.7rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-family: var(--font-mono);
  font-weight: 500;
  background: var(--surface);
  border: 1px solid var(--line);
  color: var(--muted-2);
  white-space: nowrap;
}

.current-badge {
  background: rgba(0, 255, 136, 0.08);
  border-color: rgba(0, 255, 136, 0.3);
  color: var(--green);
}

.tl-list {
  padding-left: 1rem;
  margin-bottom: 1rem;
}

.tl-list li {
  font-size: 0.88rem;
  color: var(--muted-2);
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.tl-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tl-tags span {
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.72rem;
  font-family: var(--font-mono);
  background: var(--surface);
  border: 1px solid var(--line);
  color: var(--muted);
}

/* ── PROJECTS ───────────────────────────────────────────── */
.project-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.project-card {
  position: relative;
  background: var(--bg-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  overflow: hidden;
  transition: border-color 0.3s, transform 0.3s;
}

.project-card:hover {
  border-color: rgba(0, 212, 255, 0.3);
  transform: translateY(-4px);
}

.project-featured {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.04), var(--bg-2));
}

.project-num {
  font-size: 0.7rem;
  color: var(--accent);
  opacity: 0.6;
}

.project-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.project-tag {
  padding: 0.3rem 0.65rem;
  border-radius: 5px;
  font-size: 0.7rem;
  font-weight: 700;
  font-family: var(--font-mono);
}

.flagship {
  background: rgba(255, 107, 53, 0.1);
  color: var(--accent-2);
  border: 1px solid rgba(255, 107, 53, 0.25);
}

.web-app {
  background: rgba(124, 58, 237, 0.1);
  color: #a78bfa;
  border: 1px solid rgba(124, 58, 237, 0.25);
}

.productivity {
  background: rgba(0, 212, 255, 0.08);
  color: var(--accent);
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.internal {
  background: rgba(255,255,255,0.04);
  color: var(--muted);
  border: 1px solid var(--line);
}

.project-live {
  font-size: 0.72rem;
  color: var(--green);
  font-family: var(--font-mono);
}

.muted-live { color: var(--muted) !important; }

.project-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text);
}

.project-desc {
  font-size: 0.88rem;
  color: var(--muted-2);
  line-height: 1.65;
  flex: 1;
}

.project-stack {
  font-size: 0.74rem;
  color: var(--accent);
  opacity: 0.8;
}

.project-footer {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid var(--line);
}

.project-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0.5rem 1rem;
  border-radius: 7px;
  background: var(--surface);
  border: 1px solid var(--line);
  color: var(--text);
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 600;
  transition: border-color 0.25s, color 0.25s, background 0.25s;
}

.project-link:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(0, 212, 255, 0.05);
}

.link-arrow { transition: transform 0.25s; }
.project-link:hover .link-arrow { transform: translate(2px, -2px); }

.project-private {
  font-size: 0.82rem;
  color: var(--muted);
  font-style: italic;
  display: flex;
  align-items: center;
}

.project-bg-num {
  position: absolute;
  bottom: -0.5rem;
  right: 1rem;
  font-family: var(--font-display);
  font-size: 6rem;
  color: var(--text);
  opacity: 0.02;
  line-height: 1;
  pointer-events: none;
  user-select: none;
}

/* ── EDUCATION ──────────────────────────────────────────── */
.split-edu {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.edu-card {
  background: var(--bg-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 2rem;
  transition: border-color 0.3s;
}

.edu-card:hover { border-color: rgba(0, 212, 255, 0.25); }
.edu-card h3 { font-size: 1.05rem; font-weight: 600; margin: 0.5rem 0 0.8rem; }
.edu-uni { font-size: 0.9rem; color: var(--accent); font-weight: 600; margin-bottom: 0.4rem; }
.edu-detail { font-size: 0.82rem; color: var(--muted); }

/* ── CONTACT ────────────────────────────────────────────── */
.contact-section {
  border-top: 1px solid var(--line);
}

.contact-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: start;
}

.contact-heading {
  font-family: var(--font-display);
  font-size: clamp(3rem, 5vw, 5rem);
  letter-spacing: 0.03em;
  line-height: 1;
  margin: 0.6rem 0 1rem;
}

.contact-sub {
  font-size: 0.9rem;
  color: var(--muted);
  line-height: 1.7;
  max-width: 38ch;
}

.contact-right { display: flex; flex-direction: column; gap: 0; }

.contact-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 0;
  border-bottom: 1px solid var(--line);
  text-decoration: none;
  color: var(--text);
  transition: color 0.25s;
  gap: 1rem;
}

.contact-link.no-link { cursor: default; }

.contact-link:not(.no-link):hover {
  color: var(--accent);
}

.contact-link:not(.no-link):hover .cl-arrow {
  transform: translate(3px, -3px);
}

.cl-label {
  font-size: 0.7rem;
  color: var(--muted);
  width: 90px;
  flex-shrink: 0;
}

.cl-val {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 500;
}

.cl-arrow {
  font-size: 1rem;
  transition: transform 0.25s;
  color: var(--accent);
  opacity: 0;
}

.contact-link:not(.no-link):hover .cl-arrow { opacity: 1; }

/* ── FOOTER ─────────────────────────────────────────────── */
.site-footer {
  padding: 2rem 0;
  border-top: 1px solid var(--line);
}

.footer-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.footer-wrap p { color: var(--muted); }

.footer-links {
  display: flex;
  gap: 1.5rem;
}

.footer-links a {
  color: var(--muted);
  text-decoration: none;
  font-size: 0.8rem;
  transition: color 0.25s;
}

.footer-links a:hover { color: var(--accent); }

/* ── REVEAL ANIMATION ───────────────────────────────────── */
.reveal-up {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.7s ease, transform 0.7s ease;
  transition-delay: var(--d, 0s);
}

.reveal-up.visible {
  opacity: 1;
  transform: translateY(0);
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── MAGNETIC BUTTONS ───────────────────────────────────── */
.magnetic { position: relative; }

/* ── RESPONSIVE ─────────────────────────────────────────── */
@media (max-width: 1080px) {
  .hero-layout,
  .skill-grid,
  .project-grid,
  .split-edu,
  .contact-inner {
    grid-template-columns: 1fr;
  }

  .strip-grid {
    grid-template-columns: 1fr;
  }

  .contact-inner { gap: 2rem; }

  .hero-title { font-size: clamp(3.5rem, 8vw, 5.5rem); }
}

@media (max-width: 760px) {
  .section { padding: 4rem 0; }

  .site-nav {
    position: absolute;
    top: 72px;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    background: rgba(8, 12, 16, 0.98);
    border-bottom: 1px solid var(--line);
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }

  .site-nav .nav-link {
    padding: 0.9rem 4%;
    border-top: 1px solid var(--line);
    border-radius: 0;
  }

  .site-nav.open { max-height: 340px; }

  .menu-toggle { display: block; }

  .menu-toggle.active span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
  .menu-toggle.active span:nth-child(2) { opacity: 0; }
  .menu-toggle.active span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

  .header-cta { display: none; }
  .hero-title { font-size: clamp(3rem, 10vw, 4.5rem); }
  .profile-stats { flex-direction: column; }
  .stat-divider { width: 100%; height: 1px; }
  .footer-wrap { flex-direction: column; text-align: center; }

  body { cursor: auto; }
  .cursor-dot, .cursor-ring { display: none; }
}

/* ── SCROLLBAR ──────────────────────────────────────────── */
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: rgba(0, 212, 255, 0.25); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(0, 212, 255, 0.5); }
