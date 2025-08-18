/**
 * 样式化组件工厂
 * 提供创建样式化组件的通用工厂函数和高阶组件
 */
import React, { forwardRef, useMemo } from 'react';
import type { ComponentType } from 'react';
import { useComponentStyles } from '../../hooks/useTheme';
import { StyleMerger } from '../../utils/themeUtils';


// 导入配置接口
import type { StyledComponentConfig } from '../../utils/styledComponentUtils';

/**
 * 创建样式化组件的工厂函数
 * @param BaseComponent 基础组件
 * @param config 样式化组件配置
 * @returns 样式化组件
 */
export function createStyledComponent<T extends ComponentType<any>>(
  BaseComponent: T,
  config: StyledComponentConfig
): any {
  const StyledComponent = forwardRef<any, any>(
    (props, ref) => {
      const {
        variant = config.defaultVariant,
        size = config.defaultSize,
        customStyles,
        className = '',
        style,
        ...restProps
      } = props;

      // 获取组件样式
      const componentStyles = useComponentStyles(config.componentName, variant as string);

      // 合并样式
      const mergedStyles = useMemo(() => {
        const stylesToMerge = [
          config.defaultStyles.base,
          variant && (config.defaultStyles.variants as any)?.[variant],
          size && (config.defaultStyles.sizes as any)?.[size],
          componentStyles,
          customStyles
        ].filter(Boolean);

        if (config.customStyleMerger) {
          return config.customStyleMerger(stylesToMerge, props);
        }

        return Object.assign({}, ...stylesToMerge) as React.CSSProperties;
      }, [variant, size, componentStyles, customStyles, props]);

      // 合并类名
      const mergedClassName = StyleMerger.mergeClassNames(
        config.componentName.toLowerCase(),
        variant && `${config.componentName.toLowerCase()}--${variant}`,
        size && `${config.componentName.toLowerCase()}--${size}`,
        className as string
      );

      return (
        <BaseComponent
          {...(restProps as any)}
          ref={ref}
          className={mergedClassName}
          style={{ ...mergedStyles, ...(style || {}) } as React.CSSProperties}
        />
      );
    }
  );

  StyledComponent.displayName = `Styled${config.componentName}`;
  return StyledComponent;
}



// 只导出组件工厂函数
export default {
  createStyledComponent
};