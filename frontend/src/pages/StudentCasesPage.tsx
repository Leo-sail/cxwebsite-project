/**
 * 学生案例页面
 */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../services/queryClient';
import { studentCaseApi } from '../services/api';
import { SEO, StudentCasesPageHeaderIcon } from '../components';
// import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import { AnimatedContainer } from '../components/animation/AnimatedContainer';
import { GradientBackground } from '../components/ui/GradientBackground';

// import { useThemeContext } from '../contexts/ThemeContext';
import { 
  AcademicCapIcon, 
  TrophyIcon, 
  StarIcon,
  UserGroupIcon,
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import type { StudentCase } from '../types';

/**
 * 学生案例页面组件
 */
const StudentCasesPage: React.FC = () => {
  // const { theme } = useThemeContext();
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 12;

  // 获取学生案例数据
  const { data: casesData, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.STUDENT_CASES,
    queryFn: () => studentCaseApi.getAll(),
  });

  const allCases = casesData || [];
  
  // 直接使用所有案例数据
  const filteredCases = allCases;
  
  const totalCount = filteredCases.length;
  const startIndex = (currentPage - 1) * pageSize;
  const cases = filteredCases.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(totalCount / pageSize);



  /**
   * 处理搜索
   */
  // const handleSearch = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setCurrentPage(1);
  // };

  /**
   * 处理学校筛选
   */
  // const handleSchoolFilter = (school: string) => {
  //   setSelectedSchool(school);
  //   setCurrentPage(1);
  // };

  /**
   * 处理排序
   */
  // const handleSortChange = (sort: 'latest' | 'score') => {
  //   setSortBy(sort);
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
        title="学员案例 - 考研教育平台"
        description="真实的成功案例，见证我们的实力。查看学员的考研成功故事和经验分享。"
        keywords="考研成功案例,学员故事,考研经验,名校录取"
      />

      <div className="min-h-screen bg-gray-50">
        {/* 页面头部 */}
        <section className="relative overflow-hidden">
          <GradientBackground 
            type="secondary"
            direction="to-br"
            className="absolute inset-0"
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <AnimatedContainer
              animation={{ type: 'fade-in', duration: 800, delay: 0 }}
              trigger="scroll"
              className="text-center"
            >
              <StudentCasesPageHeaderIcon
                icon={TrophyIcon}
                title="学员案例"
                subtitle={(
                  <>
                    真实的成功案例，见证我们的教学实力
                    <br className="hidden md:block" />
                    每一个成功背后都有我们的专业指导和学员的努力付出
                  </>
                )}
                titleClassName="text-5xl md:text-6xl font-bold text-white mb-6"
                subtitleClassName="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed"
              />
              
              <div className="mt-8 flex items-center justify-center gap-6 text-white/80">
                <div className="flex items-center gap-2">
                  <StarIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">真实案例</span>
                </div>
                <div className="w-1 h-1 bg-white/40 rounded-full" />
                <div className="flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">成功见证</span>
                </div>
                <div className="w-1 h-1 bg-white/40 rounded-full" />
                <div className="flex items-center gap-2">
                  <AcademicCapIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">名校录取</span>
                </div>
              </div>
            </AnimatedContainer>
          </div>
        </section>

        {/* 统计数据 */}
        <section className="relative py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedContainer
               animation={{ type: 'slide-in-up', duration: 600, delay: 200 }}
               trigger="scroll"
             >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl transform group-hover:scale-105 transition-transform duration-300" />
                  <div className="relative text-center p-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                      <ChartBarIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-4xl font-bold text-blue-600 mb-2">{totalCount}+</div>
                    <div className="text-gray-600 font-medium">成功案例</div>
                    <div className="text-sm text-gray-500 mt-1">真实可验证</div>
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-2xl transform group-hover:scale-105 transition-transform duration-300" />
                  <div className="relative text-center p-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                      <AcademicCapIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-4xl font-bold text-green-600 mb-2">985+</div>
                    <div className="text-gray-600 font-medium">名校录取</div>
                    <div className="text-sm text-gray-500 mt-1">名校资源</div>
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl transform group-hover:scale-105 transition-transform duration-300" />
                  <div className="relative text-center p-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                      <TrophyIcon className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="text-4xl font-bold text-purple-600 mb-2">95%</div>
                    <div className="text-gray-600 font-medium">录取率</div>
                    <div className="text-sm text-gray-500 mt-1">高成功率</div>
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-2xl transform group-hover:scale-105 transition-transform duration-300" />
                  <div className="relative text-center p-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                      <StarIcon className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="text-4xl font-bold text-orange-600 mb-2">380+</div>
                    <div className="text-gray-600 font-medium">平均分数</div>
                    <div className="text-sm text-gray-500 mt-1">优异成绩</div>
                  </div>
                </div>
              </div>
            </AnimatedContainer>
          </div>
        </section>



        {/* 案例列表 */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <AnimatedContainer
                animation={{ type: 'fade-in', duration: 400 }}
                trigger="immediate"
                className="flex flex-col items-center justify-center py-20"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>
                <p className="mt-6 text-gray-600 font-medium">正在加载精彩案例...</p>
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </AnimatedContainer>
            ) : cases.length === 0 ? (
              <AnimatedContainer
                animation={{ type: 'fade-in', duration: 400 }}
                trigger="immediate"
                className="text-center py-20"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                  <UserGroupIcon className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无案例数据</h3>
                <p className="text-gray-600 mb-6">暂时没有案例数据</p>
              </AnimatedContainer>
            ) : (
              <>
                {/* 结果统计 */}
                <AnimatedContainer
                  animation={{ type: 'fade-in', duration: 400, delay: 100 }}
                  trigger="scroll"
                  className="mb-8"
                >
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                          <p className="text-gray-700 font-medium">
                            共找到 <span className="text-2xl font-bold text-blue-600">{totalCount}</span> 个成功案例
                          </p>
                        </div>
                      </div>
                      <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                        <SparklesIcon className="w-4 h-4" />
                        <span>真实案例，值得信赖</span>
                      </div>
                    </div>
                  </div>
                </AnimatedContainer>

                {/* 案例网格 */}
                <AnimatedContainer
                  animation={{ type: 'fade-in', duration: 600, delay: 200 }}
                  trigger="scroll"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cases.map((studentCase: StudentCase, index) => (
                      <AnimatedContainer
                        key={studentCase.id}
                        animation={{ type: 'slide-in-up', duration: 400, delay: index * 100 }}
                        trigger="scroll"
                      >
                        <CaseCard studentCase={studentCase} />
                      </AnimatedContainer>
                    ))}
                  </div>
                </AnimatedContainer>

                {/* 分页 */}
                {totalPages > 1 && (
                  <AnimatedContainer
                    animation={{ type: 'fade-in', duration: 400, delay: 600 }}
                    trigger="scroll"
                    className="mt-16"
                  >
                    <div className="flex justify-center">
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
 * 案例卡片组件
 */
interface CaseCardProps {
  studentCase: StudentCase;
}

const CaseCard: React.FC<CaseCardProps> = ({ studentCase }) => {
  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2 min-h-[400px] flex flex-col">
      {/* 学员照片 */}
      <div className="relative overflow-hidden">
        {studentCase.image_url && studentCase.image_url.trim() !== '' ? (
          <img
            src={studentCase.image_url}
            alt={studentCase.name}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 animate-pulse" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center mb-2 shadow-lg">
                <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-600">学员照片</span>
            </div>
          </div>
        )}
        
        {/* 成绩标签 */}
        {studentCase.exam_score && (
          <div className="absolute top-4 right-4">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1">
              <TrophyIcon className="w-4 h-4" />
              {studentCase.exam_score}分
            </div>
          </div>
        )}
        
        {/* 装饰性元素 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      </div>

      {/* 案例信息 */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {studentCase.name}
          </h3>
          
          {/* 录取学校 - 突出显示 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 mb-3">
            <div className="flex items-center gap-2">
              <AcademicCapIcon className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">录取院校</span>
            </div>
            <p className="text-lg font-bold text-blue-600 mt-1">{studentCase.admitted_school}</p>
          </div>
        </div>

        {/* 学校信息网格 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <span className="text-xs font-medium text-gray-500">本科院校</span>
            </div>
            <p className="text-sm font-semibold text-gray-700">{'未填写'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full" />
              <span className="text-xs font-medium text-gray-500">录取专业</span>
            </div>
            <p className="text-sm font-semibold text-gray-700">{'未填写'}</p>
          </div>
        </div>

        {/* 成功故事 */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">成功心得</span>
          </div>
          <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed bg-gray-50 rounded-lg p-3">
            {studentCase.testimonial || '这位学员通过努力学习和坚持不懈，最终实现了自己的目标，成功考入理想院校。'}
          </p>
        </div>

        {/* 底部信息 */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-green-600">真实案例</span>
            </div>
            {studentCase.created_at && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{new Date(studentCase.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 底部装饰 */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
    </div>
  );
};

export default StudentCasesPage;