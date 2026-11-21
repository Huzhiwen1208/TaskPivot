# 拾光 · 个人博客系统

面向大学生日常记录的个人博客前端，使用 **React 19 + TypeScript + Vite 7**。浅色主题以蓝色为主，支持深色模式、响应式布局与独立文章链接。示例身份、经历和文章可自行替换。

最终项目目录：`/Users/jackhu/src_code/task-pivot/ai-frontend`。

## 在 macOS 上启动

需要 Node.js **20.19+ 或 22.12+**；推荐使用仍受支持的 Node.js LTS 版本。打开「终端」：

```bash
cd /Users/jackhu/src_code/task-pivot/ai-frontend
npm install
npm run dev
```

打开终端显示的地址，默认是 `http://127.0.0.1:5173/`。端口被占用时，Vite 会使用下一个可用端口。

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动开发服务器与热更新 |
| `npm run typecheck` | 执行严格 TypeScript 检查 |
| `npm test` | 运行查询、分页、分类标签和评论存储测试 |
| `npm run build` | 类型检查并生成生产版本 `dist/` |
| `npm run preview` | 本地预览生产版本，通常使用 4173 端口 |

依赖版本由 `package-lock.json` 锁定；后续在干净环境中可用 `npm ci` 安装。

## 功能与页面

| 地址（HashRouter 内） | 功能 |
| --- | --- |
| `/` | 首页、精选文章、最近记录与随记 |
| `/articles` | 全部文章，搜索、分类/标签组合筛选、每页 6 篇分页 |
| `/article/:id` | Markdown 全文、GFM、代码高亮与复制、目录、阅读进度、分享、评论 |
| `/topics` | 分类和标签总览，点击进入筛选后的文章列表 |
| `/manage` | 新增/重命名/删除分类标签，调整文章归属 |
| `/about` | 个人介绍与学习方向 |
| `/contact` | 公开邮箱、打开邮件客户端与复制邮箱；页脚「拾光」跳转到这里 |

实际 URL 示例：`http://127.0.0.1:5173/#/article/a-digital-garden`。全站搜索支持 `⌘ K`（或 `Ctrl K`）打开，`Esc` 关闭；多个搜索词按 AND 匹配。

## 目录结构

```text
ai-frontend/
├── public/favicon.svg
├── src/
│   ├── components/
│   │   ├── Art.tsx                 # 原生 SVG 插画与花形标记
│   │   ├── Layout.tsx              # 导航、主题、页脚、全站搜索
│   │   ├── ArticleBrowser.tsx      # 组合筛选和分页
│   │   ├── ArticleCard.tsx
│   │   ├── SearchDialog.tsx
│   │   ├── MarkdownContent.tsx     # Markdown/GFM/代码高亮
│   │   ├── Comments.tsx
│   │   └── reader.css
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── ArticlesPage.tsx
│   │   ├── ArticlePage.tsx
│   │   ├── TopicsPage.tsx
│   │   ├── ManagePage.tsx
│   │   ├── AboutPage.tsx
│   │   ├── ContactPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   └── manage.css
│   ├── data/
│   │   ├── articles.ts            # 文章 Markdown 与初始分类标签
│   │   └── site.ts                # 个人信息、邮箱、随记
│   ├── hooks/
│   │   ├── useTaxonomy.tsx        # 分类状态与本地保存
│   │   └── useTheme.ts
│   ├── lib/
│   │   ├── articles.ts            # 纯查询与分页函数
│   │   ├── taxonomy.ts            # 分类验证、变更与归属修正
│   │   ├── comments.ts            # 评论校验与存储接口
│   │   └── format.ts
│   ├── App.tsx                   # 路由与页面懒加载
│   ├── main.tsx
│   ├── types.ts
│   ├── vite-env.d.ts
│   └── styles.css
├── tests/
│   ├── articles.test.ts
│   ├── taxonomy.test.ts
│   └── comments.test.ts
├── docs/USER_GUIDE.md
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
└── .gitignore
```

## 自定义与数据范围

- 编辑 `src/data/site.ts` 修改个人介绍和邮箱；当前公开邮箱为 `jackhu.521.rose@gmail.com`。
- 编辑 `src/data/articles.ts` 维护文章正文、摘要、日期、初始分类与标签。文章使用 Markdown 字符串，详情页按 `id` 生成链接。
- 浅色/深色主题首次跟随系统；手动选择后在此浏览器中记忆。
- **分类管理和评论都是本地前端框架**：修改存入当前站点的 `localStorage`，刷新后保留，但不会修改源码、不会同步给其他访客或其他设备。清除站点数据会移除本地评论及分类修改。
- 本项目没有登录、用户身份验证、权限控制和服务端数据库。公开评论或内容管理后台需要继续接入后端，扩展位置见使用指南。

## 构建与部署

```bash
npm run typecheck
npm test
npm run build
npm run preview
```

将 `dist/` 整个目录部署到静态网站服务。HashRouter 使用 `/#/...` 链接，静态托管无需配置页面 rewrite，直接打开或刷新文章链接都由前端解析。若部署到子目录，应先在 `vite.config.ts` 配置对应 `base`，再重新构建。

页面按需加载；Markdown 和高亮依赖拆分成独立代码块，代码语言按需注册。插画使用本地 SVG，正文使用系统中文字体，避免依赖大幅远程图片和外部字体请求。

详细维护步骤、存储行为与后端扩展说明见 [使用指南](docs/USER_GUIDE.md)。
