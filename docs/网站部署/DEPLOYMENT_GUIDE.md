# 网站部署指南

## 当前状态

项目已经完成开发和构建，现在需要部署到生产环境。

## 部署选项

### 选项1: GitHub Actions + Vercel 自动部署（推荐）

项目已经配置了完整的GitHub Actions工作流，可以实现自动部署。

#### 前置条件
1. GitHub仓库
2. Vercel账户
3. 配置必要的Secrets

#### 部署步骤

1. **创建GitHub仓库**
   ```bash
   # 在GitHub上创建新仓库，然后执行：
   git remote add origin https://github.com/your-username/your-repo.git
   ```

2. **清理并提交代码**
   ```bash
   # 添加所有文件到Git
   git add .
   git commit -m "Initial commit: 完整的网站项目"
   git push -u origin main
   ```

3. **配置Vercel项目**
   - 登录 [Vercel Dashboard](https://vercel.com/dashboard)
   - 导入GitHub仓库
   - 获取项目ID和组织ID

4. **配置GitHub Secrets**
   在GitHub仓库设置中添加以下Secrets：
   - `VERCEL_TOKEN`: Vercel API Token
   - `VERCEL_ORG_ID`: Vercel组织ID
   - `VERCEL_PROJECT_ID`: Vercel项目ID

5. **触发部署**
   推送代码到main分支即可自动触发部署

### 选项2: 手动Vercel部署

如果不想使用GitHub Actions，可以手动部署：

1. **登录Vercel**
   ```bash
   vercel login
   ```

2. **部署项目**
   ```bash
   vercel --prod
   ```

### 选项3: 其他平台部署

项目也可以部署到其他平台：
- Netlify
- Firebase Hosting
- AWS S3 + CloudFront
- 自建服务器

## 环境变量配置

确保在部署平台配置以下环境变量：

```
VITE_SUPABASE_URL=https://rtprnlyohcklthvynpjl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0cHJubHlvaGNrbHRodnlucGpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5OTg0NTUsImV4cCI6MjA3MDU3NDQ1NX0.c7RKP6RN0C6MA1NXoXxu9sS0GPOTF7V66a2XnojXlDI
VITE_APP_TITLE=网站测试
VITE_APP_DESCRIPTION=专业的在线教育平台
NODE_ENV=production
VITE_ENV=production
```

## 部署验证

部署完成后，验证以下功能：

1. **网站访问**
   - 首页正常加载
   - 路由跳转正常
   - 响应式设计正常

2. **功能测试**
   - 用户登录/注册
   - 数据库连接
   - API接口调用
   - 后台管理功能

3. **性能检查**
   - 页面加载速度
   - 资源优化
   - SEO优化

## 域名配置（可选）

如果需要自定义域名：

1. 在Vercel Dashboard中添加域名
2. 配置DNS记录
3. 等待SSL证书生成

## 监控和维护

- 设置错误监控（如Sentry）
- 配置性能监控
- 定期备份数据库
- 监控服务器状态

## 下一步

请选择您偏好的部署方式，我可以协助您完成具体的配置步骤。