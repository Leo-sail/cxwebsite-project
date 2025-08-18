/**
 * 主题化按钮组件
 * 支持多种变体、尺寸和状态的可主题化按钮
 */
import React, { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useComponentStyles } from '../../hooks/useTheme';
import { useResponsive } from '../../hooks/useResponsive';
import { StyleMerger } from '../../utils/themeUtils';

/**
 * 按钮变体类型
 */
export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'outline' 
  | 'ghost' 
  | 'link' 
  | 'danger' 
  | 'success' 
  | 'warning';

/**
 * 按钮尺寸类型
 */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * 按钮属性接口
 */
export interface ThemedButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: boolean;
  elevation?: boolean;
  children?: ReactNode;
}

/**
 * 默认样式配置
 */
const defaultStyles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-primary, inherit)',
    fontWeight: '500',
    textDecoration: 'none',
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    userSelect: 'none' as const,
    whiteSpace: 'nowrap' as const,
    verticalAlign: 'middle',
    lineHeight: '1.2'
  },
  
  // 尺寸样式
  sizes: {
    xs: {
      fontSize: 'var(--font-size-xs, 0.75rem)',
      padding: 'var(--spacing-1, 0.25rem) var(--spacing-2, 0.5rem)',
      minHeight: '1.5rem',
      borderRadius: 'var(--border-radius-sm, 0.25rem)'
    },
    sm: {
      fontSize: 'var(--font-size-sm, 0.875rem)',
      padding: 'var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem)',
      minHeight: '2rem',
      borderRadius: 'var(--border-radius-md, 0.375rem)'
    },
    md: {
      fontSize: 'var(--font-size-base, 1rem)',
      padding: 'var(--spacing-2, 0.5rem) var(--spacing-4, 1rem)',
      minHeight: '2.5rem',
      borderRadius: 'var(--border-radius-md, 0.375rem)'
    },
    lg: {
      fontSize: 'var(--font-size-lg, 1.125rem)',
      padding: 'var(--spacing-3, 0.75rem) var(--spacing-6, 1.5rem)',
      minHeight: '3rem',
      borderRadius: 'var(--border-radius-lg, 0.5rem)'
    },
    xl: {
      fontSize: 'var(--font-size-xl, 1.25rem)',
      padding: 'var(--spacing-4, 1rem) var(--spacing-8, 2rem)',
      minHeight: '3.5rem',
      borderRadius: 'var(--border-radius-lg, 0.5rem)'
    }
  },
  
  // 变体样式
  variants: {
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
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--color-primary, #3b82f6)',
      borderColor: 'var(--color-primary, #3b82f6)'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-text, #374151)',
      borderColor: 'transparent'
    },
    link: {
      backgroundColor: 'transparent',
      color: 'var(--color-primary, #3b82f6)',
      borderColor: 'transparent',
      textDecoration: 'underline',
      padding: '0'
    },
    danger: {
      backgroundColor: 'var(--color-danger, #ef4444)',
      color: 'var(--color-danger-foreground, white)',
      borderColor: 'var(--color-danger, #ef4444)'
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
    }
  },
  
  // 状态样式
  states: {
    hover: {
      transform: 'translateY(-1px)',
      boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))'
    },
    active: {
      transform: 'translateY(0)'
    },
    focus: {
      boxShadow: '0 0 0 3px var(--color-primary-alpha, rgba(59, 130, 246, 0.1))'
    },
    disabled: {
      opacity: '0.5',
      cursor: 'not-allowed',
      transform: 'none'
    },
    loading: {
      cursor: 'wait'
    }
  }
};

/**
 * 加载指示器组件
 */
const LoadingSpinner = ({ size = 'md' }: { size?: ButtonSize }) => {
  const spinnerSize = {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem'
  }[size];

  return (
    <svg
      className="animate-spin"
      style={{
        width: spinnerSize,
        height: spinnerSize,
        marginRight: '0.5rem'
      }}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

/**
 * 主题化按钮组件
 */
export const ThemedButton = forwardRef<HTMLButtonElement, ThemedButtonProps>((
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    rounded = false,
    elevation = false,
    disabled,
    className = '',
    style,
    children,
    ...props
  },
  ref
) => {
  const { isMobile } = useResponsive();
  
  // 获取组件样式
  const { componentStyles, getStateStyles, baseStyles } = useComponentStyles('Button', variant);
  
  // 合并样式
  const mergedStyles = {
    ...defaultStyles.base,
    ...defaultStyles.sizes[size],
    ...defaultStyles.variants[variant],
    ...baseStyles,
    ...(componentStyles || {}),
    ...(fullWidth && { width: '100%' }),
    ...(rounded && { borderRadius: '9999px' }),
    ...(elevation && { boxShadow: 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))' }),
    ...style
  } as React.CSSProperties;

  // 状态样式
  const hoverStyles = {
    ...defaultStyles.states.hover,
    ...(getStateStyles('hover') || {})
  } as React.CSSProperties;

  const activeStyles = {
    ...defaultStyles.states.active,
    ...(getStateStyles('active') || {})
  } as React.CSSProperties;

  const focusStyles = {
    ...defaultStyles.states.focus,
    ...(getStateStyles('focus') || {})
  } as React.CSSProperties;

  const disabledStyles = {
    ...defaultStyles.states.disabled,
    ...(getStateStyles('disabled') || {})
  } as React.CSSProperties;

  const loadingStyles = {
    ...defaultStyles.states.loading,
    ...(getStateStyles('loading') || {})
  } as React.CSSProperties;

  // 处理点击事件
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) {
      event.preventDefault();
      return;
    }
    
    // 移动端触觉反馈
    if (isMobile && 'vibrate' in navigator) {
      navigator.vibrate(10); // 轻微震动反馈
    }
    
    props.onClick?.(event);
  };
  
  // 移动端触摸事件处理
  const handleTouchStart = (event: React.TouchEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && isMobile) {
      // 应用触摸状态样式
      Object.assign(event.currentTarget.style, { ...mergedStyles, ...activeStyles });
    }
    props.onTouchStart?.(event);
  };
  
  const handleTouchEnd = (event: React.TouchEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && isMobile) {
      // 恢复正常样式
      Object.assign(event.currentTarget.style, mergedStyles);
    }
    props.onTouchEnd?.(event);
  };
  
  const handleTouchCancel = (event: React.TouchEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && isMobile) {
      // 恢复正常样式
      Object.assign(event.currentTarget.style, mergedStyles);
    }
    props.onTouchCancel?.(event);
  };

  // 渲染图标
  const renderIcon = () => {
    if (loading) {
      return <LoadingSpinner size={size} />;
    }
    
    if (icon) {
      return (
        <span 
          className="button-icon"
          style={{
            marginRight: iconPosition === 'left' && children ? '0.5rem' : '0',
            marginLeft: iconPosition === 'right' && children ? '0.5rem' : '0'
          }}
        >
          {icon}
        </span>
      );
    }
    
    return null;
  };

  // 组合类名
  const combinedClassName = StyleMerger.mergeClassNames(
    'themed-button',
    `button-${variant}`,
    `button-${size}`,
    loading && 'button-loading',
    disabled && 'button-disabled',
    fullWidth && 'button-full-width',
    rounded && 'button-rounded',
    elevation && 'button-elevated',
    className
  );

  return (
    <button
      ref={ref}
      className={combinedClassName}
      style={{
        ...mergedStyles,
        ...(disabled && disabledStyles),
        ...(loading && loadingStyles)
      }}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, hoverStyles);
        }
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, mergedStyles);
        }
        props.onMouseLeave?.(e);
      }}
      onMouseDown={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, { ...mergedStyles, ...activeStyles });
        }
        props.onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, mergedStyles);
        }
        props.onMouseUp?.(e);
      }}
      onFocus={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, { ...mergedStyles, ...focusStyles });
        }
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, mergedStyles);
        }
        props.onBlur?.(e);
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      {...props}
    >
      {iconPosition === 'left' && renderIcon()}
      {children && (
        <span className="button-content">
          {children}
        </span>
      )}
      {iconPosition === 'right' && renderIcon()}
    </button>
  );
});

ThemedButton.displayName = 'ThemedButton';

/**
 * 按钮组组件属性接口
 */
export interface ButtonGroupProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  orientation?: 'horizontal' | 'vertical';
  spacing?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 按钮组组件
 */
export function ButtonGroup({
  children,
  variant,
  size,
  orientation = 'horizontal',
  spacing = '0.5rem',
  className = '',
  style
}: ButtonGroupProps) {
  const groupStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: orientation === 'vertical' ? 'column' : 'row',
    gap: spacing,
    ...style
  };

  // 克隆子元素并传递组属性
  const clonedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === ThemedButton) {
      const childProps = child.props as ThemedButtonProps;
      return React.cloneElement(child, {
        variant: childProps.variant || variant,
        size: childProps.size || size
      } as Partial<ThemedButtonProps>);
    }
    return child;
  });

  return (
    <div 
      className={StyleMerger.mergeClassNames('button-group', `button-group-${orientation}`, className)}
      style={groupStyles}
    >
      {clonedChildren}
    </div>
  );
}

export default ThemedButton;