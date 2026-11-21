import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, Check, FolderOpen, Pencil, Plus, Save, Tags, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTaxonomy } from '../hooks/useTaxonomy';
import type { TaxonomyItem } from '../types';
import './manage.css';

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : '操作未完成，请稍后重试。';
}

interface TaxonomyRowProps {
  item: TaxonomyItem;
  kind: '分类' | '标签';
  count: number;
  onRename(id: string, name: string): void;
  onRemove(id: string): void;
  onMessage(message: string): void;
}

function TaxonomyRow({ item, kind, count, onRename, onRemove, onMessage }: TaxonomyRowProps) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [name, setName] = useState(item.name);
  const [error, setError] = useState('');

  const save = (event: FormEvent) => {
    event.preventDefault();
    try {
      onRename(item.id, name);
      setEditing(false);
      setError('');
      onMessage(`${kind}名称已更新。`);
    } catch (cause) { setError(messageOf(cause)); }
  };

  const remove = () => {
    try {
      onRemove(item.id);
      onMessage(`“${item.name}”已删除。`);
    } catch (cause) {
      setError(messageOf(cause));
      setConfirming(false);
    }
  };

  return <li className="manage-item" onKeyDown={event => { if (event.key === 'Escape') { setEditing(false); setConfirming(false); setError(''); } }}>
    {editing ? <form className="manage-rename-form" onSubmit={save}>
      <label className="manage-sr-only" htmlFor={`rename-${item.id}`}>修改{kind}名称</label>
      <input id={`rename-${item.id}`} autoFocus value={name} onChange={event => setName(event.target.value)} maxLength={20} required />
      <button type="submit" className="manage-icon-button" aria-label={`保存${kind}名称`}><Check size={16} /></button>
      <button type="button" className="manage-icon-button" aria-label="取消修改" onClick={() => { setEditing(false); setError(''); }}><X size={16} /></button>
    </form> : <div className="manage-item-summary"><span className={`manage-item-name ${kind === '标签' ? 'is-tag' : ''}`}>{kind === '标签' && '# '}{item.name}</span><span className="manage-count">{count} 篇</span><div className="manage-item-actions"><button className="manage-icon-button" aria-label={`编辑${kind} ${item.name}`} onClick={() => { setName(item.name); setEditing(true); setConfirming(false); setError(''); }}><Pencil size={14} /></button><button className="manage-icon-button manage-delete" aria-label={`删除${kind} ${item.name}`} onClick={() => { setConfirming(!confirming); setError(''); }} aria-expanded={confirming}><Trash2 size={14} /></button></div></div>}
    {confirming && <div className="manage-confirm" role="group" aria-label={`确认删除${kind} ${item.name}`}><p>确定删除“{item.name}”？{kind === '分类' ? '关联文章会移入保留的分类。' : '关联文章会移除此标签。'}</p><div><button className="manage-small-button" onClick={() => setConfirming(false)}>取消</button><button className="manage-small-button manage-danger-button" onClick={remove}>确认删除</button></div></div>}
    {error && <p className="manage-field-error" role="alert">{error}</p>}
  </li>;
}

function TaxonomyEditor({ type }: { type: 'categories' | 'tags' }) {
  const taxonomy = useTaxonomy();
  const isCategory = type === 'categories';
  const kind = isCategory ? '分类' : '标签';
  const items = taxonomy[type];
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const add = (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    try {
      (isCategory ? taxonomy.addCategory : taxonomy.addTag)(name);
      setName('');
      setError('');
      setMessage(`${kind}已添加。`);
    } catch (cause) { setError(messageOf(cause)); }
  };
  return <section className="manage-panel" aria-labelledby={`manage-${type}-title`}>
    <div className="manage-panel-heading"><span className="manage-panel-icon">{isCategory ? <FolderOpen size={20} /> : <Tags size={20} />}</span><div><h2 id={`manage-${type}-title`}>{kind}管理<span>{items.length}</span></h2><p>{isCategory ? '为不同方向的记录，留一个位置。' : '用关键词，串起相似的想法。'}</p></div></div>
    <form className="manage-add-form" onSubmit={add}><label className="manage-sr-only" htmlFor={`new-${type}`}>新{kind}名称</label><input id={`new-${type}`} value={name} onChange={event => setName(event.target.value)} maxLength={20} placeholder={`输入新${kind}名称`} required /><button className="manage-add-button" type="submit"><Plus size={16} /><span>添加{kind}</span></button></form>
    {error && <p className="manage-field-error" role="alert">{error}</p>}
    <ul className="manage-items">{items.map(item => <TaxonomyRow key={item.id} item={item} kind={kind} count={taxonomy.articles.filter(article => isCategory ? article.categoryId === item.id : article.tagIds.includes(item.id)).length} onRename={isCategory ? taxonomy.renameCategory : taxonomy.renameTag} onRemove={isCategory ? taxonomy.removeCategory : taxonomy.removeTag} onMessage={setMessage} />)}</ul>
    {!items.length && <p className="manage-empty">还没有标签，可以先添加一个。</p>}
    <p className="manage-status" role="status" aria-live="polite">{message || '\u00a0'}</p>
  </section>;
}

function ArticleAssignmentEditor() {
  const { articles, categories, tags, assignArticle } = useTaxonomy();
  const [articleId, setArticleId] = useState(articles[0]?.id ?? '');
  const selectedArticle = articles.find(article => article.id === articleId);
  const [categoryId, setCategoryId] = useState(selectedArticle?.categoryId ?? '');
  const [tagIds, setTagIds] = useState<string[]>(selectedArticle?.tagIds ?? []);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const selectedTags = selectedArticle?.tagIds.join('|') ?? '';
  useEffect(() => {
    setCategoryId(selectedArticle?.categoryId ?? '');
    setTagIds(selectedTags ? selectedTags.split('|') : []);
  }, [articleId, selectedArticle?.categoryId, selectedTags]);
  useEffect(() => {
    setMessage('');
    setError('');
  }, [articleId]);

  const save = (event: FormEvent) => {
    event.preventDefault();
    try {
      assignArticle(articleId, categoryId, tagIds);
      setError('');
      setMessage('文章归类已保存，文章列表和详情页会使用新的分类与标签。');
    } catch (cause) { setError(messageOf(cause)); setMessage(''); }
  };

  return <section className="manage-panel manage-assignment" aria-labelledby="manage-assignment-title"><div className="manage-panel-heading"><span className="manage-panel-icon"><Save size={20} /></span><div><h2 id="manage-assignment-title">整理文章归属</h2><p>给每篇文章选择分类，添加恰当的标签。</p></div></div><form onSubmit={save}>
    <div className="manage-assignment-selects"><label>选择文章<select value={articleId} onChange={event => setArticleId(event.target.value)}>{articles.map(article => <option value={article.id} key={article.id}>{article.title}</option>)}</select></label><label>所属分类<select value={categoryId} onChange={event => setCategoryId(event.target.value)} required>{categories.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label></div>
    <fieldset className="manage-tag-picker"><legend>文章标签<span>可多选</span></legend><div>{tags.map(tag => <label key={tag.id} className={tagIds.includes(tag.id) ? 'is-checked' : ''}><input type="checkbox" value={tag.id} checked={tagIds.includes(tag.id)} onChange={event => setTagIds(current => event.target.checked ? [...current, tag.id] : current.filter(id => id !== tag.id))} /><span>#{tag.name}</span></label>)}{!tags.length && <span className="manage-empty">还没有可用标签，请先在上方添加。</span>}</div></fieldset>
    <div className="manage-save-row"><button className="manage-primary-button" type="submit" disabled={!selectedArticle}><Check size={16} />保存文章归类</button><p role="status" aria-live="polite" className="manage-save-status">{message}</p></div>{error && <p className="manage-field-error" role="alert">{error}</p>}
  </form></section>;
}

export default function ManagePage() {
  const { error } = useTaxonomy();
  return <main className="manage-page container"><Link to="/" className="manage-back"><ArrowLeft size={16} />返回博客</Link><header className="manage-page-heading"><span className="manage-eyebrow">A PLACE FOR EVERY THOUGHT</span><h1>分类与标签<span>.</span></h1><p>整理记录，也整理思路。这里的修改仅保存在此浏览器中。</p></header>{error && <div className="manage-storage-warning" role="alert">{error}</div>}<div className="manage-grid"><TaxonomyEditor type="categories" /><TaxonomyEditor type="tags" /></div><ArticleAssignmentEditor /><p className="manage-footnote">内容会随你的探索慢慢生长，不必一次整理得很完美。</p></main>;
}
