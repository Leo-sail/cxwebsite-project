/**
 * 主题管理页面
 * 提供主题的CRUD操作和实时预览功能
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  SwatchIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  PaintBrushIcon,
} from '@heroicons/react/24/outline';
// import { useTheme } from '../../hooks/useTheme';
import { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import { SEO } from '../../components';
import { themeService, type ThemeConfiguration } from '../../services/themeService';
import type { ThemeConfig, ThemeConfigInsert, ThemeConfigUpdate, Json } from '../../types/database';
import { cn } from '../../utils';
import PreviewWindow from '../components/PreviewWindow';

/**
 * 主题表单数据类型
 */
interface ThemeFormData {
  theme_name: string;
  description: string;
  config_data: ThemeConfiguration;
  is_active: boolean;
}

/**
 * 主题管理页面组件
 */
const ThemeManagement: React.FC = () => {
  // const { currentTheme } = useTheme();
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext?.theme === 'dark';
  
  // 状态管理
  const [themes, setThemes] = useState<ThemeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTheme, setEditingTheme] = useState<ThemeConfig | null>(null);
  const [formData, setFormData] = useState<ThemeFormData>({
    theme_name: '',
    description: '',
    config_data: getDefaultThemeConfig(),
    is_active: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [, setPreviewTheme] = useState<string | null>(null);

  /**
   * 获取默认主题配置
   */
  function getDefaultThemeConfig(): ThemeConfiguration {
    return {
      id: 'default',
      colors: {
        primary: '#3B82F6',
        secondary: '#6B7280',
        accent: '#F59E0B',
        background: '#FFFFFF',
        text: '#111827',
        border: '#E5E7EB',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fonts: {
        primary: 'Inter, sans-serif',
        secondary: 'Georgia, serif',
        sizes: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
        },
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        full: '9999px',
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
    };
  }

  /**
   * 加载主题列表
   */
  const loadThemes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await themeService.getAllThemes();
      setThemes(data);
    } catch (error: unknown) {
      console.error('加载主题失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 组件挂载时加载数据
   */
  useEffect(() => {
    loadThemes();
  }, [loadThemes]);

  /**
   * 过滤主题列表
   */
  const filteredThemes = themes.filter(theme =>
    theme.theme_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    theme.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * 处理新增主题
   */
  const handleAddTheme = () => {
    setEditingTheme(null);
    setFormData({
      theme_name: '',
      description: '',
      config_data: getDefaultThemeConfig(),
      is_active: false,
    });
    setShowForm(true);
  };

  /**
   * 处理编辑主题
   */
  const handleEditTheme = (theme: ThemeConfig) => {
    setEditingTheme(theme);
    setFormData({
      theme_name: theme.theme_name,
      description: theme.description || '',
      config_data: theme.config_data as unknown as ThemeConfiguration,
      is_active: theme.is_active ?? false,
    });
    setShowForm(true);
  };

  /**
   * 处理删除主题
   */
  const handleDeleteTheme = async (themeId: string) => {
    if (!confirm('确定要删除这个主题吗？此操作不可撤销。')) {
      return;
    }

    try {
      await themeService.deleteTheme(themeId);
      await loadThemes();
    } catch (error) {
      console.error('删除主题失败:', error);
      alert('删除主题失败，请重试');
    }
  };

  /**
   * 处理激活主题
   */
  const handleActivateTheme = async (themeId: string) => {
    try {
      await themeService.switchTheme(themeId);
      await loadThemes();
    } catch (error) {
      console.error('激活主题失败:', error);
      alert('激活主题失败，请重试');
    }
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.theme_name.trim()) {
      alert('请输入主题名称');
      return;
    }

    try {
      setSubmitting(true);
      
      if (editingTheme) {
        // 更新主题
        const updateData: ThemeConfigUpdate = {
          theme_name: formData.theme_name,
          description: formData.description,
          config_data: formData.config_data as unknown as Json,
          is_active: formData.is_active,
        };
        await themeService.updateTheme(editingTheme.id, updateData);
      } else {
        // 创建新主题
        const createData: ThemeConfigInsert = {
          theme_name: formData.theme_name,
          description: formData.description,
          config_data: formData.config_data as unknown as Json,
          is_active: formData.is_active,
        };
        await themeService.createTheme(createData);
      }
      
      setShowForm(false);
      await loadThemes();
    } catch (error) {
      console.error('保存主题失败:', error);
      alert('保存主题失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 处理预览主题
   */
  const handlePreviewTheme = (theme: ThemeConfig) => {
    setPreviewTheme(theme.id);
    // 这里可以实现实时预览功能
    // 例如：在新窗口中打开前台页面并应用该主题
    window.open('/', '_blank');
  };



  /**
   * 渲染主题表单
   */
  const renderThemeForm = () => {
    if (!showForm) return null;
    
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {editingTheme ? '编辑主题' : '新增主题'}
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  主题名称 *
                </label>
                <input
                  type="text"
                  value={formData.theme_name}
                  onChange={(e) => setFormData({ ...formData, theme_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入主题名称"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  主题描述
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入主题描述"
                />
              </div>
            </div>
            
            {/* 颜色配置 */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">颜色配置</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(formData.config_data.colors).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {key === 'primary' ? '主色' :
                       key === 'secondary' ? '辅助色' :
                       key === 'accent' ? '强调色' :
                       key === 'background' ? '背景色' :
                       key === 'text' ? '文字色' :
                       key === 'border' ? '边框色' :
                       key === 'success' ? '成功色' :
                       key === 'warning' ? '警告色' :
                       key === 'error' ? '错误色' : key}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => setFormData({
                          ...formData,
                          config_data: {
                            ...formData.config_data,
                            colors: {
                              ...formData.config_data.colors,
                              [key]: e.target.value,
                            },
                          },
                        })}
                        className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setFormData({
                          ...formData,
                          config_data: {
                            ...formData.config_data,
                            colors: {
                              ...formData.config_data.colors,
                              [key]: e.target.value,
                            },
                          },
                        })}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 字体配置 */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">字体配置</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    主字体
                  </label>
                  <input
                    type="text"
                    value={formData.config_data.fonts.primary}
                    onChange={(e) => setFormData({
                      ...formData,
                      config_data: {
                        ...formData.config_data,
                        fonts: {
                          ...formData.config_data.fonts,
                          primary: e.target.value,
                        },
                      },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例如：Inter, sans-serif"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    辅助字体
                  </label>
                  <input
                    type="text"
                    value={formData.config_data.fonts.secondary}
                    onChange={(e) => setFormData({
                      ...formData,
                      config_data: {
                        ...formData.config_data,
                        fonts: {
                          ...formData.config_data.fonts,
                          secondary: e.target.value,
                        },
                      },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例如：Georgia, serif"
                  />
                </div>
              </div>
            </div>
            
            {/* 激活状态 */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                设为活动主题
              </label>
            </div>
            
            {/* 提交按钮 */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '保存中...' : (editingTheme ? '更新主题' : '创建主题')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <>
      <SEO
        title="主题管理 - 后台管理"
        description="管理网站主题，支持主题的创建、编辑、删除和实时预览"
      />
      
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className={`p-6 rounded-xl transition-colors duration-200 ${
          isDark
            ? 'bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600'
            : 'bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold flex items-center ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                <PaintBrushIcon className="w-8 h-8 mr-3 text-purple-500" />
                主题管理
              </h1>
              <p className={`mt-2 text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                管理网站主题，支持主题的创建、编辑、删除和实时预览
              </p>
            </div>
            
            <button
              onClick={handleAddTheme}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 hover:scale-105"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              新增主题
            </button>
          </div>
        </div>
        
        {/* 搜索和筛选 */}
        <div className={`p-4 rounded-lg shadow ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
        }`}>
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className={`h-5 w-5 ${
                  isDark ? 'text-gray-400' : 'text-gray-400'
                }`} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 transition-colors duration-200 ${
                  isDark
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500'
                    : 'border-gray-300 bg-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'
                } focus:outline-none focus:placeholder-gray-400 focus:ring-1`}
                placeholder="搜索主题名称或描述..."
              />
            </div>
            
            <div className={`flex items-center text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <AdjustmentsHorizontalIcon className="w-5 h-5 mr-1" />
              共 {filteredThemes.length} 个主题
            </div>
          </div>
        </div>
        
        {/* 主题列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">加载中...</span>
          </div>
        ) : filteredThemes.length === 0 ? (
          <div className={`text-center py-16 rounded-xl ${
            isDark
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white border border-gray-100'
          }`}>
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mb-6">
              <SwatchIcon className="h-12 w-12 text-white" />
            </div>
            <h3 className={`text-lg font-medium mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>暂无主题</h3>
            <p className={`text-sm mb-8 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {searchTerm ? '没有找到匹配的主题' : '开始创建您的第一个主题，让网站更加个性化'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddTheme}
                className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-sm font-medium rounded-xl text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 hover:scale-105"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                创建第一个主题
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredThemes.map((themeItem) => (
              <div
                key={themeItem.id}
                className={cn(
                  'overflow-hidden shadow-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl',
                  themeItem.is_active ? 'ring-2 ring-purple-500' : '',
                  isDark
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-gray-100'
                )}
              >
                {/* 主题预览区域 */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-lg font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{themeItem.theme_name}</h3>
                    {themeItem.is_active && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400">
                        <CheckIcon className="w-3 h-3 mr-1" />
                        当前主题
                      </span>
                    )}
                  </div>
                  
                  {themeItem.description && (
                    <p className={`text-sm mb-3 ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>{themeItem.description}</p>
                  )}
                  
                  {/* 颜色预览 */}
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>颜色：</span>
                    <div className="flex space-x-1">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: (themeItem.config_data as { colors?: { primary?: string } })?.colors?.primary }}
                        title="主色"
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: (themeItem.config_data as { colors?: { secondary?: string } })?.colors?.secondary }}
                        title="辅助色"
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: (themeItem.config_data as { colors?: { accent?: string } })?.colors?.accent }}
                        title="强调色"
                      />
                    </div>
                  </div>
                  
                  {/* 字体预览 */}
                  <div className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    字体：{(themeItem.config_data as { fonts?: { primary?: string } })?.fonts?.primary}
                  </div>
                </div>
                
                {/* 操作按钮 */}
                <div className={`p-4 flex items-center justify-between ${
                  isDark ? 'bg-gray-750' : 'bg-gray-50'
                }`}>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePreviewTheme(themeItem)}
                      className={`inline-flex items-center px-3 py-1.5 border shadow-sm text-xs font-medium rounded transition-all duration-200 hover:scale-105 ${
                        isDark
                          ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      预览
                    </button>
                    
                    <button
                      onClick={() => handleEditTheme(themeItem)}
                      className={`inline-flex items-center px-3 py-1.5 border shadow-sm text-xs font-medium rounded transition-all duration-200 hover:scale-105 ${
                        isDark
                          ? 'border-blue-600 text-blue-400 bg-blue-900/50 hover:bg-blue-800/50'
                          : 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                      <PencilIcon className="w-4 h-4 mr-1" />
                      编辑
                    </button>
                    
                    {!themeItem.is_active && (
                      <button
                        onClick={() => handleDeleteTheme(themeItem.id)}
                        className={`inline-flex items-center px-3 py-1.5 border shadow-sm text-xs font-medium rounded transition-all duration-200 hover:scale-105 ${
                          isDark
                            ? 'border-red-600 text-red-400 bg-red-900/50 hover:bg-red-800/50'
                            : 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                      >
                        <TrashIcon className="w-4 h-4 mr-1" />
                        删除
                      </button>
                    )}
                  </div>
                  
                  {!themeItem.is_active && (
                    <button
                      onClick={() => handleActivateTheme(themeItem.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 hover:scale-105"
                    >
                      <CheckIcon className="w-4 h-4 mr-1" />
                      激活
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* 主题表单模态框 */}
        {renderThemeForm()}
        
        {/* 实时预览窗口 */}
        <PreviewWindow />
      </div>
    </>
  );
};

export default ThemeManagement;