import React from 'react';
import { cn } from '../../utils';
import { useResponsive } from '../../hooks/useResponsive';
import { useTeacherAvatarSize } from '../../hooks/useUIConfig';
// import { LazyImage } from '../LazyWrapper/LazyImage'; // LazyImage组件暂不可用

/**
 * 教师信息接口
 */
export interface Teacher {
  id: string;
  name: string;
  image_url?: string | null;
  description?: string | null;
}

/**
 * 教师头像组件属性
 */
export interface TeacherAvatarProps {
  /** 教师信息 */
  teacher: Teacher;
  /** 尺寸变体 */
  size?: 'sm' | 'md' | 'lg';
  /** 额外的CSS类名 */
  className?: string;
  /** 是否显示占位符 */
  showPlaceholder?: boolean;
  /** 占位符图标 */
  placeholderIcon?: React.ReactNode;
  /** 点击事件处理 */
  onClick?: () => void;
  /** 是否可点击 */
  clickable?: boolean;
  /** 边框样式 */
  borderStyle?: 'default' | 'blue' | 'none';
  /** 是否延迟加载 */
  lazy?: boolean;
}

/**
 * 统一的教师头像组件
 * 
 * 特性：
 * - 响应式尺寸（基于数据库配置）
 * - 支持多种尺寸变体（sm, md, lg）
 * - 自动占位符显示
 * - 延迟加载支持
 * - 可配置边框样式
 * - 可点击交互
 * 
 * @param props 组件属性
 * @returns 教师头像组件
 */
export const TeacherAvatar: React.FC<TeacherAvatarProps> = ({
  teacher,
  size = 'md',
  className,
  showPlaceholder = true,
  placeholderIcon,
  onClick,
  clickable = false,
  borderStyle = 'default',
  lazy = true
}) => {
  const responsive = useResponsive();
  const { sizeConfig, loading, error } = useTeacherAvatarSize(size);

  // 如果配置加载中，显示默认尺寸
  const defaultSizeClass = responsive.isMobile ? 'w-20 h-20' : 'w-24 h-24';
  
  // 获取实际尺寸类名
  const getSizeClass = () => {
    if (loading || error || !sizeConfig) {
      return defaultSizeClass;
    }
    
    return responsive.isMobile 
      ? `${sizeConfig.mobile.width} ${sizeConfig.mobile.height}`
      : `${sizeConfig.desktop.width} ${sizeConfig.desktop.height}`;
  };

  // 获取边框样式
  const getBorderClass = () => {
    switch (borderStyle) {
      case 'blue':
        return 'border-4 border-blue-100';
      case 'none':
        return '';
      case 'default':
      default:
        return 'border-4 border-blue-100';
    }
  };

  // 基础样式类名
  const baseClasses = cn(
    'rounded-full mx-auto object-cover transition-all duration-200',
    getSizeClass(),
    getBorderClass(),
    clickable && 'cursor-pointer hover:scale-105 hover:shadow-lg',
    className
  );

  // 占位符样式类名
  const placeholderClasses = cn(
    'rounded-full mx-auto flex items-center justify-center bg-gray-100 text-gray-400 transition-all duration-200',
    getSizeClass(),
    getBorderClass(),
    clickable && 'cursor-pointer hover:scale-105 hover:shadow-lg hover:bg-gray-200',
    className
  );

  // 渲染占位符
  const renderPlaceholder = () => {
    if (!showPlaceholder) return null;

    return (
      <div 
        className={placeholderClasses}
        onClick={clickable ? onClick : undefined}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onKeyDown={clickable ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        } : undefined}
      >
        {placeholderIcon || (
          <span className={cn(
            'font-semibold',
            responsive.isMobile ? 'text-lg' : 'text-2xl'
          )}>
            {teacher.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    );
  };

  // 如果没有图片URL或图片URL为空字符串，显示占位符
  if (!teacher.image_url || teacher.image_url.trim() === '') {
    return renderPlaceholder();
  }

  // 渲染图片（暂时使用普通img标签）
  const imageElement = (
    <img
      src={teacher.image_url}
      alt={`${teacher.name}的头像`}
      className={baseClasses}
      onClick={clickable ? onClick : undefined}
      onError={(e) => {
        // 图片加载失败时显示占位符
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const placeholder = target.nextElementSibling;
        if (placeholder) {
          placeholder.classList.remove('hidden');
        }
      }}
    />
  );

  return (
    <div className="relative inline-block">
      {imageElement}
      {/* 图片加载失败时的占位符 */}
      {!lazy && (
        <div className="hidden">
          {renderPlaceholder()}
        </div>
      )}
    </div>
  );
};

/**
 * 教师头像组件的默认导出
 */
export default TeacherAvatar;

/**
 * 教师头像组件的预设变体
 */
export const TeacherAvatarSmall: React.FC<Omit<TeacherAvatarProps, 'size'>> = (props) => (
  <TeacherAvatar {...props} size="sm" />
);

export const TeacherAvatarMedium: React.FC<Omit<TeacherAvatarProps, 'size'>> = (props) => (
  <TeacherAvatar {...props} size="md" />
);

export const TeacherAvatarLarge: React.FC<Omit<TeacherAvatarProps, 'size'>> = (props) => (
  <TeacherAvatar {...props} size="lg" />
);

/**
 * 教师头像网格组件 - 用于显示多个教师头像
 */
export interface TeacherAvatarGridProps {
  /** 教师列表 */
  teachers: Teacher[];
  /** 头像尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 网格列数配置 */
  columns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  /** 间距 */
  gap?: 'sm' | 'md' | 'lg';
  /** 点击事件处理 */
  onTeacherClick?: (teacher: Teacher) => void;
  /** 额外的CSS类名 */
  className?: string;
}

export const TeacherAvatarGrid: React.FC<TeacherAvatarGridProps> = ({
  teachers,
  size = 'md',
  columns = { mobile: 2, tablet: 3, desktop: 4 },
  gap = 'md',
  onTeacherClick,
  className
}) => {
  const getGapClass = () => {
    switch (gap) {
      case 'sm': return 'gap-2';
      case 'lg': return 'gap-6';
      case 'md':
      default: return 'gap-4';
    }
  };

  const getGridClass = () => {
    return cn(
      'grid',
      `grid-cols-${columns.mobile}`,
      `md:grid-cols-${columns.tablet}`,
      `lg:grid-cols-${columns.desktop}`,
      getGapClass()
    );
  };

  return (
    <div className={cn(getGridClass(), className)}>
      {teachers.map((teacher) => (
        <div key={teacher.id} className="flex flex-col items-center space-y-2">
          <TeacherAvatar
            teacher={teacher}
            size={size}
            clickable={!!onTeacherClick}
            onClick={() => onTeacherClick?.(teacher)}
          />
          <span className="text-sm text-center text-gray-700 font-medium">
            {teacher.name}
          </span>
        </div>
      ))}
    </div>
  );
};