import { useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useTaxonomy } from '../hooks/useTaxonomy';
import { paginate, queryArticles } from '../lib/articles';
import ArticleCard from './ArticleCard';
import { Flower } from './Art';

export default function ArticleBrowser() {
  const { articles, categories, tags } = useTaxonomy();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const categoryId = params.get('category') || '';
  const tagId = params.get('tag') || '';
  const listRef = useRef<HTMLDivElement>(null);
  const searchable = useMemo(() => articles.map(article => ({ ...article, markdown: `${article.markdown}\n${categories.find(c => c.id === article.categoryId)?.name || ''} ${article.tagIds.map(id => tags.find(t => t.id === id)?.name).join(' ')}` })), [articles, categories, tags]);
  const filtered = useMemo(() => queryArticles(searchable, { query, categoryId, tagId }), [searchable, query, categoryId, tagId]);
  const paged = paginate(filtered, Number(params.get('page')) || 1, 6);
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: key === 'q' });
    if (key === 'page') requestAnimationFrame(() => listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  return <div ref={listRef} className="article-browser" id="article-list">
    <div className="list-toolbar"><div className="category-tabs" role="group" aria-label="文章分类"><button onClick={() => update('category', '')} aria-pressed={!categoryId} className={!categoryId ? 'selected' : ''}>全部文章<span>{articles.length}</span></button>{categories.map(category => <button key={category.id} onClick={() => update('category', category.id)} aria-pressed={categoryId === category.id} className={categoryId === category.id ? 'selected' : ''}>{category.name}</button>)}</div><label className="inline-search"><Search size={15} /><input aria-label="搜索文章列表" placeholder="搜索你感兴趣的内容…" value={query} onChange={event => update('q', event.target.value)} />{query && <button onClick={() => update('q', '')} aria-label="清空文章搜索"><X size={13} /></button>}</label></div>
    {(tagId || categoryId && !categories.some(c => c.id === categoryId)) && <div className="active-filter"><SlidersHorizontal size={13} /><span>{tagId ? `标签：${tags.find(t => t.id === tagId)?.name || '已移除的标签'}` : '分类已移除'}</span><button onClick={() => { setParams(query ? { q: query } : {}); }}>清除筛选<X size={12} /></button></div>}
    <div className="result-announcement" role="status" aria-live="polite">{query || tagId || categoryId ? `找到 ${filtered.length} 篇文章` : ''}</div>
    {paged.items.length ? <div className="articles-grid">{paged.items.map((article, index) => <ArticleCard article={article} key={article.id} index={index} />)}</div> : <div className="empty-state"><Flower size={35} /><h3>这颗种子，还没发芽。</h3><p>换一个关键词，或看看其他分类里的故事。</p><button className="text-link" onClick={() => setParams({})}>查看全部文章<ChevronRight size={15} /></button></div>}
    {paged.items.length > 0 && <nav className="pagination" aria-label="文章分页"><span className="pagination-count">共 {paged.total} 篇 · 第 {paged.page} / {paged.totalPages} 页</span><div><button aria-label="上一页" disabled={paged.page === 1} onClick={() => update('page', String(paged.page - 1))}><ChevronLeft size={16} /></button>{Array.from({ length: paged.totalPages }, (_, i) => i + 1).map(page => <button key={page} aria-current={page === paged.page ? 'page' : undefined} className={page === paged.page ? 'current' : ''} onClick={() => update('page', String(page))}>{page}</button>)}<button aria-label="下一页" disabled={paged.page === paged.totalPages} onClick={() => update('page', String(paged.page + 1))}><ChevronRight size={16} /></button></div><span className="pagination-note">每一次记录，都算数。</span></nav>}
  </div>;
}
