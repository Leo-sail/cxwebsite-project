/**
 * 教师详情页面
 */
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../services/queryClient';
import { teacherApi, courseApi } from '../services/api';
import { SEO, LoadingSpinner } from '../components';
import { useResponsive, useResponsiveValue, useResponsiveFontSize } from '../hooks/useResponsive';
import type { Course } from '../types';

/**
 * 教师详情页面组件
 */
const TeacherDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'courses' | 'achievements'>('profile');

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
    xs: '2rem',
    sm: '3rem',
    md: '4rem',
    lg: '5rem'
  });
  
  const gridGap = useResponsiveValue({
    xs: '1rem',
    sm: '1.5rem',
    md: '2rem',
    lg: '2rem'
  });
  
  // 响应式字体大小配置
  const heroTitleSize = useResponsiveFontSize({
    xs: '1.875rem',
    sm: '2.25rem',
    md: '3rem',
    lg: '3.75rem'
  });
  
  const heroSubtitleSize = useResponsiveFontSize({
    xs: '1rem',
    sm: '1.125rem',
    md: '1.25rem',
    lg: '1.5rem'
  });
  
  // 响应式组件尺寸配置
  const cardPadding = useResponsiveValue({
    xs: '1rem',
    sm: '1.25rem',
    md: '1.5rem',
    lg: '1.5rem'
  });
  
  const imageHeight = useResponsiveValue({
    xs: '12rem',
    sm: '14rem',
    md: '16rem',
    lg: '20rem'
  });
  
  const buttonPadding = useResponsiveValue({
    xs: '0.75rem 1.5rem',
    sm: '0.875rem 1.75rem',
    md: '1rem 2rem',
    lg: '1rem 2rem'
  });
  
  const iconSize = useResponsiveValue({
    xs: '1rem',
    sm: '1.125rem',
    md: '1.25rem',
    lg: '1.5rem'
  });

  // 获取教师详情
  const { data: teacher, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.TEACHER(id!),
    queryFn: () => teacherApi.getById(id!),
    enabled: !!id,
  });

  // 获取教师的课程
  const { data: allCourses } = useQuery({
    queryKey: QUERY_KEYS.COURSES,
    queryFn: () => courseApi.getAll(),
    enabled: !!id,
  });

  // 暂时显示所有课程，因为数据库中courses表没有teacher_id字段
  const teacherCourses = allCourses || [];

  /**
   * 处理课程点击
   */
  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  /**
   * 处理咨询
   */
  const handleConsult = () => {
    // 这里应该跳转到咨询页面或打开咨询弹窗
    console.log('咨询教师:', teacher?.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">教师信息不存在</h2>
          <p className="text-gray-600 mb-6">您访问的教师信息可能已被删除或不存在</p>
          <button
            onClick={() => navigate('/teachers')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回师资列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
          title={`${teacher.name} - 师资介绍 - 考研教育平台`}
          description={teacher.description || `${teacher.name}老师的详细介绍，专业的考研培训讲师。`}
          keywords={`${teacher.name},考研老师,考研培训,师资介绍`}
        />

      <div className="min-h-screen bg-gray-50">
        {/* 教师头部信息 */}
        <section 
          className="bg-gradient-to-r from-primary-50 to-primary-100 border-b" 
          style={{ padding: `${sectionPadding} 0` }}
        >
          <div 
            className="max-w-7xl mx-auto" 
            style={{ padding: `0 ${containerPadding}` }}
          >
            {/* 面包屑导航 */}
            <nav className={`mb-8 ${responsive.isMobile ? 'mb-6' : ''}`}>
              <ol className={`flex items-center space-x-2 text-sm text-gray-500 ${responsive.isMobile ? 'flex-wrap gap-1' : ''}`}>
                <li>
                  <button onClick={() => navigate('/')} className="hover:text-primary-600">
                    首页
                  </button>
                </li>
                <li>/</li>
                <li>
                  <button onClick={() => navigate('/teachers')} className="hover:text-primary-600">
                    师资团队
                  </button>
                </li>
                <li>/</li>
                <li className="text-gray-900">{teacher.name}</li>
              </ol>
            </nav>

            <div 
              className={`grid grid-cols-1 ${responsive.isDesktop ? 'lg:grid-cols-3' : ''}`} 
              style={{ gap: gridGap }}
            >
              {/* 教师基本信息 */}
              <div className={responsive.isDesktop ? 'lg:col-span-2' : ''}>
                <div className={`flex items-start ${responsive.isMobile ? 'flex-col space-y-4' : 'space-x-6'}`}>
                  {/* 教师头像 */}
                  <div className={`flex-shrink-0 ${responsive.isMobile ? 'self-center' : ''}`}>
                    {teacher.image_url && teacher.image_url.trim() !== '' ? (
                      <img
                        src={teacher.image_url}
                        alt={teacher.name}
                        className="rounded-full object-cover border-4 border-white shadow-lg"
                        style={{ 
                          width: imageHeight, 
                          height: imageHeight 
                        }}
                      />
                    ) : (
                      <div 
                        className="rounded-full bg-gray-300 border-4 border-white shadow-lg flex items-center justify-center"
                        style={{ 
                          width: imageHeight, 
                          height: imageHeight 
                        }}
                      >
                        <svg 
                          className="text-gray-400" 
                          style={{ width: iconSize, height: iconSize }} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* 教师信息 */}
                  <div className="flex-1">
                    <div className={`flex items-start justify-between ${responsive.isMobile ? 'mb-3' : 'mb-4'}`}>
                      <div>
                        <h1 
                          className="font-bold text-gray-900 mb-2"
                          style={{ fontSize: heroTitleSize }}
                        >
                          {teacher.name}
                        </h1>
                      </div>
                    </div>

                    {/* 教师统计 */}
                    <div 
                      className={`grid ${responsive.isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'} mb-6`}
                      style={{ gap: gridGap }}
                    >
                      <div className="text-center">
                        <div 
                          className="font-bold text-primary-600"
                          style={{ fontSize: heroSubtitleSize }}
                        >
                          5+
                        </div>
                        <div className="text-sm text-gray-600">教学经验</div>
                      </div>
                      <div className="text-center">
                        <div 
                          className="font-bold text-primary-600"
                          style={{ fontSize: heroSubtitleSize }}
                        >
                          5.0
                        </div>
                        <div className="text-sm text-gray-600">好评率</div>
                      </div>
                      {teacherCourses && (
                        <div className={`text-center ${responsive.isMobile ? 'col-span-2' : ''}`}>
                          <div 
                            className="font-bold text-primary-600"
                            style={{ fontSize: heroSubtitleSize }}
                          >
                            {teacherCourses.length}
                          </div>
                          <div className="text-sm text-gray-600">开设课程</div>
                        </div>
                      )}
                    </div>

                    {/* 教师简介 */}
                    {teacher.description && (
                      <div className="prose max-w-none">
                        <p className="text-gray-700 leading-relaxed">{teacher.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 联系卡片 */}
              <div className={responsive.isDesktop ? 'lg:col-span-1' : ''}>
                <div 
                  className={`bg-white rounded-lg shadow-md ${responsive.isDesktop ? 'sticky top-6' : ''}`}
                  style={{ padding: cardPadding }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">联系老师</h3>
                  
                  {/* 联系信息 */}
                  <div className="space-y-3 mb-6">
                    <div className="text-sm text-gray-600">
                      如需联系老师，请通过平台客服咨询。
                    </div>
                  </div>

                  {/* 咨询按钮 */}
                  <button
                    onClick={handleConsult}
                    className="w-full bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors mb-4"
                    style={{ padding: buttonPadding }}
                  >
                    在线咨询
                  </button>

                  {/* 教师特色 */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center text-gray-600">
                      <svg 
                        className="text-green-500 mr-2" 
                        style={{ width: iconSize, height: iconSize }} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>专业答疑解惑</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg 
                        className="text-green-500 mr-2" 
                        style={{ width: iconSize, height: iconSize }} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>个性化指导</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg 
                        className="text-green-500 mr-2" 
                        style={{ width: iconSize, height: iconSize }} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>学习规划建议</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg 
                        className="text-green-500 mr-2" 
                        style={{ width: iconSize, height: iconSize }} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>考试技巧分享</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 教师详细内容 */}
        <section style={{ padding: `${sectionPadding} 0` }}>
          <div 
            className="max-w-7xl mx-auto" 
            style={{ padding: `0 ${containerPadding}` }}
          >
            <div 
              className={`grid grid-cols-1 ${responsive.isDesktop ? 'lg:grid-cols-3' : ''}`} 
              style={{ gap: gridGap }}
            >
              {/* 主要内容区域 */}
              <div className={responsive.isDesktop ? 'lg:col-span-2' : ''}>
                {/* 标签页导航 */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className={`flex ${responsive.isMobile ? 'flex-wrap gap-2' : 'space-x-8'}`}>
                    {[
                      { key: 'profile', label: '个人简介' },
                      { key: 'courses', label: '开设课程' },
                      { key: 'achievements', label: '教学成果' }
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as 'profile' | 'courses' | 'achievements')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.key
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } ${responsive.isMobile ? 'flex-1 text-center' : ''}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* 标签页内容 */}
                <div 
                  className="bg-white rounded-lg shadow-sm" 
                  style={{ padding: cardPadding }}
                >
                  {activeTab === 'profile' && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">个人简介</h3>
                      <div className="prose max-w-none">
                        <p className="text-gray-700 leading-relaxed mb-4">
                          {teacher.description || '暂无个人简介信息。'}
                        </p>
                        
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">教育背景</h4>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          <li>985高校硕士研究生毕业</li>
                          <li>专业学科排名前10%</li>
                          <li>获得多项学术奖励</li>
                          <li>发表多篇学术论文</li>
                        </ul>

                        <h4 className="text-lg font-semibold text-gray-900 mb-3 mt-6">教学理念</h4>
                        <p className="text-gray-700 leading-relaxed">
                          秉承"因材施教，循序渐进"的教学理念，注重培养学生的学习兴趣和自主学习能力。
                          通过系统化的知识梳理和个性化的指导，帮助每一位学员实现学习目标。
                        </p>

                        <h4 className="text-lg font-semibold text-gray-900 mb-3 mt-6">教学特色</h4>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          <li>深入浅出的讲解方式，让复杂知识变得简单易懂</li>
                          <li>丰富的实战经验，结合真题进行针对性训练</li>
                          <li>个性化的学习方案，根据学员基础制定专属计划</li>
                          <li>及时的答疑反馈，确保学员问题得到快速解决</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === 'courses' && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">开设课程</h3>
                      {teacherCourses && teacherCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {teacherCourses.map((course: Course) => (
                            <div
                              key={course.id}
                              onClick={() => handleCourseClick(course.id)}
                              className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start space-x-4">
                                {course.image_url ? (
                                  <img
                                    src={course.image_url}
                                    alt={course.name}
                                    className="w-16 h-16 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                                    <svg className="h-8 w-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-lg font-semibold text-gray-900 mb-1">{course.name}</h4>
                                  <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">{course.category}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <p className="text-gray-500">暂无开设课程</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'achievements' && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">教学成果</h3>
                      <div className="space-y-6">
                        {/* 成果统计 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600 mb-1">95%</div>
                            <div className="text-sm text-blue-800">学员通过率</div>
                          </div>
                          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600 mb-1">4.9</div>
                            <div className="text-sm text-green-800">平均评分</div>
                          </div>
                          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600 mb-1">5000+</div>
                            <div className="text-sm text-purple-800">培养学员</div>
                          </div>
                        </div>

                        {/* 获奖荣誉 */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">获奖荣誉</h4>
                          <div className="space-y-3">
                            {[
                              { year: '2023', award: '优秀教师奖', organization: '教育部门' },
                              { year: '2022', award: '教学创新奖', organization: '培训机构' },
                              { year: '2021', award: '学员满意度第一名', organization: '内部评选' },
                              { year: '2020', award: '教学质量优秀奖', organization: '行业协会' }
                            ].map((achievement, index) => (
                              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex-shrink-0">
                                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">{achievement.award}</div>
                                  <div className="text-sm text-gray-500">{achievement.organization} · {achievement.year}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 学员反馈 */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">学员反馈</h4>
                          <div className="space-y-4">
                            {[
                              {
                                student: '张同学',
                                school: '清华大学',
                                feedback: '老师的教学方法很独特，让我在短时间内掌握了重点知识，成功考上了理想的学校！'
                              },
                              {
                                student: '李同学',
                                school: '北京大学',
                                feedback: '感谢老师的耐心指导，不仅提高了我的成绩，更重要的是培养了我的学习兴趣。'
                              },
                              {
                                student: '王同学',
                                school: '复旦大学',
                                feedback: '老师的课程内容丰富，讲解清晰，是我考研路上最重要的引路人。'
                              }
                            ].map((feedback, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                      <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className="font-medium text-gray-900">{feedback.student}</span>
                                      <span className="text-sm text-primary-600">考入 {feedback.school}</span>
                                    </div>
                                    <p className="text-gray-700 text-sm">{feedback.feedback}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 侧边栏 */}
              <div className={responsive.isDesktop ? 'lg:col-span-1' : ''}>
                {/* 其他优秀教师推荐 */}
                <div 
                  className="bg-white rounded-lg shadow-sm" 
                  style={{ padding: cardPadding }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">其他优秀教师</h3>
                  <div className="space-y-4">
                    {/* 模拟其他教师数据 */}
                    {[
                      { id: 1, name: '李教授', subject: '考研数学', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
                      { id: 2, name: '王老师', subject: '考研英语', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
                      { id: 3, name: '陈博士', subject: '考研政治', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }
                    ].map((otherTeacher) => (
                      <div key={otherTeacher.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
                        <img
                          src={otherTeacher.avatar}
                          alt={otherTeacher.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900">{otherTeacher.name}</h4>
                          <p className="text-sm text-gray-500">{otherTeacher.subject}</p>
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

export default TeacherDetailPage;