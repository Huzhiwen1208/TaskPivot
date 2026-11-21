/**
 * 应用入口：
 * 1. 先渲染静态界面，确保首屏内容不依赖 Three.js；
 * 2. 在浏览器空闲帧动态加载三维模块，实现按需加载；
 * 3. 三维就绪前展示品牌启动层，超时兜底避免首屏被阻塞。
 */

import './styles.css';
import { mountApp } from './ui/app.js';
import { categories } from './data/blog.js';

const root = document.querySelector('#app');
const app = mountApp(root);
const bootStart = performance.now();

let bootClosed = false;

function closeBoot() {
  if (bootClosed) return;
  bootClosed = true;
  app.setSceneReady();
  document.body.classList.remove('is-loading');
  const boot = document.getElementById('boot');
  if (boot) {
    boot.classList.add('is-done');
    window.setTimeout(() => boot.remove(), 700);
  }
}

// 兜底：即使三维初始化异常或网络缓慢，首屏也在 2.6 秒内可交互
window.setTimeout(closeBoot, 2600);

function scheduleIdle(callback) {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(callback, { timeout: 600 });
  } else {
    window.setTimeout(callback, 160);
  }
}

function initScene() {
  app.setBootStatus('正在构建三维星轨…');

  Promise.all([import('./three/app.js'), import('./three/quality.js')])
    .then(([{ createSceneApp }, { detectQualityTier }]) => {
      const stage = document.getElementById('stage');
      const host = document.getElementById('scene-root');
      if (!stage || !host) return;

      const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
      const mobile = window.innerWidth < 760 || coarsePointer;
      const tier = detectQualityTier({
        width: window.innerWidth,
        hardwareConcurrency: navigator.hardwareConcurrency || 8,
        deviceMemory: navigator.deviceMemory || 8,
        mobile,
      });

      const scene = createSceneApp({
        host,
        stage,
        categories,
        quality: tier,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        onReady: () => {
          // 保证启动层至少展示一小段时间，避免闪烁
          const elapsed = performance.now() - bootStart;
          window.setTimeout(closeBoot, Math.max(0, 420 - elapsed));
          host.classList.add('is-ready');
        },
        onSelect: (categoryId) => {
          app.selectCategory(categoryId);
          closeBoot();
        },
        onError: (error) => {
          console.warn('三维场景降级：', error);
          document.body.classList.add('no-webgl');
          host.classList.remove('is-ready');
          closeBoot();
        },
      });

      app.attachScene(scene);
      host.classList.add('is-ready');

      // 初始化滚动进度，避免刷新后场景仍停在初始镜头
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scene.setScroll(max > 0 ? Math.min(1, window.scrollY / max) : 0);

      window.addEventListener('pagehide', () => scene.dispose(), { once: true });
    })
    .catch((error) => {
      // 网络加载失败或浏览器不支持 WebGL 时，保留完整的二维博客体验
      console.warn('三维模块加载失败，已使用二维模式：', error);
      document.body.classList.add('no-webgl');
      closeBoot();
    });
}

// 等待两次绘制，确保 HTML/CSS 首屏已完成再加载三维模块
window.requestAnimationFrame(() => {
  window.requestAnimationFrame(() => {
    scheduleIdle(initScene);
  });
});
