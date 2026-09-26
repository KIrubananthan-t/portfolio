/* Kirubananthan T — cinematic portfolio interactions */
document.documentElement.classList.add('js');

(() => {
  'use strict';

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const precisePointer = window.matchMedia('(min-width: 769px) and (hover: hover) and (pointer: fine)');
  const state = {
    gsapAvailable: false,
    heroIntro: null,
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
      if (state.heroIntro) {
        state.heroIntro.kill();
        gsap.set('.hero-title-primary .text-mask > span', { clearProps: 'transform,opacity,visibility' });
      }
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
    const delay = returning ? 140 : 520;
    window.setTimeout(() => {
      preloader.classList.add('is-done');
      onComplete();
    }, delay);
  }

  function initHeroIntro() {
    if (!state.gsapAvailable || reducedMotion.matches || window.scrollY > 10) return;
    const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
    state.heroIntro = intro;
    intro
      .from('.intro-item:not(.portrait-stage)', { autoAlpha: 0, y: 24, duration: 0.8, stagger: 0.1 })
      .from('.hero-title-primary .text-mask > span', { yPercent: 110, duration: 0.95, stagger: 0.07 }, 0.08);
  }

  function initHeroCinematicFrames() {
    const canvas = $('#heroCinematicCanvas');
    const section = $('.hero-story');
    const pin = $('.hero-pin');
    if (!canvas || !section || !pin) return;
    if (!state.gsapAvailable) return;

    // The hero was re-cut from a 10s/24fps clip into a 12fps still-frame sequence
    // (assets/video/frames/frame_001.webp … frame_120.webp). Scrubbing draws a
    // frame straight onto <canvas> — there is no video decoder involved at all,
    // so every scroll position is exact and instant in every browser.
    // The source clip runs ~8s at 12fps (96 frames), but the last ~10 frames zoom into
    // an in-shot mockup panel whose placeholder copy becomes legible — those frames were
    // trimmed from the sequence entirely. We scrub across the remaining 86 clean frames,
    // then hold the final one while the HTML "Selected Work" transition (0.90–1.0) plays.
    const FRAME_COUNT = 86;
    const framePath = index => `assets/video/frames/frame_${String(index + 1).padStart(3, '0')}.avif`;

    const media = gsap.matchMedia();
    state.matchMediaContexts.push(media);
    media.add('(min-width: 769px) and (min-height: 601px) and (min-aspect-ratio: 4/3) and (prefers-reduced-motion: no-preference)', () => {
      const primaryLines = $$('.hero-title-primary .text-mask > span');
      const secondary = $('.hero-title-secondary');
      const secondaryLines = $$('.hero-title-secondary .text-mask > span');
      const transition = $('.hero-transition');
      const transitionLines = $$('.hero-transition .text-mask > span');
      const summaries = $$('.hero-summary');
      const overlay = $('.hero-cinematic-overlay');
      const mediaLayer = $('.hero-cinematic');
      if (!secondary || !transition || !overlay || !mediaLayer) return undefined;

      const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
      if (!ctx) return undefined;
      const images = new Array(FRAME_COUNT);
      const playhead = { frame: 0 };
      let disposed = false;
      let ready = false;
      let drawnFrame = -1;
      const loading = new Array(FRAME_COUNT);
      let backgroundCursor = 0;
      let backgroundTimer = 0;
      let resizeRaf = 0;
      let resizeObserver;
      const DPR_LIMIT = 1.5;
      const FOCAL_X = 0.50;
      const FOCAL_Y = 0.50;

      const drawCover = img => {
        const width = Math.max(1, canvas.clientWidth);
        const height = Math.max(1, canvas.clientHeight);
        const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
        const drawWidth = img.naturalWidth * scale;
        const drawHeight = img.naturalHeight * scale;
        const x = (width - drawWidth) * FOCAL_X;
        const y = (height - drawHeight) * FOCAL_Y;

        ctx.fillStyle = '#07090D';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
      };

      const drawFrame = index => {
        if (index === drawnFrame) return true;
        const img = images[index];
        if (!img || !img.complete || !img.naturalWidth) return false;
        drawCover(img);
        drawnFrame = index;
        return true;
      };

      // If the exact target frame hasn't decoded yet, show the closest frame that
      // HAS loaded instead of leaving the canvas blank — scrubbing never flashes empty.
      const nearestLoadedFrame = target => {
        for (let offset = 0; offset <= FRAME_COUNT; offset++) {
          const up = target + offset;
          const down = target - offset;
          if (up < FRAME_COUNT && images[up]?.complete && images[up].naturalWidth) return up;
          if (down >= 0 && images[down]?.complete && images[down].naturalWidth) return down;
        }
        return -1;
      };

      const loadFrame = index => {
        index = Math.max(0, Math.min(FRAME_COUNT - 1, index));
        if (images[index]?.complete && images[index].naturalWidth) return Promise.resolve(images[index]);
        if (loading[index]) return loading[index];

        loading[index] = new Promise((resolve, reject) => {
          const img = images[index] || new Image();
          img.decoding = 'async';
          if ('fetchPriority' in img) img.fetchPriority = index < 8 ? 'high' : 'auto';
          img.onload = () => {
            images[index] = img;
            loading[index] = null;
            if (index === 0) {
              resizeCanvas();
              drawFrame(0);
              markReady();
            } else if (Math.abs(index - playhead.frame) <= 1) {
              applyPlayhead();
            }
            resolve(img);
          };
          img.onerror = error => {
            loading[index] = null;
            reject(error);
          };
          img.src = framePath(index);
          images[index] = img;
        });

        return loading[index];
      };

      const applyPlayhead = () => {
        if (disposed) return;
        const target = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(playhead.frame)));
        if (!drawFrame(target)) {
          const fallback = nearestLoadedFrame(target);
          if (fallback >= 0) drawFrame(fallback);
          loadFrame(target).catch(() => {});
        }

        // Keep nearby frames decoded so reversing direction stays smooth.
        [-3, -2, -1, 1, 2, 3].forEach(offset => {
          const neighbor = target + offset;
          if (neighbor >= 0 && neighbor < FRAME_COUNT) loadFrame(neighbor).catch(() => {});
        });
      };

      const markReady = () => {
        if (ready || disposed) return;
        ready = true;
        mediaLayer.classList.add('is-ready');
      };

      const resizeCanvas = () => {
        resizeRaf = 0;
        if (disposed) return;
        const width = Math.max(1, canvas.clientWidth);
        const height = Math.max(1, canvas.clientHeight);
        const dpr = Math.min(window.devicePixelRatio || 1, DPR_LIMIT);
        const targetWidth = Math.round(width * dpr);
        const targetHeight = Math.round(height * dpr);

        if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
        }

        drawnFrame = -1;
        applyPlayhead();
      };

      const scheduleResize = () => {
        if (disposed || resizeRaf) return;
        resizeRaf = requestAnimationFrame(resizeCanvas);
      };

      const preloadBackground = () => {
        if (disposed || backgroundCursor >= FRAME_COUNT) return;
        const batch = [];
        let added = 0;
        while (backgroundCursor < FRAME_COUNT && added < 10) {
          const index = backgroundCursor++;
          if (images[index]?.complete && images[index].naturalWidth) continue;
          batch.push(loadFrame(index).catch(() => null));
          added += 1;
        }

        Promise.allSettled(batch).finally(() => {
          if (disposed || backgroundCursor >= FRAME_COUNT) return;
          if ('requestIdleCallback' in window) {
            window.requestIdleCallback(preloadBackground, { timeout: 280 });
          } else {
            backgroundTimer = window.setTimeout(preloadBackground, 48);
          }
        });
      };

      const primeFrames = () => {
        // First viewport motion gets priority. Sparse anchors across the sequence
        // make fast scroll jumps graceful while the remaining frames fill in idle time.
        const priority = new Set([0]);
        for (let index = 1; index < Math.min(14, FRAME_COUNT); index += 1) priority.add(index);
        for (let index = 16; index < FRAME_COUNT; index += 8) priority.add(index);
        priority.add(FRAME_COUNT - 1);

        Promise.allSettled(Array.from(priority, index => loadFrame(index).catch(() => null)))
          .finally(() => {
            if ('requestIdleCallback' in window) {
              window.requestIdleCallback(preloadBackground, { timeout: 350 });
            } else {
              backgroundTimer = window.setTimeout(preloadBackground, 80);
            }
          });
      };

      section.classList.add('cinematic-active');
      gsap.set(summaries, { autoAlpha: 0, y: 16 });
      gsap.set(secondary, { autoAlpha: 1, visibility: 'visible' });
      gsap.set(secondaryLines, { yPercent: 112 });
      gsap.set(transition, { autoAlpha: 0, visibility: 'visible' });
      gsap.set(transitionLines, { yPercent: 112 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=220%',
          pin,
          scrub: 0.25,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: applyPlayhead
        }
      });
      timeline
        .to(playhead, { frame: FRAME_COUNT - 1, duration: 0.90, ease: 'none', onUpdate: applyPlayhead }, 0)
        .to(summaries, { autoAlpha: 1, y: 0, duration: 0.12, stagger: 0.02 }, 0.25)
        .to(summaries, { autoAlpha: 0, y: -12, duration: 0.10 }, 0.48)
        .to(primaryLines, { yPercent: -112, duration: 0.14, stagger: 0.01, ease: 'power2.inOut' }, 0.48)
        .to(secondaryLines, { yPercent: 0, duration: 0.16, stagger: 0.01, ease: 'power3.out' }, 0.50)
        .to('.availability, .hero-kicker', { autoAlpha: 0, y: -12, duration: 0.08 }, 0.75)
        .to(secondaryLines, { yPercent: -112, duration: 0.10, stagger: 0.008 }, 0.88)
        .to(overlay, { opacity: 1, duration: 0.10 }, 0.90)
        .to(canvas, { scale: 1.02, duration: 0.10, ease: 'none' }, 0.90)
        .to(transition, { autoAlpha: 1, duration: 0.04 }, 0.92)
        .to(transitionLines, { yPercent: 0, duration: 0.08, stagger: 0.005 }, 0.92)
        .to('.hero-scroll', { autoAlpha: 0, duration: 0.06 }, 0.92);

      if ('ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(scheduleResize);
        resizeObserver.observe(pin);
      } else {
        window.addEventListener('resize', scheduleResize, { passive: true });
      }

      resizeCanvas();
      primeFrames();
      ScrollTrigger.refresh();

      return () => {
        disposed = true;
        cancelAnimationFrame(resizeRaf);
        clearTimeout(backgroundTimer);
        if (resizeObserver) resizeObserver.disconnect();
        else window.removeEventListener('resize', scheduleResize);
        timeline.kill();
        images.forEach(img => { if (img) img.src = ''; });
        section.classList.remove('cinematic-active');
        mediaLayer.classList.remove('is-ready');
        gsap.set([...summaries, secondary, transition, overlay, canvas, ...primaryLines, ...secondaryLines, ...transitionLines, $('.availability'), $('.hero-kicker'), $('.hero-scroll')], { clearProps: 'all' });
      };
    });
  }

  function initProjectStory() {
    if (!state.gsapAvailable) return;
    const media = gsap.matchMedia();
    state.matchMediaContexts.push(media);

    media.add('(min-width: 769px) and (min-height: 601px) and (prefers-reduced-motion: no-preference)', () => {
      const section = $('.projects-story');
      const pin = $('.project-pin');
      const slides = $$('.project-slide');
      const reel = $('#projectCounterReel');
      const progress = $('#projectProgress');
      const steps = $$('#projectSteps span');
      if (!section || !pin || slides.length !== 5 || !reel || !progress || steps.length !== slides.length) return undefined;

      const projectLinks = slides.map(slide => $$('a', slide));
      let lastActiveIndex = -1;

      const updateActiveProject = activeIndex => {
        if (activeIndex === lastActiveIndex) return;
        lastActiveIndex = activeIndex;
        slides.forEach((slide, slideIndex) => {
          const active = slideIndex === activeIndex;
          slide.classList.toggle('is-active', active);
          slide.style.pointerEvents = active ? 'auto' : 'none';
          projectLinks[slideIndex].forEach(link => active ? link.removeAttribute('tabindex') : link.setAttribute('tabindex', '-1'));
        });
        steps.forEach((step, stepIndex) => {
          step.classList.toggle('is-active', stepIndex === activeIndex);
          step.classList.toggle('is-complete', stepIndex < activeIndex);
        });
      };

      gsap.set(slides, { autoAlpha: 0, y: 14, scale: 1.08, filter: 'blur(3px)' });
      gsap.set(slides[0], { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)' });
      gsap.set(progress, { scaleX: 0.2 });
      updateActiveProject(0);

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${Math.round((slides.length - 1) * window.innerHeight * 0.9)}`,
          pin,
          scrub: 0.45,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: self => updateActiveProject(Math.min(slides.length - 1, Math.floor(self.animation.time() + 0.5)))
        }
      });

      slides.slice(1).forEach((slide, index) => {
        const previous = slides[index];
        const position = index;

        // Keep the hand-off intentionally clean: the outgoing project becomes
        // unreadable before the incoming project reaches readable opacity.
        // This prevents screenshots and copy from washing into each other.
        timeline
          .to(previous, {
            autoAlpha: 0,
            y: -10,
            scale: 0.965,
            filter: 'blur(2px)',
            duration: 0.24,
            ease: 'power2.in'
          }, position + 0.04)
          .fromTo(slide,
            { autoAlpha: 0, y: 12, scale: 1.035, filter: 'blur(2px)' },
            { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.34, ease: 'power3.out' },
            position + 0.30)
          .to(reel, { yPercent: -20 * (index + 1), duration: 0.32, ease: 'power2.inOut' }, position + 0.27)
          .to(progress, { scaleX: (index + 2) / slides.length, duration: 0.32, ease: 'power2.inOut' }, position + 0.27);
      });

      return () => {
        timeline.kill();
        projectLinks.flat().forEach(link => link.removeAttribute('tabindex'));
        slides.forEach(slide => {
          slide.classList.remove('is-active');
          slide.style.removeProperty('pointer-events');
        });
        steps.forEach(step => step.classList.remove('is-active', 'is-complete'));
        gsap.set([slides, reel, progress], { clearProps: 'all' });
      };
    });

    media.add('(max-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const slides = $$('.project-slide');
      if (slides.length !== 5) return undefined;

      const tweens = slides.map(slide => gsap.fromTo(slide,
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.62,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: slide,
            start: 'top 88%',
            once: true
          }
        }
      ));

      return () => {
        tweens.forEach(tween => {
          tween.scrollTrigger?.kill();
          tween.kill();
        });
        gsap.set(slides, { clearProps: 'all' });
      };
    });
  }

  function initStackScroll() {
    if (!state.gsapAvailable) return;
    const media = gsap.matchMedia();
    state.matchMediaContexts.push(media);

    media.add('(min-width: 769px) and (min-height: 601px) and (prefers-reduced-motion: no-preference)', () => {
      const section = $('.stack-story');
      const pin = $('.stack-pin');
      const track = $('#stackTrack');
      const progress = $('#stackProgress');
      if (!section || !pin || !track || !progress) return undefined;

      let distance = 0;
      const measureDistance = () => { distance = Math.max(0, track.scrollWidth - window.innerWidth + 56); };
      const setProgress = gsap.quickSetter(progress, 'scaleX');
      measureDistance();
      const tween = gsap.to(track, {
        x: () => -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance}`,
          pin,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefreshInit: measureDistance,
          onUpdate: self => setProgress(self.progress)
        }
      });

      return () => {
        tween.kill();
        gsap.set([track, progress], { clearProps: 'all' });
      };
    });

    media.add('(max-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const section = $('.stack-story');
      const pin = $('.stack-pin');
      const track = $('#stackTrack');
      const progress = $('#stackProgress');
      if (!section || !pin || !track || !progress) return undefined;

      let distance = 0;
      const measureDistance = () => { distance = Math.max(0, track.scrollWidth - track.parentElement.clientWidth + 32); };
      const setProgress = gsap.quickSetter(progress, 'scaleX');
      measureDistance();
      const tween = gsap.to(track, {
        x: () => -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance || 1200}`,
          pin,
          scrub: 0.42,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefreshInit: measureDistance,
          onUpdate: self => setProgress(self.progress)
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

    media.add('(min-width: 769px) and (min-height: 601px) and (prefers-reduced-motion: no-preference)', () => {
      const section = $('.experience-story');
      const pin = $('.experience-pin');
      const items = $$('.experience-item');
      const reel = $('#experienceDateReel');
      const progress = $('#experienceProgress');
      const dot = $('#experienceDot');
      if (!section || !pin || items.length !== 3 || !reel || !progress || !dot) return undefined;

      let dotDistance = 0;
      const measureDotDistance = () => { dotDistance = Math.max(0, pin.clientHeight - 165); };
      measureDotDistance();
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
          invalidateOnRefresh: true,
          onRefreshInit: measureDotDistance
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
          .to(dot, { y: () => dotDistance * ((index + 1) / 2), duration: 0.46, ease: 'power3.inOut' }, position);
      });

      return () => {
        timeline.kill();
        gsap.set([items, reel, progress, dot], { clearProps: 'all' });
      };
    });

    media.add('(max-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const section = $('.experience-story');
      const pin = $('.experience-pin');
      const rail = $('.experience-rail');
      const items = $$('.experience-item');
      const reel = $('#experienceDateReel');
      const progress = $('#experienceProgress');
      const dot = $('#experienceDot');
      if (!section || !pin || !rail || items.length !== 3 || !reel || !progress || !dot) return undefined;

      let railDistance = 0;
      let lastActiveIndex = -1;
      const measureRailDistance = () => { railDistance = Math.max(0, rail.clientHeight - 12); };
      const updateActiveItem = activeIndex => {
        if (activeIndex === lastActiveIndex) return;
        lastActiveIndex = activeIndex;
        items.forEach((item, itemIndex) => {
          item.style.pointerEvents = itemIndex === activeIndex ? 'auto' : 'none';
        });
      };
      measureRailDistance();
      gsap.set(items, { opacity: 0, y: 24 });
      gsap.set(items[0], { opacity: 1, y: 0 });
      updateActiveItem(0);

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=260%',
          pin,
          scrub: 0.42,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefreshInit: measureRailDistance,
          onUpdate: self => updateActiveItem(Math.min(items.length - 1, Math.floor(self.progress * items.length)))
        }
      });

      items.slice(1).forEach((item, index) => {
        const previous = items[index];
        const position = index + 0.7;
        timeline
          .to(previous, { opacity: 0, y: -24, duration: 0.38 }, position)
          .fromTo(item, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.48, ease: 'power3.out' }, position + 0.06)
          .to(reel, { yPercent: -(100 / 3) * (index + 1), duration: 0.48, ease: 'power3.inOut' }, position)
          .to(progress, { scaleY: (index + 1) / 2, duration: 0.48 }, position)
          .to(dot, { y: () => railDistance * ((index + 1) / 2), duration: 0.48, ease: 'power3.inOut' }, position);
      });

      return () => {
        timeline.kill();
        items.forEach(item => item.style.removeProperty('pointer-events'));
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
      const navigationSections = links
        .map(link => ({ link, section: $(link.getAttribute('href')) }))
        .filter(entry => entry.section);
      let activeSectionId = '';
      const updateActiveLink = sectionId => {
        if (!sectionId || sectionId === activeSectionId) return;
        activeSectionId = sectionId;
        links.forEach(link => {
          const active = link.getAttribute('href') === `#${sectionId}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      };

      navigationSections.forEach(({ section }) => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top 52%',
          end: 'bottom 15%',
          onEnter: () => updateActiveLink(section.id),
          onEnterBack: () => updateActiveLink(section.id),
          onRefresh: self => { if (self.isActive) updateActiveLink(section.id); }
        });
      });

      ScrollTrigger.create({
        start: 24,
        end: () => ScrollTrigger.maxScroll(window) + 1,
        onToggle: self => { if (header) header.classList.toggle('scrolled', self.isActive); },
        onRefresh: self => { if (header) header.classList.toggle('scrolled', self.scroll() > 24); }
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
    let maxScroll = Math.max(0, document.documentElement.scrollHeight - document.documentElement.clientHeight);
    const measureMaxScroll = () => { maxScroll = Math.max(0, document.documentElement.scrollHeight - document.documentElement.clientHeight); };
    window.addEventListener('resize', measureMaxScroll, { passive: true });
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        progress.style.transform = `scaleX(${maxScroll > 0 ? scrollY / maxScroll : 0})`;
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


  function initResponsiveRefresh() {
    if (!state.gsapAvailable) return;
    let refreshTimer = 0;
    let refreshPending = false;
    const runRefresh = () => {
      if (ScrollTrigger.isScrolling()) {
        refreshPending = true;
        return;
      }
      refreshPending = false;
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 260);
    };
    const onScrollEnd = () => { if (refreshPending) runRefresh(); };
    window.addEventListener('orientationchange', runRefresh, { passive: true });
    ScrollTrigger.addEventListener('scrollEnd', onScrollEnd);
  }

  function initProjectImageRefresh() {
    if (!state.gsapAvailable) return;
    const images = $$('.project-screenshot');
    if (!images.length) return;
    let refreshTimer = 0;
    let refreshPending = false;
    const imageHeights = new WeakMap(images.map(image => [image, image.getBoundingClientRect().height]));
    const runRefresh = () => {
      if (ScrollTrigger.isScrolling()) {
        refreshPending = true;
        return;
      }
      refreshPending = false;
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        if (ScrollTrigger.isScrolling()) {
          refreshPending = true;
          return;
        }
        ScrollTrigger.refresh();
      }, 180);
    };
    const refreshAfterImage = event => {
      const image = event.currentTarget;
      requestAnimationFrame(() => {
        const previousHeight = imageHeights.get(image) || 0;
        const nextHeight = image.getBoundingClientRect().height;
        imageHeights.set(image, nextHeight);
        if (Math.abs(nextHeight - previousHeight) > 0.5) runRefresh();
      });
    };
    const onScrollEnd = () => { if (refreshPending) runRefresh(); };
    ScrollTrigger.addEventListener('scrollEnd', onScrollEnd);
    images.forEach(image => {
      if (image.complete) return;
      image.addEventListener('load', refreshAfterImage, { once: true });
      image.addEventListener('error', refreshAfterImage, { once: true });
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

    if (media) media.add('(min-width: 769px) and (min-height: 601px) and (prefers-reduced-motion: no-preference)', create);
    else if (innerWidth > 768) create();
  }

  function initLazyThreeScenes() {
    const section = $('.footer-playground');
    if (!section || reducedMotion.matches) return;

    const desktop = window.matchMedia('(min-width: 769px) and (prefers-reduced-motion: no-preference)');
    let observer = null;
    let loaded = false;

    const loadModule = () => {
      if (loaded || !desktop.matches) return;
      loaded = true;
      observer?.disconnect();
      observer = null;
      import('./three-scenes.js').catch(() => {
        loaded = false;
      });
    };

    const arm = () => {
      if (loaded || observer || !desktop.matches) return;
      observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        loadModule();
      }, { rootMargin: '100% 0px', threshold: 0.01 });
      observer.observe(section);
    };

    const onChange = event => {
      if (event.matches) arm();
      else {
        observer?.disconnect();
        observer = null;
      }
    };

    desktop.addEventListener('change', onChange);
    arm();
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
    initHeroCinematicFrames();
    initProjectStory();
    initStackScroll();
    initExperienceTimeline();
    initReveals();
    initCursor();
    initMagnetic();
    initProjectGlow();
    initResponsiveRefresh();
    initProjectImageRefresh();
    initLazyThreeScenes();

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
