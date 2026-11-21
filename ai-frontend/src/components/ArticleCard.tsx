import { ArrowUpRight, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Article } from '../types';
import { ArticleArt, Flower } from './Art';
import { useTaxonomy } from '../hooks/useTaxonomy';
import { formatDate } from '../lib/format';

export default function ArticleCard({ article, index = 0 }: { article: Article; index?: number }) {
  const { categories, tags } = useTaxonomy();
  return <article className="article-card" style={{ animationDelay: `${Math.min(index, 5) * 45}ms` }}>
    <Link className="article-image-link" to={`/article/${article.id}`} tabIndex={-1} aria-hidden="true"><ArticleArt type={article.cover} /><span className="image-arrow"><ArrowUpRight size={18} /></span>{article.featured && <span className="featured-label"><Flower size={12} />精选文章</span>}</Link>
    <div className="article-meta"><Link className="category-label" to={`/articles?category=${article.categoryId}`}>{categories.find(c => c.id === article.categoryId)?.name || '未分类'}</Link><time dateTime={article.date}>{formatDate(article.date)}</time></div>
    <h3><Link to={`/article/${article.id}`}>{article.title}</Link></h3><p className="article-excerpt">{article.excerpt}</p>
    <div className="article-bottom"><div className="article-tags">{article.tagIds.slice(0, 2).map(id => <Link key={id} to={`/articles?tag=${id}`}>#{tags.find(tag => tag.id === id)?.name || id}</Link>)}</div><span className="reading-time"><Clock3 size={12} />{article.readTime} 分钟</span></div>
  </article>;
}
