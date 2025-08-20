/**
 * Select 选择器组件
 */
import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils';

/**
 * Select 选项类型
 */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Select 组件属性
 */
export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
}

/**
 * Select 组件
 */
export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = '请选择...',
  label,
  className,
  disabled = false,
  error,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            'block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg',
            'bg-white text-gray-900 placeholder-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'transition-colors duration-200',
            'appearance-none cursor-pointer',
            disabled && 'bg-gray-50 cursor-not-allowed',
            error && 'border-red-500 focus:ring-red-500',
            'hover:border-gray-400'
          )}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Select;

// Radix UI 风格的 Select 组件
/**
 * SelectTrigger 触发器组件
 */
export const SelectTrigger: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={cn(
      'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}>
      {children}
    </div>
  );
};

/**
 * SelectValue 值显示组件
 */
export const SelectValue: React.FC<{
  placeholder?: string;
  className?: string;
}> = ({ placeholder, className }) => {
  return (
    <span className={cn('block truncate', className)}>
      {placeholder}
    </span>
  );
};

/**
 * SelectContent 内容容器组件
 */
export const SelectContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={cn(
      'relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
      className
    )}>
      <div className="p-1">
        {children}
      </div>
    </div>
  );
};

/**
 * SelectItem 选项组件
 */
export const SelectItem: React.FC<{
  children: React.ReactNode;
  value: string;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}>
      {children}
    </div>
  );
};