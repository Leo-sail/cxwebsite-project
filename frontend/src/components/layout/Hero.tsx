import React from 'react';
import { useComponentStyles } from '../../hooks/useComponentStyles';
import { ThemedButton } from '../themed/ThemedButton';

/**
 * Hero组件变体类型
 */
export type HeroVariant = 'default' | 'gradient' | 'image' | 'video' | 'split';

/**
 * Hero组件尺寸类型
 */
export type HeroSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Hero组件对齐方式
 */
export type HeroAlignment = 'left' | 'center' | 'right';

/**
 * Hero组件属性接口
 */
export interface HeroProps {
  /** 标题 */
  title: string;
  /** 副标题 */
  subtitle?: string;
  /** 描述文本 */
  description?: string;
  /** 主要操作按钮 */
  primaryAction?: {
    text: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'success';
  };
  /** 次要操作按钮 */
  secondaryAction?: {
    text: string;
    onClick: () => void;
    variant?: 'outline' | 'ghost';
  };
  /** 背景图片 */
  backgroundImage?: string;
  /** 背景视频 */
  backgroundVideo?: string;
  /** 渐变背景 */
  gradient?: {
    from: string;
    to: string;
    direction?: 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-br' | 'to-bl' | 'to-tr' | 'to-tl';
  };
  /** 组件变体 */
  variant?: HeroVariant;
  /** 组件尺寸 */
  size?: HeroSize;
  /** 内容对齐方式 */
  alignment?: HeroAlignment;
  /** 是否显示装饰元素 */
  showDecorations?: boolean;
  /** 自定义CSS类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 子元素 */
  children?: React.ReactNode;
}

/**
 * Hero组件
 * 用于页面顶部的英雄区域展示
 */
export const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  backgroundImage,
  backgroundVideo,
  gradient,
  variant = 'default',
  size = 'lg',
  alignment = 'center',
  showDecorations = true,
  className = '',
  style = {},
  children
}) => {
  const { getComponentStyles } = useComponentStyles('hero');

  // 获取组件样式
  const baseStyles = getComponentStyles(variant, { size });
  const contentStyles = getComponentStyles('content', { variant, alignment });
  const titleStyles = getComponentStyles('title', { variant, size });
  const subtitleStyles = getComponentStyles('subtitle', { variant, size });
  const descriptionStyles = getComponentStyles('description', { variant, size });
  const actionsStyles = getComponentStyles('actions', { variant, alignment });

  // 构建背景样式
  const getBackgroundStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {};

    if (backgroundImage) {
      styles.backgroundImage = `url(${backgroundImage})`;
      styles.backgroundSize = 'cover';
      styles.backgroundPosition = 'center';
      styles.backgroundRepeat = 'no-repeat';
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

  // 获取容器高度样式
  const getHeightStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return { minHeight: '300px' };
      case 'md':
        return { minHeight: '400px' };
      case 'lg':
        return { minHeight: '500px' };
      case 'xl':
        return { minHeight: '600px' };
      case 'full':
        return { minHeight: '100vh' };
      default:
        return { minHeight: '500px' };
    }
  };

  // 获取内容对齐样式
  const getAlignmentStyles = (): React.CSSProperties => {
    switch (alignment) {
      case 'left':
        return { textAlign: 'left', alignItems: 'flex-start' };
      case 'center':
        return { textAlign: 'center', alignItems: 'center' };
      case 'right':
        return { textAlign: 'right', alignItems: 'flex-end' };
      default:
        return { textAlign: 'center', alignItems: 'center' };
    }
  };

  return (
    <section
      className={`hero-container relative overflow-hidden ${className}`}
      style={{
        ...baseStyles,
        ...getBackgroundStyles(),
        ...getHeightStyles(),
        ...style
      }}
    >
      {/* 背景视频 */}
      {backgroundVideo && (
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      )}

      {/* 背景遮罩 */}
      {(backgroundImage || backgroundVideo) && (
        <div className="absolute inset-0 bg-black bg-opacity-30 z-10" />
      )}

      {/* 装饰元素 */}
      {showDecorations && variant !== 'image' && variant !== 'video' && (
        <>
          <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse" />
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-br from-pink-400 to-red-500 rounded-full opacity-20 animate-bounce" />
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-20 animate-ping" />
        </>
      )}

      {/* 主要内容 */}
      <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center">
        <div
          className="hero-content max-w-4xl mx-auto"
          style={{
            ...contentStyles,
            ...getAlignmentStyles()
          }}
        >
          {/* 副标题 */}
          {subtitle && (
            <p
              className="hero-subtitle mb-4 text-sm font-medium tracking-wide uppercase opacity-80"
              style={subtitleStyles}
            >
              {subtitle}
            </p>
          )}

          {/* 主标题 */}
          <h1
            className="hero-title mb-6 font-bold leading-tight"
            style={titleStyles}
          >
            {title}
          </h1>

          {/* 描述 */}
          {description && (
            <p
              className="hero-description mb-8 text-lg leading-relaxed opacity-90"
              style={descriptionStyles}
            >
              {description}
            </p>
          )}

          {/* 操作按钮 */}
          {(primaryAction || secondaryAction) && (
            <div
              className="hero-actions flex flex-wrap gap-4"
              style={actionsStyles}
            >
              {primaryAction && (
                <ThemedButton
                  variant={primaryAction.variant || 'primary'}
                  size="lg"
                  onClick={primaryAction.onClick}
                  className="shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  {primaryAction.text}
                </ThemedButton>
              )}
              {secondaryAction && (
                <ThemedButton
                  variant={secondaryAction.variant || 'outline'}
                  size="lg"
                  onClick={secondaryAction.onClick}
                  className="shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  {secondaryAction.text}
                </ThemedButton>
              )}
            </div>
          )}

          {/* 自定义子元素 */}
          {children && (
            <div className="hero-custom-content mt-8">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;