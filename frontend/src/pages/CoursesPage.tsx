/**
 * 课程页面组件 - 响应式优化版本
 */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MagnifyingGlassIcon, FunnelIcon, BookOpenIcon, ClockIcon, UserGroupIcon, StarIcon } from '@heroicons/react/24/outline';
import { QUERY_KEYS } from '../services/queryClient';
import { courseApi } from '../services/api';
import type { Course } from '../types';
import { cn, debounce } from '../utils';
import { AnimatedContainer } from '../components/animation/AnimatedContainer';

import { 
  useResponsive, 
  useResponsiveValue, 
  useResponsiveImage, 
  useResponsiveFontSize, 
  useResponsiveSpacing 
} from '../hooks/useResponsive';
import { TouchableButton, TouchableCard, MobileInput } from '../components/mobile';
// import { hapticFeedback } from '../utils/touchGestures';

/**
 * 课程分类
 */
const categories = [
  { id: 'all', name: '全部课程' },
  { id: 'math', name: '数学' },
  { id: 'english', name: '英语' },
  { id: 'politics', name: '政治' },
  { id: 'professional', name: '专业课' },
];

/**
 * 排序选项
 */
const sortOptions = [
  { id: 'default', name: '默认排序' },
  { id: 'price_asc', name: '价格从低到高' },
  { id: 'price_desc', name: '价格从高到低' },
  { id: 'name', name: '按名称排序' },
];

/**
 * 课程页面组件
 */
const CoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  
  // 响应式Hook
  const responsive = useResponsive({ enableDebug: false, cacheKey: 'courses-page' });
  
  // 响应式值配置
  const gridColumns = useResponsiveValue({
    xs: 1,
    sm: 1, 
    md: 2,
    lg: 3
  });
  
  // const headerPadding = useResponsiveSpacing({
  //   xs: 12,
  //   sm: 16,
  //   md: 20,
  //   lg: 24
  // }); // 暂时注释，如需要可取消注释
  
  const sectionPadding = useResponsiveSpacing({
    xs: 4,
    sm: 5,
    md: 6,
    lg: 8
  });
  
  // const headerTitleSize = useResponsiveFontSize({
  //   xs: '2xl',
  //   sm: '3xl',
  //   md: '4xl', 
  //   lg: '5xl'
  // }); // 暂时注释，如需要可取消注释
  
  // const headerSubtitleSize = useResponsiveFontSize({
  //   xs: 'base',
  //   sm: 'lg',
  //   md: 'xl',
  //   lg: 'xl'
  // }); // 暂时注释，如需要可取消注释
  
  // const iconSize = useResponsiveValue({
  //   xs: 'h-12 w-12',
  //   sm: 'h-14 w-14',
  //   md: 'h-16 w-16',
  //   lg: 'h-16 w-16'
  // }); // 暂时注释，如需要可取消注释
  
  // const cardPadding = useResponsiveValue({
  //   xs: 'p-4',
  //   sm: 'p-5',
  //   md: 'p-6',
  //   lg: 'p-6'
  // });
  
  const searchPadding = useResponsiveValue({
    xs: 'p-4',
    sm: 'p-5',
    md: 'p-6',
    lg: 'p-6'
  });
  
  const gapSize = useResponsiveValue({
    xs: 'gap-4',
    sm: 'gap-5',
    md: 'gap-6',
    lg: 'gap-6'
  });

  // 获取课程列表
  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.COURSES,
    queryFn: () => courseApi.getAll(),
  });

  /**
   * 防抖搜索
   */
  const debouncedSearch = debounce((...args: unknown[]) => {
    const term = args[0] as string;
    setSearchTerm(term);
  }, 300);

  /**
   * 过滤和排序课程
   */
  const filteredAndSortedCourses = courses
    .filter((course) => {
      // 搜索过滤
      const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (course.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      // 分类过滤
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return 0;
        case 'price-high':
          return 0;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return a.id.toString().localeCompare(b.id.toString());
      }
    });

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 页面头部 - 响应式优化 */}
      <AnimatedContainer
        animation={{
          type: 'slide-in-up',
          duration: 800,
          easing: 'ease-out'
        }}
        trigger="scroll"
        className="relative overflow-hidden"
      >
        <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div 
            className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16"
          >
            <div className="text-center">
              <BookOpenIcon className={cn(
                "mx-auto mb-4 text-white opacity-90",
                "h-12 w-12 lg:h-14 lg:w-14"
              )} />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-white">
                课程中心
              </h1>
              <p className="text-blue-100 max-w-2xl mx-auto text-base md:text-lg">
                精选优质课程，助力考研成功
              </p>
            </div>
          </div>
        </div>
      </AnimatedContainer>

      <div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}
      >
        {/* 搜索和筛选 - 响应式优化 */}
        <AnimatedContainer
          animation={{
            type: 'fade-in',
            duration: 600,
            delay: 200
          }}
          trigger="scroll"
          className="mb-8"
        >
          <div className={cn(
            "bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl",
            searchPadding
          )}>
            <div className={cn(
              "flex gap-4",
              responsive.isMobile ? "flex-col" : "lg:flex-row"
            )}>
              {/* 搜索框 */}
              <div className="flex-1">
                <MobileInput
                  type="search"
                  placeholder="搜索课程名称、描述..."
                  variant="outlined"
                  size={responsive.isMobile ? "md" : "lg"}
                  startIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
                  hapticEnabled
                  onChange={(value) => debouncedSearch(value)}
                  className="bg-gray-50 hover:bg-white"
                />
              </div>

              {/* 筛选按钮 */}
              {responsive.isMobile && (
                <TouchableButton
                  variant="outline"
                  size="md"
                  hapticEnabled
                  onTap={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <FunnelIcon className="h-5 w-5" />
                  筛选选项
                </TouchableButton>
              )}
            </div>
          </div>
        </AnimatedContainer>

        {/* 筛选选项 */}
        <AnimatedContainer
          animation={{
            type: 'slide-in-down',
            duration: 400
          }}
          trigger="manual"
          enabled={showFilters}
          className={cn(
            'mt-4',
            showFilters ? 'block' : 'hidden lg:block'
          )}
        >
          <div className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-md rounded-xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 分类筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">课程分类</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 排序 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">排序方式</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 统计信息 */}
              <div className="flex items-center justify-center lg:justify-start">
                <div className="flex items-baseline space-x-1 text-center lg:text-left">
                  <span className="text-sm text-gray-500">共找到</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {filteredAndSortedCourses.length}
                  </span>
                  <span className="text-sm text-gray-500">门课程</span>
                </div>
              </div>
            </div>
          </div>
        </AnimatedContainer>

        {/* 课程列表 */}
        <AnimatedContainer
          animation={{
            type: 'fade-in',
            duration: 600
          }}
          trigger="scroll"
          className="mt-8"
        >
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="overflow-hidden animate-pulse bg-white border-0 shadow-md rounded-xl">
                  <div className="w-full h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded mb-3"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded mb-4 w-3/4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div>
                      <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedCourses.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <BookOpenIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">没有找到相关课程</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">请尝试调整搜索条件或筛选选项，或者浏览我们的热门课程</p>
              <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                浏览热门课程
              </button>
            </div>
          ) : (
            <div 
              className={cn(
                "grid",
                gapSize
              )}
              style={{
                gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`
              }}
            >
              {filteredAndSortedCourses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course}
                />
              ))}
            </div>
          )}
        </AnimatedContainer>
      </div>
    </div>
  );
};

/**
 * 课程卡片组件 - 响应式优化
 */
interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  // 响应式Hook
  const responsive = useResponsive({ enableDebug: false });
  
  // 响应式图片
  const courseImage = useResponsiveImage({
    xs: (course.image_url && course.image_url.trim() !== '') ? course.image_url : '/api/placeholder/400/200',
    sm: (course.image_url && course.image_url.trim() !== '') ? course.image_url : '/api/placeholder/400/200',
    md: (course.image_url && course.image_url.trim() !== '') ? course.image_url : '/api/placeholder/400/200',
    lg: (course.image_url && course.image_url.trim() !== '') ? course.image_url : '/api/placeholder/400/200'
  });
  
  // 响应式值
  const cardPadding = useResponsiveValue({
    xs: 'p-4',
    sm: 'p-5',
    md: 'p-6',
    lg: 'p-6'
  });
  
  const titleSize = useResponsiveFontSize({
    xs: 'base',
    sm: 'lg',
    md: 'lg',
    lg: 'lg'
  });
  
  const descriptionSize = useResponsiveFontSize({
    xs: 'xs',
    sm: 'sm',
    md: 'sm',
    lg: 'sm'
  });
  
  const priceSize = useResponsiveFontSize({
    xs: 'xl',
    sm: '2xl',
    md: '2xl',
    lg: '2xl'
  });
  
  // const buttonSize = useResponsiveValue({
  //   xs: 'px-3 py-1.5 text-xs',
  //   sm: 'px-4 py-2 text-sm',
  //   md: 'px-6 py-2 text-sm',
  //   lg: 'px-6 py-2 text-sm'
  // });

  return (
    <AnimatedContainer
      animation={{
        type: 'fade-in',
        duration: 500
      }}
      trigger="scroll"
      className="group"
    >
      <TouchableCard
         elevation="md"
         padding="none"
         rounded="lg"
         hapticEnabled
         onTap={() => {
           window.location.href = `/courses/${course.id}`;
         }}
         className="overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 bg-white border-0 shadow-md min-h-[400px] flex flex-col"
       >
        <div className="relative overflow-hidden">
          <img
            src={courseImage.src}
            alt={course.name}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-primary-600 text-xs font-medium rounded-full shadow-sm">
              {categories.find(cat => cat.id === course.category)?.name || '其他'}
            </span>
          </div>
          <div className="absolute top-4 right-4">
            <div className="flex items-center bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
              <StarIcon className="h-3 w-3 text-yellow-500" />
              <span className="ml-1 text-xs font-medium text-gray-700">4.8</span>
            </div>
          </div>
        </div>
        
        <div className={cardPadding}>
          <h3 className={cn(
            "font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200",
            titleSize
          )}>
            {course.name}
          </h3>
          <p className={cn(
            "text-gray-600 mb-4 line-clamp-2 leading-relaxed",
            descriptionSize
          )}>
            {course.description}
          </p>
          
          <div className="flex items-center justify-between mb-4">
            <div className={cn(
              "flex items-center text-gray-500",
              responsive.isMobile ? "flex-col gap-1" : "space-x-4",
              descriptionSize
            )}>
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span>12周</span>
              </div>
              <div className="flex items-center">
                <UserGroupIcon className="h-4 w-4 mr-1" />
                <span>156人</span>
              </div>
            </div>
          </div>
          
          <div className={cn(
            "flex items-center",
            responsive.isMobile ? "flex-col gap-3" : "justify-between"
          )}>
            <div className="text-left">
              <span className={cn(
                "font-bold text-primary-600",
                priceSize
              )}>¥999</span>
              <span className={cn(
                "text-gray-500 ml-1",
                descriptionSize
              )}>起</span>
            </div>
            <TouchableButton
              variant="primary"
              size={responsive.isMobile ? "md" : "lg"}
              hapticEnabled
              onTap={() => {
                window.location.href = `/courses/${course.id}/enroll`;
              }}
              className={cn(
                "font-medium",
                responsive.isMobile ? "w-full" : ""
              )}
            >
              立即报名
            </TouchableButton>
          </div>
        </div>
      </TouchableCard>
    </AnimatedContainer>
  );
};

export default CoursesPage;