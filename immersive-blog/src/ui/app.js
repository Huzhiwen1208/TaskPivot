/**
 * 页面 UI 装配层：负责渲染模板、事件委托、滚动监听与场景联动。
 * 不直接依赖 Three.js，3D 实例通过 attachScene 注入。
 */

import { profile, navItems, categories, posts, socialLinks } from '../data/blog.js';
import { createBlogStore } from '../state/store.js';
import { filterPosts, getTagCloud, findPost } from '../lib/posts.js';
import {
  renderHeader,
  renderHero,
  renderCategoryChips,
  renderPostGrid,
  renderTagCloud,
  renderAbout,
  renderContact,
  renderFooter,
  renderPanelShell,
  renderArticleContent,
} from './templates.js';

const PREFERS_REDUCED =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function getStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function scrollBehavior() {
  return PREFERS_REDUCED ? 'auto' : 'smooth';
}

function scrollToId(id) {
  const target = document.getElementById(id);
  target?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
}

export function mountApp(root) {
  const store = createBlogStore({ storage: getStorage() });

  root.innerHTML = `
    ${renderHeader({ profile, navItems })}
    <main>
      ${renderHero({ profile, posts, categories })}
      <section class="section" id="articles" data-section="articles">
        <header class="section__head" data-reveal>
          <p class="eyebrow">01 / ARCHIVE</p>
          <h2>最新文章</h2>
          <p class="section__desc">按主题浏览，或从标签云进入某条线索。</p>
        </header>
        <div class="chips" id="category-chips" role="group" aria-label="文章分类筛选"></div>
        <div class="post-grid" id="post-grid" aria-live="polite"></div>
      </section>
      ${renderTagCloudSection()}
      ${renderAbout({ profile })}
      ${renderContact({ profile, socialLinks })}
    </main>
    ${renderFooter({ profile })}
    ${renderPanelShell()}
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
  `;

  document.body.classList.add('is-loading');

  const els = {
    header: root.querySelector('#site-header'),
    chips: root.querySelector('#category-chips'),
    grid: root.querySelector('#post-grid'),
    tags: root.querySelector('#tag-cloud'),
    panel: root.querySelector('#article-panel'),
    panelContent: root.querySelector('#panel-content'),
    toast: root.querySelector('#toast'),
    themeButton: root.querySelector('[data-action="toggle-theme"]'),
    metaTheme: document.querySelector('meta[name="theme-color"]'),
  };

  let scene = null;
  let lastCategoryKey = '';
  let lastGridKey = '';
  let lastPanelKey = '';
  let lastToastId = 0;
  let toastTimer = 0;

  /** 滚动进入视口时渐显，避免一次性展示所有内容 */
  const revealObserver =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
        )
      : null;

  function observeReveals(scope) {
    if (!revealObserver) {
      scope.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
      return;
    }
    scope.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((el) => {
      revealObserver.observe(el);
    });
  }

  function showToast(toast) {
    if (!toast || toast.id === lastToastId) return;
    lastToastId = toast.id;
    els.toast.textContent = toast.message;
    els.toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      els.toast.classList.remove('is-visible');
      store.actions.clearToast();
    }, 3200);
  }

  function syncTheme(state) {
    document.documentElement.dataset.theme = state.theme;
    els.themeButton?.setAttribute('aria-pressed', String(state.theme === 'light'));
    els.themeButton?.setAttribute(
      'aria-label',
      state.theme === 'dark' ? '切换到亮色主题' : '切换到暗色主题',
    );
    if (els.metaTheme) {
      els.metaTheme.setAttribute('content', state.theme === 'dark' ? '#05070f' : '#f4f1e8');
    }
    scene?.setTheme(state.theme);
  }

  function syncPanel(state) {
    const key = `${state.openPostId ?? 'none'}|${state.expanded}`;
    const post = state.openPostId ? findPost(posts, state.openPostId) : null;

    if (post) {
      if (key !== lastPanelKey) {
        els.panelContent.innerHTML = renderArticleContent(post, state.expanded);
        lastPanelKey = key;
        // 展开后把新内容滚动到视野内
        if (state.expanded) {
          window.setTimeout(() => {
            els.panel.querySelector('.panel__toggle')?.scrollIntoView({
              behavior: scrollBehavior(),
              block: 'nearest',
            });
          }, 60);
        }
      }
      if (els.panel.dataset.open !== 'true') {
        els.panel.dataset.open = 'true';
        els.panel.setAttribute('aria-hidden', 'false');
        document.body.classList.add('is-locked');
        window.setTimeout(() => {
          els.panel.querySelector('.panel__close')?.focus({ preventScroll: true });
        }, 80);
      }
    } else {
      lastPanelKey = '';
      if (els.panel.dataset.open !== 'false') {
        els.panel.dataset.open = 'false';
        els.panel.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('is-locked');
      }
    }
  }

  function sync(state) {
    syncTheme(state);

    root.querySelectorAll('[data-nav]').forEach((link) => {
      const active = link.dataset.nav === state.activeSection;
      link.classList.toggle('is-active', active);
      if (active) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    const categoryKey = `${state.activeCategory}|${state.activeTag}`;
    if (categoryKey !== lastCategoryKey) {
      lastCategoryKey = categoryKey;
      els.chips.innerHTML = renderCategoryChips(categories, posts, state.activeCategory);
    }

    const filtered = filterPosts(posts, {
      category: state.activeCategory,
      tag: state.activeTag,
    });
    const gridKey = `${state.activeCategory}|${state.activeTag}|${filtered.length}`;
    if (gridKey !== lastGridKey) {
      lastGridKey = gridKey;
      els.grid.innerHTML = renderPostGrid(filtered, { categories });
      observeReveals(els.grid);
    }

    const tagKey = state.activeTag || '';
    if (tagKey !== els.tags.dataset.active) {
      els.tags.dataset.active = tagKey;
      els.tags.innerHTML = renderTagCloud(getTagCloud(posts), state.activeTag);
    }

    syncPanel(state);
    showToast(state.toast);
  }

  function selectCategory(categoryId, { announce = true, scroll = true } = {}) {
    const category = categories.find((item) => item.id === categoryId);
    store.actions.setCategory(categoryId);
    if (announce) {
      store.actions.notify(`已切换至「${category?.name ?? '全部'}」主题`);
    }
    if (scroll) scrollToId('articles');
  }

  async function copyEmail(email) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const input = document.createElement('textarea');
        input.value = email;
        input.setAttribute('readonly', '');
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        input.remove();
      }
      store.actions.notify('邮箱已复制到剪贴板');
    } catch {
      store.actions.notify('复制失败，请手动选择邮箱地址');
    }
  }

  // 统一事件委托，动态渲染的卡片也无需重复绑定
  root.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-action]');
    if (!trigger) return;
    const { action } = trigger.dataset;

    switch (action) {
      case 'toggle-theme':
        store.actions.toggleTheme();
        break;
      case 'set-category':
        store.actions.setCategory(trigger.dataset.category);
        break;
      case 'set-tag':
        store.actions.setTag(trigger.dataset.tag);
        if (store.getState().openPostId) {
          store.actions.closeArticle();
          window.setTimeout(() => scrollToId('articles'), 260);
        }
        break;
      case 'open-article':
        store.actions.openArticle(trigger.dataset.id);
        break;
      case 'close-article':
        store.actions.closeArticle();
        break;
      case 'toggle-expanded':
        store.actions.toggleExpanded();
        break;
      case 'scroll-to':
        scrollToId(trigger.dataset.target);
        break;
      case 'copy-email':
        copyEmail(trigger.dataset.email);
        break;
      default:
        break;
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && store.getState().openPostId) {
      store.actions.closeArticle();
    }
  });

  // 滚动监听：更新顶栏状态、滚动进度与激活的导航项
  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
        scene?.setScroll(progress);
        els.header?.classList.toggle('is-scrolled', window.scrollY > 24);
        ticking = false;
      });
    },
    { passive: true },
  );

  // 使用 IntersectionObserver 做导航高亮，避免滚动时高频计算
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            store.actions.setSection(entry.target.dataset.section);
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    root.querySelectorAll('[data-section]').forEach((section) => spy.observe(section));
  }

  observeReveals(root);
  store.subscribe(sync);

  return {
    store,
    selectCategory,
    attachScene(instance) {
      scene = instance;
      scene.setTheme(store.getState().theme);
    },
    setScrollProgress(progress) {
      scene?.setScroll(progress);
    },
    setBootStatus(text) {
      const el = document.getElementById('boot-status');
      if (el) el.textContent = text;
    },
    setSceneReady() {
      store.actions.setLoading(false);
    },
  };
}

function renderTagCloudSection() {
  return `
  <section class="section topics" id="topics" data-section="topics">
    <header class="section__head" data-reveal>
      <p class="eyebrow">02 / CONSTELLATIONS</p>
      <h2>标签星云</h2>
      <p class="section__desc">点击任意标签，收束到同一频段的信号。</p>
    </header>
    <div class="tag-cloud" id="tag-cloud" data-reveal></div>
  </section>`;
}
