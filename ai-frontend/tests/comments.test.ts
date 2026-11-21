import { describe, expect, it } from 'vitest';
import { COMMENTS_STORAGE_KEY, createComment, loadComments, saveComments, validateComment } from '../src/lib/comments';

function memoryStorage(initial: string | null = null) {
  let value = initial;
  return { getItem: () => value, setItem: (_key: string, next: string) => { value = next; } };
}

describe('本地评论存储', () => {
  it('在保存前拒绝空白输入和超长内容', () => {
    expect(validateComment('  ', '你好')).toBeTruthy();
    expect(validateComment('同学', '  ')).toBeTruthy();
    expect(validateComment('同学', '好'.repeat(1001))).toBeTruthy();
    expect(() => createComment('article-1', '', '你好')).toThrow();
  });

  it('持久化并恢复文章评论，保留用户输入中的文本而不执行 HTML', () => {
    const storage = memoryStorage();
    const comment = createComment('article-1', '  小蓝  ', '<script>alert(1)</script>');
    expect(saveComments(storage, [comment])).toBeNull();
    const result = loadComments(storage);
    expect(result.error).toBeNull();
    expect(result.comments).toEqual([{ ...comment, author: '小蓝' }]);
    expect(result.comments[0].content).toBe('<script>alert(1)</script>');
  });

  it('损坏的存储不会让阅读页崩溃，异常数据不会进入评论列表', () => {
    expect(loadComments(memoryStorage('{bad')).comments).toEqual([]);
    expect(loadComments(memoryStorage('{bad')).error).toBeTruthy();
    const valid = createComment('a', '小蓝', '你好');
    const result = loadComments(memoryStorage(JSON.stringify([valid, { content: 'broken' }])));
    expect(result.comments).toEqual([valid]);
    expect(result.error).toBeTruthy();
  });

  it('存储被禁用时返回失败，不宣称已保存', () => {
    const blocked = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('quota'); } };
    expect(loadComments(blocked).error).toBeTruthy();
    expect(saveComments(blocked, [createComment('a', '小蓝', '你好')])).toBeTruthy();
    expect(COMMENTS_STORAGE_KEY).toContain('comments');
  });
});

