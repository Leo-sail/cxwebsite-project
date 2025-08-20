/**
 * 课程表单字段配置
 * 定义课程表单的字段、验证规则和渲染配置
 */

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface ValidationRule {
  required?: boolean;
  message?: string;
  maxLength?: number;
  minLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'url';
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
  options?: FormFieldOption[];
  rules?: ValidationRule[];
  disabled?: boolean;
  description?: string;
}

/**
 * 课程分类选项
 */
export const COURSE_CATEGORIES: FormFieldOption[] = [
  { value: 'math', label: '数学' },
  { value: 'english', label: '英语' },
  { value: 'politics', label: '政治' },
  { value: 'science', label: '科学' },
  { value: 'history', label: '历史' },
  { value: 'art', label: '艺术' },
  { value: 'literature', label: '文学' },
  { value: 'philosophy', label: '哲学' },
  { value: 'economics', label: '经济学' },
  { value: 'management', label: '管理学' }
];

/**
 * 课程表单字段配置
 */
export const COURSE_FORM_FIELDS: FormField[] = [
  {
    name: 'name',
    label: '课程名称',
    type: 'text',
    required: true,
    placeholder: '请输入课程名称',
    rules: [
      { required: true, message: '请输入课程名称' },
      { maxLength: 100, message: '课程名称不能超过100个字符' },
      { minLength: 2, message: '课程名称至少需要2个字符' }
    ],
    description: '课程的完整名称，将显示在课程列表中'
  },
  {
    name: 'description',
    label: '课程描述',
    type: 'textarea',
    required: false,
    placeholder: '请输入课程描述信息',
    rules: [
      { maxLength: 500, message: '课程描述不能超过500个字符' }
    ],
    description: '课程的详细描述，包括课程内容、特色等'
  },
  {
    name: 'category',
    label: '课程分类',
    type: 'select',
    required: true,
    options: COURSE_CATEGORIES,
    rules: [
      { required: true, message: '请选择课程分类' }
    ],
    description: '选择课程所属的学科分类'
  },
  {
    name: 'image_url',
    label: '课程图片URL',
    type: 'url',
    required: false,
    placeholder: 'https://yoursite.com/course-image.jpg',
    rules: [
      { pattern: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i, message: '请输入有效的图片URL（支持jpg、png、gif、webp格式）' }
    ],
    description: '课程封面图片的URL地址'
  },
  {
    name: 'sort_order',
    label: '排序权重',
    type: 'number',
    required: false,
    defaultValue: 0,
    placeholder: '0',
    rules: [
      { min: 0, message: '排序值不能小于0' },
      { max: 9999, message: '排序值不能大于9999' }
    ],
    description: '数值越大排序越靠前，默认为0'
  },
  {
    name: 'is_active',
    label: '启用状态',
    type: 'checkbox',
    defaultValue: true,
    description: '是否在前台显示该课程'
  }
];

/**
 * 表单验证函数
 */
export const validateCourseForm = (values: Record<string, any>): Record<string, string> => {
  const errors: Record<string, string> = {};

  // 遍历所有字段进行验证
  COURSE_FORM_FIELDS.forEach(field => {
    const value = values[field.name];
    
    // 检查必填字段
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors[field.name] = field.rules?.find(rule => rule.required)?.message || `${field.label}是必填项`;
      return;
    }

    // 如果有值，进行其他验证
    if (value && field.rules) {
      for (const rule of field.rules) {
        if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
          errors[field.name] = rule.message || `${field.label}长度不能超过${rule.maxLength}个字符`;
          break;
        }
        
        if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
          errors[field.name] = rule.message || `${field.label}长度不能少于${rule.minLength}个字符`;
          break;
        }
        
        if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
          errors[field.name] = rule.message || `${field.label}不能小于${rule.min}`;
          break;
        }
        
        if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
          errors[field.name] = rule.message || `${field.label}不能大于${rule.max}`;
          break;
        }
        
        if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
          errors[field.name] = rule.message || `${field.label}格式不正确`;
          break;
        }
      }
    }
  });

  return errors;
};

/**
 * 获取字段的默认值
 */
export const getCourseFormDefaultValues = (): Record<string, any> => {
  const defaultValues: Record<string, any> = {};
  
  COURSE_FORM_FIELDS.forEach(field => {
    if (field.defaultValue !== undefined) {
      defaultValues[field.name] = field.defaultValue;
    } else {
      switch (field.type) {
        case 'text':
        case 'textarea':
        case 'url':
          defaultValues[field.name] = '';
          break;
        case 'number':
          defaultValues[field.name] = 0;
          break;
        case 'checkbox':
          defaultValues[field.name] = false;
          break;
        case 'select':
          defaultValues[field.name] = '';
          break;
        default:
          defaultValues[field.name] = '';
      }
    }
  });
  
  return defaultValues;
};

/**
 * 格式化表单数据用于提交
 */
import type { CourseFormData } from '../../types/api';

export const formatCourseFormData = (values: Record<string, any>): CourseFormData => {
  const formatted: CourseFormData = {
    name: values.name || '',
    description: values.description || undefined,
    image_url: values.image_url || undefined,
    category: values.category || '',
    sort_order: Number(values.sort_order) || 0,
    is_active: Boolean(values.is_active)
  };
  
  // 清理空字符串字段
  if (formatted.description && formatted.description.trim() === '') {
    formatted.description = undefined;
  }
  if (formatted.image_url && formatted.image_url.trim() === '') {
    formatted.image_url = undefined;
  }
  
  return formatted;
};