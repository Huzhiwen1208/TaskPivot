import { ArrowRight, BookOpen, Code2, Coffee, Heart, MapPin, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';
import { site } from '../data/site';
import { Flower } from '../components/Art';

export default function AboutPage() {
  return <main className="container inner-page about-page"><div className="page-heading"><div className="section-eyebrow">THE PERSON BEHIND THE WORDS</div><h1>嗨，我是{site.author}<span>.</span></h1><p>一个普通大学生，一个还在生长的自己。</p></div>
    <div className="about-story"><div className="about-story-main"><h2>在代码和生活之间，<br />寻找一点自己的节奏。</h2><p>我喜欢把复杂的问题拆成小块，也喜欢在写代码之外，观察那些容易被忽略的日常。课程、项目、一本没读完的书，都可能成为下一篇记录的起点。</p><p>这个博客是我的数字花园。这里有刚理解的技术，有还在试验的学习方法，也有一些无关效率的生活碎片。我不急着给出标准答案，更希望把探索的过程诚实地留下来。</p><blockquote>不必每一天都发光，<br />只要一点一点地生长。</blockquote><Link to="/contact" className="button button-primary">很高兴认识你<ArrowRight size={17} /></Link></div><aside className="about-profile"><div className="about-avatar"><span>林</span><Flower size={28} /></div><h2>{site.author}<span> / {site.englishName}</span></h2><p><BookOpen size={14} />{site.role}</p><p><MapPin size={14} />{site.location}</p><div className="profile-divider" /><span className="status-dot" /><span className="profile-status">保持好奇，持续学习中</span><p className="profile-example">姓名、专业与城市为可替换示例</p></aside></div>
    <section className="about-values"><div className="section-heading"><div><div className="section-eyebrow">THINGS THAT MATTER</div><h2>认真对待的小事<span>.</span></h2></div></div><div className="values-grid">{[[Code2, '动手创造', '少收藏一篇教程，多完成一个小功能。把想法变成能用的东西。'], [Sprout, '保持学习', '允许自己暂时不懂，也愿意为一个问题多走几步。'], [Coffee, '认真生活', '给散步、阅读和发呆留出时间。生活本身，也值得被记录。']].map(([Icon, title, text], i) => { const ValueIcon = Icon as typeof Code2; return <article key={i}><ValueIcon size={24} /><h3>{String(title)}</h3><p>{String(text)}</p></article>; })}</div></section><div className="about-learning"><Heart size={18} /><span>最近在探索</span>{['React', 'TypeScript', 'Web 设计', '更好的学习方式'].map(item => <span className="learning-tag" key={item}>{item}</span>)}</div>
  </main>;
}
