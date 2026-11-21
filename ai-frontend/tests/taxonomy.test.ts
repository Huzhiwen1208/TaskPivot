import { describe, expect, it } from 'vitest';
import { addTaxonomyItem, assignTaxonomy, createInitialTaxonomy, parseTaxonomy, removeTaxonomyCategory, removeTaxonomyTag } from '../src/lib/taxonomy';
import type { Article } from '../src/types';

const articles: Article[] = [
  { id: 'first', title: '文章一', excerpt: '', date: '2026-11-12', categoryId: 'tech', tagIds: ['react'], readTime: 3, cover: 'code', markdown: '' },
  { id: 'second', title: '文章二', excerpt: '', date: '2026-11-11', categoryId: 'life', tagIds: ['react', 'daily'], readTime: 2, cover: 'light', markdown: '' },
];
const initial = () => createInitialTaxonomy(articles, [{ id: 'tech', name: '技术' }, { id: 'life', name: '生活' }], [{ id: 'react', name: 'React' }, { id: 'daily', name: '日常' }]);

describe('taxonomy integrity', () => {
  it('rejects invalid persisted records and empty categories', () => {
    expect(() => parseTaxonomy({ ...initial(), categories: [] }, articles)).toThrow();
    expect(() => parseTaxonomy({ ...initial(), assignments: { first: { categoryId: 'tech', tagIds: 'react' } } }, articles)).toThrow();
    expect(() => parseTaxonomy({ ...initial(), tags: [{ id: 'a', name: 'React' }, { id: 'b', name: ' react ' }] }, articles)).toThrow();
  });

  it('migrates articles when their category is removed and preserves one category', () => {
    const next = removeTaxonomyCategory(initial(), 'life');
    expect(next.assignments.second.categoryId).toBe('tech');
    expect(next.assignments.second.tagIds).toEqual(['react', 'daily']);
    expect(() => removeTaxonomyCategory(next, 'tech')).toThrow('至少需要保留一个分类');
  });

  it('removes deleted tags from every article without mutating previous state', () => {
    const previous = initial();
    const next = removeTaxonomyTag(previous, 'react');
    expect(next.assignments.first.tagIds).toEqual([]);
    expect(next.assignments.second.tagIds).toEqual(['daily']);
    expect(previous.assignments.first.tagIds).toEqual(['react']);
  });

  it('validates names and assignments and reconciles newly bundled articles', () => {
    expect(() => addTaxonomyItem(initial(), 'tags', ' react ', 'new')).toThrow('已经存在');
    expect(() => addTaxonomyItem(initial(), 'tags', '   ', 'new')).toThrow();
    expect(() => assignTaxonomy(initial(), 'first', 'missing', [])).toThrow('有效分类');
    const onlyFirst = { ...initial(), assignments: { first: { categoryId: 'tech', tagIds: [] } } };
    const restored = parseTaxonomy(onlyFirst, articles);
    expect(restored.assignments.second).toEqual({ categoryId: 'life', tagIds: ['react', 'daily'] });
    expect(assignTaxonomy(initial(), 'first', 'life', ['daily', 'daily']).assignments.first.tagIds).toEqual(['daily']);
  });

  it('keeps local deletions while assigning newly bundled articles to available categories and tags', () => {
    const saved = removeTaxonomyTag(removeTaxonomyCategory(initial(), 'tech'), 'react');
    const incoming = [...articles, { ...articles[0], id: 'new-entry', tagIds: ['react', 'daily'] }];
    const restored = parseTaxonomy(JSON.parse(JSON.stringify(saved)), incoming);
    expect(restored.categories.map(item => item.id)).toEqual(['life']);
    expect(restored.tags.map(item => item.id)).toEqual(['daily']);
    expect(restored.assignments['new-entry']).toEqual({ categoryId: 'life', tagIds: ['daily'] });
    expect(restored.assignments.first).toEqual({ categoryId: 'life', tagIds: [] });
    expect(parseTaxonomy(JSON.parse(JSON.stringify(restored)), incoming)).toEqual(restored);
  });
});
