/**
 * 实时预览窗口组件
 */
import { useState, useEffect, useRef } from 'react';
import {
  XMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils';

/**
 * 预览设备类型
 */
type DeviceType = 'desktop' | 'tablet' | 'mobile';

/**
 * 设备配置
 */
const DEVICE_CONFIGS = {
  desktop: {
    name: '桌面端',
    width: '100%',
    height: '100%',
    icon: ComputerDesktopIcon,
  },
  tablet: {
    name: '平板',
    width: '768px',
    height: '1024px',
    icon: DeviceTabletIcon,
  },
  mobile: {
    name: '手机',
    width: '375px',
    height: '667px',
    icon: DevicePhoneMobileIcon,
  },
};

interface PreviewWindowProps {
  /** 预览的URL */
  previewUrl?: string;
  /** 是否显示预览窗口 */
  isOpen?: boolean;
  /** 关闭预览窗口的回调 */
  onClose?: () => void;
  /** 预览窗口标题 */
  title?: string;
}

/**
 * 实时预览窗口组件
 */
const PreviewWindow = ({
  previewUrl = 'http://localhost:3000',
  isOpen = false,
  onClose = () => {},
  title = '实时预览',
}: PreviewWindowProps = {}) => {
  const { currentTheme } = useTheme();
  // 通过检查背景色来判断是否为暗色主题
  const isDark = currentTheme?.colors?.background?.includes('#') && 
    parseInt(currentTheme.colors.background.replace('#', ''), 16) < 0x808080;
  const theme = isDark ? 'dark' : 'light';
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /**
   * 处理iframe加载完成
   */
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  /**
   * 切换全屏模式
   */
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  /**
   * 截图功能
   */
  const takeScreenshot = async () => {
    if (!iframeRef.current) return;

    try {
      // 使用html2canvas库进行截图（需要安装）
      // 这里先提供基础实现
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // 基础截图逻辑
        console.log('截图功能待实现');
      }
    } catch (error: unknown) {
      console.error('截图失败:', error);
    }
  };

  /**
   * 刷新预览
   */
  const refreshPreview = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      // 强制刷新iframe
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = 'about:blank';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc;
        }
      }, 10);
    }
  };

  // 监听主题变化，刷新预览
  useEffect(() => {
    refreshPreview();
  }, [theme]);

  if (!isOpen) return null;

  const currentDevice = DEVICE_CONFIGS[deviceType];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* 预览窗口 */}
      <div className={cn(
        'relative bg-white rounded-lg shadow-2xl transition-all duration-300',
        theme === 'dark' ? 'bg-gray-800' : 'bg-white',
        isFullscreen
          ? 'inset-2'
          : 'inset-8 md:inset-16'
      )}>
        {/* 窗口头部 */}
        <div className={cn(
          'flex items-center justify-between px-4 py-3 border-b transition-colors duration-200',
          theme === 'dark'
            ? 'border-gray-700 bg-gray-800'
            : 'border-gray-200 bg-gray-50'
        )}>
          <div className="flex items-center space-x-4">
            <h3 className={cn(
              'text-lg font-semibold transition-colors duration-200',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              {title}
            </h3>
            
            {/* 设备切换按钮 */}
            <div className="flex items-center space-x-2">
              {Object.entries(DEVICE_CONFIGS).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setDeviceType(key as DeviceType)}
                    className={cn(
                      'p-2 rounded-lg transition-all duration-200',
                      deviceType === key
                        ? theme === 'dark'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-600'
                        : theme === 'dark'
                          ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    )}
                    title={config.name}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center space-x-2">
            {/* 截图按钮 */}
            <button
              onClick={takeScreenshot}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              )}
              title="截图"
            >
              <CameraIcon className="w-5 h-5" />
            </button>

            {/* 全屏切换按钮 */}
            <button
              onClick={toggleFullscreen}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              )}
              title={isFullscreen ? '退出全屏' : '全屏'}
            >
              {isFullscreen ? (
                <ArrowsPointingInIcon className="w-5 h-5" />
              ) : (
                <ArrowsPointingOutIcon className="w-5 h-5" />
              )}
            </button>

            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              )}
              title="关闭"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 预览内容区域 */}
        <div className="relative flex-1 overflow-hidden">
          {/* 加载指示器 */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className={cn(
                  'text-sm transition-colors duration-200',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                )}>
                  加载中...
                </span>
              </div>
            </div>
          )}

          {/* 预览iframe */}
          <div className="h-full flex items-center justify-center p-4">
            <div
              className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300"
              style={{
                width: currentDevice.width,
                height: currentDevice.height,
                maxWidth: '100%',
                maxHeight: '100%',
              }}
            >
              <iframe
                ref={iframeRef}
                src={previewUrl}
                className="w-full h-full border-0"
                onLoad={handleIframeLoad}
                title="预览窗口"
                sandbox="allow-same-origin allow-scripts allow-forms"
              />
            </div>
          </div>
        </div>

        {/* 底部状态栏 */}
        <div className={cn(
          'flex items-center justify-between px-4 py-2 border-t text-sm transition-colors duration-200',
          theme === 'dark'
            ? 'border-gray-700 bg-gray-800 text-gray-400'
            : 'border-gray-200 bg-gray-50 text-gray-600'
        )}>
          <div className="flex items-center space-x-4">
            <span>设备: {currentDevice.name}</span>
            <span>尺寸: {currentDevice.width} × {currentDevice.height}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshPreview}
              className={cn(
                'px-3 py-1 rounded text-xs transition-all duration-200',
                theme === 'dark'
                  ? 'hover:bg-gray-700 hover:text-white'
                  : 'hover:bg-gray-200 hover:text-gray-800'
              )}
            >
              刷新
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewWindow;