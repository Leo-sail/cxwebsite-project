import { useEffect, useRef, useCallback } from 'react';

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
  duration: number;
}

interface PinchGesture {
  scale: number;
  center: { x: number; y: number };
}

interface TapGesture {
  x: number;
  y: number;
  isDoubleTap: boolean | null;
}

interface TouchGestureHandlers {
  onSwipe?: (gesture: SwipeGesture) => void;
  onPinch?: (gesture: PinchGesture) => void;
  onTap?: (gesture: TapGesture) => void;
  onLongPress?: (point: TouchPoint) => void;
  onPan?: (delta: { x: number; y: number }, point: TouchPoint) => void;
}

interface TouchGestureOptions {
  swipeThreshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
  pinchThreshold?: number;
  panThreshold?: number;
}

/**
 * 触摸手势识别Hook
 * 支持滑动、捏合、点击、长按、拖拽等手势
 */
export const useTouchGestures = (
  handlers: TouchGestureHandlers,
  options: TouchGestureOptions = {}
) => {
  const {
    swipeThreshold = 50,
    longPressDelay = 500,
    doubleTapDelay = 300,
    pinchThreshold = 0.1,
    panThreshold = 10
  } = options;

  const touchStartRef = useRef<TouchPoint | null>(null);
  const touchesRef = useRef<Touch[]>([]);
  const lastTapRef = useRef<TouchPoint | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isPanningRef = useRef(false);
  const initialPinchDistanceRef = useRef<number | null>(null);

  // 计算两点间距离
  const getDistance = useCallback((touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // 计算两点中心点
  const getCenter = useCallback((touch1: Touch, touch2: Touch) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  }, []);

  // 清除长按定时器
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // 处理触摸开始
  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touches = Array.from(event.touches);
    touchesRef.current = touches;

    if (touches.length === 1) {
      const touch = touches[0];
      const touchPoint: TouchPoint = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now()
      };
      
      touchStartRef.current = touchPoint;
      isPanningRef.current = false;

      // 设置长按定时器
      longPressTimerRef.current = setTimeout(() => {
        if (handlers.onLongPress && touchStartRef.current) {
          handlers.onLongPress(touchStartRef.current);
        }
      }, longPressDelay);

    } else if (touches.length === 2) {
      // 双指操作，准备捏合手势
      clearLongPressTimer();
      initialPinchDistanceRef.current = getDistance(touches[0], touches[1]);
    }
  }, [handlers, longPressDelay, getDistance, clearLongPressTimer]);

  // 处理触摸移动
  const handleTouchMove = useCallback((event: TouchEvent) => {
    event.preventDefault(); // 防止页面滚动
    
    const touches = Array.from(event.touches);
    touchesRef.current = touches;

    if (touches.length === 1 && touchStartRef.current) {
      const touch = touches[0];
      const currentPoint: TouchPoint = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now()
      };

      const deltaX = currentPoint.x - touchStartRef.current.x;
      const deltaY = currentPoint.y - touchStartRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // 如果移动距离超过阈值，取消长按
      if (distance > panThreshold) {
        clearLongPressTimer();
        
        // 开始拖拽
        if (!isPanningRef.current) {
          isPanningRef.current = true;
        }
        
        if (handlers.onPan) {
          handlers.onPan({ x: deltaX, y: deltaY }, currentPoint);
        }
      }

    } else if (touches.length === 2 && initialPinchDistanceRef.current) {
      // 处理捏合手势
      const currentDistance = getDistance(touches[0], touches[1]);
      const scale = currentDistance / initialPinchDistanceRef.current;
      const center = getCenter(touches[0], touches[1]);

      if (Math.abs(scale - 1) > pinchThreshold && handlers.onPinch) {
        handlers.onPinch({ scale, center });
      }
    }
  }, [handlers, panThreshold, pinchThreshold, getDistance, getCenter, clearLongPressTimer]);

  // 处理触摸结束
  const handleTouchEnd = useCallback((event: TouchEvent) => {
    clearLongPressTimer();
    
    const touches = Array.from(event.changedTouches);
    
    if (touches.length === 1 && touchStartRef.current && !isPanningRef.current) {
      const touch = touches[0];
      const endPoint: TouchPoint = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now()
      };

      const deltaX = endPoint.x - touchStartRef.current.x;
      const deltaY = endPoint.y - touchStartRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const duration = endPoint.timestamp - touchStartRef.current.timestamp;

      if (distance >= swipeThreshold) {
        // 滑动手势
        const velocity = distance / duration;
        let direction: SwipeGesture['direction'];
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }

        if (handlers.onSwipe) {
          handlers.onSwipe({ direction, distance, velocity, duration });
        }
      } else {
        // 点击手势
        const isDoubleTap = lastTapRef.current && 
          (endPoint.timestamp - lastTapRef.current.timestamp) < doubleTapDelay &&
          Math.abs(endPoint.x - lastTapRef.current.x) < 30 &&
          Math.abs(endPoint.y - lastTapRef.current.y) < 30;

        if (handlers.onTap) {
          handlers.onTap({
            x: endPoint.x,
            y: endPoint.y,
            isDoubleTap
          });
        }

        lastTapRef.current = endPoint;
      }
    }

    // 重置状态
    touchStartRef.current = null;
    isPanningRef.current = false;
    initialPinchDistanceRef.current = null;
    touchesRef.current = [];
  }, [handlers, swipeThreshold, doubleTapDelay, clearLongPressTimer]);

  // 绑定事件监听器的ref
  const elementRef = useRef<HTMLElement | null>(null);

  // 绑定事件监听器
  const bindGestures = useCallback((element: HTMLElement | null) => {
    if (elementRef.current) {
      // 移除旧的事件监听器
      elementRef.current.removeEventListener('touchstart', handleTouchStart);
      elementRef.current.removeEventListener('touchmove', handleTouchMove);
      elementRef.current.removeEventListener('touchend', handleTouchEnd);
    }

    elementRef.current = element;

    if (element) {
      // 添加新的事件监听器
      element.addEventListener('touchstart', handleTouchStart, { passive: false });
      element.addEventListener('touchmove', handleTouchMove, { passive: false });
      element.addEventListener('touchend', handleTouchEnd, { passive: false });
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // 清理函数
  useEffect(() => {
    return () => {
      clearLongPressTimer();
      if (elementRef.current) {
        elementRef.current.removeEventListener('touchstart', handleTouchStart);
        elementRef.current.removeEventListener('touchmove', handleTouchMove);
        elementRef.current.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, clearLongPressTimer]);

  return {
    bindGestures,
    isActive: touchesRef.current.length > 0
  };
};

/**
 * 移动端优化的内容管理手势Hook
 * 专门为内容管理系统设计的手势识别
 */
export const useContentManagementGestures = ({
  onSidebarToggle,
  onModeToggle,
  onItemSelect,
  onItemEdit: _onItemEdit,
  onItemDelete: _onItemDelete
}: {
  onSidebarToggle?: () => void;
  onModeToggle?: () => void;
  onItemSelect?: (id: string) => void;
  onItemEdit?: (id: string) => void;
  onItemDelete?: (id: string) => void;
}) => {
  const selectedItemRef = useRef<string | null>(null);

  const gestureHandlers: TouchGestureHandlers = {
    onSwipe: (gesture) => {
      // 左滑显示侧边栏，右滑隐藏侧边栏
      if (gesture.direction === 'left' && gesture.velocity > 0.5) {
        onSidebarToggle?.();
      } else if (gesture.direction === 'right' && gesture.velocity > 0.5) {
        onSidebarToggle?.();
      }
    },
    
    onTap: (gesture) => {
      // 双击切换模式
      if (gesture.isDoubleTap) {
        onModeToggle?.();
      }
    },
    
    onLongPress: (point) => {
      // 长按选择项目
      const element = document.elementFromPoint(point.x, point.y);
      const itemElement = element?.closest('[data-item-id]') as HTMLElement;
      
      if (itemElement) {
        const itemId = itemElement.dataset.itemId;
        if (itemId) {
          selectedItemRef.current = itemId;
          onItemSelect?.(itemId);
          
          // 添加触觉反馈（如果支持）
          if ('vibrate' in navigator) {
            navigator.vibrate(50);
          }
        }
      }
    }
  };

  const { bindGestures, isActive } = useTouchGestures(gestureHandlers, {
    swipeThreshold: 80,
    longPressDelay: 600,
    doubleTapDelay: 400
  });

  return {
    bindGestures,
    isActive,
    selectedItem: selectedItemRef.current
  };
};