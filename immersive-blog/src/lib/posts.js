/**
 * 纯函数形式的文章查询工具，方便单元测试与复用。
 */

/** 按分类与标签组合筛选文章（任一条件为空则忽略） */
export function filterPosts(posts, { category = 'all', tag = null } = {}) {
  return posts.filter((post) => {
    const matchCategory = category === 'all' || post.category === category;
    const matchTag = !tag || post.tags.includes(tag);
    return matchCategory && matchTag;
  });
}

/** 根据文章标签统计标签云权重，按出现次数降序 */
export function getTagCloud(posts) {
  const counter = new Map();
  posts.forEach((post) => {
    post.tags.forEach((tag) => counter.set(tag, (counter.get(tag) || 0) + 1));
  });
  return [...counter.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}

/** 按 id 查找文章 */
export function findPost(posts, id) {
  return posts.find((post) => post.id === id) || null;
}

/** 格式化日期为「2026.11.08」样式，避免依赖 Intl 的地区差异 */
export function formatDate(value) {
  const [year, month, day] = String(value).split('-');
  return `${year}.${month}.${day}`;
}

/** 计算分类下的文章数量 */
export function countByCategory(posts, categoryId) {
  return posts.filter((post) => post.category === categoryId).length;
}
