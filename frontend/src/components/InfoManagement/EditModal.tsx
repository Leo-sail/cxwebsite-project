/**
 * 编辑弹窗组件
 * 用于信息管理页面的数据新增和编辑
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion'; // 移除framer-motion依赖
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Chip,
  Tooltip,
  Box,
  Typography,
  Grid,
  Paper,
  Alert
} from '@mui/material';
// Tabs functionality will be implemented using Material-UI Tabs
import {
  Save,
  X,
  AlertCircle,
  Info,
  Eye,
  EyeOff,
  Copy,
  RotateCcw
} from 'lucide-react';
import type {
  EditModalProps,
  FormField,
  FormData,
  ValidationError
} from '../../types/infoManagement';
import type { ContentTableType } from '../../types/contentSettings';
import { 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from '../ui/Select';

// ============================================================================
// 表单字段配置
// ============================================================================

/**
 * 默认表单字段配置
 */
const DEFAULT_FORM_FIELDS: Record<ContentTableType, FormField[]> = {
  site_content: [
    {
      name: 'key',
      label: '键名',
      type: 'text',
      required: true,
      placeholder: '请输入键名（如：site.title）',
      description: '用于标识内容的唯一键名，建议使用点分隔的命名方式',
      validation: {
        pattern: /^[a-zA-Z][a-zA-Z0-9._-]*$/,
        message: '键名只能包含字母、数字、点、下划线和连字符，且必须以字母开头'
      }
    },
    {
      name: 'value',
      label: '内容',
      type: 'textarea',
      required: true,
      placeholder: '请输入内容',
      description: '站点内容的具体值'
    },
    {
      name: 'description',
      label: '描述',
      type: 'text',
      placeholder: '请输入描述信息',
      description: '对该内容的说明，便于管理和维护'
    }
  ],
  navigation: [
    {
      name: 'title',
      label: '标题',
      type: 'text',
      required: true,
      placeholder: '请输入导航标题',
      description: '显示在导航菜单中的文本'
    },
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      required: true,
      placeholder: '请输入链接地址（如：/about）',
      description: '导航链接的目标地址',
      validation: {
        pattern: /^(https?:\/\/|\/).*$/,
        message: 'URL必须以http://、https://或/开头'
      }
    },
    {
      name: 'description',
      label: '描述',
      type: 'text',
      placeholder: '请输入描述信息',
      description: '导航项的描述信息'
    },
    {
      name: 'order',
      label: '排序',
      type: 'number',
      defaultValue: 0,
      placeholder: '请输入排序值',
      description: '数值越小排序越靠前'
    },
    {
      name: 'is_active',
      label: '启用状态',
      type: 'switch',
      defaultValue: true,
      description: '是否在导航中显示该项目'
    }
  ],
  ui_texts: [
    {
      name: 'key',
      label: '键名',
      type: 'text',
      required: true,
      placeholder: '请输入键名（如：button.submit）',
      description: '用于标识UI文本的唯一键名',
      validation: {
        pattern: /^[a-zA-Z][a-zA-Z0-9._-]*$/,
        message: '键名只能包含字母、数字、点、下划线和连字符，且必须以字母开头'
      }
    },
    {
      name: 'value',
      label: '文本内容',
      type: 'textarea',
      required: true,
      placeholder: '请输入文本内容',
      description: 'UI界面中显示的文本'
    },
    {
      name: 'category',
      label: '分类',
      type: 'select',
      options: [
        { value: 'button', label: '按钮' },
        { value: 'label', label: '标签' },
        { value: 'message', label: '消息' },
        { value: 'title', label: '标题' },
        { value: 'placeholder', label: '占位符' },
        { value: 'tooltip', label: '提示' }
      ],
      placeholder: '请选择分类',
      description: 'UI文本的分类，便于管理'
    },
    {
      name: 'description',
      label: '描述',
      type: 'text',
      placeholder: '请输入描述信息',
      description: '对该UI文本的说明'
    }
  ],
  page_sections: [
    {
      name: 'name',
      label: '区域名称',
      type: 'text',
      required: true,
      placeholder: '请输入区域名称（如：hero-section）',
      description: '页面区域的唯一标识名称',
      validation: {
        pattern: /^[a-zA-Z][a-zA-Z0-9_-]*$/,
        message: '区域名称只能包含字母、数字、下划线和连字符，且必须以字母开头'
      }
    },
    {
      name: 'title',
      label: '显示标题',
      type: 'text',
      placeholder: '请输入显示标题',
      description: '在页面中显示的标题文本'
    },
    {
      name: 'description',
      label: '描述',
      type: 'textarea',
      placeholder: '请输入描述信息',
      description: '对该页面区域的详细描述'
    },
    {
      name: 'content',
      label: '内容',
      type: 'textarea',
      placeholder: '请输入区域内容',
      description: '页面区域的具体内容，支持HTML'
    },
    {
      name: 'order',
      label: '排序',
      type: 'number',
      defaultValue: 0,
      placeholder: '请输入排序值',
      description: '数值越小排序越靠前'
    },
    {
      name: 'is_visible',
      label: '可见性',
      type: 'switch',
      defaultValue: true,
      description: '是否在页面中显示该区域'
    }
  ],
  seo_metadata: [
    {
      name: 'page',
      label: '页面',
      type: 'select',
      required: true,
      options: [
        { value: 'home', label: '首页' },
        { value: 'about', label: '关于我们' },
        { value: 'services', label: '服务' },
        { value: 'contact', label: '联系我们' },
        { value: 'blog', label: '博客' },
        { value: 'products', label: '产品' }
      ],
      placeholder: '请选择页面',
      description: 'SEO元数据应用的页面'
    },
    {
      name: 'title',
      label: 'SEO标题',
      type: 'text',
      required: true,
      placeholder: '请输入SEO标题',
      description: '显示在搜索结果和浏览器标题栏的标题',
      validation: {
        maxLength: 60,
        message: 'SEO标题建议不超过60个字符'
      }
    },
    {
      name: 'description',
      label: 'SEO描述',
      type: 'textarea',
      placeholder: '请输入SEO描述',
      description: '显示在搜索结果中的页面描述',
      validation: {
        maxLength: 160,
        message: 'SEO描述建议不超过160个字符'
      }
    },
    {
      name: 'keywords',
      label: '关键词',
      type: 'text',
      placeholder: '请输入关键词，用逗号分隔',
      description: '页面的关键词，用逗号分隔'
    },
    {
      name: 'og_title',
      label: 'Open Graph标题',
      type: 'text',
      placeholder: '请输入OG标题',
      description: '社交媒体分享时显示的标题'
    },
    {
      name: 'og_description',
      label: 'Open Graph描述',
      type: 'textarea',
      placeholder: '请输入OG描述',
      description: '社交媒体分享时显示的描述'
    }
  ]
};

// ============================================================================
// 子组件
// ============================================================================

/**
 * 表单字段组件
 */
interface FormFieldComponentProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
}

const FormFieldComponent: React.FC<FormFieldComponentProps> = ({
  field,
  value,
  onChange,
  error,
  disabled = false
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <Input
            type={field.type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
          />
        );
      
      case 'password':
        return (
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder}
              disabled={disabled}
              className={error ? 'border-red-500' : ''}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={field.placeholder}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
            rows={field.rows || 3}
          />
        );
      
      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={onChange}
            disabled={disabled}
          >
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'switch':
        return (
          <Switch
            checked={value || false}
            onCheckedChange={onChange}
            disabled={disabled}
          />
        );
      
      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
          />
        );
    }
  };
  
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className="flex items-center gap-2">
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
      </Label>
      
      {renderField()}
      
      {field.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {field.description}
        </p>
      )}
      
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
      
      {field.validation?.maxLength && value && (
        <p className="text-xs text-gray-500 text-right">
          {String(value).length}/{field.validation.maxLength}
        </p>
      )}
    </div>
  );
};

/**
 * 预览组件
 */
interface PreviewPanelProps {
  data: FormData;
  tableName: ContentTableType;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ data, tableName }) => {
  const renderPreview = () => {
    switch (tableName) {
      case 'site_content':
        return (
          <div className="space-y-4">
            <div>
              <Label>键名</Label>
              <code className="block mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                {data.key || '未设置'}
              </code>
            </div>
            <div>
              <Label>内容预览</Label>
              <div className="mt-1 p-3 border rounded bg-gray-50 dark:bg-gray-800">
                {data.value || '暂无内容'}
              </div>
            </div>
          </div>
        );
      
      case 'navigation':
        return (
          <div className="space-y-4">
            <div>
              <Label>导航预览</Label>
              <div className="mt-1 p-3 border rounded bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{data.title || '未设置标题'}</span>
                  <Badge variant={data.is_active ? 'default' : 'secondary'}>
                    {data.is_active ? '启用' : '禁用'}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  链接: {data.url || '未设置'}
                </div>
                <div className="text-sm text-gray-500">
                  排序: {data.order || 0}
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-2">
            {Object.entries(data).map(([key, value]) => (
              <div key={key}>
                <Label className="capitalize">{key}</Label>
                <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                  {String(value || '未设置')}
                </div>
              </div>
            ))}
          </div>
        );
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4" />
        <span className="font-medium">预览</span>
      </div>
      {renderPreview()}
    </div>
  );
};

// ============================================================================
// 主组件
// ============================================================================

/**
 * 编辑弹窗组件
 */
export const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onCancel,
  onSubmit,
  initialData,
  tableType,
  mode = 'create',
  loading = false,
  fields,
  title,
  description,
  showPreview = true,
  validateOnChange = true,
  className = ''
}) => {
  // 兼容旧的prop名称
  const open = isOpen;
  const onClose = onCancel;
  const onSave = onSubmit;
  const data = initialData;
  const tableName = tableType;
  // ============================================================================
  // 状态管理
  // ============================================================================
  
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('form');
  const [hasChanges, setHasChanges] = useState(false);
  
  // ============================================================================
  // 计算属性
  // ============================================================================
  
  /**
   * 获取表单字段配置
   */
  const formFields = useMemo(() => {
    if (fields) return fields;
    return DEFAULT_FORM_FIELDS[tableName] || [];
  }, [fields, tableName]);
  
  /**
   * 弹窗标题
   */
  const modalTitle = useMemo(() => {
    if (title) return title;
    const action = mode === 'create' ? '新增' : '编辑';
    const tableNames = {
      site_content: '站点内容',
      navigation: '导航项',
      ui_texts: 'UI文本',
      page_sections: '页面区域',
      seo_metadata: 'SEO元数据'
    };
    return `${action}${tableNames[tableName] || '记录'}`;
  }, [title, mode, tableName]);
  
  /**
   * 弹窗描述
   */
  const modalDescription = useMemo(() => {
    if (description) return description;
    return mode === 'create' ? '请填写以下信息来创建新记录' : '请修改以下信息来更新记录';
  }, [description, mode]);
  
  // ============================================================================
  // 表单验证
  // ============================================================================
  
  /**
   * 验证单个字段
   */
  const validateField = useCallback((field: FormField, value: any): string | undefined => {
    // 必填验证
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${field.label}是必填项`;
    }
    
    // 自定义验证
    if (field.validation && value) {
      const { pattern, minLength, maxLength, min, max, message } = field.validation;
      
      if (pattern && !pattern.test(String(value))) {
        return message || `${field.label}格式不正确`;
      }
      
      if (minLength && String(value).length < minLength) {
        return message || `${field.label}至少需要${minLength}个字符`;
      }
      
      if (maxLength && String(value).length > maxLength) {
        return message || `${field.label}不能超过${maxLength}个字符`;
      }
      
      if (min !== undefined && Number(value) < min) {
        return message || `${field.label}不能小于${min}`;
      }
      
      if (max !== undefined && Number(value) > max) {
        return message || `${field.label}不能大于${max}`;
      }
    }
    
    return undefined;
  }, []);
  
  /**
   * 验证所有字段
   */
  const validateForm = useCallback((): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    
    formFields.forEach((field) => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });
    
    return newErrors;
  }, [formFields, formData, validateField]);
  
  // ============================================================================
  // 事件处理
  // ============================================================================
  
  /**
   * 处理字段值变化
   */
  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    setHasChanges(true);
    
    // 实时验证
    if (validateOnChange) {
      const field = formFields.find(f => f.name === fieldName);
      if (field) {
        const error = validateField(field, value);
        setErrors(prev => ({
          ...prev,
          [fieldName]: error || ''
        }));
      }
    }
  }, [formFields, validateField, validateOnChange]);
  
  /**
   * 处理保存
   */
  const handleSave = useCallback(async () => {
    const formErrors = validateForm();
    setErrors(formErrors);
    
    if (Object.keys(formErrors).some(key => formErrors[key])) {
      setActiveTab('form'); // 切换到表单标签显示错误
      return;
    }
    
    try {
      await onSave(formData);
      setHasChanges(false);
    } catch (error) {
      console.error('保存失败:', error);
    }
  }, [formData, validateForm, onSave]);
  
  /**
   * 处理重置
   */
  const handleReset = useCallback(() => {
    const initialData: FormData = {};
    
    // 设置默认值
    formFields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        initialData[field.name] = field.defaultValue;
      }
    });
    
    // 如果是编辑模式，使用传入的数据
    if (mode === 'edit' && data) {
      Object.assign(initialData, data);
    }
    
    setFormData(initialData);
    setErrors({});
    setHasChanges(false);
  }, [formFields, mode, data]);
  
  /**
   * 处理关闭
   */
  const handleClose = useCallback(() => {
    if (hasChanges) {
      if (window.confirm('有未保存的更改，确定要关闭吗？')) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [hasChanges, onClose]);
  
  // ============================================================================
  // 副作用
  // ============================================================================
  
  // 初始化表单数据
  useEffect(() => {
    if (open) {
      handleReset();
    }
  }, [open, handleReset]);
  
  // ============================================================================
  // 渲染
  // ============================================================================
  
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle className="flex items-center gap-2">
        {modalTitle}
        {hasChanges && (
          <Chip variant="outlined" size="small" label="未保存" color="warning" />
        )}
      </DialogTitle>
        
      <DialogContent dividers style={{ minHeight: '60vh', maxHeight: '80vh' }}>
        {showPreview ? (
          <Box sx={{ width: '100%', height: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Button
                variant={activeTab === 'form' ? 'contained' : 'outlined'}
                onClick={() => setActiveTab('form')}
                sx={{ mr: 1 }}
                startIcon={<Eye />}
              >
                编辑
              </Button>
              <Button
                variant={activeTab === 'preview' ? 'contained' : 'outlined'}
                onClick={() => setActiveTab('preview')}
                startIcon={<Eye />}
              >
                预览
              </Button>
            </Box>
            
            {activeTab === 'form' ? (
              <Box sx={{ height: 'calc(100% - 60px)', overflow: 'auto' }}>
                <Grid container spacing={2}>
                  {formFields.map((field) => (
                    <Grid item xs={12} key={field.name}>
                      <FormFieldComponent
                        field={field}
                        value={formData[field.name]}
                        onChange={(value) => handleFieldChange(field.name, value)}
                        error={errors[field.name]}
                        disabled={loading}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ) : (
              <Box sx={{ height: 'calc(100% - 60px)', overflow: 'auto' }}>
                <PreviewPanel data={formData} tableName={tableName} />
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ height: '100%', overflow: 'auto' }}>
            <Grid container spacing={2}>
              {formFields.map((field) => (
                <Grid item xs={12} key={field.name}>
                  <FormFieldComponent
                    field={field}
                    value={formData[field.name]}
                    onChange={(value) => handleFieldChange(field.name, value)}
                    error={errors[field.name]}
                    disabled={loading}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </DialogContent>
        
      {/* 错误提示 */}
      {Object.keys(errors).some(key => errors[key]) && (
        <Alert severity="error" sx={{ mx: 2, mb: 1 }}>
          请检查并修正表单中的错误信息
        </Alert>
      )}
      
      <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleReset}
            disabled={loading}
            startIcon={<RotateCcw />}
          >
            重置
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button variant="outlined" onClick={handleClose} disabled={loading}>
            取消
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            startIcon={loading ? <Box sx={{ width: 16, height: 16 }} /> : <Save />}
          >
            {mode === 'create' ? '创建' : '保存'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

// ============================================================================
// 导出
// ============================================================================

export default EditModal;

// 导出类型和配置
export { DEFAULT_FORM_FIELDS };
export type { EditModalProps, FormField, FormData };