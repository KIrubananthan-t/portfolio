import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;
const random = (min, max) => min + Math.random() * (max - min);

function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  return renderer;
}

function setRendererSize(renderer, camera, element) {
  const rect = element.getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);

  renderer.setSize(width, height, false);

  if (camera.isPerspectiveCamera) {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  return { width, height };
}

function createGlowMaterial(color, intensity = 0.35) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.35,
    metalness: 0.5,
    emissive: color,
    emissiveIntensity: intensity
  });
}

/* ============================================================
   HERO — 3D DEVELOPER CORE
   ============================================================ */

function initHeroDeveloperCore() {
  // The cinematic media layer replaces the legacy orbital hero scene.
  if (document.querySelector('.hero-cinematic')) return;
  const stage = document.querySelector('#portraitStage');
  const canvas = document.querySelector('#heroThreeCanvas');
  if (!stage || !canvas || reducedMotion.matches) return;

  let renderer;

  try {
    renderer = createRenderer(canvas);
  } catch (error) {
    canvas.hidden = true;
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 7.4);

  const root = new THREE.Group();
  root.rotation.x = -0.08;
  scene.add(root);

  scene.add(new THREE.AmbientLight(0x8fa7c7, 1.15));

  const purpleLight = new THREE.PointLight(0x7c5cff, 17, 18, 2);
  purpleLight.position.set(2.8, 2.3, 4);
  scene.add(purpleLight);

  const cyanLight = new THREE.PointLight(0x38d8ff, 13, 16, 2);
  cyanLight.position.set(-3.2, -1.8, 3.5);
  scene.add(cyanLight);

  const coreGeometry = new THREE.IcosahedronGeometry(1.05, 1);
  const coreMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x7c5cff,
    roughness: 0.24,
    metalness: 0.48,
    transparent: true,
    opacity: 0.16,
    emissive: 0x301d7a,
    emissiveIntensity: 0.45,
    wireframe: false
  });

  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  core.position.z = -0.65;
  root.add(core);

  const wire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.19, 1),
    new THREE.MeshBasicMaterial({
      color: 0xa78bfa,
      wireframe: true,
      transparent: true,
      opacity: 0.48
    })
  );
  wire.position.z = -0.62;
  root.add(wire);

  const ringGroup = new THREE.Group();
  root.add(ringGroup);

  [
    { radius: 1.82, tube: 0.011, color: 0x7c5cff, rotX: 1.08, rotY: 0.18 },
    { radius: 2.12, tube: 0.008, color: 0x38d8ff, rotX: 0.45, rotY: 1.05 },
    { radius: 2.42, tube: 0.006, color: 0xa78bfa, rotX: 1.45, rotY: 0.58 }
  ].forEach(config => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(config.radius, config.tube, 10, 128),
      new THREE.MeshBasicMaterial({
        color: config.color,
        transparent: true,
        opacity: 0.28
      })
    );
    ring.rotation.x = config.rotX;
    ring.rotation.y = config.rotY;
    ringGroup.add(ring);
  });

  const nodeColors = [0x38d8ff, 0xa78bfa, 0x39e58c, 0xff8a5b, 0x4f8cff];
  const nodeGroup = new THREE.Group();
  root.add(nodeGroup);

  const nodeGeometry = new THREE.OctahedronGeometry(0.12, 0);
  const nodes = [];

  for (let index = 0; index < 11; index += 1) {
    const angle = (index / 11) * Math.PI * 2;
    const radius = 2.0 + (index % 3) * 0.24;
    const material = createGlowMaterial(nodeColors[index % nodeColors.length], 0.58);
    const node = new THREE.Mesh(nodeGeometry, material);

    node.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * 0.78,
      Math.sin(angle * 1.8) * 0.82 - 0.2
    );

    node.rotation.set(random(0, Math.PI), random(0, Math.PI), random(0, Math.PI));
    node.userData = {
      phase: random(0, Math.PI * 2),
      speed: random(0.32, 0.62),
      baseScale: random(0.72, 1.28)
    };

    node.scale.setScalar(node.userData.baseScale);
    nodeGroup.add(node);
    nodes.push(node);
  }

  const starsGeometry = new THREE.BufferGeometry();
  const starCount = 55;
  const positions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i += 1) {
    const radius = random(1.8, 3.4);
    const angle = random(0, Math.PI * 2);
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = Math.sin(angle) * radius * 0.8;
    positions[i * 3 + 2] = random(-1.7, 0.8);
  }

  starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const stars = new THREE.Points(
    starsGeometry,
    new THREE.PointsMaterial({
      color: 0x8bdfff,
      size: 0.025,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true
    })
  );
  root.add(stars);

  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const clock = new THREE.Clock();
  let running = false;
  let visible = false;
  let animationFrame = 0;

  const resize = () => setRendererSize(renderer, camera, stage);

  const onPointerMove = event => {
    if (!finePointer.matches) return;
    const rect = stage.getBoundingClientRect();
    pointer.targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointer.targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  };

  const onPointerLeave = () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
  };

  const render = () => {
    if (!running) return;

    const elapsed = clock.getElapsedTime();
    pointer.x = lerp(pointer.x, pointer.targetX, 0.055);
    pointer.y = lerp(pointer.y, pointer.targetY, 0.055);

    root.rotation.y = elapsed * 0.075 + pointer.x * 0.16;
    root.rotation.x = -0.08 + Math.sin(elapsed * 0.35) * 0.025 - pointer.y * 0.11;

    core.rotation.x = elapsed * 0.13;
    core.rotation.y = elapsed * 0.19;
    wire.rotation.x = -elapsed * 0.095;
    wire.rotation.y = elapsed * 0.13;

    ringGroup.children[0].rotation.z = elapsed * 0.10;
    ringGroup.children[1].rotation.z = -elapsed * 0.075;
    ringGroup.children[2].rotation.z = elapsed * 0.055;

    nodes.forEach((node, index) => {
      const phase = elapsed * node.userData.speed + node.userData.phase;
      const pulse = 1 + Math.sin(phase * 1.65 + index) * 0.12;
      node.scale.setScalar(node.userData.baseScale * pulse);
      node.rotation.x += 0.004;
      node.rotation.y += 0.006;
    });

    stars.rotation.z = elapsed * 0.012;
    camera.position.x = pointer.x * 0.12;
    camera.position.y = -pointer.y * 0.09;
    camera.lookAt(0, 0, -0.4);

    renderer.render(scene, camera);
    animationFrame = requestAnimationFrame(render);
  };

  const start = () => {
    if (running || !visible || document.hidden) return;
    running = true;
    clock.start();
    render();
  };

  const stop = () => {
    running = false;
    cancelAnimationFrame(animationFrame);
    clock.stop();
  };

  stage.addEventListener('pointermove', onPointerMove, { passive: true });
  stage.addEventListener('pointerleave', onPointerLeave, { passive: true });

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);

  const visibilityObserver = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    if (visible) start();
    else stop();
  }, { threshold: 0.02 });

  visibilityObserver.observe(stage);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  resize();
}

/* ============================================================
   STACK — LAZY-LOADED GLB CONSTELLATION
   ============================================================ */

function initStackModelScene() {
  const section = document.querySelector('.footer-playground');
  const stage = section;
  const canvas = document.querySelector('#footerThreeCanvas');
  const label = document.querySelector('#stackModelLabel');
  const status = document.querySelector('#stackStatus');
  if (!section || !stage || !canvas || !label || !status || reducedMotion.matches) return;

  const desktop = window.matchMedia('(min-width: 769px)');
  const modelConfigs = [
    { id: 'terminal', file: 'assets/3d/terminal.glb', skill: 'PHP · JavaScript', x: -0.72, y: 0.54, z: 0.65, tilt: -0.08 },
    { id: 'database', file: 'assets/3d/database.glb', skill: 'MySQL · SQL', x: 0.72, y: 0.55, z: -0.85, tilt: 0.07 },
    { id: 'phone', file: 'assets/3d/phone.glb', skill: 'Flutter · Dart', x: -0.83, y: -0.04, z: -0.45, tilt: 0.05 },
    { id: 'browser', file: 'assets/3d/browser.glb', skill: 'HTML · CSS', x: 0.83, y: -0.06, z: 0.5, tilt: -0.05 },
    { id: 'api', file: 'assets/3d/api.glb', skill: 'REST API · Meta API · OAuth', x: -0.67, y: -0.64, z: -1.25, tilt: -0.08 },
    { id: 'server', file: 'assets/3d/server.glb', skill: 'Deployment · Hosting', x: 0.67, y: -0.64, z: -0.15, tilt: 0.08 },
    { id: 'git', file: 'assets/3d/git.glb', skill: 'Git · GitHub', x: -0.34, y: 0.84, z: -1.55, tilt: 0.04 },
    { id: 'code', file: 'assets/3d/code.glb', skill: 'Full-Stack Engineering', x: 0.34, y: -0.85, z: 0.2, tilt: -0.04 }
  ];

  let lazyObserver;
  let visibilityObserver;
  let controller;
  let initializing = false;
  let inViewport = false;
  let pageDisposed = false;

  async function createScene() {
    if (initializing || controller || !desktop.matches || pageDisposed) return;
    initializing = true;
    status.textContent = 'Loading 3D stack — 0 / 8';

    let renderer;
    try {
      renderer = createRenderer(canvas);
    } catch (error) {
      canvas.hidden = true;
      status.textContent = 'Interactive 3D is unavailable; stack details remain below';
      initializing = false;
      return;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080b12, 0.038);

    const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 60);
    camera.position.set(0, 0, 10.5);

    const constellation = new THREE.Group();
    scene.add(constellation);

    const hemisphere = new THREE.HemisphereLight(0xbfd5ff, 0x080910, 1.65);
    const purple = new THREE.PointLight(0x7c5cff, 34, 24, 2);
    const cyan = new THREE.PointLight(0x38d8ff, 28, 22, 2);
    const focusLight = new THREE.PointLight(0x72e7ff, 0, 8, 2);
    purple.position.set(4.5, 3.8, 6.5);
    cyan.position.set(-4.8, -3.2, 5.5);
    focusLight.position.set(0, 0, 3);
    scene.add(hemisphere, purple, cyan, focusLight);

    const loader = new GLTFLoader();
    const items = [];
    const interactiveRoots = [];
    const intersections = [];
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2(2, 2);
    const pointer = { active: false, x: 0, y: 0, smoothX: 0, smoothY: 0, lastInteraction: 0 };
    const projected = new THREE.Vector3();
    const repulsionPoint = new THREE.Vector3();
    const focusPosition = new THREE.Vector3();
    const cyanFocus = new THREE.Color(0x38d8ff);
    const purpleFocus = new THREE.Color(0xa78bfa);
    const disposedGeometries = new Set();
    const disposedMaterials = new Set();
    const disposedTextures = new Set();
    let bounds = { left: 0, top: 0, width: 1, height: 1 };
    let hovered = null;
    let focused = null;
    let focusUntil = 0;
    let labelTarget = null;
    let running = false;
    let frame = 0;
    let resizeFrame = 0;
    let lastTime = performance.now();
    let localDisposed = false;

    function visibleHeightAt(z) {
      const distance = Math.max(0.1, camera.position.z - z);
      return 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) * 0.5) * distance;
    }

    function placeModels() {
      items.forEach(item => {
        const height = visibleHeightAt(item.config.z);
        const width = height * camera.aspect;
        item.base.set(
          item.config.x * width * 0.5,
          item.config.y * height * 0.5,
          item.config.z
        );
        item.safeX = width * 0.205;
        item.repelRadius = height * (200 / bounds.height);
      });
    }

    function measureBounds() {
      const rect = stage.getBoundingClientRect();
      bounds = { left: rect.left, top: rect.top, width: Math.max(1, rect.width), height: Math.max(1, rect.height) };
    }

    function resize() {
      if (localDisposed) return;
      measureBounds();
      setRendererSize(renderer, camera, stage);
      placeModels();
      if (!running) renderer.render(scene, camera);
    }

    function setHovered(next) {
      if (hovered === next) return;
      hovered = next;
      section.classList.toggle('is-interacting', Boolean(hovered || focused));
    }

    function updateLabel(now) {
      const clickActive = Boolean(focused && now < focusUntil);
      if (focused && !clickActive) {
        focused = null;
        section.classList.toggle('is-interacting', Boolean(hovered));
      }

      const nextTarget = clickActive ? focused : hovered;
      label.classList.toggle('is-focused', clickActive);
      if (!nextTarget) {
        labelTarget = null;
        label.classList.remove('is-visible');
        label.style.transform = 'translate3d(-200vw,-200vh,0)';
        return;
      }

      if (labelTarget !== nextTarget) {
        labelTarget = nextTarget;
        label.textContent = nextTarget.config.skill;
      }
      label.classList.add('is-visible');

      nextTarget.wrapper.getWorldPosition(projected);
      projected.project(camera);
      const x = (projected.x * 0.5 + 0.5) * bounds.width;
      const y = (-projected.y * 0.5 + 0.5) * bounds.height;
      const labelX = clamp(x + 18, 12, bounds.width - 210);
      const labelY = clamp(y - 18, 12, bounds.height - 42);
      label.style.transform = `translate3d(${labelX}px,${labelY}px,0)`;
    }

    function updatePointer(event) {
      pointer.active = true;
      pointer.lastInteraction = performance.now();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      pointerNdc.set(pointer.x, pointer.y);
    }

    function onPointerEnter() {
      measureBounds();
    }

    function onPointerLeave() {
      pointer.active = false;
      pointer.x = 0;
      pointer.y = 0;
      pointerNdc.set(2, 2);
      setHovered(null);
    }

    function updateHover(interacting) {
      if (!interacting || !items.length) {
        setHovered(null);
        return;
      }

      raycaster.setFromCamera(pointerNdc, camera);
      intersections.length = 0;
      raycaster.intersectObjects(interactiveRoots, true, intersections);
      let target = null;

      for (const intersection of intersections) {
        let object = intersection.object;
        while (object && !object.userData.stackItem) object = object.parent;
        if (object?.userData.stackItem) {
          target = object.userData.stackItem;
          break;
        }
      }

      setHovered(target);
    }

    function onClick(event) {
      if (!finePointer.matches) return;
      updatePointer(event);
      updateHover(true);
      if (!hovered) return;
      focused = hovered;
      focusUntil = performance.now() + 1000;
      section.classList.add('is-interacting');
      updateLabel(performance.now());
    }

    function render(now) {
      if (!running || localDisposed) return;

      const delta = Math.min(0.034, Math.max(0.001, (now - lastTime) / 1000));
      const elapsed = now * 0.001;
      const interacting = pointer.active && now - pointer.lastInteraction < 2000;
      const clickActive = Boolean(focused && now < focusUntil);
      lastTime = now;
      pointer.smoothX = lerp(pointer.smoothX, interacting ? pointer.x : 0, 0.045);
      pointer.smoothY = lerp(pointer.smoothY, interacting ? pointer.y : 0, 0.045);

      constellation.rotation.y = pointer.smoothX * 0.045;
      constellation.rotation.x = pointer.smoothY * 0.025;
      camera.position.x = pointer.smoothX * 0.2;
      camera.position.y = pointer.smoothY * 0.12;
      camera.lookAt(0, 0, -0.35);

      updateHover(interacting);
      if (interacting) raycaster.setFromCamera(pointerNdc, camera);

      let strongestResponse = 0;
      let lightItem = clickActive ? focused : hovered;

      items.forEach((item, index) => {
        const { wrapper, base, config } = item;
        let repelX = 0;
        let repelY = 0;
        let proximity = 0;

        if (interacting) {
          const distanceAlongRay = (wrapper.position.z - raycaster.ray.origin.z) / raycaster.ray.direction.z;
          raycaster.ray.at(distanceAlongRay, repulsionPoint);
          const dx = base.x - repulsionPoint.x;
          const dy = base.y - repulsionPoint.y;
          const distance = Math.hypot(dx, dy);
          const radius = item.repelRadius;
          if (distance > 0.001 && distance < radius) {
            proximity = 1 - distance / radius;
            const hoverAttenuation = hovered === item ? 0.14 : 1;
            const force = Math.pow(proximity, 2) * radius * 0.24 * hoverAttenuation;
            repelX = dx / distance * force;
            repelY = dy / distance * force;
          }
        }

        const springStrength = interacting ? 44 : 30;
        const springDamping = interacting ? 11 : 9;
        item.velocityX += (repelX - item.offsetX) * springStrength * delta;
        item.velocityY += (repelY - item.offsetY) * springStrength * delta;
        const damping = Math.exp(-springDamping * delta);
        item.velocityX *= damping;
        item.velocityY *= damping;
        item.offsetX += item.velocityX * delta;
        item.offsetY += item.velocityY * delta;

        const floatY = Math.sin(elapsed * item.floatSpeed + item.phase) * 0.1;
        const floatX = Math.cos(elapsed * item.floatSpeed * 0.7 + item.phase) * 0.035;
        const desiredX = base.x + item.offsetX + floatX;
        const hoveredNow = hovered === item;
        const focusedNow = clickActive && focused === item;
        const focusResponse = focusedNow ? 1 : hoveredNow ? 0.72 : proximity * 0.34;
        const targetDepth = proximity * 0.18 + (hoveredNow ? 0.2 : 0) + (focusedNow ? 0.95 : 0);

        wrapper.position.x = config.x < 0 ? Math.min(desiredX, -item.safeX) : Math.max(desiredX, item.safeX);
        wrapper.position.y = base.y + item.offsetY + floatY;
        item.depth = lerp(item.depth, targetDepth, focusedNow ? 0.14 : 0.075);
        wrapper.position.z = base.z + item.depth;

        if (!hoveredNow && !focusedNow) item.rotationY += delta * item.spin;
        const cameraFacingY = Math.atan2(camera.position.x - wrapper.position.x, camera.position.z - wrapper.position.z) * 0.26;
        const targetRotationX = hoveredNow || focusedNow
          ? config.tilt * 0.3
          : config.tilt + Math.sin(elapsed * 0.22 + item.phase) * 0.035;
        const targetRotationY = hoveredNow || focusedNow ? cameraFacingY : item.rotationY;
        const targetRotationZ = hoveredNow || focusedNow ? 0 : Math.cos(elapsed * 0.18 + index) * 0.025;
        wrapper.rotation.x = lerp(wrapper.rotation.x, targetRotationX, hoveredNow || focusedNow ? 0.1 : 0.045);
        wrapper.rotation.y = lerp(wrapper.rotation.y, targetRotationY, hoveredNow || focusedNow ? 0.1 : 0.045);
        wrapper.rotation.z = lerp(wrapper.rotation.z, targetRotationZ, hoveredNow || focusedNow ? 0.1 : 0.045);

        item.appear = Math.min(1, item.appear + delta * 1.6);
        const hoverScale = hoveredNow || focusedNow ? 1.08 : 1;
        item.scale = lerp(item.scale, hoverScale * (0.82 + item.appear * 0.18), hoveredNow || focusedNow ? 0.14 : 0.075);
        wrapper.scale.setScalar(item.scale);

        item.lightResponse = lerp(item.lightResponse, focusResponse, 0.09);
        item.materialStates.forEach(state => {
          state.material.emissive.copy(state.emissive).lerp(index % 2 ? purpleFocus : cyanFocus, item.lightResponse * 0.2);
          state.material.emissiveIntensity = state.emissiveIntensity + item.lightResponse * 0.55;
        });

        if (focusResponse > strongestResponse) {
          strongestResponse = focusResponse;
          if (!clickActive && !hovered) lightItem = item;
        }
      });

      const lightBoost = clickActive ? 1 : hovered ? 0.78 : strongestResponse;
      cyan.intensity = lerp(cyan.intensity, 28 + lightBoost * 14, 0.08);
      purple.intensity = lerp(purple.intensity, 34 + lightBoost * 13, 0.08);
      focusLight.intensity = lerp(focusLight.intensity, lightBoost * (clickActive ? 20 : 12), 0.1);
      if (lightItem) {
        lightItem.wrapper.getWorldPosition(focusPosition);
        focusPosition.z += 1.5;
        focusLight.position.lerp(focusPosition, 0.12);
        focusLight.color.lerpColors(cyanFocus, purpleFocus, lightItem.config.id === 'database' || lightItem.config.id === 'git' ? 0.72 : 0.25);
      }

      updateLabel(now);
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    }

    function start() {
      if (running || !inViewport || document.hidden || localDisposed) return;
      measureBounds();
      running = true;
      section.dataset.stackRaf = 'running';
      lastTime = performance.now();
      frame = requestAnimationFrame(render);
    }

    function stop() {
      running = false;
      section.dataset.stackRaf = 'stopped';
      cancelAnimationFrame(frame);
    }

    function disposeMaterial(material) {
      if (!material || disposedMaterials.has(material)) return;
      disposedMaterials.add(material);
      Object.values(material).forEach(value => {
        if (value?.isTexture && !disposedTextures.has(value)) {
          disposedTextures.add(value);
          value.dispose();
        }
      });
      material.dispose();
    }

    function dispose() {
      if (localDisposed) return;
      localDisposed = true;
      stop();
      resizeObserver.disconnect();
      cancelAnimationFrame(resizeFrame);
      stage.removeEventListener('pointerenter', onPointerEnter);
      stage.removeEventListener('pointermove', updatePointer);
      stage.removeEventListener('pointerleave', onPointerLeave);
      stage.removeEventListener('click', onClick);
      scene.traverse(object => {
        if (object.geometry && !disposedGeometries.has(object.geometry)) {
          disposedGeometries.add(object.geometry);
          object.geometry.dispose();
        }
        if (Array.isArray(object.material)) object.material.forEach(disposeMaterial);
        else disposeMaterial(object.material);
      });
      renderer.dispose();
      renderer.forceContextLoss();
      setHovered(null);
      focused = null;
      label.classList.remove('is-focused');
      section.classList.remove('is-ready');
      section.classList.remove('is-interacting');
      delete section.dataset.stackRaf;
    }

    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(resize);
    });
    resizeObserver.observe(stage);
    stage.addEventListener('pointerenter', onPointerEnter, { passive: true });
    stage.addEventListener('pointermove', updatePointer, { passive: true });
    stage.addEventListener('pointerleave', onPointerLeave, { passive: true });
    stage.addEventListener('click', onClick, { passive: true });
    resize();

    const outcomes = await Promise.allSettled(modelConfigs.map(async (config, index) => {
      const gltf = await loader.loadAsync(config.file);
      if (localDisposed || pageDisposed || !desktop.matches) return;

      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const largestDimension = Math.max(size.x, size.y, size.z, 0.001);
      const normalizedScale = 1.42 / largestDimension;
      const materialStates = [];
      const seenMaterials = new Set();
      model.position.sub(center);
      model.scale.setScalar(normalizedScale);
      model.traverse(object => {
        if (!object.isMesh) return;
        object.frustumCulled = true;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach(material => {
          if (!material) return;
          if ('roughness' in material) material.roughness = Math.max(0.28, material.roughness);
          if ('metalness' in material) material.metalness = Math.min(0.72, material.metalness);
          if (material.emissive && !seenMaterials.has(material)) {
            seenMaterials.add(material);
            materialStates.push({
              material,
              emissive: material.emissive.clone(),
              emissiveIntensity: material.emissiveIntensity || 0
            });
          }
        });
      });

      const wrapper = new THREE.Group();
      const item = {
        config,
        wrapper,
        base: new THREE.Vector3(),
        offsetX: 0,
        offsetY: 0,
        velocityX: 0,
        velocityY: 0,
        depth: 0,
        rotationY: 0,
        lightResponse: 0,
        safeX: 0,
        repelRadius: 1,
        materialStates,
        phase: index * 0.83 + 0.4,
        floatSpeed: 0.55 + (index % 3) * 0.08,
        spin: (index % 2 ? -1 : 1) * (0.08 + index * 0.006),
        scale: 0.82,
        appear: 0
      };
      wrapper.userData.stackItem = item;
      wrapper.add(model);
      constellation.add(wrapper);
      items.push(item);
      interactiveRoots.push(wrapper);
      placeModels();
      status.textContent = `Loading 3D stack — ${items.length} / ${modelConfigs.length}`;
    }));

    if (localDisposed || pageDisposed || !desktop.matches) {
      dispose();
      initializing = false;
      return;
    }

    const loadedCount = outcomes.filter(result => result.status === 'fulfilled').length;
    status.textContent = loadedCount === modelConfigs.length
      ? 'All 8 interactive stack models loaded'
      : `${loadedCount} of ${modelConfigs.length} stack models loaded`;
    if (loadedCount) section.classList.add('is-ready');
    renderer.render(scene, camera);
    controller = { start, stop, dispose };
    initializing = false;
    start();
  }

  function observe() {
    if (!desktop.matches || pageDisposed || lazyObserver) return;

    visibilityObserver = new IntersectionObserver(entries => {
      inViewport = entries.some(entry => entry.isIntersecting);
      if (!controller) return;
      if (inViewport) controller.start();
      else controller.stop();
    }, { threshold: 0.01 });
    visibilityObserver.observe(section);

    lazyObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      lazyObserver.disconnect();
      lazyObserver = null;
      createScene();
    }, { rootMargin: '75% 0px', threshold: 0.01 });
    lazyObserver.observe(section);
  }

  function teardown() {
    lazyObserver?.disconnect();
    visibilityObserver?.disconnect();
    lazyObserver = null;
    visibilityObserver = null;
    controller?.dispose();
    controller = null;
    inViewport = false;
  }

  function onDesktopChange() {
    if (desktop.matches) observe();
    else teardown();
  }

  function onVisibilityChange() {
    if (!controller) return;
    if (document.hidden) controller.stop();
    else if (inViewport) controller.start();
  }

  function onPageHide() {
    pageDisposed = true;
    teardown();
    desktop.removeEventListener('change', onDesktopChange);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  }

  desktop.addEventListener('change', onDesktopChange);
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pagehide', onPageHide, { once: true });
  observe();
}

function initThreeScenes() {
  if (reducedMotion.matches) return;
  initHeroDeveloperCore();
  initStackModelScene();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initThreeScenes, { once: true });
} else {
  initThreeScenes();
}
