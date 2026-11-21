import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, Trash2 } from 'lucide-react';
import type { BlogComment } from '../types';
import { createComment, loadComments, saveComments, validateComment } from '../lib/comments';
import './reader.css';

function browserStorage() {
  // Access can itself throw in restricted browser environments.
  return window.localStorage;
}

export default function Comments({ articleId }: { articleId: string }) {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [hasError, setHasError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const submitLock = useRef(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setPendingDelete(null);
    setStatus('');
    setHasError(false);
    setContent('');
    try {
      const loaded = loadComments(browserStorage());
      setComments(loaded.comments);
      if (loaded.error) { setStatus(loaded.error); setHasError(true); }
    } catch {
      setComments([]);
      setStatus('暂时无法读取本地评论，请检查浏览器的存储设置。');
      setHasError(true);
    }
  }, [articleId]);

  const submitComment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitLock.current) return;
    const error = validateComment(author, content);
    if (error) { setStatus(error); setHasError(true); return; }
    submitLock.current = true;
    setSubmitting(true);
    try {
      const storage = browserStorage();
      // Read before writing to preserve comments saved in another tab.
      const current = loadComments(storage).comments;
      const next = [...current, createComment(articleId, author, content)];
      const saveError = saveComments(storage, next);
      if (saveError) { setStatus(saveError); setHasError(true); return; }
      setComments(next);
      setContent('');
      setStatus('评论已保存在此浏览器，谢谢你的分享。');
      setHasError(false);
    } catch {
      setStatus('评论未能保存，请检查浏览器存储设置后重试。你的内容仍保留在输入框中。');
      setHasError(true);
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  const deleteComment = (id: string) => {
    try {
      const storage = browserStorage();
      const next = loadComments(storage).comments.filter(comment => comment.id !== id);
      const error = saveComments(storage, next);
      if (error) { setStatus('删除失败，请检查浏览器存储设置后重试。'); setHasError(true); return; }
      setComments(next);
      setPendingDelete(null);
      setStatus('这条本地评论已删除。');
      setHasError(false);
    } catch { setStatus('删除失败，请稍后重试。'); setHasError(true); }
  };

  const articleComments = comments.filter(comment => comment.articleId === articleId).slice().reverse();

  return <section className="comments-section" id="comments" aria-labelledby="comments-heading">
    <div className="comments-heading-row"><div><span className="reader-eyebrow">LEAVE A LITTLE THOUGHT</span><h2 id="comments-heading">聊聊你的想法 <span>{articleComments.length.toString().padStart(2, '0')}</span></h2></div><MessageCircle size={24} strokeWidth={1.4} /></div>
    <p className="comments-storage-note">评论保存在此浏览器中。</p>
    <form className="comment-form" onSubmit={submitComment} noValidate>
      <label htmlFor="comment-author">怎么称呼你 <span>必填</span></label>
      <input id="comment-author" name="author" value={author} onChange={event => setAuthor(event.target.value)} maxLength={24} placeholder="留一个你喜欢的昵称" autoComplete="nickname" required aria-describedby="comment-feedback" />
      <label htmlFor="comment-content">想说的话 <span>必填</span></label>
      <textarea id="comment-content" name="content" ref={contentRef} value={content} onChange={event => setContent(event.target.value)} maxLength={1000} placeholder="一个问题、一点共鸣，或是一句友好的问候…" rows={5} required aria-describedby="comment-feedback comment-limit" />
      <div className="comment-form-bottom"><span id="comment-limit">{content.length} / 1000</span><button className="comment-submit" type="submit" disabled={submitting}>{submitting ? '正在保存…' : '发布评论'}<Send size={14} /></button></div>
      <p className={`comment-feedback ${hasError ? 'is-error' : ''}`} id="comment-feedback" role="status" aria-live="polite">{status || '\u00a0'}</p>
    </form>
    <div className="comment-list">
      {articleComments.length === 0 ? <div className="comments-empty"><MessageCircle size={24} strokeWidth={1.25} /><p>这里还很安静，来留下第一句话吧。</p></div> : articleComments.map(comment => <article className="comment-item" key={comment.id}>
        <div className="comment-avatar" aria-hidden="true">{Array.from(comment.author)[0]}</div>
        <div className="comment-item-body"><div className="comment-item-meta"><strong>{comment.author}</strong><time dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}</time></div><p>{comment.content}</p>
          {pendingDelete === comment.id ? <div className="comment-delete-confirm"><span>删除这条本地评论？</span><button type="button" onClick={() => deleteComment(comment.id)}>确认删除</button><button type="button" onClick={() => setPendingDelete(null)}>取消</button></div> : <button className="comment-delete" type="button" aria-label={`删除 ${comment.author} 的本地评论`} onClick={() => setPendingDelete(comment.id)}><Trash2 size={12} />删除</button>}
        </div>
      </article>)}
    </div>
  </section>;
}

