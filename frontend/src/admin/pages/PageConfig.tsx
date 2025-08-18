import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  GlobeAltIcon,
  PhotoIcon,
  DocumentTextIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../utils';
import DataTable, { type Column } from '../../components/DataTable';
import { PageConfigForm } from '../components';
// import { useTheme } from '../../hooks/useTheme';
import { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import PreviewWindow from '../components/PreviewWindow';
import { PageConfigService } from '../../services/PageConfigService';
// import type { PageConfig as SupabasePageConfig } from '../../services/PageConfigService';



/**
 * 页面配置管理页面
 */
/**
 * 组件内部使用的页面配置接口
 */
interface PageConfig extends Record<string, unknown> {
  id: string;
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
      content: {
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
      };
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
  created_at: string;
  updated_at: string;
}

const PageConfig: React.FC = () => {
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext?.theme === 'dark';
  const theme = themeContext?.theme;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPageType, setSelectedPageType] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingConfig, setEditingConfig] = useState<PageConfig | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('http://localhost:3000');
  const [pageConfigs, setPageConfigs] = useState<PageConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 加载页面配置数据
   */
  const loadPageConfigs = async () => {
    try {
      setLoading(true);
      setError(null);
      const configs = await PageConfigService.getPageConfigs();
      // 转换数据格式以匹配组件期望的类型
      const formattedConfigs: PageConfig[] = configs.map(config => ({
        id: config.id,
        page_name: config.page_name,
        page_key: config.page_key || '',
        title: config.title || '',
        description: config.description || '',
        keywords: config.keywords ? config.keywords.split(',').map(k => k.trim()) : [],
        config_data: config.config_data || {},
        status: config.is_active ? 'active' as const : 'inactive' as const,
        created_at: config.created_at || '',
        updated_at: config.updated_at || ''
      }));
      setPageConfigs(formattedConfigs);
    } catch (err) {
      console.error('加载页面配置失败:', err);
      setError('加载页面配置失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadPageConfigs();
  }, []);

  // 模拟页面配置数据（作为备用数据）
  // const mockPageConfigs: PageConfig[] = [
  //   {
  //     id: '1',
  //     page_name: '首页',
  //     page_key: 'home',
  //     title: '考研教育平台 - 专业的考研辅导服务',
  //     description: '提供专业的考研辅导服务，包括数学、英语、政治等科目的在线课程和学习资源。',
  //     keywords: ['考研', '在线教育', '考研辅导', '数学', '英语', '政治'],
  //     config_data: {
  //       hero_section: {
  //         title: '专业考研辅导，助您圆梦名校',
  //         subtitle: '汇聚名师资源，提供个性化学习方案',
  //         background_image: '/images/hero-bg.jpg',
  //         cta_text: '立即开始学习',
  //         cta_link: '/courses',
  //       },
  //       sections: [
  //         {
  //           id: 'features',
  //           type: 'text',
  //           title: '平台特色',
  //           content: {
  //             items: [
  //               { title: '名师授课', description: '汇聚知名高校教授和考研名师' },
  //               { title: '个性化辅导', description: '根据学员基础制定专属学习计划' },
  //               { title: '全程跟踪', description: '学习进度实时监控，及时调整方案' },
  //             ],
  //           },
  //           order: 1,
  //           visible: true,
  //         },
  //       ],
  //       seo: {
  //         meta_title: '考研教育平台 - 专业的考研辅导服务',
  //         meta_description: '提供专业的考研辅导服务，包括数学、英语、政治等科目的在线课程和学习资源。',
  //         og_image: '/images/og-home.jpg',
  //       },
  //       layout: {
  //         sidebar_enabled: false,
  //         breadcrumb_enabled: false,
  //         comments_enabled: false,
  //       },
  //     },
  //     status: 'active',
  //     created_at: '2024-01-10',
  //     updated_at: '2024-01-20',
  //   },
  //   {
  //     id: '2',
  //     page_name: '关于我们',
  //     page_key: 'about',
  //     title: '关于我们 - 考研教育平台',
  //     description: '了解我们的教育理念、师资团队和发展历程，为考研学子提供最优质的教育服务。',
  //     keywords: ['关于我们', '教育理念', '师资团队', '发展历程'],
  //     config_data: {
  //       hero_section: {
  //         title: '关于我们',
  //         subtitle: '致力于为考研学子提供最优质的教育服务',
  //         background_image: '/images/about-bg.jpg',
  //       },
  //       sections: [
  //         {
  //           id: 'company-intro',
  //           type: 'text',
  //           title: '公司简介',
  //           content: {
  //             text: '我们是一家专注于考研教育的在线平台...',
  //           },
  //           order: 1,
  //           visible: true,
  //         },
  //         {
  //           id: 'team',
  //           type: 'gallery',
  //           title: '师资团队',
  //           content: {
  //             images: [
  //               { url: '/images/teacher1.jpg', caption: '张教授 - 数学系' },
  //               { url: '/images/teacher2.jpg', caption: '李老师 - 英语系' },
  //             ],
  //           },
  //           order: 2,
  //           visible: true,
  //         },
  //       ],
  //       seo: {
  //         meta_title: '关于我们 - 考研教育平台',
  //         meta_description: '了解我们的教育理念、师资团队和发展历程，为考研学子提供最优质的教育服务。',
  //       },
  //       layout: {
  //         sidebar_enabled: true,
  //         breadcrumb_enabled: true,
  //         comments_enabled: false,
  //       },
  //     },
  //     status: 'active',
  //     created_at: '2024-01-12',
  //     updated_at: '2024-01-18',
  //   },
  //   {
  //     id: '3',
  //     page_name: '联系我们',
  //     page_key: 'contact',
  //     title: '联系我们 - 考研教育平台',
  //     description: '联系我们获取更多信息，我们的专业团队随时为您提供帮助和支持。',
  //     keywords: ['联系我们', '客服', '咨询', '支持'],
  //     config_data: {
  //       hero_section: {
  //         title: '联系我们',
  //         subtitle: '我们随时为您提供帮助和支持',
  //       },
  //       sections: [
  //         {
  //           id: 'contact-info',
  //           type: 'text',
  //           title: '联系信息',
  //           content: {
  //             phone: '400-123-4567',
  //             email: 'contact@example.com',
  //             address: '北京市海淀区中关村大街1号',
  //             hours: '周一至周日 9:00-21:00',
  //           },
  //           order: 1,
  //           visible: true,
  //         },
  //       ],
  //       seo: {
  //         meta_title: '联系我们 - 考研教育平台',
  //         meta_description: '联系我们获取更多信息，我们的专业团队随时为您提供帮助和支持。',
  //       },
  //       layout: {
  //         sidebar_enabled: false,
  //         breadcrumb_enabled: true,
  //         comments_enabled: false,
  //       },
  //     },
  //     status: 'active',
  //     created_at: '2024-01-15',
  //     updated_at: '2024-01-22',
  //   },
  // ];

  // 页面类型选项
  const pageTypes = ['all', '首页', '关于我们', '联系我们', '课程页面', '教师页面', '案例页面', '文章页面'];
  
  // 状态选项
  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'active', label: '启用' },
    { value: 'inactive', label: '禁用' },
  ];

  // 状态映射
  const statusMap = {
    active: '启用',
    inactive: '禁用',
  };

  // 状态颜色映射
  const getStatusColor = (status: PageConfig['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * 过滤页面配置数据
   */
  const filteredPageConfigs = pageConfigs.filter((config) => {
    const matchesSearch = config.page_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         config.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         config.page_key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || config.status === selectedStatus;
    const matchesPageType = selectedPageType === 'all' || config.page_name === selectedPageType;
    
    return matchesSearch && matchesStatus && matchesPageType;
  });

  /**
   * 处理新增页面配置
   */
  const handleAddPageConfig = () => {
    setFormMode('create');
    setEditingConfig(null);
    setShowForm(true);
  };

  /**
   * 处理编辑页面配置
   */
  const handleEditPageConfig = (configId: string) => {
    const config = pageConfigs.find(c => c.id === configId);
    if (config) {
      setFormMode('edit');
      setEditingConfig(config);
      setShowForm(true);
    }
  };

  /**
   * 处理删除页面配置
   */
  const handleDeletePageConfig = async (configId: string) => {
    try {
      const confirmed = window.confirm('确定要删除这个页面配置吗？');
      if (!confirmed) return;
      
      await PageConfigService.deletePageConfig(configId);
      await loadPageConfigs(); // 重新加载数据
    } catch (err) {
      console.error('删除页面配置失败:', err);
      setError('删除页面配置失败，请稍后重试');
    }
  };

  /**
   * 处理查看页面配置详情
   */
  const handleViewPageConfig = (configId: string) => {
    console.log('查看页面配置:', configId);
    // TODO: 实现查看页面配置详情逻辑
  };

  /**
   * 处理预览页面
   */
  const handlePreviewPage = (pageKey: string) => {
    console.log('预览页面:', pageKey);
    setPreviewUrl(`http://localhost:3000/${pageKey}`);
    setShowPreview(true);
  };

  /**
   * 处理表单提交成功
   */
  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingConfig(null);
    await loadPageConfigs(); // 重新加载页面配置列表
  };

  /**
   * 处理表单取消
   */
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingConfig(null);
  };

  // 表格列配置
  const columns: Column<PageConfig>[] = [
    {
      key: 'page_info',
      title: '页面信息',
      render: (_: unknown, record: PageConfig) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{record.page_name}</div>
          <div className="text-sm text-gray-500">/{record.page_key}</div>
          <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">{record.title}</div>
        </div>
      ),
    },
    {
      key: 'seo_info',
      title: 'SEO信息',
      render: (_: unknown, record: PageConfig) => (
        <div className="max-w-xs">
          <div className="text-sm text-gray-900 truncate">{record.description}</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {record.keywords.slice(0, 3).map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
              >
                {keyword}
              </span>
            ))}
            {record.keywords.length > 3 && (
              <span className="text-xs text-gray-500">+{record.keywords.length - 3}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'sections_count',
      title: '内容区块',
      render: (_: unknown, record: PageConfig) => (
        <div className="text-sm text-gray-900">
          {record.config_data.sections?.length || 0} 个区块
        </div>
      ),
    },
    {
      key: 'layout_features',
      title: '布局特性',
      render: (_: unknown, record: PageConfig) => (
        <div className="flex flex-wrap gap-1">
          {record.config_data.layout?.sidebar_enabled && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              侧边栏
            </span>
          )}
          {record.config_data.layout?.breadcrumb_enabled && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              面包屑
            </span>
          )}
          {record.config_data.layout?.comments_enabled && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
              评论
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      title: '状态',
      render: (_: unknown, record: PageConfig) => (
        <span className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          getStatusColor(record.status)
        )}>
          {statusMap[record.status]}
        </span>
      ),
    },
    {
      key: 'updated_at',
      title: '更新时间',
      render: (_: unknown, record: PageConfig) => (
        <div className="text-sm text-gray-500">
          {record.updated_at}
        </div>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      render: (_: unknown, record: PageConfig) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePreviewPage(record.page_key)}
            className="text-green-600 hover:text-green-900"
            title="预览页面"
          >
            <GlobeAltIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleViewPageConfig(record.id)}
            className="text-blue-600 hover:text-blue-900"
            title="查看详情"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEditPageConfig(record.id)}
            className="text-indigo-600 hover:text-indigo-900"
            title="编辑"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeletePageConfig(record.id)}
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
      <div className={`p-6 rounded-xl transition-colors duration-200 ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600'
          : 'bg-gradient-to-r from-green-50 to-teal-50 border border-green-100'
      }`}>
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className={`text-3xl font-bold flex items-center ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <GlobeAltIcon className="w-8 h-8 mr-3 text-green-500" />
              页面配置
            </h1>
            <p className={`mt-2 text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              管理网站各页面的配置信息，包括SEO设置、布局配置和内容区块
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={handleAddPageConfig}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 hover:scale-105"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              新增页面配置
            </button>
          </div>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className={`shadow rounded-xl transition-colors duration-200 ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
      }`}>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* 搜索框 */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className={`h-5 w-5 ${
                  isDark ? 'text-gray-400' : 'text-gray-400'
                }`} aria-hidden="true" />
              </div>
              <input
                type="text"
                placeholder="搜索页面名称、标题或路径..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 border rounded-lg leading-5 transition-colors duration-200 ${
                  isDark
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-green-500 focus:border-green-500'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-green-500 focus:border-green-500'
                } focus:outline-none focus:ring-1 sm:text-sm`}
              />
            </div>

            {/* 页面类型筛选 */}
            <div>
              <select
                value={selectedPageType}
                onChange={(e) => setSelectedPageType(e.target.value)}
                className={`block w-full px-3 py-2 border rounded-lg leading-5 transition-colors duration-200 ${
                  isDark
                    ? 'border-gray-600 bg-gray-700 text-white focus:ring-green-500 focus:border-green-500'
                    : 'border-gray-300 bg-white text-gray-900 focus:ring-green-500 focus:border-green-500'
                } focus:outline-none focus:ring-1 sm:text-sm`}
              >
                <option value="all">全部页面</option>
                {pageTypes.slice(1).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* 状态筛选 */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={`block w-full px-3 py-2 border rounded-lg leading-5 transition-colors duration-200 ${
                  isDark
                    ? 'border-gray-600 bg-gray-700 text-white focus:ring-green-500 focus:border-green-500'
                    : 'border-gray-300 bg-white text-gray-900 focus:ring-green-500 focus:border-green-500'
                } focus:outline-none focus:ring-1 sm:text-sm`}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 页面配置列表 */}
      <div className={`shadow rounded-xl transition-colors duration-200 ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
      }`}>
        <div className="px-4 py-5 sm:p-6">
          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                  <button
                    onClick={loadPageConfigs}
                    className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                  >
                    重试
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 加载状态 */}
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <p className={`mt-4 text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>加载中...</p>
            </div>
          ) : (
            <DataTable<PageConfig>
              data={filteredPageConfigs}
              columns={columns}
              empty={
                <div className={`text-center py-16 rounded-xl ${
                  isDark
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-gray-100'
                }`}>
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mb-6">
                    <DocumentTextIcon className="h-12 w-12 text-white" />
                  </div>
                  <h3 className={`text-lg font-medium mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>暂无页面配置数据</h3>
                  <p className={`text-sm mb-8 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    开始创建您的第一个页面配置，构建精彩内容
                  </p>
                </div>
              }
            />
          )}
        </div>
      </div>

      {/* 页面配置表单 */}
      {showForm && (
        <PageConfigForm
          mode={formMode}
          config={editingConfig || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {/* 统计信息 */}
      <div className={`shadow rounded-xl transition-colors duration-200 ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
      }`}>
        <div className="px-4 py-5 sm:p-6">
          <h3 className={`text-lg leading-6 font-medium mb-4 flex items-center ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            <SparklesIcon className="w-5 h-5 mr-2 text-green-500" />
            配置统计
          </h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            <div className={`overflow-hidden shadow-lg rounded-xl transition-all duration-200 hover:scale-105 ${
              isDark
                ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/50 border border-blue-700'
                : 'bg-gradient-to-br from-blue-50 to-blue-100'
            }`}>
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Cog6ToothIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className={`text-sm font-medium truncate ${
                        isDark ? 'text-blue-300' : 'text-blue-600'
                      }`}>总页面数</dt>
                      <dd className={`text-2xl font-bold ${
                        isDark ? 'text-white' : 'text-blue-900'
                      }`}>{pageConfigs.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className={`overflow-hidden shadow-lg rounded-xl transition-all duration-200 hover:scale-105 ${
              isDark
                ? 'bg-gradient-to-br from-green-900/50 to-green-800/50 border border-green-700'
                : 'bg-gradient-to-br from-green-50 to-green-100'
            }`}>
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <GlobeAltIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className={`text-sm font-medium truncate ${
                        isDark ? 'text-green-300' : 'text-green-600'
                      }`}>启用页面</dt>
                      <dd className={`text-2xl font-bold ${
                        isDark ? 'text-white' : 'text-green-900'
                      }`}>
                        {pageConfigs.filter(c => c.status === 'active').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className={`overflow-hidden shadow-lg rounded-xl transition-all duration-200 hover:scale-105 ${
              isDark
                ? 'bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border border-yellow-700'
                : 'bg-gradient-to-br from-yellow-50 to-yellow-100'
            }`}>
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <DocumentTextIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className={`text-sm font-medium truncate ${
                        isDark ? 'text-yellow-300' : 'text-yellow-600'
                      }`}>内容区块</dt>
                      <dd className={`text-2xl font-bold ${
                        isDark ? 'text-white' : 'text-yellow-900'
                      }`}>
                        {pageConfigs.reduce((sum, config) => sum + (config.config_data.sections?.length || 0), 0)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className={`overflow-hidden shadow-lg rounded-xl transition-all duration-200 hover:scale-105 ${
              isDark
                ? 'bg-gradient-to-br from-purple-900/50 to-purple-800/50 border border-purple-700'
                : 'bg-gradient-to-br from-purple-50 to-purple-100'
            }`}>
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                      <PhotoIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className={`text-sm font-medium truncate ${
                        isDark ? 'text-purple-300' : 'text-purple-600'
                      }`}>SEO优化</dt>
                      <dd className={`text-2xl font-bold ${
                        isDark ? 'text-white' : 'text-purple-900'
                      }`}>
                        {pageConfigs.filter(c => c.config_data.seo?.meta_title).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 实时预览窗口 */}
      <PreviewWindow 
        previewUrl={previewUrl}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
};

export default PageConfig;