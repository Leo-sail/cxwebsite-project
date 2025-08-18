import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // 开发环境CSP头配置
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* ws://localhost:*",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: https://images.unsplash.com https://via.placeholder.com https://rtprnlyohcklthvynpjl.supabase.co https://*.supabase.co",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' http://localhost:* ws://localhost:* https://rtprnlyohcklthvynpjl.supabase.co https://*.supabase.co",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; ')
    }
  },
  build: {
    // 生产环境构建配置
    target: 'es2015',
    minify: 'terser',
    sourcemap: false,
    // 启用代码分割
    rollupOptions: {
      output: {
        // 为了CSP安全，避免内联脚本
        inlineDynamicImports: false,
        // 手动代码分割
        manualChunks: {
          // 第三方库分割
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          ui: ['@headlessui/react', '@heroicons/react'],
          supabase: ['@supabase/supabase-js'],
          // 管理后台代码分割
          admin: [
            './src/admin/pages/Dashboard.tsx',
            './src/admin/pages/Courses.tsx',
            './src/admin/pages/Teachers.tsx',
            './src/admin/pages/Cases.tsx',
            './src/admin/pages/Articles.tsx'
          ],
          // 内容管理分割
          content: [
            './src/components/ContentManagement/ContentEditor.tsx',
            './src/components/RichTextEditor.tsx'
          ]
        },
        // 优化chunk文件名
        chunkFileNames: () => {
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (/\.(css)$/.test(assetInfo.name || '')) {
            return 'css/[name]-[hash].[ext]';
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name || '')) {
            return 'images/[name]-[hash].[ext]';
          }
          return 'assets/[name]-[hash].[ext]';
        }
      }
    },
    // 设置chunk大小警告阈值
    chunkSizeWarningLimit: 1000
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      '@headlessui/react',
      '@heroicons/react/24/outline',
      '@heroicons/react/24/solid'
    ],
    exclude: ['@vite/client', '@vite/env']
  }
})
