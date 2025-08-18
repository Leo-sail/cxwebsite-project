/**
 * 信息管理系统基础UI组件
 * 提供通用的UI组件，包括按钮、输入框、模态框等
 */

import React, { forwardRef } from 'react';
import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';
import { X, Loader2, Search, Plus, Edit, Trash2, Eye, RefreshCw } from 'lucide-react';
import { cn } from '../../utils';

// ============================================================================
// 基础按钮组件
// ============================================================================

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

/**
 * 基础按钮组件
 * 支持多种样式变体和加载状态
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>((
  { 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    icon, 
    children, 
    disabled,
    ...props 
  },
  ref
) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
  };
  
  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8'
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

// ============================================================================
// 输入框组件
// ============================================================================

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/**
 * 基础输入框组件
 * 支持标签、错误提示、帮助文本和图标
 */
export const Input = forwardRef<HTMLInputElement, InputProps>((
  { 
    className, 
    type = 'text', 
    label, 
    error, 
    helperText, 
    leftIcon, 
    rightIcon,
    id,
    ...props 
  },
  ref
) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={inputId}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        
        <input
          type={type}
          id={inputId}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          ref={ref}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// ============================================================================
// 文本域组件
// ============================================================================

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * 文本域组件
 * 支持标签、错误提示和帮助文本
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>((
  { className, label, error, helperText, id, ...props },
  ref
) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={textareaId}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      )}
      
      <textarea
        id={textareaId}
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        ref={ref}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

// ============================================================================
// 选择框组件
// ============================================================================

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

/**
 * 选择框组件
 * 支持标签、错误提示、帮助文本和选项配置
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>((
  { className, label, error, helperText, options, placeholder, id, ...props },
  ref
) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={selectId}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      )}
      
      <select
        id={selectId}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        ref={ref}
        {...props}
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
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

// ============================================================================
// 模态框组件
// ============================================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

/**
 * 模态框组件
 * 支持多种尺寸和自定义内容
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* 模态框内容 */}
      <div className={cn(
        'relative bg-background rounded-lg shadow-lg w-full mx-4',
        sizeClasses[size]
      )}>
        {/* 头部 */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b">
            {title && (
              <h2 className="text-lg font-semibold">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-accent rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        
        {/* 内容 */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 加载指示器组件
// ============================================================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * 加载指示器组件
 * 显示旋转的加载动画
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 className={cn(
      'animate-spin',
      sizeClasses[size],
      className
    )} />
  );
};

// ============================================================================
// 空状态组件
// ============================================================================

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

/**
 * 空状态组件
 * 显示无数据时的占位内容
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      
      {description && (
        <p className="text-muted-foreground mb-4 max-w-sm">
          {description}
        </p>
      )}
      
      {action && action}
    </div>
  );
};

// ============================================================================
// 确认对话框组件
// ============================================================================

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

/**
 * 确认对话框组件
 * 用于确认危险操作
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'danger',
  loading = false
}) => {
  const variantStyles = {
    danger: 'text-destructive',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className={cn('text-lg font-semibold', variantStyles[variant])}>
            {title}
          </h3>
          <p className="text-muted-foreground">
            {description}
          </p>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ============================================================================
// 搜索框组件
// ============================================================================

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
}

/**
 * 搜索框组件
 * 带有搜索图标和清除功能
 */
export const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChange,
  placeholder = '搜索...',
  onClear,
  className
}) => {
  return (
    <div className={cn('relative', className)}>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        leftIcon={<Search className="h-4 w-4" />}
        rightIcon={
          value && onClear ? (
            <button
              onClick={onClear}
              className="hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null
        }
      />
    </div>
  );
};

// ============================================================================
// 操作按钮组
// ============================================================================

interface ActionButtonsProps {
  onAdd?: () => void;
  onRefresh?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPreview?: () => void;
  addText?: string;
  editText?: string;
  deleteText?: string;
  previewText?: string;
  refreshText?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * 操作按钮组组件
 * 提供常用的操作按钮
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onAdd,
  onRefresh,
  onEdit,
  onDelete,
  onPreview,
  addText = '新增',
  editText = '编辑',
  deleteText = '删除',
  previewText = '预览',
  refreshText = '刷新',
  loading = false,
  disabled = false,
  className
}) => {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {onAdd && (
        <Button
          onClick={onAdd}
          disabled={disabled || loading}
          icon={<Plus className="h-4 w-4" />}
        >
          {addText}
        </Button>
      )}
      
      {onEdit && (
        <Button
          variant="outline"
          onClick={onEdit}
          disabled={disabled || loading}
          icon={<Edit className="h-4 w-4" />}
        >
          {editText}
        </Button>
      )}
      
      {onPreview && (
        <Button
          variant="outline"
          onClick={onPreview}
          disabled={disabled || loading}
          icon={<Eye className="h-4 w-4" />}
        >
          {previewText}
        </Button>
      )}
      
      {onDelete && (
        <Button
          variant="danger"
          onClick={onDelete}
          disabled={disabled || loading}
          icon={<Trash2 className="h-4 w-4" />}
        >
          {deleteText}
        </Button>
      )}
      
      {onRefresh && (
        <Button
          variant="ghost"
          onClick={onRefresh}
          disabled={disabled}
          loading={loading}
          icon={<RefreshCw className="h-4 w-4" />}
        >
          {refreshText}
        </Button>
      )}
    </div>
  );
};

// ============================================================================
// 导出所有组件
// ============================================================================

export default {
  Button,
  Input,
  Textarea,
  Select,
  Modal,
  LoadingSpinner,
  EmptyState,
  ConfirmDialog,
  SearchBox,
  ActionButtons
};