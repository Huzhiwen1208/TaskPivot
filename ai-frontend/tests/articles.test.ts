import { describe, expect, it } from 'vitest';
import type { Article } from '../src/types';
import { paginate, queryArticles } from '../src/lib/articles';
import { articles, initialCategories, initialTags } from '../src/data/articles';

it('ships complete Markdown with valid taxonomy references and unique article URLs', () => {
  expect(articles.length).toBe(12);
  expect(new Set(articles.map(article => article.id)).size).toBe(articles.length);
  for (const article of articles) {
    expect(initialCategories.some(category => category.id === article.categoryId)).toBe(true);
    expect(article.tagIds.every(id => initialTags.some(tag => tag.id === id))).toBe(true);
    expect(article.markdown.split('## ').length).toBeGreaterThanOrEqual(4);
    expect(article.markdown.length).toBeGreaterThan(200);
  }
  expect(articles[0].markdown).toContain(String.fromCharCode(96).repeat(3) + 'typescript');
  expect(articles[0].markdown).toContain('| --- | --- | --- |');
});

const entries: Article[] = [
  { id: 'older', title: '学习 React', excerpt: '第一次做组件', date: '2026-10-01', categoryId: 'tech', tagIds: ['react', 'typescript'], readTime: 4, cover: 'code', markdown: '## 状态\n用 TypeScript 让组件更加清晰。' },
  { id: 'newer', title: 'React 的小练习', excerpt: '把问题写下来', date: '2026-11-01', categoryId: 'study', tagIds: ['react', 'notes'], readTime: 3, cover: 'notes', markdown: '## 记录\n这是一篇学习笔记。' },
  { id: 'life', title: '一个安静的周末', excerpt: '在校园散步', date: '2026-10-20', categoryId: 'life', tagIds: ['life'], readTime: 2, cover: 'mountain', markdown: '山野和日落。' },
];

describe('article discovery', () => {
  it('combines category, tag and all text tokens', () => {
    expect(queryArticles(entries, { query: 'REACT TypeScript', categoryId: 'tech', tagId: 'react' }).map(a => a.id)).toEqual(['older']);
    expect(queryArticles(entries, { query: 'React', categoryId: 'life' })).toEqual([]);
  });
  it('searches Unicode titles, Markdown text and tag ids with trimmed case insensitive tokens', () => {
    expect(queryArticles(entries, { query: '  状态  typescript\n' }).map(a => a.id)).toEqual(['older']);
    expect(queryArticles(entries, { query: '山野' }).map(a => a.id)).toEqual(['life']);
    expect(queryArticles(entries, { query: 'NOTES' }).map(a => a.id)).toEqual(['newer']);
  });
  it('sorts descending without changing the source and treats all as an unfiltered value', () => {
    expect(queryArticles(entries, { categoryId: 'all', tagId: 'all', query: '  ' }).map(a => a.id)).toEqual(['newer', 'life', 'older']);
    expect(entries[0].id).toBe('older');
  });
});

describe('article pagination', () => {
  it('keeps page boundaries predictable and exposes counts', () => {
    expect(paginate([1, 2, 3, 4, 5], 2, 2)).toEqual({ items: [3, 4], page: 2, total: 5, totalPages: 3 });
  });
  it('clamps invalid or out of range pages including empty collections', () => {
    expect(paginate([1, 2, 3], 99, 2)).toEqual({ items: [3], page: 2, total: 3, totalPages: 2 });
    expect(paginate([], -1, 3)).toEqual({ items: [], page: 1, total: 0, totalPages: 1 });
    expect(paginate([1, 2], Number.NaN, 2).page).toBe(1);
  });
  it('uses a safe page size for nonpositive and nonfinite values', () => {
    expect(paginate([1, 2, 3, 4, 5, 6, 7], 2, 0).items).toEqual([7]);
    expect(paginate([1, 2], 1, Infinity).items).toEqual([1, 2]);
  });
});

