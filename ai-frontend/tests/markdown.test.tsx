import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import MarkdownContent, { slugHeading } from '../src/components/MarkdownContent';

function render(content: string) {
  return renderToStaticMarkup(createElement(MarkdownContent, { content }));
}

describe('Markdown 阅读安全与渲染', () => {
  it('忽略原始 HTML，并阻止 JavaScript 协议链接', () => {
    const html = render('<script>alert(1)</script>\n\n<img src="x" onerror="alert(1)">\n\n[危险链接](javascript:alert%281%29)');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('onerror');
    expect(html).not.toContain('javascript:');
    expect(html).toContain('危险链接');
  });

  it('给外链添加隔离属性，站内章节链接保留原始目标', () => {
    const html = render('[文档](https://react.dev/)\n\n[开始](#开始)');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain(`href="#${encodeURIComponent('开始')}"`);
  });

  it('真实高亮已注册语言，并保留可复制的代码文本', () => {
    const html = render('```typescript\nconst answer: number = 42;\n```');
    expect(html).toContain('language-typescript');
    expect(html).toContain('hljs-keyword');
    expect(html).toContain('hljs-number');
    expect(html).toContain('复制代码');
    expect(html).toContain('answer');
  });

  it('渲染 GFM 表格与任务列表，中文标题生成可定位锚点', () => {
    const html = render('## 开始，记录学习\n\n| 主题 | 状态 |\n| --- | --- |\n| React | 已完成 |\n\n- [x] 写下第一篇文章');
    expect(html).toContain('reader-table-scroll');
    expect(html).toContain('<table>');
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('id="开始记录学习"');
    expect(slugHeading(' 开始，记录学习 ')).toBe('开始记录学习');
  });
});
