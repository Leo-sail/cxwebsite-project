/**
 * Radio 单选框组件
 * 支持多种尺寸、状态和自定义样式
 */
import React, { useState, useCallback } from 'react';
import { cn } from '../../utils';

/**
 * Radio 尺寸
 */
export type RadioSize = 'sm' | 'md' | 'lg';

/**
 * Radio 组件属性
 */
export interface RadioProps {
  /** 是否选中 */
  checked?: boolean;
  /** 默认是否选中 */
  defaultChecked?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 尺寸 */
  size?: RadioSize;
  /** 标签文字 */
  children?: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 变化回调 */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
 * RadioDot 组件
 */
const RadioDot: React.FC<{ size: RadioSize }> = ({ size }) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };
  
  return (
    <div className={cn(
      'rounded-full bg-white transition-all duration-200',
      sizeClasses[size]
    )} />
  );
};

/**
 * Radio 主组件
 */
export const Radio: React.FC<RadioProps> = ({
  checked: controlledChecked,
  defaultChecked = false,
  disabled = false,
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
  
  const id = propId || `radio-${Math.random().toString(36).substr(2, 9)}`;
  
  const sizeConfig = {
    sm: {
      radio: 'w-4 h-4',
      text: 'text-sm',
      gap: 'gap-2',
    },
    md: {
      radio: 'w-5 h-5',
      text: 'text-base',
      gap: 'gap-3',
    },
    lg: {
      radio: 'w-6 h-6',
      text: 'text-lg',
      gap: 'gap-3',
    },
  };
  
  const config = sizeConfig[size];
  
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    if (!isControlled) {
      setInternalChecked(event.target.checked);
    }
    
    onChange?.(event);
  }, [disabled, isControlled, onChange]);
  
  const handleClick = useCallback((event: React.MouseEvent<HTMLInputElement>) => {
    if (disabled) return;
    onClick?.(event);
  }, [disabled, onClick]);
  
  const getRadioClasses = () => {
    const baseClasses = cn(
      'relative inline-flex items-center justify-center rounded-full border-2 transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      config.radio
    );
    
    if (disabled) {
      return cn(
        baseClasses,
        'opacity-50 cursor-not-allowed',
        checked
          ? 'bg-gray-300 border-gray-300'
          : 'bg-gray-100 border-gray-300'
      );
    }
    
    if (error) {
      return cn(
        baseClasses,
        'cursor-pointer focus:ring-red-500',
        checked
          ? 'bg-red-500 border-red-500 hover:bg-red-600'
          : 'bg-white border-red-500 hover:border-red-600'
      );
    }
    
    return cn(
      baseClasses,
      'cursor-pointer focus:ring-blue-500',
      checked
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
            type="radio"
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
          />
          
          <label htmlFor={id} className={getRadioClasses()}>
            {checked && (
              <span className="absolute inset-0 flex items-center justify-center">
                <RadioDot size={size} />
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
 * RadioGroup 组件
 */
export interface RadioGroupProps {
  /** 选中的值 */
  value?: string;
  /** 默认选中的值 */
  defaultValue?: string;
  /** 选项列表 */
  options?: Array<{
    label: string;
    value: string;
    disabled?: boolean;
    description?: string;
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
  size?: RadioSize;
  /** 自定义类名 */
  className?: string;
  /** 表单名称 */
  name?: string;
  /** 变化回调 */
  onChange?: (value: string) => void;
  /** 是否必填 */
  required?: boolean;
  /** 错误状态 */
  error?: boolean;
  /** 错误信息 */
  errorMessage?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value: controlledValue,
  defaultValue,
  options = [],
  children,
  disabled = false,
  label,
  description,
  vertical = false,
  gap = 'md',
  size = 'md',
  className,
  name: propName,
  onChange,
  required = false,
  error = false,
  errorMessage,
}) => {
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);
  
  // 判断是否为受控组件
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;
  
  const name = propName || `radio-group-${Math.random().toString(36).substr(2, 9)}`;
  
  const gapClasses = {
    sm: vertical ? 'space-y-2' : 'space-x-2',
    md: vertical ? 'space-y-3' : 'space-x-4',
    lg: vertical ? 'space-y-4' : 'space-x-6',
  };
  
  const handleRadioChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue);
  }, [isControlled, onChange]);
  
  const renderOptions = () => {
    if (children) {
      return children;
    }
    
    return options.map((option) => (
      <div key={option.value} className="flex flex-col">
        <Radio
          checked={value === option.value}
          disabled={disabled || option.disabled}
          size={size}
          name={name}
          value={option.value}
          onChange={handleRadioChange}
          error={error}
        >
          {option.label}
        </Radio>
        {option.description && (
          <p className="ml-8 mt-1 text-sm text-gray-500">
            {option.description}
          </p>
        )}
      </div>
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
        vertical ? 'flex flex-col' : 'flex flex-wrap items-start',
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

/**
 * RadioCard 组件 - 卡片式单选框
 */
export interface RadioCardProps extends Omit<RadioProps, 'children'> {
  /** 标题 */
  title: string;
  /** 描述 */
  description?: string;
  /** 图标 */
  icon?: React.ReactNode;
  /** 是否选中 */
  selected?: boolean;
}

export const RadioCard: React.FC<RadioCardProps> = ({
  title,
  description,
  icon,
  selected = false,
  disabled = false,
  className,
  ...radioProps
}) => {
  return (
    <label className={cn(
      'relative flex items-start p-4 border rounded-lg cursor-pointer transition-all duration-200',
      'hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
      selected
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-300',
      disabled
        ? 'opacity-50 cursor-not-allowed'
        : 'cursor-pointer',
      className
    )}>
      <Radio
        {...radioProps}
        checked={selected}
        disabled={disabled}
        className="mt-1"
      />
      
      <div className="ml-3 flex-1">
        <div className="flex items-center gap-2">
          {icon && (
            <span className={cn(
              'flex-shrink-0',
              selected ? 'text-blue-600' : 'text-gray-400'
            )}>
              {icon}
            </span>
          )}
          <h4 className={cn(
            'font-medium',
            selected ? 'text-blue-900' : 'text-gray-900',
            disabled && 'text-gray-400'
          )}>
            {title}
          </h4>
        </div>
        
        {description && (
          <p className={cn(
            'mt-1 text-sm',
            selected ? 'text-blue-700' : 'text-gray-500',
            disabled && 'text-gray-400'
          )}>
            {description}
          </p>
        )}
      </div>
    </label>
  );
};

export default Radio;