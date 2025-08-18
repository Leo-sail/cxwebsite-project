import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { Modal } from '../../components';
import { ArticleService } from '../../services/adminService';
import { toast } from 'react-hot-toast';
import { useFormValidation } from '../../hooks/useValidation';
import { cn } from '../../utils';
import type { ArticleFormData } from '../../types';

/**
 * 文章表单组件属性
 */
interface ArticleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  articleId?: string;
  initialData?: Partial<ArticleFormData>;
}

/**
 * 文章表单组件
 */
const ArticleForm: React.FC<ArticleFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  articleId,
  initialData,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [],
    featured_image: '',
    status: 'draft',
    featured: false,
    author_id: '',
    views: 0,
  });

  const [newTag, setNewTag] = useState('');

  // 表单验证配置
  const validationConfig = {
    title: {
      required: true,
      type: 'string' as const,
      minLength: 1,
      maxLength: 200,
      sanitize: true
    },
    excerpt: {
      type: 'string' as const,
      maxLength: 500,
      sanitize: true
    },
    content: {
      required: true,
      type: 'html' as const,
      minLength: 10,
      maxLength: 50000,
      sanitize: true
    },
    category: {
      required: true,
      type: 'string' as const,
      sanitize: true
    },
    featured_image: {
      type: 'url' as const,
      maxLength: 500,
      sanitize: true
    }
  };

  const { validateField, validateForm, hasFieldError, getFieldErrors, clearErrors } = useFormValidation(validationConfig);

  // 分类选项
  const categories = [
    '技术分享',
    '行业动态',
    '案例分析',
    '教程指南',
    '产品更新',
    '公司新闻',
  ];

  // 状态选项
  const statusOptions = [
    { value: 'draft', label: '草稿' },
    { value: 'published', label: '已发布' },
    { value: 'scheduled', label: '定时发布' },
    { value: 'archived', label: '已归档' },
  ];

  /**
   * 初始化表单数据
   */
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          excerpt: initialData.excerpt || '',
          content: initialData.content || '',
          category: initialData.category || '',
          tags: initialData.tags || [],
          featured_image: initialData.featured_image || '',
          status: initialData.status || 'draft',
          featured: initialData.featured || false,
          author_id: initialData.author_id || '',
          views: initialData.views || 0,
        });
      } else {
        // 重置表单
        setFormData({
          title: '',
          excerpt: '',
          content: '',
          category: '',
          tags: [],
          featured_image: '',
          status: 'draft',
          featured: false,
          author_id: '',
          views: 0,
        });
      }
      setNewTag('');
    }
  }, [isOpen, initialData]);

  /**
   * 处理表单字段变化
   */
  const handleInputChange = (field: keyof ArticleFormData, value: string | boolean | number) => {
    // 实时验证
    if (field in validationConfig) {
      validateField(field as string, value);
    }

    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * 添加标签
   */
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  /**
   * 删除标签
   */
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 清除之前的错误
    clearErrors();
    
    // 验证整个表单
    const validationResult = validateForm(formData);
    if (!validationResult.isValid) {
      toast.error('请检查表单输入');
      return;
    }
    
    if (!formData.author_id.trim()) {
      toast.error('请输入作者ID');
      return;
    }

    setLoading(true);
    
    try {
      // 映射表单数据到数据库字段
      const submitData = {
        title: formData.title,
        summary: formData.excerpt,
        content: formData.content,
        category: formData.category,
        image_url: formData.featured_image,
        is_active: formData.status === 'published',
        is_featured: formData.featured,
        author_id: formData.author_id,
        tags: formData.tags,
        views: formData.views,
        sort_order: 0,
      };

      if (articleId) {
        await ArticleService.updateArticle(articleId, submitData);
        toast.success('文章更新成功');
      } else {
        await ArticleService.createArticle(submitData);
        toast.success('文章创建成功');
      }
      
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error('保存文章失败:', error);
      toast.error(articleId ? '更新文章失败' : '创建文章失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={articleId ? '编辑文章' : '新增文章'}
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* 文章标题 */}
          <div className="sm:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              文章标题 *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={cn(
                "mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                hasFieldError('title') && "border-red-300 focus:border-red-500 focus:ring-red-500"
              )}
              placeholder="请输入文章标题"
              required
            />
            {hasFieldError('title') && (
              <p className="mt-1 text-sm text-red-600">
                {getFieldErrors('title')[0]}
              </p>
            )}
          </div>

          {/* 文章摘要 */}
          <div className="sm:col-span-2">
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
              文章摘要
            </label>
            <textarea
              id="excerpt"
              rows={3}
              value={formData.excerpt}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              className={cn(
                "mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                hasFieldError('excerpt') && "border-red-300 focus:border-red-500 focus:ring-red-500"
              )}
              placeholder="请输入文章摘要（可选）"
            />
            {hasFieldError('excerpt') && (
              <p className="mt-1 text-sm text-red-600">
                {getFieldErrors('excerpt')[0]}
              </p>
            )}
          </div>

          {/* 分类 */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              分类 *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={cn(
                "mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                hasFieldError('category') && "border-red-300 focus:border-red-500 focus:ring-red-500"
              )}
              required
            >
              <option value="">请选择分类</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {hasFieldError('category') && (
              <p className="mt-1 text-sm text-red-600">
                {getFieldErrors('category')[0]}
              </p>
            )}
          </div>

          {/* 作者 */}
          <div>
            <label htmlFor="author_id" className="block text-sm font-medium text-gray-700">
              作者ID *
            </label>
            <input
              type="text"
              id="author_id"
              value={formData.author_id}
              onChange={(e) => handleInputChange('author_id', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="请输入作者ID"
              required
            />
          </div>

          {/* 状态 */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              状态
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as ArticleFormData['status'])}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>


        </div>

        {/* 标签管理 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            标签
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:outline-none"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="输入标签后按回车添加"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 特色图片 */}
        <div>
          <label htmlFor="featured_image" className="block text-sm font-medium text-gray-700">
            特色图片URL
          </label>
          <input
              type="url"
              id="featured_image"
              value={formData.featured_image}
              onChange={(e) => handleInputChange('featured_image', e.target.value)}
              className={cn(
                "mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                hasFieldError('featured_image') && "border-red-300 focus:border-red-500 focus:ring-red-500"
              )}
              placeholder="请输入图片URL（可选）"
            />
            {hasFieldError('featured_image') && (
              <p className="mt-1 text-sm text-red-600">
                {getFieldErrors('featured_image')[0]}
              </p>
            )}
        </div>

        {/* 文章内容 */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            文章内容 *
          </label>
          <textarea
              id="content"
              rows={12}
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              className={cn(
                "mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                hasFieldError('content') && "border-red-300 focus:border-red-500 focus:ring-red-500"
              )}
              placeholder="请输入文章内容"
              required
            />
            {hasFieldError('content') && (
              <p className="mt-1 text-sm text-red-600">
                {getFieldErrors('content')[0]}
              </p>
            )}
        </div>

        {/* SEO设置 */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">SEO设置</h3>
          <div className="grid grid-cols-1 gap-6">

          </div>
        </div>

        {/* 其他设置 */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">其他设置</h3>
          <div className="flex items-center">
            <input
              id="featured"
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => handleInputChange('featured', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
              设为推荐文章
            </label>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '保存中...' : (articleId ? '更新文章' : '创建文章')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ArticleForm;