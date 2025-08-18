/**
 * 懒加载组件包装器
 * 提供组件懒加载、错误边界、加载状态等功能
 */

import React, { Suspense } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import { performanceMonitor } from '../../utils/performanceMonitor';

interface LazyWrapperProps {
  children?: React.ReactNode;
  fallback?: React.ComponentType;
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  testId?: string;
}

interface LazyWrapperState {
  hasError: boolean;
  error?: Error;
  retryCount: number;
}

/**
 * 默认加载组件
 */
const DefaultFallback: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">加载中...</span>
  </div>
);

/**
 * 默认错误组件
 */
const DefaultErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
    <div className="text-red-600 mb-4">
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-red-800 mb-2">组件加载失败</h3>
    <p className="text-red-600 text-sm mb-4 text-center">
      {error.message || '未知错误'}
    </p>
    <button
      onClick={retry}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
    >
      重试
    </button>
  </div>
);

/**
 * 懒加载包装器类组件
 */
class LazyWrapper extends React.Component<LazyWrapperProps, LazyWrapperState> {
  private loadStartTime: number = 0;
  private componentName: string = 'Unknown';

  constructor(props: LazyWrapperProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<LazyWrapperState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[LazyWrapper] 组件加载错误:', error, errorInfo);
    
    // 记录错误性能指标
    performanceMonitor.addMetric(
      `组件加载错误-${this.componentName}`,
      Date.now() - this.loadStartTime,
      'custom'
    );

    this.props.onError?.(error);
  }

  componentDidMount() {
    this.loadStartTime = performance.now();
    this.componentName = this.props.testId || 'LazyComponent';
  }

  componentDidUpdate(_prevProps: LazyWrapperProps, prevState: LazyWrapperState) {
    // 如果组件成功加载（从错误状态恢复）
    if (prevState.hasError && !this.state.hasError) {
      const loadTime = performance.now() - this.loadStartTime;
      performanceMonitor.addMetric(
        `组件重试加载-${this.componentName}`,
        loadTime,
        'custom'
      );
      this.props.onLoad?.();
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      retryCount: prevState.retryCount + 1
    }));
    this.loadStartTime = performance.now();
  };

  render() {
    const { children, fallback: Fallback = DefaultFallback, errorFallback: ErrorFallback = DefaultErrorFallback, className, testId } = this.props;
    const { hasError, error } = this.state;

    if (hasError && error) {
      return (
        <div className={className} data-testid={`${testId}-error`}>
          <ErrorFallback error={error} retry={this.handleRetry} />
        </div>
      );
    }

    return (
      <Suspense fallback={<Fallback />}>
        <div className={className} data-testid={testId}>
          {children}
        </div>
      </Suspense>
    );
  }
}

/**
 * 创建懒加载组件的高阶函数
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    fallback?: React.ComponentType;
    errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
    onLoad?: () => void;
    onError?: (error: Error) => void;
    preload?: boolean;
    retryDelay?: number;
    maxRetries?: number;
  }
): LazyExoticComponent<T> {
  const componentName = importFn.toString().match(/['"]([^'"]*)['"]/)?.at(1) || 'Unknown';
  
  // 创建懒加载组件
  const LazyComponent = React.lazy(async () => {
    const startTime = performance.now();
    
    try {
      const module = await importFn();
      const endTime = performance.now();
      
      // 记录加载性能
      performanceMonitor.addMetric(
        `懒加载组件-${componentName}`,
        endTime - startTime,
        'custom'
      );
      
      options?.onLoad?.();
      return module;
    } catch (error) {
      const endTime = performance.now();
      
      // 记录加载错误
      performanceMonitor.addMetric(
        `懒加载组件失败-${componentName}`,
        endTime - startTime,
        'custom'
      );
      
      options?.onError?.(error as Error);
      throw error;
    }
  });

  // 如果启用预加载
  if (options?.preload) {
    // 延迟预加载，避免阻塞初始渲染
    setTimeout(() => {
      importFn().catch(() => {
        // 预加载失败时静默处理
      });
    }, 100);
  }

  return LazyComponent;
}

/**
 * 预加载组件
 */
export function preloadComponent(importFn: () => Promise<any>): Promise<any> {
  const startTime = performance.now();
  const componentName = importFn.toString().match(/['"]([^'"]*)['"]/)?.at(1) || 'Unknown';
  
  return importFn()
    .then(module => {
      const endTime = performance.now();
      performanceMonitor.addMetric(
        `预加载组件-${componentName}`,
        endTime - startTime,
        'custom'
      );
      return module;
    })
    .catch(error => {
      const endTime = performance.now();
      performanceMonitor.addMetric(
        `预加载组件失败-${componentName}`,
        endTime - startTime,
        'custom'
      );
      throw error;
    });
}

/**
 * 批量预加载组件
 */
export function preloadComponents(importFns: Array<() => Promise<any>>): Promise<any[]> {
  const startTime = performance.now();
  
  return Promise.allSettled(importFns.map(fn => preloadComponent(fn)))
    .then(results => {
      const endTime = performance.now();
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failureCount = results.filter(r => r.status === 'rejected').length;
      
      performanceMonitor.addMetric(
        `批量预加载组件-成功${successCount}个`,
        endTime - startTime,
        'custom'
      );
      
      if (failureCount > 0) {
        performanceMonitor.addMetric(
          `批量预加载组件-失败${failureCount}个`,
          endTime - startTime,
          'custom'
        );
      }
      
      return results;
    });
}

/**
 * 懒加载路由组件的便捷函数
 */
export function createLazyRoute<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = createLazyComponent(importFn, {
    fallback,
    preload: false // 路由组件通常不需要预加载
  });

  return (props: React.ComponentProps<T>) => (
    <LazyWrapper fallback={fallback}>
      <LazyComponent {...props} />
    </LazyWrapper>
  );
}

/**
 * 智能预加载Hook
 * 根据用户行为智能预加载组件
 */
export function useSmartPreload() {
  const [preloadedComponents, setPreloadedComponents] = React.useState<Set<string>>(new Set());

  const preloadOnHover = React.useCallback((importFn: () => Promise<any>, componentName: string) => {
    if (preloadedComponents.has(componentName)) {
      return;
    }

    const timeoutId = setTimeout(() => {
      preloadComponent(importFn)
        .then(() => {
          setPreloadedComponents(prev => new Set(prev).add(componentName));
        })
        .catch(() => {
          // 预加载失败时静默处理
        });
    }, 200); // 200ms延迟，避免误触

    return () => clearTimeout(timeoutId);
  }, [preloadedComponents]);

  const preloadOnVisible = React.useCallback((importFn: () => Promise<any>, componentName: string) => {
    if (preloadedComponents.has(componentName)) {
      return;
    }

    // 使用Intersection Observer检测元素可见性
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            preloadComponent(importFn)
              .then(() => {
                setPreloadedComponents(prev => new Set(prev).add(componentName));
              })
              .catch(() => {
                // 预加载失败时静默处理
              });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    return observer;
  }, [preloadedComponents]);

  return {
    preloadOnHover,
    preloadOnVisible,
    preloadedComponents: Array.from(preloadedComponents)
  };
}

export default LazyWrapper;
export { DefaultFallback, DefaultErrorFallback };