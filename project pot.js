/* Kirubananthan T — cinematic portfolio interactions */
document.documentElement.classList.add('js');

(() => {
  'use strict';

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const state = {
    gsapAvailable: false,
    particleController: null,
    cursorController: null,
    matchMediaContexts: []
  };

  function initAccessibility() {
    const exposeContent = () => {
      $$('.reveal').forEach(element => element.classList.add('is-visible'));
      if ($('#preloader')) $('#preloader').classList.add('is-done');
    };

    if (reducedMotion.matches) exposeContent();
    reducedMotion.addEventListener('change', event => {
      if (!event.matches) return;
      exposeContent();
      document.body.classList.remove('cursor-enabled');
      if (state.particleController) state.particleController.stop();
      if (state.cursorController) state.cursorController.stop();
    });
  }

  function initPreloader(onComplete) {
    const preloader = $('#preloader');
    if (!preloader || reducedMotion.matches) {
      if (preloader) preloader.classList.add('is-done');
      onComplete();
      return;
    }

    let returning = false;
    try {
      returning = sessionStorage.getItem('kt-product-portfolio-visited') === 'true';
      sessionStorage.setItem('kt-product-portfolio-visited', 'true');
    } catch (error) {
      /* Storage can be unavailable in privacy modes. */
    }

    if (returning) document.documentElement.classList.add('returning');
    const delay = returning ? 220 : 880;
    window.setTimeout(() => {
      preloader.classList.add('is-done');
      onComplete();
    }, delay);
  }

  function initHeroIntro() {
    if (!state.gsapAvailable || reducedMotion.matches) return;
    const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
    intro
      .from('.intro-item', { autoAlpha: 0, y: 24, duration: 0.8, stagger: 0.1 })
      .from('.hero-title-primary .text-mask > span', { yPercent: 110, duration: 0.95, stagger: 0.07 }, 0.08);
  }

  function initHeroStory() {
    if (!state.gsapAvailable) return;
    const media = gsap.matchMedia();
    state.matchMediaContexts.push(media);

    media.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', () => {
      const section = $('.hero-story');
      const pin = $('.hero-pin');
      const primaryLines = $$('.hero-title-primary .text-mask > span');
      const secondary = $('.hero-title-secondary');
      const secondaryLines = $$('.hero-title-secondary .text-mask > span');
      const transition = $('.hero-transition');
      const transitionLines = $$('.hero-transition .text-mask > span');
      const detail = $('.hero-detail');
      const portrait = $('.portrait-stage');
      const labels = $$('.tech-label');
      if (!section || !pin || !secondary || !transition || !detail || !portrait) return undefined;

      gsap.set(detail, { autoAlpha: 0, y: 28 });
      gsap.set(secondary, { autoAlpha: 1, visibility: 'visible' });
      gsap.set(secondaryLines, { yPercent: 112 });
      gsap.set(transition, { autoAlpha: 0, visibility: 'visible' });
      gsap.set(transitionLines, { yPercent: 112 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=360%',
          pin,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      timeline
        .to(detail, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out' }, 0.05)
        .to(labels, { y: index => index % 2 ? -10 : 9, x: index => index % 3 ? 4 : -5, stagger: 0.035, duration: 0.55 }, 0.25)
        .to(portrait, { scale: 1.055, duration: 0.65, ease: 'power2.inOut' }, 0.48)
        .to(detail, { autoAlpha: 0, y: -22, duration: 0.35 }, 0.9)
        .to(primaryLines, { yPercent: -112, duration: 0.55, stagger: 0.045, ease: 'power3.inOut' }, 0.98)
        .to(secondaryLines, { yPercent: 0, duration: 0.62, stagger: 0.05, ease: 'power4.out' }, 1.12)
        .to('.availability, .hero-kicker', { autoAlpha: 0, y: -16, duration: 0.35 }, 1.2)
        .to(portrait, { xPercent: 8, autoAlpha: 0.18, scale: 1.08, duration: 0.75 }, 1.65)
        .to(secondaryLines, { yPercent: -112, duration: 0.55, stagger: 0.045, ease: 'power3.inOut' }, 1.7)
        .to(transition, { autoAlpha: 1, duration: 0.2 }, 1.82)
        .to(transitionLines, { yPercent: 0, duration: 0.72, stagger: 0.055, ease: 'power4.out' }, 1.88)
        .to('.hero-scroll', { autoAlpha: 0, duration: 0.25 }, 2.05)
        .to(transitionLines, { yPercent: -18, scale: 0.97, duration: 0.65, ease: 'power2.inOut' }, 2.55);

      return () => {
        timeline.kill();
        gsap.set([detail, secondary, transition, portrait, labels, primaryLines, secondaryLines, transitionLines], { clearProps: 'all' });
      };
    });
  }

  function initProjectStory() {
    if (!state.gsapAvailable) return;
    const media = gsap.matchMedia();
    state.matchMediaContexts.push(media);

    media.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', () => {
      const section = $('.projects-story');
      const pin = $('.project-pin');
      const slides = $$('.project-slide');
      const reel = $('#projectCounterReel');
      const progress = $('#projectProgress');
      if (!section || !pin || slides.length !== 5 || !reel || !progress) return undefined;

      gsap.set(slides, { autoAlpha: 0, y: 40, scale: 1.02 });
      gsap.set(slides[0], { autoAlpha: 1, y: 0, scale: 1 });
      gsap.set(progress, { scaleX: 0.2 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${(slides.length - 1) * 115}%`,
          pin,
          scrub: 0.75,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      slides.slice(1).forEach((slide, index) => {
        const previous = slides[index];
        const visual = $('.project-visual', slide);
        const position = index + 0.65;
        timeline
          .to(previous, { autoAlpha: 0, y: -40, scale: 0.97, duration: 0.38, ease: 'power2.in' }, position)
          .fromTo(slide, { autoAlpha: 0, y: 40, scale: 1.02 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' }, position + 0.1)
          .fromTo(visual, { x: 24 }, { x: 0, duration: 0.55, ease: 'power3.out' }, position + 0.12)
          .to(reel, { yPercent: -20 * (index + 1), duration: 0.48, ease: 'power3.inOut' }, position)
          .to(progress, { scaleX: (index + 2) / slides.length, duration: 0.48, ease: 'power2.inOut' }, position);
      });

      return () => {
        timeline.kill();
        gsap.set([slides, reel, progress], { clearProps: 'all' });
      };
    });
  }

  function initStackScroll() {
    if (!state.gsapAvailable) return;
    const media = gsap.matchMedia();
    state.matchMediaContexts.push(media);

    media.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', () => {
      const section = $('.stack-story');
      const pin = $('.stack-pin');
      const track = $('#stackTrack');
      const progress = $('#stackProgress');
      if (!section || !pin || !track || !progress) return undefined;

      const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth + 56);
      const tween = gsap.to(track, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${getDistance()}`,
          pin,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: self => gsap.set(progress, { scaleX: self.progress })
        }
      });

      return () => {
        tween.kill();
        gsap.set([track, progress], { clearProps: 'all' });
      };
    });
  }

  function initExperienceTimeline() {
    if (!state.gsapAvailable) return;
    const media = gsap.matchMedia();
    state.matchMediaContexts.push(media);

    media.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', () => {
      const section = $('.experience-story');
      const pin = $('.experience-pin');
      const items = $$('.experience-item');
      const reel = $('#experienceDateReel');
      const progress = $('#experienceProgress');
      const dot = $('#experienceDot');
      if (!section || !pin || items.length !== 3 || !reel || !progress || !dot) return undefined;

      gsap.set(items, { autoAlpha: 0, y: 34 });
      gsap.set(items[0], { autoAlpha: 1, y: 0 });
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=230%',
          pin,
          scrub: 0.75,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      items.slice(1).forEach((item, index) => {
        const previous = items[index];
        const position = index + 0.55;
        timeline
          .to(previous, { autoAlpha: 0, y: -34, duration: 0.38 }, position)
          .fromTo(item, { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }, position + 0.08)
          .to(reel, { yPercent: -(100 / 3) * (index + 1), duration: 0.46, ease: 'power3.inOut' }, position)
          .to(progress, { scaleY: (index + 1) / 2, duration: 0.46 }, position)
          .to(dot, { y: () => (pin.clientHeight - 165) * ((index + 1) / 2), duration: 0.46, ease: 'power3.inOut' }, position);
      });

      return () => {
        timeline.kill();
        gsap.set([items, reel, progress, dot], { clearProps: 'all' });
      };
    });
  }

  function initReveals() {
    const elements = $$('.reveal');
    if (!state.gsapAvailable || reducedMotion.matches) {
      elements.forEach(element => element.classList.add('is-visible'));
      return;
    }

    ScrollTrigger.batch(elements, {
      start: 'top 88%',
      once: true,
      onEnter: batch => {
        batch.forEach(element => element.classList.add('is-visible'));
        gsap.fromTo(batch, { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.08, ease: 'power3.out', overwrite: true });
      }
    });

    $$('.section-heading .text-mask > span, .contact-title .text-mask > span').forEach(line => {
      gsap.from(line, {
        yPercent: 108,
        duration: 0.9,
        ease: 'power4.out',
        scrollTrigger: { trigger: line, start: 'top 90%', once: true }
      });
    });
  }

  function initNavigation() {
    const button = $('#menuToggle');
    const navigation = $('#siteNav');
    const header = $('#siteHeader');
    const links = $$('.nav-link');

    const closeMenu = () => {
      if (!button || !navigation) return;
      button.classList.remove('active');
      navigation.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Open navigation');
    };

    if (button && navigation) {
      button.addEventListener('click', () => {
        const open = button.getAttribute('aria-expanded') !== 'true';
        button.classList.toggle('active', open);
        navigation.classList.toggle('open', open);
        button.setAttribute('aria-expanded', String(open));
        button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      });
      $$('a', navigation).forEach(link => link.addEventListener('click', closeMenu));
      document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
    }

    if (state.gsapAvailable) {
      const navigationSections = links.map(link => $(link.getAttribute('href'))).filter(Boolean);
      const updateActiveLink = () => {
        let current = null;
        const marker = innerHeight * 0.5;
        navigationSections.forEach(section => {
          const bounds = section.getBoundingClientRect();
          if (bounds.top <= marker && bounds.bottom >= innerHeight * 0.15) current = section;
        });
        if (scrollY >= document.documentElement.scrollHeight - innerHeight - 4) current = $('#contact');
        links.forEach(link => {
          const active = current && link.getAttribute('href') === `#${current.id}`;
          link.classList.toggle('active', Boolean(active));
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      };
      ScrollTrigger.create({
        start: 24,
        end: 'max',
        onUpdate: self => {
          if (header) header.classList.toggle('scrolled', self.scroll() > 24);
          updateActiveLink();
        },
        onRefresh: updateActiveLink
      });
    } else {
      window.addEventListener('scroll', () => header && header.classList.toggle('scrolled', window.scrollY > 24), { passive: true });
    }
  }

  function initScrollProgress() {
    const progress = $('#scrollProgress');
    if (!progress) return;
    if (state.gsapAvailable) {
      const setProgress = gsap.quickSetter(progress, 'scaleX');
      ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => setProgress(self.progress) });
      return;
    }
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const height = document.documentElement.scrollHeight - innerHeight;
        progress.style.transform = `scaleX(${height > 0 ? scrollY / height : 0})`;
        ticking = false;
      });
    }, { passive: true });
  }

  function initCursor() {
    const dot = $('#cursorDot');
    const ring = $('#cursorRing');
    const spotlight = $('#cursorSpotlight');
    if (!dot || !ring || !spotlight || reducedMotion.matches || !precisePointer.matches) return;

    document.body.classList.add('cursor-enabled');
    let mouseX = innerWidth / 2;
    let mouseY = innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let lightX = mouseX;
    let lightY = mouseY;
    let frame = 0;
    let running = true;

    const render = () => {
      if (!running) return;
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      lightX += (mouseX - lightX) * 0.07;
      lightY += (mouseY - lightY) * 0.07;
      dot.style.transform = `translate3d(${mouseX}px,${mouseY}px,0) translate(-50%,-50%)`;
      ring.style.transform = `translate3d(${ringX}px,${ringY}px,0) translate(-50%,-50%)`;
      spotlight.style.transform = `translate3d(${lightX}px,${lightY}px,0) translate(-50%,-50%)`;
      frame = requestAnimationFrame(render);
    };
    const start = () => { if (running) return; running = true; render(); };
    const stop = () => { running = false; cancelAnimationFrame(frame); };

    window.addEventListener('pointermove', event => { mouseX = event.clientX; mouseY = event.clientY; }, { passive: true });
    $$('a, button, .project-glow').forEach(element => {
      element.addEventListener('mouseenter', () => ring.classList.add('hover'));
      element.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    state.cursorController = { start, stop };
    render();
  }

  function initMagnetic() {
    if (!state.gsapAvailable || reducedMotion.matches || !precisePointer.matches) return;
    $$('.magnetic').forEach(element => {
      const moveX = gsap.quickTo(element, 'x', { duration: 0.35, ease: 'power3.out' });
      const moveY = gsap.quickTo(element, 'y', { duration: 0.35, ease: 'power3.out' });
      element.addEventListener('pointermove', event => {
        const bounds = element.getBoundingClientRect();
        moveX((event.clientX - bounds.left - bounds.width / 2) * 0.12);
        moveY((event.clientY - bounds.top - bounds.height / 2) * 0.12);
      }, { passive: true });
      element.addEventListener('pointerleave', () => { moveX(0); moveY(0); });
    });
  }

  function initProjectGlow() {
    if (!precisePointer.matches) return;
    $$('.project-glow').forEach(element => {
      element.addEventListener('pointermove', event => {
        const bounds = element.getBoundingClientRect();
        element.style.setProperty('--glow-x', `${event.clientX - bounds.left}px`);
        element.style.setProperty('--glow-y', `${event.clientY - bounds.top}px`);
      }, { passive: true });
    });
  }

  function initParticles() {
    const canvas = $('#bgCanvas');
    if (!canvas || reducedMotion.matches) return;
    const media = state.gsapAvailable ? gsap.matchMedia() : null;
    if (media) state.matchMediaContexts.push(media);

    const create = () => {
      const context = canvas.getContext('2d', { alpha: true });
      if (!context) return undefined;
      let width = 0;
      let height = 0;
      let particles = [];
      let frame = 0;
      let running = false;
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      const particleColor = getComputedStyle(document.documentElement).getPropertyValue('--cyan').trim() || '#38D8FF';

      const resize = () => {
        width = innerWidth;
        height = innerHeight;
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        const count = Math.min(42, Math.max(18, Math.round((width * height) / 34000)));
        particles = Array.from({ length: count }, () => ({ x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - 0.5) * 0.065, vy: (Math.random() - 0.5) * 0.065, radius: Math.random() * 0.75 + 0.3, alpha: Math.random() * 0.16 + 0.05 }));
      };
      const draw = () => {
        if (!running) return;
        context.clearRect(0, 0, width, height);
        particles.forEach(particle => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          if (particle.x < -4) particle.x = width + 4;
          if (particle.x > width + 4) particle.x = -4;
          if (particle.y < -4) particle.y = height + 4;
          if (particle.y > height + 4) particle.y = -4;
          context.beginPath();
          context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          context.globalAlpha = particle.alpha;
          context.fillStyle = particleColor;
          context.fill();
        });
        context.globalAlpha = 1;
        frame = requestAnimationFrame(draw);
      };
      const start = () => { if (running || document.hidden) return; running = true; draw(); };
      const stop = () => { running = false; cancelAnimationFrame(frame); };
      let resizeFrame = 0;
      const onResize = () => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(resize); };
      const onVisibility = () => document.hidden ? stop() : start();
      window.addEventListener('resize', onResize, { passive: true });
      document.addEventListener('visibilitychange', onVisibility);
      resize();
      start();
      state.particleController = { start, stop };

      if (state.gsapAvailable) {
        gsap.to(canvas, { opacity: 0.1, ease: 'none', scrollTrigger: { trigger: '.hero-story', start: 'top top', end: 'bottom top', scrub: true } });
      }
      return () => {
        stop();
        window.removeEventListener('resize', onResize);
        document.removeEventListener('visibilitychange', onVisibility);
        context.clearRect(0, 0, width, height);
      };
    };

    if (media) media.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', create);
    else if (innerWidth > 768) create();
  }

  function initialize() {
    state.gsapAvailable = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
    if (state.gsapAvailable) {
      gsap.registerPlugin(ScrollTrigger);
      document.documentElement.classList.add('gsap-ready');
      ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true });
    }

    initAccessibility();
    initNavigation();
    initScrollProgress();
    initHeroStory();
    initProjectStory();
    initStackScroll();
    initExperienceTimeline();
    initReveals();
    initCursor();
    initMagnetic();
    initProjectGlow();
    initParticles();

    const year = $('#currentYear');
    if (year) year.textContent = new Date().getFullYear();

    initPreloader(initHeroIntro);
    window.addEventListener('load', () => {
      if (state.gsapAvailable) ScrollTrigger.refresh();
    }, { once: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
