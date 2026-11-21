/**
 * 纯模板函数：输入数据，输出 HTML 字符串。
 * 与 DOM 操作解耦，方便用 jsdom 做单元测试。
 */

import { formatDate, getTagCloud, countByCategory } from '../lib/posts.js';

/** 转义文本，防止内容中的特殊字符破坏结构 */
export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

const moonIcon = `<svg class="icon icon--moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 14.4A8.4 8.4 0 0 1 9.6 3.8 8.5 8.5 0 1 0 20.2 14.4Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
const sunIcon = `<svg class="icon icon--sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`;

export function renderHeader({ profile, navItems }) {
  return `
  <header class="site-header" id="site-header">
    <a class="brand" href="#home" aria-label="${escapeHtml(profile.name)} 的博客首页">
      <span class="brand__mark" aria-hidden="true">◎</span>
      <span class="brand__text">
        <strong>${escapeHtml(profile.name)}</strong>
        <small>ORBIT NOTES</small>
      </span>
    </a>
    <nav class="nav" aria-label="主导航">
      ${navItems
        .map(
          (item) =>
            `<a class="nav__link${item.id === 'home' ? ' is-active' : ''}" href="#${item.id}" data-nav="${item.id}">${escapeHtml(item.label)}</a>`,
        )
        .join('')}
    </nav>
    <div class="header-tools">
      <button class="icon-btn" type="button" data-action="toggle-theme" aria-label="切换亮色或暗色主题" aria-pressed="false" title="切换主题">
        ${moonIcon}${sunIcon}
      </button>
    </div>
  </header>`;
}

export function renderHero({ profile, posts, categories }) {
  const tagCount = getTagCloud(posts).length;
  const stats = [
    ['文章', String(posts.length).padStart(2, '0')],
    ['主题', String(categories.length).padStart(2, '0')],
    ['标签', String(tagCount).padStart(2, '0')],
  ];

  return `
  <section class="hero" id="home" data-section="home">
    <div class="hero__inner">
      <div class="hero__copy">
        <p class="eyebrow"><span class="dot" aria-hidden="true"></span>ORBIT NOTES · 观测日志</p>
        <h1 class="hero__title">
          <span class="hero__name">${escapeHtml(profile.name)}</span>
          <span class="hero__role">${escapeHtml(profile.role)}</span>
        </h1>
        <p class="hero__tagline">${escapeHtml(profile.tagline)}</p>
        <p class="hero__intro">${escapeHtml(profile.intro)}</p>
        <div class="hero__actions">
          <a class="btn btn--primary" href="#articles">浏览文章<span aria-hidden="true">↘</span></a>
          <a class="btn btn--ghost" href="#about">关于我</a>
        </div>
        <dl class="hero__stats">
          ${stats
            .map(
              ([label, value]) =>
                `<div class="hero__stat"><dt>${label}</dt><dd>${value}</dd></div>`,
            )
            .join('')}
        </dl>
      </div>
      <!-- 透明交互层：负责拖拽旋转与射线点击，画布本身不接收事件 -->
      <div class="hero__stage" id="stage" role="application" aria-label="三维场景交互区：拖拽旋转，滚轮或双指缩放，点击光点筛选主题">
        <div class="stage__label" id="stage-label" aria-hidden="true"></div>
        <p class="stage__hint"><span class="stage__pulse" aria-hidden="true"></span><span class="stage__hint-desktop">拖拽旋转 · 滚轮缩放</span><span class="stage__hint-touch">横向拖动旋转 · 双指缩放</span></p>
      </div>
    </div>
    <button class="hero__scroll" type="button" data-action="scroll-to" data-target="articles">
      向下滚动<span aria-hidden="true">↓</span>
    </button>
  </section>`;
}

export function renderCategoryChips(categories, posts, activeCategory) {
  const all = `
    <button class="chip${activeCategory === 'all' ? ' is-active' : ''}" type="button" data-action="set-category" data-category="all" aria-pressed="${activeCategory === 'all'}">
      全部<span class="chip__count">${posts.length}</span>
    </button>`;
  return (
    all +
    categories
      .map((category) => {
        const count = countByCategory(posts, category.id);
        const active = activeCategory === category.id;
        return `<button class="chip${active ? ' is-active' : ''}" type="button" style="--chip-accent:${category.color}" data-action="set-category" data-category="${category.id}" aria-pressed="${active}">
          <i aria-hidden="true"></i>${escapeHtml(category.name)}<span class="chip__count">${count}</span>
        </button>`;
      })
      .join('')
  );
}

function renderCard(post, categoryMap, index) {
  const category = categoryMap.get(post.category);
  return `
  <article class="post-card${index === 0 ? ' post-card--lead' : ''}" style="--accent:${category?.color || '#67e8f9'}" data-reveal>
    <div class="post-card__top">
      <span class="post-card__cat"><i aria-hidden="true"></i>${escapeHtml(category?.name || '未分类')}</span>
      <time datetime="${escapeHtml(post.date)}">${formatDate(post.date)}</time>
    </div>
    <h3 class="post-card__title"><button type="button" class="post-card__link" data-action="open-article" data-id="${post.id}">${escapeHtml(post.title)}</button></h3>
    <p class="post-card__excerpt">${escapeHtml(post.excerpt)}</p>
    <div class="post-card__foot">
      <span>${post.readTime} 分钟阅读</span>
      <button class="link" type="button" data-action="open-article" data-id="${post.id}" aria-label="阅读全文：${escapeHtml(post.title)}">阅读全文 <span aria-hidden="true">→</span></button>
    </div>
  </article>`;
}

export function renderPostGrid(posts, { categories }) {
  if (!posts.length) {
    return `<div class="empty-state" data-reveal>
      <p class="eyebrow">NO SIGNAL</p>
      <p>这个频段暂时没有文章，试试切换分类或清除标签筛选。</p>
    </div>`;
  }
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  return posts.map((post, index) => renderCard(post, categoryMap, index)).join('');
}

export function renderTagCloud(tags, activeTag) {
  return tags
    .map((tag) => {
      const scale = Math.min(1.55, 0.92 + tag.count * 0.16);
      const active = activeTag === tag.name;
      return `<button class="tag${active ? ' is-active' : ''}" type="button" style="--tag-scale:${scale.toFixed(2)}" data-action="set-tag" data-tag="${escapeHtml(tag.name)}" aria-pressed="${active}">
        ${escapeHtml(tag.name)}<span>${tag.count}</span>
      </button>`;
    })
    .join('');
}

export function renderAbout({ profile }) {
  return `
  <section class="section about" id="about" data-section="about">
    <header class="section__head" data-reveal>
      <p class="eyebrow">03 / OBSERVER</p>
      <h2>关于这位观测者</h2>
    </header>
    <div class="about__grid">
      <blockquote class="about__quote" data-reveal>
        “${escapeHtml(profile.quote)}”
      </blockquote>
      <div class="about__body" data-reveal>
        <p>${escapeHtml(profile.intro)}</p>
        <p>目前常驻${escapeHtml(profile.location)}，持续记录前端工程与三维交互的实践。这个博客本身就是一个实验：让内容与场景共享同一套空间语法。</p>
        <ul class="about__skills" aria-label="技能标签">
          ${profile.skills.map((skill) => `<li>${escapeHtml(skill)}</li>`).join('')}
        </ul>
      </div>
    </div>
  </section>`;
}

export function renderContact({ profile, socialLinks }) {
  return `
  <section class="section contact" id="contact" data-section="contact">
    <header class="section__head" data-reveal>
      <p class="eyebrow">04 / SIGNAL</p>
      <h2>建立一条通信链路</h2>
      <p class="section__desc">合作、交流或只是打个招呼，都欢迎写信给我。</p>
    </header>
    <div class="contact__card" data-reveal>
      <a class="contact__mail" href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a>
      <div class="contact__actions">
        <button class="btn btn--primary" type="button" data-action="copy-email" data-email="${escapeHtml(profile.email)}">复制邮箱</button>
        <a class="btn btn--ghost" href="${escapeHtml(profile.github)}" target="_blank" rel="noreferrer noopener">GitHub ↗</a>
      </div>
      <ul class="contact__links">
        ${socialLinks
          .map(
            (link) =>
              `<li><a href="${escapeHtml(link.href)}"${link.href.startsWith('http') ? ' target="_blank" rel="noreferrer noopener"' : ''}>${escapeHtml(link.label)}</a></li>`,
          )
          .join('')}
      </ul>
    </div>
  </section>`;
}

export function renderFooter({ profile }) {
  return `
  <footer class="site-footer">
    <p>© 2026 ${escapeHtml(profile.name)} · 星穹手记</p>
    <p>Built with Three.js · 手写状态管理 · 无外部素材请求</p>
  </footer>`;
}

/** 文章详情面板骨架，内容按需注入以保留过渡动画 */
export function renderPanelShell() {
  return `
  <aside class="panel" id="article-panel" data-open="false" aria-hidden="true">
    <div class="panel__scrim" data-action="close-article" aria-hidden="true"></div>
    <article class="panel__sheet" role="dialog" aria-modal="true" aria-labelledby="panel-title">
      <button class="panel__close" type="button" data-action="close-article" aria-label="关闭文章详情">
        <span aria-hidden="true">×</span>
      </button>
      <div class="panel__content" id="panel-content"></div>
    </article>
  </aside>`;
}

export function renderArticleContent(post, expanded) {
  const paragraphs = expanded ? post.body : post.body.slice(0, 1);
  const tags = post.tags
    .map(
      (tag) =>
        `<button class="tag tag--small" type="button" data-action="set-tag" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`,
    )
    .join('');
  return `
    <p class="eyebrow">${formatDate(post.date)} · ${post.readTime} 分钟阅读</p>
    <h2 class="panel__title" id="panel-title">${escapeHtml(post.title)}</h2>
    <div class="panel__tags">${tags}</div>
    <div class="panel__body">
      ${paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
    </div>
    <button class="btn btn--ghost panel__toggle" type="button" data-action="toggle-expanded" aria-expanded="${expanded}">
      ${expanded ? '收起全文' : '展开全文'}
    </button>`;
}
