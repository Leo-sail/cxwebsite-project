/**
 * Avatar 头像组件
 * 支持图片、文字、图标等多种显示方式
 */
import React from 'react';
import { cn } from '../../utils';

/**
 * Avatar 尺寸类型
 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Avatar 形状类型
 */
export type AvatarShape = 'circle' | 'square' | 'rounded';

/**
 * Avatar 状态类型
 */
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

/**
 * Avatar 组件属性
 */
export interface AvatarProps {
  /** 头像图片URL */
  src?: string;
  /** 替代文本 */
  alt?: string;
  /** 显示的文字（当没有图片时） */
  children?: React.ReactNode;
  /** 尺寸 */
  size?: AvatarSize;
  /** 形状 */
  shape?: AvatarShape;
  /** 在线状态 */
  status?: AvatarStatus;
  /** 是否显示状态指示器 */
  showStatus?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 点击事件 */
  onClick?: () => void;
}

/**
 * Avatar 组件
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  children,
  size = 'md',
  shape = 'circle',
  status,
  showStatus = false,
  className,
  onClick,
}) => {
  const baseClasses = 'relative inline-flex items-center justify-center overflow-hidden bg-gray-100 font-medium text-gray-600 transition-all duration-200';
  
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };
  
  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-lg',
  };
  
  const statusClasses = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };
  
  const statusSizeClasses = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
  };
  
  const clickableClasses = onClick ? 'cursor-pointer hover:opacity-80' : '';
  
  return (
    <div className="relative inline-block">
      <div
        className={cn(
          baseClasses,
          sizeClasses[size],
          shapeClasses[shape],
          clickableClasses,
          className
        )}
        onClick={onClick}
      >
        {src && src.trim() !== '' ? (
          <img
            src={src}
            alt={alt || ''}
            className="w-full h-full object-cover"
            onError={(e) => {
              // 图片加载失败时隐藏图片，显示fallback内容
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          children
        )}
      </div>
      
      {/* 状态指示器 */}
      {showStatus && status && (
        <div
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-white',
            statusClasses[status],
            statusSizeClasses[size]
          )}
        />
      )}
    </div>
  );
};

/**
 * AvatarGroup 头像组组件
 */
export interface AvatarGroupProps {
  /** 子头像组件 */
  children: React.ReactNode;
  /** 最大显示数量 */
  max?: number;
  /** 头像尺寸 */
  size?: AvatarSize;
  /** 自定义类名 */
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  max = 5,
  size = 'md',
  className,
}) => {
  const childrenArray = React.Children.toArray(children);
  const visibleChildren = childrenArray.slice(0, max);
  const remainingCount = childrenArray.length - max;
  
  return (
    <div className={cn('flex -space-x-2', className)}>
      {visibleChildren.map((child, index) => (
        <div key={index} className="ring-2 ring-white">
          {React.cloneElement(child as React.ReactElement<AvatarProps>, { size })}
        </div>
      ))}
      
      {remainingCount > 0 && (
        <Avatar
          size={size}
          className="ring-2 ring-white bg-gray-200 text-gray-600"
        >
          +{remainingCount}
        </Avatar>
      )}
    </div>
  );
};

export default Avatar;