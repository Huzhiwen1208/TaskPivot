import { describe, expect, it, vi } from 'vitest';
import { createBlogStore, createStore, THEME_KEY } from '../src/state/store.js';

function createMemoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
  };
}

describe('通用 store', () => {
  it('订阅后立即收到当前状态，并支持取消订阅', () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    expect(listener).toHaveBeenCalledWith({ count: 0 });

    store.setState({ count: 1 });
    expect(listener).toHaveBeenLastCalledWith({ count: 1 });

    unsubscribe();
    store.setState({ count: 2 });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('支持函数式更新，且返回新的状态对象', () => {
    const store = createStore({ count: 1 });
    const before = store.getState();
    store.setState((state) => ({ count: state.count + 1 }));
    expect(store.getState().count).toBe(2);
    expect(store.getState()).not.toBe(before);
  });
});

describe('博客 store', () => {
  it('默认使用暗色主题', () => {
    const store = createBlogStore();
    expect(store.getState().theme).toBe('dark');
  });

  it('优先读取本地已保存的主题', () => {
    const store = createBlogStore({ storage: createMemoryStorage({ [THEME_KEY]: 'light' }) });
    expect(store.getState().theme).toBe('light');
  });

  it('切换主题并持久化', () => {
    const storage = createMemoryStorage();
    const store = createBlogStore({ storage });
    store.actions.toggleTheme();
    expect(store.getState().theme).toBe('light');
    expect(storage.getItem(THEME_KEY)).toBe('light');
    store.actions.toggleTheme();
    expect(store.getState().theme).toBe('dark');
  });

  it('忽略非法主题值', () => {
    const store = createBlogStore();
    store.actions.setTheme('neon');
    expect(store.getState().theme).toBe('dark');
  });

  it('切换分类时清空标签筛选', () => {
    const store = createBlogStore();
    store.actions.setTag('Three.js');
    expect(store.getState().activeTag).toBe('Three.js');
    store.actions.setCategory('webgl');
    expect(store.getState().activeCategory).toBe('webgl');
    expect(store.getState().activeTag).toBeNull();
  });

  it('重复点击同一标签可取消筛选，并重置分类', () => {
    const store = createBlogStore();
    store.actions.setCategory('frontend');
    store.actions.setTag('动效');
    expect(store.getState().activeCategory).toBe('all');

    store.actions.setTag('动效');
    expect(store.getState().activeTag).toBeNull();
  });

  it('打开与关闭文章时同步收起全文状态', () => {
    const store = createBlogStore();
    store.actions.openArticle('orbital-canvas');
    expect(store.getState().openPostId).toBe('orbital-canvas');
    expect(store.getState().expanded).toBe(false);

    store.actions.toggleExpanded();
    expect(store.getState().expanded).toBe(true);

    store.actions.closeArticle();
    expect(store.getState().openPostId).toBeNull();
    expect(store.getState().expanded).toBe(false);
  });

  it('通知具备自增 id，可主动清除', () => {
    const store = createBlogStore();
    store.actions.notify('已切换主题');
    const first = store.getState().toast;
    expect(first.message).toBe('已切换主题');

    store.actions.notify('第二条');
    expect(store.getState().toast.id).toBeGreaterThan(first.id);

    store.actions.clearToast();
    expect(store.getState().toast).toBeNull();
  });

  it('加载状态可切换，并记录当前区块', () => {
    const store = createBlogStore();
    expect(store.getState().loading).toBe(true);
    store.actions.setLoading(false);
    store.actions.setSection('about');
    expect(store.getState().loading).toBe(false);
    expect(store.getState().activeSection).toBe('about');
  });
});
