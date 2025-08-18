/**
 * 组件样式服务
 * 提供组件级别的样式管理功能
 */
import { supabase } from '../lib/supabase';
import type {
  ComponentStyle,
  ComponentStyleInsert,
  ComponentStyleUpdate
} from '../types/database';

/**
 * 组件样式配置接口
 */
export interface ComponentStyleConfiguration {
  base?: {
    display?: string;
    position?: string;
    width?: string;
    height?: string;
    padding?: string;
    margin?: string;
    border?: string;
    borderRadius?: string;
    background?: string;
    color?: string;
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    textAlign?: string;
    alignItems?: string;
    justifyContent?: string;
    flexDirection?: string;
    boxShadow?: string;
    transition?: string;
    cursor?: string;
  };
  hover?: {
    background?: string;
    color?: string;
    border?: string;
    borderColor?: string;
    boxShadow?: string;
    transform?: string;
    opacity?: string;
  };
  active?: {
    background?: string;
    color?: string;
    border?: string;
    borderColor?: string;
    boxShadow?: string;
    transform?: string;
  };
  focus?: {
    outline?: string;
    boxShadow?: string;
    border?: string;
    borderColor?: string;
    outlineOffset?: string;
  };
  disabled?: {
    background?: string;
    color?: string;
    border?: string;
    opacity?: string;
    cursor?: string;
  };
  loading?: {
    opacity?: string;
    cursor?: string;
    pointerEvents?: string;
  };
  variants?: {
    [variantName: string]: {
      [property: string]: string;
    };
  };
  responsive?: {
    mobile?: { [property: string]: string };
    tablet?: { [property: string]: string };
    desktop?: { [property: string]: string };
  };
  [key: string]: unknown;
}

/**
 * 组件样式缓存管理器
 */
class ComponentStyleCache {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟

  /**
   * 获取缓存数据
   */
  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * 设置缓存数据
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * 清除缓存
   */
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * 清除过期缓存
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * 组件样式数据访问对象
 */
export class ComponentStyleDAO {
  /**
   * 获取组件样式列表
   */
  static async findComponentStyles(
    themeId: string,
    componentName?: string,
    variantName?: string
  ): Promise<ComponentStyle[]> {
    try {
      let query = supabase
        .from('component_styles')
        .select('*')
        .eq('theme_id', themeId)
        .eq('is_active', true);

      if (componentName) {
        query = query.eq('component_name', componentName);
      }

      if (variantName) {
        query = query.eq('variant_name', variantName);
      }

      const { data, error } = await query.order('sort_order', { ascending: true });

      if (error) {
        throw new Error(`获取组件样式失败: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('ComponentStyleDAO.findComponentStyles error:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取组件样式
   */
  static async findComponentStyleById(id: string): Promise<ComponentStyle | null> {
    try {
      const { data, error } = await supabase
        .from('component_styles')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`获取组件样式失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('ComponentStyleDAO.findComponentStyleById error:', error);
      throw error;
    }
  }

  /**
   * 创建组件样式
   */
  static async createComponentStyle(componentStyle: ComponentStyleInsert): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('component_styles')
        .insert(componentStyle)
        .select('id')
        .single();

      if (error) {
        throw new Error(`创建组件样式失败: ${error.message}`);
      }

      return data.id;
    } catch (error) {
      console.error('ComponentStyleDAO.createComponentStyle error:', error);
      throw error;
    }
  }

  /**
   * 更新组件样式
   */
  static async updateComponentStyle(id: string, updates: ComponentStyleUpdate): Promise<ComponentStyle> {
    try {
      const { data, error } = await supabase
        .from('component_styles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`更新组件样式失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('ComponentStyleDAO.updateComponentStyle error:', error);
      throw error;
    }
  }

  /**
   * 删除组件样式
   */
  static async deleteComponentStyle(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('component_styles')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`删除组件样式失败: ${error.message}`);
      }
    } catch (error) {
      console.error('ComponentStyleDAO.deleteComponentStyle error:', error);
      throw error;
    }
  }

  /**
   * 批量更新组件样式排序
   */
  static async updateComponentStylesOrder(updates: { id: string; sort_order: number }[]): Promise<void> {
    try {
      const promises = updates.map(({ id, sort_order }) =>
        supabase
          .from('component_styles')
          .update({ sort_order, updated_at: new Date().toISOString() })
          .eq('id', id)
      );

      const results = await Promise.all(promises);
      
      for (const { error } of results) {
        if (error) {
          throw new Error(`更新组件样式排序失败: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('ComponentStyleDAO.updateComponentStylesOrder error:', error);
      throw error;
    }
  }

  /**
   * 切换组件样式激活状态
   */
  static async toggleComponentStyleActive(id: string, isActive: boolean): Promise<ComponentStyle> {
    try {
      const { data, error } = await supabase
        .from('component_styles')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`切换组件样式状态失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('ComponentStyleDAO.toggleComponentStyleActive error:', error);
      throw error;
    }
  }

  /**
   * 获取组件的所有变体
   */
  static async findComponentVariants(themeId: string, componentName: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('component_styles')
        .select('variant_name')
        .eq('theme_id', themeId)
        .eq('component_name', componentName)
        .eq('is_active', true);

      if (error) {
        throw new Error(`获取组件变体失败: ${error.message}`);
      }

      // 去重并过滤空值
      const variants = [...new Set(data?.map(item => item.variant_name).filter(Boolean))] as string[];
      return variants;
    } catch (error) {
      console.error('ComponentStyleDAO.findComponentVariants error:', error);
      throw error;
    }
  }

  /**
   * 获取主题下的所有组件名称
   */
  static async findThemeComponents(themeId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('component_styles')
        .select('component_name')
        .eq('theme_id', themeId)
        .eq('is_active', true);

      if (error) {
        throw new Error(`获取主题组件失败: ${error.message}`);
      }

      // 去重并过滤空值
      const components = [...new Set(data?.map(item => item.component_name).filter(Boolean))] as string[];
      return components;
    } catch (error) {
      console.error('ComponentStyleDAO.findThemeComponents error:', error);
      throw error;
    }
  }
}

/**
 * 组件样式服务类
 * 提供组件级别的样式管理功能
 */
export class ComponentStyleService {
  private static instance: ComponentStyleService;
  private cache: ComponentStyleCache;
  private listeners: Set<(componentName: string, styles: ComponentStyleConfiguration) => void> = new Set();

  private constructor() {
    this.cache = new ComponentStyleCache();
    // 定期清理过期缓存
    setInterval(() => {
      this.cache.clearExpired();
    }, 60000); // 每分钟清理一次
  }

  /**
   * 获取服务实例（单例模式）
   */
  static getInstance(): ComponentStyleService {
    if (!ComponentStyleService.instance) {
      ComponentStyleService.instance = new ComponentStyleService();
    }
    return ComponentStyleService.instance;
  }

  /**
   * 获取组件样式配置
   */
  async getComponentStyles(themeId: string, componentName: string): Promise<ComponentStyleConfiguration> {
    const cacheKey = `component-styles-${themeId}-${componentName}`;
    
    // 尝试从缓存获取
    const cached = this.cache.get<ComponentStyleConfiguration>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const componentStyles = await ComponentStyleDAO.findComponentStyles(themeId, componentName);
      const configuration = this.mergeComponentStyles(componentStyles);
      
      this.cache.set(cacheKey, configuration);
      return configuration;
    } catch (error) {
      console.error('获取组件样式失败:', error);
      // 返回默认配置作为降级方案
      const defaultConfig = this.getDefaultComponentStyles(componentName);
      this.cache.set(cacheKey, defaultConfig);
      return defaultConfig;
    }
  }

  /**
   * 获取组件变体样式
   */
  async getComponentVariantStyles(
    themeId: string,
    componentName: string,
    variantName: string
  ): Promise<ComponentStyleConfiguration> {
    const cacheKey = `variant-styles-${themeId}-${componentName}-${variantName}`;
    
    // 尝试从缓存获取
    const cached = this.cache.get<ComponentStyleConfiguration>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const variantStyles = await ComponentStyleDAO.findComponentStyles(themeId, componentName, variantName);
      const configuration = this.mergeComponentStyles(variantStyles);
      
      this.cache.set(cacheKey, configuration);
      return configuration;
    } catch (error) {
      console.error('获取组件变体样式失败:', error);
      return {};
    }
  }

  /**
   * 获取组件的所有变体
   */
  async getComponentVariants(themeId: string, componentName: string): Promise<string[]> {
    const cacheKey = `component-variants-${themeId}-${componentName}`;
    
    // 尝试从缓存获取
    const cached = this.cache.get<string[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const variants = await ComponentStyleDAO.findComponentVariants(themeId, componentName);
      this.cache.set(cacheKey, variants);
      return variants;
    } catch (error) {
      console.error('获取组件变体失败:', error);
      return [];
    }
  }

  /**
   * 获取主题下的所有组件
   */
  async getThemeComponents(themeId: string): Promise<string[]> {
    const cacheKey = `theme-components-${themeId}`;
    
    // 尝试从缓存获取
    const cached = this.cache.get<string[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const components = await ComponentStyleDAO.findThemeComponents(themeId);
      this.cache.set(cacheKey, components);
      return components;
    } catch (error) {
      console.error('获取主题组件失败:', error);
      return [];
    }
  }

  /**
   * 创建组件样式
   */
  async createComponentStyle(componentStyle: ComponentStyleInsert): Promise<string> {
    try {
      const styleId = await ComponentStyleDAO.createComponentStyle(componentStyle);
      
      // 清除相关缓存
      this.clearComponentCache(componentStyle.theme_id, componentStyle.component_name);
      
      return styleId;
    } catch (error) {
      console.error('创建组件样式失败:', error);
      throw error;
    }
  }

  /**
   * 更新组件样式
   */
  async updateComponentStyle(id: string, updates: ComponentStyleUpdate): Promise<ComponentStyle> {
    try {
      const updatedStyle = await ComponentStyleDAO.updateComponentStyle(id, updates);
      
      // 清除相关缓存
      this.clearComponentCache(updatedStyle.theme_id, updatedStyle.component_name);
      
      // 通知监听器
      if (updatedStyle.is_active) {
        const configuration = await this.getComponentStyles(updatedStyle.theme_id, updatedStyle.component_name);
        this.notifyComponentStyleUpdate(updatedStyle.component_name, configuration);
      }
      
      return updatedStyle;
    } catch (error) {
      console.error('更新组件样式失败:', error);
      throw error;
    }
  }

  /**
   * 删除组件样式
   */
  async deleteComponentStyle(id: string): Promise<void> {
    try {
      // 先获取样式信息用于清除缓存
      const style = await ComponentStyleDAO.findComponentStyleById(id);
      
      await ComponentStyleDAO.deleteComponentStyle(id);
      
      // 清除相关缓存
      if (style) {
        this.clearComponentCache(style.theme_id, style.component_name);
      }
    } catch (error) {
      console.error('删除组件样式失败:', error);
      throw error;
    }
  }

  /**
   * 批量更新组件样式排序
   */
  async updateComponentStylesOrder(updates: { id: string; sort_order: number }[]): Promise<void> {
    try {
      await ComponentStyleDAO.updateComponentStylesOrder(updates);
      
      // 清除所有组件样式缓存
      this.cache.clear();
    } catch (error) {
      console.error('更新组件样式排序失败:', error);
      throw error;
    }
  }

  /**
   * 切换组件样式激活状态
   */
  async toggleComponentStyleActive(id: string, isActive: boolean): Promise<ComponentStyle> {
    try {
      const updatedStyle = await ComponentStyleDAO.toggleComponentStyleActive(id, isActive);
      
      // 清除相关缓存
      this.clearComponentCache(updatedStyle.theme_id, updatedStyle.component_name);
      
      return updatedStyle;
    } catch (error) {
      console.error('切换组件样式状态失败:', error);
      throw error;
    }
  }

  /**
   * 生成CSS样式字符串
   */
  generateCSSStyles(styles: ComponentStyleConfiguration): string {
    const cssRules: string[] = [];
    
    // 基础样式
    if (styles.base) {
      const baseStyles = this.objectToCSSProperties(styles.base);
      if (baseStyles) {
        cssRules.push(baseStyles);
      }
    }
    
    // 伪类样式
    const pseudoClasses = ['hover', 'active', 'focus', 'disabled', 'loading'];
    pseudoClasses.forEach(pseudo => {
      if (styles[pseudo]) {
        const styleObj = styles[pseudo] as { [key: string]: string };
        const pseudoStyles = this.objectToCSSProperties(styleObj || {});
        if (pseudoStyles) {
          cssRules.push(`&:${pseudo} { ${pseudoStyles} }`);
        }
      }
    });
    
    // 响应式样式
    if (styles.responsive) {
      const breakpoints = {
        mobile: '@media (max-width: 768px)',
        tablet: '@media (min-width: 769px) and (max-width: 1024px)',
        desktop: '@media (min-width: 1025px)'
      };
      
      Object.entries(styles.responsive).forEach(([breakpoint, breakpointStyles]) => {
        if (breakpointStyles && breakpoints[breakpoint as keyof typeof breakpoints]) {
          const responsiveStyles = this.objectToCSSProperties(breakpointStyles);
          if (responsiveStyles) {
            cssRules.push(`${breakpoints[breakpoint as keyof typeof breakpoints]} { ${responsiveStyles} }`);
          }
        }
      });
    }
    
    return cssRules.join(' ');
  }

  /**
   * 添加组件样式更新监听器
   */
  addComponentStyleUpdateListener(
    listener: (componentName: string, styles: ComponentStyleConfiguration) => void
  ): void {
    this.listeners.add(listener);
  }

  /**
   * 移除组件样式更新监听器
   */
  removeComponentStyleUpdateListener(
    listener: (componentName: string, styles: ComponentStyleConfiguration) => void
  ): void {
    this.listeners.delete(listener);
  }

  /**
   * 清除所有缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 清除指定组件的缓存
   */
  private clearComponentCache(themeId: string, componentName: string): void {
    const patterns = [
      `component-styles-${themeId}-${componentName}`,
      `component-variants-${themeId}-${componentName}`,
      `theme-components-${themeId}`
    ];
    
    patterns.forEach(pattern => {
      this.cache.clear(pattern);
    });
    
    // 清除该组件所有变体的缓存
    for (const [key] of this.cache['cache']) {
      if (key.startsWith(`variant-styles-${themeId}-${componentName}-`)) {
        this.cache.clear(key);
      }
    }
  }

  /**
   * 合并组件样式配置
   */
  private mergeComponentStyles(componentStyles: ComponentStyle[]): ComponentStyleConfiguration {
    const configuration: ComponentStyleConfiguration = {};
    
    componentStyles.forEach(style => {
      try {
        const styleData = this.parseStyleData(style.style_data);
        
        if (style.variant_name) {
          // 变体样式
          if (!configuration.variants) {
            configuration.variants = {};
          }
          if (!configuration.variants[style.variant_name]) {
            configuration.variants[style.variant_name] = {};
          }
          Object.assign(configuration.variants[style.variant_name], styleData);
        } else {
          // 基础样式
          Object.assign(configuration, styleData);
        }
      } catch (error) {
        console.error('解析组件样式数据失败:', error, style);
      }
    });
    
    return configuration;
  }

  /**
   * 解析样式数据
   */
  private parseStyleData(styleData: unknown): Record<string, unknown> {
    try {
      if (typeof styleData === 'string') {
        return JSON.parse(styleData);
      }
      return (styleData || {}) as Record<string, unknown>;
    } catch (error) {
      console.error('解析样式数据失败:', error);
      return {};
    }
  }

  /**
   * 获取默认组件样式
   */
  private getDefaultComponentStyles(componentName: string): ComponentStyleConfiguration {
    const defaultStyles: { [key: string]: ComponentStyleConfiguration } = {
      Button: {
        base: {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 16px',
          border: '1px solid #d9d9d9',
          borderRadius: '6px',
          background: '#ffffff',
          color: '#262626',
          fontSize: '14px',
          fontWeight: '400',
          lineHeight: '1.5',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        },
        hover: {
          background: '#f5f5f5',
          borderColor: '#4096ff'
        },
        active: {
          background: '#e6f4ff',
          borderColor: '#1677ff'
        },
        disabled: {
          background: '#f5f5f5',
          color: '#bfbfbf',
          cursor: 'not-allowed',
          opacity: '0.6'
        }
      },
      Input: {
        base: {
          display: 'block',
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #d9d9d9',
          borderRadius: '6px',
          background: '#ffffff',
          color: '#262626',
          fontSize: '14px',
          lineHeight: '1.5',
          transition: 'all 0.2s ease'
        },
        focus: {
          borderColor: '#4096ff',
          boxShadow: '0 0 0 2px rgba(22, 119, 255, 0.1)'
        },
        disabled: {
          background: '#f5f5f5',
          color: '#bfbfbf',
          cursor: 'not-allowed'
        }
      },
      Card: {
        base: {
          background: '#ffffff',
          border: '1px solid #f0f0f0',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
        }
      }
    };
    
    return defaultStyles[componentName] || {
      base: {
        display: 'block'
      }
    };
  }

  /**
   * 将样式对象转换为CSS属性字符串
   */
  private objectToCSSProperties(styleObj: { [key: string]: string }): string {
    return Object.entries(styleObj)
      .map(([property, value]) => {
        // 将驼峰命名转换为短横线命名
        const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssProperty}: ${value};`;
      })
      .join(' ');
  }

  /**
   * 通知组件样式更新
   */
  private notifyComponentStyleUpdate(componentName: string, styles: ComponentStyleConfiguration): void {
    this.listeners.forEach(listener => {
      try {
        listener(componentName, styles);
      } catch (error) {
        console.error('组件样式更新监听器执行失败:', error);
      }
    });
  }
}

// 导出单例实例
export const componentStyleService = ComponentStyleService.getInstance();

// 导出类型
// export type { ComponentStyleConfiguration }; // 已在接口定义处导出