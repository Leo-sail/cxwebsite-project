/**
 * DropdownMenu 下拉菜单组件
 */
import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { cn } from '../../utils';

/**
 * DropdownMenu 上下文
 */
interface DropdownMenuContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
}

const DropdownMenuContext = createContext<DropdownMenuContextType | null>(null);

/**
 * 使用 DropdownMenu 上下文
 */
const useDropdownMenu = () => {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('DropdownMenu components must be used within DropdownMenu');
  }
  return context;
};

/**
 * DropdownMenu 主组件属性
 */
export interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * DropdownMenu 主组件
 */
export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  children,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen, triggerRef }}>
      <div className={cn('relative inline-block', className)}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
};

/**
 * DropdownMenuTrigger 触发器属性
 */
export interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

/**
 * DropdownMenuTrigger 触发器组件
 */
export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({
  children,
  asChild = false,
  className
}) => {
  const { isOpen, setIsOpen, triggerRef } = useDropdownMenu();

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref: triggerRef,
      onClick: handleClick,
      className: cn(children.props.className, className),
      'aria-expanded': isOpen,
      'aria-haspopup': true
    } as any);
  }

  return (
    <button
      ref={triggerRef as React.RefObject<HTMLButtonElement>}
      onClick={handleClick}
      className={cn('outline-none', className)}
      aria-expanded={isOpen}
      aria-haspopup={true}
    >
      {children}
    </button>
  );
};

/**
 * DropdownMenuContent 内容属性
 */
export interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

/**
 * DropdownMenuContent 内容组件
 */
export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  children,
  align = 'start',
  side = 'bottom',
  className
}) => {
  const { isOpen } = useDropdownMenu();

  if (!isOpen) return null;

  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0'
  };

  const sideClasses = {
    top: 'bottom-full mb-1',
    bottom: 'top-full mt-1',
    left: 'right-full mr-1',
    right: 'left-full ml-1'
  };

  return (
    <div
      className={cn(
        'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md',
        'animate-in fade-in-0 zoom-in-95',
        alignmentClasses[align],
        sideClasses[side],
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * DropdownMenuItem 菜单项属性
 */
export interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * DropdownMenuItem 菜单项组件
 */
export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  children,
  onClick,
  disabled = false,
  className
}) => {
  const { setIsOpen } = useDropdownMenu();

  const handleClick = () => {
    if (!disabled) {
      onClick?.();
      setIsOpen(false);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
        'transition-colors focus:bg-gray-100 hover:bg-gray-100',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * DropdownMenuSeparator 分隔符属性
 */
export interface DropdownMenuSeparatorProps {
  className?: string;
}

/**
 * DropdownMenuSeparator 分隔符组件
 */
export const DropdownMenuSeparator: React.FC<DropdownMenuSeparatorProps> = ({
  className
}) => {
  return (
    <div
      className={cn(
        '-mx-1 my-1 h-px bg-gray-200',
        className
      )}
    />
  );
};

export default DropdownMenu;