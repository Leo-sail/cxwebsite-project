/**
 * 高级主题提供者组件
 * 集成主题、页面样式和组件样式的完整主题系统
 */
import { createContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { BaseThemeProvider, useBaseTheme } from '../contexts/BaseThemeContext';
import { pageStyleService, type PageStyleConfiguration } from '../services/pageStyleService';
import { componentStyleService, type ComponentStyleConfiguration } from '../services/componentStyleService';
import { CSSVariableGenerator } from '../utils/themeUtils';
import type { ThemeConfiguration } from '../services/themeService';
import type { AdvancedThemeContextType, AdvancedThemeProviderProps } from '../types/theme';



/**
 * 高级主题上下文
 */
const AdvancedThemeContext = createContext<AdvancedThemeContextType | undefined>(undefined);



/**
 * 高级主题提供者组件
 */
export function AdvancedThemeProvider({
  children,
  defaultThemeId = 'default',
  enableAnimation = true,
  animationDuration = 300,
  autoApplyCSS = true,
  enableLocalStorage = true,
  enablePageStyles = true,
  enableComponentStyles = true,
  currentPage = 'default'
}: AdvancedThemeProviderProps) {
  return (
    <BaseThemeProvider
      defaultThemeId={defaultThemeId}
      enableAnimation={enableAnimation}
      animationDuration={animationDuration}
      autoApplyCSS={autoApplyCSS}
      enableLocalStorage={enableLocalStorage}
    >
      <AdvancedThemeProviderInner
        enablePageStyles={enablePageStyles}
        enableComponentStyles={enableComponentStyles}
        currentPage={currentPage}
      >
        {children}
      </AdvancedThemeProviderInner>
    </BaseThemeProvider>
  );
}

/**
 * 高级主题提供者内部组件
 */
function AdvancedThemeProviderInner({
  children,
  enablePageStyles,
  enableComponentStyles,
  currentPage
}: {
  children: ReactNode;
  enablePageStyles: boolean;
  enableComponentStyles: boolean;
  currentPage: string;
}) {
  // 基础主题上下文
  const baseThemeContext = useBaseTheme();
  
  // 页面样式状态
  const [currentPageStyles, setCurrentPageStyles] = useState<PageStyleConfiguration>({
    layout: {
      maxWidth: '1200px',
      padding: '20px',
      margin: '0 auto'
    }
  });
  const [appliedPageStyles, setAppliedPageStyles] = useState<Set<string>>(new Set());
  
  // 组件样式缓存
  const [componentStylesCache, setComponentStylesCache] = useState<Map<string, ComponentStyleConfiguration>>(new Map());
  const [appliedComponentStyles, setAppliedComponentStyles] = useState<Set<string>>(new Set());

  /**
   * 获取页面样式
   */
  const getPageStyles = useCallback(async (pageName: string): Promise<PageStyleConfiguration> => {
    if (!enablePageStyles || !baseThemeContext.currentTheme) {
      return {
        layout: {
          maxWidth: '1200px',
          padding: '20px',
          margin: '0 auto'
        }
      };
    }

    try {
      const styles = await pageStyleService.getPageStyles(
        'default',
        pageName
      );
      
      const stylesWithDefaults: PageStyleConfiguration = {
        ...styles,
        layout: {
          maxWidth: '1200px',
          padding: '20px',
          margin: '0 auto',
          ...styles.layout
        }
      };
      
      return stylesWithDefaults;
    } catch (error: unknown) {
      console.error('获取页面样式失败:', error);
      return {
        layout: {
          maxWidth: '1200px',
          padding: '20px',
          margin: '0 auto'
        }
      };
    }
  }, [enablePageStyles, baseThemeContext.currentTheme]);

  /**
   * 应用页面样式
   */
  const applyPageStyles = useCallback((pageName: string, styles?: PageStyleConfiguration) => {
    if (!enablePageStyles || !baseThemeContext.currentTheme) return;

    try {
      const defaultStyles: PageStyleConfiguration = {
        layout: {
          maxWidth: '1200px',
          padding: '20px',
          margin: '0 auto'
        }
      };
      
      const stylesToApply = styles || currentPageStyles || defaultStyles;
      
      // 生成CSS变量
      const cssVariables = CSSVariableGenerator.generatePageVariables(stylesToApply, pageName);
      
      // 创建或更新样式元素
      const styleId = `page-styles-${pageName}`;
      let styleElement = document.getElementById(styleId);
      
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      
      styleElement.textContent = cssVariables;
      
      // 添加页面类名
      document.body.classList.add(`page-${pageName}`);
      
      // 记录已应用的样式
      setAppliedPageStyles(prev => new Set(prev).add(pageName));
      
    } catch (error: unknown) {
      console.error('应用页面样式失败:', error);
    }
  }, [enablePageStyles, currentPageStyles, baseThemeContext.currentTheme]);

  /**
   * 获取组件样式
   */
  const getComponentStyles = useCallback(async (componentName: string): Promise<ComponentStyleConfiguration> => {
    if (!enableComponentStyles || !baseThemeContext.currentTheme) {
      return {};
    }

    // 检查缓存
    const cached = componentStylesCache.get(componentName);
    if (cached) {
      return cached;
    }

    try {
      const styles = await componentStyleService.getComponentStyles(
        componentName
      );
      
      // 更新缓存
      setComponentStylesCache(prev => new Map(prev).set(componentName, styles));
      
      return styles;
    } catch (error: unknown) {
      console.error('获取组件样式失败:', error);
      return {};
    }
  }, [enableComponentStyles, baseThemeContext.currentTheme, componentStylesCache]);

  /**
   * 应用组件样式
   */
  const applyComponentStyles = useCallback((componentName: string, styles?: ComponentStyleConfiguration) => {
    if (!enableComponentStyles) return;

    try {
      const stylesToApply = styles || componentStylesCache.get(componentName) || {};
      
      // 生成CSS变量
      const cssVariables = CSSVariableGenerator.generateComponentVariables(stylesToApply, componentName);
      
      // 创建或更新样式元素
      const styleId = `component-styles-${componentName}`;
      let styleElement = document.getElementById(styleId);
      
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      
      styleElement.textContent = cssVariables;
      
      // 记录已应用的样式
      setAppliedComponentStyles(prev => new Set(prev).add(componentName));
      
    } catch (error: unknown) {
      console.error('应用组件样式失败:', error);
    }
  }, [enableComponentStyles, componentStylesCache]);

  /**
   * 生成组件CSS
   */
  const generateComponentCSS = useCallback((styles: ComponentStyleConfiguration): string => {
    if (!enableComponentStyles) return '';

    try {
      return componentStyleService.generateCSSStyles(styles);
    } catch (error: unknown) {
      console.error('生成组件CSS失败:', error);
      return '';
    }
  }, [enableComponentStyles]);

  /**
   * 清除所有样式
   */
  const clearAllStyles = useCallback(() => {
    // 清除页面样式
    appliedPageStyles.forEach(pageName => {
      const styleElement = document.getElementById(`page-styles-${pageName}`);
      if (styleElement) {
        styleElement.remove();
      }
      document.body.classList.remove(`page-${pageName}`);
    });
    setAppliedPageStyles(new Set());

    // 清除组件样式
    appliedComponentStyles.forEach(componentName => {
      const styleElement = document.getElementById(`component-styles-${componentName}`);
      if (styleElement) {
        styleElement.remove();
      }
    });
    setAppliedComponentStyles(new Set());

    // 清除缓存
    setComponentStylesCache(new Map());
  }, [appliedPageStyles, appliedComponentStyles]);

  /**
   * 刷新所有样式
   */
  const refreshAllStyles = useCallback(async () => {
    if (!baseThemeContext.currentTheme) return;

    try {
      // 清除现有样式
      clearAllStyles();

      // 重新加载当前页面样式
      if (enablePageStyles && currentPage) {
        const pageStyles = await getPageStyles(currentPage);
        const stylesWithDefaults = pageStyles;
        setCurrentPageStyles(stylesWithDefaults);
        applyPageStyles(currentPage, stylesWithDefaults);
      }

      // 清除组件样式缓存，让组件重新加载
      setComponentStylesCache(new Map());
      
    } catch (error: unknown) {
      console.error('刷新样式失败:', error);
    }
  }, [baseThemeContext.currentTheme, enablePageStyles, currentPage, getPageStyles, applyPageStyles, clearAllStyles]);

  // 监听主题变化
  useEffect(() => {
    if (baseThemeContext.currentTheme) {
      refreshAllStyles();
    }
  }, [baseThemeContext.currentTheme, refreshAllStyles]);

  // 监听当前页面变化
  useEffect(() => {
    if (enablePageStyles && currentPage && baseThemeContext.currentTheme) {
      const loadPageStyles = async () => {
        try {
          const pageStyles = await getPageStyles(currentPage);
          setCurrentPageStyles(pageStyles);
          applyPageStyles(currentPage, pageStyles);
        } catch (error: unknown) {
          console.error('加载页面样式失败:', error);
        }
      };

      loadPageStyles();
    }
  }, [enablePageStyles, currentPage, baseThemeContext.currentTheme, getPageStyles, applyPageStyles]);

  // 清理函数
  useEffect(() => {
    return () => {
      clearAllStyles();
    };
  }, [clearAllStyles]);

  // 上下文值
  const contextValue: AdvancedThemeContextType = {
    // 基础主题功能
    currentTheme: baseThemeContext.currentTheme,
    availableThemes: baseThemeContext.availableThemes as unknown as ThemeConfiguration[],
    isLoading: baseThemeContext.isLoading,
    error: baseThemeContext.error,
    switchTheme: baseThemeContext.switchTheme,
    refreshThemes: baseThemeContext.refreshThemes,
    resetToDefault: baseThemeContext.resetToDefault,
    
    // 页面样式功能
    currentPageStyles,
    getPageStyles,
    applyPageStyles,
    
    // 组件样式功能
    getComponentStyles,
    applyComponentStyles,
    generateComponentCSS,
    
    // 样式管理
    clearAllStyles,
    refreshAllStyles
  };

  return (
    <AdvancedThemeContext.Provider value={contextValue}>
      {children}
    </AdvancedThemeContext.Provider>
  );
}

// 导出Context以供Hook使用
export { AdvancedThemeContext };

// 导出类型
export type {
  AdvancedThemeContextType,
  AdvancedThemeProviderProps
};