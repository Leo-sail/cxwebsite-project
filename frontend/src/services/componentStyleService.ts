/**
 * 组件样式服务
 * 提供组件级别的样式管理功能，基于ui_configs表实现
 */
import { supabase } from '../lib/supabase';
import type { UIConfig, UIConfigInsert, UIConfigUpdate } from '../types/database';

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
    this.cache.set(key, { data, timestamp: Date.now() });
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
    componentName?: string,
    variantName?: string
  ): Promise<UIConfig[]> {
    try {
      let query = supabase
        .from('ui_configs')
        .select('*')
        .eq('config_type', 'component')
        .eq('is_active', true);

      if (componentName) {
        query = query.eq('component_type', componentName);
      }

      if (variantName) {
        query = query.contains('config_data', { variant: variantName });
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
  static async findComponentStyleById(id: string): Promise<UIConfig | null> {
    try {
      const { data, error } = await supabase
        .from('ui_configs')
        .select('*')
        .eq('id', id)
        .eq('config_type', 'component')
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
  static async createComponentStyle(componentStyle: UIConfigInsert): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('ui_configs')
        .insert({ ...componentStyle, config_type: 'component' })
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
  static async updateComponentStyle(id: string, updates: UIConfigUpdate): Promise<UIConfig> {
    try {
      const { data, error } = await supabase
        .from('ui_configs')
        .update(updates)
        .eq('id', id)
        .eq('config_type', 'component')
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
        .from('ui_configs')
        .delete()
        .eq('id', id)
        .eq('config_type', 'component');

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
      for (const update of updates) {
        const { error } = await supabase
          .from('ui_configs')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id)
          .eq('config_type', 'component');

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
  static async toggleComponentStyleActive(id: string, isActive: boolean): Promise<UIConfig> {
    try {
      const { data, error } = await supabase
        .from('ui_configs')
        .update({ is_active: isActive })
        .eq('id', id)
        .eq('config_type', 'component')
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
   * 获取组件变体列表
   */
  static async findComponentVariants(componentName: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('ui_configs')
        .select('config_data')
        .eq('config_type', 'component')
        .eq('component_type', componentName)
        .eq('is_active', true);

      if (error) {
        throw new Error(`获取组件变体失败: ${error.message}`);
      }

      const variants = new Set<string>();
      data?.forEach(item => {
        const configData = item.config_data as any;
        if (configData?.variant) {
          variants.add(configData.variant);
        }
      });

      return Array.from(variants);
    } catch (error) {
      console.error('ComponentStyleDAO.findComponentVariants error:', error);
      return [];
    }
  }

  /**
   * 获取所有组件类型
   */
  static async findAllComponents(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('ui_configs')
        .select('component_type')
        .eq('config_type', 'component')
        .eq('is_active', true);

      if (error) {
        throw new Error(`获取组件列表失败: ${error.message}`);
      }

      const components = new Set<string>();
      data?.forEach(item => {
        if (item.component_type) {
          components.add(item.component_type);
        }
      });

      return Array.from(components);
    } catch (error) {
      console.error('ComponentStyleDAO.findAllComponents error:', error);
      return [];
    }
  }
}

/**
 * 组件样式服务类
 */
export class ComponentStyleService {
  private static instance: ComponentStyleService;
  private cache: ComponentStyleCache;
  private listeners: Set<(componentName: string, styles: ComponentStyleConfiguration) => void> = new Set();

  private constructor() {
    this.cache = new ComponentStyleCache();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): ComponentStyleService {
    if (!ComponentStyleService.instance) {
      ComponentStyleService.instance = new ComponentStyleService();
    }
    return ComponentStyleService.instance;
  }

  /**
   * 获取组件样式
   */
  async getComponentStyles(componentName: string): Promise<ComponentStyleConfiguration> {
    try {
      const cacheKey = `component-styles-${componentName}`;
      const cached = this.cache.get<ComponentStyleConfiguration>(cacheKey);
      if (cached) {
        return cached;
      }

      const componentStyles = await ComponentStyleDAO.findComponentStyles(componentName);
      const mergedStyles = this.mergeComponentStyles(componentStyles);
      
      this.cache.set(cacheKey, mergedStyles);
      return mergedStyles;
    } catch (error) {
      console.error('ComponentStyleService.getComponentStyles error:', error);
      return this.getDefaultComponentStyles(componentName);
    }
  }

  /**
   * 获取组件变体样式
   */
  async getComponentVariantStyles(
    componentName: string,
    variantName: string
  ): Promise<ComponentStyleConfiguration> {
    try {
      const cacheKey = `component-variant-${componentName}-${variantName}`;
      const cached = this.cache.get<ComponentStyleConfiguration>(cacheKey);
      if (cached) {
        return cached;
      }

      const componentStyles = await ComponentStyleDAO.findComponentStyles(componentName, variantName);
      const mergedStyles = this.mergeComponentStyles(componentStyles);
      
      this.cache.set(cacheKey, mergedStyles);
      return mergedStyles;
    } catch (error) {
      console.error('ComponentStyleService.getComponentVariantStyles error:', error);
      return this.getDefaultComponentStyles(componentName);
    }
  }

  /**
   * 获取组件变体列表
   */
  async getComponentVariants(componentName: string): Promise<string[]> {
    try {
      const cacheKey = `component-variants-${componentName}`;
      const cached = this.cache.get<string[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const variants = await ComponentStyleDAO.findComponentVariants(componentName);
      this.cache.set(cacheKey, variants);
      return variants;
    } catch (error) {
      console.error('ComponentStyleService.getComponentVariants error:', error);
      return [];
    }
  }

  /**
   * 获取所有组件
   */
  async getAllComponents(): Promise<string[]> {
    try {
      const cacheKey = 'all-components';
      const cached = this.cache.get<string[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const components = await ComponentStyleDAO.findAllComponents();
      this.cache.set(cacheKey, components);
      return components;
    } catch (error) {
      console.error('ComponentStyleService.getAllComponents error:', error);
      return [];
    }
  }

  /**
   * 创建组件样式
   */
  async createComponentStyle(componentStyle: UIConfigInsert): Promise<string> {
    try {
      const styleId = await ComponentStyleDAO.createComponentStyle(componentStyle);
      this.clearCache();
      return styleId;
    } catch (error) {
      console.error('ComponentStyleService.createComponentStyle error:', error);
      throw error;
    }
  }

  /**
   * 更新组件样式
   */
  async updateComponentStyle(id: string, updates: UIConfigUpdate): Promise<UIConfig> {
    try {
      const updatedStyle = await ComponentStyleDAO.updateComponentStyle(id, updates);
      this.clearCache();
      
      if (updatedStyle.component_type) {
        const styles = await this.getComponentStyles(updatedStyle.component_type);
        this.notifyComponentStyleUpdate(updatedStyle.component_type, styles);
      }
      
      return updatedStyle;
    } catch (error) {
      console.error('ComponentStyleService.updateComponentStyle error:', error);
      throw error;
    }
  }

  /**
   * 删除组件样式
   */
  async deleteComponentStyle(id: string): Promise<void> {
    try {
      // 先获取样式信息用于通知
      const style = await ComponentStyleDAO.findComponentStyleById(id);
      
      await ComponentStyleDAO.deleteComponentStyle(id);
      this.clearCache();
      
      if (style?.component_type) {
        const styles = await this.getComponentStyles(style.component_type);
        this.notifyComponentStyleUpdate(style.component_type, styles);
      }
    } catch (error) {
      console.error('ComponentStyleService.deleteComponentStyle error:', error);
      throw error;
    }
  }

  /**
   * 更新组件样式排序
   */
  async updateComponentStylesOrder(updates: { id: string; sort_order: number }[]): Promise<void> {
    try {
      await ComponentStyleDAO.updateComponentStylesOrder(updates);
      this.clearCache();
    } catch (error) {
      console.error('ComponentStyleService.updateComponentStylesOrder error:', error);
      throw error;
    }
  }

  /**
   * 切换组件样式激活状态
   */
  async toggleComponentStyleActive(id: string, isActive: boolean): Promise<UIConfig> {
    try {
      const updatedStyle = await ComponentStyleDAO.toggleComponentStyleActive(id, isActive);
      this.clearCache();
      
      if (updatedStyle.component_type) {
        const styles = await this.getComponentStyles(updatedStyle.component_type);
        this.notifyComponentStyleUpdate(updatedStyle.component_type, styles);
      }
      
      return updatedStyle;
    } catch (error) {
      console.error('ComponentStyleService.toggleComponentStyleActive error:', error);
      throw error;
    }
  }

  /**
   * 生成CSS样式字符串
   */
  generateCSSStyles(styles: ComponentStyleConfiguration): string {
    let cssString = '';
    
    // 基础样式
    if (styles.base) {
      cssString += this.objectToCSSProperties(styles.base);
    }
    
    // 伪类样式
    if (styles.hover) {
      cssString += '&:hover { ' + this.objectToCSSProperties(styles.hover) + ' }';
    }
    
    if (styles.active) {
      cssString += '&:active { ' + this.objectToCSSProperties(styles.active) + ' }';
    }
    
    if (styles.focus) {
      cssString += '&:focus { ' + this.objectToCSSProperties(styles.focus) + ' }';
    }
    
    if (styles.disabled) {
      cssString += '&:disabled { ' + this.objectToCSSProperties(styles.disabled) + ' }';
    }
    
    // 响应式样式
    if (styles.responsive) {
      if (styles.responsive.mobile) {
        cssString += '@media (max-width: 768px) { ' + this.objectToCSSProperties(styles.responsive.mobile) + ' }';
      }
      if (styles.responsive.tablet) {
        cssString += '@media (min-width: 769px) and (max-width: 1024px) { ' + this.objectToCSSProperties(styles.responsive.tablet) + ' }';
      }
      if (styles.responsive.desktop) {
        cssString += '@media (min-width: 1025px) { ' + this.objectToCSSProperties(styles.responsive.desktop) + ' }';
      }
    }
    
    return cssString;
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
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
  }



  /**
   * 合并组件样式
   */
  private mergeComponentStyles(componentStyles: UIConfig[]): ComponentStyleConfiguration {
    const mergedStyles: ComponentStyleConfiguration = {};
    
    componentStyles.forEach(style => {
      const styleData = this.parseStyleData(style.config_data);
      
      // 合并基础样式
      if (styleData.base) {
        mergedStyles.base = { ...mergedStyles.base, ...styleData.base };
      }
      
      // 合并伪类样式
      ['hover', 'active', 'focus', 'disabled', 'loading'].forEach(state => {
        if (styleData[state]) {
          const stateKey = state as keyof ComponentStyleConfiguration;
          const existingState = mergedStyles[stateKey] || {};
          mergedStyles[stateKey] = {
            ...existingState,
            ...styleData[state]
          } as any;
        }
      });
      
      // 合并变体样式
      if (styleData.variants) {
        mergedStyles.variants = { ...mergedStyles.variants, ...styleData.variants };
      }
      
      // 合并响应式样式
      if (styleData.responsive) {
        const responsiveData = styleData.responsive as any;
        mergedStyles.responsive = {
          mobile: { ...mergedStyles.responsive?.mobile, ...(responsiveData.mobile || {}) },
          tablet: { ...mergedStyles.responsive?.tablet, ...(responsiveData.tablet || {}) },
          desktop: { ...mergedStyles.responsive?.desktop, ...(responsiveData.desktop || {}) }
        };
      }
    });
    
    return mergedStyles;
  }

  /**
   * 解析样式数据
   */
  private parseStyleData(styleData: unknown): Record<string, unknown> {
    try {
      if (typeof styleData === 'string') {
        return JSON.parse(styleData);
      }
      if (typeof styleData === 'object' && styleData !== null) {
        return styleData as Record<string, unknown>;
      }
      return {};
    } catch (error) {
      console.error('解析样式数据失败:', error);
      return {};
    }
  }

  /**
   * 获取默认组件样式
   */
  private getDefaultComponentStyles(componentName: string): ComponentStyleConfiguration {
    const defaultStyles: Record<string, ComponentStyleConfiguration> = {
      button: {
        base: {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          borderRadius: '0.375rem',
          border: '1px solid transparent',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          background: '#3b82f6',
          color: '#ffffff'
        },
        hover: {
          background: '#2563eb'
        },
        active: {
          background: '#1d4ed8'
        },
        disabled: {
          opacity: '0.5',
          cursor: 'not-allowed'
        }
      },
      input: {
        base: {
          display: 'block',
          width: '100%',
          padding: '0.5rem 0.75rem',
          fontSize: '0.875rem',
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          background: '#ffffff',
          color: '#1f2937'
        },
        focus: {
          outline: 'none',
          borderColor: '#3b82f6',
          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
        },
        disabled: {
          background: '#f9fafb',
          color: '#6b7280',
          cursor: 'not-allowed'
        }
      },
      card: {
        base: {
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
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
        console.error('Component style listener error:', error);
      }
    });
  }
}

// 导出单例实例
export const componentStyleService = ComponentStyleService.getInstance();