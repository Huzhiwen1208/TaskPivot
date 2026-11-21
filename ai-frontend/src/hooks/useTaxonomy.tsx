import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { articles as baseArticles, initialCategories, initialTags } from '../data/articles';
import type { Article, TaxonomyItem, TaxonomyState } from '../types';
import { addTaxonomyItem, applyTaxonomy, assignTaxonomy, createInitialTaxonomy, parseTaxonomy, removeTaxonomyCategory, removeTaxonomyTag, renameTaxonomyItem, TAXONOMY_STORAGE_KEY } from '../lib/taxonomy';

interface TaxonomyContextValue {
  categories: TaxonomyItem[];
  tags: TaxonomyItem[];
  articles: Article[];
  error: string;
  addCategory(name: string): void;
  renameCategory(id: string, name: string): void;
  removeCategory(id: string): void;
  addTag(name: string): void;
  renameTag(id: string, name: string): void;
  removeTag(id: string): void;
  assignArticle(articleId: string, categoryId: string, tagIds: string[]): void;
  reset(): void;
}

const TaxonomyContext = createContext<TaxonomyContextValue | null>(null);
const initialState = () => createInitialTaxonomy(baseArticles, initialCategories, initialTags);
const newId = () => globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

function loadState(): { state: TaxonomyState; error: string } {
  try {
    const raw = localStorage.getItem(TAXONOMY_STORAGE_KEY);
    return { state: raw ? parseTaxonomy(JSON.parse(raw), baseArticles) : initialState(), error: '' };
  } catch {
    return { state: initialState(), error: '无法读取本地分类记录，当前显示默认内容。保存修改后会重新建立记录。' };
  }
}

export function TaxonomyProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState(loadState);
  const current = useRef(snapshot.state);

  const commit = useCallback((update: (state: TaxonomyState) => TaxonomyState) => {
    const next = update(current.current);
    try {
      localStorage.setItem(TAXONOMY_STORAGE_KEY, JSON.stringify(next));
    } catch {
      const message = '无法保存到此浏览器。请检查存储权限或可用空间后重试，本次修改尚未保存。';
      setSnapshot(previous => ({ ...previous, error: message }));
      throw new Error(message);
    }
    current.current = next;
    setSnapshot({ state: next, error: '' });
  }, []);

  const value = useMemo<TaxonomyContextValue>(() => ({
    categories: snapshot.state.categories,
    tags: snapshot.state.tags,
    articles: applyTaxonomy(baseArticles, snapshot.state),
    error: snapshot.error,
    addCategory: name => commit(state => addTaxonomyItem(state, 'categories', name, newId())),
    renameCategory: (id, name) => commit(state => renameTaxonomyItem(state, 'categories', id, name)),
    removeCategory: id => commit(state => removeTaxonomyCategory(state, id)),
    addTag: name => commit(state => addTaxonomyItem(state, 'tags', name, newId())),
    renameTag: (id, name) => commit(state => renameTaxonomyItem(state, 'tags', id, name)),
    removeTag: id => commit(state => removeTaxonomyTag(state, id)),
    assignArticle: (articleId, categoryId, tagIds) => commit(state => assignTaxonomy(state, articleId, categoryId, tagIds)),
    reset: () => commit(() => initialState()),
  }), [snapshot, commit]);

  return <TaxonomyContext.Provider value={value}>{children}</TaxonomyContext.Provider>;
}

export function useTaxonomy(): TaxonomyContextValue {
  const context = useContext(TaxonomyContext);
  if (!context) throw new Error('useTaxonomy 需要在 TaxonomyProvider 内调用。');
  return context;
}
