/**
 * 首页组件 - 使用新的主题系统和响应式Hook优化
 */
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  ArrowRightIcon, 
  UserGroupIcon, 
  TrophyIcon, 
  NewspaperIcon, 
  // CalendarIcon,
  // RocketLaunchIcon, 
  AcademicCapIcon
  // InformationCircleIcon 
} from '@heroicons/react/24/outline';
import { QUERY_KEYS } from '../services/queryClient';
import { courseApi, teacherApi, studentCaseApi, articleApi } from '../services/api';
import { AnimatedContainer } from '../components/animation/AnimatedContainer';

import { 
  useResponsive, 
  useResponsiveValue, 
  useResponsiveFontSize, 
  useResponsiveSpacing 
} from '../hooks/useResponsive';
import { TouchableButton, TouchableCard } from '../components/mobile';
// import { hapticFeedback } from '../utils/touchGestures';
import { cn } from '../utils';
import { TeacherAvatar } from '../components/ui/TeacherAvatar';
// import { useState } from 'react'; // 暂时注释，如需要可取消注释

/**
 * 首页组件 - 响应式优化版本
 */
const HomePage = () => {
  // 响应式Hook
  const responsive = useResponsive({ enableDebug: false, cacheKey: 'homepage' });
  
  // 响应式值配置
  const heroTitleSize = useResponsiveFontSize({
    xs: '2rem',    // text-4xl
    sm: '2.5rem',  // text-5xl
    md: '3rem',    // text-6xl
    lg: '3.5rem',  // text-7xl
    xl: '4rem'
  });
  
  const heroSubtitleSize = useResponsiveFontSize({
    xs: '1rem',     // text-base
    sm: '1.125rem', // text-lg
    md: '1.25rem',  // text-xl
    lg: '1.5rem'    // text-2xl
  });
  
  const sectionPadding = useResponsiveSpacing({
    xs: '3rem',  // py-12
    lg: '4rem'   // py-16
  });
  
  const cardColumns = useResponsiveValue({
    xs: 1,
    sm: 2,
    lg: 4
  });
  
  const caseColumns = useResponsiveValue({
    xs: 1,
    md: 2,
    lg: 3
  });
  
  // 获取热门课程
  const { data: allCourses = [] } = useQuery({
    queryKey: QUERY_KEYS.COURSES,
    queryFn: () => courseApi.getAll(),
  });
  const courses = allCourses.slice(0, cardColumns);

  // 获取优秀师资
  const { data: allTeachers = [] } = useQuery({
    queryKey: QUERY_KEYS.TEACHERS,
    queryFn: () => teacherApi.getAll(),
  });
  const teachers = allTeachers.slice(0, cardColumns);

  // 获取学员案例
  const { data: allStudentCases = [] } = useQuery({
    queryKey: QUERY_KEYS.STUDENT_CASES,
    queryFn: () => studentCaseApi.getAll(),
  });
  const studentCases = allStudentCases.slice(0, caseColumns);

  // 轮播状态管理和控制函数已移除

  // 获取最新文章
  const { data: allArticles = [] } = useQuery({
    queryKey: QUERY_KEYS.ARTICLES,
    queryFn: () => articleApi.getAll(),
  });
  const articles = allArticles.slice(0, caseColumns);

  // 创建响应式图片处理函数（不使用Hook）
  const getResponsiveImageSrc = (imageUrl: string) => {
    // 如果没有图片URL，返回默认占位图
    return imageUrl || 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=暂无图片';
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - 响应式优化 */}
      <section 
        className="relative bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden"
        style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedContainer
            animation={{
              type: "fade-in",
              duration: 800,
              delay: 200
            }}
            trigger="immediate"
          >
            <div className="text-center">
              <h1 
                className="font-bold text-white mb-6"
                style={{ fontSize: heroTitleSize }}
              >
                实现你的
                <span className="text-blue-200 ml-2">名校梦想</span>
              </h1>
              <p 
                className="text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed"
                style={{ fontSize: heroSubtitleSize }}
              >
                专业的考研培训机构，提供全方位的考研辅导服务，助你一次上岸
              </p>
              <div className={cn(
                "flex gap-4 justify-center",
                responsive.isMobile ? "flex-col" : "flex-row"
              )}>
                <TouchableButton
                  variant="primary"
                  size={responsive.isMobile ? "md" : "lg"}
                  hapticEnabled
                  onTap={() => {
                    window.location.href = '/courses';
                  }}
                  className="bg-white text-blue-600 hover:bg-blue-50 inline-flex items-center justify-center"
                >
                  查看课程
                </TouchableButton>
                <TouchableButton
                  variant="secondary"
                  size={responsive.isMobile ? "md" : "lg"}
                  hapticEnabled
                  onTap={() => {
                    window.location.href = '/contact';
                  }}
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 inline-flex items-center"
                >
                  免费咨询
                </TouchableButton>
              </div>
            </div>
          </AnimatedContainer>
        </div>
      </section>

      {/* 热门课程 - 响应式优化 */}
      <section 
        className="bg-gray-50"
        style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedContainer
            animation={{
              type: "fade-in",
              duration: 600
            }}
            trigger="scroll"
          >
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <AcademicCapIcon className={cn(
                  "text-blue-600 mr-3",
                  responsive.isMobile ? "h-6 w-6" : "h-8 w-8"
                )} />
                <h2 className={cn(
                  "font-bold text-gray-900",
                  responsive.isMobile ? "text-2xl" : "text-3xl"
                )}>热门课程</h2>
              </div>
              <p className={cn(
                "text-gray-600",
                responsive.isMobile ? "text-base" : "text-lg"
              )}>精心设计的课程体系，助你高效备考</p>
            </div>
          </AnimatedContainer>
          <div className={cn(
            "grid gap-6 mb-8",
            `grid-cols-${cardColumns}`
          )}>
            {courses.map((course, index) => {
              return (
                <AnimatedContainer
                  key={course.id}
                  animation={{
                    type: "slide-in-up",
                    duration: 500,
                    delay: index * 100
                  }}
                  trigger="scroll"
                  className="h-full"
                >
                  <TouchableCard
                    elevation="md"
                    padding="none"
                    rounded="lg"
                    hapticEnabled
                    onTap={() => {
                      window.location.href = '/courses';
                    }}
                    className="h-full min-h-[400px] hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 bg-white border border-gray-200 overflow-hidden"
                  >
                    {course.image_url && course.image_url.trim() !== '' && (
                      <div className="relative overflow-hidden">
                        <img
                          src={getResponsiveImageSrc(course.image_url)}
                          alt={course.name}
                          className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                    )}
                    <div className={cn(
                      responsive.isMobile ? "p-4" : "p-6"
                    )}>
                      <div className="flex items-center mb-3">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {course.category}
                        </span>
                      </div>
                      <h3 className={cn(
                        "font-semibold text-gray-900 mb-2 line-clamp-2",
                        responsive.isMobile ? "text-lg" : "text-xl"
                      )}>
                        {course.name}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                        {course.description}
                      </p>
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <Link
                          to={`/courses`}
                          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          了解详情
                          <ArrowRightIcon className="ml-1 h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </TouchableCard>
                </AnimatedContainer>
              );
            })}
          </div>
          <div className="text-center">
            <AnimatedContainer
              animation={{
                type: "fade-in",
                duration: 500,
                delay: 400
              }}
              trigger="scroll"
            >
              <Link 
              to="/courses" 
              className={cn(
                "btn-primary inline-flex items-center bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold transition-all duration-300 hover:scale-105",
                responsive.isMobile ? "px-6 py-3 text-base" : "px-8 py-3 text-lg"
              )}
            >
              查看全部课程
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            </AnimatedContainer>
          </div>
        </div>
      </section>

      {/* 优秀师资 - 响应式优化 */}
      <section 
        className="bg-white"
        style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedContainer
            animation={{
              type: "fade-in",
              duration: 600
            }}
            trigger="scroll"
          >
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <UserGroupIcon className={cn(
                  "text-blue-600 mr-3",
                  responsive.isMobile ? "h-6 w-6" : "h-8 w-8"
                )} />
                <h2 className={cn(
                  "font-bold text-gray-900",
                  responsive.isMobile ? "text-2xl" : "text-3xl"
                )}>优秀师资</h2>
              </div>
              <p className={cn(
                "text-gray-600",
                responsive.isMobile ? "text-base" : "text-lg"
              )}>经验丰富的名师团队，为你保驾护航</p>
            </div>
          </AnimatedContainer>
          <div className={cn(
            "grid gap-6 mb-8",
            `grid-cols-${cardColumns}`
          )}>
            {teachers.map((teacher, index) => {
              return (
                <AnimatedContainer
                  key={teacher.id}
                  animation={{
                    type: "scale-in",
                    duration: 500,
                    delay: index * 150
                  }}
                  trigger="scroll"
                >
                  <div className={cn(
                    "card text-center hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white border border-gray-200 rounded-xl",
                    responsive.isMobile ? "p-4" : "p-6"
                  )}>
                    <div className="relative mb-4">
                      <TeacherAvatar
                        teacher={teacher}
                        size="md"
                        borderStyle="blue"
                        lazy={true}
                      />
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    </div>
                    <h3 className={cn(
                      "font-semibold text-gray-900 mb-2",
                      responsive.isMobile ? "text-lg" : "text-xl"
                    )}>{teacher.name}</h3>
                    <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed">{teacher.description}</p>
                  </div>
                </AnimatedContainer>
              );
            })}
          </div>
          <div className="text-center">
            <AnimatedContainer
              animation={{
                type: "fade-in",
                duration: 500,
                delay: 600
              }}
              trigger="scroll"
            >
              <Link 
                to="/teachers" 
                className={cn(
                  "btn-primary inline-flex items-center bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold transition-all duration-300 hover:scale-105",
                  responsive.isMobile ? "px-6 py-3 text-base" : "px-8 py-3 text-lg"
                )}
              >
                查看全部师资
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </AnimatedContainer>
          </div>
        </div>
      </section>

      {/* 学员案例 - 响应式优化 */}
      <section 
        className="bg-gray-50"
        style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedContainer
            animation={{
              type: "fade-in",
              duration: 600
            }}
            trigger="scroll"
          >
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <TrophyIcon className={cn(
                  "text-blue-600 mr-3",
                  responsive.isMobile ? "h-6 w-6" : "h-8 w-8"
                )} />
                <h2 className={cn(
                  "font-bold text-gray-900",
                  responsive.isMobile ? "text-2xl" : "text-3xl"
                )}>学员案例</h2>
              </div>
              <p className={cn(
                "text-gray-600",
                responsive.isMobile ? "text-base" : "text-lg"
              )}>真实的成功案例，见证我们的实力</p>
            </div>
          </AnimatedContainer>
          {/* 学员案例网格布局 */}
          <div className="mb-8">
            <AnimatedContainer
              animation={{
                type: "fade-in",
                duration: 500,
                delay: 200
              }}
              trigger="scroll"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studentCases.map((studentCase) => (
                  <TouchableCard
                    key={studentCase.id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 min-h-[400px] flex flex-col"
                  >
                    {studentCase.image_url && studentCase.image_url.trim() !== '' && (
                      <div className="relative overflow-hidden">
                        <img
                          src={getResponsiveImageSrc(studentCase.image_url)}
                          alt={studentCase.name}
                          className="w-full h-48 object-cover"
                          loading="lazy"
                        />
                        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          成功上岸
                        </div>
                      </div>
                    )}
                    <div className={cn(
                      "flex-1 flex flex-col",
                      responsive.isMobile ? "p-4" : "p-6"
                    )}>
                      <h3 className={cn(
                        "font-semibold text-gray-900 mb-2",
                        responsive.isMobile ? "text-lg" : "text-xl"
                      )}>{studentCase.name}</h3>
                      <div className="text-sm text-blue-600 font-medium mb-2">
                        {studentCase.admitted_school}
                      </div>
                      {studentCase.exam_score && (
                        <div className={cn(
                          "font-semibold text-green-600 mb-3 bg-green-50 px-3 py-1 rounded-lg inline-block",
                          responsive.isMobile ? "text-base" : "text-lg"
                        )}>
                          考研成绩：{studentCase.exam_score}分
                        </div>
                      )}
                      <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed flex-1">{studentCase.testimonial}</p>
                    </div>
                  </TouchableCard>
                ))}
              </div>
            </AnimatedContainer>
          </div>
          <div className="text-center">
            <AnimatedContainer
              animation={{
                type: "fade-in",
                duration: 500,
                delay: 600
              }}
              trigger="scroll"
            >
              <Link 
                to="/student-cases" 
                className={cn(
                  "btn-primary inline-flex items-center bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold transition-all duration-300 hover:scale-105",
                  responsive.isMobile ? "px-6 py-3 text-base" : "px-8 py-3 text-lg"
                )}
              >
                查看更多案例
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </AnimatedContainer>
          </div>
        </div>
      </section>

      {/* 最新文章 - 响应式优化 */}
      <section 
        className="bg-white"
        style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedContainer
            animation={{
              type: "fade-in",
              duration: 600
            }}
            trigger="scroll"
          >
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <NewspaperIcon className={cn(
                  "text-blue-600 mr-3",
                  responsive.isMobile ? "h-6 w-6" : "h-8 w-8"
                )} />
                <h2 className={cn(
                  "font-bold text-gray-900",
                  responsive.isMobile ? "text-2xl" : "text-3xl"
                )}>最新文章</h2>
              </div>
              <p className={cn(
                "text-gray-600",
                responsive.isMobile ? "text-base" : "text-lg"
              )}>考研资讯和备考指导</p>
            </div>
          </AnimatedContainer>
          <div className="mb-8">
            <AnimatedContainer
              animation={{
                type: "fade-in",
                duration: 500,
                delay: 200
              }}
              trigger="scroll"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <TouchableCard
                    key={article.id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 min-h-[400px] flex flex-col"
                  >
                    {article.image_url && article.image_url.trim() !== '' && (
                      <div className="relative overflow-hidden">
                        <img
                          src={getResponsiveImageSrc(article.image_url)}
                          alt={article.title}
                          className="w-full h-48 object-cover"
                          loading="lazy"
                        />
                        <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          最新
                        </div>
                      </div>
                    )}
                    <div className={cn(
                      "flex-1 flex flex-col",
                      responsive.isMobile ? "p-4" : "p-6"
                    )}>
                      <div className="flex items-center mb-2">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {article.category}
                        </span>
                      </div>
                      <h3 className={cn(
                        "font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors",
                        responsive.isMobile ? "text-lg" : "text-xl"
                      )}>{article.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed flex-1">{article.summary}</p>
                      <Link
                        to={`/articles/${article.id}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                      >
                        阅读全文
                        <ArrowRightIcon className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </TouchableCard>
                 ))}
              </div>
            </AnimatedContainer>
          </div>
          <div className="text-center">
            <AnimatedContainer
              animation={{
                type: "fade-in",
                duration: 500,
                delay: 600
              }}
              trigger="scroll"
            >
              <Link 
                to="/articles" 
                className={cn(
                  "btn-primary inline-flex items-center bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold transition-all duration-300 hover:scale-105",
                  responsive.isMobile ? "px-6 py-3 text-base" : "px-8 py-3 text-lg"
                )}
              >
                查看全部文章
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </AnimatedContainer>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-10 rounded-full" />
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white opacity-5 rounded-full" />
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white opacity-10 rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <AnimatedContainer
            animation={{
              type: "fade-in",
              duration: 800
            }}
            trigger="scroll"
          >
            <div className="flex items-center justify-center mb-6">
              <TrophyIcon className="h-12 w-12 text-white mr-4" />
              <h2 className="text-4xl font-bold text-white">开始你的考研之路</h2>
            </div>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              专业的指导，科学的方法，让你的考研之路更加顺畅
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/contact"
                className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <AcademicCapIcon className="h-5 w-5 mr-2" />
                立即咨询
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                <UserGroupIcon className="h-5 w-5 mr-2" />
                查看课程
              </Link>
            </div>
          </AnimatedContainer>
        </div>
      </section>
    </div>
  );
};

export default HomePage;