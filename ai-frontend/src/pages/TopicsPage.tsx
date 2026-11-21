import { ArrowRight, FolderOpen, Hash, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTaxonomy } from '../hooks/useTaxonomy';

export default function TopicsPage() {
  const { categories, tags, articles } = useTaxonomy();
  return <main className="container inner-page topics-page"><div className="page-heading"><div className="section-eyebrow">FOLLOW YOUR CURIOSITY</div><h1>顺着兴趣，慢慢逛<span>.</span></h1><p>给每一个想法，找到合适的抽屉。</p></div><div className="topics-heading"><h2><FolderOpen size={20} />文章分类</h2><Link className="text-link" to="/manage"><Settings2 size={14} />管理分类与标签</Link></div><div className="topic-cards">{categories.map((category, index) => <Link className="topic-card" key={category.id} to={`/articles?category=${category.id}`}><span className="topic-number">0{index + 1}</span><h3>{category.name}</h3><p>{articles.filter(a => a.categoryId === category.id).length} 篇文章</p><ArrowRight size={21} /></Link>)}</div><div className="topics-heading tag-heading"><h2><Hash size={20} />从一个关键词开始</h2><span>{tags.length} 个标签</span></div><div className="topic-tags">{tags.map(tag => <Link to={`/articles?tag=${tag.id}`} key={tag.id}># {tag.name}<span>{articles.filter(a => a.tagIds.includes(tag.id)).length}</span></Link>)}</div></main>;
}
