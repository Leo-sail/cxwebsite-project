/**
 * 主题相关的React钩子函数
 * 提供主题管理、样式应用和响应式设计的便捷方法
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ThemeService, type ThemeConfiguration } from '../services/themeService';
import type { UIConfig } from '../types/database';
import { PageStyleService, type PageStyleConfiguration } from '../services/pageStyleService';
import { ComponentStyleService, type ComponentStyleConfiguration } from '../services/componentStyleService';
import { ThemeStorageUtils, ThemeAnimationUtils } from '../utils/themeUtils';
import { getCurrentBreakpoint, type BreakpointKey } from '../config/breakpoints';

/**
 * 主题状态接口
 */
interface ThemeState {
  currentTheme: ThemeConfiguration | null;
  isLoading: boolean;
  error: string | null;
  availableThemes: UIConfig[];
}

/**
 * 主题钩子 - 管理应用主题状态
 */
export function useTheme() {
  const [state, setState] = useState<ThemeState>({
    currentTheme: null,
    isLoading: true,
    error: null,
    availableThemes: []
  });

  /**
   * 加载当前主题
   */
  const loadCurrentTheme = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const theme = await ThemeService.getInstance().getActiveTheme();
      const themes = await ThemeService.getInstance().getAllThemes();
      
      setState({
        currentTheme: theme,
        isLoading: false,
        error: null,
        availableThemes: themes
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '加载主题失败'
      }));
    }
  }, []);

  /**
   * 切换主题
   */
  const switchTheme = useCallback(async (themeId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await ThemeService.getInstance().switchTheme(themeId);
      const newTheme = await ThemeService.getInstance().getActiveTheme();
      
      setState(prev => ({
        ...prev,
        currentTheme: newTheme,
        isLoading: false
      }));
      
      // 保存用户偏好
      ThemeStorageUtils.saveThemePreference(themeId);
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '切换主题失败'
      }));
    }
  }, []);

  /**
   * 刷新主题列表
   */
  const refreshThemes = useCallback(async () => {
    try {
      const themes = await ThemeService.getInstance().getAllThemes();
      setState(prev => ({ ...prev, availableThemes: themes }));
    } catch (error) {
      console.error('刷新主题列表失败:', error);
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    loadCurrentTheme();
  }, [loadCurrentTheme]);

  // 监听主题变化
  useEffect(() => {
    const unsubscribe = ThemeService.getInstance().onThemeChange(() => {
      loadCurrentTheme();
    });

    return unsubscribe;
  }, [loadCurrentTheme]);

  return {
    ...state,
    switchTheme,
    refreshThemes,
    reload: loadCurrentTheme
  };
}

/**
 * 页面样式钩子 - 管理页面级别的样式
 */
export function usePageStyles(pageName: string) {
  const [pageStyles, setPageStyles] = useState<PageStyleConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 加载页面样式
   */
  const loadPageStyles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const styles = await PageStyleService.getInstance().getPageStyles('', pageName);
      setPageStyles([styles]);
    } catch (error) {
      setError(error instanceof Error ? error.message : '加载页面样式失败');
    } finally {
      setIsLoading(false);
    }
  }, [pageName]);

  /**
   * 获取特定区域的样式
   */
  const getSectionStyles = useCallback((sectionName: string) => {
    const sectionStyle = pageStyles.find(style => 
      style.section_name === sectionName && style.is_active
    );
    return sectionStyle?.style_data || {};
  }, [pageStyles]);

  /**
   * 获取所有激活的页面样式
   */
  const getActiveStyles = useMemo(() => {
    return pageStyles
      .filter(style => style.is_active)
      .reduce((acc, style) => {
        acc[style.section_name as string] = style.style_data;
        return acc;
      }, {} as Record<string, unknown>);
  }, [pageStyles]);

  // 初始化加载
  useEffect(() => {
    loadPageStyles();
  }, [loadPageStyles]);

  return {
    pageStyles,
    isLoading,
    error,
    getSectionStyles,
    activeStyles: getActiveStyles,
    reload: loadPageStyles
  };
}

/**
 * 组件样式钩子 - 管理组件级别的样式
 */
export function useComponentStyles(componentName: string, variant?: string) {
  const [componentStyles, setComponentStyles] = useState<ComponentStyleConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 加载组件样式
   */
  const loadComponentStyles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const styles = await ComponentStyleService.getInstance().getComponentStyles(
        componentName
      );
      
      // 如果有多个样式，选择第一个激活的
      const activeStyle = Array.isArray(styles) ? styles.find((style: ComponentStyleConfiguration) => style.is_active) || styles[0] : null;
      setComponentStyles(activeStyle?.style_data || null);
    } catch (error) {
      setError(error instanceof Error ? error.message : '加载组件样式失败');
    } finally {
      setIsLoading(false);
    }
  }, [componentName, variant]);

  /**
   * 获取特定状态的样式
   */
  const getStateStyles = useCallback((state: string) => {
    if (!componentStyles) return {};
    return componentStyles[state] || {};
  }, [componentStyles]);

  /**
   * 获取基础样式
   */
  const getBaseStyles = useMemo(() => {
    return componentStyles?.base || {};
  }, [componentStyles]);

  // 初始化加载
  useEffect(() => {
    loadComponentStyles();
  }, [loadComponentStyles]);

  /**
   * 获取组件样式
   */
  const getComponentStyles = useCallback(() => {
    return componentStyles;
  }, [componentStyles]);

  return {
    componentStyles,
    isLoading,
    error,
    getStateStyles,
    getComponentStyles,
    baseStyles: getBaseStyles,
    reload: loadComponentStyles
  };
}

/**
 * 响应式设计钩子 - 监听屏幕尺寸变化
 */
/**
 * 响应式Hook - 兼容性版本
 * @deprecated 请使用新的 useResponsive from '../hooks/useResponsive'
 */
export function useResponsive() {
  const [breakpoint, setBreakpoint] = useState<BreakpointKey>(
    getCurrentBreakpoint(window.innerWidth)
  );
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const newBreakpoint = getCurrentBreakpoint(window.innerWidth);
      setBreakpoint(newBreakpoint);
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * 检查是否为移动设备
   */
  const isMobile = useMemo(() => {
    return breakpoint === 'xs' || breakpoint === 'sm';
  }, [breakpoint]);

  /**
   * 检查是否为平板设备
   */
  const isTablet = useMemo(() => {
    return breakpoint === 'md';
  }, [breakpoint]);

  /**
   * 检查是否为桌面设备
   */
  const isDesktop = useMemo(() => {
    return breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === 'xxl';
  }, [breakpoint]);

  /**
   * 检查屏幕宽度是否大于指定断点
   */
  const isAbove = useCallback((targetBreakpoint: BreakpointKey) => {
    const breakpointOrder: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    const currentIndex = breakpointOrder.indexOf(breakpoint);
    const targetIndex = breakpointOrder.indexOf(targetBreakpoint);
    return currentIndex > targetIndex;
  }, [breakpoint]);

  /**
   * 检查屏幕宽度是否小于指定断点
   */
  const isBelow = useCallback((targetBreakpoint: BreakpointKey) => {
    const breakpointOrder: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    const currentIndex = breakpointOrder.indexOf(breakpoint);
    const targetIndex = breakpointOrder.indexOf(targetBreakpoint);
    return currentIndex < targetIndex;
  }, [breakpoint]);

  return {
    breakpoint,
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isAbove,
    isBelow
  };
}

/**
 * 主题动画钩子 - 管理主题切换动画
 */
export function useThemeAnimation(duration: number = 300) {
  const [isAnimating, setIsAnimating] = useState(false);

  /**
   * 启用主题切换动画
   */
  const enableAnimation = useCallback(() => {
    setIsAnimating(true);
    ThemeAnimationUtils.applyThemeTransitionToAll('*', duration);
  }, [duration]);

  /**
   * 禁用主题切换动画
   */
  const disableAnimation = useCallback(() => {
    setIsAnimating(false);
    // 延迟移除动画，确保当前动画完成
    setTimeout(() => {
      if (typeof document !== 'undefined') {
        const elements = document.querySelectorAll('*');
        elements.forEach(element => {
          if (element instanceof HTMLElement) {
            ThemeAnimationUtils.removeThemeTransition(element);
          }
        });
      }
    }, duration);
  }, [duration]);

  /**
   * 执行带动画的主题切换
   */
  const animatedThemeSwitch = useCallback(async (themeId: string) => {
    enableAnimation();
    
    try {
      await ThemeService.getInstance().switchTheme(themeId);
    } finally {
      // 动画完成后禁用
      setTimeout(() => {
        disableAnimation();
      }, duration);
    }
  }, [enableAnimation, disableAnimation, duration]);

  return {
    isAnimating,
    enableAnimation,
    disableAnimation,
    animatedThemeSwitch
  };
}

/**
 * 主题偏好钩子 - 管理用户主题偏好
 */
export function useThemePreference() {
  const [preference, setPreference] = useState<string | null>(
    ThemeStorageUtils.getThemePreference()
  );

  /**
   * 保存主题偏好
   */
  const savePreference = useCallback((themeId: string) => {
    ThemeStorageUtils.saveThemePreference(themeId);
    setPreference(themeId);
  }, []);

  /**
   * 清除主题偏好
   */
  const clearPreference = useCallback(() => {
    ThemeStorageUtils.clearThemeStorage();
    setPreference(null);
  }, []);

  /**
   * 检测系统主题偏好
   */
  const getSystemPreference = useCallback((): 'light' | 'dark' | null => {
    if (typeof window === 'undefined') return null;
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    
    return null;
  }, []);

  /**
   * 监听系统主题变化
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      // 如果用户没有设置偏好，跟随系统主题
      if (!preference) {
        const systemPreference = getSystemPreference();
        if (systemPreference) {
          // 这里可以触发主题切换逻辑
          console.log('系统主题变化:', systemPreference);
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preference, getSystemPreference]);

  return {
    preference,
    savePreference,
    clearPreference,
    getSystemPreference
  };
}

/**
 * CSS变量钩子 - 动态管理CSS变量
 */
export function useCSSVariables() {
  /**
   * 设置CSS变量
   */
  const setCSSVariable = useCallback((name: string, value: string, element?: HTMLElement) => {
    const target = element || document.documentElement;
    target.style.setProperty(`--${name}`, value);
  }, []);

  /**
   * 获取CSS变量值
   */
  const getCSSVariable = useCallback((name: string, element?: HTMLElement): string => {
    const target = element || document.documentElement;
    return getComputedStyle(target).getPropertyValue(`--${name}`).trim();
  }, []);

  /**
   * 批量设置CSS变量
   */
  const setCSSVariables = useCallback((variables: Record<string, string>, element?: HTMLElement) => {
    Object.entries(variables).forEach(([name, value]) => {
      setCSSVariable(name, value, element);
    });
  }, [setCSSVariable]);

  /**
   * 移除CSS变量
   */
  const removeCSSVariable = useCallback((name: string, element?: HTMLElement) => {
    const target = element || document.documentElement;
    target.style.removeProperty(`--${name}`);
  }, []);

  return {
    setCSSVariable,
    getCSSVariable,
    setCSSVariables,
    removeCSSVariable
  };
}