# 环境变量配置指南

## 概述

本文档说明了项目中使用的环境变量以及如何在不同环境中配置它们。

## 环境变量列表

### Supabase 配置

| 变量名 | 描述 | 示例值 | 必需 |
|--------|------|--------|------|
| `VITE_SUPABASE_URL` | Supabase项目URL | `https://rtprnlyohcklthvynpjl.supabase.co` | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase匿名密钥 | `eyJhbGciOiJIUzI1NiIs...` | ✅ |

### 应用配置

| 变量名 | 描述 | 示例值 | 必需 |
|--------|------|--------|------|
| `VITE_APP_TITLE` | 应用标题 | `网站测试` | ✅ |
| `VITE_APP_DESCRIPTION` | 应用描述 | `专业的在线教育平台` | ✅ |
| `NODE_ENV` | Node.js环境 | `production` | ✅ |
| `VITE_ENV` | Vite环境标识 | `production` | ✅ |

### 邮件服务配置（可选）

| 变量名 | 描述 | 示例值 | 必需 |
|--------|------|--------|------|
| `VITE_ADMIN_EMAIL` | 管理员邮箱 | `admin@yourcompany.com` | ❌ |
| `VITE_FROM_EMAIL` | 发件人邮箱 | `noreply@yourcompany.com` | ❌ |

## 本地开发配置

### 1. 复制示例文件

```bash
cd frontend
cp .env.example .env.local
```

### 2. 编辑 `.env.local` 文件

```env
# Supabase配置
VITE_SUPABASE_URL=https://rtprnlyohcklthvynpjl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0cHJubHlvaGNrbHRodnlucGpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5OTg0NTUsImV4cCI6MjA3MDU3NDQ1NX0.c7RKP6RN0C6MA1NXoXxu9sS0GPOTF7V66a2XnojXlDI

# 应用配置
VITE_APP_TITLE=网站测试
VITE_APP_DESCRIPTION=专业的在线教育平台
```

## Vercel 部署配置

### 方法1: 通过 Vercel Dashboard

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下环境变量：

```
VITE_SUPABASE_URL = https://rtprnlyohcklthvynpjl.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0cHJubHlvaGNrbHRodnlucGpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5OTg0NTUsImV4cCI6MjA3MDU3NDQ1NX0.c7RKP6RN0C6MA1NXoXxu9sS0GPOTF7V66a2XnojXlDI
VITE_APP_TITLE = 网站测试
VITE_APP_DESCRIPTION = 专业的在线教育平台
NODE_ENV = production
VITE_ENV = production
```

### 方法2: 通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 设置环境变量
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_APP_TITLE
vercel env add VITE_APP_DESCRIPTION
vercel env add NODE_ENV
vercel env add VITE_ENV
```

### 方法3: 通过 vercel.json 配置

环境变量已在 `vercel.json` 中预配置：

```json
{
  "env": {
    "VITE_SUPABASE_URL": "https://rtprnlyohcklthvynpjl.supabase.co",
    "VITE_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0cHJubHlvaGNrbHRodnlucGpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5OTg0NTUsImV4cCI6MjA3MDU3NDQ1NX0.c7RKP6RN0C6MA1NXoXxu9sS0GPOTF7V66a2XnojXlDI",
    "VITE_APP_TITLE": "网站测试",
    "VITE_APP_DESCRIPTION": "专业的在线教育平台",
    "NODE_ENV": "production",
    "VITE_ENV": "production"
  }
}
```

## 安全注意事项

### ✅ 安全的环境变量
- `VITE_SUPABASE_URL` - 公开的项目URL
- `VITE_SUPABASE_ANON_KEY` - 匿名密钥（有RLS保护）
- `VITE_APP_*` - 应用配置信息

### ⚠️ 敏感信息
- **不要** 在前端环境变量中存储服务密钥
- **不要** 在前端环境变量中存储数据库密码
- **不要** 在前端环境变量中存储API私钥

### 🔒 最佳实践
1. 使用 Supabase RLS (Row Level Security) 保护数据
2. 敏感操作使用 Edge Functions
3. 定期轮换密钥
4. 监控 API 使用情况

## 验证配置

### 本地验证

```bash
cd frontend
npm run dev
```

访问 http://localhost:5173，检查：
- 页面正常加载
- Supabase 连接正常
- 无控制台错误

### 生产验证

部署后访问生产URL，检查：
- 页面正常加载
- 数据库连接正常
- 功能正常工作

## 故障排除

### 常见问题

1. **Supabase 连接失败**
   - 检查 URL 和密钥是否正确
   - 确认项目状态正常

2. **环境变量未生效**
   - 确认变量名以 `VITE_` 开头
   - 重新构建和部署

3. **CORS 错误**
   - 检查 Supabase 项目设置
   - 确认域名已添加到允许列表

### 调试命令

```bash
# 检查环境变量
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# 查看构建日志
vercel logs

# 本地调试
npm run build
npm run preview
```