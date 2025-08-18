/**
 * 优化的响应式Hook
 * 使用统一的断点系统，提供更好的性能和更丰富的功能
 * 
 * 特性：
 * - 防抖优化的resize监听
 * - 智能缓存和状态比较
 * - 支持SSR和容器查询
 * - 完整的TypeScript类型支持
 * - 性能监控和调试工具
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  DEFAULT_BREAKPOINT_CONFIG,
  getCurrentBreakpoint,
  getDeviceType,
  isMobileBreakpoint,
  isTabletBreakpoint,
  isDesktopBreakpoint,
  isBreakpointAbove,
  isBreakpointBelow,
  generateMediaQuery,
  matchesBreakpoint,
  resolveResponsiveValue
} from '../config/breakpoints';
import type {
  BreakpointKey,
  DeviceType,
  MediaQueryType,
  ResponsiveValue,
  BreakpointConfig
} from '../config/breakpoints';

/**
 * 窗口尺寸接口
 */
interface WindowSize {
  width: number;
  height: number;
}

/**
 * 响应式状态接口
 */
interface ResponsiveState {
  breakpoint: BreakpointKey;
  windowSize: WindowSize;
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * 性能监控接口
 */
interface PerformanceMetrics {
  resizeEventCount: number;
  lastResizeTime: number;
  averageResizeDelay: number;
  breakpointChangeCount: number;
}

/**
 * 调试信息接口
 */
interface DebugInfo {
  hookId: string;
  mountTime: number;
  lastUpdateTime: number;
  updateCount: number;
  performance: PerformanceMetrics;
}

/**
 * 全局性能监控
 */
class ResponsivePerformanceMonitor {
  private static instance: ResponsivePerformanceMonitor;
  private hooks: Map<string, DebugInfo> = new Map();
  private globalMetrics: PerformanceMetrics = {
    resizeEventCount: 0,
    lastResizeTime: 0,
    averageResizeDelay: 0,
    breakpointChangeCount: 0
  };

  static getInstance(): ResponsivePerformanceMonitor {
    if (!ResponsivePerformanceMonitor.instance) {
      ResponsivePerformanceMonitor.instance = new ResponsivePerformanceMonitor();
    }
    return ResponsivePerformanceMonitor.instance;
  }

  registerHook(hookId: string): DebugInfo {
    const debugInfo: DebugInfo = {
      hookId,
      mountTime: Date.now(),
      lastUpdateTime: Date.now(),
      updateCount: 0,
      performance: {
        resizeEventCount: 0,
        lastResizeTime: 0,
        averageResizeDelay: 0,
        breakpointChangeCount: 0
      }
    };
    this.hooks.set(hookId, debugInfo);
    return debugInfo;
  }

  unregisterHook(hookId: string): void {
    this.hooks.delete(hookId);
  }

  recordResize(hookId: string): void {
    const debugInfo = this.hooks.get(hookId);
    if (debugInfo) {
      debugInfo.performance.resizeEventCount++;
      debugInfo.performance.lastResizeTime = Date.now();
      debugInfo.lastUpdateTime = Date.now();
      debugInfo.updateCount++;
    }
    this.globalMetrics.resizeEventCount++;
    this.globalMetrics.lastResizeTime = Date.now();
  }

  recordBreakpointChange(hookId: string): void {
    const debugInfo = this.hooks.get(hookId);
    if (debugInfo) {
      debugInfo.performance.breakpointChangeCount++;
    }
    this.globalMetrics.breakpointChangeCount++;
  }

  getGlobalMetrics(): PerformanceMetrics {
    return { ...this.globalMetrics };
  }

  getHookMetrics(hookId: string): DebugInfo | undefined {
    return this.hooks.get(hookId);
  }

  getAllHooks(): DebugInfo[] {
    return Array.from(this.hooks.values());
  }
}

// 全局监控实例
const performanceMonitor = ResponsivePerformanceMonitor.getInstance();

/**
 * 防抖函数
 */
function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * 获取初始窗口尺寸
 */
function getInitialWindowSize(): WindowSize {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

/**
 * 获取初始响应式状态
 */
function getInitialResponsiveState(): ResponsiveState {
  const windowSize = getInitialWindowSize();
  const breakpoint = getCurrentBreakpoint(windowSize.width);
  const deviceType = getDeviceType(breakpoint);
  
  return {
    breakpoint,
    windowSize,
    deviceType,
    isMobile: isMobileBreakpoint(breakpoint),
    isTablet: isTabletBreakpoint(breakpoint),
    isDesktop: isDesktopBreakpoint(breakpoint)
  };
}

/**
 * 主要的响应式Hook
 * 提供当前断点、设备类型和窗口尺寸信息，支持性能监控和智能缓存
 */
export function useResponsive(config: Partial<BreakpointConfig> & {
  enableDebug?: boolean;
  cacheKey?: string;
} = {}) {
  const { enableDebug = false, cacheKey, ...breakpointConfig } = config;
  const finalConfig = { ...DEFAULT_BREAKPOINT_CONFIG, ...breakpointConfig };
  const [state, setState] = useState<ResponsiveState>(getInitialResponsiveState);
  const stateRef = useRef(state);
  const previousBreakpoint = useRef<BreakpointKey | null>(null);
  stateRef.current = state;

  // 生成唯一的Hook ID
  const hookId = useMemo(() => {
    return cacheKey || `responsive-${Math.random().toString(36).substr(2, 9)}`;
  }, [cacheKey]);
  
  // 注册性能监控
  const debugInfo = useMemo(() => {
    if (enableDebug) {
      return performanceMonitor.registerHook(hookId);
    }
    return undefined;
  }, [hookId, enableDebug]);

  // 防抖的resize处理函数
  const debouncedHandleResize = useMemo(
    () => debounce(() => {
      if (typeof window === 'undefined') return;
      
      const windowSize = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      
      const breakpoint = getCurrentBreakpoint(windowSize.width);
      const deviceType = getDeviceType(breakpoint);
      
      const newState: ResponsiveState = {
        breakpoint,
        windowSize,
        deviceType,
        isMobile: isMobileBreakpoint(breakpoint),
        isTablet: isTabletBreakpoint(breakpoint),
        isDesktop: isDesktopBreakpoint(breakpoint)
      };
      
      // 只有当状态真正改变时才更新
      if (
        stateRef.current.breakpoint !== newState.breakpoint ||
        stateRef.current.windowSize.width !== newState.windowSize.width ||
        stateRef.current.windowSize.height !== newState.windowSize.height
      ) {
        // 记录性能监控
        if (enableDebug) {
          performanceMonitor.recordResize(hookId);
          if (previousBreakpoint.current !== newState.breakpoint) {
            performanceMonitor.recordBreakpointChange(hookId);
            previousBreakpoint.current = newState.breakpoint;
          }
        }
        setState(newState);
      }
    }, finalConfig.debounceDelay),
    [finalConfig.debounceDelay, hookId, enableDebug]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('resize', debouncedHandleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
      if (enableDebug) {
        performanceMonitor.unregisterHook(hookId);
      }
    };
  }, [debouncedHandleResize, hookId, enableDebug]);

  /**
   * 检查是否大于指定断点
   */
  const isAbove = useCallback((targetBreakpoint: BreakpointKey) => {
    return isBreakpointAbove(state.breakpoint, targetBreakpoint);
  }, [state.breakpoint]);

  /**
   * 检查是否小于指定断点
   */
  const isBelow = useCallback((targetBreakpoint: BreakpointKey) => {
    return isBreakpointBelow(state.breakpoint, targetBreakpoint);
  }, [state.breakpoint]);

  /**
   * 检查是否匹配指定的媒体查询条件
   */
  const matches = useCallback((
    type: MediaQueryType,
    breakpoint: BreakpointKey,
    endBreakpoint?: BreakpointKey
  ) => {
    return matchesBreakpoint(state.windowSize.width, type, breakpoint, endBreakpoint);
  }, [state.windowSize.width]);

  const result = {
    ...state,
    isAbove,
    isBelow,
    matches,
    config: finalConfig,
    ...(enableDebug && { debug: debugInfo })
  };

  return result;
}

/**
 * 窗口尺寸Hook
 * 仅监听窗口尺寸变化，不包含断点逻辑
 */
export function useWindowSize(debounceDelay: number = 100) {
  const [windowSize, setWindowSize] = useState<WindowSize>(getInitialWindowSize);

  const debouncedHandleResize = useMemo(
    () => debounce(() => {
      if (typeof window === 'undefined') return;
      
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }, debounceDelay),
    [debounceDelay]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('resize', debouncedHandleResize);
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, [debouncedHandleResize]);

  return windowSize;
}

/**
 * 断点Hook
 * 仅监听断点变化
 */
export function useBreakpoint(config: Partial<BreakpointConfig> = {}) {
  const finalConfig = { ...DEFAULT_BREAKPOINT_CONFIG, ...config };
  const [breakpoint, setBreakpoint] = useState<BreakpointKey>(() => {
    if (typeof window === 'undefined') return 'lg';
    return getCurrentBreakpoint(window.innerWidth);
  });

  const debouncedHandleResize = useMemo(
    () => debounce(() => {
      if (typeof window === 'undefined') return;
      
      const newBreakpoint = getCurrentBreakpoint(window.innerWidth);
      if (newBreakpoint !== breakpoint) {
        setBreakpoint(newBreakpoint);
      }
    }, finalConfig.debounceDelay),
    [finalConfig.debounceDelay, breakpoint]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('resize', debouncedHandleResize);
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, [debouncedHandleResize]);

  return {
    breakpoint,
    deviceType: getDeviceType(breakpoint),
    isMobile: isMobileBreakpoint(breakpoint),
    isTablet: isTabletBreakpoint(breakpoint),
    isDesktop: isDesktopBreakpoint(breakpoint)
  };
}

/**
 * 响应式值Hook
 * 根据当前断点解析响应式值
 */
export function useResponsiveValue<T>(
  value: ResponsiveValue<T>,
  config: Partial<BreakpointConfig> = {}
) {
  const { breakpoint } = useBreakpoint(config);
  
  return useMemo(() => {
    return resolveResponsiveValue(value, breakpoint);
  }, [value, breakpoint]);
}

/**
 * 媒体查询Hook
 * 监听指定的媒体查询条件
 */
export function useMediaQuery(
  query: string,
  defaultValue: boolean = false
): boolean {
  const [matches, setMatches] = useState(defaultValue);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // 使用新的API或降级到旧的API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // 降级支持
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [query]);

  return matches;
}

/**
 * 容器查询Hook
 * 监听容器尺寸变化（需要浏览器支持）
 */
export function useContainerQuery(
  containerRef: React.RefObject<HTMLElement>,
  query: string,
  defaultValue: boolean = false
): boolean {
  const [matches, setMatches] = useState(defaultValue);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    // 检查浏览器是否支持容器查询
    if (!('container' in document.documentElement.style)) {
      console.warn('Container queries are not supported in this browser');
      return;
    }

    const container = containerRef.current;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        // 这里需要手动解析查询条件
        // 简化实现，实际应该解析完整的容器查询语法
        const match = query.includes('min-width') ? 
          width >= parseInt(query.match(/\d+/)?.[0] || '0') :
          true;
        setMatches(match);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [containerRef, query]);

  return matches;
}

/**
 * 设备方向Hook
 * 监听设备方向变化
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() => {
    if (typeof window === 'undefined') return 'portrait';
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOrientationChange = () => {
      const newOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      setOrientation(newOrientation);
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return orientation;
}

/**
 * 响应式CSS生成器Hook
 * 生成响应式CSS字符串
 */
export function useResponsiveCSS() {
  const generateCSS = useCallback(<T>(
    property: string,
    value: ResponsiveValue<T>,
    valueTransform?: (val: T) => string,
    config: Partial<BreakpointConfig> = {}
  ): string => {
    const finalConfig = { ...DEFAULT_BREAKPOINT_CONFIG, ...config };
    
    if (typeof value !== 'object' || value === null) {
      return `${property}: ${valueTransform ? valueTransform(value as T) : value};`;
    }

    const responsiveValue = value as Partial<Record<BreakpointKey, T>>;
    const cssRules: string[] = [];

    // 基础样式（最小断点）
    if (responsiveValue.xs !== undefined) {
      const val = valueTransform ? valueTransform(responsiveValue.xs) : responsiveValue.xs;
      cssRules.push(`${property}: ${val};`);
    }

    // 其他断点的媒体查询
    (['sm', 'md', 'lg', 'xl', 'xxl'] as BreakpointKey[]).forEach(breakpoint => {
      if (responsiveValue[breakpoint] !== undefined) {
        const val = valueTransform ? valueTransform(responsiveValue[breakpoint]!) : responsiveValue[breakpoint];
        const mediaQuery = generateMediaQuery('up', breakpoint, undefined, finalConfig);
        cssRules.push(`${mediaQuery} { ${property}: ${val}; }`);
      }
    });

    return cssRules.join('\n');
  }, []);

  return { generateCSS };
}

/**
 * 响应式性能监控Hook
 * 提供全局性能指标和调试信息
 */
export const useResponsivePerformance = (): {
  globalMetrics: PerformanceMetrics;
  allHooks: DebugInfo[];
  getHookMetrics: (hookId: string) => DebugInfo | undefined;
  resetMetrics: () => void;
} => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(() => 
    performanceMonitor.getGlobalMetrics()
  );
  const [hooks, setHooks] = useState<DebugInfo[]>(() => 
    performanceMonitor.getAllHooks()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getGlobalMetrics());
      setHooks(performanceMonitor.getAllHooks());
    }, 1000); // 每秒更新一次

    return () => clearInterval(interval);
  }, []);

  const getHookMetrics = useCallback((hookId: string) => {
    return performanceMonitor.getHookMetrics(hookId);
  }, []);

  const resetMetrics = useCallback(() => {
    // 重置全局指标（注意：这会影响所有Hook）
    const monitor = ResponsivePerformanceMonitor.getInstance();
    // 重置全局指标
    (monitor as any).globalMetrics = {
      resizeEventCount: 0,
      lastResizeTime: 0,
      averageResizeDelay: 0,
      breakpointChangeCount: 0
    };
    setMetrics(performanceMonitor.getGlobalMetrics());
  }, []);

  return {
    globalMetrics: metrics,
    allHooks: hooks,
    getHookMetrics,
    resetMetrics
  };
};

/**
 * 响应式调试Hook
 * 在开发环境中提供详细的调试信息
 */
export const useResponsiveDebug = (enabled: boolean = process.env.NODE_ENV === 'development') => {
  const performance = useResponsivePerformance();
  
  useEffect(() => {
    if (!enabled) return;
    
    // 在控制台输出性能信息
    const logPerformance = () => {
      console.group('📱 Responsive Performance Metrics');
      console.log('Global Metrics:', performance.globalMetrics);
      console.log('Active Hooks:', performance.allHooks.length);
      performance.allHooks.forEach(hook => {
        console.log(`Hook ${hook.hookId}:`, {
          mountTime: new Date(hook.mountTime).toLocaleTimeString(),
          updateCount: hook.updateCount,
          resizeEvents: hook.performance.resizeEventCount,
          breakpointChanges: hook.performance.breakpointChangeCount
        });
      });
      console.groupEnd();
    };
    
    // 每30秒输出一次性能信息
    const interval = setInterval(logPerformance, 30000);
    
    return () => clearInterval(interval);
  }, [enabled, performance]);
  
  return performance;
 };

/**
 * 响应式图片Hook
 * 根据当前断点自动选择合适的图片尺寸
 */
export const useResponsiveImage = (imageSources: {
  [key in BreakpointKey]?: string;
}, options: {
  fallback?: string;
  lazy?: boolean;
  placeholder?: string;
} = {}) => {
  const { breakpoint } = useResponsive();
  const { fallback = '', lazy = true, placeholder } = options;
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);

  // 根据当前断点选择图片源
  const currentImageSrc = useMemo(() => {
    // 按断点优先级查找图片源
    const breakpointOrder: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    const currentIndex = breakpointOrder.indexOf(breakpoint);
    
    // 从当前断点开始向下查找
    for (let i = currentIndex; i >= 0; i--) {
      const bp = breakpointOrder[i];
      if (imageSources[bp]) {
        return imageSources[bp];
      }
    }
    
    // 如果没找到，向上查找
    for (let i = currentIndex + 1; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i];
      if (imageSources[bp]) {
        return imageSources[bp];
      }
    }
    
    return fallback;
  }, [breakpoint, imageSources, fallback]);

  // 懒加载逻辑
  useEffect(() => {
    if (!lazy || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [lazy]);

  // 图片加载处理
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setIsLoaded(false);
  }, []);

  return {
    ref: imgRef,
    src: isInView ? currentImageSrc : (placeholder || ''),
    isLoaded,
    isInView,
    onLoad: handleLoad,
    onError: handleError
  };
};

/**
 * 响应式字体大小Hook
 * 根据断点自动调整字体大小
 */
export const useResponsiveFontSize = (fontSizes: {
  [key in BreakpointKey]?: string | number;
}, unit: 'px' | 'rem' | 'em' = 'rem') => {
  const { breakpoint } = useResponsive();

  return useMemo(() => {
    const breakpointOrder: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    const currentIndex = breakpointOrder.indexOf(breakpoint);
    
    // 从当前断点开始向下查找
    for (let i = currentIndex; i >= 0; i--) {
      const bp = breakpointOrder[i];
      if (fontSizes[bp] !== undefined) {
        const size = fontSizes[bp];
        return typeof size === 'number' ? `${size}${unit}` : size;
      }
    }
    
    // 如果没找到，向上查找
    for (let i = currentIndex + 1; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i];
      if (fontSizes[bp] !== undefined) {
        const size = fontSizes[bp];
        return typeof size === 'number' ? `${size}${unit}` : size;
      }
    }
    
    return '1rem'; // 默认值
  }, [breakpoint, fontSizes, unit]);
};

/**
 * 响应式间距Hook
 * 根据断点自动调整间距值
 */
export const useResponsiveSpacing = (spacings: {
  [key in BreakpointKey]?: string | number;
}, unit: 'px' | 'rem' | 'em' = 'rem') => {
  const { breakpoint } = useResponsive();

  return useMemo(() => {
    const breakpointOrder: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    const currentIndex = breakpointOrder.indexOf(breakpoint);
    
    // 从当前断点开始向下查找
    for (let i = currentIndex; i >= 0; i--) {
      const bp = breakpointOrder[i];
      if (spacings[bp] !== undefined) {
        const spacing = spacings[bp];
        return typeof spacing === 'number' ? `${spacing}${unit}` : spacing;
      }
    }
    
    // 如果没找到，向上查找
    for (let i = currentIndex + 1; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i];
      if (spacings[bp] !== undefined) {
        const spacing = spacings[bp];
        return typeof spacing === 'number' ? `${spacing}${unit}` : spacing;
      }
    }
    
    return '0'; // 默认值
  }, [breakpoint, spacings, unit]);
};