/**
 * 样式化组件系统统一导出
 * 提供完整的样式化组件功能接口
 */

import React from 'react';

// 基础样式化组件工厂
export {
  createStyledComponent
} from './StyledComponentFactory';

// 基础组件集合
export const StyledComponents = {
  Button: 'button',
  Input: 'input',
  Div: 'div',
  Span: 'span',
  Text: 'p',
  Container: 'div',
  Card: 'div',
  Modal: 'div',
  Header: 'header',
  Footer: 'footer',
  Section: 'section',
  Article: 'article',
  Nav: 'nav',
  Aside: 'aside',
  Main: 'main'
} as const;

export {
  withStyledComponent,
  StyledComponentFactories,
  createStyledElement,
  StyledComponent,
  type StyledComponentConfig
} from '../../utils/styledComponentUtils';

// 基础样式化组件
export {
  StyledContainer,
  StyledText,
  StyledHeading,
  StyledInput,
  StyledButton
} from './StyledComponents';

// 高级样式化组件功能
// 高级样式组件功能 - 已移除未使用的模块

// 样式化组件系统配置
export const StyledComponentSystemConfig = {
  // 默认断点配置
  defaultBreakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200,
    wide: 1600
  },
  
  // 默认动画配置
  defaultAnimations: {
    fadeIn: {
      keyframes: '0% { opacity: 0; } 100% { opacity: 1; }',
      duration: '0.3s',
      timingFunction: 'ease-in-out'
    },
    fadeOut: {
      keyframes: '0% { opacity: 1; } 100% { opacity: 0; }',
      duration: '0.3s',
      timingFunction: 'ease-in-out'
    },
    slideInUp: {
      keyframes: '0% { transform: translateY(100%); opacity: 0; } 100% { transform: translateY(0); opacity: 1; }',
      duration: '0.4s',
      timingFunction: 'ease-out'
    },
    slideInDown: {
      keyframes: '0% { transform: translateY(-100%); opacity: 0; } 100% { transform: translateY(0); opacity: 1; }',
      duration: '0.4s',
      timingFunction: 'ease-out'
    },
    slideInLeft: {
      keyframes: '0% { transform: translateX(-100%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; }',
      duration: '0.4s',
      timingFunction: 'ease-out'
    },
    slideInRight: {
      keyframes: '0% { transform: translateX(100%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; }',
      duration: '0.4s',
      timingFunction: 'ease-out'
    },
    scaleIn: {
      keyframes: '0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; }',
      duration: '0.3s',
      timingFunction: 'ease-out'
    },
    bounce: {
      keyframes: '0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); } 40%, 43% { transform: translate3d(0, -30px, 0); } 70% { transform: translate3d(0, -15px, 0); } 90% { transform: translate3d(0, -4px, 0); }',
      duration: '1s',
      timingFunction: 'ease'
    },
    pulse: {
      keyframes: '0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); }',
      duration: '2s',
      timingFunction: 'ease-in-out',
      iterationCount: 'infinite'
    },
    shake: {
      keyframes: '0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); } 20%, 40%, 60%, 80% { transform: translateX(10px); }',
      duration: '0.8s',
      timingFunction: 'ease-in-out'
    }
  },
  
  // 默认过渡配置
  defaultTransitions: {
    all: {
      duration: '0.3s',
      timingFunction: 'ease-in-out'
    },
    color: {
      duration: '0.2s',
      timingFunction: 'ease'
    },
    background: {
      duration: '0.2s',
      timingFunction: 'ease'
    },
    transform: {
      duration: '0.3s',
      timingFunction: 'ease-out'
    },
    opacity: {
      duration: '0.2s',
      timingFunction: 'ease'
    }
  },
  
  // 默认尺寸配置
  defaultSizes: {
    xs: {
      fontSize: 'var(--font-size-xs, 0.75rem)',
      padding: 'var(--spacing-1, 0.25rem) var(--spacing-2, 0.5rem)'
    },
    sm: {
      fontSize: 'var(--font-size-sm, 0.875rem)',
      padding: 'var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem)'
    },
    md: {
      fontSize: 'var(--font-size-base, 1rem)',
      padding: 'var(--spacing-2, 0.5rem) var(--spacing-4, 1rem)'
    },
    lg: {
      fontSize: 'var(--font-size-lg, 1.125rem)',
      padding: 'var(--spacing-3, 0.75rem) var(--spacing-6, 1.5rem)'
    },
    xl: {
      fontSize: 'var(--font-size-xl, 1.25rem)',
      padding: 'var(--spacing-4, 1rem) var(--spacing-8, 2rem)'
    }
  },
  
  // 默认变体配置
  defaultVariants: {
    primary: {
      backgroundColor: 'var(--color-primary, #3b82f6)',
      color: 'var(--color-primary-foreground, white)',
      borderColor: 'var(--color-primary, #3b82f6)'
    },
    secondary: {
      backgroundColor: 'var(--color-secondary, #6b7280)',
      color: 'var(--color-secondary-foreground, white)',
      borderColor: 'var(--color-secondary, #6b7280)'
    },
    success: {
      backgroundColor: 'var(--color-success, #10b981)',
      color: 'var(--color-success-foreground, white)',
      borderColor: 'var(--color-success, #10b981)'
    },
    warning: {
      backgroundColor: 'var(--color-warning, #f59e0b)',
      color: 'var(--color-warning-foreground, white)',
      borderColor: 'var(--color-warning, #f59e0b)'
    },
    danger: {
      backgroundColor: 'var(--color-danger, #ef4444)',
      color: 'var(--color-danger-foreground, white)',
      borderColor: 'var(--color-danger, #ef4444)'
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--color-primary, #3b82f6)',
      borderColor: 'var(--color-primary, #3b82f6)'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-text, #374151)',
      borderColor: 'transparent'
    }
  }
};

// 样式化组件系统工具函数
export const StyledComponentSystem = {
  /**
   * 获取所有可用的样式化组件
   */
  getComponents: () => StyledComponents,

  /**
   * 创建样式化组件
   */
  create: <T extends React.ComponentType<unknown>>(
    BaseComponent: T,
    componentName: string,
    options: {
      responsive?: boolean;
      animated?: boolean;
      defaultStyles?: Record<string, unknown>;
      variants?: Record<string, Record<string, unknown>>;
      sizes?: Record<string, Record<string, unknown>>;
    } = {}
  ) => {
    // 简单的样式化组件创建逻辑
    // 使用 componentName 和 options 参数
    console.log(`Creating styled component: ${componentName}`, options);
    return React.forwardRef((props: Record<string, unknown>, ref: React.Ref<unknown>) => {
      return React.createElement(BaseComponent as any, { ...props, ref });
    }) as any;
  },

  /**
   * 获取系统配置
   */
  getConfig: () => StyledComponentSystemConfig,

  /**
   * 更新系统配置
   */
  updateConfig: (newConfig: Partial<typeof StyledComponentSystemConfig>) => {
    Object.assign(StyledComponentSystemConfig, newConfig);
  }
};

// 默认导出
export default {
  // 基础组件
  StyledComponents,
  
  // 系统配置和工具
  StyledComponentSystemConfig,
  StyledComponentSystem
};