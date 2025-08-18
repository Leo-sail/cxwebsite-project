import React from 'react';
import { useComponentStyles } from '../../hooks/useComponentStyles';

/**
 * Section组件变体类型
 */
export type SectionVariant = 'default' | 'primary' | 'secondary' | 'accent' | 'gradient' | 'image' | 'pattern';

/**
 * Section组件尺寸类型
 */
export type SectionSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Section组件间距类型
 */
export type SectionSpacing = 'none' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Section组件属性接口
 */
export interface SectionProps {
  /** 标题 */
  title?: string;
  /** 副标题 */
  subtitle?: string;
  /** 描述文本 */
  description?: string;
  /** 背景图片 */
  backgroundImage?: string;
  /** 渐变背景 */
  gradient?: {
    from: string;
    to: string;
    direction?: 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-br' | 'to-bl' | 'to-tr' | 'to-tl';
  };
  /** 背景图案 */
  pattern?: 'dots' | 'grid' | 'waves' | 'geometric';
  /** 组件变体 */
  variant?: SectionVariant;
  /** 组件尺寸 */
  size?: SectionSize;
  /** 内边距 */
  spacing?: SectionSpacing;
  /** 是否全宽 */
  fullWidth?: boolean;
  /** 是否居中内容 */
  centered?: boolean;
  /** 是否显示分隔线 */
  showDivider?: boolean;
  /** 分隔线位置 */
  dividerPosition?: 'top' | 'bottom' | 'both';
  /** 自定义CSS类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 子元素 */
  children: React.ReactNode;
  /** 容器最大宽度 */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | 'full';
  /** 是否启用视差效果 */
  parallax?: boolean;
  /** 动画效果 */
  animation?: 'fade-in' | 'slide-up' | 'slide-down' | 'scale' | 'none';
}

/**
 * Section组件
 * 用于页面内容区域的布局和样式
 */
export const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  description,
  backgroundImage,
  gradient,
  pattern,
  variant = 'default',
  size = 'md',
  spacing = 'md',
  fullWidth = false,
  centered = false,
  showDivider = false,
  dividerPosition = 'bottom',
  className = '',
  style = {},
  children,
  maxWidth = 'lg',
  parallax = false,
  animation = 'none'
}) => {
  const { getComponentStyles } = useComponentStyles('section');

  // 获取组件样式
  const baseStyles = getComponentStyles(variant, { size });
  const headerStyles = getComponentStyles('header', { variant });
  const titleStyles = getComponentStyles('title', { variant, size });
  const subtitleStyles = getComponentStyles('subtitle', { variant, size });
  const descriptionStyles = getComponentStyles('description', { variant, size });
  const contentStyles = getComponentStyles('content', { variant });
  const dividerStyles = getComponentStyles('divider', { variant });

  // 构建背景样式
  const getBackgroundStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {};

    if (backgroundImage) {
      styles.backgroundImage = `url(${backgroundImage})`;
      styles.backgroundSize = 'cover';
      styles.backgroundPosition = 'center';
      styles.backgroundRepeat = 'no-repeat';
      if (parallax) {
        styles.backgroundAttachment = 'fixed';
      }
    }

    if (gradient) {
      const gradientStyle = `linear-gradient(${gradient.direction || 'to-r'}, ${gradient.from}, ${gradient.to})`;
      if (backgroundImage) {
        styles.backgroundImage = `${gradientStyle}, url(${backgroundImage})`;
      } else {
        styles.backgroundImage = gradientStyle;
      }
    }

    return styles;
  };

  // 获取间距样式
  const getSpacingStyles = (): React.CSSProperties => {
    switch (spacing) {
      case 'none':
        return { padding: '0' };
      case 'sm':
        return { padding: '2rem 0' };
      case 'md':
        return { padding: '4rem 0' };
      case 'lg':
        return { padding: '6rem 0' };
      case 'xl':
        return { padding: '8rem 0' };
      default:
        return { padding: '4rem 0' };
    }
  };

  // 获取容器最大宽度样式
  const getMaxWidthStyles = (): string => {
    if (fullWidth) return 'w-full';
    
    switch (maxWidth) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-4xl';
      case 'xl':
        return 'max-w-5xl';
      case '2xl':
        return 'max-w-6xl';
      case '4xl':
        return 'max-w-7xl';
      case '6xl':
        return 'max-w-full';
      case 'full':
        return 'w-full';
      default:
        return 'max-w-4xl';
    }
  };

  // 获取动画类名
  const getAnimationClass = (): string => {
    switch (animation) {
      case 'fade-in':
        return 'animate-fade-in';
      case 'slide-up':
        return 'animate-slide-up';
      case 'slide-down':
        return 'animate-slide-down';
      case 'scale':
        return 'animate-scale';
      default:
        return '';
    }
  };

  // 获取背景图案
  const getPatternBackground = (): React.ReactNode => {
    if (!pattern) return null;

    const patternStyles = {
      position: 'absolute' as const,
      inset: 0,
      opacity: 0.1,
      pointerEvents: 'none' as const
    };

    switch (pattern) {
      case 'dots':
        return (
          <div
            style={{
              ...patternStyles,
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />
        );
      case 'grid':
        return (
          <div
            style={{
              ...patternStyles,
              backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />
        );
      case 'waves':
        return (
          <div
            style={{
              ...patternStyles,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23000" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              backgroundSize: '60px 60px'
            }}
          />
        );
      case 'geometric':
        return (
          <div
            style={{
              ...patternStyles,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23000" fill-opacity="0.1" fill-rule="evenodd"%3E%3Cpath d="M20 20c0 11.046-8.954 20-20 20v20h40V20H20z"/%3E%3C/g%3E%3C/svg%3E")',
              backgroundSize: '40px 40px'
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <section
      className={`section-container relative overflow-hidden ${getAnimationClass()} ${className}`}
      style={{
        ...baseStyles,
        ...getBackgroundStyles(),
        ...getSpacingStyles(),
        ...style
      }}
    >
      {/* 背景图案 */}
      {getPatternBackground()}

      {/* 顶部分隔线 */}
      {showDivider && (dividerPosition === 'top' || dividerPosition === 'both') && (
        <div
          className="section-divider-top absolute top-0 left-0 right-0 h-px"
          style={dividerStyles}
        />
      )}

      {/* 主要内容 */}
      <div className={`container mx-auto px-4 ${fullWidth ? 'w-full' : getMaxWidthStyles()}`}>
        {/* 头部内容 */}
        {(title || subtitle || description) && (
          <div
            className={`section-header mb-12 ${centered ? 'text-center' : ''}`}
            style={headerStyles}
          >
            {/* 副标题 */}
            {subtitle && (
              <p
                className="section-subtitle mb-4 text-sm font-medium tracking-wide uppercase opacity-80"
                style={subtitleStyles}
              >
                {subtitle}
              </p>
            )}

            {/* 主标题 */}
            {title && (
              <h2
                className="section-title mb-6 font-bold leading-tight"
                style={titleStyles}
              >
                {title}
              </h2>
            )}

            {/* 描述 */}
            {description && (
              <p
                className="section-description text-lg leading-relaxed opacity-90"
                style={descriptionStyles}
              >
                {description}
              </p>
            )}
          </div>
        )}

        {/* 内容区域 */}
        <div
          className="section-content"
          style={contentStyles}
        >
          {children}
        </div>
      </div>

      {/* 底部分隔线 */}
      {showDivider && (dividerPosition === 'bottom' || dividerPosition === 'both') && (
        <div
          className="section-divider-bottom absolute bottom-0 left-0 right-0 h-px"
          style={dividerStyles}
        />
      )}
    </section>
  );
};

export default Section;