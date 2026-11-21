import { describe, expect, it } from 'vitest';
import { categories, navItems, posts, profile } from '../src/data/blog.js';
import {
  countByCategory,
  filterPosts,
  findPost,
  formatDate,
  getTagCloud,
} from '../src/lib/posts.js';

describe('博客数据完整性', () => {
  it('文章 id 唯一且必填字段完整', () => {
    const ids = new Set();
    posts.forEach((post) => {
      expect(ids.has(post.id)).toBe(false);
      ids.add(post.id);
      ['title', 'category', 'date', 'excerpt'].forEach((key) => {
        expect(typeof post[key]).toBe('string');
        expect(post[key].length).toBeGreaterThan(0);
      });
      expect(Array.isArray(post.tags)).toBe(true);
      expect(post.tags.length).toBeGreaterThan(0);
      expect(post.body.length).toBeGreaterThan(1);
      expect(post.readTime).toBeGreaterThan(0);
    });
  });

  it('每篇文章的分类都存在于分类列表', () => {
    const ids = new Set(categories.map((item) => item.id));
    posts.forEach((post) => expect(ids.has(post.category)).toBe(true));
  });

  it('导航项包含首页与文章锚点', () => {
    const ids = navItems.map((item) => item.id);
    expect(ids).toContain('home');
    expect(ids).toContain('articles');
  });

  it('个人信息包含邮箱与 GitHub 地址', () => {
    expect(profile.email).toMatch(/@/);
    expect(profile.github).toMatch(/^https:/);
  });
});

describe('文章查询工具', () => {
  it('按分类筛选', () => {
    const result = filterPosts(posts, { category: 'webgl' });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((post) => post.category === 'webgl')).toBe(true);
  });

  it('按标签筛选', () => {
    const result = filterPosts(posts, { tag: 'Three.js' });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((post) => post.tags.includes('Three.js'))).toBe(true);
  });

  it('分类与标签组合筛选', () => {
    const result = filterPosts(posts, { category: 'webgl', tag: '设计系统' });
    expect(result.every((post) => post.category === 'webgl' && post.tags.includes('设计系统'))).toBe(
      true,
    );
  });

  it('默认返回全部文章', () => {
    expect(filterPosts(posts).length).toBe(posts.length);
  });

  it('标签云按出现次数降序排列', () => {
    const cloud = getTagCloud(posts);
    expect(cloud.length).toBeGreaterThan(0);
    for (let index = 1; index < cloud.length; index += 1) {
      expect(cloud[index - 1].count).toBeGreaterThanOrEqual(cloud[index].count);
    }
  });

  it('findPost 可按 id 查找，找不到时返回 null', () => {
    expect(findPost(posts, posts[0].id)?.title).toBe(posts[0].title);
    expect(findPost(posts, 'not-exist')).toBeNull();
  });

  it('formatDate 输出点分格式', () => {
    expect(formatDate('2026-11-08')).toBe('2026.11.08');
  });

  it('countByCategory 统计数量正确', () => {
    const expected = posts.filter((post) => post.category === 'frontend').length;
    expect(countByCategory(posts, 'frontend')).toBe(expected);
    expect(countByCategory(posts, 'unknown')).toBe(0);
  });
});
