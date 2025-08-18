import { useState, useCallback } from 'react';

/**
 * 表单字段类型
 */
export type FormFieldType = 
  | 'text' 
  | 'password' 
  | 'email' 
  | 'number' 
  | 'tel' 
  | 'url' 
  | 'textarea' 
  | 'select' 
  | 'multiselect' 
  | 'checkbox' 
  | 'radio' 
  | 'date' 
  | 'datetime-local' 
  | 'time' 
  | 'file' 
  | 'custom'
  | 'search'
  | 'range'
  | 'color'
  | 'month'
  | 'week'
  | 'hidden';

/**
 * 表单验证规则
 */
export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validator?: (value: unknown, formData: Record<string, unknown>) => string | null;
  message?: string;
}

/**
 * 表单字段配置
 */
export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  defaultValue?: unknown;
  options?: Array<{ label: string; value: unknown; disabled?: boolean }>;
  rules?: ValidationRule[];
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  span?: number; // 栅格跨度 (1-12)
  render?: (field: FormField, value: unknown, onChange: (value: unknown) => void, error?: string) => React.ReactNode;
  dependencies?: string[]; // 依赖的字段名
  when?: (formData: Record<string, unknown>) => boolean; // 显示条件
  props?: Record<string, unknown>; // 额外的组件属性
}

/**
 * 表单布局配置
 */
export interface FormLayout {
  type?: 'horizontal' | 'vertical' | 'inline';
  columns?: number; // 列数 (1-4)
  labelWidth?: string;
  gutter?: number; // 间距
  colon?: boolean; // 是否显示冒号
}

/**
 * 表单提交数据
 */
export interface FormSubmitData {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  isValid: boolean;
}

/**
 * 表单构建器Hook
 */
export const useFormBuilder = (initialFields: FormField[] = []) => {
  const [fields, setFields] = useState<FormField[]>(initialFields);

  const addField = useCallback((field: FormField) => {
    setFields(prev => [...prev, field]);
  }, []);

  const removeField = useCallback((name: string) => {
    setFields(prev => prev.filter(field => field.name !== name));
  }, []);

  const updateField = useCallback((name: string, updates: Partial<FormField>) => {
    setFields(prev => prev.map(field => 
      field.name === name ? { ...field, ...updates } : field
    ));
  }, []);

  const moveField = useCallback((fromIndex: number, toIndex: number) => {
    setFields(prev => {
      const newFields = [...prev];
      const [movedField] = newFields.splice(fromIndex, 1);
      newFields.splice(toIndex, 0, movedField);
      return newFields;
    });
  }, []);

  const resetFields = useCallback(() => {
    setFields(initialFields);
  }, [initialFields]);

  return {
    fields,
    addField,
    removeField,
    updateField,
    moveField,
    resetFields
  };
};

/**
 * 默认表单样式配置
 */
export const DEFAULT_FORM_STYLES = {
  variants: {
    default: {
      form: 'space-y-4',
      field: 'space-y-2',
      actions: 'flex gap-3 pt-4'
    },
    filled: {
      form: 'space-y-4 p-6 bg-gray-50 rounded-lg',
      field: 'space-y-2',
      actions: 'flex gap-3 pt-4'
    },
    outlined: {
      form: 'space-y-4 p-6 border border-gray-200 rounded-lg',
      field: 'space-y-2',
      actions: 'flex gap-3 pt-4'
    },
    card: {
      form: 'space-y-6 p-8 bg-white border border-gray-200 rounded-xl shadow-sm',
      field: 'space-y-3',
      actions: 'flex gap-4 pt-6 border-t border-gray-100'
    }
  },
  layouts: {
    vertical: {
      form: 'space-y-4',
      field: 'w-full'
    },
    horizontal: {
      form: 'space-y-4',
      field: 'flex items-center gap-4'
    },
    inline: {
      form: 'flex flex-wrap gap-4',
      field: 'flex-1 min-w-0'
    }
  },
  sizes: {
    xs: { field: 'text-xs', spacing: 'space-y-2' },
    sm: { field: 'text-sm', spacing: 'space-y-3' },
    md: { field: 'text-base', spacing: 'space-y-4' },
    lg: { field: 'text-lg', spacing: 'space-y-5' },
    xl: { field: 'text-xl', spacing: 'space-y-6' }
  }
};

/**
 * 默认导出
 */
export default {
  useFormBuilder,
  DEFAULT_FORM_STYLES
};