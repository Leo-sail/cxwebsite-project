/**
 * 学生案例详情页面
 */
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../services/queryClient';
import { studentCaseApi } from '../services/api';
import { SEO, LoadingSpinner } from '../components';
import { useResponsive, useResponsiveValue, useResponsiveFontSize } from '../hooks/useResponsive';

// StudentCase type is imported via API response

/**
 * 学生案例详情页面组件
 */
const StudentCaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'story' | 'process' | 'advice'>('story');

  // 获取学生案例详情
  const { data: studentCase, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.STUDENT_CASE(id!),
    queryFn: () => studentCaseApi.getById(id!),
    enabled: !!id,
  });

  // 响应式配置
  const responsive = useResponsive();
  // const theme = useTheme();
  
  // 响应式间距配置
  const containerPadding = useResponsiveValue({
    xs: 'px-4',
    sm: 'px-4',
    md: 'px-6', 
    lg: 'px-6',
    xl: 'px-8',
    xxl: 'px-8'
  });
  
  const sectionPadding = useResponsiveValue({
    xs: 'p-4',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-6',
    xl: 'p-8',
    xxl: 'p-8'
  });
  
  const gridGap = useResponsiveValue({
    xs: 'gap-4',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-6',
    xl: 'gap-8',
    xxl: 'gap-8'
  });
  
  // 响应式字体大小配置
  const titleSize = useResponsiveFontSize({
    xs: 'text-xl',
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    xxl: 'text-3xl'
  });
  
  const subtitleSize = useResponsiveFontSize({
    xs: 'text-base',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-lg',
    xl: 'text-xl',
    xxl: 'text-xl'
  });
  
  const textSize = useResponsiveFontSize({
    xs: 'text-sm',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-base',
    xl: 'text-lg',
    xxl: 'text-lg'
  });
  
  // 响应式组件尺寸配置
  const cardPadding = useResponsiveValue({
    xs: 'p-4',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-5',
    xl: 'p-6',
    xxl: 'p-6'
  });
  
  const imageSize = useResponsiveValue({
    xs: 'w-16 h-16',
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
    xxl: 'w-24 h-24'
  });
  
  const iconSize = useResponsiveValue({
    xs: 'w-4 h-4',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
    xxl: 'w-6 h-6'
  });
  
  const buttonPadding = useResponsiveValue({
    xs: 'px-3 py-2',
    sm: 'px-3 py-2',
    md: 'px-4 py-2',
    lg: 'px-4 py-2',
    xl: 'px-6 py-3',
    xxl: 'px-6 py-3'
  });

  /**
   * 处理分享
   */
  const handleShare = () => {
    // 这里应该实现分享功能
    if (navigator.share) {
      navigator.share({
        title: `${studentCase?.name}的考研成功故事`,
        text: studentCase?.testimonial || '',
        url: window.location.href,
      });
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      console.log('链接已复制到剪贴板');
    }
  };

  /**
   * 处理咨询
   */
  const handleConsult = () => {
    // 这里应该跳转到咨询页面
    navigate('/contact');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !studentCase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">案例不存在</h2>
          <p className="text-gray-600 mb-6">您访问的学生案例可能已被删除或不存在</p>
          <button
            onClick={() => navigate('/student-cases')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回案例列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${studentCase.name}的考研成功故事 - 学生案例 - 考研教育平台`}
        description={studentCase.testimonial || `${studentCase.name}成功考入${studentCase.admitted_school}的励志故事。`}
        keywords={`${studentCase.name},${studentCase.admitted_school},考研成功案例,学员故事`}
      />

      <div className="min-h-screen bg-gray-50">
        {/* 案例头部信息 */}
        <section className="bg-white border-b">
          <div className={`max-w-7xl mx-auto ${containerPadding} ${sectionPadding}`}>
            {/* 面包屑导航 */}
            <nav className={`flex items-center ${responsive.isMobile ? 'space-x-1' : 'space-x-2'} ${textSize} text-gray-500 mb-6`}>
              <button onClick={() => navigate('/')} className="hover:text-primary-600">
                首页
              </button>
              <span>/</span>
              <button onClick={() => navigate('/student-cases')} className="hover:text-primary-600">
                学生案例
              </button>
              <span>/</span>
              <span className="text-gray-900">{studentCase.name}的故事</span>
            </nav>

            <div className={`grid grid-cols-1 ${responsive.isDesktop ? 'lg:grid-cols-3' : ''} ${gridGap}`}>
              {/* 案例基本信息 */}
              <div className={responsive.isDesktop ? 'lg:col-span-2' : ''}>
                <div className={`flex ${responsive.isMobile ? 'flex-col items-center text-center space-y-4' : 'items-start space-x-6'}`}>
                  {/* 学生头像 */}
                  <div className="flex-shrink-0">
                    {studentCase.image_url && studentCase.image_url.trim() !== '' ? (
                      <img
                        src={studentCase.image_url}
                        alt={studentCase.name}
                        className={`${imageSize} rounded-full object-cover border-4 border-white shadow-lg`}
                      />
                    ) : (
                      <div className={`${imageSize} rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center border-4 border-white shadow-lg`}>
                        <svg className={`${iconSize} text-primary-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* 学生信息 */}
                  <div className="flex-1">
                    <div className={`flex ${responsive.isMobile ? 'flex-col space-y-4' : 'items-start justify-between'} mb-4`}>
                      <div>
                        <h1 className={`${titleSize} font-bold text-gray-900 mb-2`}>{studentCase.name}</h1>
                        <div className={`flex ${responsive.isMobile ? 'flex-col space-y-2' : 'items-center space-x-4'} mb-3`}>
                          <span className={`${subtitleSize} text-primary-600 font-semibold`}>
                            考试分数: {studentCase.exam_score}分
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {studentCase.exam_score && (
                            <span className={`inline-block bg-yellow-100 text-yellow-800 ${textSize} font-semibold px-3 py-1 rounded-full`}>
                              总分 {studentCase.exam_score}分
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={handleShare}
                        className={`${buttonPadding} text-gray-400 hover:text-primary-600 transition-colors ${responsive.isMobile ? 'self-center' : ''}`}
                      >
                        <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                      </button>
                    </div>

                    {/* 案例摘要 */}
                    {studentCase.testimonial && (
                      <div className={`prose max-w-none ${responsive.isMobile ? 'prose-sm' : 'prose-lg'}`}>
                        <p className={`text-gray-700 leading-relaxed ${subtitleSize}`}>{studentCase.testimonial}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 成绩统计 */}
                {studentCase.exam_score && (
                  <div className={`mt-8 grid ${responsive.isMobile ? 'grid-cols-2' : responsive.isTablet ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-4'} ${gridGap}`}>
                    <div className={`bg-gradient-to-r from-red-50 to-red-100 rounded-lg ${cardPadding} text-center`}>
                      <div className={`${subtitleSize} font-bold text-red-600`}>{studentCase.exam_score}</div>
                      <div className={`${textSize} text-red-800`}>总分</div>
                    </div>
                    <div className={`bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg ${cardPadding} text-center`}>
                      <div className={`${subtitleSize} font-bold text-blue-600`}>第1名</div>
                      <div className={`${textSize} text-blue-800`}>专业排名</div>
                    </div>
                    <div className={`bg-gradient-to-r from-green-50 to-green-100 rounded-lg ${cardPadding} text-center`}>
                      <div className={`${subtitleSize} font-bold text-green-600`}>12个月</div>
                      <div className={`${textSize} text-green-800`}>备考时间</div>
                    </div>
                    <div className={`bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg ${cardPadding} text-center`}>
                      <div className={`${subtitleSize} font-bold text-purple-600`}>985</div>
                      <div className={`${textSize} text-purple-800`}>目标院校</div>
                    </div>
                  </div>
                )}
              </div>

              {/* 咨询卡片 */}
              <div className="lg:col-span-1">
                <div className={`bg-white rounded-lg shadow-md ${cardPadding} ${responsive.isDesktop ? 'sticky top-6' : ''}`}>
                  <h3 className={`${subtitleSize} font-semibold text-gray-900 mb-4`}>想要同样的成功？</h3>
                  
                  <div className={`space-y-4 mb-6`}>
                    <div className={`flex items-center ${textSize} text-gray-600`}>
                      <svg className={`${iconSize} text-green-500 mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>专业的学习规划</span>
                    </div>
                    <div className={`flex items-center ${textSize} text-gray-600`}>
                      <svg className={`${iconSize} text-green-500 mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>一对一指导服务</span>
                    </div>
                    <div className={`flex items-center ${textSize} text-gray-600`}>
                      <svg className={`${iconSize} text-green-500 mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>全程跟踪辅导</span>
                    </div>
                    <div className={`flex items-center ${textSize} text-gray-600`}>
                      <svg className={`${iconSize} text-green-500 mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>成功经验分享</span>
                    </div>
                  </div>

                  {/* 咨询按钮 */}
                  <button
                    onClick={handleConsult}
                    className={`w-full bg-blue-600 text-white ${buttonPadding} rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors mb-4`}
                  >
                    免费咨询
                  </button>

                  <p className={`text-xs text-gray-500 text-center`}>
                    专业顾问将为您制定个性化学习方案
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 案例详细内容 */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 主要内容区域 */}
              <div className="lg:col-span-2">
                {/* 标签页导航 */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className={`flex ${responsive.isMobile ? 'space-x-4' : 'space-x-8'} ${responsive.isMobile ? 'overflow-x-auto' : ''}`}>
                    {[
                      { key: 'story', label: '成功故事' },
                      { key: 'process', label: '备考历程' },
                      { key: 'advice', label: '经验分享' }
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as 'story' | 'process' | 'advice')}
                        className={`py-2 px-1 border-b-2 font-medium ${textSize} whitespace-nowrap ${
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
                <div className={`bg-white rounded-lg shadow-sm ${cardPadding}`}>
                  {activeTab === 'story' && (
                    <div>
                      <h3 className={`${titleSize} font-semibold text-gray-900 mb-4`}>成功故事</h3>
                      <div className={`prose max-w-none ${responsive.isMobile ? 'prose-sm' : 'prose-lg'}`}>
                        <p className={`text-gray-700 leading-relaxed mb-4 ${textSize}`}>
                          {studentCase.testimonial || '这是一个关于坚持与努力的故事。'}
                        </p>
                        
                        <h4 className={`${subtitleSize} font-semibold text-gray-900 mb-3`}>初心与目标</h4>
                        <p className={`text-gray-700 leading-relaxed mb-4 ${textSize}`}>
                          {studentCase.name}同学怀着对专业的热爱，
                          决定报考{studentCase.admitted_school}。虽然目标院校竞争激烈，但她从未放弃过自己的梦想。
                        </p>

                        <h4 className={`${subtitleSize} font-semibold text-gray-900 mb-3`}>选择我们的原因</h4>
                        <p className={`text-gray-700 leading-relaxed mb-4 ${textSize}`}>
                          在了解了我们的教学理念和成功案例后，{studentCase.name}选择了我们的培训课程。
                          专业的师资团队、系统的课程体系和个性化的指导方案，为她的考研之路提供了强有力的支持。
                        </p>

                        <h4 className={`${subtitleSize} font-semibold text-gray-900 mb-3`}>努力的过程</h4>
                        <p className={`text-gray-700 leading-relaxed mb-4 ${textSize}`}>
                          在备考期间，{studentCase.name}严格按照我们制定的学习计划执行，每天保持高强度的学习。
                          遇到困难时，我们的老师总是及时给予指导和鼓励，帮助她克服一个又一个难关。
                        </p>

                        <h4 className={`${subtitleSize} font-semibold text-gray-900 mb-3`}>收获的成果</h4>
                        <p className={`text-gray-700 leading-relaxed ${textSize}`}>
                          {studentCase.name}以{studentCase.exam_score}分的优异成绩
                          成功考入{studentCase.admitted_school}，实现了自己的梦想。
                          这不仅是她个人努力的结果，也是我们共同努力的成果。
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'process' && (
                    <div>
                      <h3 className={`${titleSize} font-semibold text-gray-900 mb-4`}>备考历程</h3>
                      <div className="space-y-6">
                        {/* 时间线 */}
                        <div className="relative">
                          {[
                            {
                              phase: '准备阶段',
                              time: '3-5月',
                              description: '确定目标院校和专业，制定学习计划，开始基础知识复习',
                              achievements: ['完成院校调研', '制定详细学习计划', '开始英语词汇积累']
                            },
                            {
                              phase: '基础阶段',
                              time: '6-8月',
                              description: '系统学习各科基础知识，建立完整的知识框架',
                              achievements: ['完成数学基础复习', '英语阅读能力提升', '专业课知识梳理']
                            },
                            {
                              phase: '强化阶段',
                              time: '9-11月',
                              description: '重点突破难点知识，大量练习真题，提升应试能力',
                              achievements: ['真题练习达标', '写作能力显著提升', '专业课深度理解']
                            },
                            {
                              phase: '冲刺阶段',
                              time: '12月-考试',
                              description: '查漏补缺，模拟考试，调整心态，准备应考',
                              achievements: ['模拟考试高分', '心态调整到位', '考试发挥出色']
                            }
                          ].map((stage, index) => (
                            <div key={index} className={`relative ${responsive.isMobile ? 'pb-6' : 'pb-8'}`}>
                              {index < 3 && (
                                <div className={`absolute ${responsive.isMobile ? 'left-3' : 'left-4'} top-8 w-0.5 h-full bg-gray-200`}></div>
                              )}
                              <div className={`flex items-start ${responsive.isMobile ? 'space-x-3' : 'space-x-4'}`}>
                                <div className="flex-shrink-0">
                                  <div className={`${responsive.isMobile ? 'w-6 h-6' : 'w-8 h-8'} bg-blue-600 rounded-full flex items-center justify-center`}>
                                    <span className={`text-white ${responsive.isMobile ? 'text-xs' : 'text-sm'} font-semibold`}>{index + 1}</span>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className={`flex ${responsive.isMobile ? 'flex-col space-y-1' : 'items-center space-x-2'} mb-2`}>
                                    <h4 className={`${subtitleSize} font-semibold text-gray-900`}>{stage.phase}</h4>
                                    <span className={`${textSize} text-primary-600 font-medium`}>{stage.time}</span>
                                  </div>
                                  <p className={`text-gray-700 mb-3 ${textSize}`}>{stage.description}</p>
                                  <div className="space-y-1">
                                    {stage.achievements.map((achievement, achievementIndex) => (
                                      <div key={achievementIndex} className={`flex items-center ${textSize} text-gray-600`}>
                                        <svg className={`${iconSize} text-green-500 mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{achievement}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'advice' && (
                    <div>
                      <h3 className={`${titleSize} font-semibold text-gray-900 mb-4`}>经验分享</h3>
                      <div className="space-y-6">
                        {/* 学习方法 */}
                        <div>
                          <h4 className={`${subtitleSize} font-semibold text-gray-900 mb-3`}>学习方法</h4>
                          <div className={`grid grid-cols-1 ${responsive.isDesktop ? 'md:grid-cols-2' : ''} ${gridGap}`}>
                            {[
                              {
                                title: '制定详细计划',
                                description: '每天、每周、每月都要有明确的学习目标和计划',
                                icon: '📅'
                              },
                              {
                                title: '注重基础知识',
                                description: '扎实的基础是高分的关键，不要急于求成',
                                icon: '📚'
                              },
                              {
                                title: '大量练习真题',
                                description: '真题是最好的练习材料，要反复练习和总结',
                                icon: '✍️'
                              },
                              {
                                title: '及时总结反思',
                                description: '每天都要总结学习成果，发现问题及时调整',
                                icon: '🤔'
                              }
                            ].map((method, index) => (
                              <div key={index} className={`bg-gray-50 rounded-lg ${cardPadding}`}>
                                <div className="flex items-start space-x-3">
                                  <span className={`${responsive.isMobile ? 'text-xl' : 'text-2xl'}`}>{method.icon}</span>
                                  <div>
                                    <h5 className={`font-semibold text-gray-900 mb-1 ${textSize}`}>{method.title}</h5>
                                    <p className={`${textSize} text-gray-600`}>{method.description}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 心态调整 */}
                        <div>
                          <h4 className={`${subtitleSize} font-semibold text-gray-900 mb-3`}>心态调整</h4>
                          <div className={`bg-blue-50 rounded-lg ${cardPadding}`}>
                            <div className="flex items-start space-x-3">
                              <svg className={`${iconSize} text-blue-600 mt-1`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              <div>
                                <h5 className={`font-semibold text-blue-900 mb-2 ${textSize}`}>保持积极心态</h5>
                                <p className={`text-blue-800 ${textSize} leading-relaxed`}>
                                  考研是一个长期的过程，会遇到很多困难和挫折。重要的是要保持积极的心态，
                                  相信自己的能力，坚持到底。每当感到疲惫时，想想自己的目标和梦想，
                                  这会给你继续前进的动力。
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 给学弟学妹的建议 */}
                        <div>
                          <h4 className={`${subtitleSize} font-semibold text-gray-900 mb-3`}>给学弟学妹的建议</h4>
                          <div className="space-y-3">
                            {[
                              '早做准备，不要等到最后才开始复习',
                              '选择适合自己的学习方法和节奏',
                              '找到好的老师和同伴，互相鼓励支持',
                              '保持身体健康，合理安排作息时间',
                              '相信自己，坚持到底，成功就在前方'
                            ].map((advice, index) => (
                              <div key={index} className="flex items-start space-x-3">
                                <span className={`flex-shrink-0 ${responsive.isMobile ? 'w-5 h-5' : 'w-6 h-6'} bg-primary-100 text-primary-600 rounded-full flex items-center justify-center ${responsive.isMobile ? 'text-xs' : 'text-sm'} font-semibold`}>
                                  {index + 1}
                                </span>
                                <p className={`text-gray-700 ${textSize}`}>{advice}</p>
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
              <div className="lg:col-span-1">
                {/* 其他成功案例推荐 */}
                <div className={`bg-white rounded-lg shadow-sm ${cardPadding}`}>
                  <h3 className={`${subtitleSize} font-semibold text-gray-900 mb-4`}>其他成功案例</h3>
                  <div className="space-y-4">
                    {/* 模拟其他案例数据 */}
                    {[
                      { id: 1, name: '李同学', school: '北京大学', major: '计算机科学', score: 398 },
                      { id: 2, name: '王同学', school: '清华大学', major: '电子工程', score: 405 },
                      { id: 3, name: '陈同学', school: '复旦大学', major: '金融学', score: 389 }
                    ].map((otherCase) => (
                      <div key={otherCase.id} className={`border border-gray-200 rounded-lg ${responsive.isMobile ? 'p-2' : 'p-3'} cursor-pointer hover:shadow-md transition-shadow`}>
                        <div className={`flex items-center justify-between ${responsive.isMobile ? 'mb-1' : 'mb-2'}`}>
                          <h4 className={`font-semibold text-gray-900 ${textSize}`}>{otherCase.name}</h4>
                          <span className={`${responsive.isMobile ? 'text-xs' : 'text-sm'} font-semibold text-primary-600`}>{otherCase.score}分</span>
                        </div>
                        <p className={`${responsive.isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>{otherCase.school} · {otherCase.major}</p>
                      </div>
                    ))}
                  </div>
                  <button className={`w-full mt-4 ${buttonPadding} bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors ${textSize} font-medium`}>
                    查看更多案例
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default StudentCaseDetailPage;