# 网站项目

一个基于 React + TypeScript + Vite + Supabase 的现代化网站项目。

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **部署**: Vercel
- **状态管理**: React Hooks
- **UI组件**: Radix UI + shadcn/ui

## 项目结构

```
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/      # React组件
│   │   ├── hooks/          # 自定义Hooks
│   │   ├── services/       # 服务层
│   │   ├── types/          # TypeScript类型定义
│   │   ├── utils/          # 工具函数
│   │   └── config/         # 配置文件
│   ├── public/             # 静态资源
│   └── supabase/           # Supabase配置
├── docs/                    # 项目文档
├── vercel.json             # Vercel部署配置
└── .vercelignore           # Vercel忽略文件
```

## 功能特性

- 📱 响应式设计
- 🔐 用户认证系统
- 📊 后台管理系统
- 📝 内容管理
- 🖼️ 媒体文件管理
- 📧 邮件发送功能
- 🔄 实时数据同步

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
cd frontend
npm install
```

### 环境配置

1. 复制环境变量文件：
```bash
cp .env.example .env.local
```

2. 配置 Supabase 环境变量：
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看应用。

### 构建生产版本

```bash
npm run build
```

## 部署

### Vercel 部署

1. 将代码推送到 GitHub 仓库
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署完成

### Supabase 配置

项目使用 Supabase 作为后端服务，包括：
- PostgreSQL 数据库
- 用户认证
- 存储服务
- Edge Functions

## 开发指南

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 组件使用函数式组件 + Hooks

### 目录约定

- `components/`: 可复用的 React 组件
- `hooks/`: 自定义 React Hooks
- `services/`: API 调用和业务逻辑
- `types/`: TypeScript 类型定义
- `utils/`: 工具函数和辅助方法

## 许可证

MIT License