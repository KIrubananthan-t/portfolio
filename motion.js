/* Progressive motion graphics. Native scrolling remains the touch/fallback path. */
(() => {
  'use strict';

  function initializeMotion() {
    if (!window.gsap || !window.ScrollTrigger) return;
    const media = gsap.matchMedia();

    media.add('(min-width: 769px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      if (!window.Lenis) return;
      const lenis = new Lenis({
        lerp: .1,
        smoothWheel: true,
        syncTouch: false,
        anchors: { offset: -84 },
        prevent: node => node.classList?.contains('project-info') || node.classList?.contains('site-nav')
      });
      const tick = seconds => lenis.raf(seconds * 1000);
      const resize = () => lenis.resize();
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      ScrollTrigger.addEventListener('refresh', resize);
      return () => {
        ScrollTrigger.removeEventListener('refresh', resize);
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    });

    media.add('(prefers-reduced-motion: no-preference)', () => {
      const band = document.querySelector('.motion-band');
      const forward = document.querySelector('.motion-lane-forward');
      const reverse = document.querySelector('.motion-lane-reverse');
      if (!band || !forward || !reverse) return;
      const desktop = window.matchMedia('(min-width: 769px)').matches;

      gsap.fromTo(forward, { xPercent: -5 }, {
        xPercent: -28, ease: 'none',
        scrollTrigger: { trigger: band, start: 'top bottom', end: 'bottom top', scrub: .7 }
      });
      gsap.fromTo(reverse, { xPercent: -18 }, {
        xPercent: 3, ease: 'none',
        scrollTrigger: { trigger: band, start: 'top bottom', end: 'bottom top', scrub: .9 }
      });
      gsap.fromTo('.motion-orbit', { rotation: -24 }, {
        rotation: 125, ease: 'none',
        scrollTrigger: { trigger: '.hero-story', start: 'top top', end: 'bottom top', scrub: 1 }
      });

      // Velocity only distorts the decorative typography, keeping body text stable.
      if (desktop) {
        const skewForward = gsap.quickTo(forward, 'skewX', { duration: .55, ease: 'power3.out' });
        const skewReverse = gsap.quickTo(reverse, 'skewX', { duration: .55, ease: 'power3.out' });
        const reset = () => { skewForward(0); skewReverse(0); };
        ScrollTrigger.create({
          trigger: band, start: 'top bottom', end: 'bottom top',
          onUpdate: self => {
            const skew = gsap.utils.clamp(-4, 4, self.getVelocity() / -550);
            skewForward(skew);
            skewReverse(-skew);
          },
          onLeave: reset,
          onLeaveBack: reset
        });
        ScrollTrigger.addEventListener('scrollEnd', reset);
        return () => ScrollTrigger.removeEventListener('scrollEnd', reset);
      }
    });

    media.add({ compact: '(max-width: 1100px), (max-height: 740px)', reduce: '(prefers-reduced-motion: reduce)' }, context => {
      if (!context.conditions.compact || context.conditions.reduce) return;
      document.querySelectorAll('.project-background').forEach(card => {
        gsap.fromTo(card.querySelector('img'), { scale: 1.12 }, {
          scale: 1, ease: 'none',
          scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: .65 }
        });
      });
    });

    // A small contextual cursor label makes interactive destinations clearer.
    media.add('(min-width: 769px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const ring = document.querySelector('#cursorRing');
      if (!ring) return;
      const label = event => {
        const link = event.target.closest('a, button');
        ring.dataset.label = !link ? '' : link.tagName === 'BUTTON' ? 'MENU' : link.getAttribute('href')?.startsWith('#') ? 'GO ↓' : 'OPEN ↗';
      };
      const clear = () => { ring.dataset.label = ''; };
      document.addEventListener('pointerover', label);
      document.addEventListener('pointerleave', clear);
      return () => {
        document.removeEventListener('pointerover', label);
        document.removeEventListener('pointerleave', clear);
        clear();
      };
    });

    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeMotion, { once: true });
  else initializeMotion();
})();
