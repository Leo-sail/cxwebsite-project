import { type ResponsiveValue } from './responsive';
import { resolveResponsiveValue } from '../config/breakpoints';

/**
 * 组件样式配置接口
 */
export interface ComponentStyleConfig {
  base?: string;
  variants?: {
    [key: string]: {
      [value: string]: string;
    };
  };
  compoundVariants?: Array<{
    [key: string]: string | string[];
    class: string;
  }>;
  defaultVariants?: {
    [key: string]: string;
  };
}

/**
 * 变体定义
 */
export interface VariantDefinition {
  /** 变体名称 */
  name: string;
  /** 变体样式 */
  styles: Record<string, unknown>;
  /** 变体条件 */
  conditions?: {
    /** 状态条件 */
    state?: string[];
    /** 属性条件 */
    props?: Record<string, unknown>;
    /** 媒体查询条件 */
    media?: string;
    /** 自定义条件函数 */
    custom?: (props: Record<string, unknown>, state: Record<string, unknown>) => boolean;
  };
  /** 变体优先级 */
  priority?: number;
}

/**
 * 组件变体配置
 */
export interface ComponentVariantConfig {
  /** 基础样式 */
  base?: Record<string, unknown>;
  /** 变体列表 */
  variants?: VariantDefinition[];
  /** 默认变体 */
  defaultVariant?: string;
  /** 复合变体（多个变体组合） */
  compoundVariants?: {
    /** 变体组合条件 */
    conditions: Record<string, unknown>;
    /** 组合样式 */
    styles: Record<string, unknown>;
    /** 优先级 */
    priority?: number;
  }[];
  /** 响应式变体 */
  responsiveVariants?: Record<string, ResponsiveValue<string>>;
}

/**
 * 变体解析结果
 */
export interface VariantResolution {
  /** 应用的变体名称 */
  appliedVariants: string[];
  /** 合并后的样式 */
  styles: Record<string, unknown>;
  /** 生成的CSS类名 */
  className: string;
  /** 内联样式 */
  inlineStyles: Record<string, unknown>;
}

/**
 * 变体管理器配置
 */
export interface VariantManagerConfig {
  /** 类名前缀 */
  classPrefix?: string;
  /** 是否启用缓存 */
  enableCache?: boolean;
  /** 样式生成策略 */
  styleStrategy?: 'css-in-js' | 'css-modules' | 'styled-components';
}

/**
 * 组件变体管理器
 * 负责管理组件的不同变体和状态样式
 */
export class VariantManager {
  private config: Required<VariantManagerConfig>;
  private cache = new Map<string, VariantResolution>();
  private styleSheet: CSSStyleSheet | null = null;
  private generatedClasses = new Set<string>();

  constructor(config: VariantManagerConfig = {}) {
    this.config = {
      classPrefix: 'variant',
      enableCache: true,
      styleStrategy: 'css-in-js',
      ...config
    };

    this.initializeStyleSheet();
  }

  /**
   * 初始化样式表
   */
  private initializeStyleSheet(): void {
    if (typeof document === 'undefined') return;

    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-variant-manager', 'true');
    document.head.appendChild(styleElement);
    this.styleSheet = styleElement.sheet;
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(
    componentName: string,
    props: Record<string, unknown>,
    state: Record<string, unknown>
  ): string {
    const propsStr = JSON.stringify(props);
    const stateStr = JSON.stringify(state);
    return `${componentName}:${this.hashString(propsStr + stateStr)}`;
  }

  /**
   * 字符串哈希函数
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 检查变体条件
   */
  private checkVariantConditions(
    variant: VariantDefinition,
    props: Record<string, unknown>,
    state: Record<string, unknown>
  ): boolean {
    if (!variant.conditions) return true;

    const { state: stateConditions, props: propsConditions, media, custom } = variant.conditions;

    // 检查状态条件
    if (stateConditions) {
      const hasRequiredState = stateConditions.every(stateName => state[stateName]);
      if (!hasRequiredState) return false;
    }

    // 检查属性条件
    if (propsConditions) {
      const hasRequiredProps = Object.entries(propsConditions).every(
        ([key, value]) => props[key] === value
      );
      if (!hasRequiredProps) return false;
    }

    // 检查媒体查询条件
    if (media && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia(media);
      if (!mediaQuery.matches) return false;
    }

    // 检查自定义条件
    if (custom) {
      if (!custom(props, state)) return false;
    }

    return true;
  }

  /**
   * 解析响应式变体
   */
  private resolveResponsiveVariants(
    responsiveVariants: Record<string, ResponsiveValue<string>>,
    currentBreakpoint: string
  ): string[] {
    const resolvedVariants: string[] = [];

    Object.entries(responsiveVariants).forEach(([, value]) => {
      const resolvedValue = resolveResponsiveValue(
        value,
        currentBreakpoint as 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
      );
      if (resolvedValue) {
        resolvedVariants.push(resolvedValue);
      }
    });

    return resolvedVariants;
  }

  /**
   * 合并样式
   */
  private mergeStyles(...styles: Record<string, unknown>[]): Record<string, unknown> {
    const merged: Record<string, unknown> = {};

    styles.forEach(style => {
      if (!style) return;
      
      Object.entries(style).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          merged[key] = this.mergeStyles(
            (merged[key] as Record<string, unknown>) || {}, 
            value as Record<string, unknown>
          );
        } else {
          merged[key] = value;
        }
      });
    });

    return merged;
  }

  /**
   * 生成CSS类名
   */
  private generateClassName(componentName: string, variantNames: string[]): string {
    const baseClass = `${this.config.classPrefix}-${componentName}`;
    const variantClasses = variantNames.map(name => `${baseClass}--${name}`);
    return [baseClass, ...variantClasses].join(' ');
  }

  /**
   * 将样式对象转换为CSS字符串
   */
  private stylesToCSS(styles: Record<string, unknown>, selector: string): string {
    const cssRules: string[] = [];
    
    const processStyles = (obj: Record<string, unknown>, currentSelector: string) => {
      const declarations: string[] = [];
      const nestedRules: string[] = [];

      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // 处理嵌套选择器
          const nestedSelector = key.startsWith('&') 
            ? key.replace('&', currentSelector)
            : `${currentSelector} ${key}`;
          nestedRules.push(...processStyles(value as Record<string, unknown>, nestedSelector));
        } else {
          // 转换驼峰命名为短横线命名
          const cssProperty = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          declarations.push(`  ${cssProperty}: ${value};`);
        }
      });

      if (declarations.length > 0) {
        cssRules.push(`${currentSelector} {\n${declarations.join('\n')}\n}`);
      }

      return [...cssRules, ...nestedRules];
    };

    return processStyles(styles, selector).join('\n');
  }

  /**
   * 注入CSS到样式表
   */
  private injectCSS(css: string): void {
    if (!this.styleSheet) return;

    try {
      this.styleSheet.insertRule(css, this.styleSheet.cssRules.length);
    } catch (error) {
      console.warn('Failed to inject CSS rule:', error);
    }
  }

  /**
   * 分离内联样式和CSS类样式
   */
  private separateStyles(styles: Record<string, unknown>): {
    cssStyles: Record<string, unknown>;
    inlineStyles: Record<string, unknown>;
  } {
    const cssStyles: Record<string, unknown> = {};
    const inlineStyles: Record<string, unknown> = {};

    Object.entries(styles).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // 嵌套样式放入CSS类
        cssStyles[key] = value;
      } else if (key.startsWith('&') || key.includes(':')) {
        // 伪类和伪元素放入CSS类
        cssStyles[key] = value;
      } else {
        // 简单样式可以作为内联样式
        inlineStyles[key] = value;
      }
    });

    return { cssStyles, inlineStyles };
  }

  /**
   * 解析组件变体
   */
  public resolveVariants(
    componentName: string,
    variantConfig: ComponentVariantConfig,
    props: Record<string, unknown> = {},
    state: Record<string, unknown> = {},
    currentBreakpoint?: string
  ): VariantResolution {
    const cacheKey = this.generateCacheKey(componentName, props, state);
    
    // 检查缓存
    if (this.config.enableCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const appliedVariants: string[] = [];
    const stylesToMerge: Record<string, unknown>[] = [];

    // 添加基础样式
    if (variantConfig.base) {
      stylesToMerge.push(variantConfig.base);
    }

    // 解析响应式变体
    if (variantConfig.responsiveVariants && currentBreakpoint) {
      const responsiveVariants = this.resolveResponsiveVariants(
        variantConfig.responsiveVariants,
        currentBreakpoint
      );
      appliedVariants.push(...responsiveVariants);
    }

    // 解析普通变体
    if (variantConfig.variants) {
      const matchingVariants = variantConfig.variants
        .filter(variant => this.checkVariantConditions(variant, props, state))
        .sort((a, b) => (a.priority || 0) - (b.priority || 0));

      matchingVariants.forEach(variant => {
        appliedVariants.push(variant.name);
        stylesToMerge.push(variant.styles);
      });
    }

    // 解析复合变体
    if (variantConfig.compoundVariants) {
      const matchingCompoundVariants = variantConfig.compoundVariants
        .filter(compound => {
          return Object.entries(compound.conditions).every(
            ([key, value]) => props[key] === value
          );
        })
        .sort((a, b) => (a.priority || 0) - (b.priority || 0));

      matchingCompoundVariants.forEach(compound => {
        stylesToMerge.push(compound.styles);
      });
    }

    // 应用默认变体（如果没有其他变体匹配）
    if (appliedVariants.length === 0 && variantConfig.defaultVariant) {
      appliedVariants.push(variantConfig.defaultVariant);
      const defaultVariant = variantConfig.variants?.find(
        v => v.name === variantConfig.defaultVariant
      );
      if (defaultVariant) {
        stylesToMerge.push(defaultVariant.styles);
      }
    }

    // 合并所有样式
    const mergedStyles = this.mergeStyles(...stylesToMerge);
    
    // 生成类名
    const className = this.generateClassName(componentName, appliedVariants);
    
    // 分离样式
    const { cssStyles, inlineStyles } = this.separateStyles(mergedStyles);
    
    // 生成CSS（如果有CSS样式）
    if (Object.keys(cssStyles).length > 0 && !this.generatedClasses.has(className)) {
      const css = this.stylesToCSS(cssStyles, `.${className.replace(/ /g, '.')}`);
      this.injectCSS(css);
      this.generatedClasses.add(className);
    }

    const result: VariantResolution = {
      appliedVariants,
      styles: mergedStyles,
      className,
      inlineStyles
    };

    // 缓存结果
    if (this.config.enableCache) {
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  /**
   * 清除缓存
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存统计
   */
  public getCacheStats(): {
    size: number;
    generatedClasses: number;
  } {
    return {
      size: this.cache.size,
      generatedClasses: this.generatedClasses.size
    };
  }

  /**
   * 注册全局变体
   */
  public registerGlobalVariant(
    componentName: string,
    variant: VariantDefinition
  ): void {
    // 这里可以实现全局变体注册逻辑
    // 例如存储到全局注册表中
    console.log(`Registering global variant for ${componentName}:`, variant.name);
  }
}

// 全局变体管理器实例
export const globalVariantManager = new VariantManager();

/**
 * 变体管理器钩子
 */
export const useVariantManager = (config?: VariantManagerConfig) => {
  const manager = new VariantManager(config);
  
  return {
    resolveVariants: manager.resolveVariants.bind(manager),
    clearCache: manager.clearCache.bind(manager),
    getCacheStats: manager.getCacheStats.bind(manager),
    registerGlobalVariant: manager.registerGlobalVariant.bind(manager)
  };
};

export default VariantManager;