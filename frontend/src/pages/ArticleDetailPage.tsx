/**
 * 文章详情页面
 */
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../services/queryClient';
import { articleApi } from '../services/api';
import { SEO, LoadingSpinner } from '../components';
import { useResponsive, useResponsiveValue, useResponsiveFontSize } from '../hooks/useResponsive';

import {
  CalendarIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  TagIcon,
  UserIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

/**
 * 文章详情页面组件
 */
const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  // 响应式配置
  const responsive = useResponsive();
  
  // 响应式间距配置
  const containerPadding = useResponsiveValue({
    xs: '1rem',
    sm: '1.5rem',
    md: '2rem',
    lg: '2rem'
  });
  
  const sectionPadding = useResponsiveValue({
    xs: '1.5rem',
    sm: '2rem',
    md: '2rem',
    lg: '2rem'
  });
  
  const gridGap = useResponsiveValue({
    xs: '1rem',
    sm: '1.5rem',
    md: '2rem',
    lg: '2rem'
  });
  
  // 响应式字体大小配置
  const titleSize = useResponsiveFontSize({
    xs: '1.875rem',
    sm: '2.25rem',
    md: '3rem',
    lg: '3rem'
  });
  
  const subtitleSize = useResponsiveFontSize({
    xs: '1rem',
    sm: '1.125rem',
    md: '1.25rem',
    lg: '1.25rem'
  });
  
  // 响应式组件尺寸配置
  const cardPadding = useResponsiveValue({
    xs: '1rem',
    sm: '1.25rem',
    md: '1.5rem',
    lg: '2rem'
  });
  
  const imageHeight = useResponsiveValue({
    xs: '10rem',
    sm: '12rem',
    md: '12rem',
    lg: '12rem'
  });
  
  const iconSize = useResponsiveValue({
    xs: '1rem',
    sm: '1rem',
    md: '1rem',
    lg: '1rem'
  });
  
  const buttonPadding = useResponsiveValue({
    xs: '0.75rem 1.5rem',
    sm: '0.875rem 1.75rem',
    md: '1rem 2rem',
    lg: '1rem 2rem'
  });

  // 获取文章详情
  const { data: article, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.ARTICLE(id!),
    queryFn: () => articleApi.getById(id!),
    enabled: !!id,
  });

  // 获取相关文章
  const { data: relatedArticles } = useQuery({
    queryKey: QUERY_KEYS.ARTICLES,
    queryFn: () => articleApi.getAll(),
    enabled: !!id,
  });

  /**
   * 处理点赞
   */
  const handleLike = () => {
    setIsLiked(!isLiked);
    // 这里应该调用API更新点赞状态
  };

  /**
   * 处理分享
   */
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title || '',
        text: article?.summary || '',
        url: window.location.href,
      });
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      console.log('链接已复制到剪贴板');
    }
  };

  /**
   * 格式化日期
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">文章未找到</h2>
          <p className="text-gray-600 mb-6">抱歉，您访问的文章不存在或已被删除。</p>
          <button
            onClick={() => navigate('/articles')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回文章列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={article.title}
        description={article.summary || ''}
        keywords={article.category || '考研资讯'}
      />

      <div className="min-h-screen bg-gray-50">
        {/* 面包屑导航 */}
        <div className="bg-white border-b">
          <div 
            className="max-w-7xl mx-auto py-4"
            style={{ padding: `1rem ${containerPadding}` }}
          >
            <nav className={`flex items-center text-sm text-gray-600 ${
              responsive.isMobile ? 'flex-wrap gap-1' : 'space-x-2'
            }`}>
              <Link to="/" className="hover:text-blue-600">首页</Link>
              <ChevronRightIcon style={{ width: iconSize, height: iconSize }} />
              <Link to="/articles" className="hover:text-blue-600">考研资讯</Link>
              <ChevronRightIcon style={{ width: iconSize, height: iconSize }} />
              <span className={`text-gray-900 ${
                responsive.isMobile ? 'truncate max-w-[200px]' : ''
              }`}>{article.title}</span>
            </nav>
          </div>
        </div>

        <div 
          className="max-w-4xl mx-auto py-8"
          style={{ padding: `2rem ${containerPadding}` }}
        >
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* 文章头部 */}
            <div 
              className="border-b"
              style={{ padding: sectionPadding }}
            >
              <div className="mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {article.category}
                </span>
              </div>
              
              <h1 
                className="font-bold text-gray-900 mb-4"
                style={{ fontSize: titleSize }}
              >
                {article.title}
              </h1>
              
              <p 
                className="text-gray-600 mb-6"
                style={{ fontSize: subtitleSize }}
              >
                {article.summary}
              </p>
              
              {/* 文章元信息 */}
              <div className={`flex items-center ${
                responsive.isMobile ? 'flex-col space-y-4' : 'justify-between'
              }`}>
                <div className={`flex items-center text-sm text-gray-500 ${
                  responsive.isMobile ? 'flex-wrap gap-4' : 'space-x-6'
                }`}>
                  <div className="flex items-center space-x-1">
                    <UserIcon style={{ width: iconSize, height: iconSize }} />
                    <span>管理员</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CalendarIcon style={{ width: iconSize, height: iconSize }} />
                    <span>{article.created_at ? formatDate(article.created_at) : '2024-01-01'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <EyeIcon style={{ width: iconSize, height: iconSize }} />
                    <span>128 阅读</span>
                  </div>
                </div>
                
                {/* 操作按钮 */}
                <div className={`flex items-center ${
                  responsive.isMobile ? 'gap-2' : 'space-x-4'
                }`}>
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-1 rounded-full transition-colors ${
                      isLiked
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    style={{ padding: responsive.isMobile ? '0.5rem 1rem' : '0.25rem 0.75rem' }}
                  >
                    {isLiked ? (
                      <HeartSolidIcon style={{ width: iconSize, height: iconSize }} />
                    ) : (
                      <HeartIcon style={{ width: iconSize, height: iconSize }} />
                    )}
                    <span>{(isLiked ? 1 : 0)}</span>
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    style={{ padding: responsive.isMobile ? '0.5rem 1rem' : '0.25rem 0.75rem' }}
                  >
                    <ShareIcon style={{ width: iconSize, height: iconSize }} />
                    <span>分享</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* 文章内容 */}
            <div style={{ padding: sectionPadding }}>
              <div 
                className={`prose max-w-none ${
                  responsive.isMobile ? 'prose-sm' : 'prose-lg'
                }`}
                dangerouslySetInnerHTML={{ __html: article.content || '' }}
              />
            </div>
            
            {/* 文章标签 */}
            <div 
              className="border-t bg-gray-50"
              style={{ padding: cardPadding }}
            >
              <div className="flex items-center space-x-2">
                <TagIcon style={{ width: iconSize, height: iconSize }} className="text-gray-500" />
                <span className="text-sm text-gray-500">标签：</span>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                    #{article.category || '考研资讯'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 相关文章 */}
          {relatedArticles && relatedArticles.length > 0 && (
            <div className="mt-12">
              <h2 
                className="font-bold text-gray-900 mb-6"
                style={{ fontSize: titleSize }}
              >相关文章</h2>
              <div 
                className={`grid gap-6 ${
                  responsive.isDesktop ? 'grid-cols-3' : 
                  responsive.isTablet ? 'grid-cols-2' : 'grid-cols-1'
                }`}
                style={{ gap: gridGap }}
              >
                {relatedArticles.slice(0, 3).map((relatedArticle: { id: string; title: string; image_url: string | null; category: string | null; summary: string | null; created_at: string | null; views?: number | null }) => (
                  <Link
                    key={relatedArticle.id}
                    to={`/articles/${relatedArticle.id}`}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {relatedArticle.image_url && (
                      <img
                        src={relatedArticle.image_url}
                        alt={relatedArticle.title}
                        className="w-full object-cover"
                        style={{ height: imageHeight }}
                      />
                    )}
                    <div style={{ padding: cardPadding }}>
                      <div className="mb-2">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {relatedArticle.category || '未分类'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {relatedArticle.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {relatedArticle.summary || '暂无摘要'}
                      </p>
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        <span>{formatDate(relatedArticle.created_at || '')}</span>
                        <span>{relatedArticle.views || 0} 阅读</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* 返回按钮 */}
          <div 
            className="mt-8 text-center"
            style={{ paddingLeft: containerPadding, paddingRight: containerPadding }}
          >
            <button
              onClick={() => navigate('/articles')}
              className="bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              style={{ padding: buttonPadding }}
            >
              返回文章列表
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArticleDetailPage;