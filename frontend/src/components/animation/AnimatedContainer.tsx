import React, { useEffect, useRef, useState } from 'react';

/**
 * 动画类型
 */
export type AnimationType = 
  | 'fade-in' 
  | 'fade-out'
  | 'slide-in-left'
  | 'slide-in-right'
  | 'slide-in-up'
  | 'slide-in-down'
  | 'slide-out-left'
  | 'slide-out-right'
  | 'slide-out-up'
  | 'slide-out-down'
  | 'scale-in'
  | 'scale-out'
  | 'rotate-in'
  | 'rotate-out'
  | 'bounce-in'
  | 'bounce-out'
  | 'flip-in'
  | 'flip-out'
  | 'zoom-in'
  | 'zoom-out';

/**
 * 动画触发方式
 */
export type AnimationTrigger = 'immediate' | 'hover' | 'click' | 'scroll' | 'manual';

/**
 * 动画缓动函数
 */
export type AnimationEasing = 
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'cubic-bezier';

/**
 * 动画配置接口
 */
export interface AnimationConfig {
  /** 动画类型 */
  type: AnimationType;
  /** 动画持续时间（毫秒） */
  duration?: number;
  /** 动画延迟（毫秒） */
  delay?: number;
  /** 动画缓动函数 */
  easing?: AnimationEasing;
  /** 自定义缓动函数参数 */
  cubicBezier?: [number, number, number, number];
  /** 动画迭代次数 */
  iterations?: number | 'infinite';
  /** 动画方向 */
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  /** 动画填充模式 */
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

/**
 * AnimatedContainer组件属性接口
 */
export interface AnimatedContainerProps {
  /** 动画配置 */
  animation?: AnimationConfig;
  /** 动画触发方式 */
  trigger?: AnimationTrigger;
  /** 是否启用动画 */
  enabled?: boolean;
  /** 滚动触发阈值（0-1） */
  threshold?: number;
  /** 是否只触发一次 */
  once?: boolean;
  /** 动画开始回调 */
  onAnimationStart?: () => void;
  /** 动画结束回调 */
  onAnimationEnd?: () => void;
  /** 动画迭代回调 */
  onAnimationIteration?: () => void;
  /** 自定义CSS类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 子元素 */
  children: React.ReactNode;
}

/**
 * AnimatedContainer组件
 * 提供丰富的动画效果和触发方式
 */
export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  animation = { type: 'fade-in', duration: 300 },
  trigger = 'immediate',
  enabled = true,
  threshold = 0.1,
  once = true,
  onAnimationStart,
  onAnimationEnd,
  onAnimationIteration,
  className = '',
  style = {},
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  // 获取动画关键帧
  const getAnimationKeyframes = (type: AnimationType): string => {
    switch (type) {
      case 'fade-in':
        return `
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `;
      case 'fade-out':
        return `
          @keyframes fade-out {
            from { opacity: 1; }
            to { opacity: 0; }
          }
        `;
      case 'slide-in-left':
        return `
          @keyframes slide-in-left {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `;
      case 'slide-in-right':
        return `
          @keyframes slide-in-right {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `;
      case 'slide-in-up':
        return `
          @keyframes slide-in-up {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `;
      case 'slide-in-down':
        return `
          @keyframes slide-in-down {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `;
      case 'scale-in':
        return `
          @keyframes scale-in {
            from { transform: scale(0); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `;
      case 'scale-out':
        return `
          @keyframes scale-out {
            from { transform: scale(1); opacity: 1; }
            to { transform: scale(0); opacity: 0; }
          }
        `;
      case 'rotate-in':
        return `
          @keyframes rotate-in {
            from { transform: rotate(-180deg) scale(0); opacity: 0; }
            to { transform: rotate(0deg) scale(1); opacity: 1; }
          }
        `;
      case 'bounce-in':
        return `
          @keyframes bounce-in {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); opacity: 0.8; }
            70% { transform: scale(0.9); opacity: 0.9; }
            100% { transform: scale(1); opacity: 1; }
          }
        `;
      case 'flip-in':
        return `
          @keyframes flip-in {
            from { transform: perspective(400px) rotateY(90deg); opacity: 0; }
            40% { transform: perspective(400px) rotateY(-20deg); }
            60% { transform: perspective(400px) rotateY(10deg); }
            80% { transform: perspective(400px) rotateY(-5deg); }
            to { transform: perspective(400px) rotateY(0deg); opacity: 1; }
          }
        `;
      case 'zoom-in':
        return `
          @keyframes zoom-in {
            from { transform: scale(0.5); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `;
      default:
        return '';
    }
  };

  // 获取缓动函数
  const getEasingFunction = (easing: AnimationEasing, cubicBezier?: [number, number, number, number]): string => {
    if (easing === 'cubic-bezier' && cubicBezier) {
      return `cubic-bezier(${cubicBezier.join(', ')})`;
    }
    return easing;
  };

  // 构建动画样式
  const getAnimationStyles = (): React.CSSProperties => {
    if (!enabled || !isAnimating) return {};

    const {
      type,
      duration = 300,
      delay = 0,
      easing = 'ease',
      cubicBezier,
      iterations = 1,
      direction = 'normal',
      fillMode = 'both'
    } = animation;

    return {
      animationName: type,
      animationDuration: `${duration}ms`,
      animationDelay: `${delay}ms`,
      animationTimingFunction: getEasingFunction(easing, cubicBezier),
      animationIterationCount: iterations,
      animationDirection: direction,
      animationFillMode: fillMode
    };
  };

  // 滚动观察器
  useEffect(() => {
    if (trigger !== 'scroll' || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [trigger, threshold, once]);

  // 动画触发逻辑
  useEffect(() => {
    if (!enabled) return;

    let shouldAnimate = false;

    switch (trigger) {
      case 'immediate':
        shouldAnimate = true;
        break;
      case 'scroll':
        shouldAnimate = isVisible;
        break;
      case 'manual':
        // 手动控制，不自动触发
        break;
      default:
        break;
    }

    if (shouldAnimate && (!once || !hasAnimated)) {
      setIsAnimating(true);
      setHasAnimated(true);
    }
  }, [enabled, trigger, isVisible, once, hasAnimated]);

  // 处理动画事件
  const handleAnimationStart = () => {
    onAnimationStart?.();
  };

  const handleAnimationEnd = () => {
    setIsAnimating(false);
    onAnimationEnd?.();
  };

  const handleAnimationIteration = () => {
    onAnimationIteration?.();
  };

  // 手动触发动画
  const triggerAnimation = () => {
    if (enabled && trigger === 'manual') {
      setIsAnimating(true);
      setHasAnimated(true);
    }
  };

  // 处理点击和悬停触发
  const handleClick = () => {
    if (trigger === 'click') {
      triggerAnimation();
    }
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      triggerAnimation();
    }
  };

  // 注入动画关键帧
  useEffect(() => {
    if (!enabled) return;

    const keyframes = getAnimationKeyframes(animation.type);
    const styleElement = document.createElement('style');
    styleElement.textContent = keyframes;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, [animation.type, enabled]);

  return (
    <div
      ref={containerRef}
      className={`animated-container ${className}`}
      style={{
        ...getAnimationStyles(),
        ...style
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onAnimationStart={handleAnimationStart}
      onAnimationEnd={handleAnimationEnd}
      onAnimationIteration={handleAnimationIteration}
    >
      {children}
    </div>
  );
};

export default AnimatedContainer;