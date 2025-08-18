/**
 * 移动端触摸手势工具类
 * 提供统一的触摸手势识别和处理功能
 */
import React from 'react';

/**
 * 触摸点信息接口
 */
interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

/**
 * 手势配置接口
 */
interface GestureConfig {
  // 滑动手势配置
  swipe?: {
    threshold?: number; // 最小滑动距离
    velocity?: number;  // 最小滑动速度
    direction?: 'horizontal' | 'vertical' | 'all';
  };
  // 长按手势配置
  longPress?: {
    duration?: number;  // 长按时间阈值
    threshold?: number; // 允许的移动距离
  };
  // 双击手势配置
  doubleTap?: {
    interval?: number;  // 双击间隔时间
    threshold?: number; // 允许的移动距离
  };
  // 捏合手势配置
  pinch?: {
    threshold?: number; // 最小缩放比例变化
  };
}

/**
 * 手势事件接口
 */
interface GestureEvent {
  type: 'swipe' | 'longPress' | 'doubleTap' | 'pinch' | 'tap';
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
  velocity?: number;
  scale?: number;
  center?: TouchPoint;
  originalEvent: TouchEvent;
}

/**
 * 手势回调函数类型
 */
type GestureCallback = (event: GestureEvent) => void;

/**
 * 默认手势配置
 */
const DEFAULT_CONFIG: Required<GestureConfig> = {
  swipe: {
    threshold: 50,
    velocity: 0.3,
    direction: 'all'
  },
  longPress: {
    duration: 500,
    threshold: 10
  },
  doubleTap: {
    interval: 300,
    threshold: 20
  },
  pinch: {
    threshold: 0.1
  }
};

/**
 * 触摸手势识别器类
 */
export class TouchGestureRecognizer {
  private element: HTMLElement;
  private config: Required<GestureConfig>;
  private callbacks: Map<string, GestureCallback[]> = new Map();
  
  // 触摸状态
  private touchStart: TouchPoint | null = null;
  private touchCurrent: TouchPoint | null = null;
  private lastTap: TouchPoint | null = null;
  private longPressTimer: number | null = null;
  private initialDistance: number = 0;
  private currentScale: number = 1;
  
  constructor(element: HTMLElement, config: GestureConfig = {}) {
    this.element = element;
    this.config = { ...DEFAULT_CONFIG, ...config } as Required<GestureConfig>;
    this.init();
  }

  /**
   * 初始化事件监听
   */
  private init(): void {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false });
  }

  /**
   * 处理触摸开始事件
   */
  private handleTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    const now = Date.now();
    
    this.touchStart = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: now
    };
    
    this.touchCurrent = { ...this.touchStart };
    
    // 处理多点触摸（捏合手势）
    if (event.touches.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      this.initialDistance = this.getDistance(touch1, touch2);
      this.currentScale = 1;
    }
    
    // 设置长按定时器
    this.longPressTimer = window.setTimeout(() => {
      if (this.touchStart && this.touchCurrent) {
        const distance = this.getDistance(
          { clientX: this.touchStart.x, clientY: this.touchStart.y } as Touch,
          { clientX: this.touchCurrent.x, clientY: this.touchCurrent.y } as Touch
        );
        
        if (distance <= this.config.longPress!.threshold!) {
          this.emit('longPress', {
            type: 'longPress',
            center: this.touchStart,
            originalEvent: event
          });
        }
      }
    }, this.config.longPress.duration);
  }

  /**
   * 处理触摸移动事件
   */
  private handleTouchMove(event: TouchEvent): void {
    if (!this.touchStart) return;
    
    const touch = event.touches[0];
    this.touchCurrent = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };
    
    // 处理捏合手势
    if (event.touches.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const currentDistance = this.getDistance(touch1, touch2);
      const scale = currentDistance / this.initialDistance;
      
      if (Math.abs(scale - this.currentScale) > this.config.pinch!.threshold!) {
        this.currentScale = scale;
        this.emit('pinch', {
          type: 'pinch',
          scale,
          center: {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2,
            timestamp: Date.now()
          },
          originalEvent: event
        });
      }
    }
    
    // 如果移动距离超过阈值，取消长按
    if (this.longPressTimer) {
      const distance = this.getDistance(
        { clientX: this.touchStart.x, clientY: this.touchStart.y } as Touch,
        { clientX: this.touchCurrent.x, clientY: this.touchCurrent.y } as Touch
      );
      
      if (distance > this.config.longPress!.threshold!) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
    }
  }

  /**
   * 处理触摸结束事件
   */
  private handleTouchEnd(event: TouchEvent): void {
    if (!this.touchStart || !this.touchCurrent) return;
    
    // 清除长按定时器
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    
    const deltaX = this.touchCurrent.x - this.touchStart.x;
    const deltaY = this.touchCurrent.y - this.touchStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = this.touchCurrent.timestamp - this.touchStart.timestamp;
    const velocity = distance / duration;
    
    // 判断是否为滑动手势
    if (distance >= this.config.swipe!.threshold! && velocity >= this.config.swipe!.velocity!) {
      const direction = this.getSwipeDirection(deltaX, deltaY);
      
      // 检查方向限制
      if (this.isDirectionAllowed(direction)) {
        this.emit('swipe', {
          type: 'swipe',
          direction,
          distance,
          velocity,
          originalEvent: event
        });
      }
    } else if (distance < this.config.doubleTap!.threshold!) {
      // 判断是否为点击或双击
      const now = Date.now();
      
      if (this.lastTap && 
          now - this.lastTap.timestamp < this.config.doubleTap!.interval! &&
          this.getDistance(
            { clientX: this.lastTap.x, clientY: this.lastTap.y } as Touch,
            { clientX: this.touchStart.x, clientY: this.touchStart.y } as Touch
          ) < this.config.doubleTap!.threshold!) {
        // 双击
        this.emit('doubleTap', {
          type: 'doubleTap',
          center: this.touchStart,
          originalEvent: event
        });
        this.lastTap = null;
      } else {
        // 单击
        this.emit('tap', {
          type: 'tap',
          center: this.touchStart,
          originalEvent: event
        });
        this.lastTap = { ...this.touchStart };
      }
    }
    
    this.reset();
  }

  /**
   * 处理触摸取消事件
   */
  private handleTouchCancel(_event: TouchEvent): void {
    void _event; // 标记参数已使用
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    this.reset();
  }

  /**
   * 重置触摸状态
   */
  private reset(): void {
    this.touchStart = null;
    this.touchCurrent = null;
    this.initialDistance = 0;
    this.currentScale = 1;
  }

  /**
   * 计算两点间距离
   */
  private getDistance(touch1: Touch, touch2: Touch): number {
    const deltaX = touch1.clientX - touch2.clientX;
    const deltaY = touch1.clientY - touch2.clientY;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  /**
   * 获取滑动方向
   */
  private getSwipeDirection(deltaX: number, deltaY: number): 'left' | 'right' | 'up' | 'down' {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }

  /**
   * 检查方向是否被允许
   */
  private isDirectionAllowed(direction: 'left' | 'right' | 'up' | 'down'): boolean {
    const { direction: allowedDirection } = this.config.swipe;
    
    if (allowedDirection === 'all') return true;
    if (allowedDirection === 'horizontal') return direction === 'left' || direction === 'right';
    if (allowedDirection === 'vertical') return direction === 'up' || direction === 'down';
    
    return false;
  }

  /**
   * 触发手势事件
   */
  private emit(type: string, event: GestureEvent): void {
    const callbacks = this.callbacks.get(type);
    if (callbacks) {
      callbacks.forEach(callback => callback(event));
    }
  }

  /**
   * 添加手势事件监听器
   */
  public on(type: string, callback: GestureCallback): void {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, []);
    }
    this.callbacks.get(type)!.push(callback);
  }

  /**
   * 移除手势事件监听器
   */
  public off(type: string, callback?: GestureCallback): void {
    if (!callback) {
      this.callbacks.delete(type);
      return;
    }
    
    const callbacks = this.callbacks.get(type);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * 销毁手势识别器
   */
  public destroy(): void {
    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    this.element.removeEventListener('touchcancel', this.handleTouchCancel.bind(this));
    
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
    
    this.callbacks.clear();
    this.reset();
  }
}

/**
 * 触觉反馈工具函数
 */
export const hapticFeedback = {
  /**
   * 轻微震动反馈
   */
  light(): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  
  /**
   * 中等震动反馈
   */
  medium(): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },
  
  /**
   * 强烈震动反馈
   */
  heavy(): void {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 10, 30]);
    }
  },
  
  /**
   * 成功反馈
   */
  success(): void {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 5, 10]);
    }
  },
  
  /**
   * 错误反馈
   */
  error(): void {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 10, 50, 10, 50]);
    }
  }
};

/**
 * 移动端交互优化工具函数
 */
export const mobileInteraction = {
  /**
   * 防止移动端双击缩放
   */
  preventDoubleTapZoom(element: HTMLElement): void {
    let lastTouchEnd = 0;
    element.addEventListener('touchend', (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
  },
  
  /**
   * 优化移动端滚动性能
   */
  optimizeScrolling(element: HTMLElement): void {
    (element.style as unknown as Record<string, string>).webkitOverflowScrolling = 'touch';
    (element.style as unknown as Record<string, string>).overflowScrolling = 'touch';
  },
  
  /**
   * 设置触摸目标最小尺寸
   */
  setMinTouchTarget(element: HTMLElement, size: number = 44): void {
    const currentStyle = window.getComputedStyle(element);
    const currentWidth = parseInt(currentStyle.width);
    const currentHeight = parseInt(currentStyle.height);
    
    if (currentWidth < size) {
      element.style.minWidth = `${size}px`;
    }
    if (currentHeight < size) {
      element.style.minHeight = `${size}px`;
    }
  },
  
  /**
   * 添加触摸高亮效果
   */
  addTouchHighlight(element: HTMLElement, color: string = 'rgba(0, 0, 0, 0.1)'): void {
    (element.style as unknown as Record<string, string>).webkitTapHighlightColor = color;
  },
  
  /**
   * 禁用文本选择
   */
  disableTextSelection(element: HTMLElement): void {
    element.style.webkitUserSelect = 'none';
    element.style.userSelect = 'none';
  }
};

/**
 * React Hook: 使用触摸手势
 */
export function useTouchGesture(
  ref: React.RefObject<HTMLElement | null>,
  config: GestureConfig = {}
) {
  const recognizerRef = React.useRef<TouchGestureRecognizer | null>(null);
  
  React.useEffect(() => {
    if (ref.current) {
      recognizerRef.current = new TouchGestureRecognizer(ref.current, config);
      
      return () => {
        recognizerRef.current?.destroy();
      };
    }
  }, [ref, config]);
  
  const on = React.useCallback((type: string, callback: GestureCallback) => {
    recognizerRef.current?.on(type, callback);
  }, []);
  
  const off = React.useCallback((type: string, callback?: GestureCallback) => {
    recognizerRef.current?.off(type, callback);
  }, []);
  
  return { on, off };
}

export default TouchGestureRecognizer;