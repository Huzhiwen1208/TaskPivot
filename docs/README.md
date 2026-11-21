# TaskPivot 项目文档

## 1. 项目概述

TaskPivot 是一个以「学习任务管理」为主题的全栈实践项目，采用前后端分离架构：前端使用 React + Vite 构建界面，后端使用 FastAPI 提供 REST 接口，并通过 CORS 打通本地开发端口。仓库同时收纳了若干独立的学习实验目录，用于记录 AI 应用、C/C++ 与前端基础练习。

项目定位是「可运行的教学与练习底座」：每个子目录都可单独启动、单独学习，方便按主题逐块扩展，而不是一个已上线的商业产品。适合正在学习全栈开发、希望快速验证接口与页面联调流程的开发者。

核心功能：

- **任务 API 骨架**：FastAPI 提供根路由，返回服务运行状态，作为后续任务增删改查接口的起点。
- **前后端分离联调**：前端开发服务器（默认 `5173` 端口）与后端（默认 `8000` 端口）独立运行，后端已放行本地跨域请求，前端可直接请求接口。
- **自动接口文档**：基于 FastAPI 内置能力，启动后即可访问 `/docs` 进行在线调试。
- **UI 组件实践**：前端接入 `animal-island-ui` 组件库，演示按钮等基础组件的用法与主题样式引入方式。
- **配套实验**：`ai-frontend`（拾光个人博客，含完整测试）、`ai-agent`（RAG 检索问答与评估）、`C-C++`（课堂练习）等目录独立运行，互不依赖。

## 2. 技术栈

| 层次 | 技术 |
| --- | --- |
| 前端 | React 19、Vite、animal-island-ui |
| 博客前端 | React 19、TypeScript 5.9、Vite 7、React Router 7、react-markdown、Vitest |
| 后端 | Python、FastAPI（`fastapi[standard]`）、Pydantic、Uvicorn |
| AI 实验 | OpenAI SDK（阿里云百炼兼容接口）、LangChain、RAGAS、Jupyter |
| 基础练习 | C / C++ |
| 运行环境 | Node.js 24（nvm 管理）、Python 3.10+ |

## 3. 快速开始

### 3.1 环境要求

- Node.js 20.19+ / 22.12+，推荐通过 `nvm` 使用 24 版本；
- Python 3.10+ 与 `pip`；
- 现代浏览器（Chrome / Edge / Safari）。

### 3.2 安装步骤

```bash
# 切换 Node 版本并安装前端依赖
nvm use 24
cd frontend && npm install

# 安装后端依赖
python -m pip install "fastapi[standard]"
```

### 3.3 启动命令

```bash
# 启动后端，默认 http://127.0.0.1:8000
cd backend && fastapi dev main.py

# 另开终端启动前端，默认 http://127.0.0.1:5173
cd frontend && npm run dev
```

若前端 `package.json` 尚未定义 `scripts`，可用 `npx vite` 启动开发服务器。后端启动后可直接访问 `http://127.0.0.1:8000/docs` 查看自动生成的接口文档。

## 4. 项目结构

```text
task-pivot/
├── frontend/        # React + Vite 前端，接入 animal-island-ui
├── backend/         # FastAPI 后端服务（main.py）
├── ai-frontend/     # 拾光个人博客（React 19 + TS + Vite）
├── ai-agent/        # AI 智能体实验：知识库、向量库、RAGAS 评估
├── C-C++/           # C/C++ 课堂练习代码
├── frontend-learn/  # HTML/CSS/JS 静态页面练习
├── database/        # 数据库相关占位目录
├── docs/            # 项目文档
├── plot_tangent.py  # Matplotlib 数学可视化示例
└── README.md        # 仓库简要说明
```

## 5. 主要使用示例

调用后端根接口验证服务是否正常：

```bash
curl http://127.0.0.1:8000/
# {"message":"学习任务 API 正在运行"}
```

在前端页面中使用 UI 组件：

```jsx
import { Button } from 'animal-island-ui';
import 'animal-island-ui/style';

export default function App() {
  return <Button type="primary">新建任务</Button>;
}
```

如需单独体验完整博客页面（文章、分类、评论与搜索），可切换到独立的博客工程：

```bash
cd ai-frontend && npm install && npm run dev
```

该工程提供类型检查（`npm run typecheck`）、单元测试（`npm test`）与生产构建（`npm run build`），构建产物位于 `dist/`。

## 6. 常见问题

1. **`npm run dev` 提示 Missing script？** 说明 `package.json` 未配置脚本，改用 `npx vite` 启动。
2. **浏览器报跨域错误？** 后端已允许 `localhost:5173` 与 `127.0.0.1:5173`，请确认前端端口一致，否则修改 `backend/main.py` 中的 `allow_origins`。
3. **后端启动报找不到 `fastapi`？** 确认已执行 `python -m pip install "fastapi[standard]"`，并使用同一 Python 环境。
4. **Node 版本过低导致安装失败？** 执行 `nvm use 24` 后重新安装依赖。
5. **页面没有真实任务数据？** 当前后端仅提供演示接口，任务持久化需自行扩展数据库与接口。
6. **想先看接口怎么调？** 直接打开 `http://127.0.0.1:8000/docs`，在 Swagger 页面点击「Try it out」即可发起请求，无需额外工具。
7. **修改后页面没有刷新？** 确认 Vite 开发服务器仍在运行；若修改的是后端代码，`fastapi dev` 会自动重载，异常时重启进程即可。

## 7. 贡献指南

1. Fork 仓库并从 `main` 切出功能分支：`git checkout -b feat/your-feature`；
2. 保持改动聚焦，提交信息遵循 Conventional Commits（如 `feat: add task list api`）；
3. 提交前自测前后端可正常启动，不提交密钥、`node_modules` 等无关文件；
4. 发起 Pull Request，说明改动目的与验证方式，等待评审合并。

## 8. 许可证

本仓库目前未包含 `LICENSE` 文件，默认保留所有权利。若需开源，建议补充 MIT 或 Apache-2.0 许可证，并在本文件中同步说明。
