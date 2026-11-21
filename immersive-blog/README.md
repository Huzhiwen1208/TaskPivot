# 星穹手记 · Orbit Notes

一个以「深空观测站」为视觉概念的个人博客：全屏 Three.js 星轨晶体、粒子星云与玻璃质感内容层共存，滚动时镜头跟随，点击轨道光点即可筛选主题文章。纯静态实现，无后端依赖。

- 主色：墨蓝 `#05070f` · 极光青 `#67e8f9` · 星云紫 `#a78bfa`
- 字体：宋体衬线标题 + 系统无衬线正文 + 等宽元信息
- 交互：拖拽旋转、滚轮/双指缩放、点击光点筛选、滚动视差、亮暗主题切换

## 功能一览

| 模块 | 说明 |
| --- | --- |
| 3D 场景 | 二十面体晶体、三层轨道环、可点击分类卫星、双层粒子星云与动态光照 |
| 博客内容 | 博主简介、分类导航、最新文章、预览卡片、标签云、关于、联系方式 |
| 文章详情 | 侧滑面板、展开/收起全文、标签回流筛选、Esc 关闭 |
| 状态管理 | 手写发布订阅 store，管理主题、筛选、详情、加载与轻提示 |
| 主题 | 亮/暗双主题，首次访问跟随本地存储，3D 配色同步切换 |
| 性能 | 三维模块懒加载、设备档位裁剪、FPS 监测自动降级、页面隐藏暂停渲染 |
| 降级 | 无 WebGL / 加载失败时自动保留完整二维博客体验 |
| 响应式 | 桌面右半屏交互区；移动端底部导航坞、横向拖动旋转、双指缩放 |

## 技术栈

- **三维**：Three.js `0.169`（WebGLRenderer、程序化几何与 Canvas 纹理）
- **构建**：Vite 7（`base: './'`，Three.js 独立分包）
- **语言**：原生 ES Modules + CSS 变量（无 UI 框架依赖）
- **测试**：Vitest + jsdom（单元）、Playwright（Chromium / Firefox / WebKit / iPhone 视口）

## 快速开始

环境要求：Node.js **20.19+ 或 22.12+**（推荐 24 LTS），npm 10+。

```bash
cd immersive-blog
npm install
npm run dev        # http://127.0.0.1:5173
```

其他命令：

```bash
npm run build      # 生产构建，产物在 dist/
npm run preview    # 本地预览构建结果（4173）
npm test           # 单元测试
npm run test:e2e   # 端到端兼容性测试（会自动构建并启动预览服务）
```

> 首次运行 E2E 前需安装浏览器内核：`npx playwright install chromium firefox webkit`。

## 交互说明

- **桌面**：在 Hero 右侧空白区按住拖拽旋转晶体；滚轮缩放（可滚动区域在左侧文案与下方内容，滚轮仍可正常翻页）；悬停光点显示分类，点击后筛选文章并滚动到列表。
- **移动端**：单指横向拖动旋转，纵向滑动正常滚动页面；双指捏合缩放；点击底部导航切换区块；点击光点同样可筛选。
- **键盘**：`Tab` 遍历可交互元素，`Esc` 关闭文章面板；系统开启「减少动态效果」时会自动降低动画幅度。

## 项目结构

```text
immersive-blog/
├── index.html                 # 首屏关键样式内联 + 品牌启动层
├── vite.config.js             # 构建、分包与 Vitest 配置
├── playwright.config.js       # 多浏览器兼容性测试配置
├── src/
│   ├── main.js                # 入口：先渲染 UI，空闲帧懒加载 3D
│   ├── styles.css             # 设计令牌、布局、主题与响应式
│   ├── data/blog.js           # 个人信息、分类、文章、标签源数据
│   ├── lib/posts.js           # 纯函数查询：筛选、标签云、格式化
│   ├── state/store.js         # 发布订阅状态管理与业务动作
│   ├── ui/
│   │   ├── app.js             # 页面装配、事件委托、滚动监听
│   │   └── templates.js       # 可测试的 HTML 模板函数
│   └── three/
│       ├── app.js             # 场景、交互、渲染循环与资源释放
│       └── quality.js         # 设备档位、帧率监测、视差工具
├── tests/                     # 46 项单元测试
└── e2e/blog.spec.js           # 页面结构、筛选、详情、主题、3D、移动端
```

## 性能策略

1. **首屏解耦**：HTML 与 CSS 先渲染，Three.js 仅在两次绘制后的空闲帧动态 `import()`，主包约 27KB（gzip 12KB）。
2. **资源零请求**：晶体、轨道、粒子与辉光全部程序化生成，Canvas 纹理按需创建，不使用外部模型与图片。
3. **设备档位**：按屏幕宽度、CPU 核心数、内存与指针类型分为 high / medium / low，分别控制粒子数（2200/1200/520）、DPR 上限、抗锯齿与卫星数量。
4. **动态降级**：连续低于 45fps 两个采样窗口后，像素比降至 1、粒子绘制量减半、近景尘埃关闭。
5. **渲染节流**：`visibilitychange` 时暂停 RAF；页面隐藏不消耗 GPU；滚动监听经 `requestAnimationFrame` 节流。
6. **兜底时限**：启动层最长 2.6 秒后强制退场，保证首屏可交互时间稳定在 3 秒以内。

## 测试与兼容性

```bash
npm test                              # 单元测试：数据、store、模板、质量策略
npx playwright test                   # 全量浏览器矩阵
npx playwright test --project=chromium
```

覆盖范围：内容渲染、分类/标签联动、文章展开与关闭、主题持久化、3D 画布尺寸与拖拽缩放、移动端无横向溢出与底部导航。

浏览器支持：Chrome / Edge（Chromium）、Firefox、Safari（WebKit）近期版本。无头 WebKit 若缺少 GPU 会走二维降级，真实 Safari 可正常渲染。

## 个性化

- 修改 `src/data/blog.js` 中的 `profile`、`categories`、`posts` 即可替换博主信息、分类与文章。
- 主题色、字体与间距集中在 `src/styles.css` 顶部 `:root` 与 `[data-theme="light"]` 变量中。
- 3D 配色位于 `src/three/app.js` 的 `PALETTES`，与 CSS 主题一一对应。

## 部署

构建产物为纯静态文件：

```bash
npm run build
# 将 dist/ 目录上传到任意静态托管
```

- **Vercel**：Framework 选择 Vite，Build Command `npm run build`，Output Directory `dist`。
- **Netlify**：Build Command `npm run build`，Publish Directory `dist`。
- **Nginx / 对象存储**：

```nginx
server {
  listen 80;
  root /var/www/orbit-notes/dist;
  index index.html;

  location /assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

`base: './'` 使构建结果可直接部署到子路径；页面为单页锚点导航，无需额外路由 rewrite。建议对 `assets/*` 设置长缓存，对 `index.html` 设置 `no-cache`。

## 已知说明

- 滚轮缩放仅在 Hero 的 3D 舞台生效，避免劫持整页滚动；移动端使用双指缩放。
- 3D 效果依赖 WebGL；不支持时页面自动切换二维模式，内容与交互保持可用。
- 示例文章与个人信息为演示数据，仅用于学习与二次开发，请替换后再公开发布。
