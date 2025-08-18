/**
 * 师资力量页面
 */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import { QUERY_KEYS } from '../services/queryClient';
import { teacherApi } from '../services/api';
import { SEO, TeachersPageHeaderIcon } from '../components';
// import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import { AnimatedContainer } from '../components/animation/AnimatedContainer';
// import { GradientBackground } from '../components/ui/GradientBackground'; // 暂时注释，如需要可取消注释

import { useResponsive, useResponsiveValue, useResponsiveFontSize, useResponsiveSpacing } from '../hooks/useResponsive';
import { useCardHeight } from '../hooks/useCardHeight';
import type { Teacher } from '../types';
import { TeacherAvatar } from '../components/ui/TeacherAvatar';

/**
 * 师资力量页面组件
 */
const TeachersPage: React.FC = () => {
  const responsive = useResponsive();
  
  // 响应式配置
  const gridCols = useResponsiveValue({ xs: 1, sm: 1, md: 2, lg: 3 });
  // const headerPadding = useResponsiveSpacing({ xs: 8, sm: 12, md: 16, lg: 20 }); // 暂时注释，如需要可取消注释
  const gridGap = useResponsiveSpacing({ xs: 6, sm: 8, md: 12, lg: 12 });
  const iconSize = useResponsiveValue({ xs: 6, sm: 8, md: 10, lg: 12 });
  const headerTitleSize = useResponsiveFontSize({ xs: 'text-2xl', sm: 'text-3xl', md: 'text-4xl', lg: 'text-5xl' });
  const headerSubtitleSize = useResponsiveFontSize({ xs: 'text-base', sm: 'text-lg', md: 'text-xl', lg: 'text-xl' });
  
  // 卡片响应式配置
  const cardPadding = useResponsiveSpacing({ xs: 2, sm: 3, md: 4, lg: 4 });
  const imageHeight = useResponsiveValue({ xs: 48, sm: 56, md: 64, lg: 64 });
  const avatarHeight = useResponsiveValue({ xs: 7, sm: 8, md: 10, lg: 10 });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // 获取教师数据
  const { data: teachersData, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.TEACHERS,
    queryFn: () => teacherApi.getAll(),
  });

  const teachers = teachersData || [];

  // 教师数据
  const filteredTeachers = teachers;

  // 分页处理
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTeachers = filteredTeachers.slice(startIndex, endIndex);
  const totalCount = filteredTeachers.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  /**
   * 处理搜索
   */
  // const handleSearch = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setCurrentPage(1);
  // };



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
        title="师资力量 - 考研教育平台"
        description="经验丰富的名师团队，为你的考研之路保驾护航。查看我们的优秀师资团队。"
        keywords="考研师资,名师团队,考研老师,专业辅导"
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
        {/* 页面头部 */}
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700">
           <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16`}>
             <AnimatedContainer
               animation={{ type: 'fade-in', duration: 800, delay: 0 }}
               trigger="scroll"
               className="text-center"
             >
              <TeachersPageHeaderIcon
                icon={AcademicCapIcon}
                title="师资力量"
                subtitle="汇聚名校名师，拥有丰富的考研辅导经验，为学员提供专业、高效的指导服务"
                titleClassName={`${headerTitleSize} font-bold text-white mb-4`}
                subtitleClassName={`${headerSubtitleSize} text-emerald-100 max-w-3xl mx-auto leading-relaxed`}
              />
              <div className={`mt-6 ${responsive.isMobile ? 'flex-col gap-4' : 'flex-row gap-8'} flex items-center justify-center text-sm text-emerald-200`}>
                <div className="flex items-center gap-2">
                  <span>资深师资团队</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>专业教学经验</span>
                </div>
              </div>
            </AnimatedContainer>
          </div>
        </section>



        {/* 师资列表 */}
        <section className="py-16 bg-gradient-to-b from-gray-50/50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className={`grid gap-${gridGap}`} style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                    <div className="bg-gray-200 animate-pulse" style={{ height: `${imageHeight * 0.25}rem` }} />
                    <div style={{ padding: cardPadding }}>
                      <div className="h-6 bg-gray-200 rounded animate-pulse mb-3" />
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : paginatedTeachers.length === 0 ? (
              <AnimatedContainer
                animation={{ type: 'fade-in', duration: 600 }}
                trigger="scroll"
                className="text-center"
                style={{ padding: `${Number(gridGap) * 2.5}rem 0` }}
              >
                <div className="bg-gray-50 border border-gray-200 rounded-xl max-w-md mx-auto" style={{ padding: `${Number(gridGap) * 2}rem` }}>
                  <div className={`bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4`} style={{ width: `${Number(iconSize) * 2}rem`, height: `${Number(iconSize) * 2}rem` }}>
                    <div className={`text-gray-400`} style={{ width: `${Number(iconSize)}rem`, height: `${Number(iconSize)}rem` }} />
                  </div>
                  <h3 className={`${headerSubtitleSize} font-semibold text-gray-900 mb-2`}>暂无师资信息</h3>
                  <p className={`text-gray-600 ${responsive.isMobile ? 'text-sm' : 'text-base'}`}>请稍后再试或调整搜索条件</p>
                </div>
              </AnimatedContainer>
            ) : (
              <>
                {/* 结果统计 */}
                <AnimatedContainer
                  animation={{ type: 'fade-in', duration: 600 }}
                  trigger="scroll"
                  className="mb-8"
                >
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <p className="text-gray-600 text-center">
                      共找到 <span className="font-semibold text-primary-600">{totalCount}</span> 位优秀老师
                    </p>
                  </div>
                </AnimatedContainer>

                {/* 师资网格 */}
                <div className={`grid gap-${gridGap}`} style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
                  {paginatedTeachers.map((teacher: Teacher, index: number) => (
                    <AnimatedContainer
                      key={teacher.id}
                      animation={{ type: 'fade-in', duration: 600, delay: index * 100 }}
                      trigger="scroll"
                      threshold={0.1}
                    >
                      <TeacherCard teacher={teacher} cardPadding={cardPadding} avatarHeight={avatarHeight} />
                    </AnimatedContainer>
                  ))}
                </div>

                {/* 分页 */}
                {totalPages > 1 && (
                  <AnimatedContainer
                    animation={{ type: 'slide-in-up', duration: 600, delay: 300 }}
                    trigger="scroll"
                    className="mt-16 flex justify-center"
                  >
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
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
 * 师资卡片组件
 */
interface TeacherCardProps {
  teacher: Teacher;
  cardPadding: string;
  avatarHeight: number;
}

const TeacherCard: React.FC<TeacherCardProps> = ({ teacher, cardPadding, avatarHeight }) => {
  // 响应式配置
  const titleSize = useResponsiveFontSize({ xs: 'text-lg', sm: 'text-xl', md: 'text-xl', lg: 'text-xl' });
  const descriptionSize = useResponsiveFontSize({ xs: 'text-xs', sm: 'text-sm', md: 'text-sm', lg: 'text-sm' });
  const cardHeight = useCardHeight();

  /**
   * 获取教师的教学科目文本
   * @param teachingSubjects - 教学科目Json数据
   * @returns 科目名称字符串
   */
  const getTeachingSubjects = (teachingSubjects: any): string => {
    // 检查是否为有效的数组数据
    if (!teachingSubjects || !Array.isArray(teachingSubjects) || teachingSubjects.length === 0) {
      return '专业讲师';
    }
    
    const subjects = teachingSubjects.map((subject: any) => {
      // 处理不同的数据结构
      return subject.subject_name || subject.name || '专业课程';
    });
    
    return subjects.length > 2 
      ? `${subjects.slice(0, 2).join('、')}等` 
      : subjects.join('、');
  };

  const teachingSubjectsText = getTeachingSubjects(teacher.teaching_subjects);

  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 flex flex-col" style={{ height: `${cardHeight}px`, minWidth: '280px', width: '100%' }}>
      {/* 师资头像 */}
      <div className="relative bg-gradient-to-br from-primary-50 to-primary-100 mb-4">
        <div className="flex items-center justify-center py-8" style={{ minHeight: `${avatarHeight + 1}rem` }}>
          <TeacherAvatar
            teacher={teacher}
            size="lg"
            borderStyle="none"
            lazy={true}
            className="group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        
        {/* 悬浮效果 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* 师资信息 */}
      <div className="flex-1 px-4 pt-4 pb-6 flex flex-col justify-start" style={{ paddingLeft: cardPadding, paddingRight: cardPadding }}>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-2 h-2 bg-primary-500 rounded-full" />
            <h3 className={`${titleSize} font-bold text-gray-900 group-hover:text-primary-600 transition-colors`}>{teacher.name}</h3>
          </div>
          
          {/* 教学科目显示 */}
          {teachingSubjectsText && teachingSubjectsText !== '专业讲师' && (
            <div className="mb-3">
              <p className={`text-primary-600 ${descriptionSize} font-medium text-center`}>
                {teachingSubjectsText}
              </p>
            </div>
          )}
          
          {/* 教师描述显示 */}
          {teacher.description && (
            <p className={`text-gray-600 ${descriptionSize} leading-relaxed mb-4 px-2`} style={{ minHeight: '3rem', maxWidth: '100%', wordBreak: 'break-word', lineHeight: '1.6' }}>
              {teacher.description}
            </p>
          )}
          
          {/* 底部装饰 - 显示教学科目 */}
          <div className="flex items-center justify-center pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <AcademicCapIcon className="h-4 w-4" />
              <span>{teachingSubjectsText}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeachersPage;