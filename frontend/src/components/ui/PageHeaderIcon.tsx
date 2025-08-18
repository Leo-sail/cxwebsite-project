/**
 * PageHeaderIcon 组件
 * 统一的页面头部圆形图标容器组件
 * 
 * 特性：
 * - 响应式尺寸（基于数据库配置）
 * - 统一的圆形容器样式
 * - 支持任意Heroicon图标
 * - 自动间距和布局
 * - 主题适配
 * - 预定义样式映射系统
 */
import React from 'react';
import { cn } from '../../utils';
import { usePageHeaderConfig, usePageHeaderIconSize } from '../../hooks/usePageHeaderConfig';
import { useResponsive } from '../../hooks/useResponsive';

/**
 * 预定义的Tailwind CSS类名映射
 * 避免动态生成类名导致的编译问题
 */
const CONTAINER_SIZE_MAP: Record<number, string> = {
  16: 'w-16 h-16',
  20: 'w-20 h-20',
  24: 'w-24 h-24',
  28: 'w-28 h-28',
  32: 'w-32 h-32'
};

const ICON_SIZE_MAP: Record<number, string> = {
  8: 'w-8 h-8',
  10: 'w-10 h-10',
  12: 'w-12 h-12',
  14: 'w-14 h-14',
  16: 'w-16 h-16'
};

const SPACING_MAP: Record<number, string> = {
  4: 'mb-4',
  6: 'mb-6',
  8: 'mb-8',
  10: 'mb-10',
  12: 'mb-12'
};

/**
 * 图标组件类型定义
 */
export interface IconComponent {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * PageHeaderIcon 组件属性
 */
export interface PageHeaderIconProps {
  /** Heroicon 图标组件 */
  icon: React.ComponentType<IconComponent>;
  /** 主标题 */
  title: string;
  /** 副标题（可选） */
  subtitle?: React.ReactNode;
  /** 额外的CSS类名 */
  className?: string;
  /** 图标额外CSS类名 */
  iconClassName?: string;
  /** 标题额外CSS类名 */
  titleClassName?: string;
  /** 副标题额外CSS类名 */
  subtitleClassName?: string;
  /** 自定义配置覆盖 */
  customConfig?: {
    containerSize?: { xs: number; sm: number; md: number; lg: number };
    iconSize?: { xs: number; sm: number; md: number; lg: number };
    spacing?: { xs: number; sm: number; md: number; lg: number };
  };
}

/**
 * 统一的页面头部图标组件
 * 
 * 用于师资页面和学员案例页面的hero section，
 * 提供统一的圆形图标容器样式和响应式布局
 * 
 * @param props 组件属性
 * @returns 页面头部图标组件
 */
export const PageHeaderIcon: React.FC<PageHeaderIconProps> = ({
  icon: IconComponent,
  title,
  subtitle,
  className,
  iconClassName,
  titleClassName,
  subtitleClassName,
  customConfig
}) => {
  const responsive = useResponsive();
  const { config, loading, error } = usePageHeaderConfig();
  const { containerSize, iconSize, spacing } = usePageHeaderIconSize(customConfig);

  // 如果配置加载中或出错，使用默认样式
  const getContainerClasses = () => {
    if (loading || error || !config) {
      return 'w-20 h-20 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-white/30';
    }

    const currentContainerSize = responsive.isMobile ? containerSize.xs : containerSize.lg;
    const currentSpacing = responsive.isMobile ? spacing.xs : spacing.lg;
    
    const sizeClass = CONTAINER_SIZE_MAP[currentContainerSize] || 'w-20 h-20';
    const spacingClass = SPACING_MAP[currentSpacing] || 'mb-6';

    return cn(
      sizeClass,
      config.style.background,
      config.style.backdrop,
      config.style.borderRadius,
      config.style.border,
      config.style.shadow,
      'flex items-center justify-center mx-auto',
      spacingClass
    );
  };

  // 获取图标样式类名
  const getIconClasses = () => {
    if (loading || error || !config) {
      return 'w-10 h-10 text-gray-700';
    }

    const currentIconSize = responsive.isMobile ? iconSize.xs : iconSize.lg;
    const sizeClass = ICON_SIZE_MAP[currentIconSize] || 'w-10 h-10';
    const iconColor = config.style.iconColor || 'text-gray-700'; // 使用数据库配置的图标颜色

    return cn(
      sizeClass,
      iconColor, // 使用配置的图标颜色
      iconClassName
    );
  };

  // 获取标题样式类名
  const getTitleClasses = () => {
    const baseClasses = responsive.isMobile
      ? 'text-3xl font-bold text-white mb-4'
      : 'text-4xl font-bold text-white mb-6';
    
    return cn(baseClasses, titleClassName);
  };

  // 获取副标题样式类名
  const getSubtitleClasses = () => {
    const baseClasses = responsive.isMobile
      ? 'text-lg text-white/90 max-w-2xl mx-auto'
      : 'text-xl text-white/90 max-w-3xl mx-auto';
    
    return cn(baseClasses, subtitleClassName);
  };

  return (
    <div className={cn('text-center', className)}>
      {/* 圆形图标容器 */}
      <div className={getContainerClasses()}>
        <IconComponent 
          className={getIconClasses()}
        />
      </div>
      
      {/* 标题内容 */}
      <h1 className={getTitleClasses()}>
        {title}
      </h1>
      
      {/* 副标题（如果提供） */}
      {subtitle && (
        <p className={getSubtitleClasses()}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

/**
 * 预设的页面头部图标组件变体
 */

/**
 * 师资页面专用的页面头部图标
 */
export const TeachersPageHeaderIcon: React.FC<Omit<PageHeaderIconProps, 'customConfig'>> = (props) => (
  <PageHeaderIcon 
    {...props} 
    customConfig={{
      // 师资页面可以使用稍大的尺寸
      containerSize: { xs: 20, sm: 20, md: 24, lg: 24 },
      iconSize: { xs: 10, sm: 10, md: 12, lg: 12 },
      spacing: { xs: 6, sm: 6, md: 8, lg: 8 }
    }}
  />
);

/**
 * 学员案例页面专用的页面头部图标
 */
export const StudentCasesPageHeaderIcon: React.FC<Omit<PageHeaderIconProps, 'customConfig'>> = (props) => (
  <PageHeaderIcon 
    {...props}
    customConfig={{
      // 学员案例页面使用标准尺寸
      containerSize: { xs: 16, sm: 20, md: 20, lg: 20 },
      iconSize: { xs: 8, sm: 10, md: 10, lg: 10 },
      spacing: { xs: 6, sm: 6, md: 8, lg: 8 }
    }}
  />
);

/**
 * 通用页面头部图标（使用数据库配置）
 */
export const DefaultPageHeaderIcon: React.FC<Omit<PageHeaderIconProps, 'customConfig'>> = (props) => (
  <PageHeaderIcon {...props} />
);

export default PageHeaderIcon;