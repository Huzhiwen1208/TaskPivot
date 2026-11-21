import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock3, Copy, List, MessageCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useTaxonomy } from '../hooks/useTaxonomy';
import { site } from '../data/site';
import { ArticleArt, Flower } from '../components/Art';
import MarkdownContent, { slugHeading } from '../components/MarkdownContent';
import Comments from '../components/Comments';
import { copyText, formatDate } from '../lib/format';
import NotFoundPage from './NotFoundPage';

export default function ArticlePage() {
  const { id } = useParams();
  const { articles, categories, tags } = useTaxonomy();
  const article = articles.find(item => item.id === id);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState('');
  useEffect(() => {
    const update = () => { const max = document.documentElement.scrollHeight - innerHeight; setProgress(max > 0 ? Math.min(100, scrollY / max * 100) : 0); };
    window.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update); update();
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [id]);
  useEffect(() => { setCopied(''); }, [id]);
  if (!article) return <NotFoundPage />;
  let inCode = false;
  const headings = article.markdown.split('\n').flatMap(line => {
    if (/^```/.test(line)) { inCode = !inCode; return []; }
    const match = !inCode && /^(#{2,3})\s+(.+)$/.exec(line);
    return match ? [{ level: match[1].length, title: match[2].replace(/[`*_]/g, '') }] : [];
  });
  const next = articles[(articles.indexOf(article) + 1) % articles.length];
  return <main className="container article-page"><div className="reading-progress" style={{ width: `${progress}%` }} /><Link className="back-link" to="/articles"><ArrowLeft size={15} />返回文章列表</Link>
    <header className="article-page-heading"><Link className="category-label" to={`/articles?category=${article.categoryId}`}>{categories.find(c => c.id === article.categoryId)?.name}</Link><h1>{article.title}</h1><p>{article.excerpt}</p><div className="article-byline"><span className="mini-avatar">林</span><strong>{site.author}</strong><span>·</span><time dateTime={article.date}>{formatDate(article.date)}</time><span>·</span><span><Clock3 size={13} />{article.readTime} 分钟阅读</span><button onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}><MessageCircle size={13} />聊一聊</button></div></header>
    <div className="article-cover"><ArticleArt type={article.cover} large /></div>
    <div className="article-reading-layout"><article className="article-prose"><MarkdownContent key={article.id} content={article.markdown} /><div className="article-ending"><Flower size={24} /><p>写下来，是为了更好地理解，也为了以后再遇见。</p><div className="article-tags">{article.tagIds.map(tagId => <Link to={`/articles?tag=${tagId}`} key={tagId}># {tags.find(tag => tag.id === tagId)?.name}</Link>)}</div><button className="text-link" onClick={async () => setCopied(await copyText(window.location.href) ? '文章链接已复制' : '无法自动复制，请复制地址栏链接')}>{copied.startsWith('文章') ? <Check size={13} /> : <Copy size={13} />}分享这篇记录</button><span className="share-status" role="status">{copied}</span></div><Link className="next-article" to={`/article/${next.id}`}><span>继续阅读<h3>{next.title}</h3></span><ArrowRight size={23} /></Link><Comments key={article.id} articleId={article.id} /></article>
    <aside className="article-toc"><div><h2><List size={15} />这篇记录的足迹</h2>{headings.map((heading, i) => <button className={heading.level === 3 ? 'toc-sub' : ''} key={`${heading.title}-${i}`} onClick={() => document.getElementById(slugHeading(heading.title))?.scrollIntoView({ behavior: 'smooth' })}>{String(i + 1).padStart(2, '0')}<span>{heading.title}</span></button>)}<div className="toc-note"><Flower size={25} /><p>慢慢读，<br />让想法多停留一会儿。</p></div></div></aside></div>
  </main>;
}
