/**
 * 滑动面板组件
 * 提供移动端滑动操作功能，如滑动删除、滑动操作等
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../utils';
import { useResponsive } from '../../hooks/useResponsive';
import { hapticFeedback } from '../../utils/touchGestures';
import { TouchableArea } from './TouchableArea';
import type { SwipeAction } from './swipeActions';



/**
 * 滑动方向常量
 */
const SwipeDirection = {
  LEFT: 'left',
  RIGHT: 'right'
} as const;

type SwipeDirection = typeof SwipeDirection[keyof typeof SwipeDirection];

/**
 * 滑动面板属性接口
 */
interface SwipeablePanelProps {
  children: React.ReactNode;
  className?: string;
  
  // 滑动动作配置
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  
  // 滑动配置
  swipeThreshold?: number; // 触发动作的滑动距离
  maxSwipeDistance?: number; // 最大滑动距离
  snapThreshold?: number; // 自动吸附的阈值
  
  // 动画配置
  animationDuration?: number;
  dampingRatio?: number;
  
  // 功能开关
  disabled?: boolean;
  hapticEnabled?: boolean;
  autoClose?: boolean; // 执行动作后自动关闭
  
  // 回调函数
  onSwipeStart?: (direction: SwipeDirection) => void;
  onSwipeEnd?: (direction: SwipeDirection, distance: number) => void;
  onActionExecute?: (action: SwipeAction) => void;
  
  // 样式配置
  actionWidth?: number;
  overlayOpacity?: number;
}

/**
 * 滑动面板组件
 */
export const SwipeablePanel: React.FC<SwipeablePanelProps> = ({
  children,
  className,
  leftActions = [],
  rightActions = [],
  swipeThreshold = 80,
  maxSwipeDistance = 200,
  snapThreshold = 40,
  animationDuration = 300,
  dampingRatio = 0.8,
  disabled = false,
  hapticEnabled = true,
  autoClose = true,
  onSwipeStart,
  onSwipeEnd,
  onActionExecute,
  actionWidth = 80,
  overlayOpacity = 0.1
}) => {
  const { isMobile } = useResponsive();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [translateX, setTranslateX] = useState(0);
  const [activeDirection, setActiveDirection] = useState<SwipeDirection | null>(null);
  const [, setIsAnimating] = useState(false);
  
  // 触摸状态
  const touchStateRef = useRef({
    startX: 0,
    currentX: 0,
    isDragging: false,
    direction: null as SwipeDirection | null
  });
  
  // 设置变换样式
  const setTransform = useCallback((x: number, animate = false) => {
    const content = contentRef.current;
    if (!content) return;
    
    const duration = animate ? `${animationDuration}ms` : '0ms';
    content.style.transition = `transform ${duration} cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    content.style.transform = `translateX(${x}px)`;
  }, [animationDuration]);
  
  // 重置到初始位置
  const resetPosition = useCallback(() => {
    setIsAnimating(true);
    setTransform(0, true);
    setTranslateX(0);
    setActiveDirection(null);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, animationDuration);
  }, [setTransform, animationDuration]);
  
  // 吸附到动作位置
  const snapToActions = useCallback((direction: SwipeDirection) => {
    const actions = direction === SwipeDirection.LEFT ? rightActions : leftActions;
    if (actions.length === 0) return resetPosition();
    
    const targetX = direction === SwipeDirection.LEFT ? 
      -Math.min(actions.length * actionWidth, maxSwipeDistance) :
      Math.min(actions.length * actionWidth, maxSwipeDistance);
    
    setIsAnimating(true);
    setTransform(targetX, true);
    setTranslateX(targetX);
    setActiveDirection(direction);
    
    if (hapticEnabled && isMobile) {
      hapticFeedback.medium();
    }
    
    setTimeout(() => {
      setIsAnimating(false);
    }, animationDuration);
  }, [leftActions, rightActions, actionWidth, maxSwipeDistance, resetPosition, setTransform, hapticEnabled, isMobile, animationDuration]);
  
  // 执行动作
  const executeAction = useCallback((action: SwipeAction) => {
    if (hapticEnabled && isMobile) {
      hapticFeedback.heavy();
    }
    
    onActionExecute?.(action);
    action.onClick();
    
    if (autoClose) {
      resetPosition();
    }
  }, [hapticEnabled, isMobile, onActionExecute, autoClose, resetPosition]);
  
  // 触摸开始
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || !isMobile) return;
    
    const touch = e.touches[0];
    touchStateRef.current = {
      startX: touch.clientX,
      currentX: touch.clientX,
      isDragging: true,
      direction: null
    };
  }, [disabled, isMobile]);
  
  // 触摸移动
  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touchState = touchStateRef.current;
    if (!touchState.isDragging) return;
    
    const touch = e.touches[0];
    touchState.currentX = touch.clientX;
    
    const deltaX = touchState.currentX - touchState.startX;
    const absDeltaX = Math.abs(deltaX);
    
    // 确定滑动方向
    if (!touchState.direction && absDeltaX > 10) {
      touchState.direction = deltaX > 0 ? SwipeDirection.RIGHT : SwipeDirection.LEFT;
      onSwipeStart?.(touchState.direction);
    }
    
    if (touchState.direction) {
      // 检查是否有对应方向的动作
      const hasActions = touchState.direction === SwipeDirection.LEFT ? 
        rightActions.length > 0 : leftActions.length > 0;
      
      if (!hasActions) return;
      
      // 阻止默认行为
      e.preventDefault();
      
      // 计算阻尼效果
      const maxDistance = Math.min(
        (touchState.direction === SwipeDirection.LEFT ? rightActions.length : leftActions.length) * actionWidth,
        maxSwipeDistance
      );
      
      const damping = Math.max(0.3, 1 - (absDeltaX / maxDistance) * dampingRatio);
      const distance = Math.min(absDeltaX * damping, maxDistance);
      const x = touchState.direction === SwipeDirection.LEFT ? -distance : distance;
      
      setTranslateX(x);
      setTransform(x);
    }
  }, [leftActions, rightActions, actionWidth, maxSwipeDistance, dampingRatio, setTransform, onSwipeStart]);
  
  // 触摸结束
  const handleTouchEnd = useCallback(() => {
    const touchState = touchStateRef.current;
    touchState.isDragging = false;
    
    const absDeltaX = Math.abs(translateX);
    
    if (touchState.direction && absDeltaX > snapThreshold) {
      if (absDeltaX >= swipeThreshold) {
        snapToActions(touchState.direction);
      } else {
        resetPosition();
      }
      
      onSwipeEnd?.(touchState.direction, absDeltaX);
    } else {
      resetPosition();
    }
    
    touchState.direction = null;
  }, [translateX, snapThreshold, swipeThreshold, snapToActions, resetPosition, onSwipeEnd]);
  
  // 绑定触摸事件
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isMobile) return;
    
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, handleTouchStart, handleTouchMove, handleTouchEnd]);
  
  // 点击外部区域关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeDirection && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        resetPosition();
      }
    };
    
    if (activeDirection) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeDirection, resetPosition]);
  
  // 渲染动作按钮
  const renderActions = (actions: SwipeAction[], direction: SwipeDirection) => {
    if (actions.length === 0) return null;
    
    const isVisible = activeDirection === direction;
    const isLeft = direction === SwipeDirection.RIGHT;
    
    return (
      <div
        className={cn(
          'absolute top-0 bottom-0 flex',
          isLeft ? 'left-0' : 'right-0',
          {
            'opacity-0 pointer-events-none': !isVisible,
            'opacity-100': isVisible
          }
        )}
        style={{
          width: Math.min(actions.length * actionWidth, maxSwipeDistance),
          transform: isLeft ? `translateX(-100%)` : 'translateX(100%)'
        }}
      >
        {actions.map((action) => {
          const Icon = action.icon;
          
          return (
            <TouchableArea
              key={action.id}
              onTap={() => executeAction(action)}
              hapticEnabled={hapticEnabled}
              minTouchTarget={44}
              className="flex-1"
            >
              <div
                className={cn(
                  'h-full flex flex-col items-center justify-center',
                  'text-white font-medium transition-colors duration-200',
                  {
                    'hover:opacity-80': !action.destructive,
                    'bg-red-500': action.destructive && !action.backgroundColor,
                  }
                )}
                style={{
                  backgroundColor: action.backgroundColor || (action.destructive ? '#ef4444' : '#6b7280'),
                  color: action.color || 'white',
                  width: actionWidth
                }}
              >
                {Icon && <Icon className="w-5 h-5 mb-1" />}
                <span className="text-xs">{action.label}</span>
              </div>
            </TouchableArea>
          );
        })}
      </div>
    );
  };
  
  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        'touch-pan-y', // 只允许垂直滚动
        className
      )}
    >
      {/* 左侧动作 */}
      {renderActions(leftActions, SwipeDirection.RIGHT)}
      
      {/* 右侧动作 */}
      {renderActions(rightActions, SwipeDirection.LEFT)}
      
      {/* 内容区域 */}
      <div 
        ref={contentRef}
        className="relative bg-white"
      >
        {/* 遮罩层 */}
        {activeDirection && (
          <div 
            className="absolute inset-0 bg-black pointer-events-none"
            style={{ opacity: Math.abs(translateX) / maxSwipeDistance * overlayOpacity }}
          />
        )}
        
        {children}
      </div>
    </div>
  );
};

/**
 * 预定义的常用动作
 */


/**
 * 滑动列表项组件
 */
interface SwipeableListItemProps extends SwipeablePanelProps {
  title: string;
  subtitle?: string;
  avatar?: React.ReactNode;
  trailing?: React.ReactNode;
  onTap?: () => void;
}

export const SwipeableListItem: React.FC<SwipeableListItemProps> = ({
  title,
  subtitle,
  avatar,
  trailing,
  onTap,
  className,
  ...swipeProps
}) => {
  return (
    <SwipeablePanel className={className} {...swipeProps}>
      <TouchableArea
        onTap={onTap}
        className="px-4 py-3 border-b border-gray-200 last:border-b-0"
        hapticEnabled
        minTouchTarget={44}
      >
        <div className="flex items-center space-x-3">
          {avatar && (
            <div className="flex-shrink-0">
              {avatar}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-500 truncate">
                {subtitle}
              </p>
            )}
          </div>
          
          {trailing && (
            <div className="flex-shrink-0">
              {trailing}
            </div>
          )}
        </div>
      </TouchableArea>
    </SwipeablePanel>
  );
};

export default SwipeablePanel;