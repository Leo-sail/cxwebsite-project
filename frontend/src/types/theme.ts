/**
 * 主题相关的类型定义
 */
import type { ReactNode } from 'react';
import type { ThemeConfiguration } from '../services/themeService';
import type { PageStyleConfiguration } from '../services/pageStyleService';
import type { ComponentStyleConfiguration } from '../services/componentStyleService';

/**
 * 高级主题上下文类型
 */
export interface AdvancedThemeContextType {
  // 基础主题功能
  currentTheme: ThemeConfiguration | null;
  availableThemes: ThemeConfiguration[];
  isLoading: boolean;
  error: string | null;
  switchTheme: (themeId: string, animated?: boolean) => Promise<void>;
  refreshThemes: () => Promise<void>;
  resetToDefault: () => Promise<void>;
  
  // 页面样式功能
  currentPageStyles: PageStyleConfiguration;
  getPageStyles: (pageName: string) => Promise<PageStyleConfiguration>;
  applyPageStyles: (pageName: string, styles?: PageStyleConfiguration) => void;
  
  // 组件样式功能
  getComponentStyles: (componentName: string) => Promise<ComponentStyleConfiguration>;
  applyComponentStyles: (componentName: string, styles?: ComponentStyleConfiguration) => void;
  generateComponentCSS: (styles: ComponentStyleConfiguration) => string;
  
  // 工具功能
  clearAllStyles: () => void;
  refreshAllStyles: () => Promise<void>;
}

/**
 * 高级主题提供者属性
 */
export interface AdvancedThemeProviderProps {
  children: ReactNode;
  defaultThemeId?: string;
  enableAnimation?: boolean;
  animationDuration?: number;
  autoApplyCSS?: boolean;
  enableLocalStorage?: boolean;
  enablePageStyles?: boolean;
  enableComponentStyles?: boolean;
  currentPage?: string;
}