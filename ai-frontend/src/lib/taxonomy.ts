import type { Article, TaxonomyItem, TaxonomyState } from '../types';

export const TAXONOMY_STORAGE_KEY = 'shiguang-taxonomy-v1';
export type TaxonomyKind = 'categories' | 'tags';

function normalizeName(name: string): string {
  const value = name.trim();
  if (!value || value.length > 20) throw new Error('名称需要填写 1–20 个字符。');
  return value;
}

function checkName(items: TaxonomyItem[], name: string, exceptId?: string): string {
  const value = normalizeName(name);
  if (items.some(item => item.id !== exceptId && item.name.toLocaleLowerCase() === value.toLocaleLowerCase())) {
    throw new Error('这个名称已经存在，请换一个名称。');
  }
  return value;
}

function fallbackCategory(categories: TaxonomyItem[]): string {
  return (categories.find(item => item.id === 'tech') ?? categories[0]).id;
}

export function createInitialTaxonomy(articles: Article[], categories: TaxonomyItem[], tags: TaxonomyItem[]): TaxonomyState {
  return {
    version: 1,
    categories: categories.map(item => ({ ...item })),
    tags: tags.map(item => ({ ...item })),
    assignments: Object.fromEntries(articles.map(article => [article.id, { categoryId: article.categoryId, tagIds: [...article.tagIds] }])),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateItems(value: unknown, requireOne: boolean): value is TaxonomyItem[] {
  if (!Array.isArray(value) || (requireOne && !value.length) || value.length > 300) return false;
  const ids = new Set<string>();
  const names = new Set<string>();
  return value.every(item => {
    if (!isRecord(item) || typeof item.id !== 'string' || !item.id || item.id.length > 100 || typeof item.name !== 'string') return false;
    const name = item.name.trim();
    const key = name.toLocaleLowerCase();
    if (!name || name.length > 20 || ids.has(item.id) || names.has(key)) return false;
    ids.add(item.id);
    names.add(key);
    return true;
  });
}

/** Validate saved data and reconcile assignments with the current bundled articles. */
export function parseTaxonomy(value: unknown, articles: Article[]): TaxonomyState {
  if (!isRecord(value) || value.version !== 1 || !validateItems(value.categories, true) || !validateItems(value.tags, false) || !isRecord(value.assignments)) {
    throw new Error('本地分类数据格式不正确，已使用默认内容。');
  }
  const categories = value.categories.map(item => ({ id: item.id, name: item.name.trim() }));
  const tags = value.tags.map(item => ({ id: item.id, name: item.name.trim() }));
  const categoryIds = new Set(categories.map(item => item.id));
  const tagIds = new Set(tags.map(item => item.id));
  const assignments: TaxonomyState['assignments'] = {};
  for (const article of articles) {
    const saved = value.assignments[article.id];
    if (saved !== undefined && (!isRecord(saved) || typeof saved.categoryId !== 'string' || !Array.isArray(saved.tagIds) || !saved.tagIds.every(id => typeof id === 'string'))) {
      throw new Error('本地文章分类数据格式不正确，已使用默认内容。');
    }
    const assignment = saved as { categoryId: string; tagIds: string[] } | undefined;
    const categoryId = assignment?.categoryId ?? article.categoryId;
    assignments[article.id] = {
      categoryId: categoryIds.has(categoryId) ? categoryId : fallbackCategory(categories),
      tagIds: [...new Set((assignment?.tagIds ?? article.tagIds).filter(id => tagIds.has(id)))],
    };
  }
  return { version: 1, categories, tags, assignments };
}

export function addTaxonomyItem(state: TaxonomyState, kind: TaxonomyKind, name: string, id: string): TaxonomyState {
  const value = checkName(state[kind], name);
  if (state[kind].length >= 300) throw new Error('最多支持 300 个条目，请先整理现有内容。');
  if (state[kind].some(item => item.id === id)) throw new Error('条目标识重复，请重试。');
  return { ...state, [kind]: [...state[kind], { id, name: value }] };
}

export function renameTaxonomyItem(state: TaxonomyState, kind: TaxonomyKind, id: string, name: string): TaxonomyState {
  if (!state[kind].some(item => item.id === id)) throw new Error('这个条目已经不存在，请刷新后重试。');
  const value = checkName(state[kind], name, id);
  return { ...state, [kind]: state[kind].map(item => item.id === id ? { ...item, name: value } : item) };
}

export function removeTaxonomyCategory(state: TaxonomyState, id: string): TaxonomyState {
  if (!state.categories.some(item => item.id === id)) throw new Error('这个分类已经不存在。');
  if (state.categories.length <= 1) throw new Error('至少需要保留一个分类。');
  const categories = state.categories.filter(item => item.id !== id);
  const replacement = fallbackCategory(categories);
  const assignments = Object.fromEntries(Object.entries(state.assignments).map(([articleId, item]) => [articleId, item.categoryId === id ? { ...item, categoryId: replacement } : item]));
  return { ...state, categories, assignments };
}

export function removeTaxonomyTag(state: TaxonomyState, id: string): TaxonomyState {
  if (!state.tags.some(item => item.id === id)) throw new Error('这个标签已经不存在。');
  const assignments = Object.fromEntries(Object.entries(state.assignments).map(([articleId, item]) => [articleId, { ...item, tagIds: item.tagIds.filter(tagId => tagId !== id) }]));
  return { ...state, tags: state.tags.filter(item => item.id !== id), assignments };
}

export function assignTaxonomy(state: TaxonomyState, articleId: string, categoryId: string, tagIds: string[]): TaxonomyState {
  if (!Object.hasOwn(state.assignments, articleId)) throw new Error('这篇文章已经不存在。');
  if (!state.categories.some(item => item.id === categoryId)) throw new Error('请选择一个有效分类。');
  const validTags = new Set(state.tags.map(item => item.id));
  if (tagIds.some(id => !validTags.has(id))) throw new Error('选择的标签已发生变化，请重新选择。');
  return { ...state, assignments: { ...state.assignments, [articleId]: { categoryId, tagIds: [...new Set(tagIds)] } } };
}

export function applyTaxonomy(articles: Article[], state: TaxonomyState): Article[] {
  return articles.map(article => ({ ...article, ...(state.assignments[article.id] ?? { categoryId: fallbackCategory(state.categories), tagIds: [] }) }));
}
