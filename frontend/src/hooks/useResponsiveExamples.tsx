/**
 * 响应式Hook使用示例
 * 展示如何使用优化后的响应式Hook系统
 */
import React from 'react';
import {
  useResponsive,
  useResponsiveValue,
  useResponsiveImage,
  useResponsiveFontSize,
  useResponsiveSpacing,
  useResponsivePerformance,
  useResponsiveDebug
} from './useResponsive';

/**
 * 基础响应式组件示例
 */
export const BasicResponsiveExample: React.FC = () => {
  const {
    breakpoint,
    deviceType,
    isMobile,
    isTablet,
    isDesktop,
    windowSize,
    isAbove,
    isBelow,
    matches
  } = useResponsive({
    enableDebug: true, // 开启调试模式
    cacheKey: 'basic-example' // 设置缓存键
  });

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">基础响应式信息</h3>
      <div className="space-y-2 text-sm">
        <p><strong>当前断点:</strong> {breakpoint}</p>
        <p><strong>设备类型:</strong> {deviceType}</p>
        <p><strong>窗口尺寸:</strong> {windowSize.width} × {windowSize.height}</p>
        <p><strong>是否移动端:</strong> {isMobile ? '是' : '否'}</p>
        <p><strong>是否平板:</strong> {isTablet ? '是' : '否'}</p>
        <p><strong>是否桌面端:</strong> {isDesktop ? '是' : '否'}</p>
        <p><strong>大于md:</strong> {isAbove('md') ? '是' : '否'}</p>
        <p><strong>小于lg:</strong> {isBelow('lg') ? '是' : '否'}</p>
        <p><strong>匹配xl:</strong> {matches('up', 'xl') ? '是' : '否'}</p>
      </div>
    </div>
  );
};

/**
 * 响应式值示例
 */
export const ResponsiveValueExample: React.FC = () => {
  // 响应式列数
  const columns = useResponsiveValue({
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
    'xxl': 6
  });

  // 响应式间距
  const padding = useResponsiveValue({
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '20px',
    xl: '24px'
  });

  return (
    <div className="border rounded-lg" style={{ padding }}>
      <h3 className="text-lg font-semibold mb-4">响应式值示例</h3>
      <p className="mb-4">当前列数: {columns}</p>
      <div 
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns * 2 }, (_, i) => (
          <div key={i} className="bg-blue-100 p-4 rounded text-center">
            项目 {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 响应式图片示例
 */
export const ResponsiveImageExample: React.FC = () => {
  const imageProps = useResponsiveImage({
    xs: '/images/hero-mobile.jpg',
    sm: '/images/hero-tablet.jpg',
    md: '/images/hero-desktop.jpg',
    lg: '/images/hero-large.jpg',
    xl: '/images/hero-xl.jpg'
  }, {
    fallback: '/images/hero-default.jpg',
    lazy: true,
    placeholder: '/images/placeholder.jpg'
  });

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">响应式图片示例</h3>
      <div className="relative">
        <img
          {...imageProps}
          alt="响应式图片示例"
          className={`w-full h-64 object-cover rounded transition-opacity duration-300 ${
            imageProps.isLoaded ? 'opacity-100' : 'opacity-50'
          }`}
        />
        {!imageProps.isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
            <span className="text-gray-500">加载中...</span>
          </div>
        )}
      </div>
      <div className="mt-2 text-sm text-gray-600">
        <p>图片源: {imageProps.src}</p>
        <p>已加载: {imageProps.isLoaded ? '是' : '否'}</p>
        <p>在视窗内: {imageProps.isInView ? '是' : '否'}</p>
      </div>
    </div>
  );
};

/**
 * 响应式字体和间距示例
 */
export const ResponsiveTypographyExample: React.FC = () => {
  const titleFontSize = useResponsiveFontSize({
    xs: 24,
    sm: 28,
    md: 32,
    lg: 36,
    xl: 40
  }, 'px');

  const textFontSize = useResponsiveFontSize({
    xs: 0.875,
    sm: 1,
    md: 1.125,
    lg: 1.25
  }, 'rem');

  const spacing = useResponsiveSpacing({
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40
  }, 'px');

  return (
    <div className="border rounded-lg" style={{ padding: spacing }}>
      <h3 
        className="font-bold mb-4"
        style={{ fontSize: titleFontSize }}
      >
        响应式字体和间距
      </h3>
      <p 
        className="text-gray-600 leading-relaxed"
        style={{ fontSize: textFontSize }}
      >
        这段文字的字体大小会根据屏幕尺寸自动调整。同时，容器的内边距也会响应式变化。
        在不同的断点下，你会看到不同的字体大小和间距效果。
      </p>
      <div className="mt-4 text-sm text-gray-500">
        <p>标题字体大小: {titleFontSize}</p>
        <p>正文字体大小: {textFontSize}</p>
        <p>容器间距: {spacing}</p>
      </div>
    </div>
  );
};

/**
 * 性能监控示例
 */
export const PerformanceMonitorExample: React.FC = () => {
  const {
    globalMetrics,
    allHooks,
    resetMetrics
  } = useResponsivePerformance();

  // 启用调试模式
  useResponsiveDebug(true);

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">性能监控</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded">
          <h4 className="font-medium mb-2">全局指标</h4>
          <div className="text-sm space-y-1">
            <p>Resize事件: {globalMetrics.resizeEventCount}</p>
            <p>断点变化: {globalMetrics.breakpointChangeCount}</p>
            <p>最后Resize: {globalMetrics.lastResizeTime ? new Date(globalMetrics.lastResizeTime).toLocaleTimeString() : '无'}</p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded">
          <h4 className="font-medium mb-2">活跃Hook</h4>
          <div className="text-sm space-y-1">
            <p>总数: {allHooks.length}</p>
            {allHooks.slice(0, 3).map(hook => (
              <p key={hook.hookId} className="truncate">
                {hook.hookId}: {hook.updateCount} 次更新
              </p>
            ))}
          </div>
        </div>
      </div>
      
      <button
        onClick={resetMetrics}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        重置指标
      </button>
      
      <p className="mt-2 text-xs text-gray-500">
        打开浏览器控制台查看详细的性能日志
      </p>
    </div>
  );
};

/**
 * 综合示例组件
 */
export const ResponsiveExamplesDemo: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">响应式Hook示例</h1>
        <p className="text-gray-600">展示优化后的响应式Hook系统的各种功能</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BasicResponsiveExample />
        <ResponsiveValueExample />
        <ResponsiveImageExample />
        <ResponsiveTypographyExample />
      </div>
      
      <PerformanceMonitorExample />
    </div>
  );
};

export default ResponsiveExamplesDemo;