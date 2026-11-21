import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, BookOpen, Search, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTaxonomy } from '../hooks/useTaxonomy';
import { queryArticles } from '../lib/articles';
import { formatDate } from '../lib/format';
import { Flower } from './Art';

export default function SearchDialog({ onClose }: { onClose: () => void }) {
  const { articles, categories, tags } = useTaxonomy();
  const [query, setQuery] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const results = queryArticles(articles.map(article => ({ ...article, markdown: `${article.markdown}\n${categories.find(c => c.id === article.categoryId)?.name} ${article.tagIds.map(id => tags.find(t => t.id === id)?.name).join(' ')}` })), { query });
  useEffect(() => {
    inputRef.current?.focus();
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        const nodes = dialogRef.current?.querySelectorAll<HTMLElement>('button, input, a');
        if (!nodes?.length) return;
        const first = nodes[0]; const last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = original; document.removeEventListener('keydown', keydown); };
  }, [onClose]);
  const submit = (event: React.FormEvent) => { event.preventDefault(); navigate(`/articles${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`); onClose(); };
  return <div className="modal-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose(); }}><div className="search-dialog" role="dialog" aria-modal="true" aria-label="搜索博客" ref={dialogRef}>
    <form onSubmit={submit} className="search-input-row"><Search size={22} /><input ref={inputRef} placeholder="寻找一个想法、一段记录…" aria-label="全站搜索关键词" value={query} onChange={event => setQuery(event.target.value)} />{query && <button type="button" aria-label="清空搜索" onClick={() => { setQuery(''); inputRef.current?.focus(); }}><X size={17} /></button>}<button type="button" className="escape-button" onClick={onClose} aria-label="关闭搜索">ESC</button></form>
    <div className="search-results"><div className="search-results-label" role="status" aria-live="polite">{query ? `找到 ${results.length} 篇相关文章` : '最近写下的'}</div>{results.slice(0, 6).map(article => <Link key={article.id} className="search-result" to={`/article/${article.id}`} onClick={onClose}><span className="search-result-icon"><BookOpen size={18} /></span><span><strong>{article.title}</strong><small>{categories.find(c => c.id === article.categoryId)?.name} · {formatDate(article.date)}</small></span><ArrowUpRight size={16} /></Link>)}{!results.length && <div className="empty-state"><Flower size={30} /><h3>暂时没有找到这段记录。</h3><p>试试“React”“学习”或“生活”吧。</p><button className="text-link" onClick={() => setQuery('')}>清空关键词</button></div>}</div>
    <div className="search-footer"><span><kbd>↵</kbd> 查看全部结果</span><Link to={`/articles${query ? `?q=${encodeURIComponent(query)}` : ''}`} onClick={onClose}>打开文章列表 <ArrowUpRight size={13} /></Link></div>
  </div></div>;
}
