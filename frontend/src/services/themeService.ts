/**
 * 主题系统核心服务
 * 提供主题管理的核心功能，包括主题加载、缓存、更新等
 */
import { supabase } from '../lib/supabase';
import type {
  ThemeConfig,
  ThemeConfigInsert,
  ThemeConfigUpdate,
  PageStyle,
  ComponentStyle
} from '../types/database';

/**
 * 主题配置接口
 */
export interface ThemeConfiguration {
  id: string;
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
 * 主题数据访问对象
 */
export class ThemeDAO {
  /**
   * 获取活跃主题
   */
  static async findActiveTheme(): Promise<ThemeConfig | null> {
    try {
      const { data, error } = await supabase
        .from('theme_configs')
        .select('*')
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
   * 获取所有主题
   */
  static async findAllThemes(): Promise<ThemeConfig[]> {
    try {
      const { data, error } = await supabase
        .from('theme_configs')
        .select('*')
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
   * 根据ID获取主题
   */
  static async findThemeById(id: string): Promise<ThemeConfig | null> {
    try {
      const { data, error } = await supabase
        .from('theme_configs')
        .select('*')
        .eq('id', id)
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
   * 创建新主题
   */
  static async createTheme(theme: ThemeConfigInsert): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('theme_configs')
        .insert(theme)
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
   * 更新主题
   */
  static async updateTheme(id: string, updates: ThemeConfigUpdate): Promise<ThemeConfig> {
    try {
      const { data, error } = await supabase
        .from('theme_configs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
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
   * 删除主题
   */
  static async deleteTheme(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('theme_configs')
        .delete()
        .eq('id', id);

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
      const { error: deactivateError } = await supabase
        .from('theme_configs')
        .update({ is_active: false })
        .neq('id', id);

      if (deactivateError) {
        throw new Error(`取消其他主题活跃状态失败: ${deactivateError.message}`);
      }

      // 设置指定主题为活跃
      const { error: activateError } = await supabase
        .from('theme_configs')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (activateError) {
        throw new Error(`设置主题活跃状态失败: ${activateError.message}`);
      }
    } catch (error) {
      console.error('ThemeDAO.setActiveTheme error:', error);
      throw error;
    }
  }

  /**
   * 获取页面样式
   */
  static async findPageStyles(themeId: string, pageName: string): Promise<PageStyle[]> {
    try {
      const { data, error } = await supabase
        .from('page_styles')
        .select('*')
        .eq('theme_id', themeId)
        .eq('page_name', pageName)
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
   * 获取组件样式
   */
  static async findComponentStyles(themeId: string, componentName: string): Promise<ComponentStyle[]> {
    try {
      const { data, error } = await supabase
        .from('component_styles')
        .select('*')
        .eq('theme_id', themeId)
        .eq('component_name', componentName)
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
 * 主题系统核心服务类
 * 实现单例模式，提供主题管理的核心功能
 */
export class ThemeService {
  private static instance: ThemeService;
  private cache: ThemeCache;
  private listeners: Set<(theme: ThemeConfiguration) => void> = new Set();

  private constructor() {
    this.cache = new ThemeCache();
    // 定期清理过期缓存
    setInterval(() => {
      this.cache.clearExpired();
    }, 60000); // 每分钟清理一次
  }

  /**
   * 获取服务实例（单例模式）
   */
  static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  /**
   * 获取活跃主题配置
   */
  async getActiveTheme(): Promise<ThemeConfiguration> {
    const cacheKey = 'active-theme';
    
    // 尝试从缓存获取
    const cached = this.cache.get<ThemeConfiguration>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const themeData = await ThemeDAO.findActiveTheme();
      
      if (!themeData) {
        // 如果没有活跃主题，返回默认主题
        const defaultTheme = this.getDefaultTheme();
        this.cache.set(cacheKey, defaultTheme);
        return defaultTheme;
      }

      const theme = this.parseThemeConfig(themeData.config_data);
      this.cache.set(cacheKey, theme);
      return theme;
    } catch (error) {
      console.error('获取活跃主题失败:', error);
      // 返回默认主题作为降级方案
      const defaultTheme = this.getDefaultTheme();
      this.cache.set(cacheKey, defaultTheme);
      return defaultTheme;
    }
  }

  /**
   * 获取所有主题
   */
  async getAllThemes(): Promise<ThemeConfig[]> {
    const cacheKey = 'all-themes';
    
    // 尝试从缓存获取
    const cached = this.cache.get<ThemeConfig[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const themes = await ThemeDAO.findAllThemes();
      this.cache.set(cacheKey, themes);
      return themes;
    } catch (error) {
      console.error('获取主题列表失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取主题
   */
  async getThemeById(id: string): Promise<ThemeConfig | null> {
    const cacheKey = `theme-${id}`;
    
    // 尝试从缓存获取
    const cached = this.cache.get<ThemeConfig>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const theme = await ThemeDAO.findThemeById(id);
      if (theme) {
        this.cache.set(cacheKey, theme);
      }
      return theme;
    } catch (error) {
      console.error('获取主题失败:', error);
      throw error;
    }
  }

  /**
   * 创建新主题
   */
  async createTheme(themeData: ThemeConfigInsert): Promise<string> {
    try {
      const themeId = await ThemeDAO.createTheme(themeData);
      
      // 清除相关缓存
      this.cache.clear('all-themes');
      
      return themeId;
    } catch (error) {
      console.error('创建主题失败:', error);
      throw error;
    }
  }

  /**
   * 更新主题
   */
  async updateTheme(id: string, updates: ThemeConfigUpdate): Promise<ThemeConfig> {
    try {
      const updatedTheme = await ThemeDAO.updateTheme(id, updates);
      
      // 清除相关缓存
      this.cache.clear(`theme-${id}`);
      this.cache.clear('all-themes');
      
      // 如果更新的是活跃主题，清除活跃主题缓存并通知监听器
      if (updatedTheme.is_active) {
        this.cache.clear('active-theme');
        const themeConfig = this.parseThemeConfig(updatedTheme.config_data);
        this.notifyThemeUpdate(themeConfig);
      }
      
      return updatedTheme;
    } catch (error) {
      console.error('更新主题失败:', error);
      throw error;
    }
  }

  /**
   * 删除主题
   */
  async deleteTheme(id: string): Promise<void> {
    try {
      await ThemeDAO.deleteTheme(id);
      
      // 清除相关缓存
      this.cache.clear(`theme-${id}`);
      this.cache.clear('all-themes');
    } catch (error) {
      console.error('删除主题失败:', error);
      throw error;
    }
  }

  /**
   * 切换活跃主题
   */
  async switchTheme(id: string): Promise<void> {
    try {
      await ThemeDAO.setActiveTheme(id);
      
      // 清除活跃主题缓存
      this.cache.clear('active-theme');
      
      // 获取新的活跃主题并通知监听器
      const newTheme = await this.getActiveTheme();
      this.notifyThemeUpdate(newTheme);
    } catch (error) {
      console.error('切换主题失败:', error);
      throw error;
    }
  }

  /**
   * 设置活跃主题
   */
  async setActiveTheme(id: string): Promise<void> {
    return this.switchTheme(id);
  }

  /**
   * 获取页面样式
   */
  async getPageStyles(pageName: string): Promise<PageStyle[]> {
    try {
      const activeTheme = await ThemeDAO.findActiveTheme();
      if (!activeTheme) {
        return [];
      }

      return await ThemeDAO.findPageStyles(activeTheme.id, pageName);
    } catch (error) {
      console.error('获取页面样式失败:', error);
      return [];
    }
  }

  /**
   * 获取组件样式
   */
  async getComponentStyles(componentName: string): Promise<ComponentStyle[]> {
    try {
      const activeTheme = await ThemeDAO.findActiveTheme();
      if (!activeTheme) {
        return [];
      }

      return await ThemeDAO.findComponentStyles(activeTheme.id, componentName);
    } catch (error) {
      console.error('获取组件样式失败:', error);
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
   * 监听主题变化
   */
  onThemeChange(callback: () => void): () => void {
    const listener = () => callback();
    this.listeners.add(listener);
    
    // 返回取消监听的函数
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 清除所有缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 解析主题配置数据
   */
  parseThemeConfig(configData: unknown): ThemeConfiguration {
    try {
      if (typeof configData === 'string') {
        return JSON.parse(configData);
      }
      return configData as ThemeConfiguration;
    } catch (error) {
      console.error('解析主题配置失败:', error);
      return this.getDefaultTheme();
    }
  }

  /**
   * 获取默认主题配置
   */
  private getDefaultTheme(): ThemeConfiguration {
    return {
      id: 'default',
      colors: {
        primary: '#1677ff',
        secondary: '#722ed1',
        accent: '#13c2c2',
        background: '#ffffff',
        text: '#262626',
        border: '#d9d9d9',
        success: '#52c41a',
        warning: '#faad14',
        error: '#ff4d4f'
      },
      fonts: {
        primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        secondary: 'Georgia, "Times New Roman", Times, serif',
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
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
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
        console.error('主题更新监听器执行失败:', error);
      }
    });
  }
}

// 导出单例实例
export const themeService = ThemeService.getInstance();

// 导出类型
// export type { ThemeConfiguration }; // 已在接口定义处导出