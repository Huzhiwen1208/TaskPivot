import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Flower } from '../components/Art';
export default function NotFoundPage() {
  return <main className="container not-found"><Flower size={47} /><div className="section-eyebrow">404 · A LITTLE DETOUR</div><h1>这一页，暂时走丢了。</h1><p>换一条小路，故事还在继续。</p><Link className="button button-primary" to="/">回到首页<ArrowRight size={17} /></Link></main>;
}
