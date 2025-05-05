# 项目管理系统 4天实施计划 (React + TS + Next.js + Ant Design + Tailwind CSS + MSW)

## 第1天：项目初始化与基础搭建

### 上午
- **环境搭建** (1.5小时)
  - 创建Next.js项目：`npx create-next-app project-management-system --typescript --tailwind`
  - 安装依赖：`npm install antd @ant-design/icons axios`
  - **安装MSW**: `npm install msw --save-dev`
  - 初始化Tailwind CSS (检查 `tailwind.config.ts` 和 `postcss.config.js`)
- **项目结构搭建** (1.5小时)
  - 按照建议的目录结构创建文件夹 (components, hooks, models, types, utils)
  - **创建 `src/mocks` 文件夹** 用于存放 MSW 相关文件 (handlers, browser/server setup)。
  - 配置Ant Design与Tailwind CSS共存。

### 下午
- **MSW基础配置** (2小时)
  - 在 `src/mocks` 下创建 `handlers.ts` 文件，定义基础的 API 路由拦截规则 (例如，一个简单的 `/api/health` 端点)。
  - 创建 `src/mocks/browser.ts` 用于设置浏览器环境的 Service Worker。
  - 运行 MSW CLI 生成 Service Worker 文件: `npx msw init public/ --save` (将 worker 文件放在 `public` 目录下)。
  - **在应用入口处（例如 `app/layout.tsx` 或一个 Client Component）有条件地启动 MSW (仅在开发环境)**。
- **API封装** (1小时)
  - 在 `utils/api.ts` 中创建基础的 `axios` 实例。**注意：`baseURL` 可以是相对路径 (如 `/api`) 或留空，因为MSW会拦截实际的网络请求**。
  - 配置 `axios` 拦截器，用于未来自动添加 Authorization Token。
- **基础布局组件** (2小时)
  - 创建侧边栏、头部导航组件 (`components/layout/Sidebar.tsx`, `components/layout/Header.tsx`) - 使用Ant Design组件结合Tailwind CSS。
  - 实现全局布局 (`app/layout.tsx`, `components/layout/Layout.tsx`)。

## 第2天：认证模拟与核心页面

### 上午
- **MSW认证模拟** (3小时)
  - 在 `src/mocks/handlers.ts` 中：
    - 定义模拟的用户数据。
    - **实现 `/api/auth/login` 接口**: 接收用户名/密码，验证后返回一个**模拟的JWT Token**和用户信息。
    - **实现需要认证的接口 (例如 `/api/user/profile`)**: 检查请求头中的 `Authorization: Bearer <token>`，验证Token（可以模拟过期逻辑），无效则返回401/403，有效则返回数据。
  - **前端认证逻辑** (`hooks/useAuth.ts`):
    - 实现调用 `/api/auth/login` 的登录函数。
    - **将获取到的Token存储在 `localStorage` 或 `sessionStorage` 中**。
    - 实现登出函数（清除Token）。
    - 提供获取当前用户状态和Token的函数。
- **登录页面与表单** (1.5小时)
  - 创建登录页面 (`app/login/page.tsx`) 和表单组件 (`components/auth/LoginForm.tsx`)。
  - 调用 `useAuth` 钩子中的登录函数。

### 下午
- **路由保护** (1小时)
  - 创建 `AuthGuard` 组件 (`components/auth/AuthGuard.tsx`)，检查 `useAuth` 提供的登录状态和Token有效性，保护需要登录的路由。
- **类型与模型定义** (0.5小时)
  - 根据MSW模拟的数据结构完善 `types/project.ts`, `types/user.ts`。
- **仪表盘页面** (1.5小时)
  - 开发仪表盘主页面 (`app/dashboard/page.tsx`)。
  - **在MSW中添加 `/api/dashboard` 接口**，返回模拟数据。
  - 页面调用API获取并展示数据（确保请求携带Token）。
- **项目列表功能 (基础)** (1.5小时)
  - **在MSW中添加 `/api/projects` 接口 (GET)**，返回模拟的项目列表（需要认证）。
  - 创建 `useProjects` 钩子 (`hooks/useProjects.ts`) 调用API获取项目列表。
  - 创建项目列表页 (`app/projects/page.tsx`) 和基础列表/卡片组件 (`components/projects/ProjectList.tsx`, `components/projects/ProjectCard.tsx`) 展示数据。

## 第3天：项目管理功能

### 上午
- **项目详情页** (2.5小时)
  - **在MSW中添加 `/api/projects/:id` 接口 (GET)**，返回特定项目的模拟数据（需要认证）。
  - 创建项目详情视图 (`app/projects/[id]/page.tsx`)。
  - 调用API获取并展示项目详情。
- **项目创建/编辑功能** (3小时)
  - **在MSW中添加 `/api/projects` (POST) 和 `/api/projects/:id` (PUT/PATCH) 接口**，模拟创建和更新项目数据（需要认证）。
  - 开发项目创建/编辑表单 (`components/projects/ProjectForm.tsx`)。
  - 实现表单验证和调用相应API的逻辑。

### 下午
- **项目删除功能** (1.5小时)
  - **在MSW中添加 `/api/projects/:id` 接口 (DELETE)**，模拟删除项目数据（需要认证）。
  - 在项目列表或详情页添加删除按钮及确认逻辑。
  - 实现调用DELETE API并更新UI。
- **个人资料页** (1.5小时)
  - 创建个人信息页面 (`app/profile/page.tsx`)。
  - 调用已有的 `/api/user/profile` (或类似) 接口获取并展示用户信息。
  - (可选) 实现简单的信息编辑功能（需要对应的MSW PUT/PATCH接口）。

## 第4天：样式优化、测试与收尾

### 上午
- **样式精调与响应式** (3小时)
  - 使用Tailwind CSS微调样式、间距、布局。
  - 确保响应式表现。
  - 解决Ant Design与Tailwind CSS样式冲突。
- **前端测试与Mock验证** (2小时)
  - 手动测试所有核心流程：登录（获取Token）、Token自动添加到请求头、访问受保护路由、登出（清除Token）、项目CRUD操作。
  - **重点测试认证失败（无Token、无效Token）和模拟Token过期的场景**。
  - 检查控制台MSW的输出和网络请求。

### 下午
- **代码清理与优化** (2小时)
  - 移除无用代码，优化API调用逻辑（加载状态、错误处理）。
  - 检查Token处理逻辑是否健壮。
- **文档完善** (1小时)
  - 更新 `README.md`，说明**如何启动项目以及MSW是如何集成和工作的**。
  - 简要记录 `src/mocks/handlers.ts` 中定义的模拟API和数据结构。
- **最终检查** (1小时)
  - 整体浏览应用，确保用户体验流畅。

## 实施建议
- **版本控制**: 坚持使用Git。
- **MSW**: 充分利用其拦截能力模拟真实API行为，尤其是在认证逻辑上。将模拟数据和处理逻辑清晰地组织在 `src/mocks` 中。
- **Ant Design & Tailwind**: 策略不变，Ant Design负责组件结构，Tailwind负责样式微调。
- **API封装**: `utils/api.ts` 中的 `axios` 实例和拦截器是处理Token自动附加的关键。
- **状态管理**: `useAuth` 钩子是管理认证状态和Token的核心。