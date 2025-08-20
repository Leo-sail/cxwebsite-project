/**
 * 页面样式服务
 * 提供页面级别的样式管理功能
 */
import { supabase } from '../lib/supabase';
import type {
  UIConfig,
  UIConfigInsert,
  UIConfigUpdate
} from '../types/database';

/**
 * 页面样式配置接口
 */
export interface PageStyleConfiguration {
  layout: {
    maxWidth?: string;
    padding?: string;
    margin?: string;
    gap?: string;
    background?: string;
  };
  header?: {
    height?: string;
    background?: string;
    borderBottom?: string;
    position?: 'static' | 'sticky' | 'fixed';
    padding?: string;
  };
  footer?: {
    height?: string;
    background?: string;
    borderTop?: string;
    position?: 'static' | 'sticky' | 'fixed';
    color?: string;
    padding?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
  sidebar?: {
    width?: string;
    background?: string;
    border?: string;
    position?: 'static' | 'sticky' | 'fixed';
    padding?: string;
  };
  content?: {
    background?: string;
    padding?: string;
    borderRadius?: string;
    boxShadow?: string;
    minHeight?: string;
  };
  navigation?: {
    background?: string;
    activeColor?: string;
    hoverColor?: string;
    fontSize?: string;
  };
  hero?: {
    background?: string;
    minHeight?: string;
    textAlign?: 'left' | 'center' | 'right';
    padding?: string;
  };
  section?: {
    padding?: string;
    margin?: string;
    background?: string;
    borderRadius?: string;
  };
  [key: string]: unknown;
}

/**
 * 页面样式缓存管理器
 */
class PageStyleCache {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private readonly CACHE_DURATION = 3 * 60 * 1000; // 3分钟

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
 * 页面样式数据访问对象
 */
export class PageStyleDAO {
  /**
   * 获取页面样式列表
   */
  static async findPageStyles(
    themeId: string,
    pageName?: string,
    sectionName?: string
  ): Promise<UIConfig[]> {
    try {
      let query = supabase
        .from('ui_configs')
        .select('*')
        .eq('config_key', `theme_${themeId}`)
        .eq('config_type', 'page_style')
        .eq('is_active', true);

      if (pageName) {
        query = query.eq('component_type', pageName);
      }

      if (sectionName) {
        query = query.eq('config_name', sectionName);
      }

      const { data, error } = await query.order('sort_order', { ascending: true });

      if (error) {
        throw new Error(`获取页面样式失败: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('PageStyleDAO.findPageStyles error:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取页面样式
   */
  static async findPageStyleById(id: string): Promise<UIConfig | null> {
    try {
      const { data, error } = await supabase
        .from('ui_configs')
        .select('*')
        .eq('id', id)
        .eq('config_type', 'page_style')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`获取页面样式失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('PageStyleDAO.findPageStyleById error:', error);
      throw error;
    }
  }

  /**
   * 创建页面样式
   */
  static async createPageStyle(pageStyle: UIConfigInsert): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('ui_configs')
        .insert({
          ...pageStyle,
          config_type: 'page_style'
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`创建页面样式失败: ${error.message}`);
      }

      return data.id;
    } catch (error) {
      console.error('PageStyleDAO.createPageStyle error:', error);
      throw error;
    }
  }

  /**
   * 更新页面样式
   */
  static async updatePageStyle(id: string, updates: UIConfigUpdate): Promise<UIConfig> {
    try {
      const { data, error } = await supabase
        .from('ui_configs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('config_type', 'page_style')
        .select()
        .single();

      if (error) {
        throw new Error(`更新页面样式失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('PageStyleDAO.updatePageStyle error:', error);
      throw error;
    }
  }

  /**
   * 删除页面样式
   */
  static async deletePageStyle(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ui_configs')
        .delete()
        .eq('id', id)
        .eq('config_type', 'page_style');

      if (error) {
        throw new Error(`删除页面样式失败: ${error.message}`);
      }
    } catch (error) {
      console.error('PageStyleDAO.deletePageStyle error:', error);
      throw error;
    }
  }

  /**
   * 批量更新页面样式排序
   */
  static async updatePageStylesOrder(updates: { id: string; sort_order: number }[]): Promise<void> {
    try {
      const promises = updates.map(({ id, sort_order }) =>
        supabase
          .from('ui_configs')
          .update({ sort_order, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('config_type', 'page_style')
      );

      const results = await Promise.all(promises);
      
      for (const { error } of results) {
        if (error) {
          throw new Error(`更新页面样式排序失败: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('PageStyleDAO.updatePageStylesOrder error:', error);
      throw error;
    }
  }

  /**
   * 切换页面样式激活状态
   */
  static async togglePageStyleActive(id: string, isActive: boolean): Promise<UIConfig> {
    try {
      const { data, error } = await supabase
        .from('ui_configs')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('config_type', 'page_style')
        .select()
        .single();

      if (error) {
        throw new Error(`切换页面样式状态失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('PageStyleDAO.togglePageStyleActive error:', error);
      throw error;
    }
  }

  /**
   * 获取页面的所有区域样式
   */
  static async findPageSections(themeId: string, pageName: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('ui_configs')
        .select('config_name')
        .eq('config_key', `theme_${themeId}`)
        .eq('component_type', pageName)
        .eq('config_type', 'page_style')
        .eq('is_active', true);

      if (error) {
        throw new Error(`获取页面区域失败: ${error.message}`);
      }

      // 去重并过滤空值
      const sections = [...new Set(data?.map(item => item.config_name).filter(Boolean))] as string[];
      return sections;
    } catch (error) {
      console.error('PageStyleDAO.findPageSections error:', error);
      throw error;
    }
  }
}

/**
 * 页面样式服务类
 * 提供页面级别的样式管理功能
 */
export class PageStyleService {
  private static instance: PageStyleService;
  private cache: PageStyleCache;
  private listeners: Set<(pageName: string, styles: PageStyleConfiguration) => void> = new Set();

  private constructor() {
    this.cache = new PageStyleCache();
    // 定期清理过期缓存
    setInterval(() => {
      this.cache.clearExpired();
    }, 60000); // 每分钟清理一次
  }

  /**
   * 获取服务实例（单例模式）
   */
  static getInstance(): PageStyleService {
    if (!PageStyleService.instance) {
      PageStyleService.instance = new PageStyleService();
    }
    return PageStyleService.instance;
  }

  /**
   * 获取页面样式配置
   */
  async getPageStyles(themeId: string, pageName: string): Promise<PageStyleConfiguration> {
    const cacheKey = `page-styles-${themeId}-${pageName}`;
    
    // 尝试从缓存获取
    const cached = this.cache.get<PageStyleConfiguration>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const pageStyles = await PageStyleDAO.findPageStyles(themeId, pageName);
      const configuration = this.mergePageStyles(pageStyles);
      
      this.cache.set(cacheKey, configuration);
      return configuration;
    } catch (error) {
      console.error('获取页面样式失败:', error);
      // 返回默认配置作为降级方案
      const defaultConfig = this.getDefaultPageStyles();
      this.cache.set(cacheKey, defaultConfig);
      return defaultConfig;
    }
  }

  /**
   * 获取页面区域样式
   */
  async getPageSectionStyles(
    themeId: string,
    pageName: string,
    sectionName: string
  ): Promise<PageStyleConfiguration> {
    const cacheKey = `section-styles-${themeId}-${pageName}-${sectionName}`;
    
    // 尝试从缓存获取
    const cached = this.cache.get<PageStyleConfiguration>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const sectionStyles = await PageStyleDAO.findPageStyles(themeId, pageName, sectionName);
      const configuration = this.mergePageStyles(sectionStyles);
      
      this.cache.set(cacheKey, configuration);
      return configuration;
    } catch (error) {
      console.error('获取页面区域样式失败:', error);
      return { layout: {} };
    }
  }

  /**
   * 获取页面的所有区域
   */
  async getPageSections(themeId: string, pageName: string): Promise<string[]> {
    const cacheKey = `page-sections-${themeId}-${pageName}`;
    
    // 尝试从缓存获取
    const cached = this.cache.get<string[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const sections = await PageStyleDAO.findPageSections(themeId, pageName);
      this.cache.set(cacheKey, sections);
      return sections;
    } catch (error) {
      console.error('获取页面区域失败:', error);
      return [];
    }
  }

  /**
   * 创建页面样式
   */
  async createPageStyle(pageStyle: UIConfigInsert): Promise<string> {
    try {
      const styleId = await PageStyleDAO.createPageStyle(pageStyle);
      
      // 清除相关缓存
      this.clearPageCache(pageStyle.config_key?.replace('theme_', '') || '', pageStyle.component_type || '');
      
      return styleId;
    } catch (error) {
      console.error('创建页面样式失败:', error);
      throw error;
    }
  }

  /**
   * 更新页面样式
   */
  async updatePageStyle(id: string, updates: UIConfigUpdate): Promise<UIConfig> {
    try {
      const updatedStyle = await PageStyleDAO.updatePageStyle(id, updates);
      
      // 清除相关缓存
      const themeId = updatedStyle.config_key?.replace('theme_', '') || '';
      const pageName = updatedStyle.component_type || '';
      this.clearPageCache(themeId, pageName);
      
      // 通知监听器
      if (updatedStyle.is_active) {
        const configuration = await this.getPageStyles(themeId, pageName);
        this.notifyPageStyleUpdate(pageName, configuration);
      }
      
      return updatedStyle;
    } catch (error) {
      console.error('更新页面样式失败:', error);
      throw error;
    }
  }

  /**
   * 删除页面样式
   */
  async deletePageStyle(id: string): Promise<void> {
    try {
      // 先获取样式信息用于清除缓存
      const style = await PageStyleDAO.findPageStyleById(id);
      
      await PageStyleDAO.deletePageStyle(id);
      
      // 清除相关缓存
      if (style) {
        const themeId = style.config_key?.replace('theme_', '') || '';
        const pageName = style.component_type || '';
        this.clearPageCache(themeId, pageName);
      }
    } catch (error) {
      console.error('删除页面样式失败:', error);
      throw error;
    }
  }

  /**
   * 批量更新页面样式排序
   */
  async updatePageStylesOrder(updates: { id: string; sort_order: number }[]): Promise<void> {
    try {
      await PageStyleDAO.updatePageStylesOrder(updates);
      
      // 清除所有页面样式缓存
      this.cache.clear();
    } catch (error) {
      console.error('更新页面样式排序失败:', error);
      throw error;
    }
  }

  /**
   * 切换页面样式激活状态
   */
  async togglePageStyleActive(id: string, isActive: boolean): Promise<UIConfig> {
    try {
      const updatedStyle = await PageStyleDAO.togglePageStyleActive(id, isActive);
      
      // 清除相关缓存
      const themeId = updatedStyle.config_key?.replace('theme_', '') || '';
      const pageName = updatedStyle.component_type || '';
      this.clearPageCache(themeId, pageName);
      
      return updatedStyle;
    } catch (error) {
      console.error('切换页面样式状态失败:', error);
      throw error;
    }
  }

  /**
   * 添加页面样式更新监听器
   */
  addPageStyleUpdateListener(
    listener: (pageName: string, styles: PageStyleConfiguration) => void
  ): void {
    this.listeners.add(listener);
  }

  /**
   * 移除页面样式更新监听器
   */
  removePageStyleUpdateListener(
    listener: (pageName: string, styles: PageStyleConfiguration) => void
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
   * 清除指定页面的缓存
   */
  private clearPageCache(themeId: string, pageName: string): void {
    const patterns = [
      `page-styles-${themeId}-${pageName}`,
      `page-sections-${themeId}-${pageName}`
    ];
    
    patterns.forEach(pattern => {
      this.cache.clear(pattern);
    });
    
    // 清除该页面所有区域的缓存
    for (const [key] of this.cache['cache']) {
      if (key.startsWith(`section-styles-${themeId}-${pageName}-`)) {
        this.cache.clear(key);
      }
    }
  }

  /**
   * 合并页面样式配置
   */
  private mergePageStyles(pageStyles: UIConfig[]): PageStyleConfiguration {
    const configuration: PageStyleConfiguration = {
      layout: {}
    };
    
    pageStyles.forEach(style => {
      try {
        const styleData = this.parseStyleData(style.config_value);
        
        if (style.config_name) {
          // 区域级样式
          if (!configuration[style.config_name]) {
            configuration[style.config_name] = {};
          }
          Object.assign(configuration[style.config_name] as Record<string, unknown>, styleData);
        } else {
          // 页面级样式
          Object.assign(configuration, styleData);
        }
      } catch (error) {
        console.error('解析页面样式数据失败:', error, style);
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
      return (styleData as Record<string, unknown>) || {};
    } catch (error) {
      console.error('解析样式数据失败:', error);
      return {} as Record<string, unknown>;
    }
  }

  /**
   * 获取默认页面样式
   */
  private getDefaultPageStyles(): PageStyleConfiguration {
    return {
      layout: {
        maxWidth: '1200px',
        padding: '0 1rem',
        margin: '0 auto',
        gap: '1rem'
      },
      header: {
        height: '64px',
        background: '#ffffff',
        borderBottom: '1px solid #e8e8e8',
        position: 'sticky'
      },
      footer: {
        background: '#f5f5f5',
        borderTop: '1px solid #e8e8e8',
        position: 'static'
      },
      content: {
        background: '#ffffff',
        padding: '1rem',
        borderRadius: '8px'
      },
      navigation: {
        background: 'transparent',
        activeColor: '#1677ff',
        hoverColor: '#4096ff',
        fontSize: '14px'
      },
      section: {
        padding: '2rem 0',
        margin: '0',
        background: 'transparent'
      }
    };
  }

  /**
   * 通知页面样式更新
   */
  private notifyPageStyleUpdate(pageName: string, styles: PageStyleConfiguration): void {
    this.listeners.forEach(listener => {
      try {
        listener(pageName, styles);
      } catch (error) {
        console.error('页面样式更新监听器执行失败:', error);
      }
    });
  }
}

// 导出单例实例
export const pageStyleService = PageStyleService.getInstance();

// 导出类型
// export type { PageStyleConfiguration }; // 已在接口定义处导出