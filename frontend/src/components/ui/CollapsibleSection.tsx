import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils';

/**
 * 可折叠面板组件的属性接口
 */
interface CollapsibleSectionProps {
  /** 面板标题 */
  title: string;
  /** 面板内容 */
  children: React.ReactNode;
  /** 初始是否展开 */
  defaultOpen?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 标题样式类名 */
  titleClassName?: string;
  /** 内容样式类名 */
  contentClassName?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 展开/收起状态变化回调 */
  onToggle?: (isOpen: boolean) => void;
}

/**
 * 可折叠面板组件
 * 基于项目现有的accordion样式实现，支持展开/收起功能
 */
export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen = false,
  className,
  titleClassName,
  contentClassName,
  disabled = false,
  onToggle
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  /**
   * 处理面板展开/收起切换
   */
  const handleToggle = () => {
    if (disabled) return;
    
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };

  return (
    <div className={cn('accordion-item', className)}>
      {/* 面板标题按钮 */}
      <button
        className={cn(
          'accordion-header',
          isOpen && 'open',
          disabled && 'opacity-50 cursor-not-allowed',
          titleClassName
        )}
        onClick={handleToggle}
        disabled={disabled}
        type="button"
        aria-expanded={isOpen}
        aria-controls={`collapsible-content-${title}`}
      >
        <span className="font-medium text-gray-900">{title}</span>
        <ChevronDownIcon 
          className={cn(
            'accordion-icon w-5 h-5 text-gray-500 transition-transform duration-200',
            isOpen && 'transform rotate-180'
          )}
        />
      </button>
      
      {/* 面板内容 */}
      {isOpen && (
        <div 
          className={cn('accordion-content', contentClassName)}
          id={`collapsible-content-${title}`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;