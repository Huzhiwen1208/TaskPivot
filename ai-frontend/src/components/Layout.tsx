import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowUpRight, Menu, Moon, Search, Settings2, Sun, X } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { site } from '../data/site';
import { Flower } from './Art';
import SearchDialog from './SearchDialog';
import { useTheme } from '../hooks/useTheme';
import { useTaxonomy } from '../hooks/useTaxonomy';

export default function Layout() {
  const { theme, toggleTheme } = useTheme();
  const { articles, error } = useTaxonomy();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const focusRef = useRef<HTMLElement | null>(null);
  const location = useLocation();
  const openSearch = useCallback(() => { focusRef.current = document.activeElement as HTMLElement; setSearchOpen(true); }, []);
  const closeSearch = useCallback(() => { setSearchOpen(false); requestAnimationFrame(() => { if (focusRef.current?.isConnected) focusRef.current.focus(); }); }, []);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); if (searchOpen) closeSearch(); else openSearch(); } };
    window.addEventListener('keydown', keydown); return () => window.removeEventListener('keydown', keydown);
  }, [searchOpen, openSearch, closeSearch]);
  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);
  useEffect(() => {
    const titles: Record<string, string> = { '/': '在日常里，慢慢生长', '/articles': '全部文章', '/about': '关于我', '/contact': '联系我', '/topics': '分类与标签', '/manage': '内容分类管理' };
    const articleTitle = articles.find(article => location.pathname === `/article/${article.id}`)?.title;
    document.title = `${articleTitle || titles[location.pathname] || '这一页走丢了'} · ${site.name}`;
  }, [location.pathname, articles]);
  return <><a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); document.getElementById('main-content')?.focus(); }}>跳转到正文</a>
    <header className="site-header"><div className="header-inner"><Link className="brand" to="/" aria-label={`${site.name}，返回首页`}><Flower size={32} /><span className="brand-name">{site.name}<small>SHIGUANG</small></span><span className="brand-divider" /><span className="brand-description">一个人的数字花园</span></Link>
      <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="主导航">{[['/', '首页'], ['/articles', '文章'], ['/topics', '分类标签'], ['/about', '关于']].map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}<Link to="/contact" className="mobile-contact">联系我</Link></nav>
      <div className="header-actions"><button className="icon-button search-trigger" aria-label="搜索文章" title="搜索文章（⌘ K）" onClick={openSearch}><Search size={18} /><kbd>⌘ K</kbd></button><span className="action-divider" /><button className="icon-button" onClick={toggleTheme} aria-label={theme === 'light' ? '切换深色主题' : '切换浅色主题'} title={theme === 'light' ? '切换深色主题' : '切换浅色主题'}>{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button><Link to="/contact" className="header-contact">聊一聊<ArrowUpRight size={14} /></Link><button className="icon-button menu-toggle" aria-label={menuOpen ? '关闭导航' : '展开导航'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button></div>
    </div></header>
    {error && <div className="storage-banner" role="status">{error}</div>}
    <div id="main-content" className="main-content" tabIndex={-1}><Outlet /></div>
    <footer className="site-footer container"><div><Link to="/contact" className="footer-brand" aria-label={`${site.name}，联系我`} title="联系我"><Flower size={22} />{site.name}</Link><span>© {new Date().getFullYear()} {site.author} · 用心记录，慢慢生长</span></div><div><span className="footer-made">MADE WITH CURIOSITY <span>✳</span></span><Link to="/manage" className="footer-manage"><Settings2 size={13} />分类管理</Link><button className="back-top" aria-label="回到顶部" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ArrowUp size={15} /></button></div></footer>
    {searchOpen && <SearchDialog onClose={closeSearch} />}
  </>;
}
