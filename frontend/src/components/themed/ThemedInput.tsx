/**
 * 主题化输入框组件
 * 支持多种变体、尺寸和状态的可主题化输入框
 */
import React, { forwardRef, useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { useComponentStyles } from '../../hooks/useTheme';
import { StyleMerger } from '../../utils/themeUtils';

/**
 * 输入框变体类型
 */
export type InputVariant = 'default' | 'filled' | 'outline' | 'underline' | 'ghost';

/**
 * 输入框尺寸类型
 */
export type InputSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * 输入框状态类型
 */
export type InputState = 'default' | 'error' | 'warning' | 'success';

/**
 * 输入框属性接口
 */
export interface ThemedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
  state?: InputState;
  label?: string;
  helperText?: string;
  errorText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
  fullWidth?: boolean;
  clearable?: boolean;
  loading?: boolean;
  onClear?: () => void;
}

/**
 * 默认样式配置
 */
const defaultStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--spacing-1, 0.25rem)'
  },
  
  label: {
    fontSize: 'var(--font-size-sm, 0.875rem)',
    fontWeight: '500',
    color: 'var(--color-text, #374151)',
    marginBottom: 'var(--spacing-1, 0.25rem)'
  },
  
  inputWrapper: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    width: '100%'
  },
  
  input: {
    fontFamily: 'var(--font-primary, inherit)',
    fontSize: 'var(--font-size-base, 1rem)',
    lineHeight: '1.5',
    color: 'var(--color-text, #374151)',
    backgroundColor: 'var(--color-background, white)',
    border: '1px solid var(--color-border, #d1d5db)',
    borderRadius: 'var(--border-radius-md, 0.375rem)',
    outline: 'none',
    transition: 'all 0.2s ease-in-out',
    width: '100%'
  },
  
  // 尺寸样式
  sizes: {
    xs: {
      fontSize: 'var(--font-size-xs, 0.75rem)',
      padding: 'var(--spacing-1, 0.25rem) var(--spacing-2, 0.5rem)',
      minHeight: '1.5rem'
    },
    sm: {
      fontSize: 'var(--font-size-sm, 0.875rem)',
      padding: 'var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem)',
      minHeight: '2rem'
    },
    md: {
      fontSize: 'var(--font-size-base, 1rem)',
      padding: 'var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem)',
      minHeight: '2.5rem'
    },
    lg: {
      fontSize: 'var(--font-size-lg, 1.125rem)',
      padding: 'var(--spacing-3, 0.75rem) var(--spacing-4, 1rem)',
      minHeight: '3rem'
    },
    xl: {
      fontSize: 'var(--font-size-xl, 1.25rem)',
      padding: 'var(--spacing-4, 1rem) var(--spacing-5, 1.25rem)',
      minHeight: '3.5rem'
    }
  },
  
  // 变体样式
  variants: {
    default: {
      backgroundColor: 'var(--color-background, white)',
      borderColor: 'var(--color-border, #d1d5db)'
    },
    filled: {
      backgroundColor: 'var(--color-muted, #f3f4f6)',
      borderColor: 'transparent'
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: 'var(--color-border, #d1d5db)',
      borderWidth: '2px'
    },
    underline: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderBottomColor: 'var(--color-border, #d1d5db)',
      borderRadius: '0',
      borderBottomWidth: '2px'
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent'
    }
  },
  
  // 状态样式
  states: {
    default: {},
    error: {
      borderColor: 'var(--color-danger, #ef4444)',
      color: 'var(--color-danger, #ef4444)'
    },
    warning: {
      borderColor: 'var(--color-warning, #f59e0b)',
      color: 'var(--color-warning, #f59e0b)'
    },
    success: {
      borderColor: 'var(--color-success, #10b981)',
      color: 'var(--color-success, #10b981)'
    }
  },
  
  // 交互状态样式
  interactions: {
    focus: {
      borderColor: 'var(--color-primary, #3b82f6)',
      boxShadow: '0 0 0 3px var(--color-primary-alpha, rgba(59, 130, 246, 0.1))'
    },
    hover: {
      borderColor: 'var(--color-primary-light, #60a5fa)'
    },
    disabled: {
      backgroundColor: 'var(--color-muted, #f3f4f6)',
      color: 'var(--color-text-muted, #9ca3af)',
      cursor: 'not-allowed',
      opacity: '0.6'
    }
  },
  
  // 图标样式
  icon: {
    position: 'absolute' as const,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--color-text-muted, #9ca3af)',
    pointerEvents: 'none' as const,
    zIndex: 1
  },
  
  leftIcon: {
    left: 'var(--spacing-3, 0.75rem)'
  },
  
  rightIcon: {
    right: 'var(--spacing-3, 0.75rem)'
  },
  
  // 附加组件样式
  addon: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 var(--spacing-3, 0.75rem)',
    backgroundColor: 'var(--color-muted, #f3f4f6)',
    border: '1px solid var(--color-border, #d1d5db)',
    color: 'var(--color-text-muted, #6b7280)',
    fontSize: 'var(--font-size-sm, 0.875rem)',
    whiteSpace: 'nowrap' as const
  },
  
  leftAddon: {
    borderTopLeftRadius: 'var(--border-radius-md, 0.375rem)',
    borderBottomLeftRadius: 'var(--border-radius-md, 0.375rem)',
    borderRight: 'none'
  },
  
  rightAddon: {
    borderTopRightRadius: 'var(--border-radius-md, 0.375rem)',
    borderBottomRightRadius: 'var(--border-radius-md, 0.375rem)',
    borderLeft: 'none'
  },
  
  // 帮助文本样式
  helperText: {
    fontSize: 'var(--font-size-xs, 0.75rem)',
    color: 'var(--color-text-muted, #6b7280)',
    marginTop: 'var(--spacing-1, 0.25rem)'
  },
  
  errorText: {
    fontSize: 'var(--font-size-xs, 0.75rem)',
    color: 'var(--color-danger, #ef4444)',
    marginTop: 'var(--spacing-1, 0.25rem)'
  }
};

/**
 * 清除按钮组件
 */
const ClearButton = ({ 
  onClick, 
  size = 'md' 
}: { 
  onClick: () => void; 
  size?: InputSize; 
}) => {
  const iconSize = {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem'
  }[size];

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: 'absolute',
        right: 'var(--spacing-3, 0.75rem)',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--color-text-muted, #9ca3af)',
        padding: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: iconSize,
        height: iconSize,
        zIndex: 2
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
};

/**
 * 加载指示器组件
 */
const LoadingSpinner = ({ size = 'md' }: { size?: InputSize }) => {
  const spinnerSize = {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem'
  }[size];

  return (
    <div
      style={{
        position: 'absolute',
        right: 'var(--spacing-3, 0.75rem)',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 2
      }}
    >
      <svg
        className="animate-spin"
        style={{
          width: spinnerSize,
          height: spinnerSize
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
    </div>
  );
};

/**
 * 主题化输入框组件
 */
export const ThemedInput = forwardRef<HTMLInputElement, ThemedInputProps>((
  {
    variant = 'default',
    size = 'md',
    state = 'default',
    label,
    helperText,
    errorText,
    leftIcon,
    rightIcon,
    leftAddon,
    rightAddon,
    fullWidth = false,
    clearable = false,
    loading = false,
    disabled,
    className = '',
    style,
    value,
    onClear,
    onChange,
    ...props
  },
  ref
) => {
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value || '');
  
  // 获取组件样式
  const { componentStyles, baseStyles } = useComponentStyles('Input', variant);
  
  // 处理值变化
  const currentValue = value !== undefined ? value : internalValue;
  const hasValue = currentValue && currentValue.toString().length > 0;
  
  // 合并输入框样式
  const inputStyles = StyleMerger.mergeStyles(
    defaultStyles.input,
    defaultStyles.sizes[size],
    defaultStyles.variants[variant],
    defaultStyles.states[state],
    baseStyles,
    componentStyles?.base || {},
    leftIcon ? { paddingLeft: 'var(--spacing-10, 2.5rem)' } : {},
    (rightIcon || clearable || loading) ? { paddingRight: 'var(--spacing-10, 2.5rem)' } : {},
    leftAddon ? { 
      borderTopLeftRadius: '0',
      borderBottomLeftRadius: '0',
      borderLeft: 'none'
    } : {},
    rightAddon ? { 
      borderTopRightRadius: '0',
      borderBottomRightRadius: '0',
      borderRight: 'none'
    } : {},
    disabled ? defaultStyles.interactions.disabled : {},
    isFocused ? defaultStyles.interactions.focus : {}
  );
  
  // 处理输入变化
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    
    if (value === undefined) {
      setInternalValue(newValue);
    }
    
    onChange?.(event);
  };
  
  // 处理清除
  const handleClear = () => {
    if (value === undefined) {
      setInternalValue('');
    }
    
    onClear?.();
    
    // 触发 onChange 事件
    if (onChange) {
      const event = {
        target: { value: '' },
        currentTarget: { value: '' }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
  };
  
  // 容器样式
  const containerStyles = {
    ...defaultStyles.container,
    ...(fullWidth ? { width: '100%' } : {}),
    ...style
  } as React.CSSProperties;
  
  // 组合类名
  const combinedClassName = StyleMerger.mergeClassNames(
    'themed-input',
    `input-${variant}`,
    `input-${size}`,
    `input-${state}`,
    disabled ? 'input-disabled' : '',
    isFocused ? 'input-focused' : '',
    fullWidth ? 'input-full-width' : '',
    className
  );
  
  return (
    <div className={combinedClassName} style={containerStyles}>
      {/* 标签 */}
      {label && (
        <label 
          style={{
            ...defaultStyles.label,
            ...(state !== 'default' && defaultStyles.states[state])
          }}
        >
          {label}
        </label>
      )}
      
      {/* 输入框容器 */}
      <div style={defaultStyles.inputWrapper}>
        {/* 左侧附加组件 */}
        {leftAddon && (
          <div 
            style={{
              ...defaultStyles.addon,
              ...defaultStyles.leftAddon,
              ...defaultStyles.sizes[size]
            }}
          >
            {leftAddon}
          </div>
        )}
        
        {/* 输入框 */}
        <div style={{ position: 'relative', flex: 1 }}>
          {/* 左侧图标 */}
          {leftIcon && (
            <div 
              style={{
                ...defaultStyles.icon,
                ...defaultStyles.leftIcon
              }}
            >
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            style={inputStyles}
            value={currentValue}
            disabled={disabled || loading}
            onChange={handleChange}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          
          {/* 右侧图标/清除按钮/加载指示器 */}
          {loading ? (
            <LoadingSpinner size={size} />
          ) : clearable && hasValue && !disabled ? (
            <ClearButton onClick={handleClear} size={size} />
          ) : rightIcon ? (
            <div 
              style={{
                ...defaultStyles.icon,
                ...defaultStyles.rightIcon
              }}
            >
              {rightIcon}
            </div>
          ) : null}
        </div>
        
        {/* 右侧附加组件 */}
        {rightAddon && (
          <div 
            style={{
              ...defaultStyles.addon,
              ...defaultStyles.rightAddon,
              ...defaultStyles.sizes[size]
            }}
          >
            {rightAddon}
          </div>
        )}
      </div>
      
      {/* 帮助文本或错误文本 */}
      {errorText ? (
        <div style={defaultStyles.errorText}>
          {errorText}
        </div>
      ) : helperText ? (
        <div style={defaultStyles.helperText}>
          {helperText}
        </div>
      ) : null}
    </div>
  );
});

ThemedInput.displayName = 'ThemedInput';

/**
 * 输入框组属性接口
 */
export interface InputGroupProps {
  children: ReactNode;
  variant?: InputVariant;
  size?: InputSize;
  orientation?: 'horizontal' | 'vertical';
  spacing?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 输入框组组件
 */
export function InputGroup({
  children,
  variant,
  size,
  orientation = 'vertical',
  spacing = '1rem',
  className = '',
  style
}: InputGroupProps) {
  const groupStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: orientation === 'vertical' ? 'column' : 'row',
    gap: spacing,
    ...style
  };

  // 克隆子元素并传递组属性
  const clonedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === ThemedInput) {
      return React.cloneElement(child as React.ReactElement<ThemedInputProps>, {
        variant: (child.props as ThemedInputProps)?.variant || variant,
        size: (child.props as ThemedInputProps)?.size || size
      });
    }
    return child;
  });

  return (
    <div 
      className={StyleMerger.mergeClassNames('input-group', `input-group-${orientation}`, className)}
      style={groupStyles}
    >
      {clonedChildren}
    </div>
  );
}

export default ThemedInput;