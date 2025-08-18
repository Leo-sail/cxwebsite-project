/**
 * 基础主题上下文
 * 提供完整的主题管理功能，支持数据库主题配置
 */
import React, { createContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { themeService, type ThemeConfiguration } from '../services/themeService';
import type { ThemeConfig } from '../types/database';

/**
 * 基础主题上下文类型
 */
interface BaseThemeContextType {
  currentTheme: ThemeConfiguration | null;
  availableThemes: ThemeConfig[];
  isLoading: boolean;
  error: string | null;
  switchTheme: (themeId: string, animated?: boolean) => Promise<void>;
  refreshThemes: () => Promise<void>;
  resetToDefault: () => Promise<void>;
}

/**
 * 基础主题上下文
 */
/**
 * 获取默认主题配置
 */
const getDefaultTheme = (): ThemeConfiguration => {
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
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    }
  };
};

const BaseThemeContext = createContext<BaseThemeContextType | undefined>(undefined);

/**
 * 基础主题提供者属性接口
 */
interface BaseThemeProviderProps {
  children: ReactNode;
  defaultThemeId?: string;
  enableAnimation?: boolean;
  animationDuration?: number;
  autoApplyCSS?: boolean;
  enableLocalStorage?: boolean;
}

/**
 * 基础主题提供者组件
 */
export function BaseThemeProvider({
  children,
  defaultThemeId = 'default',
  enableAnimation = true,
  animationDuration = 300,
  autoApplyCSS = true,
  enableLocalStorage = true
}: BaseThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfiguration | null>(null);
  const [availableThemes, setAvailableThemes] = useState<ThemeConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 应用主题CSS变量
   */
  const applyThemeCSS = useCallback((theme: ThemeConfiguration) => {
    const root = document.documentElement;
    
    // 应用颜色变量
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // 应用字体变量
    Object.entries(theme.fonts.sizes).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });
    
    // 应用间距变量
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    
    // 应用圆角变量
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--border-radius-${key}`, value);
    });
    
    // 应用阴影变量
    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
  }, []);

  /**
   * 主题切换动画
   */
  const animateThemeTransition = useCallback(async (callback: () => void) => {
    if (!enableAnimation) {
      callback();
      return;
    }
    
    const root = document.documentElement;
    root.style.transition = `all ${animationDuration}ms ease-in-out`;
    
    callback();
    
    // 动画完成后移除transition
    setTimeout(() => {
      root.style.transition = '';
    }, animationDuration);
  }, [enableAnimation, animationDuration]);

  /**
   * 加载活跃主题
   */
  const loadActiveTheme = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const theme = await themeService.getActiveTheme();
      setCurrentTheme(theme);
      
      if (autoApplyCSS) {
        applyThemeCSS(theme);
      }
    } catch (err) {
      console.error('加载活跃主题失败:', err);
      setError(err instanceof Error ? err.message : '加载主题失败');
      
      // 使用默认主题作为降级方案
      const defaultTheme = getDefaultTheme();
      setCurrentTheme(defaultTheme);
      
      if (autoApplyCSS) {
        applyThemeCSS(defaultTheme);
      }
    } finally {
      setIsLoading(false);
    }
  }, [autoApplyCSS, applyThemeCSS]);

  /**
   * 加载所有可用主题
   */
  const loadAvailableThemes = useCallback(async () => {
    try {
      const themes = await themeService.getAllThemes();
      setAvailableThemes(themes);
    } catch (err) {
      console.error('加载主题列表失败:', err);
    }
  }, []);

  /**
   * 切换主题
   */
  const switchTheme = useCallback(async (themeId: string, animated = enableAnimation) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const themeData = await themeService.getThemeById(themeId);
      if (!themeData) {
        throw new Error(`主题 ${themeId} 不存在`);
      }
      
      const theme = themeService.parseThemeConfig(themeData.config_data);
      
      if (animated && enableAnimation) {
        await animateThemeTransition(() => {
          setCurrentTheme(theme);
          if (autoApplyCSS) {
            applyThemeCSS(theme);
          }
        });
      } else {
        setCurrentTheme(theme);
        if (autoApplyCSS) {
          applyThemeCSS(theme);
        }
      }
      
      // 更新数据库中的活跃主题
      await themeService.setActiveTheme(themeId);
      
      // 保存到本地存储
      if (enableLocalStorage) {
        localStorage.setItem('activeThemeId', themeId);
      }
      
    } catch (err) {
      console.error('切换主题失败:', err);
      setError(err instanceof Error ? err.message : '切换主题失败');
    } finally {
      setIsLoading(false);
    }
  }, [enableAnimation, autoApplyCSS, enableLocalStorage, animateThemeTransition, applyThemeCSS]);

  /**
   * 刷新主题
   */
  const refreshThemes = useCallback(async () => {
    await Promise.all([
      loadActiveTheme(),
      loadAvailableThemes()
    ]);
  }, [loadActiveTheme, loadAvailableThemes]);

  /**
   * 重置为默认主题
   */
  const resetToDefault = useCallback(async () => {
    const defaultTheme = getDefaultTheme();
    setCurrentTheme(defaultTheme);
    
    if (autoApplyCSS) {
      applyThemeCSS(defaultTheme);
    }
    
    if (enableLocalStorage) {
      localStorage.removeItem('activeThemeId');
    }
  }, [autoApplyCSS, enableLocalStorage, applyThemeCSS]);





  // 初始化
  useEffect(() => {
    const initializeTheme = async () => {
      // 加载主题
      await Promise.all([
        loadActiveTheme(),
        loadAvailableThemes()
      ]);
    };
    
    initializeTheme();
  }, [defaultThemeId, enableLocalStorage, loadActiveTheme, loadAvailableThemes]);

  // 上下文值
  const contextValue: BaseThemeContextType = {
    currentTheme,
    availableThemes,
    isLoading,
    error,
    switchTheme,
    refreshThemes,
    resetToDefault
  };

  return (
    <BaseThemeContext.Provider value={contextValue}>
      {children}
    </BaseThemeContext.Provider>
  );
}

/**
 * 使用基础主题上下文的钩子
 */
/* eslint-disable react-refresh/only-export-components */
export function useBaseTheme(): BaseThemeContextType {
  const context = React.useContext(BaseThemeContext);
  if (context === undefined) {
    throw new Error('useBaseTheme must be used within a BaseThemeProvider');
  }
  return context;
}

/**
 * 导出类型和上下文
 */
export { BaseThemeContext };
export { BaseThemeProvider as ThemeProvider };

// 导出类型
export type {
  BaseThemeContextType,
  BaseThemeProviderProps
};