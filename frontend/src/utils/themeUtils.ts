/**
 * 主题工具类
 * 提供主题相关的实用工具函数
 */
import type { ThemeConfiguration } from '../services/themeService';
import type { PageStyleConfiguration } from '../services/pageStyleService';
import type { ComponentStyleConfiguration } from '../services/componentStyleService';

/**
 * CSS变量生成器
 */
export class CSSVariableGenerator {
  /**
   * 从主题配置生成CSS变量
   */
  static generateThemeVariables(theme: ThemeConfiguration): string {
    const variables: string[] = [];
    
    // 颜色变量
    if (theme.colors) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        variables.push(`--color-${key}: ${value};`);
      });
    }
    
    // 字体变量
    if (theme.fonts) {
      if (theme.fonts.primary) {
        variables.push(`--font-primary: ${theme.fonts.primary};`);
      }
      if (theme.fonts.secondary) {
        variables.push(`--font-secondary: ${theme.fonts.secondary};`);
      }
      
      if (theme.fonts.sizes) {
        Object.entries(theme.fonts.sizes).forEach(([key, value]) => {
          variables.push(`--font-size-${key}: ${value};`);
        });
      }
    }
    
    // 间距变量
    if (theme.spacing) {
      Object.entries(theme.spacing).forEach(([key, value]) => {
        variables.push(`--spacing-${key}: ${value};`);
      });
    }
    
    // 圆角变量
    if (theme.borderRadius) {
      Object.entries(theme.borderRadius).forEach(([key, value]) => {
        variables.push(`--border-radius-${key}: ${value};`);
      });
    }
    
    // 阴影变量
    if (theme.shadows) {
      Object.entries(theme.shadows).forEach(([key, value]) => {
        variables.push(`--shadow-${key}: ${value};`);
      });
    }
    
    return `:root { ${variables.join(' ')} }`;
  }
  
  /**
   * 从页面样式配置生成CSS变量
   */
  static generatePageVariables(pageStyles: PageStyleConfiguration, pageName: string): string {
    const variables: string[] = [];
    
    Object.entries(pageStyles).forEach(([section, styles]) => {
      if (typeof styles === 'object' && styles !== null) {
        Object.entries(styles).forEach(([property, value]) => {
          if (typeof value === 'string') {
            variables.push(`--${pageName}-${section}-${property}: ${value};`);
          }
        });
      }
    });
    
    return variables.length > 0 ? `:root { ${variables.join(' ')} }` : '';
  }
  
  /**
   * 从组件样式配置生成CSS变量
   */
  static generateComponentVariables(componentStyles: ComponentStyleConfiguration, componentName: string): string {
    const variables: string[] = [];
    
    // 基础样式变量
    if (componentStyles.base) {
      Object.entries(componentStyles.base).forEach(([property, value]) => {
        variables.push(`--${componentName.toLowerCase()}-${property}: ${value};`);
      });
    }
    
    // 状态样式变量
    const states = ['hover', 'active', 'focus', 'disabled', 'loading'];
    states.forEach(state => {
      if (componentStyles[state]) {
        Object.entries(componentStyles[state]).forEach(([property, value]) => {
          variables.push(`--${componentName.toLowerCase()}-${state}-${property}: ${value};`);
        });
      }
    });
    
    return variables.length > 0 ? `:root { ${variables.join(' ')} }` : '';
  }
}

/**
 * 颜色工具类
 */
export class ColorUtils {
  /**
   * 将十六进制颜色转换为RGB
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  
  /**
   * 将RGB颜色转换为十六进制
   */
  static rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
  
  /**
   * 调整颜色亮度
   */
  static adjustBrightness(hex: string, percent: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;
    
    const adjust = (value: number) => {
      const adjusted = Math.round(value * (1 + percent / 100));
      return Math.max(0, Math.min(255, adjusted));
    };
    
    return this.rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
  }
  
  /**
   * 获取颜色的对比色（黑色或白色）
   */
  static getContrastColor(hex: string): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return '#000000';
    
    // 计算亮度
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  }
  
  /**
   * 生成颜色的透明度变体
   */
  static withOpacity(hex: string, opacity: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;
    
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  }
  
  /**
   * 生成颜色调色板
   */
  static generatePalette(baseColor: string): {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  } {
    return {
      50: this.adjustBrightness(baseColor, 80),
      100: this.adjustBrightness(baseColor, 60),
      200: this.adjustBrightness(baseColor, 40),
      300: this.adjustBrightness(baseColor, 20),
      400: this.adjustBrightness(baseColor, 10),
      500: baseColor,
      600: this.adjustBrightness(baseColor, -10),
      700: this.adjustBrightness(baseColor, -20),
      800: this.adjustBrightness(baseColor, -30),
      900: this.adjustBrightness(baseColor, -40)
    };
  }
}

/**
 * 响应式工具类
 * 基于统一断点系统，保持向后兼容性
 */
export class ResponsiveUtils {
  /**
   * 断点定义 - 保持向后兼容，映射到新的断点系统
   * @deprecated 请使用 BREAKPOINTS from '../config/breakpoints'
   */
  static readonly breakpoints = {
    mobile: 768,   // 对应新系统的 md
    tablet: 1024,  // 对应新系统的 lg
    desktop: 1200, // 对应新系统的 xl
    wide: 1600     // 对应新系统的 xxl+
  } as const;
  
  /**
   * 新断点系统映射
   * 提供从旧断点到新断点的映射关系
   */
  static readonly breakpointMapping = {
    mobile: 'md',   // 768px -> md (768px)
    tablet: 'lg',   // 1024px -> lg (992px)
    desktop: 'xl',  // 1200px -> xl (1200px)
    wide: 'xxl'     // 1600px -> xxl (1400px)
  } as const;
  
  /**
   * 生成媒体查询
   * @deprecated 请使用 generateMediaQuery from '../config/breakpoints'
   */
  static mediaQuery(breakpoint: keyof typeof ResponsiveUtils.breakpoints, type: 'min' | 'max' = 'min'): string {
    const size = this.breakpoints[breakpoint];
    return `@media (${type}-width: ${size}px)`;
  }
  
  /**
   * 检查当前屏幕尺寸
   * @deprecated 请使用 getCurrentBreakpoint from '../config/breakpoints'
   */
  static getCurrentBreakpoint(): keyof typeof ResponsiveUtils.breakpoints {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    
    if (width < this.breakpoints.mobile) return 'mobile';
    if (width < this.breakpoints.tablet) return 'tablet';
    if (width < this.breakpoints.desktop) return 'desktop';
    return 'wide';
  }
  
  /**
   * 监听屏幕尺寸变化
   * @deprecated 请使用新的 useResponsive Hook
   */
  static onBreakpointChange(callback: (breakpoint: keyof typeof ResponsiveUtils.breakpoints) => void): () => void {
    if (typeof window === 'undefined') return () => {};
    
    let currentBreakpoint = this.getCurrentBreakpoint();
    
    const handleResize = () => {
      const newBreakpoint = this.getCurrentBreakpoint();
      if (newBreakpoint !== currentBreakpoint) {
        currentBreakpoint = newBreakpoint;
        callback(newBreakpoint);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }
}

/**
 * 样式合并工具类
 */
export class StyleMerger {
  /**
   * 深度合并样式对象
   */
  static mergeStyles<T extends Record<string, unknown>>(...styles: (T | undefined)[]): T {
    const result = {} as T;
    
    styles.forEach(style => {
      if (style && typeof style === 'object') {
        Object.keys(style).forEach(key => {
          const value = style[key as keyof T];
          
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            result[key as keyof T] = this.mergeStyles(result[key as keyof T] || {}, value) as T[keyof T];
          } else {
            result[key as keyof T] = value;
          }
        });
      }
    });
    
    return result;
  }
  
  /**
   * 合并CSS类名
   */
  static mergeClassNames(...classNames: (string | undefined | null | false)[]): string {
    return classNames
      .filter(Boolean)
      .join(' ')
      .trim();
  }
  
  /**
   * 条件性应用样式
   */
  static conditionalStyles<T>(condition: boolean, trueStyles: T, falseStyles?: T): T | undefined {
    return condition ? trueStyles : falseStyles;
  }
}

/**
 * 主题验证工具类
 */
export class ThemeValidator {
  /**
   * 验证主题配置的完整性
   */
  static validateThemeConfig(theme: Partial<ThemeConfiguration>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // 检查必需的颜色
    const requiredColors = ['primary', 'background', 'text'] as const;
    if (!theme.colors) {
      errors.push('缺少颜色配置');
    } else {
      requiredColors.forEach(color => {
        if (!theme.colors![color as keyof typeof theme.colors]) {
          errors.push(`缺少必需的颜色: ${color}`);
        }
      });
    }
    
    // 检查字体配置
    if (!theme.fonts?.primary) {
      warnings.push('缺少主要字体配置');
    }
    
    // 检查间距配置
    if (!theme.spacing) {
      warnings.push('缺少间距配置');
    }
    
    // 验证颜色格式
    if (theme.colors) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        if (!this.isValidColor(value)) {
          errors.push(`无效的颜色格式: ${key} = ${value}`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * 验证颜色格式
   */
  static isValidColor(color: string): boolean {
    // 检查十六进制颜色
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      return true;
    }
    
    // 检查RGB/RGBA颜色
    if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[0-1]?(\.\d+)?)?\s*\)$/.test(color)) {
      return true;
    }
    
    // 检查HSL/HSLA颜色
    if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[0-1]?(\.\d+)?)?\s*\)$/.test(color)) {
      return true;
    }
    
    // 检查CSS颜色关键字
    const cssColors = [
      'transparent', 'currentColor', 'inherit', 'initial', 'unset',
      'black', 'white', 'red', 'green', 'blue', 'yellow', 'orange', 'purple',
      'pink', 'brown', 'gray', 'grey'
    ];
    
    return cssColors.includes(color.toLowerCase());
  }
  
  /**
   * 验证CSS单位
   */
  static isValidCSSUnit(value: string): boolean {
    return /^\d+(\.\d+)?(px|em|rem|%|vh|vw|vmin|vmax|ex|ch|cm|mm|in|pt|pc)$/.test(value) || value === '0';
  }
}

/**
 * 主题动画工具类
 */
export class ThemeAnimationUtils {
  /**
   * 创建主题切换动画
   */
  static createThemeTransition(duration: number = 300): string {
    const properties = [
      'background-color',
      'color',
      'border-color',
      'box-shadow',
      'fill',
      'stroke'
    ];
    
    return properties
      .map(prop => `${prop} ${duration}ms ease-in-out`)
      .join(', ');
  }
  
  /**
   * 应用主题切换动画到元素
   */
  static applyThemeTransition(element: HTMLElement, duration: number = 300): void {
    element.style.transition = this.createThemeTransition(duration);
  }
  
  /**
   * 批量应用主题切换动画
   */
  static applyThemeTransitionToAll(selector: string = '*', duration: number = 300): void {
    if (typeof document === 'undefined') return;
    
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      if (element instanceof HTMLElement) {
        this.applyThemeTransition(element, duration);
      }
    });
  }
  
  /**
   * 移除主题切换动画
   */
  static removeThemeTransition(element: HTMLElement): void {
    element.style.transition = '';
  }
}

/**
 * 主题存储工具类
 */
export class ThemeStorageUtils {
  private static readonly THEME_KEY = 'app-theme-preference';
  private static readonly THEME_CONFIG_KEY = 'app-theme-config';
  
  /**
   * 保存主题偏好到本地存储
   */
  static saveThemePreference(themeId: string): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      localStorage.setItem(this.THEME_KEY, themeId);
    } catch (error) {
      console.warn('无法保存主题偏好到本地存储:', error);
    }
  }
  
  /**
   * 从本地存储获取主题偏好
   */
  static getThemePreference(): string | null {
    if (typeof localStorage === 'undefined') return null;
    
    try {
      return localStorage.getItem(this.THEME_KEY);
    } catch (error) {
      console.warn('无法从本地存储获取主题偏好:', error);
      return null;
    }
  }
  
  /**
   * 缓存主题配置到本地存储
   */
  static cacheThemeConfig(themeId: string, config: ThemeConfiguration): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      const cacheData = {
        themeId,
        config,
        timestamp: Date.now()
      };
      localStorage.setItem(this.THEME_CONFIG_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('无法缓存主题配置:', error);
    }
  }
  
  /**
   * 从本地存储获取缓存的主题配置
   */
  static getCachedThemeConfig(themeId: string, maxAge: number = 5 * 60 * 1000): ThemeConfiguration | null {
    if (typeof localStorage === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem(this.THEME_CONFIG_KEY);
      if (!cached) return null;
      
      const cacheData = JSON.parse(cached);
      
      // 检查缓存是否过期
      if (Date.now() - cacheData.timestamp > maxAge) {
        localStorage.removeItem(this.THEME_CONFIG_KEY);
        return null;
      }
      
      // 检查主题ID是否匹配
      if (cacheData.themeId !== themeId) {
        return null;
      }
      
      return cacheData.config;
    } catch (error) {
      console.warn('无法获取缓存的主题配置:', error);
      return null;
    }
  }
  
  /**
   * 清除主题相关的本地存储
   */
  static clearThemeStorage(): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      localStorage.removeItem(this.THEME_KEY);
      localStorage.removeItem(this.THEME_CONFIG_KEY);
    } catch (error) {
      console.warn('无法清除主题存储:', error);
    }
  }
}