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
 * 样式缓存项
 */
interface StyleCacheItem {
  /** 样式内容 */
  styles: string;
  /** 创建时间 */
  timestamp: number;
  /** 访问次数 */
  accessCount: number;
  /** 最后访问时间 */
  lastAccessed: number;
}

/**
 * 样式优化器配置
 */
export interface StyleOptimizerConfig {
  /** 缓存大小限制 */
  maxCacheSize?: number;
  /** 缓存过期时间（毫秒） */
  cacheExpiry?: number;
  /** 是否启用压缩 */
  enableCompression?: boolean;
  /** 是否启用去重 */
  enableDeduplication?: boolean;
  /** 是否启用预处理 */
  enablePreprocessing?: boolean;
}

/**
 * 样式计算优化器
 * 提供样式缓存、压缩、去重等优化功能
 */
export class StyleOptimizer {
  private cache = new Map<string, StyleCacheItem>();
  private config: Required<StyleOptimizerConfig>;
  private duplicateStyles = new Map<string, string>();
  private preprocessedStyles = new Map<string, string>();

  constructor(config: StyleOptimizerConfig = {}) {
    this.config = {
      maxCacheSize: 1000,
      cacheExpiry: 30 * 60 * 1000, // 30分钟
      enableCompression: true,
      enableDeduplication: true,
      enablePreprocessing: true,
      ...config
    };
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(componentType: string, config: ComponentStyleConfig, props: Record<string, unknown>): string {
    const configStr = JSON.stringify(config);
    const propsStr = JSON.stringify(props);
    return `${componentType}:${this.hashString(configStr + propsStr)}`;
  }

  /**
   * 字符串哈希函数
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 清理过期缓存
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.cache.forEach((item, key) => {
      if (now - item.timestamp > this.config.cacheExpiry) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.cache.delete(key));
  }

  /**
   * 清理最少使用的缓存项
   */
  private cleanLRUCache(): void {
    if (this.cache.size <= this.config.maxCacheSize) return;

    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => {
      // 按访问次数和最后访问时间排序
      const scoreA = a[1].accessCount * 0.7 + (Date.now() - a[1].lastAccessed) * 0.3;
      const scoreB = b[1].accessCount * 0.7 + (Date.now() - b[1].lastAccessed) * 0.3;
      return scoreB - scoreA;
    });

    // 删除最少使用的项
    const itemsToRemove = this.cache.size - this.config.maxCacheSize + 1;
    for (let i = 0; i < itemsToRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * 压缩CSS
   */
  private compressCSS(css: string): string {
    if (!this.config.enableCompression) return css;

    return css
      // 移除注释
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // 移除多余的空白字符
      .replace(/\s+/g, ' ')
      // 移除分号前的空格
      .replace(/\s*;\s*/g, ';')
      // 移除冒号前后的空格
      .replace(/\s*:\s*/g, ':')
      // 移除大括号前后的空格
      .replace(/\s*{\s*/g, '{')
      .replace(/\s*}\s*/g, '}')
      // 移除逗号后的空格
      .replace(/,\s*/g, ',')
      // 移除开头和结尾的空格
      .trim();
  }

  /**
   * 去重样式
   */
  private deduplicateStyles(css: string): string {
    if (!this.config.enableDeduplication) return css;

    const hash = this.hashString(css);
    if (this.duplicateStyles.has(hash)) {
      return this.duplicateStyles.get(hash)!;
    }

    // 解析CSS规则
    const rules = css.match(/[^{}]+{[^{}]*}/g) || [];
    const uniqueRules = new Map<string, string>();
    const processedRules: string[] = [];

    rules.forEach(rule => {
      const [selector, declarations] = rule.split('{');
      const cleanSelector = selector.trim();
      const cleanDeclarations = declarations.replace('}', '').trim();
      
      if (uniqueRules.has(cleanDeclarations)) {
        // 合并选择器
        const existingSelector = uniqueRules.get(cleanDeclarations)!;
        uniqueRules.set(cleanDeclarations, `${existingSelector}, ${cleanSelector}`);
      } else {
        uniqueRules.set(cleanDeclarations, cleanSelector);
      }
    });

    uniqueRules.forEach((selector, declarations) => {
      processedRules.push(`${selector} { ${declarations} }`);
    });

    const result = processedRules.join(' ');
    this.duplicateStyles.set(hash, result);
    return result;
  }

  /**
   * 预处理样式
   */
  private preprocessStyles(css: string): string {
    if (!this.config.enablePreprocessing) return css;

    const hash = this.hashString(css);
    if (this.preprocessedStyles.has(hash)) {
      return this.preprocessedStyles.get(hash)!;
    }

    let processed = css;

    // 处理CSS变量
    processed = processed.replace(/var\(--([^)]+)\)/g, (match, varName) => {
      // 这里可以添加CSS变量的处理逻辑
      void varName; // 标记变量已使用
      return match;
    });

    // 处理calc()函数
    processed = processed.replace(/calc\(([^)]+)\)/g, (match, expression) => {
      try {
        // 简单的数学表达式计算
        const result = this.evaluateCalcExpression(expression);
        return result !== null ? `${result}px` : match;
      } catch {
        return match;
      }
    });

    // 处理颜色值
    processed = this.optimizeColors(processed);

    this.preprocessedStyles.set(hash, processed);
    return processed;
  }

  /**
   * 计算calc表达式
   */
  private evaluateCalcExpression(expression: string): number | null {
    try {
      // 移除单位并计算
      const cleanExpression = expression
        .replace(/px|em|rem|%|vh|vw/g, '')
        .replace(/\s+/g, '');
      
      // 简单的四则运算
      if (/^[\d+\-*/().\s]+$/.test(cleanExpression)) {
        return eval(cleanExpression);
      }
    } catch {
      // 忽略错误
    }
    return null;
  }

  /**
   * 优化颜色值
   */
  private optimizeColors(css: string): string {
    // 将长颜色值转换为短颜色值
    css = css.replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3/g, '#$1$2$3');
    
    // 将rgb转换为hex（如果更短）
    css = css.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g, (match, r, g, b) => {
      const hex = '#' + 
        parseInt(r).toString(16).padStart(2, '0') +
        parseInt(g).toString(16).padStart(2, '0') +
        parseInt(b).toString(16).padStart(2, '0');
      return hex.length <= match.length ? hex : match;
    });

    return css;
  }

  /**
   * 获取优化后的样式
   */
  public getOptimizedStyles(
    componentType: string,
    config: ComponentStyleConfig,
    props: Record<string, unknown>,
    styleGenerator: () => string
  ): string {
    const cacheKey = this.generateCacheKey(componentType, config, props);
    
    // 检查缓存
    const cached = this.cache.get(cacheKey);
    if (cached) {
      cached.accessCount++;
      cached.lastAccessed = Date.now();
      return cached.styles;
    }

    // 生成样式
    let styles = styleGenerator();

    // 应用优化
    styles = this.preprocessStyles(styles);
    styles = this.deduplicateStyles(styles);
    styles = this.compressCSS(styles);

    // 缓存结果
    this.cache.set(cacheKey, {
      styles,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now()
    });

    // 清理缓存
    this.cleanExpiredCache();
    this.cleanLRUCache();

    return styles;
  }

  /**
   * 清除缓存
   */
  public clearCache(): void {
    this.cache.clear();
    this.duplicateStyles.clear();
    this.preprocessedStyles.clear();
  }

  /**
   * 获取缓存统计信息
   */
  public getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalAccess: number;
  } {
    const totalAccess = Array.from(this.cache.values())
      .reduce((sum, item) => sum + item.accessCount, 0);
    
    const hitRate = totalAccess > 0 ? (totalAccess - this.cache.size) / totalAccess : 0;

    return {
      size: this.cache.size,
      maxSize: this.config.maxCacheSize,
      hitRate,
      totalAccess
    };
  }

  /**
   * 预热缓存
   */
  public warmupCache(
    entries: Array<{
      componentType: string;
      config: ComponentStyleConfig;
      props: Record<string, unknown>;
      styleGenerator: () => string;
    }>
  ): void {
    entries.forEach(entry => {
      this.getOptimizedStyles(
        entry.componentType,
        entry.config,
        entry.props,
        entry.styleGenerator
      );
    });
  }
}

// 全局样式优化器实例
export const globalStyleOptimizer = new StyleOptimizer();

/**
 * 样式优化器钩子
 */
export const useStyleOptimizer = (config?: StyleOptimizerConfig) => {
  const optimizer = new StyleOptimizer(config);
  
  return {
    getOptimizedStyles: optimizer.getOptimizedStyles.bind(optimizer),
    clearCache: optimizer.clearCache.bind(optimizer),
    getCacheStats: optimizer.getCacheStats.bind(optimizer),
    warmupCache: optimizer.warmupCache.bind(optimizer)
  };
};

export default StyleOptimizer;