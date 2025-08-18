/**
 * 样式化组件高级功能模块
 * 提供高阶组件、样式合成器、主题适配器等高级功能
 */
import React, { forwardRef, useMemo } from 'react';
import type { ComponentType } from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import { StyleMerger } from '../../utils/themeUtils';
import type { ComponentStyleConfig, StyledComponentProps, ResponsiveValue } from '../../types/style';

/**
 * 响应式样式化组件配置
 */
export interface ResponsiveStyledConfig {
  /** 组件名称 */
  componentName: string;
  /** 响应式样式配置 */
  responsiveStyles: {
    [breakpoint: string]: ComponentStyleConfig;
  };
  /** 默认断点 */
  defaultBreakpoint?: string;
}

/**
 * 条件样式配置
 */
export interface ConditionalStyleConfig {
  /** 条件函数 */
  condition: (props: StyledComponentProps) => boolean;
  /** 满足条件时的样式 */
  trueStyles: ComponentStyleConfig;
  /** 不满足条件时的样式 */
  falseStyles?: ComponentStyleConfig;
}

/**
 * 动画样式化组件配置
 */
export interface AnimatedStyledConfig {
  /** 组件名称 */
  componentName: string;
  /** 基础样式 */
  baseStyles: ComponentStyleConfig;
  /** 动画配置 */
  animations: {
    [animationName: string]: {
      keyframes: string;
      duration?: string;
      timingFunction?: string;
      delay?: string;
      iterationCount?: string;
      direction?: string;
      fillMode?: string;
    };
  };
  /** 过渡配置 */
  transitions?: {
    [property: string]: {
      duration?: string;
      timingFunction?: string;
      delay?: string;
    };
  };
}

/**
 * 创建响应式样式化组件
 * @param BaseComponent 基础组件
 * @param config 响应式配置
 * @returns 响应式样式化组件
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function createResponsiveStyledComponent<T extends ComponentType<any>>(
  BaseComponent: T,
  config: ResponsiveStyledConfig
): any {
  const ResponsiveStyledComponent = forwardRef<unknown, StyledComponentProps & React.ComponentProps<T>>(
    (props, ref) => {
      const { breakpoint } = useResponsive();
      const currentBreakpoint = breakpoint || config.defaultBreakpoint || 'desktop';
      
      const responsiveStyles = useMemo(() => {
        // 获取当前断点的样式，如果不存在则使用默认断点
        const currentStyles = config.responsiveStyles[currentBreakpoint] || 
                            config.responsiveStyles[config.defaultBreakpoint || 'desktop'] ||
                            config.responsiveStyles[Object.keys(config.responsiveStyles)[0]];
        
        return currentStyles;
      }, [currentBreakpoint]);

      const {
        variant,
        size,
        customStyles,
        className = '',
        style,
        ...restProps
      } = props;

      // 合并响应式样式
      const mergedStyles = useMemo(() => {
        const stylesToMerge = [
          responsiveStyles.base,
          variant && responsiveStyles.variants?.[variant],
          size && responsiveStyles.sizes?.[size],
          customStyles
        ].filter(Boolean);

        return StyleMerger.mergeStyles(...stylesToMerge);
      }, [responsiveStyles, variant, size, customStyles]);

      const mergedClassName = StyleMerger.mergeClassNames(
        config.componentName.toLowerCase(),
        `${config.componentName.toLowerCase()}--${currentBreakpoint}`,
        variant && `${config.componentName.toLowerCase()}--${variant}`,
        size && `${config.componentName.toLowerCase()}--${size}`,
        className
      );

      const Component = BaseComponent as any;
      return (
        <Component
          ref={ref}
          className={mergedClassName}
          style={{ ...mergedStyles, ...style }}
          {...restProps}
        />
      );
    }
  );

  ResponsiveStyledComponent.displayName = `Responsive${config.componentName}`;
  return ResponsiveStyledComponent;
}

/**
 * 创建条件样式化组件
 * @param BaseComponent 基础组件
 * @param componentName 组件名称
 * @param conditionalConfigs 条件样式配置数组
 * @returns 条件样式化组件
 */
export function createConditionalStyledComponent<T extends ComponentType<any>>(
  BaseComponent: T,
  componentName: string,
  conditionalConfigs: ConditionalStyleConfig[]
): any {
  const ConditionalStyledComponent = forwardRef<unknown, StyledComponentProps & React.ComponentProps<T>>(
    (props, ref) => {
      const {
        customStyles,
        className = '',
        style,
        ...restProps
      } = props;

      // 计算条件样式
      const conditionalStyles = useMemo(() => {
        const appliedStyles: ComponentStyleConfig[] = [];
        
        conditionalConfigs.forEach(config => {
          if (config.condition(props)) {
            appliedStyles.push(config.trueStyles);
          } else if (config.falseStyles) {
            appliedStyles.push(config.falseStyles);
          }
        });
        
        return StyleMerger.mergeStyles(...appliedStyles, customStyles);
      }, [props, customStyles]);

      const mergedClassName = StyleMerger.mergeClassNames(
        componentName.toLowerCase(),
        className
      );

      const Component = BaseComponent as any;
      return (
        <Component
          ref={ref}
          className={mergedClassName}
          style={{ ...conditionalStyles, ...style }}
          {...restProps}
        />
      );
    }
  );

  ConditionalStyledComponent.displayName = `Conditional${componentName}`;
  return ConditionalStyledComponent;
}

/**
 * 创建动画样式化组件
 * @param BaseComponent 基础组件
 * @param config 动画配置
 * @returns 动画样式化组件
 */
export function createAnimatedStyledComponent<T extends ComponentType<any>>(
  BaseComponent: T,
  config: AnimatedStyledConfig
): any {
  const AnimatedStyledComponent = forwardRef<unknown, StyledComponentProps & React.ComponentProps<T> & {
    animation?: string;
    transition?: string;
  }>(
    (props, ref) => {
      const {
        animation,
        transition,
        customStyles,
        className = '',
        style,
        ...restProps
      } = props;

      // 生成动画样式
      const animationStyles = useMemo(() => {
        const styles: Record<string, unknown> = { ...(config.baseStyles?.base as any || {}) };
        
        // 应用动画
        if (animation && config.animations[animation]) {
          const animConfig = config.animations[animation];
          styles.animation = `${animation} ${animConfig.duration || '0.3s'} ${animConfig.timingFunction || 'ease'} ${animConfig.delay || '0s'} ${animConfig.iterationCount || '1'} ${animConfig.direction || 'normal'} ${animConfig.fillMode || 'both'}`;
        }
        
        // 应用过渡
        if (transition && config.transitions?.[transition]) {
          const transConfig = config.transitions[transition];
          styles.transition = `${transition} ${transConfig.duration || '0.3s'} ${transConfig.timingFunction || 'ease'} ${transConfig.delay || '0s'}`;
        }
        
        return StyleMerger.mergeStyles(styles, customStyles);
      }, [animation, transition, customStyles]);

      // 注入动画关键帧到文档
      React.useEffect(() => {
        if (animation && config.animations[animation]) {
          const styleId = `animation-${config.componentName}-${animation}`;
          if (!document.getElementById(styleId)) {
            const styleElement = document.createElement('style');
            styleElement.id = styleId;
            styleElement.textContent = `@keyframes ${animation} { ${config.animations[animation].keyframes} }`;
            document.head.appendChild(styleElement);
          }
        }
      }, [animation]);

      const mergedClassName = StyleMerger.mergeClassNames(
        config.componentName.toLowerCase(),
        animation && `${config.componentName.toLowerCase()}--animated`,
        className
      );

      const Component = BaseComponent as any;
      return (
        <Component
          ref={ref}
          className={mergedClassName}
          style={{ ...animationStyles, ...style }}
          {...restProps}
        />
      );
    }
  );

  AnimatedStyledComponent.displayName = `Animated${config.componentName}`;
  return AnimatedStyledComponent;
}

/**
 * 样式化组件组合器
 * 将多个样式化组件功能组合在一起
 */
interface ComposerConfig {
  type: 'responsive' | 'conditional' | 'animated';
  config?: ResponsiveStyledConfig | AnimatedStyledConfig;
  componentName?: string;
  conditionalConfigs?: ConditionalStyleConfig[];
}

export class StyledComponentComposer {
  private configs: ComposerConfig[] = [];

  /**
   * 添加响应式功能
   */
  withResponsive(config: ResponsiveStyledConfig) {
    this.configs.push({ type: 'responsive', config });
    return this;
  }

  /**
   * 添加条件样式功能
   */
  withConditional(componentName: string, conditionalConfigs: ConditionalStyleConfig[]) {
    this.configs.push({ type: 'conditional', componentName, conditionalConfigs });
    return this;
  }

  /**
   * 添加动画功能
   */
  withAnimation(config: AnimatedStyledConfig) {
    this.configs.push({ type: 'animated', config });
    return this;
  }

  /**
   * 构建最终的样式化组件
   */
  build<T extends ComponentType<unknown>>(BaseComponent: T): ComponentType<unknown> {
    let FinalComponent: ComponentType<unknown> = BaseComponent as ComponentType<unknown>;

    this.configs.forEach(({ type, config, componentName, conditionalConfigs }) => {
      switch (type) {
        case 'responsive':
          FinalComponent = createResponsiveStyledComponent(FinalComponent as ComponentType<any>, config as ResponsiveStyledConfig) as ComponentType<unknown>;
          break;
        case 'conditional':
          FinalComponent = createConditionalStyledComponent(FinalComponent as ComponentType<any>, componentName!, conditionalConfigs!) as ComponentType<unknown>;
          break;
        case 'animated':
          FinalComponent = createAnimatedStyledComponent(FinalComponent as ComponentType<any>, config as AnimatedStyledConfig) as ComponentType<unknown>;
          break;
      }
    });

    return FinalComponent;
  }
}

/**
 * 样式化组件工具函数
 */
/**
 * 创建响应式值处理器
 */
function createResponsiveValueHandler<T>(value: ResponsiveValue<T>) {
  return (breakpoint: string): T => {
    if (typeof value === 'object' && value !== null) {
      return (value as Record<string, T>)[breakpoint] || (value as Record<string, T>).default || Object.values(value)[0];
    }
    return value as T;
  };
}

/**
 * 创建样式变体选择器
 */
function createVariantSelector(variants: Record<string, ComponentStyleConfig>) {
  return (variantName: string) => variants[variantName] || variants.default || Object.values(variants)[0];
}

/**
 * 创建尺寸选择器
 */
function createSizeSelector(sizes: Record<string, ComponentStyleConfig>) {
  return (sizeName: string) => sizes[sizeName] || sizes.md || Object.values(sizes)[0];
}

/**
 * 创建主题适配器
 */
function createThemeAdapter(themeMapping: Record<string, string>) {
  return (themeName: string) => themeMapping[themeName] || themeMapping.default || Object.values(themeMapping)[0];
}

export const StyledComponentUtils = {
  createResponsiveValueHandler,
  createVariantSelector,
  createSizeSelector,
  createThemeAdapter
};

// 所有功能已在上方单独导出，无需重复导出