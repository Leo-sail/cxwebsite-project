/**
 * 主题系统核心服务
 * 提供主题管理的核心功能，基于ui_configs表实现
 */
import { supabase } from '../lib/supabase';
import type { UiConfig, UiConfigInsert, UiConfigUpdate } from '../types/database';

/**
 * 主题配置接口
 */
export interface ThemeConfiguration {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    sizes: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  components?: {
    [componentName: string]: {
      [variant: string]: {
        className?: string;
        style?: React.CSSProperties;
      };
    };
  };
}

/**
 * 页面样式配置接口
 */
export interface PageStyleConfiguration {
  id: string;
  pageName: string;
  styles: Record<string, any>;
}

/**
 * 组件样式配置接口
 */
export interface ComponentStyleConfiguration {
  id: string;
  componentName: string;
  styles: Record<string, any>;
}

/**
 * 主题缓存管理器
 */
class ThemeCache {
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
 * 主题数据访问对象
 */
export class ThemeDAO {
  /**
   * 获取活跃主题配置
   */
  static async findActiveTheme(): Promise<UiConfig | null> {
    try {
      const { data, error } = await supabase
        .from('ui_configs')
        .select('*')
        .eq('config_type', 'theme')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`获取活跃主题失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('ThemeDAO.findActiveTheme error:', error);
      throw error;
    }
  }

  /**
   * 获取所有主题配置
   */
  static async findAllThemes(): Promise<UiConfig[]> {
    try {
      const { data, error } = await supabase
        .from('ui_configs')
        .select('*')
        .eq('config_type', 'theme')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`获取主题列表失败: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('ThemeDAO.findAllThemes error:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取主题配置
   */
  static async findThemeById(id: string): Promise<UiConfig | null> {
    try {
      const { data, error } = await supabase
        .from('ui_configs')
        .select('*')
        .eq('id', id)
        .eq('config_type', 'theme')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`获取主题失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('ThemeDAO.findThemeById error:', error);
      throw error;
    }
  }

  /**
   * 创建主题配置
   */
  static async createTheme(theme: UiConfigInsert): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('ui_configs')
        .insert({ ...theme, config_type: 'theme' })
        .select('id')
        .single();

      if (error) {
        throw new Error(`创建主题失败: ${error.message}`);
      }

      return data.id;
    } catch (error) {
      console.error('ThemeDAO.createTheme error:', error);
      throw error;
    }
  }

  /**
   * 更新主题配置
   */
  static async updateTheme(id: string, updates: UiConfigUpdate): Promise<UiConfig> {
    try {
      const { data, error } = await supabase
        .from('ui_configs')
        .update(updates)
        .eq('id', id)
        .eq('config_type', 'theme')
        .select()
        .single();

      if (error) {
        throw new Error(`更新主题失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('ThemeDAO.updateTheme error:', error);
      throw error;
    }
  }

  /**
   * 删除主题配置
   */
  static async deleteTheme(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ui_configs')
        .delete()
        .eq('id', id)
        .eq('config_type', 'theme');

      if (error) {
        throw new Error(`删除主题失败: ${error.message}`);
      }
    } catch (error) {
      console.error('ThemeDAO.deleteTheme error:', error);
      throw error;
    }
  }

  /**
   * 设置活跃主题
   */
  static async setActiveTheme(id: string): Promise<void> {
    try {
      // 先将所有主题设为非活跃
      await supabase
        .from('ui_configs')
        .update({ is_active: false })
        .eq('config_type', 'theme');

      // 设置指定主题为活跃
      const { error } = await supabase
        .from('ui_configs')
        .update({ is_active: true })
        .eq('id', id)
        .eq('config_type', 'theme');

      if (error) {
        throw new Error(`设置活跃主题失败: ${error.message}`);
      }
    } catch (error) {
      console.error('ThemeDAO.setActiveTheme error:', error);
      throw error;
    }
  }

  /**
   * 获取页面样式配置
   */
  static async findPageStyles(pageName: string): Promise<UiConfig[]> {
    try {
      const { data, error } = await supabase
        .from('ui_configs')
        .select('*')
        .eq('config_type', 'page')
        .contains('page_scope', [pageName])
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        throw new Error(`获取页面样式失败: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('ThemeDAO.findPageStyles error:', error);
      throw error;
    }
  }

  /**
   * 获取组件样式配置
   */
  static async findComponentStyles(componentName: string): Promise<UiConfig[]> {
    try {
      const { data, error } = await supabase
        .from('ui_configs')
        .select('*')
        .eq('config_type', 'component')
        .eq('component_type', componentName)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        throw new Error(`获取组件样式失败: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('ThemeDAO.findComponentStyles error:', error);
      throw error;
    }
  }
}

/**
 * 主题服务类
 */
export class ThemeService {
  private static instance: ThemeService;
  private cache: ThemeCache;
  private listeners: Set<(theme: ThemeConfiguration) => void> = new Set();

  private constructor() {
    this.cache = new ThemeCache();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  /**
   * 获取活跃主题
   */
  async getActiveTheme(): Promise<ThemeConfiguration> {
    try {
      const cacheKey = 'active-theme';
      const cached = this.cache.get<ThemeConfiguration>(cacheKey);
      if (cached) {
        return cached;
      }

      const themeData = await ThemeDAO.findActiveTheme();
      if (!themeData) {
        const defaultTheme = this.getDefaultTheme();
        this.cache.set(cacheKey, defaultTheme);
        return defaultTheme;
      }

      const theme = this.parseThemeConfig(themeData.config_data);
      this.cache.set(cacheKey, theme);
      return theme;
    } catch (error) {
      console.error('ThemeService.getActiveTheme error:', error);
      return this.getDefaultTheme();
    }
  }

  /**
   * 获取所有主题
   */
  async getAllThemes(): Promise<UiConfig[]> {
    try {
      const cacheKey = 'all-themes';
      const cached = this.cache.get<UiConfig[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const themes = await ThemeDAO.findAllThemes();
      this.cache.set(cacheKey, themes);
      return themes;
    } catch (error) {
      console.error('ThemeService.getAllThemes error:', error);
      return [];
    }
  }

  /**
   * 根据ID获取主题
   */
  async getThemeById(id: string): Promise<UiConfig | null> {
    try {
      const cacheKey = `theme-${id}`;
      const cached = this.cache.get<UiConfig>(cacheKey);
      if (cached) {
        return cached;
      }

      const theme = await ThemeDAO.findThemeById(id);
      if (theme) {
        this.cache.set(cacheKey, theme);
      }
      return theme;
    } catch (error) {
      console.error('ThemeService.getThemeById error:', error);
      return null;
    }
  }

  /**
   * 创建主题
   */
  async createTheme(themeData: UiConfigInsert): Promise<string> {
    try {
      const themeId = await ThemeDAO.createTheme(themeData);
      this.clearCache();
      return themeId;
    } catch (error) {
      console.error('ThemeService.createTheme error:', error);
      throw error;
    }
  }

  /**
   * 更新主题
   */
  async updateTheme(id: string, updates: UiConfigUpdate): Promise<UiConfig> {
    try {
      const updatedTheme = await ThemeDAO.updateTheme(id, updates);
      this.clearCache();
      return updatedTheme;
    } catch (error) {
      console.error('ThemeService.updateTheme error:', error);
      throw error;
    }
  }

  /**
   * 删除主题
   */
  async deleteTheme(id: string): Promise<void> {
    try {
      await ThemeDAO.deleteTheme(id);
      this.clearCache();
    } catch (error) {
      console.error('ThemeService.deleteTheme error:', error);
      throw error;
    }
  }

  /**
   * 切换主题
   */
  async switchTheme(id: string): Promise<void> {
    try {
      await this.setActiveTheme(id);
      const newTheme = await this.getActiveTheme();
      this.notifyThemeUpdate(newTheme);
    } catch (error) {
      console.error('ThemeService.switchTheme error:', error);
      throw error;
    }
  }

  /**
   * 设置活跃主题
   */
  async setActiveTheme(id: string): Promise<void> {
    await ThemeDAO.setActiveTheme(id);
    this.clearCache();
  }

  /**
   * 获取页面样式
   */
  async getPageStyles(pageName: string): Promise<UiConfig[]> {
    try {
      const cacheKey = `page-styles-${pageName}`;
      const cached = this.cache.get<UiConfig[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const styles = await ThemeDAO.findPageStyles(pageName);
      this.cache.set(cacheKey, styles);
      return styles;
    } catch (error) {
      console.error('ThemeService.getPageStyles error:', error);
      return [];
    }
  }

  /**
   * 获取组件样式
   */
  async getComponentStyles(componentName: string): Promise<UiConfig[]> {
    try {
      const cacheKey = `component-styles-${componentName}`;
      const cached = this.cache.get<UiConfig[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const styles = await ThemeDAO.findComponentStyles(componentName);
      this.cache.set(cacheKey, styles);
      return styles;
    } catch (error) {
      console.error('ThemeService.getComponentStyles error:', error);
      return [];
    }
  }

  /**
   * 添加主题更新监听器
   */
  addThemeUpdateListener(listener: (theme: ThemeConfiguration) => void): void {
    this.listeners.add(listener);
  }

  /**
   * 移除主题更新监听器
   */
  removeThemeUpdateListener(listener: (theme: ThemeConfiguration) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * 主题变更回调
   */
  onThemeChange(callback: () => void): () => void {
    const listener = () => callback();
    this.addThemeUpdateListener(listener);
    
    // 返回取消监听的函数
    return () => {
      this.removeThemeUpdateListener(listener);
    };
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 解析主题配置
   */
  parseThemeConfig(configData: unknown): ThemeConfiguration {
    if (typeof configData === 'object' && configData !== null) {
      return {
        id: 'default',
        name: 'Default Theme',
        ...this.getDefaultTheme(),
        ...(configData as Partial<ThemeConfiguration>)
      };
    }
    return this.getDefaultTheme();
  }

  /**
   * 获取默认主题配置
   */
  private getDefaultTheme(): ThemeConfiguration {
    return {
      id: 'default',
      name: 'Default Theme',
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        accent: '#f59e0b',
        background: '#ffffff',
        text: '#1f2937',
        border: '#e5e7eb',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      },
      fonts: {
        primary: 'Inter, sans-serif',
        secondary: 'Georgia, serif',
        sizes: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem'
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem'
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
      }
    };
  }

  /**
   * 通知主题更新
   */
  private notifyThemeUpdate(theme: ThemeConfiguration): void {
    this.listeners.forEach(listener => {
      try {
        listener(theme);
      } catch (error) {
        console.error('Theme listener error:', error);
      }
    });
  }
}

// 导出单例实例
export const themeService = ThemeService.getInstance();