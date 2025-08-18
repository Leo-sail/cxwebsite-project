import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CalendarIcon,
  TagIcon,
  UserIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../utils';
import { DataTable } from '../../components';
import { ArticleService } from '../../services/adminService';
import { ArticleForm } from '../components';
import { toast } from 'react-hot-toast';

/**
 * 文章数据类型
 */
interface Article extends Record<string, unknown> {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  featured_image?: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  views: number;
  likes: number;
  comments_count: number;
  is_featured: boolean;
  seo_title?: string;
  seo_description?: string;
  estimated_read_time: number; // 预计阅读时间（分钟）
  created_at: string;
  updated_at: string;
  published_at?: string;
  scheduled_at?: string;
}

// 数据库文章类型
interface DatabaseArticle {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  category: string | null;
  image_url: string | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * 文章管理页面
 */
const Articles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const itemsPerPage = 10;

  // 加载文章数据
  const loadArticles = useCallback(async () => {
    try {
      const { data } = await ArticleService.getArticles({
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        status: selectedStatus !== 'all' ? selectedStatus as 'draft' | 'published' | 'scheduled' | 'archived' : undefined,
        featured: showFeaturedOnly || undefined,
        page: 1,
        limit: itemsPerPage
      });
      
      // 映射数据库字段到Article类型
      const mappedArticles = (data || []).map((article: DatabaseArticle) => ({
        id: article.id,
        title: article.title,
        excerpt: article.summary || '',
        content: article.content || '',
        category: article.category || '',
        tags: [],
        author: 'Admin',
        featured_image: article.image_url || undefined,
        status: (article.is_active ? 'published' : 'draft') as 'draft' | 'published' | 'scheduled' | 'archived',
        views: 0,
        likes: 0,
        comments_count: 0,
        is_featured: article.is_featured || false,
        seo_title: '',
        seo_description: '',
        estimated_read_time: 5,
        created_at: article.created_at || '',
        updated_at: article.updated_at || '',
        published_at: article.created_at || undefined,
        scheduled_at: undefined,
      }));
      
      setArticles(mappedArticles);
    } catch (error: unknown) {
      console.error('加载文章失败:', error);
      toast.error('加载文章失败');
    }
  }, [searchTerm, selectedCategory, selectedStatus, showFeaturedOnly, itemsPerPage]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  // 分类选项
  const categories = ['all', '考研资讯', '学习资料', '经验分享', '心理辅导', '院校信息'];
  
  // 状态选项
  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'draft', label: '草稿' },
    { value: 'published', label: '已发布' },
    { value: 'scheduled', label: '定时发布' },
    { value: 'archived', label: '已归档' },
  ];

  // 状态映射
  const statusMap = {
    draft: '草稿',
    published: '已发布',
    scheduled: '定时发布',
    archived: '已归档',
  };

  // 状态颜色映射
  const getStatusColor = (status: Article['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * 过滤文章数据
   */
  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || article.status === selectedStatus;
    const matchesFeatured = !showFeaturedOnly || article.is_featured;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesFeatured;
  });

  /**
   * 处理添加文章
   */
  const handleAddArticle = () => {
    setEditingArticle(null);
    setShowForm(true);
  };

  /**
   * 处理编辑文章
   */
  const handleEditArticle = (articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    if (article) {
      setEditingArticle(article);
      setShowForm(true);
    }
  };

  /**
   * 处理删除文章
   */
  const handleDeleteArticle = async (articleId: string) => {
    try {
      await ArticleService.deleteArticle(articleId);
      toast.success('文章删除成功');
      loadArticles();
    } catch (error: unknown) {
      console.error('删除文章失败:', error);
      toast.error('删除文章失败');
    }
  };

  /**
   * 处理查看文章详情
   */
  const handleViewArticle = (articleId: string) => {
    console.log('查看文章:', articleId);
    // TODO: 实现查看文章详情逻辑
  };

  /**
   * 处理表单提交成功
   */
  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingArticle(null);
    loadArticles();
  };

  /**
   * 处理表单取消
   */
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingArticle(null);
  };

  /**
   * 格式化数字显示
   */
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  // 表格列配置
  const columns = [
    {
      key: 'title',
      title: '文章标题',
      render: (_: unknown, article: Article) => (
        <div className="max-w-xs">
          <div className="flex items-center">
            <div className="text-sm font-medium text-gray-900 truncate">{article.title}</div>
            {article.is_featured && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                推荐
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500 truncate mt-1">{article.excerpt}</div>
        </div>
      ),
    },
    {
      key: 'category',
      title: '分类',
      render: (_: unknown, article: Article) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {article.category}
        </span>
      ),
    },
    {
      key: 'tags',
      title: '标签',
      render: (_: unknown, article: Article) => (
        <div className="flex flex-wrap gap-1">
          {article.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
            >
              {tag}
            </span>
          ))}
          {article.tags.length > 2 && (
            <span className="text-xs text-gray-500">+{article.tags.length - 2}</span>
          )}
        </div>
      ),
    },
    {
      key: 'author',
      title: '作者',
      render: (_: unknown, article: Article) => (
        <div className="flex items-center">
          <UserIcon className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-sm text-gray-900">{article.author}</span>
        </div>
      ),
    },
    {
      key: 'stats',
      title: '统计',
      render: (_: unknown, article: Article) => (
        <div className="text-sm text-gray-500">
          <div className="flex items-center">
            <EyeIcon className="h-3 w-3 mr-1" />
            {formatNumber(article.views)}
          </div>
          <div className="flex items-center mt-1">
            <span className="text-red-500">♥</span>
            <span className="ml-1">{formatNumber(article.likes)}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'read_time',
      title: '阅读时间',
      render: (_: unknown, article: Article) => (
        <div className="flex items-center text-sm text-gray-500">
          <ClockIcon className="h-4 w-4 mr-1" />
          {article.estimated_read_time}分钟
        </div>
      ),
    },
    {
      key: 'status',
      title: '状态',
      render: (_: unknown, article: Article) => (
        <span className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          getStatusColor(article.status)
        )}>
          {statusMap[article.status]}
        </span>
      ),
    },
    {
      key: 'updated_at',
      title: '更新时间',
      render: (_: unknown, article: Article) => (
        <div className="text-sm text-gray-500">
          {article.updated_at}
        </div>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      render: (_: unknown, article: Article) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewArticle(article.id)}
            className="text-blue-600 hover:text-blue-900"
            title="查看详情"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEditArticle(article.id)}
            className="text-indigo-600 hover:text-indigo-900"
            title="编辑"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteArticle(article.id)}
            className="text-red-600 hover:text-red-900"
            title="删除"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">文章管理</h1>
          <p className="mt-1 text-sm text-gray-500">管理所有文章内容，包括创建、编辑和发布文章</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleAddArticle}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            新增文章
          </button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            {/* 搜索框 */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                placeholder="搜索文章标题、摘要或标签..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* 分类筛选 */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">全部分类</option>
                {categories.slice(1).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* 状态筛选 */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 推荐文章筛选 */}
            <div className="flex items-center">
              <input
                id="featured-only"
                type="checkbox"
                checked={showFeaturedOnly}
                onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="featured-only" className="ml-2 block text-sm text-gray-900">
                仅显示推荐文章
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 文章列表 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <DataTable
            data={filteredArticles}
            columns={columns}
            empty="暂无文章数据"
          />
        </div>
      </div>

      {/* 统计信息 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">文章统计</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-blue-500 truncate">总文章数</dt>
                      <dd className="text-lg font-medium text-blue-900">{articles.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-green-500 truncate">已发布</dt>
                      <dd className="text-lg font-medium text-green-900">
                        {articles.filter(a => a.status === 'published').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <EyeIcon className="h-6 w-6 text-yellow-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-yellow-500 truncate">总浏览量</dt>
                      <dd className="text-lg font-medium text-yellow-900">
                        {formatNumber(articles.reduce((sum, article) => sum + article.views, 0))}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TagIcon className="h-6 w-6 text-purple-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-purple-500 truncate">推荐文章</dt>
                      <dd className="text-lg font-medium text-purple-900">
                        {articles.filter(a => a.is_featured).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 文章表单弹窗 */}
      {showForm && (
        <ArticleForm
          isOpen={showForm}
          onClose={handleFormCancel}
          onSuccess={handleFormSuccess}
          articleId={editingArticle?.id}
          initialData={editingArticle ? {
            title: editingArticle.title,
            excerpt: editingArticle.excerpt,
            content: editingArticle.content,
            category: editingArticle.category,
            tags: editingArticle.tags,
            featured_image: editingArticle.featured_image,
            status: editingArticle.status === 'scheduled' ? 'draft' : editingArticle.status as 'draft' | 'published' | 'archived',
            featured: editingArticle.is_featured,
            author_id: editingArticle.author,
            views: editingArticle.views,
          } : undefined}
        />
      )}
    </div>
  );
};

export default Articles;