import { Component, Suspense, lazy } from 'react';
import type { ReactNode } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { TaxonomyProvider } from './hooks/useTaxonomy';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ArticlesPage from './pages/ArticlesPage';
import { Flower } from './components/Art';

const ArticlePage = lazy(() => import('./pages/ArticlePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const TopicsPage = lazy(() => import('./pages/TopicsPage'));
const ManagePage = lazy(() => import('./pages/ManagePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? <div className="not-found container"><Flower size={38} /><h1>页面暂时遇到一点问题。</h1><p>重新加载一下，我们再继续。</p><button className="button button-primary" onClick={() => window.location.reload()}>重新加载</button></div> : this.props.children; }
}

export default function App() {
  return <ErrorBoundary><HashRouter><TaxonomyProvider><Suspense fallback={<div className="page-loading" role="status"><Flower size={28} /><span>新的故事，马上翻开…</span></div>}><Routes><Route element={<Layout />}><Route index element={<HomePage />} /><Route path="articles" element={<ArticlesPage />} /><Route path="article/:id" element={<ArticlePage />} /><Route path="topics" element={<TopicsPage />} /><Route path="manage" element={<ManagePage />} /><Route path="about" element={<AboutPage />} /><Route path="contact" element={<ContactPage />} /><Route path="*" element={<NotFoundPage />} /></Route></Routes></Suspense></TaxonomyProvider></HashRouter></ErrorBoundary>;
}
