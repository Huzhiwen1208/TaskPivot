import type { BlogComment } from '../types';

export const COMMENTS_STORAGE_KEY = 'shiguang-comments-v1';

export interface CommentStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface CommentLoadResult {
  comments: BlogComment[];
  error: string | null;
}

export function validateComment(author: string, content: string): string | null {
  if (!author.trim()) return '请留下一个昵称。';
  if (author.trim().length > 24) return '昵称请控制在 24 个字符以内。';
  if (!content.trim()) return '写一点想说的话，再发布吧。';
  if (content.trim().length > 1000) return '评论请控制在 1000 个字符以内。';
  return null;
}

function isComment(value: unknown): value is BlogComment {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === 'string' && item.id.length > 0 && item.id.length < 100
    && typeof item.articleId === 'string' && item.articleId.length > 0 && item.articleId.length < 200
    && typeof item.author === 'string' && typeof item.content === 'string'
    && validateComment(item.author, item.content) === null
    && typeof item.createdAt === 'string' && Number.isFinite(Date.parse(item.createdAt));
}

/** Storage failures are explicit so the UI never reports a comment as saved prematurely. */
export function loadComments(storage: CommentStorage): CommentLoadResult {
  try {
    const raw = storage.getItem(COMMENTS_STORAGE_KEY);
    if (!raw) return { comments: [], error: null };
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { comments: [], error: '本地评论数据无法读取，新评论仍可重新保存。' };
    const comments = parsed.filter(isComment);
    return {
      comments,
      error: comments.length !== parsed.length
        ? '部分本地评论数据不完整，已跳过无法读取的记录。' : null,
    };
  } catch {
    return { comments: [], error: '暂时无法读取本地评论，请检查浏览器的存储设置。' };
  }
}

export function saveComments(storage: CommentStorage, comments: BlogComment[]): string | null {
  try {
    storage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
    return null;
  } catch {
    return '评论未能保存。浏览器存储可能已满或被禁用，请保留内容后重试。';
  }
}

export function createComment(articleId: string, author: string, content: string): BlogComment {
  const validationError = validateComment(author, content);
  if (validationError) throw new Error(validationError);
  if (!articleId.trim()) throw new Error('文章标识不能为空。');
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `comment-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    articleId,
    author: author.trim(),
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };
}

