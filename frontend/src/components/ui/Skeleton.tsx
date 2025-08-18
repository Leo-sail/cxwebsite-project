/**
 * Skeleton 骨架屏组件
 * 用于在内容加载时显示占位符
 */
import React from 'react';
import { cn } from '../../utils';

/**
 * Skeleton 变体
 */
export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

/**
 * Skeleton 动画类型
 */
export type SkeletonAnimation = 'pulse' | 'wave' | 'none';

/**
 * Skeleton 组件属性
 */
export interface SkeletonProps {
  /** 变体 */
  variant?: SkeletonVariant;
  /** 宽度 */
  width?: string | number;
  /** 高度 */
  height?: string | number;
  /** 动画类型 */
  animation?: SkeletonAnimation;
  /** 自定义类名 */
  className?: string;
  /** 子元素 */
  children?: React.ReactNode;
  /** 是否加载中 */
  loading?: boolean;
}

/**
 * Skeleton 主组件
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  className,
  children,
  loading = true,
}) => {
  if (!loading && children) {
    return <>{children}</>;
  }
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return '';
      case 'rounded':
        return 'rounded-lg';
      default:
        return 'h-4 rounded';
    }
  };
  
  const getAnimationClasses = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-pulse';
      case 'wave':
        return 'animate-wave';
      case 'none':
        return '';
      default:
        return 'animate-pulse';
    }
  };
  
  const style: React.CSSProperties = {};
  if (width !== undefined) {
    style.width = typeof width === 'number' ? `${width}px` : width;
  }
  if (height !== undefined) {
    style.height = typeof height === 'number' ? `${height}px` : height;
  }
  
  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700',
        getVariantClasses(),
        getAnimationClasses(),
        className
      )}
      style={style}
    />
  );
};

/**
 * SkeletonText 组件 - 文本骨架
 */
export interface SkeletonTextProps {
  /** 行数 */
  lines?: number;
  /** 最后一行宽度 */
  lastLineWidth?: string | number;
  /** 行间距 */
  spacing?: string;
  /** 自定义类名 */
  className?: string;
  /** 动画类型 */
  animation?: SkeletonAnimation;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  lastLineWidth = '60%',
  spacing = 'space-y-2',
  className,
  animation = 'pulse',
}) => {
  return (
    <div className={cn(spacing, className)}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? lastLineWidth : '100%'}
          animation={animation}
        />
      ))}
    </div>
  );
};

/**
 * SkeletonAvatar 组件 - 头像骨架
 */
export interface SkeletonAvatarProps {
  /** 尺寸 */
  size?: number;
  /** 自定义类名 */
  className?: string;
  /** 动画类型 */
  animation?: SkeletonAnimation;
}

export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size = 40,
  className,
  animation = 'pulse',
}) => {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      animation={animation}
      className={className}
    />
  );
};

/**
 * SkeletonCard 组件 - 卡片骨架
 */
export interface SkeletonCardProps {
  /** 是否显示头像 */
  avatar?: boolean;
  /** 头像尺寸 */
  avatarSize?: number;
  /** 标题行数 */
  titleLines?: number;
  /** 内容行数 */
  contentLines?: number;
  /** 是否显示操作区域 */
  actions?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 动画类型 */
  animation?: SkeletonAnimation;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  avatar = false,
  avatarSize = 40,
  titleLines = 1,
  contentLines = 3,
  actions = false,
  className,
  animation = 'pulse',
}) => {
  return (
    <div className={cn('p-4 border rounded-lg', className)}>
      {/* 头部 */}
      <div className="flex items-center space-x-3 mb-4">
        {avatar && (
          <SkeletonAvatar size={avatarSize} animation={animation} />
        )}
        <div className="flex-1">
          <SkeletonText lines={titleLines} animation={animation} />
        </div>
      </div>
      
      {/* 内容 */}
      <div className="mb-4">
        <SkeletonText lines={contentLines} animation={animation} />
      </div>
      
      {/* 操作区域 */}
      {actions && (
        <div className="flex space-x-2">
          <Skeleton
            variant="rounded"
            width={80}
            height={32}
            animation={animation}
          />
          <Skeleton
            variant="rounded"
            width={80}
            height={32}
            animation={animation}
          />
        </div>
      )}
    </div>
  );
};

/**
 * SkeletonList 组件 - 列表骨架
 */
export interface SkeletonListProps {
  /** 列表项数量 */
  count?: number;
  /** 是否显示头像 */
  avatar?: boolean;
  /** 头像尺寸 */
  avatarSize?: number;
  /** 内容行数 */
  lines?: number;
  /** 自定义类名 */
  className?: string;
  /** 动画类型 */
  animation?: SkeletonAnimation;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 5,
  avatar = true,
  avatarSize = 40,
  lines = 2,
  className,
  animation = 'pulse',
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex items-center space-x-3">
          {avatar && (
            <SkeletonAvatar size={avatarSize} animation={animation} />
          )}
          <div className="flex-1">
            <SkeletonText lines={lines} animation={animation} />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * SkeletonTable 组件 - 表格骨架
 */
export interface SkeletonTableProps {
  /** 行数 */
  rows?: number;
  /** 列数 */
  columns?: number;
  /** 是否显示表头 */
  header?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 动画类型 */
  animation?: SkeletonAnimation;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  header = true,
  className,
  animation = 'pulse',
}) => {
  return (
    <div className={cn('w-full', className)}>
      <table className="w-full">
        {header && (
          <thead>
            <tr>
              {Array.from({ length: columns }, (_, index) => (
                <th key={index} className="p-3 text-left">
                  <Skeleton
                    variant="text"
                    width="80%"
                    animation={animation}
                  />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {Array.from({ length: rows }, (_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }, (_, colIndex) => (
                <td key={colIndex} className="p-3">
                  <Skeleton
                    variant="text"
                    width={colIndex === 0 ? '60%' : '80%'}
                    animation={animation}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * SkeletonImage 组件 - 图片骨架
 */
export interface SkeletonImageProps {
  /** 宽度 */
  width?: string | number;
  /** 高度 */
  height?: string | number;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 动画类型 */
  animation?: SkeletonAnimation;
}

export const SkeletonImage: React.FC<SkeletonImageProps> = ({
  width = '100%',
  height = 200,
  showIcon = true,
  className,
  animation = 'pulse',
}) => {
  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded',
        animation === 'pulse' && 'animate-pulse',
        animation === 'wave' && 'animate-wave',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      {showIcon && (
        <svg
          className="w-8 h-8 text-gray-400 dark:text-gray-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  );
};

/**
 * SkeletonButton 组件 - 按钮骨架
 */
export interface SkeletonButtonProps {
  /** 宽度 */
  width?: string | number;
  /** 高度 */
  height?: string | number;
  /** 自定义类名 */
  className?: string;
  /** 动画类型 */
  animation?: SkeletonAnimation;
}

export const SkeletonButton: React.FC<SkeletonButtonProps> = ({
  width = 100,
  height = 36,
  className,
  animation = 'pulse',
}) => {
  return (
    <Skeleton
      variant="rounded"
      width={width}
      height={height}
      animation={animation}
      className={className}
    />
  );
};

export default Skeleton;