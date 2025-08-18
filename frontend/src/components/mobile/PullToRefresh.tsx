/**
 * 下拉刷新组件
 * 提供移动端下拉刷新功能
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../utils';
import { useResponsive } from '../../hooks/useResponsive';
import { hapticFeedback } from '../../utils/touchGestures';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

/**
 * 刷新状态常量
 */
const RefreshState = {
  IDLE: 'idle',
  PULLING: 'pulling',
  READY: 'ready',
  REFRESHING: 'refreshing',
  COMPLETE: 'complete'
} as const;

type RefreshState = typeof RefreshState[keyof typeof RefreshState];

/**
 * 下拉刷新属性接口
 */
interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
  className?: string;
  
  // 配置选项
  pullThreshold?: number; // 触发刷新的下拉距离
  maxPullDistance?: number; // 最大下拉距离
  refreshTimeout?: number; // 刷新超时时间
  
  // 样式配置
  indicatorHeight?: number; // 指示器高度
  backgroundColor?: string;
  textColor?: string;
  
  // 文本配置
  pullText?: string;
  readyText?: string;
  refreshingText?: string;
  completeText?: string;
  
  // 动画配置
  animationDuration?: number;
  dampingRatio?: number;
  
  // 回调函数
  onStateChange?: (state: RefreshState) => void;
  onPullProgress?: (progress: number) => void;
  
  // 功能开关
  disabled?: boolean;
  hapticEnabled?: boolean;
  
  // 自定义渲染
  renderIndicator?: (state: RefreshState, progress: number) => React.ReactNode;
}

/**
 * 下拉刷新组件
 */
export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  className,
  pullThreshold = 80,
  maxPullDistance = 120,
  refreshTimeout = 10000,
  indicatorHeight = 60,
  backgroundColor = 'bg-gray-50',
  textColor = 'text-gray-600',
  pullText = '下拉刷新',
  readyText = '释放刷新',
  refreshingText = '正在刷新...',
  completeText = '刷新完成',
  animationDuration = 300,
  dampingRatio = 0.8,
  onStateChange,
  onPullProgress,
  disabled = false,
  hapticEnabled = true,
  renderIndicator
}) => {
  const { isMobile } = useResponsive();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<RefreshState>(RefreshState.IDLE);
  const [pullDistance, setPullDistance] = useState(0);
  const [, setIsAnimating] = useState(false);
  
  // 触摸状态
  const touchStateRef = useRef({
    startY: 0,
    currentY: 0,
    isDragging: false,
    canPull: false
  });
  
  // 刷新超时定时器
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 计算下拉进度
  const progress = Math.min(pullDistance / pullThreshold, 1);
  
  // 更新状态
  const updateState = useCallback((newState: RefreshState) => {
    if (state !== newState) {
      setState(newState);
      onStateChange?.(newState);
      
      // 触觉反馈
      if (hapticEnabled && isMobile) {
        switch (newState) {
          case RefreshState.READY:
            hapticFeedback.medium();
            break;
          case RefreshState.REFRESHING:
            hapticFeedback.heavy();
            break;
          case RefreshState.COMPLETE:
            hapticFeedback.light();
            break;
        }
      }
    }
  }, [state, onStateChange, hapticEnabled, isMobile]);
  
  // 检查是否可以下拉
  const canPull = useCallback(() => {
    if (disabled || !isMobile) return false;
    
    const container = containerRef.current;
    if (!container) return false;
    
    // 检查容器是否在顶部
    return container.scrollTop === 0;
  }, [disabled, isMobile]);
  
  // 设置变换样式
  const setTransform = useCallback((distance: number, animate = false) => {
    const content = contentRef.current;
    if (!content) return;
    
    const duration = animate ? `${animationDuration}ms` : '0ms';
    content.style.transition = `transform ${duration} cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    content.style.transform = `translateY(${distance}px)`;
  }, [animationDuration]);
  
  // 重置到初始状态
  const resetToIdle = useCallback(() => {
    setIsAnimating(true);
    setTransform(0, true);
    
    setTimeout(() => {
      setPullDistance(0);
      updateState(RefreshState.IDLE);
      setIsAnimating(false);
    }, animationDuration);
  }, [setTransform, updateState, animationDuration]);
  
  // 执行刷新
  const executeRefresh = useCallback(async () => {
    updateState(RefreshState.REFRESHING);
    setTransform(indicatorHeight, true);
    
    // 设置超时
    timeoutRef.current = setTimeout(() => {
      console.warn('PullToRefresh: 刷新超时');
      resetToIdle();
    }, refreshTimeout);
    
    try {
      await onRefresh();
      
      // 显示完成状态
      updateState(RefreshState.COMPLETE);
      
      // 延迟重置
      setTimeout(() => {
        resetToIdle();
      }, 500);
    } catch (error) {
      console.error('PullToRefresh: 刷新失败', error);
      resetToIdle();
    } finally {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [updateState, setTransform, indicatorHeight, onRefresh, refreshTimeout, resetToIdle]);
  
  // 触摸开始
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!canPull() || state === RefreshState.REFRESHING) return;
    
    const touch = e.touches[0];
    touchStateRef.current = {
      startY: touch.clientY,
      currentY: touch.clientY,
      isDragging: true,
      canPull: true
    };
  }, [canPull, state]);
  
  // 触摸移动
  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touchState = touchStateRef.current;
    if (!touchState.isDragging || !touchState.canPull) return;
    
    const touch = e.touches[0];
    touchState.currentY = touch.clientY;
    
    const deltaY = touchState.currentY - touchState.startY;
    
    if (deltaY > 0) {
      // 阻止默认滚动
      e.preventDefault();
      
      // 计算阻尼效果
      const damping = Math.max(0.3, 1 - (deltaY / maxPullDistance) * dampingRatio);
      const distance = Math.min(deltaY * damping, maxPullDistance);
      
      setPullDistance(distance);
      setTransform(distance);
      
      // 更新进度
      const currentProgress = distance / pullThreshold;
      onPullProgress?.(currentProgress);
      
      // 更新状态
      if (distance >= pullThreshold && state !== RefreshState.READY) {
        updateState(RefreshState.READY);
      } else if (distance < pullThreshold && state === RefreshState.READY) {
        updateState(RefreshState.PULLING);
      } else if (distance > 0 && state === RefreshState.IDLE) {
        updateState(RefreshState.PULLING);
      }
    } else {
      // 向上滑动，检查是否还能下拉
      touchState.canPull = canPull();
    }
  }, [canPull, state, maxPullDistance, dampingRatio, pullThreshold, setTransform, onPullProgress, updateState]);
  
  // 触摸结束
  const handleTouchEnd = useCallback(() => {
    const touchState = touchStateRef.current;
    touchState.isDragging = false;
    
    if (state === RefreshState.READY) {
      executeRefresh();
    } else if (pullDistance > 0) {
      resetToIdle();
    }
  }, [state, pullDistance, executeRefresh, resetToIdle]);
  
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
  
  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // 获取状态文本
  const getStateText = () => {
    switch (state) {
      case RefreshState.PULLING:
        return pullText;
      case RefreshState.READY:
        return readyText;
      case RefreshState.REFRESHING:
        return refreshingText;
      case RefreshState.COMPLETE:
        return completeText;
      default:
        return pullText;
    }
  };
  
  // 渲染默认指示器
  const renderDefaultIndicator = () => {
    const rotation = state === RefreshState.REFRESHING ? 'animate-spin' : 
                    state === RefreshState.READY ? 'rotate-180' : '';
    
    return (
      <div className="flex flex-col items-center justify-center space-y-2">
        <ArrowPathIcon 
          className={cn(
            'w-6 h-6 transition-transform duration-300',
            textColor,
            rotation
          )}
        />
        <span className={cn('text-sm font-medium', textColor)}>
          {getStateText()}
        </span>
        
        {/* 进度指示器 */}
        {state === RefreshState.PULLING && (
          <div className="w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-100 ease-out"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative overflow-auto',
        'touch-pan-y', // 优化触摸滚动
        className
      )}
    >
      {/* 刷新指示器 */}
      <div 
        className={cn(
          'absolute top-0 left-0 right-0 z-10',
          'flex items-center justify-center',
          backgroundColor,
          'transition-opacity duration-200',
          {
            'opacity-0': state === RefreshState.IDLE && pullDistance === 0,
            'opacity-100': state !== RefreshState.IDLE || pullDistance > 0
          }
        )}
        style={{
          height: indicatorHeight,
          transform: `translateY(-${indicatorHeight - Math.min(pullDistance, indicatorHeight)}px)`
        }}
      >
        {renderIndicator ? renderIndicator(state, progress) : renderDefaultIndicator()}
      </div>
      
      {/* 内容区域 */}
      <div ref={contentRef} className="relative">
        {children}
      </div>
    </div>
  );
};



export default PullToRefresh;