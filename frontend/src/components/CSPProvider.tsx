/**
 * CSP (Content Security Policy) 提供者组件
 * 在应用启动时设置内容安全策略，防止XSS攻击
 */
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useCSP } from '../hooks/useSecurity';
import { initializeCSPReporting } from '../utils/cspReporting';

interface CSPProviderProps {
  children: ReactNode;
  /**
   * CSP配置选项
   */
  config?: {
    allowInlineStyles?: boolean;
    allowInlineScripts?: boolean;
    allowedDomains?: string[];
    allowDataImages?: boolean;
  };
}

/**
 * CSP提供者组件
 * 负责在应用启动时设置内容安全策略
 */
export function CSPProvider({ children, config = {} }: CSPProviderProps) {
  const { generateCSPHeader, setCSPMeta } = useCSP();

  useEffect(() => {
    // 默认CSP配置
    const defaultConfig = {
      allowInlineStyles: true, // 允许内联样式（Tailwind CSS需要）
      allowInlineScripts: false, // 禁止内联脚本
      allowEval: import.meta.env.DEV, // 开发环境允许eval（HMR需要）
      allowWebSockets: import.meta.env.DEV, // 开发环境允许WebSocket（HMR需要）
      allowedDomains: [
        'https://cdn.jsdelivr.net',
        'https://unpkg.com',
        'https://rtprnlyohcklthvynpjl.supabase.co', // Supabase域名
        'https://*.supabase.co', // Supabase通配符域名
        'https://images.unsplash.com', // Unsplash图片
        'https://via.placeholder.com', // 占位图片
        ...(import.meta.env.DEV ? [
          'http://localhost:*',
          'ws://localhost:*',
          'wss://localhost:*'
        ] : [])
      ],
      allowDataImages: true, // 允许data:图片
      reportUri: import.meta.env.DEV ? undefined : '/api/csp-report', // 生产环境启用CSP报告
      ...config
    };

    try {
      // 生成CSP头
      const cspHeader = generateCSPHeader(defaultConfig);
      
      // 设置CSP meta标签
      setCSPMeta(cspHeader);
      
      // 初始化CSP违规报告监听器
      initializeCSPReporting();
      
      // 在开发环境下输出CSP信息
      if (import.meta.env.DEV) {
        console.log('🔒 CSP Policy Applied:', cspHeader);
      }
    } catch (error) {
      console.error('❌ Failed to apply CSP policy:', error);
    }
  }, [generateCSPHeader, setCSPMeta, config]);

  return <>{children}</>;
}

/**
 * 获取生产环境推荐的CSP配置
 */
export function getProductionCSPConfig() {
  return {
    allowInlineStyles: false, // 生产环境禁止内联样式
    allowInlineScripts: false, // 生产环境禁止内联脚本
    allowEval: false, // 生产环境禁止eval
    allowWebSockets: false, // 生产环境谨慎使用WebSocket
    allowedDomains: [
      'https://rtprnlyohcklthvynpjl.supabase.co',
      'https://*.supabase.co',
      'https://images.unsplash.com',
    ],
    allowDataImages: false, // 生产环境禁止data:图片
    reportUri: '/api/csp-report', // 生产环境启用CSP违规报告
  };
}

/**
 * 获取开发环境CSP配置
 */
export function getDevelopmentCSPConfig() {
  return {
    allowInlineStyles: true, // 开发环境允许内联样式
    allowInlineScripts: true, // 开发环境允许内联脚本（HMR需要）
    allowEval: true, // 开发环境允许eval（HMR和调试需要）
    allowWebSockets: true, // 开发环境允许WebSocket（HMR需要）
    allowedDomains: [
      'https://cdn.jsdelivr.net',
      'https://unpkg.com',
      'https://rtprnlyohcklthvynpjl.supabase.co',
      'https://*.supabase.co',
      'https://images.unsplash.com',
      'https://via.placeholder.com',
      'http://localhost:*', // 开发服务器
      'ws://localhost:*', // WebSocket连接
      'wss://localhost:*', // 安全WebSocket连接
    ],
    allowDataImages: true, // 开发环境允许data:图片
    reportUri: undefined, // 开发环境不启用报告（避免控制台噪音）
  };
}