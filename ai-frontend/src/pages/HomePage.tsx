import { ArrowRight, ArrowUpRight, BookOpen, Leaf, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { site, notes } from '../data/site';
import { useTaxonomy } from '../hooks/useTaxonomy';
import { Flower, HeroArt } from '../components/Art';
import ArticleBrowser from '../components/ArticleBrowser';
import { useState } from 'react';

export default function HomePage() {
  const { articles } = useTaxonomy();
  const [showAllNotes, setShowAllNotes] = useState(false);
  return <main><section className="hero container"><div className="hero-copy"><div className="eyebrow"><span />HELLO, I'M {site.englishName}<Flower size={14} /></div><h1>在日常里，<br />一点一点<span className="growth-word">生长<svg viewBox="0 0 180 12" aria-hidden="true"><path d="M4 8C40 1 118 1 176 6" /></svg></span>。</h1><p className="hero-description">{site.description}</p><div className="hero-buttons"><a className="button button-primary" href="#article-list" onClick={event => { event.preventDefault(); document.getElementById('latest')?.scrollIntoView({ behavior: 'smooth' }); }}>翻开我的博客<ArrowRight size={17} /></a><Link className="text-link" to="/about">认识一下<ArrowUpRight size={15} /></Link></div><div className="hero-footnote"><span className="status-dot" />持续学习中<span className="mini-separator">/</span>保持好奇，也保持真实</div></div><HeroArt /></section>
    <div className="intro-strip container"><div><Leaf size={16} />这里没有标准答案，只有一个普通大学生的探索与记录。</div><span>LEARN. BUILD. LIVE.</span></div>
    <section className="articles-section container" id="latest"><div className="section-heading"><div><div className="section-eyebrow">THE LATEST ENTRIES</div><h2>最近写下的<span>.</span></h2><p>让想法落地，让经历留下痕迹。</p></div><Link className="section-count" to="/articles"><BookOpen size={15} />共 {articles.length} 篇文章<ArrowUpRight size={13} /></Link></div><ArticleBrowser /></section>
    <section className="notes-section"><div className="container notes-layout"><div className="notes-intro"><div className="section-eyebrow">LITTLE MOMENTS</div><h2>生活的边角料<span>.</span></h2><p>一些没长成文章的小想法，<br />一些不想忘记的小瞬间。</p><span className="handwritten">Small things, good things.</span></div><div className="notes-list">{notes.slice(0, showAllNotes ? notes.length : 3).map(note => <article className="note-item" key={note.date}><time dateTime={note.date}>{note.date.slice(5).replace('-', '.')}<span>{note.date.slice(0, 4)}</span></time><div><p>{note.text}</p><span className="note-tag"># {note.tag}</span></div></article>)}<button className="text-link" onClick={() => setShowAllNotes(!showAllNotes)}>{showAllNotes ? '收起随记' : '展开更多随记'}<ArrowRight size={14} /></button></div></div></section>
    <section className="about-preview container"><div className="about-card"><div className="about-avatar"><span>林</span><Flower size={26} /></div><div className="about-card-copy"><div className="section-eyebrow">THE PERSON BEHIND THE WORDS</div><h2>嗨，我是{site.author}。<ArrowUpRight size={24} /></h2><p>白天在课堂里探索世界，晚上在代码里创造一点自己的东西。<br />相信认真生活的人，总能在平凡日常里拾到光。</p><div className="profile-meta"><span><BookOpen size={13} />{site.role}</span><span><MapPin size={13} />{site.location}</span></div></div><Link to="/about" className="about-card-link">更多关于我<ArrowUpRight size={18} /></Link></div><p className="profile-example">✳ 姓名、专业与城市为可替换的示例信息</p></section>
    <div className="closing-note container"><Flower size={24} /><p>谢谢你，路过我的小小世界。</p><span>愿我们都能找到自己的节奏。</span></div>
  </main>;
}
