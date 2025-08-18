/**
 * 信息管理系统编辑弹窗组件
 * 提供内容数据的创建和编辑功能
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import type {
  ContentTableType
} from '../../types/contentSettings';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  tableType: ContentTableType;
  initialData?: Record<string, unknown>;
  loading?: boolean;
  title?: string;
}

type FormErrors = Record<string, string>;
import {
  Modal,
  Button,
  Input,
  Textarea,
  Select
} from './BaseComponents';


// ============================================================================
// 表单字段配置
// ============================================================================

/**
 * 根据表类型获取表单字段配置
 */
const getFormFields = (tableType: ContentTableType): FormField[] => {
  const commonFields = [
    { key: 'id', label: 'ID', type: 'text', disabled: true, hidden: true },
    { key: 'created_at', label: '创建时间', type: 'datetime', disabled: true, hidden: true },
    { key: 'updated_at', label: '更新时间', type: 'datetime', disabled: true, hidden: true }
  ];

  switch (tableType) {
    case 'site_content':
      return [
        ...commonFields,
        { key: 'content_key', label: '内容键名', type: 'text', required: true, placeholder: '如: hero_title' },
        { key: 'content_value', label: '内容值', type: 'textarea', required: true, placeholder: '内容的具体值' },
        { key: 'content_type', label: '内容类型', type: 'select', required: true, options: [
          { value: 'text', label: '文本' },
          { value: 'html', label: 'HTML' },
          { value: 'markdown', label: 'Markdown' },
          { value: 'json', label: 'JSON' },
          { value: 'url', label: 'URL' },
          { value: 'image', label: '图片' }
        ]},
        { key: 'page_section', label: '页面区域', type: 'text', placeholder: '如: hero, about, contact' },
        { key: 'description', label: '描述', type: 'textarea', placeholder: '内容的用途说明' },
        { key: 'is_active', label: '是否启用', type: 'select', options: [
          { value: 'true', label: '启用' },
          { value: 'false', label: '禁用' }
        ]},
        { key: 'sort_order', label: '排序', type: 'number', placeholder: '数字越小越靠前' }
      ];

    case 'navigation_items':
      return [
        ...commonFields,
        { key: 'title', label: '导航标题', type: 'text', required: true, placeholder: '导航菜单显示的文字' },
        { key: 'url', label: '链接地址', type: 'text', required: true, placeholder: '如: /about, https://example.com' },
        { key: 'icon', label: '图标', type: 'text', placeholder: '图标名称或URL' },
        { key: 'parent_id', label: '父级ID', type: 'number', placeholder: '上级菜单的ID，顶级菜单留空' },
        { key: 'sort_order', label: '排序', type: 'number', placeholder: '数字越小越靠前' },
        { key: 'is_active', label: '是否启用', type: 'select', options: [
          { value: 'true', label: '启用' },
          { value: 'false', label: '禁用' }
        ]},
        { key: 'target', label: '打开方式', type: 'select', options: [
          { value: '_self', label: '当前窗口' },
          { value: '_blank', label: '新窗口' }
        ]},
        { key: 'description', label: '描述', type: 'textarea', placeholder: '导航项的说明' }
      ];

    case 'ui_text_elements':
      return [
        ...commonFields,
        { key: 'element_key', label: '元素键名', type: 'text', required: true, placeholder: '如: button_submit' },
        { key: 'element_text', label: '显示文本', type: 'text', required: true, placeholder: '用户看到的文字' },
        { key: 'element_type', label: '元素类型', type: 'select', required: true, options: [
          { value: 'button', label: '按钮' },
          { value: 'label', label: '标签' },
          { value: 'placeholder', label: '占位符' },
          { value: 'tooltip', label: '提示' },
          { value: 'message', label: '消息' },
          { value: 'title', label: '标题' }
        ]},
        { key: 'page_location', label: '页面位置', type: 'text', placeholder: '如: header, footer, form' },
        { key: 'context', label: '上下文', type: 'textarea', placeholder: '使用场景或上下文说明' },
        { key: 'is_active', label: '是否启用', type: 'select', options: [
          { value: 'true', label: '启用' },
          { value: 'false', label: '禁用' }
        ]}
      ];

    case 'page_sections':
      return [
        ...commonFields,
        { key: 'section_name', label: '区域名称', type: 'text', required: true, placeholder: '如: hero, features, testimonials' },
        { key: 'section_title', label: '区域标题', type: 'text', placeholder: '显示给用户的标题' },
        { key: 'section_content', label: '区域内容', type: 'textarea', placeholder: '区域的主要内容' },
        { key: 'section_type', label: '区域类型', type: 'select', required: true, options: [
          { value: 'hero', label: '首屏区域' },
          { value: 'content', label: '内容区域' },
          { value: 'sidebar', label: '侧边栏' },
          { value: 'footer', label: '页脚' },
          { value: 'header', label: '页头' },
          { value: 'navigation', label: '导航' }
        ]},
        { key: 'page_name', label: '所属页面', type: 'text', placeholder: '如: home, about, contact' },
        { key: 'sort_order', label: '排序', type: 'number', placeholder: '数字越小越靠前' },
        { key: 'is_visible', label: '是否显示', type: 'select', options: [
          { value: 'true', label: '显示' },
          { value: 'false', label: '隐藏' }
        ]},
        { key: 'css_classes', label: 'CSS类名', type: 'text', placeholder: '自定义样式类名' },
        { key: 'custom_attributes', label: '自定义属性', type: 'textarea', placeholder: 'JSON格式的自定义属性' }
      ];

    case 'seo_metadata':
      return [
        ...commonFields,
        { key: 'page_path', label: '页面路径', type: 'text', required: true, placeholder: '如: /, /about, /contact' },
        { key: 'meta_title', label: 'SEO标题', type: 'text', placeholder: '页面的SEO标题' },
        { key: 'meta_description', label: 'SEO描述', type: 'textarea', placeholder: '页面的SEO描述，建议150-160字符' },
        { key: 'meta_keywords', label: 'SEO关键词', type: 'text', placeholder: '用逗号分隔的关键词' },
        { key: 'og_title', label: 'OG标题', type: 'text', placeholder: '社交媒体分享标题' },
        { key: 'og_description', label: 'OG描述', type: 'textarea', placeholder: '社交媒体分享描述' },
        { key: 'og_image', label: 'OG图片', type: 'text', placeholder: '社交媒体分享图片URL' },
        { key: 'canonical_url', label: '规范URL', type: 'text', placeholder: '页面的规范URL' },
        { key: 'robots', label: 'Robots指令', type: 'select', options: [
          { value: 'index,follow', label: '索引并跟踪' },
          { value: 'noindex,nofollow', label: '不索引不跟踪' },
          { value: 'index,nofollow', label: '索引但不跟踪' },
          { value: 'noindex,follow', label: '不索引但跟踪' }
        ]}
      ];

    default:
      return commonFields;
  }
};

// ============================================================================
// 表单验证
// ============================================================================

/**
 * 验证表单数据
 */
const validateFormData = (data: Record<string, unknown>, tableType: ContentTableType): FormErrors => {
  const errors: FormErrors = {};
  const fields = getFormFields(tableType);

  fields.forEach(field => {
    if (field.required && (!data[field.key] || String(data[field.key]).trim() === '')) {
      errors[field.key] = `${field.label}是必填项`;
    }

    // 特定字段验证
    if (field.key === 'url' && data[field.key]) {
      const urlValue = String(data[field.key]);
      if (!urlValue.startsWith('/') && !urlValue.startsWith('http')) {
        errors[field.key] = 'URL必须以/或http开头';
      }
    }

    if (field.key === 'meta_description' && data[field.key]) {
      const desc = String(data[field.key]);
      if (desc.length > 160) {
        errors[field.key] = 'SEO描述建议不超过160个字符';
      }
    }

    if (field.type === 'number' && data[field.key] && isNaN(Number(data[field.key]))) {
      errors[field.key] = `${field.label}必须是数字`;
    }

    if (field.key === 'custom_attributes' && data[field.key]) {
      try {
        JSON.parse(String(data[field.key]));
      } catch {
        errors[field.key] = '自定义属性必须是有效的JSON格式';
      }
    }
  });

  return errors;
};

// ============================================================================
// 表单字段组件
// ============================================================================

interface FormField {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  hidden?: boolean;
  options?: Array<{ value: string; label: string }>;
}

interface FormFieldProps {
  field: FormField;
  value: unknown;
  onChange: (key: string, value: unknown) => void;
  error?: string;
}

/**
 * 表单字段组件
 * 根据字段类型渲染不同的输入控件
 */
const FormField: React.FC<FormFieldProps> = ({ field, value, onChange, error }) => {
  const displayValue = useMemo(() => {
    if (field.type === 'select' && (field.key === 'is_active' || field.key === 'is_visible')) {
      return value?.toString() || 'false';
    }
    return (value as string) || '';
  }, [value, field]);

  const handleChange = (newValue: unknown) => {
    // 处理布尔值
    if (field.type === 'select' && (field.key === 'is_active' || field.key === 'is_visible')) {
      onChange(field.key, newValue === 'true');
    } else if (field.type === 'number') {
      onChange(field.key, newValue ? Number(newValue) : null);
    } else {
      onChange(field.key, newValue);
    }
  };

  const fieldError = error;

  if (field.hidden) return null;

  switch (field.type) {
    case 'textarea':
      return (
        <Textarea
          label={field.label}
          value={displayValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder || ''}
          disabled={field.disabled || false}
          error={fieldError}
          rows={4}
        />
      );

    case 'select':
      return (
        <Select
          label={field.label}
          value={displayValue}
          onChange={(e) => handleChange(e.target.value)}
          options={field.options || []}
          placeholder={field.placeholder || ''}
          disabled={field.disabled || false}
          error={fieldError}
        />
      );

    case 'number':
      return (
        <Input
          type="number"
          label={field.label}
          value={displayValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder || ''}
          disabled={field.disabled || false}
          error={fieldError}
        />
      );

    case 'datetime':
      return (
        <Input
          type="datetime-local"
          label={field.label}
          value={displayValue}
          onChange={(e) => handleChange(e.target.value)}
          disabled={field.disabled || false}
          error={fieldError}
        />
      );

    default:
      return (
        <Input
          type="text"
          label={field.label}
          value={displayValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder || ''}
          disabled={field.disabled || false}
          error={fieldError}
        />
      );
  }
};

// ============================================================================
// 主编辑弹窗组件
// ============================================================================

/**
 * 编辑弹窗组件
 * 提供内容数据的创建和编辑功能
 */
export const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  tableType,
  initialData,
  loading = false,
  title
}) => {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasChanges, setHasChanges] = useState(false);

  const fields = useMemo(() => getFormFields(tableType), [tableType]);
  const isEditing = Boolean(initialData?.id);
  const modalTitle = title || (isEditing ? '编辑内容' : '新增内容');

  /**
   * 初始化表单数据
   */
  useEffect(() => {
    if (isOpen) {
      const defaultData: Record<string, unknown> = {};
      
      // 设置默认值
      fields.forEach(field => {
        if (field.key === 'is_active' || field.key === 'is_visible') {
          defaultData[field.key] = true;
        } else if (field.key === 'sort_order') {
          defaultData[field.key] = 0;
        } else if (field.key === 'target') {
          defaultData[field.key] = '_self';
        } else if (field.key === 'robots') {
          defaultData[field.key] = 'index,follow';
        }
      });

      setFormData({ ...defaultData, ...initialData });
      setErrors({});
      setHasChanges(false);
    }
  }, [isOpen, initialData, fields]);

  /**
   * 处理字段值变化
   */
  const handleFieldChange = (key: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
    
    // 清除该字段的错误
    if (errors[key]) {
      setErrors((prev: FormErrors) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  /**
   * 处理保存
   */
  const handleSave = async () => {
    const validationErrors = validateFormData(formData, tableType);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  /**
   * 处理关闭
   */
  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('有未保存的更改，确定要关闭吗？')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const hasValidationErrors = Object.keys(errors).length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      size="lg"
    >
      <div className="space-y-6">
        {/* 表单字段 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.filter((field: FormField) => !field.hidden).map((field: FormField) => (
            <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
              <FormField
                field={field}
                value={formData[field.key]}
                onChange={handleFieldChange}
                error={errors[field.key]}
              />
            </div>
          ))}
        </div>

        {/* 错误提示 */}
        {hasValidationErrors && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">请修正以下错误：</span>
            </div>
            <ul className="mt-2 text-sm text-destructive space-y-1">
              {Object.entries(errors).map(([key, error]) => (
                <li key={key}>• {String(error)}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            取消
          </Button>
          
          <Button
            onClick={handleSave}
            loading={loading}
            disabled={!hasChanges || hasValidationErrors}
            icon={<Save className="h-4 w-4" />}
          >
            {isEditing ? '保存更改' : '创建'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditModal;