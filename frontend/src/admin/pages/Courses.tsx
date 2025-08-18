import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils';
import { CourseService } from '../../services/adminService';
import { toast } from 'react-hot-toast';
import DataTable, { type Column } from '../../components/DataTable';
import { useCourseModal } from '../hooks/useCourseModal';
import { CourseModal } from '../components/CourseModal';
import type { Course } from '../../types/database';

/**
 * 课程管理页面
 */
const Courses: React.FC = () => {
  const { currentTheme } = useTheme();
  const isDark = currentTheme?.colors?.background === '#000000' || currentTheme?.colors?.background === '#1a1a1a' || currentTheme?.colors?.text === '#ffffff';
  const [courses, setCourses] = useState<Course[]>([]);
  // const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, archived: 0 });
  const itemsPerPage = 10;
   
   // 使用课程模态框状态管理
    const {
      isOpen,
      mode,
      currentCourse,
      formData,
      errors,
      loading,
      submitting,
      openViewModal,
      openEditModal,
      openCreateModal,
      closeModal,
      updateFormData,
      submitForm
    } = useCourseModal(() => {
      loadCourses();
      loadStats();
    });

  // 加载课程数据
  const loadCourses = useCallback(async () => {
    try {
      // setDataLoading(true);
      const { data } = await CourseService.getCourses({
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        page: currentPage,
        limit: itemsPerPage
      });
      
      // 直接使用数据库返回的数据结构
      const mappedCourses = (data || []).map((course: any) => ({
        ...course,
        // 确保必要字段存在
        title: course.name || course.title,
        thumbnail_url: course.image_url || course.thumbnail_url,
        status: course.is_active ? 'published' : 'draft'
      }));
      setCourses(mappedCourses);
    } catch (error: unknown) {
      console.error('加载课程失败:', error);
      toast.error('加载课程失败');
    } finally {
      // setDataLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedStatus, currentPage]);

  // 加载课程统计
  const loadStats = useCallback(async () => {
    try {
      const statsData = await CourseService.getCourseStats();
      // 映射统计数据字段
      const mappedStats = {
        total: statsData.total,
        published: statsData.active,
        draft: statsData.inactive,
        archived: 0
      };
      setStats(mappedStats);
    } catch (error: unknown) {
      console.error('加载统计失败:', error);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [currentPage, searchTerm, selectedCategory, selectedStatus, loadCourses]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // 课程分类选项
  const categories = ['all', '数学', '英语', '政治', '专业课'];
  
  // 状态选项
  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'published', label: '已发布' },
    { value: 'draft', label: '草稿' },
    { value: 'archived', label: '已归档' },
  ];





  // 状态颜色映射
    // const getStatusColor = (isActive: boolean | null) => {
    //   return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    // };



  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // 处理分类筛选
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  // 处理状态筛选
  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  /**
   * 处理新增课程
   */
  const handleAddCourse = () => {
    openCreateModal();
  };

  /**
   * 处理编辑课程
   */
  const handleEditCourse = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      openEditModal(course);
    }
  };

  /**
   * 处理删除课程
   */
  const handleDeleteCourse = async (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!confirm(`确定要删除课程「${course?.name}」吗？`)) {
      return;
    }
    
    try {
      await CourseService.deleteCourse(courseId);
      toast.success('删除成功');
      loadCourses();
      loadStats();
    } catch (error: unknown) {
      console.error('删除失败:', error);
      toast.error('删除失败');
    }
  };

  /**
   * 处理查看课程详情
   */
  const handleViewCourse = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      openViewModal(course);
    }
  };

  /**
   * 处理课程保存
   */
  // const handleCourseSave = async (courseData: Partial<Course>) => {
  //   try {
  //     if (mode === 'create') {
  //        await CourseService.createCourse(formData as any);
  //        toast.success('课程创建成功');
  //      } else if (mode === 'edit' && currentCourse) {
  //        await CourseService.updateCourse(currentCourse.id, formData as any);
  //        toast.success('课程更新成功');
  //      }
  //     closeModal();
  //     loadCourses();
  //     loadStats();
  //   } catch (error: unknown) {
  //     console.error('保存课程失败:', error);
  //     toast.error('保存课程失败');
  //   }
  // };

  // 表格列配置
  const columns: Column<Course>[] = [
    {
      key: 'name',
      title: '课程名称',
      render: (_: unknown, course: Course) => (
        <div>
          <div className={cn(
            'font-medium',
            isDark ? 'text-white' : 'text-gray-900'
          )}>{course.name}</div>
          <div className={cn(
            'text-sm',
            isDark ? 'text-gray-400' : 'text-gray-500'
          )}>{course.description}</div>
        </div>
      ),
    },
    {
      key: 'category',
      title: '分类',
      render: (_: unknown, course: Course) => (
        <span className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
        )}>
          {course.category || '未分类'}
        </span>
      ),
    },
    {
      key: 'sort_order',
      title: '排序',
      render: (_: unknown, course: Course) => (
        <span className={isDark ? 'text-gray-300' : 'text-gray-900'}>
          {course.sort_order || 0}
        </span>
      ),
    },
    {
      key: 'created_at',
      title: '创建时间',
      render: (_: unknown, course: Course) => (
        <span className={isDark ? 'text-gray-300' : 'text-gray-900'}>
          {course.created_at ? new Date(course.created_at).toLocaleDateString() : '未知'}
        </span>
      ),
    },
    {
      key: 'status',
      title: '状态',
      render: (_: unknown, course: Course) => (
        <span className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          course.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        )}>
          {course.is_active ? '启用' : '禁用'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      render: (_: unknown, course: Course) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewCourse(course.id)}
            className={cn(
              'hover:scale-110 transition-transform',
              isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'
            )}
            title="查看详情"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEditCourse(course.id)}
            className={cn(
              'hover:scale-110 transition-transform',
              isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-900'
            )}
            title="编辑"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteCourse(course.id)}
            className={cn(
              'hover:scale-110 transition-transform',
              isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'
            )}
            title="删除"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className={`p-6 rounded-xl transition-colors duration-200 ${
        isDark
          ? 'bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600'
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100'
      }`}>
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className={`text-3xl font-bold flex items-center ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <AcademicCapIcon className="w-8 h-8 mr-3 text-blue-500" />
              课程管理
            </h1>
            <p className={`mt-2 text-sm ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              管理所有课程信息，包括创建、编辑和删除课程
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={handleAddCourse}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:scale-105"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              新增课程
            </button>
          </div>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className={`shadow-lg rounded-xl transition-colors duration-200 ${
        isDark
          ? 'bg-gray-800 border border-gray-700'
          : 'bg-white border border-gray-100'
      }`}>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            {/* 搜索框 */}
            <div className="relative sm:col-span-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className={`h-5 w-5 ${
                  isDark ? 'text-gray-400' : 'text-gray-400'
                }`} aria-hidden="true" />
              </div>
              <input
                type="text"
                placeholder="搜索课程名称或讲师..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className={`block w-full pl-10 pr-3 py-3 border rounded-xl leading-5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                }`}
              />
            </div>

            {/* 分类筛选 */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className={`block w-full px-3 py-3 border rounded-xl leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                }`}
              >
                <option value="all">全部分类</option>
                {categories.slice(1).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* 状态筛选 */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`block w-full px-3 py-3 border rounded-xl leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                }`}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 课程列表 */}
      <DataTable
        columns={columns}
        data={courses}
        loading={loading}
        empty={
          <div className="text-center py-12">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              暂无课程数据
            </p>
          </div>
        }
        rowKey="id"
        className={`shadow-lg rounded-xl transition-colors duration-200 ${
          isDark
            ? 'bg-gray-800 border border-gray-700'
            : 'bg-white border border-gray-100'
        }`}
      />

      {/* 统计信息 */}
      <div className={`shadow-lg rounded-xl transition-colors duration-200 ${
        isDark
          ? 'bg-gray-800 border border-gray-700'
          : 'bg-white border border-gray-100'
      }`}>
        <div className="px-6 py-6">
          <h3 className={`text-lg leading-6 font-semibold mb-6 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>课程统计</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
            <div className={`overflow-hidden shadow-lg rounded-xl transition-all duration-200 hover:scale-105 ${
              isDark
                ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/50 border border-blue-700'
                : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'
            }`}>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AcademicCapIcon className="h-8 w-8 text-blue-500" aria-hidden="true" />
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className={`text-sm font-medium truncate ${
                        isDark ? 'text-blue-300' : 'text-blue-600'
                      }`}>总课程数</dt>
                      <dd className={`text-2xl font-bold ${
                        isDark ? 'text-white' : 'text-blue-900'
                      }`}>{stats.total}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className={`overflow-hidden shadow-lg rounded-xl transition-all duration-200 hover:scale-105 ${
              isDark
                ? 'bg-gradient-to-br from-green-900/50 to-green-800/50 border border-green-700'
                : 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200'
            }`}>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <EyeIcon className="h-8 w-8 text-green-500" aria-hidden="true" />
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className={`text-sm font-medium truncate ${
                        isDark ? 'text-green-300' : 'text-green-600'
                      }`}>已发布</dt>
                      <dd className={`text-2xl font-bold ${
                        isDark ? 'text-white' : 'text-green-900'
                      }`}>{stats.published}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className={`overflow-hidden shadow-lg rounded-xl transition-all duration-200 hover:scale-105 ${
              isDark
                ? 'bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border border-yellow-700'
                : 'bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200'
            }`}>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <PencilIcon className="h-8 w-8 text-yellow-500" aria-hidden="true" />
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className={`text-sm font-medium truncate ${
                        isDark ? 'text-yellow-300' : 'text-yellow-600'
                      }`}>草稿</dt>
                      <dd className={`text-2xl font-bold ${
                        isDark ? 'text-white' : 'text-yellow-900'
                      }`}>{stats.draft}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className={`overflow-hidden shadow-lg rounded-xl transition-all duration-200 hover:scale-105 ${
              isDark
                ? 'bg-gradient-to-br from-purple-900/50 to-purple-800/50 border border-purple-700'
                : 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200'
            }`}>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserGroupIcon className="h-8 w-8 text-purple-500" aria-hidden="true" />
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className={`text-sm font-medium truncate ${
                        isDark ? 'text-purple-300' : 'text-purple-600'
                      }`}>总学员</dt>
                      <dd className={`text-2xl font-bold ${
                        isDark ? 'text-white' : 'text-purple-900'
                      }`}>
                        {courses.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 课程模态框 */}
      <CourseModal
           isOpen={isOpen}
           mode={mode}
           currentCourse={currentCourse}
           formData={formData}
           errors={errors}
           loading={loading}
           submitting={submitting}
           onClose={closeModal}
           onUpdateFormData={updateFormData}
           onSubmit={submitForm}
         />
    </div>
  );
};

export default Courses;