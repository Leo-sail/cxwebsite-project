import React, { useState, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
// import { useTheme } from '../../hooks/useTheme';
import { ThemedInput } from './ThemedInput';
import { ThemedButton } from './ThemedButton';
import { ThemedDropdown } from './ThemedDropdown';

// 导入类型和工具函数
import type {
  FormField,
  FormLayout,
  FormSubmitData
} from '../../utils/formUtils';

/**
 * 表单属性接口
 */
export interface ThemedFormProps {
  fields: FormField[];
  initialValues?: Record<string, unknown>;
  layout?: FormLayout;
  variant?: 'default' | 'filled' | 'outlined' | 'card';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  showSubmitButton?: boolean;
  showResetButton?: boolean;
  submitText?: string;
  resetText?: string;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  onSubmit?: (data: FormSubmitData) => void | Promise<void>;
  onReset?: () => void;
  onChange?: (name: string, value: unknown, formData: Record<string, unknown>) => void;
  onValidate?: (errors: Record<string, string>) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 表单引用接口
 */
export interface FormRef {
  submit: () => void;
  reset: () => void;
  validate: () => boolean;
  getValues: () => Record<string, unknown>;
  setValues: (values: Record<string, unknown>) => void;
  setFieldValue: (name: string, value: unknown) => void;
  getFieldValue: (name: string) => unknown;
  setFieldError: (name: string, error: string) => void;
  clearErrors: () => void;
}

/**
 * 主题化表单组件
 */
export const ThemedForm = forwardRef<FormRef, ThemedFormProps>((
  {
    fields,
    initialValues = {},
    layout = { type: 'vertical', columns: 1 },
    variant = 'default',
    size = 'md',
    loading = false,
    disabled = false,
    showSubmitButton = true,
    showResetButton = false,
    submitText = '提交',
    resetText = '重置',
    validateOnChange = true,
    validateOnBlur = true,
    onSubmit,
    onReset,
    onChange,
    onValidate,
    className = '',
    style,
    ...props
  },
  ref
) => {
  // const { currentTheme } = useTheme();
  const [formData, setFormData] = useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  /**
   * 验证单个字段
   */
  const validateField = useCallback((field: FormField, value: unknown): string | null => {
    if (!field.rules) return null;

    for (const rule of field.rules) {
      // 必填验证
      if (rule.required && (value === undefined || value === null || value === '')) {
        return rule.message || `${field.label}是必填项`;
      }

      // 如果值为空且不是必填，跳过其他验证
      if (value === undefined || value === null || value === '') {
        continue;
      }

      // 最小值验证
      if (rule.min !== undefined && Number(value) < rule.min) {
        return rule.message || `${field.label}不能小于${rule.min}`;
      }

      // 最大值验证
      if (rule.max !== undefined && Number(value) > rule.max) {
        return rule.message || `${field.label}不能大于${rule.max}`;
      }

      // 最小长度验证
      if (rule.minLength !== undefined && String(value).length < rule.minLength) {
        return rule.message || `${field.label}长度不能少于${rule.minLength}个字符`;
      }

      // 最大长度验证
      if (rule.maxLength !== undefined && String(value).length > rule.maxLength) {
        return rule.message || `${field.label}长度不能超过${rule.maxLength}个字符`;
      }

      // 正则验证
      if (rule.pattern && !rule.pattern.test(String(value))) {
        return rule.message || `${field.label}格式不正确`;
      }

      // 自定义验证
      if (rule.validator) {
        const result = rule.validator(value, formData);
        if (result) return result;
      }
    }

    return null;
  }, [formData]);

  /**
   * 验证所有字段
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      if (field.hidden || (field.when && !field.when(formData))) return;
      
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    onValidate?.(newErrors);
    
    return Object.keys(newErrors).length === 0;
  }, [fields, formData, validateField, onValidate]);

  /**
   * 处理字段值变化
   */
  const handleFieldChange = useCallback((name: string, value: unknown) => {
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    // 标记字段为已触摸
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // 实时验证
    if (validateOnChange) {
      const field = fields.find(f => f.name === name);
      if (field) {
        const error = validateField(field, value);
        setErrors(prev => ({
          ...prev,
          [name]: error || ''
        }));
      }
    }
    
    onChange?.(name, value, newFormData);
  }, [formData, fields, validateField, validateOnChange, onChange]);

  /**
   * 处理字段失焦
   */
  const handleFieldBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (validateOnBlur) {
      const field = fields.find(f => f.name === name);
      if (field) {
        const error = validateField(field, formData[name]);
        setErrors(prev => ({
          ...prev,
          [name]: error || ''
        }));
      }
    }
  }, [fields, formData, validateField, validateOnBlur]);

  /**
   * 处理表单提交
   */
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (isSubmitting || loading || disabled) return;
    
    const isValid = validateForm();
    const submitData: FormSubmitData = {
      values: formData,
      errors,
      isValid
    };
    
    if (isValid && onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(submitData);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [formData, errors, isSubmitting, loading, disabled, validateForm, onSubmit]);

  /**
   * 处理表单重置
   */
  const handleReset = useCallback(() => {
    setFormData(initialValues);
    setErrors({});
    setTouched({});
    onReset?.();
  }, [initialValues, onReset]);

  /**
   * 暴露给父组件的方法
   */
  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
    reset: handleReset,
    validate: validateForm,
    getValues: () => formData,
    setValues: (values: Record<string, unknown>) => setFormData({ ...formData, ...values }),
    setFieldValue: (name: string, value: unknown) => handleFieldChange(name, value),
    getFieldValue: (name: string) => formData[name],
    setFieldError: (name: string, error: string) => setErrors(prev => ({ ...prev, [name]: error })),
    clearErrors: () => setErrors({})
  }), [formData, handleSubmit, handleReset, validateForm, handleFieldChange]);

  /**
   * 渲染表单字段
   */
  const renderField = (field: FormField) => {
    if (field.hidden || (field.when && !field.when(formData))) {
      return null;
    }

    const value = formData[field.name] ?? field.defaultValue;
    const error = touched[field.name] ? errors[field.name] : undefined;
    const fieldDisabled = disabled || field.disabled;

    // 自定义渲染
    if (field.render) {
      return field.render(field, value, (newValue) => handleFieldChange(field.name, newValue), error);
    }

    const commonProps = {
      label: field.label,
      value: (value as string | number) || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
        handleFieldChange(field.name, newValue);
      },
      onBlur: () => handleFieldBlur(field.name),
      disabled: fieldDisabled,
      size,
      error,
      ...field.props
    };

    switch (field.type) {
      case 'text':
      case 'password':
      case 'email':
      case 'number':
      case 'tel':
      case 'url':
      case 'date':
      case 'datetime-local':
      case 'time':
        return (
          <ThemedInput
            {...commonProps}
            type={field.type}
            placeholder={field.placeholder}
            variant={variant === 'card' ? 'outline' : 'default'}
          />
        );

      case 'textarea':
        return (
          <div className="form-field">
            <label className="form-label">{field.label}</label>
            <textarea
              value={(value as string) || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldChange(field.name, e.target.value)}
              onBlur={() => handleFieldBlur(field.name)}
              disabled={fieldDisabled}
              placeholder={field.placeholder}
              className={`form-textarea ${error ? 'form-textarea--error' : ''}`}
              rows={4}
              {...field.props}
            />
            {error && <div className="form-error">{error}</div>}
          </div>
        );

      case 'select':
        return (
          <ThemedDropdown
            label={field.label}
            value={(value as string | number) || ''}
            onChange={(newValue: string | number | (string | number)[]) => handleFieldChange(field.name, newValue)}
            disabled={fieldDisabled}
            size={size}
            error={error}
            options={(field.options || []).map(opt => ({
              ...opt,
              value: opt.value as string | number
            }))}
            placeholder={field.placeholder}
            variant={variant === 'card' ? 'outline' : 'default'}
          />
        );

      case 'multiselect':
        return (
          <ThemedDropdown
            label={field.label}
            value={(value as string | number | (string | number)[]) || []}
            onChange={(newValue: string | number | (string | number)[]) => handleFieldChange(field.name, newValue)}
            disabled={fieldDisabled}
            size={size}
            error={error}
            options={(field.options || []).map(opt => ({
              ...opt,
              value: opt.value as string | number
            }))}
            multiple
            placeholder={field.placeholder}
            variant={variant === 'card' ? 'outline' : 'default'}
          />
        );

      case 'checkbox':
        return (
          <div className="form-field form-field--checkbox">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                onBlur={() => handleFieldBlur(field.name)}
                disabled={fieldDisabled}
                className="form-checkbox"
                {...field.props}
              />
              <span className="form-checkbox-text">{field.label}</span>
            </label>
            {error && <div className="form-error">{error}</div>}
          </div>
        );

      case 'radio':
        return (
          <div className="form-field form-field--radio">
            <label className="form-label">{field.label}</label>
            <div className="form-radio-group">
              {field.options?.map((option) => (
                <label key={String(option.value)} className="form-radio-label">
                  <input
                    type="radio"
                    name={field.name}
                    value={String(option.value)}
                    checked={value === option.value}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    onBlur={() => handleFieldBlur(field.name)}
                    disabled={fieldDisabled || option.disabled}
                    className="form-radio"
                    {...field.props}
                  />
                  <span className="form-radio-text">{option.label}</span>
                </label>
              ))}
            </div>
            {error && <div className="form-error">{error}</div>}
          </div>
        );

      case 'file':
        return (
          <div className="form-field">
            <label className="form-label">{field.label}</label>
            <input
              type="file"
              onChange={(e) => handleFieldChange(field.name, e.target.files?.[0])}
              onBlur={() => handleFieldBlur(field.name)}
              disabled={fieldDisabled}
              className={`form-file ${error ? 'form-file--error' : ''}`}
              {...field.props}
            />
            {error && <div className="form-error">{error}</div>}
          </div>
        );

      default:
        return null;
    }
  };

  /**
   * 获取表单样式类名
   */
  const getFormClasses = () => {
    const baseClasses = [
      'themed-form',
      `themed-form--${variant}`,
      `themed-form--${size}`,
      `themed-form--${layout.type || 'vertical'}`
    ];

    if (loading || isSubmitting) baseClasses.push('themed-form--loading');
    if (disabled) baseClasses.push('themed-form--disabled');
    
    return baseClasses.join(' ');
  };

  /**
   * 获取表单样式
   */
  const getFormStyles = () => {
    return {
      ...style,
      '--form-columns': layout.columns || 1,
      '--form-gutter': `${layout.gutter || 16}px`,
      '--form-label-width': layout.labelWidth || 'auto',
      '--form-border-color': `var(--color-border-default)`,
      '--form-bg-color': `var(--color-bg-default)`,
      '--form-text-color': `var(--color-text-default)`,
    } as React.CSSProperties;
  };

  /**
   * 获取字段容器样式
   */
  const getFieldContainerStyle = (field: FormField) => {
    const span = field.span || 1;
    const columns = layout.columns || 1;
    const width = (span / columns) * 100;
    
    return {
      width: `${width}%`,
      minWidth: 0
    };
  };

  return (
    <form
      ref={formRef}
      className={`${getFormClasses()} ${className}`}
      style={getFormStyles()}
      onSubmit={handleSubmit}
      {...props}
    >
      {/* 表单字段 */}
      <div className="themed-form__fields">
        {fields.map((field) => (
          <div
            key={field.name}
            className="themed-form__field-container"
            style={getFieldContainerStyle(field)}
          >
            {renderField(field)}
          </div>
        ))}
      </div>

      {/* 表单按钮 */}
      {(showSubmitButton || showResetButton) && (
        <div className="themed-form__actions">
          {showResetButton && (
            <ThemedButton
              type="button"
              variant="outline"
              size={size}
              onClick={handleReset}
              disabled={disabled || isSubmitting}
            >
              {resetText}
            </ThemedButton>
          )}
          
          {showSubmitButton && (
            <ThemedButton
              type="submit"
              variant="primary"
              size={size}
              loading={isSubmitting || loading}
              disabled={disabled}
            >
              {submitText}
            </ThemedButton>
          )}
        </div>
      )}
    </form>
  );
});

ThemedForm.displayName = 'ThemedForm';





export default ThemedForm;