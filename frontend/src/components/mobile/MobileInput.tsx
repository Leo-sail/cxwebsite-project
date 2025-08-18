/**
 * 移动端优化输入组件
 * 提供移动端友好的输入体验
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../utils';
import { useResponsive } from '../../hooks/useResponsive';
import { hapticFeedback } from '../../utils/touchGestures';
import { TouchableArea } from './TouchableArea';
import {
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

/**
 * 输入类型枚举
 */
type InputType = 'text' | 'password' | 'email' | 'tel' | 'number' | 'search' | 'url';

/**
 * 验证状态枚举
 */
type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid';

/**
 * 移动端输入框属性接口
 */
interface MobileInputProps {
  // 基础属性
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  type?: InputType;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  
  // 样式配置
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outlined' | 'filled' | 'underlined';
  
  // 标签和帮助文本
  label?: string;
  helperText?: string;
  errorText?: string;
  
  // 图标配置
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  
  // 移动端特性
  hapticEnabled?: boolean;
  autoCorrect?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  inputMode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
  
  // 验证配置
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    validator?: (value: string) => boolean | Promise<boolean>;
    debounceMs?: number;
  };
  
  // 功能配置
  clearable?: boolean;
  showPasswordToggle?: boolean;
  maxLength?: number;
  
  // 事件回调
  onChange?: (value: string) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  onValidationChange?: (state: ValidationState, isValid: boolean) => void;
  
  // 其他HTML属性
  name?: string;
  id?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

/**
 * 移动端输入框组件
 */
export const MobileInput: React.FC<MobileInputProps> = ({
  value,
  defaultValue,
  placeholder,
  type = 'text',
  disabled = false,
  readOnly = false,
  required = false,
  autoFocus = false,
  className,
  size = 'md',
  variant = 'outlined',
  label,
  helperText,
  errorText,
  startIcon,
  endIcon,
  hapticEnabled = true,
  autoCorrect = false,
  autoCapitalize = 'none',
  inputMode,
  validation,
  clearable = false,
  showPasswordToggle = false,
  maxLength,
  onChange,
  onFocus,
  onBlur,
  onClear,
  onValidationChange,
  name,
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  const { isMobile } = useResponsive();
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 当前值（受控或非受控）
  const currentValue = value !== undefined ? value : internalValue;
  const hasValue = currentValue.length > 0;
  const hasError = !!errorText || validationState === 'invalid';
  
  // 响应式尺寸配置
  const sizeClasses = {
    sm: isMobile ? 'text-sm px-3 py-3 min-h-[44px]' : 'text-sm px-3 py-2 min-h-[36px]',
    md: isMobile ? 'text-base px-4 py-3 min-h-[48px]' : 'text-base px-3 py-2 min-h-[40px]',
    lg: isMobile ? 'text-lg px-4 py-4 min-h-[52px]' : 'text-lg px-4 py-3 min-h-[44px]'
  };
  
  // 变体样式
  const variantClasses = {
    outlined: cn(
      'border-2 rounded-lg bg-white',
      {
        'border-gray-300 focus:border-blue-500': !hasError && !isFocused,
        'border-blue-500': !hasError && isFocused,
        'border-red-500 focus:border-red-500': hasError,
        'border-gray-200 bg-gray-50': disabled
      }
    ),
    filled: cn(
      'border-0 border-b-2 rounded-t-lg bg-gray-100',
      {
        'border-gray-300 focus:border-blue-500': !hasError && !isFocused,
        'border-blue-500': !hasError && isFocused,
        'border-red-500 focus:border-red-500': hasError,
        'bg-gray-200': disabled
      }
    ),
    underlined: cn(
      'border-0 border-b-2 bg-transparent rounded-none',
      {
        'border-gray-300 focus:border-blue-500': !hasError && !isFocused,
        'border-blue-500': !hasError && isFocused,
        'border-red-500 focus:border-red-500': hasError,
        'border-gray-200': disabled
      }
    )
  };
  
  // 执行验证
  const validateValue = useCallback(async (val: string) => {
    if (!validation) return true;
    
    setValidationState('validating');
    
    try {
      let valid = true;
      
      // 长度验证
      if (validation.minLength && val.length < validation.minLength) {
        valid = false;
      }
      if (validation.maxLength && val.length > validation.maxLength) {
        valid = false;
      }
      
      // 正则验证
      if (validation.pattern && !validation.pattern.test(val)) {
        valid = false;
      }
      
      // 自定义验证器
      if (validation.validator) {
        const result = await validation.validator(val);
        valid = valid && result;
      }
      
      const newState = valid ? 'valid' : 'invalid';
      setValidationState(newState);
      onValidationChange?.(newState, valid);
      
      return valid;
    } catch (error) {
      console.error('Validation error:', error);
      setValidationState('invalid');
      onValidationChange?.('invalid', false);
      return false;
    }
  }, [validation, onValidationChange]);
  
  // 防抖验证
  const debouncedValidate = useCallback((val: string) => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
    
    const delay = validation?.debounceMs || 300;
    validationTimeoutRef.current = setTimeout(() => {
      validateValue(val);
    }, delay);
  }, [validateValue, validation?.debounceMs]);
  
  // 处理值变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (value === undefined) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue);
    
    // 触发验证
    if (validation && newValue.length > 0) {
      debouncedValidate(newValue);
    } else if (validation && newValue.length === 0) {
      setValidationState('idle');
      onValidationChange?.('idle', true);
    }
  };
  
  // 处理焦点事件
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    
    if (hapticEnabled && isMobile) {
      hapticFeedback.light();
    }
    
    onFocus?.(e);
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    
    // 失焦时立即验证
    if (validation && currentValue.length > 0) {
      validateValue(currentValue);
    }
    
    onBlur?.(e);
  };
  
  // 清空输入
  const handleClear = () => {
    const newValue = '';
    
    if (value === undefined) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue);
    onClear?.();
    
    if (hapticEnabled && isMobile) {
      hapticFeedback.light();
    }
    
    // 重置验证状态
    setValidationState('idle');
    onValidationChange?.('idle', true);
    
    // 聚焦输入框
    inputRef.current?.focus();
  };
  
  // 切换密码显示
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    
    if (hapticEnabled && isMobile) {
      hapticFeedback.light();
    }
  };
  
  // 清理定时器
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);
  
  // 获取输入类型
  const getInputType = () => {
    if (type === 'password') {
      return showPassword ? 'text' : 'password';
    }
    return type;
  };
  
  // 获取输入模式
  const getInputMode = () => {
    if (inputMode) return inputMode;
    
    switch (type) {
      case 'email': return 'email';
      case 'tel': return 'tel';
      case 'number': return 'numeric';
      case 'search': return 'search';
      case 'url': return 'url';
      default: return 'text';
    }
  };
  
  // 渲染验证图标
  const renderValidationIcon = () => {
    if (validationState === 'validating') {
      return (
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      );
    }
    
    if (validationState === 'valid') {
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    }
    
    if (validationState === 'invalid' || hasError) {
      return <ExclamationCircleIcon className="w-5 h-5 text-red-500" />;
    }
    
    return null;
  };
  
  // 渲染结束图标
  const renderEndIcon = () => {
    const icons = [];
    
    // 验证图标
    const validationIcon = renderValidationIcon();
    if (validationIcon) {
      icons.push(
        <div key="validation" className="flex-shrink-0">
          {validationIcon}
        </div>
      );
    }
    
    // 清空按钮
    if (clearable && hasValue && !disabled && !readOnly) {
      icons.push(
        <TouchableArea
          key="clear"
          onTap={handleClear}
          hapticEnabled={hapticEnabled}
          minTouchTarget={44}
          className="flex-shrink-0"
        >
          <button
            type="button"
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </TouchableArea>
      );
    }
    
    // 密码切换按钮
    if (type === 'password' && showPasswordToggle) {
      icons.push(
        <TouchableArea
          key="password-toggle"
          onTap={togglePasswordVisibility}
          hapticEnabled={hapticEnabled}
          minTouchTarget={44}
          className="flex-shrink-0"
        >
          <button
            type="button"
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </TouchableArea>
      );
    }
    
    // 自定义结束图标
    if (endIcon && icons.length === 0) {
      icons.push(
        <div key="custom" className="flex-shrink-0 text-gray-400">
          {endIcon}
        </div>
      );
    }
    
    return icons.length > 0 ? (
      <div className="flex items-center space-x-2">
        {icons}
      </div>
    ) : null;
  };
  
  const inputId = id || `mobile-input-${Math.random().toString(36).substr(2, 9)}`;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  
  return (
    <div className={cn('w-full', className)}>
      {/* 标签 */}
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'block text-sm font-medium mb-2',
            hasError ? 'text-red-700' : 'text-gray-700',
            disabled && 'text-gray-400'
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* 输入框容器 */}
      <div className="relative">
        <div className={cn(
          'flex items-center',
          'transition-all duration-200',
          'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-20',
          variantClasses[variant],
          sizeClasses[size],
          {
            'cursor-not-allowed': disabled,
            'cursor-default': readOnly
          }
        )}>
          {/* 开始图标 */}
          {startIcon && (
            <div className="flex-shrink-0 mr-3 text-gray-400">
              {startIcon}
            </div>
          )}
          
          {/* 搜索图标（搜索类型默认） */}
          {type === 'search' && !startIcon && (
            <div className="flex-shrink-0 mr-3 text-gray-400">
              <MagnifyingGlassIcon className="w-5 h-5" />
            </div>
          )}
          
          {/* 输入框 */}
          <input
            ref={inputRef}
            id={inputId}
            name={name}
            type={getInputType()}
            value={currentValue}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            autoFocus={autoFocus}
            maxLength={maxLength}
            inputMode={getInputMode()}
            autoCorrect={autoCorrect ? 'on' : 'off'}
            autoCapitalize={autoCapitalize}
            aria-label={ariaLabel}
            aria-describedby={cn(
              ariaDescribedBy,
              helperText && helperId,
              (errorText || hasError) && errorId
            )}
            aria-invalid={hasError}
            className={cn(
              'flex-1 bg-transparent border-0 outline-none',
              'placeholder-gray-400',
              {
                'text-gray-900': !disabled,
                'text-gray-500': disabled,
                'cursor-not-allowed': disabled,
                'cursor-default': readOnly
              }
            )}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          
          {/* 结束图标 */}
          {renderEndIcon()}
        </div>
        
        {/* 字符计数 */}
        {maxLength && (
          <div className="absolute top-2 right-2 text-xs text-gray-400 pointer-events-none">
            {currentValue.length}/{maxLength}
          </div>
        )}
      </div>
      
      {/* 帮助文本和错误信息 */}
      <div className="mt-1 min-h-[20px]">
        {errorText ? (
          <p id={errorId} className="text-sm text-red-600">
            {errorText}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-sm text-gray-500">
            {helperText}
          </p>
        ) : null}
      </div>
    </div>
  );
};

/**
 * 移动端搜索框组件
 */
interface MobileSearchProps extends Omit<MobileInputProps, 'type'> {
  onSearch?: (query: string) => void;
  searchDelay?: number;
}

export const MobileSearch: React.FC<MobileSearchProps> = ({
  onSearch,
  searchDelay = 300,
  ...props
}) => {
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleChange = (value: string) => {
    props.onChange?.(value);
    
    if (onSearch) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        onSearch(value);
      }, searchDelay);
    }
  };
  
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <MobileInput
      {...props}
      type="search"
      onChange={handleChange}
      clearable
    />
  );
};

export default MobileInput;