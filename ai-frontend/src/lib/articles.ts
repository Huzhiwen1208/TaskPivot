import type { Article } from '../types';

export interface ArticleQuery {
  query?: string;
  categoryId?: string;
  tagId?: string;
}

/** 所有搜索词都必须命中，分类和标签可以与文本搜索组合。不会改动原数组。 */
export function queryArticles(articles: Article[], { query = '', categoryId, tagId }: ArticleQuery = {}): Article[] {
  const tokens = query.trim().toLocaleLowerCase().split(/\s+/u).filter(Boolean);
  return articles.filter(article => {
    if (categoryId && categoryId !== 'all' && article.categoryId !== categoryId) return false;
    if (tagId && tagId !== 'all' && !article.tagIds.includes(tagId)) return false;
    const searchable = [article.title, article.excerpt, ...article.tagIds, article.markdown].join(' ').toLocaleLowerCase();
    return tokens.every(token => searchable.includes(token));
  }).sort((a, b) => b.date.localeCompare(a.date));
}

/** 空列表仍保留第 1 页；无效分页参数回到安全默认值。 */
export function paginate<T>(items: T[], requestedPage: number, requestedPageSize: number) {
  const pageSize = Number.isFinite(requestedPageSize) && requestedPageSize >= 1 ? Math.floor(requestedPageSize) : 6;
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const candidate = Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1;
  const page = Math.min(totalPages, Math.max(1, candidate));
  return { items: items.slice((page - 1) * pageSize, page * pageSize), totalPages, total, page };
}

