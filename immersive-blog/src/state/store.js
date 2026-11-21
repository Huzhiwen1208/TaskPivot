/**
 * 极简发布订阅状态管理：无第三方依赖，可被单元测试直接驱动。
 */

export const THEME_KEY = 'orbit-notes:theme';

/** 创建通用 store */
export function createStore(initialState = {}) {
  let state = { ...initialState };
  const listeners = new Set();

  return {
    getState: () => state,
    setState(patch) {
      const next = typeof patch === 'function' ? patch(state) : patch;
      state = { ...state, ...next };
      listeners.forEach((listener) => listener(state));
    },
    /** 订阅后会立刻收到一次当前状态，便于首屏同步渲染 */
    subscribe(listener) {
      listeners.add(listener);
      listener(state);
      return () => listeners.delete(listener);
    },
  };
}

function readStoredTheme(storage) {
  try {
    const value = storage?.getItem(THEME_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function persistTheme(storage, theme) {
  try {
    storage?.setItem(THEME_KEY, theme);
  } catch {
    /* 隐私模式下写入失败时静默忽略 */
  }
}

/**
 * 博客业务状态与操作。
 * @param {object} options
 * @param {Storage|null} options.storage 可注入的存储（测试时可传内存实现）
 */
export function createBlogStore({ storage = null, initialTheme = 'dark' } = {}) {
  const theme = readStoredTheme(storage) || initialTheme;

  const store = createStore({
    theme,
    activeCategory: 'all',
    activeTag: null,
    activeSection: 'home',
    openPostId: null,
    expanded: false,
    loading: true,
    toast: null,
  });

  let toastSeed = 0;

  const actions = {
    setTheme(nextTheme) {
      if (nextTheme !== 'light' && nextTheme !== 'dark') return;
      persistTheme(storage, nextTheme);
      store.setState({ theme: nextTheme });
    },
    toggleTheme() {
      actions.setTheme(store.getState().theme === 'dark' ? 'light' : 'dark');
    },
    /** 切换分类时清空标签，保证筛选结果可预期 */
    setCategory(categoryId) {
      store.setState({ activeCategory: categoryId || 'all', activeTag: null });
    },
    /** 再次点击同一标签可取消筛选 */
    setTag(tag) {
      const current = store.getState().activeTag;
      store.setState({
        activeTag: current === tag ? null : tag,
        activeCategory: 'all',
      });
    },
    openArticle(id) {
      store.setState({ openPostId: id, expanded: false });
    },
    closeArticle() {
      store.setState({ openPostId: null, expanded: false });
    },
    toggleExpanded() {
      store.setState((state) => ({ expanded: !state.expanded }));
    },
    setSection(sectionId) {
      store.setState({ activeSection: sectionId });
    },
    setLoading(loading) {
      store.setState({ loading: Boolean(loading) });
    },
    notify(message) {
      toastSeed += 1;
      store.setState({ toast: { message, id: toastSeed } });
    },
    clearToast() {
      store.setState({ toast: null });
    },
  };

  return { ...store, actions };
}
