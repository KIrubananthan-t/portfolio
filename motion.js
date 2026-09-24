/* Progressive motion graphics. Native scrolling remains the touch/fallback path. */
(() => {
  'use strict';

  const motionState = { velocity: 0 };
  window.portfolioMotion = motionState;

  function initSmoothScroll(media) {
    media.add('(min-width: 769px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      if (!window.Lenis) return undefined;
      const lenis = new Lenis({ lerp: 0.13, smoothWheel: true, syncTouch: false, anchors: { offset: -84 }, prevent: node => node.classList?.contains('project-info') || node.classList?.contains('site-nav') });
      const tick = seconds => lenis.raf(seconds * 1000);
      const resize = () => lenis.resize();
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      ScrollTrigger.addEventListener('refresh', resize);
      window.portfolioLenis = lenis;
      return () => {
        ScrollTrigger.removeEventListener('refresh', resize);
        gsap.ticker.remove(tick);
        lenis.destroy();
        if (window.portfolioLenis === lenis) delete window.portfolioLenis;
      };
    });
  }

  function initScrollVelocity(media) {
    media.add('(min-width: 1101px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const grid = document.querySelector('.page-grid');
      const shiftGrid = grid ? gsap.quickTo(grid, 'y', { duration: 0.55, ease: 'power3.out' }) : null;
      const settle = () => { motionState.velocity = 0; if (shiftGrid) shiftGrid(0); };
      const trigger = ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: self => {
          motionState.velocity = gsap.utils.clamp(-3, 3, self.getVelocity() / 700);
          if (shiftGrid) shiftGrid(motionState.velocity * 2.2);
        }
      });
      ScrollTrigger.addEventListener('scrollEnd', settle);
      return () => {
        trigger.kill();
        ScrollTrigger.removeEventListener('scrollEnd', settle);
        settle();
        if (grid) gsap.set(grid, { clearProps: 'transform' });
      };
    });
  }

  function initMotionBand(media) {
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const band = document.querySelector('.motion-band');
      const forward = document.querySelector('.motion-lane-forward');
      const reverse = document.querySelector('.motion-lane-reverse');
      if (!band || !forward || !reverse) return undefined;
      const animations = [
        gsap.fromTo(forward, { xPercent: -5 }, { xPercent: -28, ease: 'none', scrollTrigger: { trigger: band, start: 'top bottom', end: 'bottom top', scrub: 0.7 } }),
        gsap.fromTo(reverse, { xPercent: -18 }, { xPercent: 3, ease: 'none', scrollTrigger: { trigger: band, start: 'top bottom', end: 'bottom top', scrub: 0.9 } }),
        gsap.fromTo('.motion-orbit', { rotation: -24 }, { rotation: 125, ease: 'none', scrollTrigger: { trigger: '.hero-story', start: 'top top', end: 'bottom top', scrub: 1 } })
      ];
      if (window.matchMedia('(min-width: 1101px)').matches) {
        const skewForward = gsap.quickTo(forward, 'skewX', { duration: 0.55, ease: 'power3.out' });
        const skewReverse = gsap.quickTo(reverse, 'skewX', { duration: 0.55, ease: 'power3.out' });
        const resetSkew = () => { skewForward(0); skewReverse(0); };
        ScrollTrigger.addEventListener('scrollEnd', resetSkew);
        animations.push({ kill: () => { ScrollTrigger.getById('motion-band-velocity')?.kill(); ScrollTrigger.removeEventListener('scrollEnd', resetSkew); resetSkew(); } });
        ScrollTrigger.create({ id: 'motion-band-velocity', trigger: band, start: 'top bottom', end: 'bottom top', onUpdate: () => { skewForward(motionState.velocity); skewReverse(-motionState.velocity); } });
      }
      return () => { animations.forEach(animation => animation.kill()); gsap.set([forward, reverse], { clearProps: 'transform' }); };
    });
  }

  function initCompactProjects(media) {
    media.add({ compact: '(max-width: 1100px), (max-height: 740px)', reduce: '(prefers-reduced-motion: reduce)' }, context => {
      if (!context.conditions.compact || context.conditions.reduce) return undefined;
      const animations = Array.from(document.querySelectorAll('.project-background')).map(card =>
        gsap.fromTo(card.querySelector('img'), { scale: 1.04 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 0.5 } })
      );
      return () => animations.forEach(animation => animation.kill());
    });
  }

  function initContextCursor(media) {
    media.add('(min-width: 769px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const ring = document.querySelector('#cursorRing');
      if (!ring) return undefined;
      const label = event => {
        const link = event.target.closest('a, button');
        ring.dataset.label = !link ? '' : link.tagName === 'BUTTON' ? 'MENU' : link.getAttribute('href')?.startsWith('#') ? 'GO ↓' : 'OPEN ↗';
      };
      const clear = () => { ring.dataset.label = ''; };
      document.addEventListener('pointerover', label);
      document.addEventListener('pointerleave', clear);
      return () => { document.removeEventListener('pointerover', label); document.removeEventListener('pointerleave', clear); clear(); };
    });
  }

  function initializeMotion() {
    if (!window.gsap || !window.ScrollTrigger) return;
    const media = gsap.matchMedia();
    initSmoothScroll(media);
    initScrollVelocity(media);
    initMotionBand(media);
    initCompactProjects(media);
    initContextCursor(media);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeMotion, { once: true });
  else initializeMotion();
})();
