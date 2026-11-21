/**
 * Three.js 场景：星轨晶体 + 粒子星云 + 轨道光点。
 *
 * 设计原则：
 * - 画布固定铺在内容层之下，舞台层只负责手势与射线拾取，避免滚动冲突；
 * - 所有几何体程序化生成，无外部模型/贴图请求，首屏不会被资源阻塞；
 * - 像素比、粒子数与卫星数量按设备档位裁剪，并在帧率不足时二次降级；
 * - 提供 dispose() 完整释放 GPU 资源。
 */

import * as THREE from 'three';
import {
  settingsForTier,
  createFpsMonitor,
  clampZoom,
  parallaxOffset,
} from './quality.js';

const PALETTES = {
  dark: {
    core: 0x0a1024,
    coreEmissive: 0x2f3fa0,
    wire: 0x7ee7ff,
    ringA: 0x67e8f9,
    ringB: 0xa78bfa,
    star: 0xbfe8ff,
    dust: 0x8b6fff,
    halo: 0x67e8f9,
    ambient: 0x9fb4ff,
    key: 0x8fe9ff,
    rim: 0xc084fc,
  },
  light: {
    core: 0xcfe0e8,
    coreEmissive: 0x0e7490,
    wire: 0x0b5f73,
    ringA: 0x0e7490,
    ringB: 0x7c3aed,
    star: 0x415a7a,
    dust: 0x7c6bb0,
    halo: 0x22d3ee,
    ambient: 0xffffff,
    key: 0xffffff,
    rim: 0xbfa4f7,
  },
};

/** 程序化生成一张径向渐变贴图，用作光点与辉光（纹理懒加载） */
function createGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.32, 'rgba(255,255,255,0.42)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/** 在球壳内生成粒子位置，中心留空避免遮挡主体 */
function createShellPositions(count, minRadius, maxRadius) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const radius = minRadius + Math.random() * (maxRadius - minRadius);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.72;
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }
  return positions;
}

export function createSceneApp({
  host,
  stage,
  categories = [],
  quality = 'high',
  reducedMotion = false,
  onReady,
  onSelect,
  onError,
}) {
  const settings = settingsForTier(quality);
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

  const renderer = new THREE.WebGLRenderer({
    antialias: settings.antialias,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, settings.maxDpr));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.className = 'scene-canvas';
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    60,
  );
  camera.position.set(0, 0, 8);

  const world = new THREE.Group();
  scene.add(world);

  const artifact = new THREE.Group();
  artifact.rotation.x = 0.18;
  world.add(artifact);

  // 自动缓慢自转的内层，和手势旋转分离，两者互不干扰
  const spin = new THREE.Group();
  artifact.add(spin);

  const texture = createGlowTexture();

  // —— 主体晶体 ——
  const coreGeometry = new THREE.IcosahedronGeometry(1.16, 1);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0x0a1024,
    emissive: 0x2f3fa0,
    emissiveIntensity: 0.62,
    metalness: 0.86,
    roughness: 0.28,
    flatShading: true,
    transparent: true,
    opacity: 0.97,
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  spin.add(core);

  const wireMaterial = new THREE.LineBasicMaterial({
    color: 0x7ee7ff,
    transparent: true,
    opacity: 0.78,
  });
  const wire = new THREE.LineSegments(new THREE.EdgesGeometry(coreGeometry), wireMaterial);
  wire.scale.setScalar(1.005);
  spin.add(wire);

  const innerGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0x67e8f9,
    transparent: true,
    opacity: 0.1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const innerGlow = new THREE.Mesh(new THREE.SphereGeometry(0.98, 24, 24), innerGlowMaterial);
  spin.add(innerGlow);

  const haloMaterial = new THREE.SpriteMaterial({
    map: texture,
    color: 0x67e8f9,
    transparent: true,
    opacity: 0.36,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const halo = new THREE.Sprite(haloMaterial);
  halo.scale.setScalar(5.4);
  spin.add(halo);

  // —— 轨道环 ——
  const ringMaterials = [];
  const ringGeometry = new THREE.TorusGeometry(1.76, 0.0075, 6, settings.ringSegments);
  const ringConfigs = [
    { rotation: [Math.PI / 2.2, 0.2, 0], color: 'ringA', opacity: 0.55 },
    { rotation: [Math.PI / 1.65, -0.45, 0.4], color: 'ringB', opacity: 0.38 },
    { rotation: [Math.PI / 2.8, 0.9, -0.2], color: 'ringA', opacity: 0.26 },
  ];
  ringConfigs.forEach((config) => {
    const material = new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: config.opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeometry, material);
    ring.rotation.set(...config.rotation);
    ring.userData.tone = config.color;
    ringMaterials.push(material);
    spin.add(ring);
  });

  // —— 卫星光点：可点击的分类入口 ——
  const interactive = [];
  const satellites = [];
  const limitedCategories = categories.slice(0, settings.satellites);

  limitedCategories.forEach((category, index) => {
    const radius = 1.78 + (index % 3) * 0.44;
    const pivot = new THREE.Group();
    pivot.rotation.x = (index % 2 === 0 ? 1 : -1) * (0.34 + index * 0.08);
    pivot.rotation.z = index * 0.55;

    const gemMaterial = new THREE.MeshStandardMaterial({
      color: category.color,
      emissive: category.color,
      emissiveIntensity: 1.15,
      metalness: 0.35,
      roughness: 0.25,
    });
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), gemMaterial);
    gem.position.x = radius;

    // 不可见的放大拾取体，让触屏点击更容易命中
    const hit = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 8, 8),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
        colorWrite: false,
      }),
    );
    hit.position.copy(gem.position);
    hit.userData.categoryId = category.id;

    pivot.add(gem, hit);
    artifact.add(pivot);

    satellites.push({
      pivot,
      gem,
      angle: Math.random() * Math.PI * 2,
      speed: 0.13 + index * 0.035,
    });
    interactive.push(hit);
  });

  // —— 粒子星云 ——
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(createShellPositions(settings.particles, 6, 24), 3),
  );
  const starMaterial = new THREE.PointsMaterial({
    size: 0.052,
    map: texture,
    color: 0xbfe8ff,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    alphaTest: 0.02,
  });
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(createShellPositions(settings.dust, 2.6, 6.5), 3),
  );
  const dustMaterial = new THREE.PointsMaterial({
    size: 0.034,
    map: texture,
    color: 0x8b6fff,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    alphaTest: 0.02,
  });
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  scene.add(dust);

  // —— 光照 ——
  const ambientLight = new THREE.AmbientLight(0x9fb4ff, 1.05);
  scene.add(ambientLight);

  const keyLight = new THREE.PointLight(0x8fe9ff, 42, 40, 2);
  keyLight.position.set(4.5, 3.2, 5.5);
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(0xc084fc, 32, 40, 2);
  rimLight.position.set(-4.5, -2.6, -3.5);
  scene.add(rimLight);

  // —— 交互状态 ——
  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();
  const pointers = new Map();
  const label = stage.querySelector('#stage-label');

  const drag = {
    active: false,
    hadPinch: false,
    lastX: 0,
    lastY: 0,
    moved: 0,
  };
  let pinchStartDistance = 0;
  let pinchStartZoom = 0;

  const rotationTarget = { x: 0.18, y: 0 };
  let zoomTarget = window.innerWidth < 900 ? 11.2 : 8;
  let zoomCurrent = zoomTarget;
  let scrollProgress = 0;
  let narrow = window.innerWidth < 900;
  let userZoomed = false;
  let worldTarget = { x: 0, y: 0 };

  const getPinchDistance = () => {
    const [a, b] = [...pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const ndcFromEvent = (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    return pointerNdc;
  };

  const pick = (event) => {
    raycaster.setFromCamera(ndcFromEvent(event), camera);
    const hits = raycaster.intersectObjects(interactive, false);
    return hits.length ? hits[0].object : null;
  };

  const hideLabel = () => {
    label?.classList.remove('is-visible');
    stage.style.cursor = '';
  };

  const showLabel = (event, category) => {
    if (!label) return;
    const rect = stage.getBoundingClientRect();
    label.textContent = `${category.name} · 点击查看`;
    label.style.transform = `translate(${Math.round(event.clientX - rect.left + 18)}px, ${Math.round(
      event.clientY - rect.top + 18,
    )}px)`;
    label.classList.add('is-visible');
    stage.style.cursor = 'pointer';
  };

  let lastHoverCheck = 0;

  const onPointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    stage.setPointerCapture?.(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.size === 1) {
      drag.active = true;
      drag.hadPinch = false;
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
      drag.moved = 0;
      stage.classList.add('is-grabbing');
      hideLabel();
    } else {
      drag.active = false;
      drag.hadPinch = true;
      pinchStartDistance = getPinchDistance();
      pinchStartZoom = zoomTarget;
    }
  };

  const onPointerMove = (event) => {
    if (pointers.has(event.pointerId)) {
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }

    // 双指缩放
    if (pointers.size >= 2) {
      const distance = getPinchDistance();
      if (pinchStartDistance > 0) {
        const scale = distance / pinchStartDistance;
        zoomTarget = clampZoom(pinchStartZoom / Math.max(scale, 0.2), 6.2, 12);
        userZoomed = true;
      }
      return;
    }

    if (drag.active) {
      const dx = event.clientX - drag.lastX;
      const dy = event.clientY - drag.lastY;
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
      drag.moved += Math.abs(dx) + Math.abs(dy);

      // 触屏上纵向滑动交给页面滚动，只响应横向旋转
      if (!isCoarsePointer || Math.abs(dx) >= Math.abs(dy)) {
        rotationTarget.y += dx * 0.0055;
        rotationTarget.x = Math.min(
          0.7,
          Math.max(-0.5, rotationTarget.x + dy * 0.0035),
        );
      }
      return;
    }

    // 鼠标悬停时做低频射线检测，避免每帧开销
    if (event.pointerType === 'mouse') {
      const now = performance.now();
      if (now - lastHoverCheck < 90) return;
      lastHoverCheck = now;
      const hit = pick(event);
      if (hit) {
        const category = categories.find((item) => item.id === hit.userData.categoryId);
        if (category) showLabel(event, category);
      } else {
        hideLabel();
      }
    }
  };

  const endPointer = (event) => {
    const wasSingle = pointers.size === 1;
    pointers.delete(event.pointerId);

    if (pointers.size === 0) {
      stage.classList.remove('is-grabbing');
      if (wasSingle && drag.active && !drag.hadPinch && drag.moved < 9) {
        const hit = pick(event);
        if (hit) {
          hideLabel();
          onSelect?.(hit.userData.categoryId);
        }
      }
      drag.active = false;
      drag.hadPinch = false;
      pinchStartDistance = 0;
    } else if (pointers.size === 1) {
      // 双指变单指后重新建立拖拽基准，避免视角跳变
      const [only] = [...pointers.values()];
      drag.active = true;
      drag.lastX = only.x;
      drag.lastY = only.y;
      pinchStartDistance = 0;
    }
  };

  const onPointerCancel = (event) => {
    pointers.delete(event.pointerId);
    if (pointers.size === 0) {
      drag.active = false;
      drag.hadPinch = false;
      stage.classList.remove('is-grabbing');
    }
  };

  const onWheel = (event) => {
    event.preventDefault();
    zoomTarget = clampZoom(zoomTarget + event.deltaY * 0.0016, 6.2, 12);
    userZoomed = true;
  };

  const controller = new AbortController();
  const { signal } = controller;

  stage.addEventListener('pointerdown', onPointerDown, { signal });
  stage.addEventListener('pointermove', onPointerMove, { signal });
  stage.addEventListener('pointerup', endPointer, { signal });
  stage.addEventListener('pointercancel', onPointerCancel, { signal });
  stage.addEventListener('pointerleave', hideLabel, { signal });
  stage.addEventListener('wheel', onWheel, { passive: false, signal });

  // —— 布局 ——
  function layout() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    narrow = width < 900;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, settings.maxDpr),
    );

    worldTarget = narrow
      ? { x: 0, y: -1.62 }
      : { x: Math.min(2.55, (width / height) * 1.16), y: 0 };

    // 窄屏时拉远镜头，避免晶体与文案、按钮重叠
    if (!userZoomed) {
      zoomTarget = narrow ? 11.2 : 8;
      zoomCurrent = zoomTarget;
    }

    if (narrow) {
      camera.fov = 52;
      camera.updateProjectionMatrix();
    } else {
      camera.fov = 45;
      camera.updateProjectionMatrix();
    }
  }

  const onResize = () => layout();
  window.addEventListener('resize', onResize, { signal });

  // 首帧前先摆放好位置，避免出现跳动
  layout();
  world.position.set(worldTarget.x, worldTarget.y, 0);

  // —— 主题 ——
  let currentTheme = null;

  function setTheme(theme) {
    if (theme === currentTheme) return;
    currentTheme = theme;
    const palette = PALETTES[theme] || PALETTES.dark;

    coreMaterial.color.setHex(palette.core);
    coreMaterial.emissive.setHex(palette.coreEmissive);
    // 亮色背景需要更低的金属度与自发光，避免晶体变成实心色块
    coreMaterial.emissiveIntensity = theme === 'light' ? 0.16 : 0.62;
    coreMaterial.metalness = theme === 'light' ? 0.35 : 0.86;
    coreMaterial.roughness = theme === 'light' ? 0.42 : 0.28;
    wireMaterial.color.setHex(palette.wire);
    wireMaterial.opacity = theme === 'light' ? 0.72 : 0.78;
    innerGlowMaterial.color.setHex(palette.halo);
    haloMaterial.color.setHex(palette.halo);
    starMaterial.color.setHex(palette.star);
    dustMaterial.color.setHex(palette.dust);
    starMaterial.opacity = theme === 'light' ? 0.62 : 0.92;
    dustMaterial.opacity = theme === 'light' ? 0.4 : 0.65;
    ambientLight.color.setHex(palette.ambient);
    keyLight.color.setHex(palette.key);
    rimLight.color.setHex(palette.rim);

    ringMaterials.forEach((material, index) => {
      const tone = ringConfigs[index].color;
      material.color.setHex(tone === 'ringA' ? palette.ringA : palette.ringB);
    });
  }

  setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

  // —— 帧率与降级 ——
  const fpsMonitor = createFpsMonitor({ threshold: 45, sampleSize: 30, strikes: 2 });
  let degraded = false;
  let lastFrameTime = performance.now();

  function degrade() {
    if (degraded) return;
    degraded = true;
    renderer.setPixelRatio(1);
    starGeometry.setDrawRange(0, Math.floor(settings.particles * 0.45));
    dust.visible = false;
    stage.dataset.quality = 'low';
  }

  // —— 动画循环 ——
  const clock = new THREE.Clock();
  let rafId = 0;
  let ready = false;

  function animate(now) {
    rafId = window.requestAnimationFrame(animate);

    const deltaMs = now - lastFrameTime;
    lastFrameTime = now;
    const delta = Math.min(clock.getDelta(), 0.05);
    const time = clock.elapsedTime;
    const motion = reducedMotion ? 0.25 : 1;

    // 自转与呼吸
    spin.rotation.y += delta * 0.14 * motion;
    spin.rotation.z = Math.sin(time * 0.28) * 0.06;
    const pulse = 1 + Math.sin(time * 1.4) * 0.035;
    innerGlow.scale.setScalar(pulse);
    haloMaterial.opacity = 0.32 + Math.sin(time * 0.9) * 0.05;

    // 卫星轨道
    satellites.forEach((satellite, index) => {
      satellite.angle += delta * satellite.speed * motion;
      satellite.pivot.rotation.y = satellite.angle;
      const bob = 1 + Math.sin(time * 1.8 + index) * 0.12;
      satellite.gem.scale.setScalar(bob);
    });

    // 手势旋转（带阻尼）
    artifact.rotation.y += (rotationTarget.y - artifact.rotation.y) * 0.075;
    artifact.rotation.x += (rotationTarget.x - artifact.rotation.x) * 0.075;

    // 视差与缩放
    const parallax = parallaxOffset(scrollProgress, narrow ? 0.5 : 1.4);
    camera.position.x += ((reducedMotion ? 0 : parallax.x) - camera.position.x) * 0.045;
    camera.position.y += ((reducedMotion ? 0 : parallax.y) - camera.position.y) * 0.045;
    zoomCurrent += (zoomTarget - zoomCurrent) * 0.08;
    camera.position.z = zoomCurrent;
    camera.lookAt(0, 0, 0);

    world.position.x += (worldTarget.x - world.position.x) * 0.06;
    world.position.y += (worldTarget.y - world.position.y) * 0.06;

    stars.rotation.y += delta * 0.012 * motion;
    dust.rotation.y -= delta * 0.02 * motion;

    renderer.render(scene, camera);

    if (!ready) {
      ready = true;
      onReady?.();
    }

    if (!degraded && fpsMonitor.push(deltaMs)) {
      degrade();
    }
  }

  rafId = window.requestAnimationFrame(animate);

  // 页面不可见时暂停渲染，节省电量
  const onVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    } else if (!rafId) {
      clock.getDelta();
      lastFrameTime = performance.now();
      rafId = window.requestAnimationFrame(animate);
    }
  };
  document.addEventListener('visibilitychange', onVisibility, { signal });

  // 上下文丢失时优雅降级为二维页面
  const onContextLost = (event) => {
    event.preventDefault();
    onError?.(new Error('WebGL context lost'));
  };
  renderer.domElement.addEventListener('webglcontextlost', onContextLost, { signal });

  return {
    setTheme,
    setScroll(progress) {
      scrollProgress = progress;
    },
    dispose() {
      controller.abort();
      cancelAnimationFrame(rafId);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            if (material.map) material.map.dispose();
            material.dispose();
          });
        }
      });
      texture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
