import { describe, expect, it } from 'vitest';
import { categories, posts, profile, socialLinks } from '../src/data/blog.js';
import { getTagCloud } from '../src/lib/posts.js';
import {
  escapeHtml,
  renderAbout,
  renderArticleContent,
  renderCategoryChips,
  renderContact,
  renderHeader,
  renderHero,
  renderPostGrid,
  renderTagCloud,
} from '../src/ui/templates.js';
import { navItems } from '../src/data/blog.js';

describe('escapeHtml', () => {
  it('转义脚本与引号，避免模板注入', () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;',
    );
  });

  it('空值返回空字符串', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });
});

describe('页面模板', () => {
  it('顶栏输出全部导航并标记首页激活', () => {
    const html = renderHeader({ profile, navItems });
    navItems.forEach((item) => expect(html).toContain(item.label));
    expect(html).toContain('data-nav="home"');
    expect(html).toContain('is-active');
    expect(html).toContain('data-action="toggle-theme"');
  });

  it('Hero 渲染姓名、标语与统计数字', () => {
    const html = renderHero({ profile, posts, categories });
    expect(html).toContain(profile.name);
    expect(html).toContain(profile.tagline);
    expect(html).toContain('id="stage"');
    expect(html).toContain(String(posts.length).padStart(2, '0'));
  });

  it('分类按钮包含数量与激活态', () => {
    const html = renderCategoryChips(categories, posts, 'webgl');
    expect(html).toContain('全部');
    categories.forEach((category) => expect(html).toContain(category.name));
    const active = html.match(/class="chip is-active"[^>]*data-category="webgl"/);
    expect(active).not.toBeNull();
  });

  it('文章卡片渲染主卡与全文按钮', () => {
    const html = renderPostGrid(posts, { categories });
    expect(html).toContain('post-card--lead');
    expect(html).toContain('data-action="open-article"');
    expect(html.match(/<article class="post-card/g)?.length).toBe(posts.length);
  });

  it('空结果展示提示而非空白', () => {
    const html = renderPostGrid([], { categories });
    expect(html).toContain('NO SIGNAL');
    expect(html).toContain('empty-state');
  });

  it('标签云标记激活标签并携带权重', () => {
    const tags = getTagCloud(posts);
    const html = renderTagCloud(tags, tags[0].name);
    expect(html).toContain('is-active');
    expect(html).toContain(`data-tag="${tags[0].name}"`);
    expect(html).toContain('--tag-scale');
  });

  it('关于与联系模块包含个人信息', () => {
    const about = renderAbout({ profile });
    expect(about).toContain(profile.quote);
    profile.skills.forEach((skill) => expect(about).toContain(skill));

    const contact = renderContact({ profile, socialLinks });
    expect(contact).toContain(`mailto:${profile.email}`);
    expect(contact).toContain(profile.github);
  });
});

describe('文章详情模板', () => {
  const post = posts[0];

  it('折叠时只展示首段并提示展开', () => {
    const html = renderArticleContent(post, false);
    expect(html).toContain(post.title);
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('展开全文');
    expect(html.match(/<p>/g)?.length).toBe(1);
  });

  it('展开时输出全部段落并提示收起', () => {
    const html = renderArticleContent(post, true);
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('收起全文');
    expect(html.match(/<p>/g)?.length).toBe(post.body.length);
  });

  it('标签可点击回到筛选', () => {
    const html = renderArticleContent(post, false);
    expect(html).toContain('data-action="set-tag"');
  });
});
