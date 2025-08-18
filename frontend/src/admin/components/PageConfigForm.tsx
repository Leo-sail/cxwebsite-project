import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../utils';
import { useFormValidation } from '../../hooks/useValidation';

/**
 * 区块内容类型定义
 */
type SectionContent = {
  text?: string;
  html?: string;
  image_url?: string;
  video_url?: string;
  gallery_images?: string[];
  testimonials?: Array<{
    name: string;
    content: string;
    avatar?: string;
    position?: string;
  }>;
  faq_items?: Array<{
    question: string;
    answer: string;
  }>;
  items?: Array<{
    title: string;
    description: string;
  }>;
  images?: Array<{
    url: string;
    caption: string;
  }>;
  phone?: string;
  email?: string;
  address?: string;
  hours?: string;
  [key: string]: unknown;
};

/**
 * 页面配置表单数据类型
 */
interface PageConfigFormData {
  page_name: string;
  page_key: string;
  title: string;
  description: string;
  keywords: string[];
  config_data: {
    hero_section?: {
      title: string;
      subtitle: string;
      background_image?: string;
      cta_text?: string;
      cta_link?: string;
    };
    sections?: Array<{
      id: string;
      type: 'text' | 'image' | 'video' | 'gallery' | 'testimonials' | 'faq';
      title: string;
      content: SectionContent;
      order: number;
      visible: boolean;
    }>;
    seo?: {
      meta_title: string;
      meta_description: string;
      og_image?: string;
      canonical_url?: string;
    };
    layout?: {
      sidebar_enabled: boolean;
      breadcrumb_enabled: boolean;
      comments_enabled: boolean;
    };
  };
  status: 'active' | 'inactive';
}

/**
 * 页面配置表单组件属性
 */
interface PageConfigFormProps {
  mode: 'create' | 'edit';
  config?: PageConfigFormData;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * 内容区块类型选项
 */
const sectionTypeOptions = [
  { value: 'text', label: '文本内容' },
  { value: 'image', label: '图片展示' },
  { value: 'video', label: '视频内容' },
  { value: 'gallery', label: '图片画廊' },
  { value: 'testimonials', label: '用户评价' },
  { value: 'faq', label: '常见问题' },
];

/**
 * 页面配置表单组件
 */
const PageConfigForm: React.FC<PageConfigFormProps> = ({
  mode,
  config,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<PageConfigFormData>({
    page_name: '',
    page_key: '',
    title: '',
    description: '',
    keywords: [],
    config_data: {
      hero_section: {
        title: '',
        subtitle: '',
        background_image: '',
        cta_text: '',
        cta_link: '',
      },
      sections: [],
      seo: {
        meta_title: '',
        meta_description: '',
        og_image: '',
        canonical_url: '',
      },
      layout: {
        sidebar_enabled: false,
        breadcrumb_enabled: true,
        comments_enabled: false,
      },
    },
    status: 'active',
  });

  const [newKeyword, setNewKeyword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // 表单验证配置
  const validationConfig = {
    page_name: {
      required: true,
      type: 'string' as const,
      minLength: 2,
      maxLength: 50,
      sanitize: true
    },
    page_key: {
      required: true,
      type: 'string' as const,
      pattern: /^[a-z0-9_-]+$/,
      sanitize: true
    },
    title: {
      required: true,
      type: 'string' as const,
      maxLength: 100,
      sanitize: true
    },
    description: {
      type: 'string' as const,
      maxLength: 500,
      sanitize: true
    }
  };

  const { validateField, validateForm, hasFieldError, getFieldErrors } = useFormValidation(validationConfig);

  /**
   * 初始化表单数据
   */
  useEffect(() => {
    if (mode === 'edit' && config) {
      setFormData({
        page_name: config.page_name || '',
        page_key: config.page_key || '',
        title: config.title || '',
        description: config.description || '',
        keywords: config.keywords || [],
        config_data: {
          hero_section: {
            title: config.config_data?.hero_section?.title || '',
            subtitle: config.config_data?.hero_section?.subtitle || '',
            background_image: config.config_data?.hero_section?.background_image || '',
            cta_text: config.config_data?.hero_section?.cta_text || '',
            cta_link: config.config_data?.hero_section?.cta_link || '',
          },
          sections: config.config_data?.sections || [],
          seo: {
            meta_title: config.config_data?.seo?.meta_title || '',
            meta_description: config.config_data?.seo?.meta_description || '',
            og_image: config.config_data?.seo?.og_image || '',
            canonical_url: config.config_data?.seo?.canonical_url || '',
          },
          layout: {
            sidebar_enabled: config.config_data?.layout?.sidebar_enabled || false,
            breadcrumb_enabled: config.config_data?.layout?.breadcrumb_enabled !== false,
            comments_enabled: config.config_data?.layout?.comments_enabled || false,
          },
        },
        status: config.status || 'active',
      });
    }
  }, [mode, config]);

  /**
   * 处理字段变化
   */
  const handleFieldChange = (field: keyof PageConfigFormData, value: unknown) => {
    // 实时验证（只对配置中存在的字段进行验证）
    const fieldName = field as string;
    if (fieldName in validationConfig) {
      validateField(fieldName, value);
    }

    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * 处理配置数据变化
   */
  const handleConfigChange = (section: string, field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      config_data: {
        ...prev.config_data,
        [section]: {
          ...prev.config_data[section as keyof typeof prev.config_data],
          [field]: value,
        },
      },
    }));
  };

  /**
   * 添加关键词
   */
  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()],
      }));
      setNewKeyword('');
    }
  };

  /**
   * 删除关键词
   */
  const handleRemoveKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index),
    }));
  };

  /**
   * 添加内容区块
   */
  const handleAddSection = () => {
    const newSection = {
      id: `section_${Date.now()}`,
      type: 'text' as const,
      title: '',
      content: {},
      order: formData.config_data.sections?.length || 0,
      visible: true,
    };

    setFormData(prev => ({
      ...prev,
      config_data: {
        ...prev.config_data,
        sections: [...(prev.config_data.sections || []), newSection],
      },
    }));
  };

  /**
   * 删除内容区块
   */
  const handleRemoveSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      config_data: {
        ...prev.config_data,
        sections: prev.config_data.sections?.filter((_, i) => i !== index) || [],
      },
    }));
  };

  /**
   * 更新内容区块
   */
  const handleUpdateSection = (index: number, field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      config_data: {
        ...prev.config_data,
        sections: prev.config_data.sections?.map((section, i) => 
          i === index ? { ...section, [field]: value } : section
        ) || [],
      },
    }));
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    const validationResult = validateForm(formData);
    if (!validationResult.isValid) {
      console.error('表单验证失败:', validationResult.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: 调用API保存页面配置
      console.log('保存页面配置:', formData);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess();
    } catch (error: unknown) {
      console.error('保存页面配置失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onCancel} />
        
        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full z-10">
          <form onSubmit={handleSubmit}>
            {/* 表单头部 */}
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {mode === 'edit' ? '编辑页面配置' : '新增页面配置'}
                </h3>
                <button
                  type="button"
                  onClick={onCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* 标签页导航 */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { key: 'basic', label: '基础信息' },
                    { key: 'hero', label: '首屏配置' },
                    { key: 'sections', label: '内容区块' },
                    { key: 'seo', label: 'SEO设置' },
                    { key: 'layout', label: '布局配置' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
                        activeTab === tab.key
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* 基础信息标签页 */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        页面名称 *
                      </label>
                      <input
                        type="text"
                        value={formData.page_name}
                        onChange={(e) => handleFieldChange('page_name', e.target.value)}
                        className={cn(
                          "block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1",
                          hasFieldError('page_name')
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        )}
                        placeholder="请输入页面名称"
                        required
                      />
                      {hasFieldError('page_name') && (
                        <p className="mt-1 text-sm text-red-600">
                          {getFieldErrors('page_name')[0]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        页面标识 *
                      </label>
                      <input
                        type="text"
                        value={formData.page_key}
                        onChange={(e) => handleFieldChange('page_key', e.target.value)}
                        className={cn(
                          "block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1",
                          hasFieldError('page_key')
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        )}
                        placeholder="请输入页面标识（如：home, about）"
                        required
                      />
                      {hasFieldError('page_key') && (
                        <p className="mt-1 text-sm text-red-600">
                          {getFieldErrors('page_key')[0]}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      页面标题 *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      className={cn(
                        "block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1",
                        hasFieldError('title')
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      )}
                      placeholder="请输入页面标题"
                      required
                    />
                    {hasFieldError('title') && (
                      <p className="mt-1 text-sm text-red-600">
                        {getFieldErrors('title')[0]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      页面描述
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      rows={3}
                      className={cn(
                        "block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1",
                        hasFieldError('description')
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      )}
                      placeholder="请输入页面描述"
                    />
                    {hasFieldError('description') && (
                      <p className="mt-1 text-sm text-red-600">
                        {getFieldErrors('description')[0]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      关键词
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyword(index)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="输入关键词后按回车添加"
                      />
                      <button
                        type="button"
                        onClick={handleAddKeyword}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      状态
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleFieldChange('status', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="active">启用</option>
                      <option value="inactive">禁用</option>
                    </select>
                  </div>
                </div>
              )}

              {/* 首屏配置标签页 */}
              {activeTab === 'hero' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      主标题
                    </label>
                    <input
                      type="text"
                      value={formData.config_data.hero_section?.title || ''}
                      onChange={(e) => handleConfigChange('hero_section', 'title', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请输入首屏主标题"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      副标题
                    </label>
                    <input
                      type="text"
                      value={formData.config_data.hero_section?.subtitle || ''}
                      onChange={(e) => handleConfigChange('hero_section', 'subtitle', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请输入首屏副标题"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      背景图片URL
                    </label>
                    <input
                      type="url"
                      value={formData.config_data.hero_section?.background_image || ''}
                      onChange={(e) => handleConfigChange('hero_section', 'background_image', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请输入背景图片URL"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        按钮文字
                      </label>
                      <input
                        type="text"
                        value={formData.config_data.hero_section?.cta_text || ''}
                        onChange={(e) => handleConfigChange('hero_section', 'cta_text', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="请输入按钮文字"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        按钮链接
                      </label>
                      <input
                        type="text"
                        value={formData.config_data.hero_section?.cta_link || ''}
                        onChange={(e) => handleConfigChange('hero_section', 'cta_link', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="请输入按钮链接"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 内容区块标签页 */}
              {activeTab === 'sections' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-700">内容区块</h4>
                    <button
                      type="button"
                      onClick={handleAddSection}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      添加区块
                    </button>
                  </div>

                  {formData.config_data.sections?.map((section, index) => (
                    <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="text-sm font-medium text-gray-700">区块 {index + 1}</h5>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateSection(index, 'visible', !section.visible)}
                            className={cn(
                              'text-sm',
                              section.visible ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'
                            )}
                          >
                            {section.visible ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSection(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            区块类型
                          </label>
                          <select
                            value={section.type}
                            onChange={(e) => handleUpdateSection(index, 'type', e.target.value)}
                            className="block w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {sectionTypeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            区块标题
                          </label>
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => handleUpdateSection(index, 'title', e.target.value)}
                            className="block w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="请输入区块标题"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!formData.config_data.sections || formData.config_data.sections.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      暂无内容区块，点击上方按钮添加
                    </div>
                  )}
                </div>
              )}

              {/* SEO设置标签页 */}
              {activeTab === 'seo' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SEO标题
                    </label>
                    <input
                      type="text"
                      value={formData.config_data.seo?.meta_title || ''}
                      onChange={(e) => handleConfigChange('seo', 'meta_title', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请输入SEO标题"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SEO描述
                    </label>
                    <textarea
                      value={formData.config_data.seo?.meta_description || ''}
                      onChange={(e) => handleConfigChange('seo', 'meta_description', e.target.value)}
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请输入SEO描述"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      OG图片URL
                    </label>
                    <input
                      type="url"
                      value={formData.config_data.seo?.og_image || ''}
                      onChange={(e) => handleConfigChange('seo', 'og_image', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请输入OG图片URL"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      规范化URL
                    </label>
                    <input
                      type="url"
                      value={formData.config_data.seo?.canonical_url || ''}
                      onChange={(e) => handleConfigChange('seo', 'canonical_url', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请输入规范化URL"
                    />
                  </div>
                </div>
              )}

              {/* 布局配置标签页 */}
              {activeTab === 'layout' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="sidebar_enabled"
                        checked={formData.config_data.layout?.sidebar_enabled || false}
                        onChange={(e) => handleConfigChange('layout', 'sidebar_enabled', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="sidebar_enabled" className="ml-2 block text-sm text-gray-700">
                        启用侧边栏
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="breadcrumb_enabled"
                        checked={formData.config_data.layout?.breadcrumb_enabled !== false}
                        onChange={(e) => handleConfigChange('layout', 'breadcrumb_enabled', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="breadcrumb_enabled" className="ml-2 block text-sm text-gray-700">
                        启用面包屑导航
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="comments_enabled"
                        checked={formData.config_data.layout?.comments_enabled || false}
                        onChange={(e) => handleConfigChange('layout', 'comments_enabled', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="comments_enabled" className="ml-2 block text-sm text-gray-700">
                        启用评论功能
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 表单底部 */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '保存中...' : (mode === 'edit' ? '更新配置' : '创建配置')}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PageConfigForm;