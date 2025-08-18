/**
 * Checkbox 复选框组件
 * 支持多种尺寸、状态和自定义样式
 */
import React, { useState, useCallback } from 'react';
import { cn } from '../../utils';

/**
 * Checkbox 尺寸
 */
export type CheckboxSize = 'sm' | 'md' | 'lg';

/**
 * Checkbox 组件属性
 */
export interface CheckboxProps {
  /** 是否选中 */
  checked?: boolean;
  /** 默认是否选中 */
  defaultChecked?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否半选状态 */
  indeterminate?: boolean;
  /** 尺寸 */
  size?: CheckboxSize;
  /** 标签文字 */
  children?: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 变化回调 */
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** 点击回调 */
  onClick?: (event: React.MouseEvent<HTMLInputElement>) => void;
  /** 是否自动获取焦点 */
  autoFocus?: boolean;
  /** 标签ID */
  id?: string;
  /** 表单名称 */
  name?: string;
  /** 表单值 */
  value?: string;
  /** 是否必填 */
  required?: boolean;
  /** 错误状态 */
  error?: boolean;
  /** 错误信息 */
  errorMessage?: string;
}

/**
 * CheckIcon 组件
 */
const CheckIcon: React.FC<{ size: CheckboxSize }> = ({ size }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };
  
  return (
    <svg
      className={cn('text-white', sizeClasses[size])}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
};

/**
 * IndeterminateIcon 组件
 */
const IndeterminateIcon: React.FC<{ size: CheckboxSize }> = ({ size }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };
  
  return (
    <svg
      className={cn('text-white', sizeClasses[size])}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z"
        clipRule="evenodd"
      />
    </svg>
  );
};

/**
 * Checkbox 主组件
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked: controlledChecked,
  defaultChecked = false,
  disabled = false,
  indeterminate = false,
  size = 'md',
  children,
  className,
  onChange,
  onClick,
  autoFocus = false,
  id: propId,
  name,
  value,
  required = false,
  error = false,
  errorMessage,
}) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  
  // 判断是否为受控组件
  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internalChecked;
  
  const id = propId || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  
  const sizeConfig = {
    sm: {
      checkbox: 'w-4 h-4',
      text: 'text-sm',
      gap: 'gap-2',
    },
    md: {
      checkbox: 'w-5 h-5',
      text: 'text-base',
      gap: 'gap-3',
    },
    lg: {
      checkbox: 'w-6 h-6',
      text: 'text-lg',
      gap: 'gap-3',
    },
  };
  
  const config = sizeConfig[size];
  
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const newChecked = event.target.checked;
    
    if (!isControlled) {
      setInternalChecked(newChecked);
    }
    
    onChange?.(newChecked, event);
  }, [disabled, isControlled, onChange]);
  
  const handleClick = useCallback((event: React.MouseEvent<HTMLInputElement>) => {
    if (disabled) return;
    onClick?.(event);
  }, [disabled, onClick]);
  
  const getCheckboxClasses = () => {
    const baseClasses = cn(
      'relative inline-flex items-center justify-center rounded border-2 transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      config.checkbox
    );
    
    if (disabled) {
      return cn(
        baseClasses,
        'opacity-50 cursor-not-allowed',
        checked || indeterminate
          ? 'bg-gray-300 border-gray-300'
          : 'bg-gray-100 border-gray-300'
      );
    }
    
    if (error) {
      return cn(
        baseClasses,
        'cursor-pointer focus:ring-red-500',
        checked || indeterminate
          ? 'bg-red-500 border-red-500 hover:bg-red-600'
          : 'bg-white border-red-500 hover:border-red-600'
      );
    }
    
    return cn(
      baseClasses,
      'cursor-pointer focus:ring-blue-500',
      checked || indeterminate
        ? 'bg-blue-500 border-blue-500 hover:bg-blue-600'
        : 'bg-white border-gray-300 hover:border-blue-500'
    );
  };
  
  const getLabelClasses = () => {
    return cn(
      'select-none',
      config.text,
      disabled
        ? 'text-gray-400 cursor-not-allowed'
        : error
        ? 'text-red-700 cursor-pointer'
        : 'text-gray-900 cursor-pointer'
    );
  };
  
  return (
    <div className={cn('flex flex-col', className)}>
      <div className={cn('flex items-center', config.gap)}>
        <div className="relative">
          <input
            type="checkbox"
            id={id}
            name={name}
            value={value}
            checked={checked}
            disabled={disabled}
            required={required}
            autoFocus={autoFocus}
            onChange={handleChange}
            onClick={handleClick}
            className="sr-only"
            ref={(input) => {
              if (input) {
                input.indeterminate = indeterminate;
              }
            }}
          />
          
          <label htmlFor={id} className={getCheckboxClasses()}>
            {(checked || indeterminate) && (
              <span className="absolute inset-0 flex items-center justify-center">
                {indeterminate ? (
                  <IndeterminateIcon size={size} />
                ) : (
                  <CheckIcon size={size} />
                )}
              </span>
            )}
          </label>
        </div>
        
        {children && (
          <label htmlFor={id} className={getLabelClasses()}>
            {children}
          </label>
        )}
      </div>
      
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

/**
 * CheckboxGroup 组件
 */
export interface CheckboxGroupProps {
  /** 选中的值 */
  value?: string[];
  /** 默认选中的值 */
  defaultValue?: string[];
  /** 选项列表 */
  options?: Array<{
    label: string;
    value: string;
    disabled?: boolean;
  }>;
  /** 子组件 */
  children?: React.ReactNode;
  /** 是否禁用 */
  disabled?: boolean;
  /** 标题 */
  label?: string;
  /** 描述 */
  description?: string;
  /** 是否垂直排列 */
  vertical?: boolean;
  /** 间距 */
  gap?: 'sm' | 'md' | 'lg';
  /** 尺寸 */
  size?: CheckboxSize;
  /** 自定义类名 */
  className?: string;
  /** 变化回调 */
  onChange?: (values: string[]) => void;
  /** 是否必填 */
  required?: boolean;
  /** 错误状态 */
  error?: boolean;
  /** 错误信息 */
  errorMessage?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  value: controlledValue,
  defaultValue = [],
  options = [],
  children,
  disabled = false,
  label,
  description,
  vertical = false,
  gap = 'md',
  size = 'md',
  className,
  onChange,
  required = false,
  error = false,
  errorMessage,
}) => {
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue);
  
  // 判断是否为受控组件
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;
  
  const gapClasses = {
    sm: vertical ? 'space-y-2' : 'space-x-2',
    md: vertical ? 'space-y-3' : 'space-x-4',
    lg: vertical ? 'space-y-4' : 'space-x-6',
  };
  
  const handleCheckboxChange = useCallback((optionValue: string, checked: boolean) => {
    let newValue: string[];
    
    if (checked) {
      newValue = [...value, optionValue];
    } else {
      newValue = value.filter(v => v !== optionValue);
    }
    
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue);
  }, [value, isControlled, onChange]);
  
  const renderOptions = () => {
    if (children) {
      return children;
    }
    
    return options.map((option) => (
      <Checkbox
        key={option.value}
        checked={value.includes(option.value)}
        disabled={disabled || option.disabled}
        size={size}
        value={option.value}
        onChange={(checked) => handleCheckboxChange(option.value, checked)}
        error={error}
      >
        {option.label}
      </Checkbox>
    ));
  };
  
  return (
    <div className={cn('space-y-2', className)}>
      {(label || description) && (
        <div>
          {label && (
            <h3 className={cn(
              'text-sm font-medium',
              error ? 'text-red-700' : 'text-gray-900'
            )}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
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
        {renderOptions()}
      </div>
      
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default Checkbox;