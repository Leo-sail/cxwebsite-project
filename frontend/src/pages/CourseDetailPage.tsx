/**
 * 课程详情页面
 */
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../services/queryClient';
import { courseApi } from '../services/api';
import { SEO, LoadingSpinner } from '../components';
import { useResponsive, useResponsiveValue, useResponsiveFontSize, useResponsiveSpacing } from '../hooks/useResponsive';
// Course type is imported via API response

/**
 * 课程详情页面组件
 */
const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'teacher' | 'reviews'>('overview');
  
  // 响应式配置
  const responsive = useResponsive();
  
  // 响应式变量
  const containerPadding = useResponsiveSpacing({ xs: 4, md: 6, lg: 8 });
  const sectionPadding = useResponsiveSpacing({ xs: 6, md: 8, lg: 12 });
  const gridGap = useResponsiveSpacing({ xs: 6, md: 8, lg: 8 });
  const heroTitleSize = useResponsiveFontSize({ xs: 'text-2xl', md: 'text-3xl', lg: 'text-4xl' });
  const heroSubtitleSize = useResponsiveFontSize({ xs: 'text-base', md: 'text-lg', lg: 'text-xl' });
  const cardPadding = useResponsiveSpacing({ xs: 4, md: 6, lg: 6 });
  const imageHeight = useResponsiveValue({ xs: 'h-40', md: 'h-48', lg: 'h-48' });
  const buttonPadding = useResponsiveSpacing({ xs: 2, md: 3, lg: 3 });
  const iconSize = useResponsiveValue({ xs: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' });

  // 获取课程详情
  const { data: course, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.COURSE(id!),
    queryFn: () => courseApi.getById(id!),
    enabled: !!id,
  });

  /**
   * 处理报名
   */
  const handleEnroll = () => {
    // 这里应该跳转到报名页面或打开报名弹窗
    console.log('报名课程:', course?.id);
  };

  /**
   * 处理收藏
   */
  const handleFavorite = () => {
    // 这里应该调用收藏API
    console.log('收藏课程:', course?.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">课程不存在</h2>
          <p className="text-gray-600 mb-6">您访问的课程可能已被删除或不存在</p>
          <button
            onClick={() => navigate('/courses')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回课程列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
          title={`${course.name} - 考研教育平台`}
        description={course.description || `${course.name}课程详情，专业的考研培训课程。`}
        keywords={`${course.name},考研课程,${course.category || '考研培训'},专业讲师`}
      />

      <div className="min-h-screen bg-gray-50">
        {/* 课程头部信息 */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto" style={{ paddingLeft: `${containerPadding}px`, paddingRight: `${containerPadding}px`, paddingTop: `${sectionPadding}px`, paddingBottom: `${sectionPadding}px` }}>
            {/* 面包屑导航 */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
              <button onClick={() => navigate('/')} className="hover:text-primary-600">
                首页
              </button>
              <span>/</span>
              <button onClick={() => navigate('/courses')} className="hover:text-primary-600">
                课程中心
              </button>
              <span>/</span>
              <span className="text-gray-900">{course.name}</span>
            </nav>

            <div className={`grid grid-cols-1 ${responsive.isDesktop ? 'lg:grid-cols-3' : ''}`} style={{ gap: `${gridGap}px` }}>
              {/* 课程基本信息 */}
              <div className="lg:col-span-2">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    {course.category && (
                      <span className="inline-block bg-primary-100 text-primary-800 text-sm font-semibold px-3 py-1 rounded-full mb-3">
                        {course.category}
                      </span>
                    )}
                    <h1 className={`${heroTitleSize} font-bold text-gray-900 mb-2`}>{course.name}</h1>
                    <p className={`${heroSubtitleSize} text-gray-600`}>{course.description}</p>
                  </div>
                  <button
                    onClick={handleFavorite}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>

                {/* 课程统计 */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
                  <div className="flex items-center text-gray-600 mb-2">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>专业讲师</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>40小时</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>中级</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <span>1000+人已报名</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div className="flex items-center mr-2">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-4 w-4 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span>4.8</span>
                  </div>
                </div>

                {/* 课程描述 */}
                {course.description && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">{course.description}</p>
                  </div>
                )}
              </div>

              {/* 课程封面和价格 */}
              <div className="lg:col-span-1">
                <div className={`bg-white rounded-lg shadow-md overflow-hidden ${responsive.isDesktop ? 'sticky top-6' : ''}`}>
                  {/* 课程封面 */}
                  <div className="aspect-w-16 aspect-h-9">
                    {course.image_url ? (
                      <img
                        src={course.image_url}
                        alt={course.name}
                        className={`w-full ${imageHeight} object-cover`}
                      />
                    ) : (
                      <div className={`w-full ${imageHeight} bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center`}>
                        <svg className={`${iconSize.replace('h-4 w-4', 'h-16 w-16').replace('h-5 w-5', 'h-16 w-16').replace('h-6 w-6', 'h-16 w-16')} text-primary-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: `${cardPadding}px` }}>
                    {/* 价格信息 */}
                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-primary-600">¥999</span>
                        {/* 原价显示已移除 */}
                      </div>
                      {/* 优惠信息已移除 */}
                    </div>

                    {/* 报名按钮 */}
                    <button
                      onClick={handleEnroll}
                      className="w-full bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors mb-4"
                      style={{ paddingTop: `${buttonPadding}px`, paddingBottom: `${buttonPadding}px`, paddingLeft: `${cardPadding}px`, paddingRight: `${cardPadding}px` }}
                    >
                      立即报名
                    </button>

                    {/* 课程特色 */}
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center text-gray-600">
                        <svg className={`${iconSize} text-green-500 mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>终身学习权限</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg className={`${iconSize} text-green-500 mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>专业导师答疑</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg className={`${iconSize} text-green-500 mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>配套学习资料</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg className={`${iconSize} text-green-500 mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>学习进度跟踪</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 课程详细内容 */}
        <section style={{ paddingTop: `${sectionPadding}px`, paddingBottom: `${sectionPadding}px` }}>
          <div className="max-w-7xl mx-auto" style={{ paddingLeft: `${containerPadding}px`, paddingRight: `${containerPadding}px` }}>
            <div className={`grid grid-cols-1 ${responsive.isDesktop ? 'lg:grid-cols-3' : ''}`} style={{ gap: `${gridGap}px` }}>
              {/* 主要内容区域 */}
              <div className="lg:col-span-2">
                {/* 标签页导航 */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className={`flex ${responsive.isMobile ? 'flex-wrap gap-2' : 'space-x-8'}`}>
                    {[
                      { key: 'overview', label: '课程概述' },
                      { key: 'curriculum', label: '课程大纲' },
                      { key: 'teacher', label: '师资介绍' },
                      { key: 'reviews', label: '学员评价' }
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as 'overview' | 'curriculum' | 'teacher' | 'reviews')}
                        className={`${responsive.isMobile ? 'flex-1 text-center' : ''} py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.key
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* 标签页内容 */}
                <div className="bg-white rounded-lg shadow-sm" style={{ padding: `${cardPadding}px` }}>
                  {activeTab === 'overview' && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">课程概述</h3>
                      <div className="prose max-w-none">
                        <p className="text-gray-700 leading-relaxed mb-4">
                          {course.description || '暂无课程概述信息。'}
                        </p>
                        
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">学习目标</h4>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          <li>掌握考研核心知识点和解题技巧</li>
                          <li>提升应试能力和答题速度</li>
                          <li>建立完整的知识体系</li>
                          <li>培养良好的学习习惯和方法</li>
                        </ul>

                        <h4 className="text-lg font-semibold text-gray-900 mb-3 mt-6">适合人群</h4>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          <li>准备考研的本科生</li>
                          <li>基础薄弱需要系统学习的学员</li>
                          <li>希望提高成绩的在职考生</li>
                          <li>需要专业指导的自学者</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === 'curriculum' && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">课程大纲</h3>
                      <div className="space-y-4">
                        {/* 模拟课程大纲数据 */}
                        {[
                          {
                            chapter: '第一章：基础知识',
                            lessons: ['1.1 基本概念', '1.2 核心理论', '1.3 实践应用']
                          },
                          {
                            chapter: '第二章：进阶内容',
                            lessons: ['2.1 高级技巧', '2.2 案例分析', '2.3 综合练习']
                          },
                          {
                            chapter: '第三章：冲刺复习',
                            lessons: ['3.1 重点回顾', '3.2 模拟测试', '3.3 考前指导']
                          }
                        ].map((chapter, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">{chapter.chapter}</h4>
                            <ul className="space-y-2">
                              {chapter.lessons.map((lesson, lessonIndex) => (
                                <li key={lessonIndex} className="flex items-center text-gray-700">
                                  <svg className="h-4 w-4 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-10V7a3 3 0 11-6 0V4h6zM4 20h16" />
                                  </svg>
                                  {lesson}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'teacher' && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">师资介绍</h3>
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <img
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80"
                            alt="专业讲师"
                            className="w-20 h-20 rounded-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">专业讲师</h4>
                          <p className="text-primary-600 font-medium mb-3">高级讲师 · 10年教学经验</p>
                          <div className="text-gray-700 space-y-2">
                            <p>• 985高校硕士研究生毕业</p>
                            <p>• 专业从事考研教学10年</p>
                            <p>• 累计培养学员超过5000人</p>
                            <p>• 多次获得优秀教师称号</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">学员评价</h3>
                      <div className="space-y-6">
                        {/* 模拟评价数据 */}
                        {[
                          {
                            name: '张同学',
                            rating: 5,
                            comment: '老师讲得很好，内容很实用，帮助我顺利考上了理想的学校！',
                            date: '2024-01-15'
                          },
                          {
                            name: '李同学',
                            rating: 5,
                            comment: '课程体系很完整，从基础到进阶都有涵盖，强烈推荐！',
                            date: '2024-01-10'
                          },
                          {
                            name: '王同学',
                            rating: 4,
                            comment: '老师很负责，答疑及时，学习效果不错。',
                            date: '2024-01-08'
                          }
                        ].map((review, index) => (
                          <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <span className="font-medium text-gray-900 mr-3">{review.name}</span>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                              </div>
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 侧边栏 */}
              <div className="lg:col-span-1">
                {/* 相关课程推荐 */}
                <div className="bg-white rounded-lg shadow-sm" style={{ padding: `${cardPadding}px` }}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">相关课程推荐</h3>
                  <div className="space-y-4">
                    {/* 模拟相关课程数据 */}
                    {[
                      { id: 1, title: '考研数学基础班', price: 1299, image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
                      { id: 2, title: '考研英语强化班', price: 999, image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
                      { id: 3, title: '考研政治冲刺班', price: 799, image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }
                    ].map((relatedCourse) => (
                      <div key={relatedCourse.id} className="flex space-x-3">
                        <img
                          src={relatedCourse.image}
                          alt={relatedCourse.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{relatedCourse.title}</h4>
                          <p className="text-sm text-primary-600 font-semibold">¥{relatedCourse.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default CourseDetailPage;