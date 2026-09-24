/* Kirubananthan T — cinematic portfolio interactions */
document.documentElement.classList.add('js');

(() => {
  'use strict';

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const precisePointer = window.matchMedia('(min-width: 1101px) and (hover: hover) and (pointer: fine)');
  const state = {
    gsapAvailable: false,
    cursorController: null,
    matchMediaContexts: []
  };

  function initReducedMotion() {
    const exposeContent = () => {
      $$('.reveal').forEach(element => element.classList.add('is-visible'));
      if ($('#preloader')) $('#preloader').classList.add('is-done');
    };

    if (reducedMotion.matches) exposeContent();
    reducedMotion.addEventListener('change', event => {
      if (!event.matches) return;
      exposeContent();
      document.body.classList.remove('cursor-enabled');
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
      .from('.intro-item:not(.portrait-stage)', { autoAlpha: 0, y: 24, duration: 0.8, stagger: 0.1 })
      .from('.portrait-stage', { autoAlpha: 0, duration: 0.8 }, 0)
      .from('.hero-title-primary .text-mask > span', { yPercent: 110, duration: 0.95, stagger: 0.07 }, 0.08);
  }

  function initHeroStory() {
    if (!state.gsapAvailable) return;
    const media = gsap.matchMedia();
    state.matchMediaContexts.push(media);

    media.add('(min-width: 1101px) and (min-height: 741px) and (prefers-reduced-motion: no-preference)', () => {
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
          end: '+=200%',
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
        .to('.availability, .hero-kicker, .hero-role', { autoAlpha: 0, y: -16, duration: 0.35 }, 1.2)
        .to(portrait, { xPercent: 6, yPercent: 4, autoAlpha: 0.24, scale: 0.96, duration: 0.75 }, 1.65)
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

  function initPortraitInteraction() {
    if (!state.gsapAvailable) return;
    const media = gsap.matchMedia();
    state.matchMediaContexts.push(media);

    media.add('(min-width: 1101px) and (min-height: 741px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const stage = $('#portraitStage');
      const interactive = $('#portraitInteractive');
      const frame = $('#portraitFrame');
      const image = $('#portraitImage');
      const aura = $('#portraitAura');
      const labelInners = $$('.tech-label-inner', interactive);
      if (!stage || !interactive || !frame || !image || !aura) return undefined;

      let bounds = null;
      const moveInteractiveX = gsap.quickTo(interactive, 'x', { duration: 0.55, ease: 'power3.out' });
      const moveInteractiveY = gsap.quickTo(interactive, 'y', { duration: 0.55, ease: 'power3.out' });
      const rotateX = gsap.quickTo(interactive, 'rotationX', { duration: 0.65, ease: 'power3.out' });
      const rotateY = gsap.quickTo(interactive, 'rotationY', { duration: 0.65, ease: 'power3.out' });
      const moveImageX = gsap.quickTo(image, 'x', { duration: 0.7, ease: 'power3.out' });
      const moveImageY = gsap.quickTo(image, 'y', { duration: 0.7, ease: 'power3.out' });
      const moveAuraX = gsap.quickTo(aura, 'x', { duration: 0.9, ease: 'power3.out' });
      const moveAuraY = gsap.quickTo(aura, 'y', { duration: 0.9, ease: 'power3.out' });
      const labelSetters = labelInners.map((label, index) => ({
        x: gsap.quickTo(label, 'x', { duration: 0.6 + index * 0.035, ease: 'power3.out' }),
        y: gsap.quickTo(label, 'y', { duration: 0.6 + index * 0.035, ease: 'power3.out' })
      }));

      const onEnter = () => { bounds = stage.getBoundingClientRect(); };
      const onMove = event => {
        if (!bounds) bounds = stage.getBoundingClientRect();
        const normalizedX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
        const normalizedY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
        moveInteractiveX(normalizedX * 4);
        moveInteractiveY(normalizedY * 3);
        rotateX(normalizedY * -2.5);
        rotateY(normalizedX * 3.5);
        moveImageX(normalizedX * -4);
        moveImageY(normalizedY * -3.5);
        moveAuraX(normalizedX * 7);
        moveAuraY(normalizedY * 5);
        interactive.style.setProperty('--shine-x', `${50 + normalizedX * 24}%`);
        interactive.style.setProperty('--shine-y', `${42 + normalizedY * 22}%`);
        labelSetters.forEach((setter, index) => {
          const direction = index % 2 === 0 ? 1 : -1;
          setter.x(normalizedX * direction * (2.5 + index * 0.35));
          setter.y(normalizedY * -direction * (2 + index * 0.25));
        });
      };
      const onLeave = () => {
        bounds = null;
        moveInteractiveX(0); moveInteractiveY(0); rotateX(0); rotateY(0);
        moveImageX(0); moveImageY(0); moveAuraX(0); moveAuraY(0);
        interactive.style.setProperty('--shine-x', '68%');
        interactive.style.setProperty('--shine-y', '18%');
        labelSetters.forEach(setter => { setter.x(0); setter.y(0); });
      };

      stage.addEventListener('pointerenter', onEnter, { passive: true });
      stage.addEventListener('pointermove', onMove, { passive: true });
      stage.addEventListener('pointerleave', onLeave, { passive: true });

      return () => {
        stage.removeEventListener('pointerenter', onEnter);
        stage.removeEventListener('pointermove', onMove);
        stage.removeEventListener('pointerleave', onLeave);
        const animatedElements = [interactive, image, aura, ...labelInners];
        gsap.killTweensOf(animatedElements);
        gsap.set(animatedElements, { clearProps: 'transform' });
        interactive.style.removeProperty('--shine-x');
        interactive.style.removeProperty('--shine-y');
      };
    });
  }


function initProjectStory() {
  if (!state.gsapAvailable) return;

  const media = gsap.matchMedia();
  state.matchMediaContexts.push(media);

  const createProjectScene = isMobile => {
    const section = $('.projects-story');
    const pin = $('.project-pin');
    const scene = $('.project-scene');

    if (!section || !pin || !scene) return undefined;

    const backgrounds = $$('.project-background', scene);
    const backgroundImages = backgrounds.map(background =>
      $('img', background)
    );

    const infos = $$('.project-info', scene);
    const previewGroups = $$('.project-preview-group', scene);

    const reel = $('#projectCounterReel');
    const progress = $('#projectProgress');

    const count = backgrounds.length;

    if (
      !reel ||
      !progress ||
      count < 2 ||
      backgroundImages.some(image => !image) ||
      infos.length !== count ||
      previewGroups.length !== count
    ) {
      return undefined;
    }

    const projectLinks = infos.map(info => $$('a', info));

    let lastActiveIndex = -1;
    let cachedPinHeight = Math.max(
      1,
      pin.clientHeight || window.innerHeight
    );

    /* -------------------------------------------------------
       MEASURE PIN
    ------------------------------------------------------- */

    const cacheProjectSize = () => {
      cachedPinHeight = Math.max(
        1,
        pin.clientHeight || window.innerHeight
      );
    };

    /* -------------------------------------------------------
       ACCESSIBILITY / ACTIVE STATE
    ------------------------------------------------------- */

    const updateActiveProject = activeIndex => {
      if (activeIndex === lastActiveIndex) return;

      lastActiveIndex = activeIndex;

      infos.forEach((info, index) => {
        const active = index === activeIndex;

        info.classList.toggle('is-active', active);

        info.style.pointerEvents = active
          ? 'auto'
          : 'none';

        info.setAttribute(
          'aria-hidden',
          active ? 'false' : 'true'
        );
      });

      backgrounds.forEach((background, index) => {
        background.classList.toggle(
          'is-active',
          index === activeIndex
        );
      });

      previewGroups.forEach((group, index) => {
        group.classList.toggle(
          'is-active',
          index === activeIndex
        );
      });

      projectLinks.forEach((links, index) => {
        links.forEach(link => {
          if (index === activeIndex) {
            link.removeAttribute('tabindex');
          } else {
            link.setAttribute('tabindex', '-1');
          }
        });
      });
    };

    cacheProjectSize();

    /* -------------------------------------------------------
       INITIAL PROJECT STATES
    ------------------------------------------------------- */

    backgrounds.forEach((background, index) => {
      gsap.set(background, {
        autoAlpha: index === 0 ? 1 : 0,
        zIndex: index === 0 ? 1 : 0
      });

      gsap.set(backgroundImages[index], {
        scale: 1.04,
        yPercent: index === 0 ? 0 : 1.5,
        force3D: true
      });

      gsap.set(infos[index], {
        autoAlpha: index === 0 ? 1 : 0,
        y: index === 0
          ? 0
          : 30,

        clipPath: index === 0 ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)',

        force3D: true
      });

      gsap.set(previewGroups[index], {
        autoAlpha: index === 0 ? 1 : 0,

        x: index === 0
          ? 0
          : isMobile
            ? 18
            : 36,

        force3D: true
      });

      gsap.set(
        $$('.project-preview', previewGroups[index]),
        {
          scale: 1,
          x: 0,
          opacity: 1,
          force3D: true
        }
      );
    });

    gsap.set(reel, {
      yPercent: 0,
      force3D: true
    });

    gsap.set(progress, {
      scaleX: 1 / count,
      transformOrigin: 'left center'
    });

    updateActiveProject(0);

    /* -------------------------------------------------------
       ARRIVAL — cards rise up into place the first time the
       section reaches the viewport, before the pinned
       crossfade timeline takes over.
    ------------------------------------------------------- */

    const stageHeading = $('.stage-heading', section);
    const firstPreviewCards = $$('.project-preview', previewGroups[0]);

    const counterEl = $('.project-counter', section);

    gsap.set(
      [stageHeading, counterEl, backgrounds[0], infos[0], ...firstPreviewCards].filter(Boolean),
      { y: 64, autoAlpha: 0 }
    );

    const arrivalTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 78%',
      once: true,
      onEnter: () => {
        const arrivalTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

        arrivalTimeline
          .to(stageHeading, { y: 0, autoAlpha: 1, duration: 0.8 }, 0)
          .to(counterEl, { y: 0, autoAlpha: 1, duration: 0.7 }, 0.1)
          .to(backgrounds[0], { y: 0, autoAlpha: 1, duration: 1 }, 0.05)
          .to(infos[0], { y: 0, autoAlpha: 1, duration: 0.85 }, 0.22)
          .to(firstPreviewCards, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12 }, 0.3);
      }
    });

    /* -------------------------------------------------------
       MAIN SCROLL TIMELINE
    ------------------------------------------------------- */

    const timeline = gsap.timeline({
      defaults: {
        ease: 'none',
        overwrite: false
      },

      scrollTrigger: {
        trigger: section,

        start: 'top top',

        /*
         * Each project receives roughly one viewport
         * progression.
         *
         * Mobile is slightly longer so touch scrolling
         * doesn't feel too fast.
         */
        end: () =>
          `+=${cachedPinHeight * (count - 1) * 0.72}`,

        pin: pin,

        scrub: isMobile
          ? 0.42
          : 0.44,

        anticipatePin: 1,

        invalidateOnRefresh: true,

        snap: {
          snapTo: 1 / (count - 1),
          duration: { min: 0.12, max: 0.24 },
          delay: 0.08,
          inertia: false,
          ease: 'power1.inOut'
        },

        onRefreshInit: cacheProjectSize,

        onUpdate: self => {
          const activeIndex = Math.min(
            count - 1,

            Math.max(
              0,

              Math.round(
                self.progress *
                (count - 1)
              )
            )
          );

          updateActiveProject(activeIndex);
        }
      }
    });

    /* -------------------------------------------------------
       PROJECT → PROJECT TRANSITIONS
    ------------------------------------------------------- */

    for (
      let index = 0;
      index < count - 1;
      index += 1
    ) {
      const currentGroup =
        previewGroups[index];

      const nextGroup =
        previewGroups[index + 1];

      /*
       * First preview represents the project
       * that becomes active next.
       */
      const selectedPreview =
        $('.project-preview', currentGroup);

      const segment = index;

      timeline

        /* ================================================
           CURRENT BACKGROUND
        ================================================= */

        .to(backgroundImages[index], { scale: 1, duration: 0.28 }, segment)

        .to(
          backgrounds[index],
          {
            autoAlpha: 0,
            yPercent: -2.5,
            duration: 0.38
          },
          segment + 0.34
        )

        /* ================================================
           NEXT PROJECT BACKGROUND
        ================================================= */

        .set(
          backgrounds[index + 1],
          {
            zIndex: 1
          },
          segment + 0.04
        )

        .to(
          backgrounds[index + 1],
          {
            autoAlpha: 1,
            duration: 0.46
          },
          segment + 0.3
        )

        .to(
          backgroundImages[index + 1],
          {
            scale: 1,
            yPercent: 0,
            duration: 0.58
          },
          segment + 0.26
        )

        /* ================================================
           CURRENT INFO PANEL LEAVES
        ================================================= */

        .to(
          infos[index],
          {
            autoAlpha: 0,
            y: -30,
            clipPath: 'inset(0% 0% 100% 0%)',

            duration: 0.30
          },
          segment + 0.28
        )

        /* ================================================
           NEXT INFO PANEL ENTERS
        ================================================= */

        .to(
          infos[index + 1],
          {
            autoAlpha: 1,
            y: 0,
            clipPath: 'inset(0% 0% 0% 0%)',

            duration: 0.46
          },
          segment + 0.5
        );

      /* ================================================
         SELECTED BINBUX-STYLE PREVIEW CARD
      ================================================= */

      if (selectedPreview) {
        timeline.to(
          selectedPreview,
          {
            scale: 1.07,

            x: isMobile
              ? -8
              : -18,

            opacity: 0,

            duration: 0.38
          },
          segment + 0.02
        );
      }

      timeline

        /* ================================================
           OLD PREVIEW SET LEAVES
        ================================================= */

        .to(
          currentGroup,
          {
            autoAlpha: 0,

            x: isMobile
              ? -12
              : -30,

            duration: 0.40
          },
          segment + 0.18
        )

        /* ================================================
           NEW PREVIEW CARDS ARRIVE
        ================================================= */

        .to(
          nextGroup,
          {
            autoAlpha: 1,
            x: 0,

            duration: 0.46
          },
          segment + 0.30
        )

        /* ================================================
           PROJECT COUNTER
        ================================================= */

        .to(
          reel,
          {
            yPercent:
              -20 * (index + 1),

            duration: 0.55
          },
          segment + 0.18
        )

        /* ================================================
           PROGRESS LINE
        ================================================= */

        .to(
          progress,
          {
            scaleX:
              (index + 2) / count,

            duration: 0.55
          },
          segment + 0.18
        );
    }

    /* -------------------------------------------------------
       CLEANUP
    ------------------------------------------------------- */

    return () => {
      arrivalTrigger.kill();

      if (timeline.scrollTrigger) {
        timeline.scrollTrigger.kill();
      }

      timeline.kill();

      projectLinks
        .flat()
        .forEach(link => {
          link.removeAttribute('tabindex');
        });

      infos.forEach(info => {
        info.removeAttribute(
          'aria-hidden'
        );

        info.classList.remove(
          'is-active'
        );

        info.style.removeProperty(
          'pointer-events'
        );
      });

      backgrounds.forEach(background => {
        background.classList.remove(
          'is-active'
        );
      });

      previewGroups.forEach(group => {
        group.classList.remove(
          'is-active'
        );
      });

      gsap.set(
        [
          ...backgrounds,
          ...backgroundImages,
          ...infos,
          ...previewGroups,
          ...$$(
            '.project-preview',
            scene
          ),
          reel,
          progress
        ],
        {
          clearProps: 'all'
        }
      );
    };
  };

  /* -------------------------------------------------------
     DESKTOP
  ------------------------------------------------------- */

  media.add(
    `
      (min-width: 1101px)
      and (min-height: 741px)
      and (prefers-reduced-motion: no-preference)
    `,
    () => createProjectScene(false)
  );


}

  function initStackScroll() {
    if (!state.gsapAvailable) return;
    const media = gsap.matchMedia();
    state.matchMediaContexts.push(media);

    const createStackScene = () => {
      const section = $('.stack-story');
      const pin = $('.stack-pin');
      const viewport = $('.stack-viewport');
      const track = $('#stackTrack');
      const progress = $('#stackProgress');
      const current = $('#stackCurrent');
      if (!section || !pin || !viewport || !track || !progress || !current) return undefined;

      const measureDistance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
      const getEndDistance = () => Math.max(window.innerHeight * 0.82, measureDistance() * 0.82);
      const panels = $$('.stack-panel', track);
      gsap.set(track, { x: 0, force3D: true });
      gsap.set(progress, { scaleX: 0, transformOrigin: 'left center' });
      gsap.set(panels, { autoAlpha: 0.6, scale: 0.965, force3D: true });
      gsap.set(panels[0], { autoAlpha: 1, scale: 1 });

      let activeIndex = -1;
      const setActivePanel = index => {
        if (index === activeIndex) return;
        activeIndex = index;
        current.textContent = String(index + 1).padStart(2, '0');
        panels.forEach((panel, panelIndex) => {
          gsap.to(panel, { autoAlpha: panelIndex === index ? 1 : 0.62, scale: panelIndex === index ? 1 : 0.965, duration: 0.28, overwrite: true });
        });
      };
      setActivePanel(0);

      const timeline = gsap.to(track, {
        x: () => -measureDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${getEndDistance()}`,
          pin,
          scrub: 0.55,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: self => {
            gsap.set(progress, { scaleX: self.progress });
            setActivePanel(Math.min(panels.length - 1, Math.round(self.progress * (panels.length - 1))));
          }
        }
      });

      return () => {
        if (timeline.scrollTrigger) timeline.scrollTrigger.kill();
        timeline.kill();
        current.textContent = '01';
        gsap.set([track, progress, ...panels], { clearProps: 'all' });
      };
    };

    media.add(
      '(min-width: 1101px) and (min-height: 741px) and (prefers-reduced-motion: no-preference)',
      createStackScene
    );
  }

  function initExperienceTimeline() {
    if (!state.gsapAvailable) return;
    const media = gsap.matchMedia();
    state.matchMediaContexts.push(media);

    media.add('(min-width: 1101px) and (min-height: 741px) and (prefers-reduced-motion: no-preference)', () => {
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
          end: '+=155%',
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


  }

  function initReveals() {
    const principles = $$('.principle');
    const elements = $$('.reveal').filter(element => !element.classList.contains('principle'));
    if (!state.gsapAvailable || reducedMotion.matches) {
      [...elements, ...principles].forEach(element => element.classList.add('is-visible'));
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

    principles.forEach((principle, index) => {
      gsap.fromTo(principle, { autoAlpha: 0, y: 40 }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.72,
        delay: (index % 2) * 0.06,
        ease: 'power3.out',
        onStart: () => principle.classList.add('is-visible'),
        scrollTrigger: { trigger: principle, start: 'top 86%', once: true }
      });
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
    if (!dot || !ring || !spotlight) return;

    let mouseX = innerWidth / 2;
    let mouseY = innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let lightX = mouseX;
    let lightY = mouseY;
    let frame = 0;
    let running = false;

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
    const start = () => {
      if (running || document.hidden || reducedMotion.matches || !precisePointer.matches) return;
      document.body.classList.add('cursor-enabled');
      running = true;
      render();
    };
    const stop = () => {
      document.body.classList.remove('cursor-enabled');
      running = false;
      cancelAnimationFrame(frame);
    };
    const updateMotion = () => reducedMotion.matches || !precisePointer.matches ? stop() : start();

    window.addEventListener('pointermove', event => { mouseX = event.clientX; mouseY = event.clientY; }, { passive: true });
    $$('a, button, .project-glow').forEach(element => {
      element.addEventListener('mouseenter', () => ring.classList.add('hover'));
      element.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    precisePointer.addEventListener('change', updateMotion);
    reducedMotion.addEventListener('change', updateMotion);
    state.cursorController = { start, stop };
    start();
  }

  function initMagnetic() {
    if (!state.gsapAvailable || reducedMotion.matches || !precisePointer.matches) return;
    $$('.magnetic').forEach(element => {
      const moveX = gsap.quickTo(element, 'x', { duration: 0.35, ease: 'power3.out' });
      const moveY = gsap.quickTo(element, 'y', { duration: 0.35, ease: 'power3.out' });
      element.addEventListener('pointermove', event => {
        const bounds = element.getBoundingClientRect();
        moveX(gsap.utils.clamp(-6, 6, (event.clientX - bounds.left - bounds.width / 2) * 0.12));
        moveY(gsap.utils.clamp(-6, 6, (event.clientY - bounds.top - bounds.height / 2) * 0.12));
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

  function initialize() {
    state.gsapAvailable = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
    if (state.gsapAvailable) {
      gsap.registerPlugin(ScrollTrigger);
      document.documentElement.classList.add('gsap-ready');
      ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true });
    }

    initReducedMotion();
    initScrollProgress();
    initHeroStory();
    initPortraitInteraction();
    initProjectStory();
    initStackScroll();
    initExperienceTimeline();
    initNavigation();
    initReveals();
    initCursor();
    initMagnetic();
    initProjectGlow();
    initResponsiveRefresh();
    initProjectImageRefresh();

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
