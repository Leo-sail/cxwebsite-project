/**
 * 主题化卡片组件
 * 支持多种变体、尺寸和状态的可主题化卡片
 */
import React, { type ReactNode, type HTMLAttributes } from 'react';
import { useComponentStyles } from '../../hooks/useTheme';
import { StyleMerger } from '../../utils/themeUtils';

/**
 * 卡片变体类型
 */
export type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled' | 'ghost';

/**
 * 卡片尺寸类型
 */
export type CardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * 卡片状态类型
 */
export type CardState = 'default' | 'hover' | 'active' | 'disabled';

/**
 * 卡片属性接口
 */
export interface ThemedCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  size?: CardSize;
  state?: CardState;
  hoverable?: boolean;
  clickable?: boolean;
  loading?: boolean;
  bordered?: boolean;
  shadow?: boolean;
  rounded?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
}

/**
 * 卡片头部属性接口
 */
export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
  avatar?: ReactNode;
  actions?: ReactNode;
  bordered?: boolean;
}

/**
 * 卡片内容属性接口
 */
export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
}

/**
 * 卡片底部属性接口
 */
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  actions?: ReactNode;
  bordered?: boolean;
  align?: 'left' | 'center' | 'right';
}

/**
 * 默认样式配置
 */
const defaultStyles = {
  card: {
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: 'var(--color-background, white)',
    border: '1px solid var(--color-border, #e5e7eb)',
    borderRadius: 'var(--border-radius-lg, 0.5rem)',
    overflow: 'hidden',
    transition: 'all 0.2s ease-in-out',
    position: 'relative' as const
  },
  
  // 尺寸样式
  sizes: {
    xs: {
      fontSize: 'var(--font-size-xs, 0.75rem)',
      minHeight: '4rem'
    },
    sm: {
      fontSize: 'var(--font-size-sm, 0.875rem)',
      minHeight: '6rem'
    },
    md: {
      fontSize: 'var(--font-size-base, 1rem)',
      minHeight: '8rem'
    },
    lg: {
      fontSize: 'var(--font-size-lg, 1.125rem)',
      minHeight: '10rem'
    },
    xl: {
      fontSize: 'var(--font-size-xl, 1.25rem)',
      minHeight: '12rem'
    }
  },
  
  // 变体样式
  variants: {
    default: {
      backgroundColor: 'var(--color-background, white)',
      borderColor: 'var(--color-border, #e5e7eb)',
      boxShadow: 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))'
    },
    elevated: {
      backgroundColor: 'var(--color-background, white)',
      borderColor: 'transparent',
      boxShadow: 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05))'
    },
    outlined: {
      backgroundColor: 'transparent',
      borderColor: 'var(--color-border, #e5e7eb)',
      borderWidth: '2px',
      boxShadow: 'none'
    },
    filled: {
      backgroundColor: 'var(--color-muted, #f9fafb)',
      borderColor: 'var(--color-border, #e5e7eb)',
      boxShadow: 'none'
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      boxShadow: 'none'
    }
  },
  
  // 状态样式
  states: {
    default: {},
    hover: {
      transform: 'translateY(-2px)',
      boxShadow: 'var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04))'
    },
    active: {
      transform: 'translateY(0)',
      boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06))'
    },
    disabled: {
      opacity: '0.6',
      cursor: 'not-allowed',
      pointerEvents: 'none' as const
    }
  },
  
  // 头部样式
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: 'var(--spacing-4, 1rem) var(--spacing-4, 1rem) var(--spacing-2, 0.5rem)',
    borderBottom: '1px solid var(--color-border, #e5e7eb)'
  },
  
  headerContent: {
    flex: 1,
    minWidth: 0
  },
  
  headerTitle: {
    fontSize: 'var(--font-size-lg, 1.125rem)',
    fontWeight: '600',
    color: 'var(--color-text, #111827)',
    margin: 0,
    lineHeight: '1.5'
  },
  
  headerSubtitle: {
    fontSize: 'var(--font-size-sm, 0.875rem)',
    color: 'var(--color-text-muted, #6b7280)',
    margin: 'var(--spacing-1, 0.25rem) 0 0',
    lineHeight: '1.4'
  },
  
  headerAvatar: {
    marginRight: 'var(--spacing-3, 0.75rem)',
    flexShrink: 0
  },
  
  headerExtra: {
    marginLeft: 'var(--spacing-3, 0.75rem)',
    flexShrink: 0
  },
  
  headerActions: {
    marginTop: 'var(--spacing-2, 0.5rem)',
    display: 'flex',
    gap: 'var(--spacing-2, 0.5rem)'
  },
  
  // 内容样式
  content: {
    flex: 1,
    padding: 'var(--spacing-4, 1rem)',
    color: 'var(--color-text, #374151)',
    lineHeight: '1.6'
  },
  
  contentNoPadding: {
    padding: 0
  },
  
  // 底部样式
  footer: {
    padding: 'var(--spacing-2, 0.5rem) var(--spacing-4, 1rem) var(--spacing-4, 1rem)',
    borderTop: '1px solid var(--color-border, #e5e7eb)',
    backgroundColor: 'var(--color-muted, #f9fafb)'
  },
  
  footerActions: {
    display: 'flex',
    gap: 'var(--spacing-2, 0.5rem)'
  },
  
  footerLeft: {
    justifyContent: 'flex-start'
  },
  
  footerCenter: {
    justifyContent: 'center'
  },
  
  footerRight: {
    justifyContent: 'flex-end'
  },
  
  // 加载状态样式
  loading: {
    position: 'relative' as const
  },
  
  loadingOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10
  }
};

/**
 * 加载指示器组件
 */
const LoadingSpinner = () => {
  return (
    <div style={defaultStyles.loadingOverlay}>
      <svg
        className="animate-spin"
        style={{
          width: '2rem',
          height: '2rem',
          color: 'var(--color-primary, #3b82f6)'
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
 * 卡片头部组件
 */
export function CardHeader({
  title,
  subtitle,
  extra,
  avatar,
  actions,
  bordered = true,
  className = '',
  style,
  children,
  ...props
}: CardHeaderProps) {
  const headerStyles = {
    ...defaultStyles.header,
    ...(!bordered && { borderBottom: 'none' }),
    ...style
  } as React.CSSProperties;

  return (
    <div 
      className={StyleMerger.mergeClassNames('card-header', className)}
      style={headerStyles}
      {...props}
    >
      {avatar && (
        <div style={defaultStyles.headerAvatar}>
          {avatar}
        </div>
      )}
      
      <div style={defaultStyles.headerContent}>
        {title && (
          <div style={defaultStyles.headerTitle}>
            {title}
          </div>
        )}
        
        {subtitle && (
          <div style={defaultStyles.headerSubtitle}>
            {subtitle}
          </div>
        )}
        
        {actions && (
          <div style={defaultStyles.headerActions}>
            {actions}
          </div>
        )}
        
        {children}
      </div>
      
      {extra && (
        <div style={defaultStyles.headerExtra}>
          {extra}
        </div>
      )}
    </div>
  );
}

/**
 * 卡片内容组件
 */
export function CardContent({
  padding = true,
  className = '',
  style,
  children,
  ...props
}: CardContentProps) {
  const contentStyles = {
    ...defaultStyles.content,
    ...(!padding && defaultStyles.contentNoPadding),
    ...style
  } as React.CSSProperties;

  return (
    <div 
      className={StyleMerger.mergeClassNames('card-content', className)}
      style={contentStyles}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * 卡片底部组件
 */
export function CardFooter({
  actions,
  bordered = true,
  align = 'right',
  className = '',
  style,
  children,
  ...props
}: CardFooterProps) {
  const footerStyles = {
    ...defaultStyles.footer,
    ...(!bordered && { borderTop: 'none', backgroundColor: 'transparent' }),
    ...style
  } as React.CSSProperties;

  const actionsStyles = {
    ...defaultStyles.footerActions,
    ...defaultStyles[`footer${align.charAt(0).toUpperCase() + align.slice(1)}` as keyof typeof defaultStyles]
  } as React.CSSProperties;

  return (
    <div 
      className={StyleMerger.mergeClassNames('card-footer', className)}
      style={footerStyles}
      {...props}
    >
      {actions ? (
        <div style={actionsStyles}>
          {actions}
        </div>
      ) : children ? (
        <div style={actionsStyles}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

/**
 * 主题化卡片组件
 */
export function ThemedCard({
  variant = 'default',
  size = 'md',
  state = 'default',
  hoverable = false,
  clickable = false,
  loading = false,
  bordered = true,
  shadow = true,
  rounded = true,
  fullWidth = false,
  className = '',
  style,
  children,
  onMouseEnter,
  onMouseLeave,
  onClick,
  ...props
}: ThemedCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);
  
  // 获取组件样式
  const { componentStyles, baseStyles } = useComponentStyles('Card', variant);
  
  // 合并卡片样式
  const cardStyles = {
    ...defaultStyles.card,
    ...defaultStyles.sizes[size],
    ...defaultStyles.variants[variant],
    ...baseStyles,
    ...(componentStyles?.base || {}),
    ...(!bordered && { border: 'none' }),
    ...(!shadow && { boxShadow: 'none' }),
    ...(!rounded && { borderRadius: '0' }),
    ...(fullWidth && { width: '100%' }),
    ...(state !== 'default' && defaultStyles.states[state]),
    ...(hoverable && isHovered && defaultStyles.states.hover),
    ...(clickable && isActive && defaultStyles.states.active),
    ...((clickable || hoverable) && { cursor: 'pointer' }),
    ...(loading && defaultStyles.loading),
    ...style
  } as React.CSSProperties;
  
  // 处理鼠标事件
  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    if (hoverable) {
      setIsHovered(true);
    }
    onMouseEnter?.(event);
  };
  
  const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    if (hoverable) {
      setIsHovered(false);
    }
    if (clickable) {
      setIsActive(false);
    }
    onMouseLeave?.(event);
  };
  
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (clickable) {
      setIsActive(true);
      setTimeout(() => setIsActive(false), 150);
    }
    onClick?.(event);
  };
  
  // 组合类名
  const combinedClassName = StyleMerger.mergeClassNames(
    'themed-card',
    `card-${variant}`,
    `card-${size}`,
    `card-${state}`,
    hoverable && 'card-hoverable',
    clickable && 'card-clickable',
    loading && 'card-loading',
    isHovered && 'card-hovered',
    isActive && 'card-active',
    fullWidth && 'card-full-width',
    className
  );
  
  return (
    <div
      className={combinedClassName}
      style={cardStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      {...props}
    >
      {children}
      {loading && <LoadingSpinner />}
    </div>
  );
}

/**
 * 卡片网格属性接口
 */
export interface CardGridProps {
  children: ReactNode;
  columns?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  gap?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 卡片网格组件
 */
export function CardGrid({
  children,
  columns = 3,
  gap = '1rem',
  className = '',
  style
}: CardGridProps) {
  // 处理响应式列数
  const getGridColumns = () => {
    if (typeof columns === 'number') {
      return `repeat(${columns}, 1fr)`;
    }
    
    // 响应式列数处理
    const breakpoints = {
      xs: columns.xs || 1,
      sm: columns.sm || columns.xs || 1,
      md: columns.md || columns.sm || columns.xs || 2,
      lg: columns.lg || columns.md || columns.sm || columns.xs || 3,
      xl: columns.xl || columns.lg || columns.md || columns.sm || columns.xs || 4
    };
    
    return `repeat(${breakpoints.md}, 1fr)`;
  };
  
  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: getGridColumns(),
    gap,
    width: '100%',
    ...style
  };
  
  return (
    <div 
      className={StyleMerger.mergeClassNames('card-grid', className)}
      style={gridStyles}
    >
      {children}
    </div>
  );
}

// 导出组件
export default ThemedCard;