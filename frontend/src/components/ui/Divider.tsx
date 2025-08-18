/**
 * Divider 分割线组件
 * 支持水平和垂直方向，多种样式和自定义内容
 */
import React from 'react';
import { cn } from '../../utils';

/**
 * Divider 方向
 */
export type DividerOrientation = 'horizontal' | 'vertical';

/**
 * Divider 样式
 */
export type DividerVariant = 'solid' | 'dashed' | 'dotted';

/**
 * Divider 尺寸
 */
export type DividerSize = 'sm' | 'md' | 'lg';

/**
 * Divider 文字位置
 */
export type DividerTextPosition = 'left' | 'center' | 'right';

/**
 * Divider 组件属性
 */
export interface DividerProps {
  /** 方向 */
  orientation?: DividerOrientation;
  /** 样式变体 */
  variant?: DividerVariant;
  /** 尺寸 */
  size?: DividerSize;
  /** 分割线颜色 */
  color?: string;
  /** 文字内容 */
  children?: React.ReactNode;
  /** 文字位置 */
  textPosition?: DividerTextPosition;
  /** 自定义类名 */
  className?: string;
  /** 是否为虚线 */
  dashed?: boolean;
  /** 间距 */
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Divider 主组件
 */
export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'solid',
  size = 'md',
  color,
  children,
  textPosition = 'center',
  className,
  dashed = false,
  spacing = 'md',
}) => {
  const sizeConfig = {
    sm: {
      horizontal: 'border-t',
      vertical: 'border-l',
      thickness: 'border-t border-l',
      text: 'text-xs px-2',
      height: 'h-4',
    },
    md: {
      horizontal: 'border-t',
      vertical: 'border-l',
      thickness: 'border-t-2 border-l-2',
      text: 'text-sm px-3',
      height: 'h-6',
    },
    lg: {
      horizontal: 'border-t-2',
      vertical: 'border-l-2',
      thickness: 'border-t-4 border-l-4',
      text: 'text-base px-4',
      height: 'h-8',
    },
  };
  
  const spacingConfig = {
    sm: {
      horizontal: 'my-2',
      vertical: 'mx-2',
    },
    md: {
      horizontal: 'my-4',
      vertical: 'mx-4',
    },
    lg: {
      horizontal: 'my-6',
      vertical: 'mx-6',
    },
    xl: {
      horizontal: 'my-8',
      vertical: 'mx-8',
    },
  };
  
  const config = sizeConfig[size];
  const spacingClass = spacingConfig[spacing];
  
  const getVariantClasses = () => {
    const baseColor = color || 'border-gray-300';
    
    switch (variant) {
      case 'dashed':
        return `border-dashed ${baseColor}`;
      case 'dotted':
        return `border-dotted ${baseColor}`;
      default:
        return `border-solid ${baseColor}`;
    }
  };
  
  const getDividerClasses = () => {
    const variantClasses = dashed ? 'border-dashed' : getVariantClasses();
    
    if (orientation === 'vertical') {
      return cn(
        'inline-block',
        config.vertical,
        config.height,
        variantClasses,
        spacingClass.vertical
      );
    }
    
    return cn(
      'w-full',
      config.horizontal,
      variantClasses,
      spacingClass.horizontal
    );
  };
  
  const getTextPositionClasses = () => {
    switch (textPosition) {
      case 'left':
        return 'justify-start';
      case 'right':
        return 'justify-end';
      default:
        return 'justify-center';
    }
  };
  
  // 垂直分割线不支持文字
  if (orientation === 'vertical') {
    return (
      <div
        className={cn(getDividerClasses(), className)}
        style={{ borderColor: color }}
      />
    );
  }
  
  // 水平分割线
  if (!children) {
    return (
      <div
        className={cn(getDividerClasses(), className)}
        style={{ borderColor: color }}
      />
    );
  }
  
  // 带文字的水平分割线
  return (
    <div className={cn(
      'relative flex items-center',
      getTextPositionClasses(),
      spacingClass.horizontal,
      className
    )}>
      <div
        className={cn(
          'flex-1',
          config.horizontal,
          getVariantClasses()
        )}
        style={{ borderColor: color }}
      />
      
      <span className={cn(
        'bg-white text-gray-500 font-medium',
        config.text
      )}>
        {children}
      </span>
      
      <div
        className={cn(
          'flex-1',
          config.horizontal,
          getVariantClasses()
        )}
        style={{ borderColor: color }}
      />
    </div>
  );
};

/**
 * SectionDivider 组件 - 带标题的分割线
 */
export interface SectionDividerProps {
  /** 标题 */
  title: string;
  /** 副标题 */
  subtitle?: string;
  /** 图标 */
  icon?: React.ReactNode;
  /** 尺寸 */
  size?: DividerSize;
  /** 文字位置 */
  textPosition?: DividerTextPosition;
  /** 自定义类名 */
  className?: string;
  /** 分割线颜色 */
  color?: string;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({
  title,
  subtitle,
  icon,
  size = 'md',
  textPosition = 'center',
  className,
  color,
}) => {
  const sizeConfig = {
    sm: {
      title: 'text-sm font-medium',
      subtitle: 'text-xs',
      padding: 'px-3 py-1',
      gap: 'gap-1',
    },
    md: {
      title: 'text-base font-medium',
      subtitle: 'text-sm',
      padding: 'px-4 py-2',
      gap: 'gap-2',
    },
    lg: {
      title: 'text-lg font-semibold',
      subtitle: 'text-base',
      padding: 'px-6 py-3',
      gap: 'gap-3',
    },
  };
  
  const config = sizeConfig[size];
  
  const getTextPositionClasses = () => {
    switch (textPosition) {
      case 'left':
        return 'justify-start';
      case 'right':
        return 'justify-end';
      default:
        return 'justify-center';
    }
  };
  
  return (
    <div className={cn(
      'relative flex items-center my-6',
      getTextPositionClasses(),
      className
    )}>
      <div
        className="flex-1 border-t border-gray-300"
        style={{ borderColor: color }}
      />
      
      <div className={cn(
        'bg-white flex items-center',
        config.padding,
        config.gap
      )}>
        {icon && (
          <span className="text-gray-500">
            {icon}
          </span>
        )}
        
        <div className="text-center">
          <h3 className={cn(config.title, 'text-gray-900')}>
            {title}
          </h3>
          {subtitle && (
            <p className={cn(config.subtitle, 'text-gray-500 mt-1')}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      <div
        className="flex-1 border-t border-gray-300"
        style={{ borderColor: color }}
      />
    </div>
  );
};

/**
 * SpaceDivider 组件 - 纯空白分割
 */
export interface SpaceDividerProps {
  /** 高度 */
  height?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  /** 自定义类名 */
  className?: string;
}

export const SpaceDivider: React.FC<SpaceDividerProps> = ({
  height = 'md',
  className,
}) => {
  const heightClasses = {
    xs: 'h-2',
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-12',
    '2xl': 'h-16',
    '3xl': 'h-24',
  };
  
  return (
    <div className={cn(heightClasses[height], className)} />
  );
};

/**
 * GradientDivider 组件 - 渐变分割线
 */
export interface GradientDividerProps {
  /** 渐变方向 */
  direction?: 'left' | 'right' | 'center';
  /** 渐变颜色 */
  colors?: [string, string];
  /** 高度 */
  height?: DividerSize;
  /** 自定义类名 */
  className?: string;
  /** 间距 */
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
}

export const GradientDivider: React.FC<GradientDividerProps> = ({
  direction = 'center',
  colors = ['transparent', '#e5e7eb'],
  height = 'md',
  className,
  spacing = 'md',
}) => {
  const heightClasses = {
    sm: 'h-px',
    md: 'h-0.5',
    lg: 'h-1',
  };
  
  const spacingClasses = {
    sm: 'my-2',
    md: 'my-4',
    lg: 'my-6',
    xl: 'my-8',
  };
  
  const getGradientStyle = (): React.CSSProperties => {
    const [color1, color2] = colors;
    
    switch (direction) {
      case 'left':
        return {
          background: `linear-gradient(to right, ${color2}, ${color1})`,
        };
      case 'right':
        return {
          background: `linear-gradient(to right, ${color1}, ${color2})`,
        };
      default:
        return {
          background: `linear-gradient(to right, ${color1}, ${color2}, ${color1})`,
        };
    }
  };
  
  return (
    <div
      className={cn(
        'w-full',
        heightClasses[height],
        spacingClasses[spacing],
        className
      )}
      style={getGradientStyle()}
    />
  );
};

export default Divider;