/**
 * 实时预览Hook
 */
import { useState, useCallback, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';

/**
 * 预览配置接口
 */
interface PreviewConfig {
  /** 预览URL */
  url: string;
  /** 是否自动刷新 */
  autoRefresh: boolean;
  /** 刷新间隔（毫秒） */
  refreshInterval: number;
}

/**
 * 样式变更事件接口
 */
interface StyleChangeEvent {
  /** 变更类型 */
  type: 'theme' | 'component' | 'page';
  /** 变更的目标 */
  target: string;
  /** 变更的样式 */
  styles: Record<string, unknown>;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 实时预览Hook
 */
export const usePreview = () => {
  const { currentTheme } = useTheme();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewConfig, setPreviewConfig] = useState<PreviewConfig>({
    url: 'http://localhost:5173',
    autoRefresh: true,
    refreshInterval: 1000,
  });
  const [styleChanges, setStyleChanges] = useState<StyleChangeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  /**
   * 打开预览窗口
   */
  const openPreview = useCallback((url?: string) => {
    if (url) {
      setPreviewConfig(prev => ({ ...prev, url }));
    }
    setIsPreviewOpen(true);
  }, []);

  /**
   * 关闭预览窗口
   */
  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  /**
   * 更新预览配置
   */
  const updatePreviewConfig = useCallback((config: Partial<PreviewConfig>) => {
    setPreviewConfig(prev => ({ ...prev, ...config }));
  }, []);

  /**
   * 记录样式变更
   */
  const recordStyleChange = useCallback((change: Omit<StyleChangeEvent, 'timestamp'>) => {
    const styleChange: StyleChangeEvent = {
      ...change,
      timestamp: Date.now(),
    };
    
    setStyleChanges(prev => {
      const newChanges = [...prev, styleChange];
      // 只保留最近的100条记录
      return newChanges.slice(-100);
    });
  }, []);

  /**
   * 清空样式变更记录
   */
  const clearStyleChanges = useCallback(() => {
    setStyleChanges([]);
  }, []);

  /**
   * 获取最近的样式变更
   */
  const getRecentStyleChanges = useCallback((count: number = 10) => {
    return styleChanges.slice(-count);
  }, [styleChanges]);

  /**
   * 应用样式到预览窗口
   */
  const applyStylesToPreview = useCallback((styles: Record<string, unknown>) => {
    // 通过postMessage向iframe发送样式更新
    const previewWindow = document.querySelector('iframe[title="预览窗口"]') as HTMLIFrameElement;
    if (previewWindow && previewWindow.contentWindow) {
      previewWindow.contentWindow.postMessage({
        type: 'STYLE_UPDATE',
        styles,
        theme: currentTheme,
      }, '*');
    }
  }, [currentTheme]);

  /**
   * 监听主题变化
   */
  useEffect(() => {
    recordStyleChange({
      type: 'theme',
      target: 'global',
      styles: { theme: currentTheme },
    });

    // 应用主题到预览窗口
    applyStylesToPreview({ theme: currentTheme });
  }, [currentTheme, recordStyleChange, applyStylesToPreview]);

  /**
   * 检查预览服务器连接状态
   */
  const checkConnection = useCallback(async () => {
    try {
      const response = await fetch(previewConfig.url, { method: 'HEAD' });
      setIsConnected(response.ok);
      return response.ok;
    } catch (error) {
      console.error('Preview connection check failed:', error);
      setIsConnected(false);
      return false;
    }
  }, [previewConfig.url]);

  /**
   * 定期检查连接状态
   */
  useEffect(() => {
    const interval = setInterval(checkConnection, 5000);
    checkConnection(); // 立即检查一次
    
    return () => clearInterval(interval);
  }, [checkConnection]);

  /**
   * 获取预览URL（带时间戳防止缓存）
   */
  const getPreviewUrl = useCallback(() => {
    const url = new URL(previewConfig.url);
    if (previewConfig.autoRefresh) {
      url.searchParams.set('_t', Date.now().toString());
    }
    return url.toString();
  }, [previewConfig]);

  /**
   * 手动刷新预览
   */
  const refreshPreview = useCallback(() => {
    const previewWindow = document.querySelector('iframe[title="预览窗口"]') as HTMLIFrameElement;
    if (previewWindow) {
      previewWindow.src = getPreviewUrl();
    }
  }, [getPreviewUrl]);

  /**
   * 发送自定义消息到预览窗口
   */
  const sendMessageToPreview = useCallback((message: unknown) => {
    const previewWindow = document.querySelector('iframe[title="预览窗口"]') as HTMLIFrameElement;
    if (previewWindow && previewWindow.contentWindow) {
      previewWindow.contentWindow.postMessage(message, '*');
    }
  }, []);

  /**
   * 监听来自预览窗口的消息
   */
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // 确保消息来自预览窗口
      if (event.origin !== new URL(previewConfig.url).origin) {
        return;
      }

      const { type, data } = event.data;
      
      switch (type) {
        case 'PREVIEW_READY':
          console.log('预览窗口已准备就绪');
          break;
        case 'STYLE_APPLIED':
          console.log('样式已应用到预览窗口', data);
          break;
        case 'ERROR':
          console.error('预览窗口错误:', data);
          break;
        default:
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [previewConfig.url]);

  return {
    // 状态
    isPreviewOpen,
    previewConfig,
    styleChanges,
    isConnected,
    
    // 操作方法
    openPreview,
    closePreview,
    updatePreviewConfig,
    recordStyleChange,
    clearStyleChanges,
    getRecentStyleChanges,
    applyStylesToPreview,
    checkConnection,
    getPreviewUrl,
    refreshPreview,
    sendMessageToPreview,
  };
};

export default usePreview;