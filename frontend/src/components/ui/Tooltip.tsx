/**
 * Tooltip 提示框组件
 * 提供悬停或聚焦时的信息提示
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils';

/**
 * Tooltip 位置类型
 */
export type TooltipPlacement = 
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end';

/**
 * Tooltip 触发方式
 */
export type TooltipTrigger = 'hover' | 'click' | 'focus' | 'manual';

/**
 * Tooltip 组件属性
 */
export interface TooltipProps {
  /** 提示内容 */
  content: React.ReactNode;
  /** 子元素 */
  children: React.ReactElement;
  /** 显示位置 */
  placement?: TooltipPlacement;
  /** 触发方式 */
  trigger?: TooltipTrigger;
  /** 是否显示（手动控制） */
  visible?: boolean;
  /** 显示状态变化回调 */
  onVisibleChange?: (visible: boolean) => void;
  /** 延迟显示时间（毫秒） */
  delay?: number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 箭头是否显示 */
  showArrow?: boolean;
}

/**
 * 计算位置的工具函数
 */
const calculatePosition = (
  triggerRect: DOMRect,
  tooltipRect: DOMRect,
  placement: TooltipPlacement,
  offset = 8
) => {
  const positions: Record<TooltipPlacement, { top: number; left: number }> = {
    'top': {
      top: triggerRect.top - tooltipRect.height - offset,
      left: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2,
    },
    'top-start': {
      top: triggerRect.top - tooltipRect.height - offset,
      left: triggerRect.left,
    },
    'top-end': {
      top: triggerRect.top - tooltipRect.height - offset,
      left: triggerRect.right - tooltipRect.width,
    },
    'bottom': {
      top: triggerRect.bottom + offset,
      left: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2,
    },
    'bottom-start': {
      top: triggerRect.bottom + offset,
      left: triggerRect.left,
    },
    'bottom-end': {
      top: triggerRect.bottom + offset,
      left: triggerRect.right - tooltipRect.width,
    },
    'left': {
      top: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2,
      left: triggerRect.left - tooltipRect.width - offset,
    },
    'left-start': {
      top: triggerRect.top,
      left: triggerRect.left - tooltipRect.width - offset,
    },
    'left-end': {
      top: triggerRect.bottom - tooltipRect.height,
      left: triggerRect.left - tooltipRect.width - offset,
    },
    'right': {
      top: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2,
      left: triggerRect.right + offset,
    },
    'right-start': {
      top: triggerRect.top,
      left: triggerRect.right + offset,
    },
    'right-end': {
      top: triggerRect.bottom - tooltipRect.height,
      left: triggerRect.right + offset,
    },
  };
  
  return positions[placement];
};

/**
 * Tooltip 组件
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  trigger = 'hover',
  visible: controlledVisible,
  onVisibleChange,
  delay = 100,
  disabled = false,
  className,
  showArrow = true,
}) => {
  const [internalVisible, setInternalVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const visible = controlledVisible !== undefined ? controlledVisible : internalVisible;
  
  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    const newPosition = calculatePosition(triggerRect, tooltipRect, placement);
    
    // 边界检测和调整
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    
    if (newPosition.left < 0) {
      newPosition.left = 8;
    } else if (newPosition.left + tooltipRect.width > viewport.width) {
      newPosition.left = viewport.width - tooltipRect.width - 8;
    }
    
    if (newPosition.top < 0) {
      newPosition.top = 8;
    } else if (newPosition.top + tooltipRect.height > viewport.height) {
      newPosition.top = viewport.height - tooltipRect.height - 8;
    }
    
    setPosition(newPosition);
  }, [placement]);
  
  const showTooltip = () => {
    if (disabled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setInternalVisible(true);
      onVisibleChange?.(true);
    }, delay);
  };
  
  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setInternalVisible(false);
    onVisibleChange?.(false);
  };
  
  const handleTriggerEvents = () => {
    const events: Record<string, () => void> = {};
    
    if (trigger === 'hover') {
      events.onMouseEnter = showTooltip;
      events.onMouseLeave = hideTooltip;
    } else if (trigger === 'click') {
      events.onClick = () => {
        if (visible) {
          hideTooltip();
        } else {
          showTooltip();
        }
      };
    } else if (trigger === 'focus') {
      events.onFocus = showTooltip;
      events.onBlur = hideTooltip;
    }
    
    return events;
  };
  
  useEffect(() => {
    if (visible) {
      updatePosition();
      
      const handleResize = () => updatePosition();
      const handleScroll = () => updatePosition();
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [visible, placement, updatePosition]);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // 箭头样式
  const getArrowClasses = () => {
    const baseArrow = 'absolute w-2 h-2 bg-gray-900 transform rotate-45';
    
    if (placement.startsWith('top')) {
      return `${baseArrow} -bottom-1 left-1/2 -translate-x-1/2`;
    } else if (placement.startsWith('bottom')) {
      return `${baseArrow} -top-1 left-1/2 -translate-x-1/2`;
    } else if (placement.startsWith('left')) {
      return `${baseArrow} -right-1 top-1/2 -translate-y-1/2`;
    } else if (placement.startsWith('right')) {
      return `${baseArrow} -left-1 top-1/2 -translate-y-1/2`;
    }
    
    return baseArrow;
  };
  
  const triggerElement = React.cloneElement(children as any, {
    ref: (node: HTMLElement) => {
      triggerRef.current = node;
      // 如果原始元素有ref，也要调用它
      const originalRef = (children as any).ref;
      if (typeof originalRef === 'function') {
        originalRef(node);
      } else if (originalRef && typeof originalRef === 'object') {
        (originalRef as any).current = node;
      }
    },
    ...handleTriggerEvents(),
  });
  
  const tooltipContent = visible && (
    <div
      ref={tooltipRef}
      className={cn(
        'fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-md shadow-lg',
        'animate-in fade-in-0 zoom-in-95 duration-200',
        className
      )}
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {content}
      {showArrow && <div className={getArrowClasses()} />}
    </div>
  );
  
  return (
    <>
      {triggerElement}
      {typeof document !== 'undefined' && createPortal(
        tooltipContent,
        document.body
      )}
    </>
  );
};

export default Tooltip;

// Radix UI 风格的 Tooltip 组件
/**
 * TooltipProvider 提供 Tooltip 上下文
 */
export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

/**
 * TooltipTrigger 触发器组件
 */
export const TooltipTrigger: React.FC<{ 
  children: React.ReactElement;
  asChild?: boolean;
}> = ({ children, asChild = false }) => {
  if (asChild) {
    return React.cloneElement(children);
  }
  return children;
};

/**
 * TooltipContent 内容组件
 */
export const TooltipContent: React.FC<{
  children: React.ReactNode;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}> = ({ children, className }) => {
  return (
    <div 
      className={cn(
        'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95',
        className
      )}
      role="tooltip"
    >
      {children}
    </div>
  );
};