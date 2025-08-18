/**
 * 文章页面
 */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { QUERY_KEYS } from '../services/queryClient';
import { articleApi } from '../services/api';
import { SEO } from '../components';
import Pagination from '../components/Pagination';
import { AnimatedContainer } from '../components/animation/AnimatedContainer';
import { GradientBackground } from '../components/ui/GradientBackground';
import { SearchInput } from '../components/ui/SearchInput';
import {
  DocumentTextIcon,
  NewspaperIcon,
  FireIcon,
  ClockIcon,
  EyeIcon,
  UserIcon,
  TagIcon,
  SparklesIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import type { Article } from '../types';

/**
 * 文章页面组件
 */
const ArticlesPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const pageSize = 12;

  // 获取文章数据
  const { data: articlesData, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.ARTICLES,
    queryFn: () => articleApi.getAll(),
  });

  const articles = articlesData || [];
  const totalCount = articles.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  // 获取分类列表（用于筛选）
  const categories = Array.from(new Set(articles.map((article: Article) => article.category).filter(Boolean)));

  /**
   * 处理搜索
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  /**
   * 处理分类筛选
   */
  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  /**
   * 处理排序
   */
  const handleSortChange = (sort: 'latest' | 'popular') => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  /**
   * 重置筛选
   */
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('latest');
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">加载失败</h2>
          <p className="text-gray-600">请稍后重试</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="考研资讯 - 考研教育平台"
        description="最新的考研资讯、备考指南、学习方法和经验分享。助您掌握考研动态，提升备考效率。"
        keywords="考研资讯,备考指南,学习方法,考研经验,考研动态"
      />

      <div className="min-h-screen bg-purple-50">
        {/* 页面头部 */}
        <section className="relative overflow-hidden">
          {/* 多层背景增强视觉效果 */}
          <GradientBackground type="purple" variant="deep" direction="to-br" className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05),transparent_50%)]"></div>
          
          {/* 视觉分离装饰线 */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          
          <div className="relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <AnimatedContainer
                animation={{ type: 'fade-in', duration: 800 }}
                trigger="immediate"
                className="text-center"
              >
                {/* 内容分离容器 */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6 shadow-2xl border border-white/30">
                  <NewspaperIcon className="w-10 h-10 text-white drop-shadow-lg" />
                </div>
                <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-2xl">
                  考研资讯
                  <span className="block text-2xl font-normal text-white/90 mt-2 drop-shadow-lg">Knowledge Hub</span>
                </h1>
                <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
                  最新的考研动态、备考指南和学习方法，助您掌握考研资讯，提升备考效率
                </p>
                <div className="mt-8 flex items-center justify-center gap-8 text-white/90">
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                    <DocumentTextIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">专业资讯</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                    <FireIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">热门话题</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                    <SparklesIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">精选内容</span>
                  </div>
                </div>
              </AnimatedContainer>
            </div>
          </div>
        </section>

        {/* 搜索和筛选 */}
        <section className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AnimatedContainer
              animation={{ type: 'slide-in-up', duration: 600, delay: 200 }}
              trigger="immediate"
            >
              <div className="bg-gradient-to-r from-purple-100 to-blue-50 rounded-2xl p-6">
                <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                  {/* 搜索框 */}
                  <div className="flex-1 max-w-md">
                    <SearchInput
                       value={searchTerm}
                       onChange={setSearchTerm}
                       placeholder="搜索文章标题或内容..."
                       onSearch={(value) => {
                         setSearchTerm(value);
                         handleSearch({ preventDefault: () => {} } as React.FormEvent);
                       }}
                       className="w-full"
                     />
                  </div>

                  <div className="flex flex-wrap gap-4 items-center">
                    {/* 排序选择 */}
                    <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-2 shadow-sm">
                      <ClockIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">排序：</span>
                      <select
                        value={sortBy}
                        onChange={(e) => handleSortChange(e.target.value as 'latest' | 'popular')}
                        className="border-0 bg-transparent text-sm font-medium text-gray-700 focus:ring-0 focus:outline-none cursor-pointer"
                      >
                        <option value="latest">最新发布</option>
                        <option value="popular">热门文章</option>
                      </select>
                    </div>

                    {/* 分类筛选 */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleCategoryFilter('')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                          selectedCategory === ''
                            ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                            : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-sm'
                        }`}
                      >
                        <TagIcon className="w-4 h-4" />
                        全部分类
                      </button>
                      {categories.slice(0, 4).map((category) => (
                        <button
                          key={category as string}
                          onClick={() => handleCategoryFilter(category as string)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                            selectedCategory === category
                              ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                              : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-sm'
                          }`}
                        >
                          {category as string}
                        </button>
                      ))}
                    </div>

                    {/* 重置按钮 */}
                    {(searchTerm || selectedCategory || sortBy !== 'latest') && (
                      <button
                        onClick={resetFilters}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        重置筛选
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </AnimatedContainer>
          </div>
        </section>

        {/* 文章列表 */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <AnimatedContainer
                animation={{ type: 'fade-in', duration: 500 }}
                trigger="immediate"
              >
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100"></div>
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-lg font-medium text-gray-700">正在加载精彩内容</p>
                    <p className="text-sm text-gray-500 mt-1">请稍候片刻...</p>
                  </div>
                </div>
              </AnimatedContainer>
            ) : error ? (
              <AnimatedContainer
                animation={{ type: 'slide-in-up', duration: 500 }}
                trigger="immediate"
              >
                <div className="text-center py-16">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
                  <p className="text-gray-500 mb-4">网络连接异常，请检查网络后重试</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    重新加载
                  </button>
                </div>
              </AnimatedContainer>
            ) : articles.length === 0 ? (
              <AnimatedContainer
                animation={{ type: 'fade-in', duration: 500, delay: 200 }}
                trigger="immediate"
              >
                <div className="text-center py-16">
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无文章</h3>
                  <p className="text-gray-500 mb-4">当前筛选条件下没有找到相关文章</p>
                  {(searchTerm || selectedCategory) && (
                    <button
                      onClick={resetFilters}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      重置筛选条件
                    </button>
                  )}
                </div>
              </AnimatedContainer>
            ) : (
              <>
                {/* 结果统计 */}
                <AnimatedContainer
                  animation={{ type: 'slide-in-up', duration: 500, delay: 100 }}
                  trigger="immediate"
                >
                  <div className="mb-8">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-gray-900">
                              共找到 <span className="text-blue-600">{totalCount}</span> 篇文章
                            </p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {searchTerm && (
                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  <MagnifyingGlassIcon className="w-3 h-3 mr-1" />
                                  "{searchTerm}"
                                </span>
                              )}
                              {selectedCategory && (
                                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                  <TagIcon className="w-3 h-3 mr-1" />
                                  {selectedCategory}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {(searchTerm || selectedCategory) && (
                          <button
                            onClick={resetFilters}
                            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            清除筛选
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </AnimatedContainer>

                {/* 文章网格 */}
                <AnimatedContainer
                  animation={{ type: 'slide-in-up', duration: 600, delay: 200 }}
                  trigger="immediate"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article: Article, index: number) => (
                      <AnimatedContainer
                        key={article.id}
                        animation={{ 
                          type: 'slide-in-up', 
                          duration: 500, 
                          delay: 300 + (index % 6) * 100 
                        }}
                        trigger="immediate"
                      >
                        <ArticleCard article={article} />
                      </AnimatedContainer>
                    ))}
                  </div>
                </AnimatedContainer>

                {/* 分页 */}
                {totalPages > 1 && (
                  <AnimatedContainer
                    animation={{ type: 'slide-in-up', duration: 500, delay: 400 }}
                    trigger="immediate"
                  >
                    <div className="mt-12 flex justify-center">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  </AnimatedContainer>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

/**
 * 文章卡片组件
 */
interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  return (
    <Link
      to={`/articles/${article.id}`}
      className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-300 transform hover:-translate-y-2 hover:scale-[1.02] flex flex-col min-h-[480px] md:min-h-[520px] lg:min-h-[500px]"
    >
      {/* 文章封面 */}
      <div className="relative aspect-video bg-gradient-to-br from-purple-100 to-purple-200 overflow-hidden flex-shrink-0">
        {article.image_url && article.image_url.trim() !== '' ? (
          <>
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10" />
            <div className="relative z-10 text-center">
              <DocumentTextIcon className="w-12 h-12 text-blue-400 mx-auto mb-2" />
              <p className="text-xs text-blue-500 font-medium">精彩内容</p>
            </div>
            <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full" />
            <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/10 rounded-full" />
          </div>
        )}
        
        {/* 阅读时间标签 */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2 py-1 bg-black/50 text-white text-xs rounded-full backdrop-blur-sm">
            <ClockIcon className="w-3 h-3 mr-1" />
            5分钟
          </span>
        </div>
      </div>

      {/* 文章信息 */}
      <div className="flex-1 flex flex-col p-5">
        <div className="flex-1 flex flex-col justify-between space-y-3">
          {/* 顶部内容组 */}
          <div className="space-y-3">
            {/* 分类标签和状态 */}
            <div className="flex items-center justify-between">
              {article.category && (
                <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs font-semibold rounded-full">
                  <TagIcon className="w-3 h-3 mr-1" />
                  {article.category}
                </span>
              )}
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-600 font-medium">最新</span>
              </div>
            </div>

            {/* 标题 */}
            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-lg leading-tight min-h-[3.5rem]">
              {article.title}
            </h3>

            {/* 摘要 */}
            {article.summary && (
              <p className="text-gray-700 text-sm line-clamp-3 leading-relaxed font-medium min-h-[4.5rem]">
                {article.summary}
              </p>
            )}
          </div>

          {/* 底部内容组 */}
          <div className="space-y-3">
            {/* 文章元信息 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* 作者 */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
                    <UserIcon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-800">管理员</span>
                </div>

                {/* 阅读量 */}
                <div className="flex items-center gap-1">
                  <EyeIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-600 font-medium">128</span>
                </div>
              </div>
            </div>

            {/* 底部信息 */}
            <div className="flex items-center justify-between pt-3 border-t border-purple-200">
              <time className="text-xs text-gray-600 flex items-center gap-1 font-medium">
                <ClockIcon className="w-3 h-3" />
                {article.created_at ? new Date(article.created_at).toLocaleDateString('zh-CN') : '2024-01-01'}
              </time>
              <div className="flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
                <span className="text-xs font-semibold mr-1">阅读更多</span>
                <svg className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* 标签 */}
            <div className="mt-3">
              <div className="flex flex-wrap gap-1">
                <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md hover:bg-gray-200 transition-colors font-medium">
                  #{article.category || '考研资讯'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArticlesPage;