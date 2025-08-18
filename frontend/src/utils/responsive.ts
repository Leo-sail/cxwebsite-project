import { useState, useEffect, useMemo } from 'react';
import { BREAKPOINTS, type BreakpointKey, type MediaQueryType, type ResponsiveValue, generateMediaQuery, resolveResponsiveValue } from '../config/breakpoints';

/**
 * 响应式样式配置接口
 */
export interface ResponsiveStyleConfig {
  /** 是否使用容器查询 */
  useContainerQueries?: boolean;
  /** 默认单位 */
  defaultUnit?: string;
}

/**
 * 响应式工具类
 * 基于统一断点系统的响应式工具函数
 * 与 ../config/breakpoints 完全兼容
 */
export class ResponsiveStyleUtils {
  private breakpoints: typeof BREAKPOINTS;
  // private _useContainerQueries: boolean; // 暂未使用
  // private _defaultUnit: string; // 暂未使用

  constructor() {
    this.breakpoints = BREAKPOINTS;
  }

  /**
   * 生成媒体查询字符串
   * 基于统一断点系统
   */
  public mediaQuery(
    type: MediaQueryType,
    breakpoint: BreakpointKey,
    endBreakpoint?: BreakpointKey
  ): string {
    return generateMediaQuery(type, breakpoint, endBreakpoint);
  }

  /**
   * 解析响应式值
   * 基于统一断点系统
   */
  public resolveResponsiveValue<T>(
    value: ResponsiveValue<T>,
    currentBreakpoint: BreakpointKey
  ): T {
    return resolveResponsiveValue(value, currentBreakpoint);
  }

  /**
   * 生成响应式CSS
   * 基于统一断点系统
   */
  public generateResponsiveCSS<T>(
    property: string,
    value: ResponsiveValue<T>,
    transform?: (val: T) => string
  ): string {
    if (typeof value !== 'object' || value === null) {
      const cssValue = transform ? transform(value as T) : String(value);
      return `${property}: ${cssValue};`;
    }

    let css = '';
    const keys = Object.keys(this.breakpoints) as BreakpointKey[];
    const responsiveObj = value as Partial<Record<BreakpointKey, T>>;
    
    keys.forEach(key => {
      if (responsiveObj[key] !== undefined) {
        const cssValue = transform ? transform(responsiveObj[key] as T) : String(responsiveObj[key]);
        
        if (key === 'xs') {
          css += `${property}: ${cssValue};\n`;
        } else {
          const mediaQuery = generateMediaQuery('up', key);
          css += `@media ${mediaQuery} {\n  ${property}: ${cssValue};\n}\n`;
        }
      }
    });
    
    return css;
  }

  /**
   * 生成响应式样式对象
   * 基于统一断点系统
   */
  public generateResponsiveStyles<T>(
    styles: Record<string, ResponsiveValue<T>>,
    transform?: (val: T) => string
  ): Record<string, string> {
    const result: Record<string, string> = {};
    
    Object.entries(styles).forEach(([property, value]) => {
      result[property] = this.generateResponsiveCSS(property, value, transform);
    });
    
    return result;
  }

  /**
   * 获取当前断点
   * 基于统一断点系统
   */
  public getCurrentBreakpoint(width: number): BreakpointKey {
    const breakpointKeys = Object.keys(BREAKPOINTS) as BreakpointKey[];
    
    for (let i = breakpointKeys.length - 1; i >= 0; i--) {
      const bp = breakpointKeys[i];
      if (width >= BREAKPOINTS[bp]) {
        return bp;
      }
    }
    
    return 'xs';
  }

  /**
   * 检查是否匹配断点
   * 基于统一断点系统
   */
  public matchesBreakpoint(
    width: number,
    type: MediaQueryType,
    breakpoint: BreakpointKey,
    endBreakpoint?: BreakpointKey
  ): boolean {
    const bp = BREAKPOINTS[breakpoint];
    
    switch (type) {
      case 'up':
        return width >= bp;
      case 'down':
        return width < bp;
      case 'between': {
        if (!endBreakpoint) return false;
        const endBp = BREAKPOINTS[endBreakpoint];
        return width >= bp && width < endBp;
      }
      case 'only': {
        const breakpointKeys = Object.keys(BREAKPOINTS) as BreakpointKey[];
        const currentIndex = breakpointKeys.indexOf(breakpoint);
        const nextBreakpoint = breakpointKeys[currentIndex + 1];
        
        if (!nextBreakpoint) {
          return width >= bp;
        }
        
        const nextBp = BREAKPOINTS[nextBreakpoint];
        return width >= bp && width < nextBp;
      }
      default:
        return false;
    }
  }
}

// 全局响应式工具实例
// 基于统一断点系统
export const responsiveUtils = new ResponsiveStyleUtils();

// 导出新的工具函数和常量
export { BREAKPOINTS, generateMediaQuery, resolveResponsiveValue };
export type { BreakpointKey, MediaQueryType, ResponsiveValue };

/**
 * 使用窗口尺寸的钩子
 * @deprecated 请使用 ../hooks/useResponsive 中的 useWindowSize
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

/**
 * 使用断点的钩子
 * 基于统一断点系统
 */
export function useBreakpoint() {
  const { width } = useWindowSize();
  const utils = useMemo(() => new ResponsiveStyleUtils(), []);
  
  return useMemo(() => {
    return utils.getCurrentBreakpoint(width);
  }, [width, utils]);
}

/**
 * 使用响应式值的钩子
 * 基于统一断点系统
 */
export function useResponsiveValue<T>(value: ResponsiveValue<T>): T {
  const breakpoint = useBreakpoint();
  const utils = useMemo(() => new ResponsiveStyleUtils(), []);
  
  return useMemo(() => {
    return utils.resolveResponsiveValue(value, breakpoint);
  }, [value, breakpoint, utils]);
}

/**
 * 使用媒体查询的钩子
 * 基于统一断点系统
 */
export function useMediaQuery(
  type: MediaQueryType,
  breakpoint: BreakpointKey,
  endBreakpoint?: BreakpointKey
): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = generateMediaQuery(type, breakpoint, endBreakpoint);
    const mediaQueryList = window.matchMedia(mediaQuery);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    setMatches(mediaQueryList.matches);
    mediaQueryList.addEventListener('change', handleChange);
    
    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [type, breakpoint, endBreakpoint]);

  return matches;
}