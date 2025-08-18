/**
 * Switch 开关组件
 * 支持多种尺寸、状态和自定义样式
 */
import React, { useState, useCallback } from 'react';
import { cn } from '../../utils';

/**
 * Switch 尺寸
 */
export type SwitchSize = 'sm' | 'md' | 'lg';

/**
 * Switch 组件属性
 */
export interface SwitchProps {
  /** 是否选中 */
  checked?: boolean;
  /** 默认是否选中 */
  defaultChecked?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否加载中 */
  loading?: boolean;
  /** 尺寸 */
  size?: SwitchSize;
  /** 选中时的文字 */
  checkedChildren?: React.ReactNode;
  /** 未选中时的文字 */
  unCheckedChildren?: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 变化回调 */
  onChange?: (checked: boolean, event: React.MouseEvent<HTMLButtonElement>) => void;
  /** 点击回调 */
  onClick?: (checked: boolean, event: React.MouseEvent<HTMLButtonElement>) => void;
  /** 自定义选中颜色 */
  checkedColor?: string;
  /** 自定义未选中颜色 */
  uncheckedColor?: string;
  /** 是否自动获取焦点 */
  autoFocus?: boolean;
  /** 标签ID */
  id?: string;
  /** 表单名称 */
  name?: string;
  /** 表单值 */
  value?: string;
}

/**
 * LoadingSpinner 组件
 */
const LoadingSpinner: React.FC<{ size: SwitchSize }> = ({ size }) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };
  
  return (
    <div className={cn(
      'animate-spin rounded-full border-2 border-white border-t-transparent',
      sizeClasses[size]
    )} />
  );
};

/**
 * Switch 主组件
 */
export const Switch: React.FC<SwitchProps> = ({
  checked: controlledChecked,
  defaultChecked = false,
  disabled = false,
  loading = false,
  size = 'md',
  checkedChildren,
  unCheckedChildren,
  className,
  onChange,
  onClick,
  checkedColor,
  uncheckedColor,
  autoFocus = false,
  id,
  name,
  value,
}) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  
  // 判断是否为受控组件
  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internalChecked;
  
  const sizeConfig = {
    sm: {
      switch: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4',
      padding: 'p-0.5',
      text: 'text-xs',
    },
    md: {
      switch: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
      padding: 'p-0.5',
      text: 'text-sm',
    },
    lg: {
      switch: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7',
      padding: 'p-0.5',
      text: 'text-base',
    },
  };
  
  const config = sizeConfig[size];
  
  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    const newChecked = !checked;
    
    if (!isControlled) {
      setInternalChecked(newChecked);
    }
    
    onChange?.(newChecked, event);
    onClick?.(newChecked, event);
  }, [checked, disabled, loading, isControlled, onChange, onClick]);
  
  const getSwitchClasses = () => {
    const baseClasses = cn(
      'relative inline-flex items-center rounded-full transition-all duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      config.switch,
      config.padding
    );
    
    if (disabled) {
      return cn(baseClasses, 'opacity-50 cursor-not-allowed bg-gray-200');
    }
    
    if (loading) {
      return cn(baseClasses, 'cursor-wait');
    }
    
    if (checked) {
      const bgColor = checkedColor || 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500';
      return cn(baseClasses, bgColor, 'cursor-pointer');
    }
    
    const bgColor = uncheckedColor || 'bg-gray-200 hover:bg-gray-300 focus:ring-gray-500';
    return cn(baseClasses, bgColor, 'cursor-pointer');
  };
  
  const getThumbClasses = () => {
    const baseClasses = cn(
      'inline-block rounded-full bg-white shadow-lg transform transition-transform duration-200 ease-in-out',
      'flex items-center justify-center',
      config.thumb
    );
    
    if (checked) {
      return cn(baseClasses, config.translate);
    }
    
    return baseClasses;
  };
  
  const renderChildren = () => {
    if (!checkedChildren && !unCheckedChildren) return null;
    
    const currentChildren = checked ? checkedChildren : unCheckedChildren;
    if (!currentChildren) return null;
    
    return (
      <span className={cn(
        'absolute inset-0 flex items-center justify-center font-medium text-white',
        config.text,
        checked ? 'pr-6' : 'pl-6'
      )}>
        {currentChildren}
      </span>
    );
  };
  
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled || loading}
      className={cn(getSwitchClasses(), className)}
      onClick={handleClick}
      autoFocus={autoFocus}
      id={id}
      name={name}
      value={value}
      style={{
        backgroundColor: checked ? checkedColor : uncheckedColor,
      }}
    >
      {renderChildren()}
      
      <span className={getThumbClasses()}>
        {loading && <LoadingSpinner size={size} />}
      </span>
    </button>
  );
};

/**
 * SwitchGroup 组件
 */
export interface SwitchGroupProps {
  /** 子组件 */
  children: React.ReactNode;
  /** 标题 */
  label?: string;
  /** 描述 */
  description?: string;
  /** 是否垂直排列 */
  vertical?: boolean;
  /** 间距 */
  gap?: 'sm' | 'md' | 'lg';
  /** 自定义类名 */
  className?: string;
}

export const SwitchGroup: React.FC<SwitchGroupProps> = ({
  children,
  label,
  description,
  vertical = false,
  gap = 'md',
  className,
}) => {
  const gapClasses = {
    sm: vertical ? 'space-y-2' : 'space-x-2',
    md: vertical ? 'space-y-4' : 'space-x-4',
    lg: vertical ? 'space-y-6' : 'space-x-6',
  };
  
  return (
    <div className={cn('space-y-2', className)}>
      {(label || description) && (
        <div>
          {label && (
            <h3 className="text-sm font-medium text-gray-900">
              {label}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className={cn(
        vertical ? 'flex flex-col' : 'flex flex-wrap items-center',
        gapClasses[gap]
      )}>
        {children}
      </div>
    </div>
  );
};

/**
 * SwitchItem 组件 - 带标签的开关
 */
export interface SwitchItemProps extends Omit<SwitchProps, 'children'> {
  /** 标签文字 */
  label: string;
  /** 描述文字 */
  description?: string;
  /** 标签位置 */
  labelPosition?: 'left' | 'right';
}

export const SwitchItem: React.FC<SwitchItemProps> = ({
  label,
  description,
  labelPosition = 'left',
  className,
  id: propId,
  ...switchProps
}) => {
  const id = propId || `switch-${Math.random().toString(36).substr(2, 9)}`;
  
  const renderLabel = () => (
    <div className="flex-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-900 cursor-pointer">
        {label}
      </label>
      {description && (
        <p className="text-sm text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
  
  const renderSwitch = () => (
    <Switch {...switchProps} id={id} />
  );
  
  return (
    <div className={cn(
      'flex items-center gap-3',
      labelPosition === 'right' ? 'flex-row-reverse' : 'flex-row',
      className
    )}>
      {labelPosition === 'left' ? (
        <>
          {renderLabel()}
          {renderSwitch()}
        </>
      ) : (
        <>
          {renderSwitch()}
          {renderLabel()}
        </>
      )}
    </div>
  );
};

export default Switch;