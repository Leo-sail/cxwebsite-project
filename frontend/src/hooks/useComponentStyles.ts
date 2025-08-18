import React, { useMemo } from 'react';
import { useTheme } from './useTheme';

/**
 * 组件样式配置接口
 */
export interface ComponentStyleConfig {
  [key: string]: unknown;
}

/**
 * 组件样式hook
 * 用于获取和管理组件级别的样式配置
 */
export const useComponentStyles = (componentName: string) => {
  const { currentTheme } = useTheme();

  /**
   * 获取组件样式配置
   * @param variant 样式变体
   * @param props 额外属性
   * @returns 样式对象
   */
  const getComponentStyles = useMemo(() => {
    return (variant?: string, props?: ComponentStyleConfig): React.CSSProperties => {
      // 从主题中获取组件样式配置
      const componentStyles = currentTheme?.components?.[componentName] || {};
      const variantStyles = variant ? componentStyles[variant] || {} : {};
      
      // 合并默认样式、变体样式和传入的属性，只保留CSS属性
      const mergedStyles = {
        ...componentStyles.default,
        ...variantStyles,
        ...props
      };
      
      // 过滤掉非CSS属性（如className等）
       const cssStyles: React.CSSProperties = {};
       Object.keys(mergedStyles).forEach(key => {
         if (key !== 'className' && (mergedStyles as any)[key] !== undefined) {
          (cssStyles as Record<string, unknown>)[key] = (mergedStyles as any)[key];
         }
       });
      
      return cssStyles;
    };
  }, [currentTheme, componentName]);

  /**
   * 获取组件的CSS类名
   * @param variant 样式变体
   * @returns CSS类名字符串
   */
  const getComponentClassName = useMemo(() => {
    return (variant?: string) => {
      const componentStyles = currentTheme?.components?.[componentName] || {};
      const baseClass = componentStyles.className || '';
      const variantClass = variant ? componentStyles[variant]?.className || '' : '';
      
      return [baseClass, variantClass].filter(Boolean).join(' ');
    };
  }, [currentTheme, componentName]);

  /**
   * 检查组件是否有特定变体
   * @param variant 样式变体
   * @returns 是否存在该变体
   */
  const hasVariant = useMemo(() => {
    return (variant: string) => {
      const componentStyles = currentTheme?.components?.[componentName] || {};
      return Boolean(componentStyles[variant]);
    };
  }, [currentTheme, componentName]);

  return {
    getComponentStyles,
    getComponentClassName,
    hasVariant
  };
};

export default useComponentStyles;