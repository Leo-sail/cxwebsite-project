/**
 * 触摸优化区域组件
 * 提供移动端友好的触摸交互体验
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '../../utils';
import { useTouchGesture, hapticFeedback, mobileInteraction } from '../../utils/touchGestures';
import { useResponsive } from '../../hooks/useResponsive';

// 手势事件接口定义
interface GestureEvent {
  type: 'swipe' | 'longPress' | 'doubleTap' | 'pinch' | 'tap';
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
  velocity?: number;
  scale?: number;
  center?: { x: number; y: number; timestamp: number };
  originalEvent: TouchEvent;
}

/**
 * 触摸区域属性接口
 */
interface TouchableAreaProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  
  // 触摸事件回调
  onTap?: (event: GestureEvent) => void;
  onDoubleTap?: (event: GestureEvent) => void;
  onLongPress?: (event: GestureEvent) => void;
  onSwipe?: (event: GestureEvent) => void;
  onPinch?: (event: GestureEvent) => void;
  
  // 交互配置
  disabled?: boolean;
  hapticEnabled?: boolean;
  highlightOnTouch?: boolean;
  preventDoubleTapZoom?: boolean;
  minTouchTarget?: number;
  
  // 手势配置
  swipeDirection?: 'horizontal' | 'vertical' | 'all';
  longPressDuration?: number;
  swipeThreshold?: number;
  
  // 样式配置
  touchHighlightColor?: string;
  activeScale?: number;
  rippleEffect?: boolean;
  
  // 可访问性
  role?: string;
  'aria-label'?: string;
  tabIndex?: number;
}

/**
 * 触摸优化区域组件
 */
export const TouchableArea: React.FC<TouchableAreaProps> = ({
  children,
  className,
  style,
  onTap,
  onDoubleTap,
  onLongPress,
  onSwipe,
  onPinch,
  disabled = false,
  hapticEnabled = true,
  highlightOnTouch = true,
  preventDoubleTapZoom = true,
  minTouchTarget = 44,
  swipeDirection = 'all',
  longPressDuration = 500,
  swipeThreshold = 50,
  touchHighlightColor = 'rgba(0, 0, 0, 0.1)',
  activeScale = 0.95,
  rippleEffect = false,
  role,
  'aria-label': ariaLabel,
  tabIndex,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { isMobile } = useResponsive();
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const rippleIdRef = useRef(0);
  
  // 配置触摸手势
  const { on, off } = useTouchGesture(ref, {
    swipe: {
      threshold: swipeThreshold,
      direction: swipeDirection
    },
    longPress: {
      duration: longPressDuration
    }
  });
  
  // 处理点击事件
  const handleTap = useCallback((event: GestureEvent) => {
    if (disabled) return;
    
    if (hapticEnabled && isMobile) {
      hapticFeedback.light();
    }
    
    if (rippleEffect) {
      const rect = ref.current?.getBoundingClientRect();
      if (rect && event.center) {
        const rippleId = rippleIdRef.current++;
        const x = event.center.x - rect.left;
        const y = event.center.y - rect.top;
        
        setRipples(prev => [...prev, { id: rippleId, x, y }]);
        
        // 移除涟漪效果
        setTimeout(() => {
          setRipples(prev => prev.filter(ripple => ripple.id !== rippleId));
        }, 600);
      }
    }
    
    onTap?.(event);
  }, [disabled, hapticEnabled, isMobile, rippleEffect, onTap]);
  
  // 处理双击事件
  const handleDoubleTap = useCallback((event: GestureEvent) => {
    if (disabled) return;
    
    if (hapticEnabled && isMobile) {
      hapticFeedback.medium();
    }
    
    onDoubleTap?.(event);
  }, [disabled, hapticEnabled, isMobile, onDoubleTap]);
  
  // 处理长按事件
  const handleLongPress = useCallback((event: GestureEvent) => {
    if (disabled) return;
    
    if (hapticEnabled && isMobile) {
      hapticFeedback.heavy();
    }
    
    onLongPress?.(event);
  }, [disabled, hapticEnabled, isMobile, onLongPress]);
  
  // 处理滑动事件
  const handleSwipe = useCallback((event: GestureEvent) => {
    if (disabled) return;
    
    if (hapticEnabled && isMobile) {
      hapticFeedback.light();
    }
    
    onSwipe?.(event);
  }, [disabled, hapticEnabled, isMobile, onSwipe]);
  
  // 处理捏合事件
  const handlePinch = useCallback((event: GestureEvent) => {
    if (disabled) return;
    
    onPinch?.(event);
  }, [disabled, onPinch]);
  
  // 设置手势监听器
  useEffect(() => {
    if (onTap) on('tap', handleTap);
    if (onDoubleTap) on('doubleTap', handleDoubleTap);
    if (onLongPress) on('longPress', handleLongPress);
    if (onSwipe) on('swipe', handleSwipe);
    if (onPinch) on('pinch', handlePinch);
    
    return () => {
      if (onTap) off('tap', handleTap);
      if (onDoubleTap) off('doubleTap', handleDoubleTap);
      if (onLongPress) off('longPress', handleLongPress);
      if (onSwipe) off('swipe', handleSwipe);
      if (onPinch) off('pinch', handlePinch);
    };
  }, [on, off, handleTap, handleDoubleTap, handleLongPress, handleSwipe, handlePinch, onTap, onDoubleTap, onLongPress, onSwipe, onPinch]);
  
  // 初始化移动端优化
  useEffect(() => {
    if (ref.current && isMobile) {
      const element = ref.current;
      
      // 设置最小触摸目标尺寸
      if (minTouchTarget > 0) {
        mobileInteraction.setMinTouchTarget(element, minTouchTarget);
      }
      
      // 设置触摸高亮颜色
      if (highlightOnTouch) {
        mobileInteraction.addTouchHighlight(element, touchHighlightColor);
      }
      
      // 防止双击缩放
      if (preventDoubleTapZoom) {
        mobileInteraction.preventDoubleTapZoom(element);
      }
    }
  }, [isMobile, minTouchTarget, highlightOnTouch, touchHighlightColor, preventDoubleTapZoom]);
  
  // 处理鼠标/触摸按下状态（用于视觉反馈）
  const handlePointerDown = useCallback(() => {
    if (!disabled) {
      setIsPressed(true);
    }
  }, [disabled]);
  
  const handlePointerUp = useCallback(() => {
    setIsPressed(false);
  }, []);
  
  // 计算动态样式
  const dynamicStyle: React.CSSProperties = {
    ...style,
    transform: isPressed && activeScale !== 1 ? `scale(${activeScale})` : undefined,
    transition: 'transform 0.1s ease-out',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    position: 'relative',
    overflow: rippleEffect ? 'hidden' : undefined,
    ...style
  };
  
  return (
    <div
      ref={ref}
      className={cn(
        'select-none', // 防止文本选择
        'touch-manipulation', // 优化触摸性能
        {
          'pointer-events-none': disabled,
        },
        className
      )}
      style={dynamicStyle}
      role={role}
      aria-label={ariaLabel}
      tabIndex={tabIndex}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      {...props}
    >
      {children}
      
      {/* 涟漪效果 */}
      {rippleEffect && (
        <div className="absolute inset-0 pointer-events-none">
          {ripples.map(ripple => (
            <div
              key={ripple.id}
              className="absolute rounded-full bg-current opacity-20 animate-ping"
              style={{
                left: ripple.x - 10,
                top: ripple.y - 10,
                width: 20,
                height: 20,
                animationDuration: '0.6s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * 触摸优化按钮组件
 */
interface TouchableButtonProps extends TouchableAreaProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const TouchableButton: React.FC<TouchableButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  disabled,
  ...props
}) => {
  const { isMobile } = useResponsive();
  
  // 响应式尺寸配置
  const sizeClasses = {
    sm: isMobile ? 'px-3 py-2 text-sm min-h-[40px]' : 'px-3 py-2 text-sm min-h-[36px]',
    md: isMobile ? 'px-4 py-3 text-base min-h-[44px]' : 'px-4 py-2 text-base min-h-[40px]',
    lg: isMobile ? 'px-6 py-4 text-lg min-h-[48px]' : 'px-6 py-3 text-lg min-h-[44px]'
  };
  
  // 变体样式
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
  };
  
  return (
    <TouchableArea
      className={cn(
        'inline-flex items-center justify-center',
        'font-medium rounded-lg',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      disabled={disabled || loading}
      rippleEffect
      {...props}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>加载中...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          {icon && iconPosition === 'left' && <span>{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span>{icon}</span>}
        </div>
      )}
    </TouchableArea>
  );
};

/**
 * 触摸优化卡片组件
 */
interface TouchableCardProps extends TouchableAreaProps {
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export const TouchableCard: React.FC<TouchableCardProps> = ({
  children,
  className,
  elevation = 'md',
  padding = 'md',
  rounded = 'md',
  ...props
}) => {
  const elevationClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };
  
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };
  
  return (
    <TouchableArea
      className={cn(
        'bg-white border border-gray-200',
        'transition-all duration-200',
        'hover:shadow-lg hover:border-gray-300',
        elevationClasses[elevation],
        paddingClasses[padding],
        roundedClasses[rounded],
        className
      )}
      activeScale={0.98}
      {...props}
    >
      {children}
    </TouchableArea>
  );
};

export default TouchableArea;