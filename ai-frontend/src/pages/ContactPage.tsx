import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Copy, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { site } from '../data/site';
import { Flower } from '../components/Art';
import { copyText } from '../lib/format';

export default function ContactPage() {
  const [message, setMessage] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const copy = async () => { setMessage(await copyText(site.email) ? '邮箱地址已复制，可以粘贴到你的邮件应用中。' : '暂时无法自动复制，请选中邮箱地址手动复制。'); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setMessage(''), 5000); };
  return <main className="container inner-page contact-page"><Link className="back-link" to="/"><ArrowLeft size={15} />返回首页</Link><div className="contact-layout"><div className="page-heading"><div className="section-eyebrow">THE NEXT CONVERSATION</div><h1>联系我<span>.</span></h1><p className="contact-greeting">很高兴，我们在这里遇见。</p><p>如果你也喜欢折腾代码、记录学习，或是有一个想交流的小想法，欢迎给我写信。</p><div className="contact-topics"><span>技术交流</span><span>学习分享</span><span>友好问候</span></div></div><div className="contact-letter" aria-hidden="true"><div className="letter-paper"><span /><span /><span /><span /></div><div className="letter-envelope"><Flower size={32} /></div><div className="letter-stamp"><Flower size={27} /><span>HELLO</span></div><span className="letter-caption">GOOD THINGS START WITH HELLO.</span></div></div><section className="contact-email-card" aria-label="邮箱联系方式"><div className="contact-email-icon"><Mail size={26} /></div><div className="contact-email-details"><h2>从一封邮件开始 <span>EMAIL</span></h2><a href={`mailto:${site.email}`} className="contact-email-address">{site.email}</a><p>把想说的话，写在这里。</p></div><div className="contact-actions"><a className="button button-primary" href={`mailto:${site.email}`}>给我写封邮件<ArrowRight size={16} /></a><button className="text-link" onClick={copy}>{message.startsWith('邮箱') ? <Check size={13} /> : <Copy size={13} />}复制邮箱地址</button></div></section><p className="contact-copy-status" role="status" aria-live="polite">{message || '\u00a0'}</p><p className="contact-signoff">每一次真诚的交流，都是新的开始。</p></main>;
}
