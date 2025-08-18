/**
 * 高级主题相关的Hook
 */
import { useContext, useState, useCallback, useEffect } from 'react';
import { AdvancedThemeContext } from '../providers/ThemeProvider';
import type { PageStyleConfiguration } from '../services/pageStyleService';
import type { ComponentStyleConfiguration } from '../services/componentStyleService';
import type { AdvancedThemeContextType } from '../types/theme';

/**
 * 使用高级主题上下文的钩子
 */
export function useAdvancedTheme(): AdvancedThemeContextType {
  const context = useContext(AdvancedThemeContext);
  
  if (context === undefined) {
    throw new Error('useAdvancedTheme must be used within an AdvancedThemeProvider');
  }
  
  return context;
}

/**
 * 使用页面样式的钩子
 */
export function usePageStyles(pageName: string) {
  const { getPageStyles, applyPageStyles } = useAdvancedTheme();
  const [styles, setStyles] = useState<PageStyleConfiguration>({
    layout: {
      maxWidth: '1200px',
      padding: '0 1rem',
      margin: '0 auto',
      gap: '1rem'
    },
    typography: {
      fontFamily: 'inherit',
      fontSize: '1rem',
      lineHeight: '1.5',
      color: 'inherit'
    },
    spacing: {
      section: '2rem',
      component: '1rem',
      element: '0.5rem'
    },
    responsive: {
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px'
      }
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadStyles = useCallback(async () => {
    setIsLoading(true);
    try {
      const pageStyles = await getPageStyles(pageName);
      setStyles(pageStyles);
      applyPageStyles(pageName, pageStyles);
    } catch (error: unknown) {
      console.error('Failed to load page styles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [pageName, getPageStyles, applyPageStyles]);

  useEffect(() => {
    void loadStyles();
  }, [loadStyles]);

  return {
    styles,
    isLoading,
    loadStyles,
    setStyles
  };
}

/**
 * 使用组件样式的钩子
 */
export function useComponentStyles(componentName: string) {
  const { getComponentStyles, applyComponentStyles, generateComponentCSS } = useAdvancedTheme();
  const [styles, setStyles] = useState<ComponentStyleConfiguration>({});
  const [isLoading, setIsLoading] = useState(false);

  const loadStyles = useCallback(async () => {
    setIsLoading(true);
    try {
      const componentStyles = await getComponentStyles(componentName);
      setStyles(componentStyles);
      applyComponentStyles(componentName, componentStyles);
    } catch (error: unknown) {
      console.error('Failed to load component styles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [componentName, getComponentStyles, applyComponentStyles]);

  const generateCSS = useCallback(() => {
    return generateComponentCSS(styles);
  }, [styles, generateComponentCSS]);

  useEffect(() => {
    void loadStyles();
  }, [loadStyles]);

  return {
    styles,
    isLoading,
    loadStyles,
    setStyles,
    generateCSS
  };
}