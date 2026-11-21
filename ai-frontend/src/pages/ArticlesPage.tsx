import { BookOpen } from 'lucide-react';
import { useTaxonomy } from '../hooks/useTaxonomy';
import ArticleBrowser from '../components/ArticleBrowser';

export default function ArticlesPage() {
  const { articles } = useTaxonomy();
  return <main className="container inner-page articles-page"><div className="page-heading"><div className="section-eyebrow">WORDS THAT KEEP GROWING</div><h1>把日子，写成故事<span>.</span></h1><p>关于代码、成长，以及认真生活的每一天。</p><span className="page-stat"><BookOpen size={14} />{articles.length} 篇记录，持续生长中</span></div><ArticleBrowser /></main>;
}
