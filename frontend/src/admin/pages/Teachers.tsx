import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  UserIcon,
  AcademicCapIcon,
  StarIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils';
import { TeacherService } from '../../services/adminService';
import { toast } from 'react-hot-toast';
import TeacherForm from '../components/TeacherForm';
import TeacherDetail from '../components/TeacherDetail';
import DataTable from '../../components/DataTable';
import type { Column } from '../../components/DataTable';

import type { Database } from '../../types/database';

/**
 * 教师数据类型
 */
type Teacher = Database['public']['Tables']['teachers']['Row'];

/**
 * 教师管理页面
 */
const Teachers: React.FC = () => {
  const { currentTheme } = useTheme();
  const isDark = currentTheme?.colors?.background === '#000000' || currentTheme?.colors?.background === '#1a1a1a' || currentTheme?.colors?.text === '#ffffff';
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [showDetail, setShowDetail] = useState(false);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);

  // 加载教师数据
  const loadTeachers = useCallback(async () => {
    try {
      const { data } = await TeacherService.getTeachers({
        search: searchTerm || undefined,
        status: selectedStatus !== 'all' ? selectedStatus as 'active' | 'inactive' : undefined,
        specialty: selectedSpecialty !== 'all' ? selectedSpecialty : undefined,
      });
        
      setTeachers(data || []);
    } catch (error: unknown) {
      console.error('加载教师失败:', error);
      toast.error('加载教师失败');
    }
  }, [searchTerm, selectedStatus, selectedSpecialty]);

  useEffect(() => {
    loadTeachers();
  }, [currentPage, searchTerm, selectedStatus, selectedSpecialty, loadTeachers]);

  // 专业领域选项
  const specialties = ['all', '高等数学', '线性代数', '概率论', '考研英语', '英语写作', '英语阅读', '马克思主义', '毛泽东思想', '近现代史'];
  
  // 状态选项
  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'active', label: '在职' },
    { value: 'inactive', label: '离职' },
  ];

  // 状态映射
  const statusMap = {
    active: '在职',
    inactive: '离职',
  };

  // 状态颜色映射
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // 处理状态筛选
  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  // 处理专业筛选
  const handleSpecialtyChange = (value: string) => {
    setSelectedSpecialty(value);
    setCurrentPage(1);
  };

  /**
   * 处理新增教师
   */
  const handleAddTeacher = () => {
    setFormMode('create');
    setEditingTeacher(null);
    setShowForm(true);
  };

  /**
   * 处理编辑教师
   */
  const handleEditTeacher = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (teacher) {
      setFormMode('edit');
      setEditingTeacher(teacher);
      setShowForm(true);
    }
  };

  /**
   * 处理删除教师
   */
  const handleDeleteTeacher = async (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher || !confirm(`确定要删除教师「${teacher.name}」吗？`)) {
      return;
    }
    
    try {
      await TeacherService.deleteTeacher(teacherId);
      toast.success('删除成功');
      loadTeachers();
    } catch (error: unknown) {
      console.error('删除失败:', error);
      toast.error('删除失败');
    }
  };

  /**
   * 处理查看教师详情
   */
  const handleViewTeacher = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (teacher) {
      setViewingTeacher(teacher);
      setShowDetail(true);
    }
  };

  /**
   * 处理表单取消
   */
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTeacher(null);
  };



  // DataTable列配置
  const columns: Column<Teacher>[] = [
    {
      title: '教师信息',
      key: 'teacher',
      render: (_, teacher) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {teacher.image_url && teacher.image_url.trim() !== '' ? (
              <img className="h-10 w-10 rounded-full" src={teacher.image_url} alt={teacher.name} />
            ) : (
              <div className={cn(
                'h-10 w-10 rounded-full flex items-center justify-center',
                isDark ? 'bg-gray-600' : 'bg-gray-300'
              )}>
                <span className={cn(
                  'text-sm font-medium',
                  isDark ? 'text-gray-200' : 'text-gray-700'
                )}>
                  {teacher.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className={cn(
              'text-sm font-medium',
              isDark ? 'text-gray-200' : 'text-gray-900'
            )}>
              {teacher.name}
            </div>
            <div className={cn(
              'text-sm',
              isDark ? 'text-gray-400' : 'text-gray-500'
            )}>
              专业讲师
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '专业领域',
      key: 'teaching_subjects',
      render: (_, teacher) => {
        // 从teaching_subjects JSONB字段中提取专业信息
        const subjects = teacher.teaching_subjects as any;
        if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
          return (
            <span className={cn(
              'text-sm',
              isDark ? 'text-gray-400' : 'text-gray-500'
            )}>
              暂无
            </span>
          );
        }
        return (
          <span className={cn(
            'inline-block text-xs px-2 py-1 rounded-full',
            isDark 
              ? 'bg-blue-900/50 text-blue-300 border border-blue-700'
              : 'bg-blue-100 text-blue-800'
          )}>
            {subjects[0]?.subject || '暂无'}
          </span>
        );
      },
    },
    {
      title: '教育背景',
      key: 'education_background',
      render: (_, teacher) => {
        // 从education_background JSONB字段中提取学历信息
        const education = teacher.education_background as any;
        if (!education || !Array.isArray(education) || education.length === 0) {
          return (
            <span className={cn(
              'text-sm',
              isDark ? 'text-gray-400' : 'text-gray-500'
            )}>
              暂无
            </span>
          );
        }
        return (
          <span className={cn(
            'text-sm',
            isDark ? 'text-gray-300' : 'text-gray-700'
          )}>
            {education[0]?.degree || '暂无'}
          </span>
        );
      },
    },
    {
      title: '状态',
      key: 'status',
      render: (_, teacher) => (
        <span className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          getStatusColor(teacher.is_active ? 'active' : 'inactive')
        )}>
          {statusMap[teacher.is_active ? 'active' : 'inactive']}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, teacher) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewTeacher(teacher.id);
            }}
            className={cn(
              'transition-colors',
              isDark
                ? 'text-blue-400 hover:text-blue-300'
                : 'text-blue-600 hover:text-blue-900'
            )}
            title="查看详情"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditTeacher(teacher.id);
            }}
            className={cn(
              'transition-colors',
              isDark
                ? 'text-indigo-400 hover:text-indigo-300'
                : 'text-indigo-600 hover:text-indigo-900'
            )}
            title="编辑"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTeacher(teacher.id);
            }}
            className={cn(
              'transition-colors',
              isDark
                ? 'text-red-400 hover:text-red-300'
                : 'text-red-600 hover:text-red-900'
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
          : 'bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100'
      }`}>
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className={`text-3xl font-bold flex items-center ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <UserIcon className="w-8 h-8 mr-3 text-purple-500" />
              教师管理
            </h1>
            <p className={`mt-2 text-sm ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              管理所有教师信息，包括创建、编辑和删除教师档案
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={handleAddTeacher}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 hover:scale-105"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              新增教师
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
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className={`h-5 w-5 ${
                  isDark ? 'text-gray-400' : 'text-gray-400'
                }`} aria-hidden="true" />
              </div>
              <input
                type="text"
                placeholder="搜索教师姓名、职称或专业..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className={`block w-full pl-10 pr-3 py-3 border rounded-xl leading-5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200 ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                }`}
              />
            </div>

            {/* 专业领域筛选 */}
            <div>
              <select
                value={selectedSpecialty}
                onChange={(e) => handleSpecialtyChange(e.target.value)}
                className={`block w-full px-3 py-3 border rounded-xl leading-5 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200 ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                }`}
              >
                <option value="all">全部专业</option>
                {specialties.slice(1).map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>

            {/* 状态筛选 */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`block w-full px-3 py-3 border rounded-xl leading-5 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200 ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                }`}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 筛选按钮 */}
            <div>
              <button className={`w-full inline-flex items-center justify-center px-4 py-3 border rounded-xl shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 hover:scale-105 ${
                isDark
                  ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600 focus:ring-offset-gray-800'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}>
                <FunnelIcon className={`-ml-1 mr-2 h-5 w-5 ${
                  isDark ? 'text-gray-400' : 'text-gray-400'
                }`} aria-hidden="true" />
                筛选
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 教师列表 */}
      <div className={`shadow-lg rounded-xl transition-colors duration-200 ${
        isDark
          ? 'bg-gray-800 border border-gray-700'
          : 'bg-white border border-gray-100'
      }`}>
        <div className="px-6 py-6">
          <DataTable
            columns={columns}
            data={teachers}
            empty={
              <div className="text-center py-12">
                <UserIcon className={`mx-auto h-12 w-12 ${
                  isDark ? 'text-gray-400' : 'text-gray-400'
                }`} />
                <h3 className={`mt-2 text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-900'
                }`}>暂无教师数据</h3>
                <p className={`mt-1 text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>开始添加第一位教师</p>
              </div>
            }
            rowKey="id"
            onRowClick={(teacher) => handleViewTeacher(teacher.id)}
            className="shadow-sm"
          />
        </div>
      </div>

      {/* 统计信息 */}
      <div className={`shadow-lg rounded-xl transition-colors duration-200 ${
        isDark
          ? 'bg-gray-800 border border-gray-700'
          : 'bg-white border border-gray-100'
      }`}>
        <div className="px-6 py-6">
          <h3 className={`text-lg leading-6 font-medium mb-4 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>教师统计</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            <div className={`overflow-hidden shadow-lg rounded-xl transition-all duration-200 hover:scale-105 ${
              isDark
                ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/50 border border-blue-700'
                : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'
            }`}>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserIcon className="h-8 w-8 text-blue-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className={`text-sm font-medium truncate ${
                        isDark ? 'text-blue-300' : 'text-blue-600'
                      }`}>总教师数</dt>
                      <dd className={`text-2xl font-bold ${
                        isDark ? 'text-blue-100' : 'text-blue-900'
                      }`}>{teachers.length}</dd>
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
                    <AcademicCapIcon className="h-8 w-8 text-green-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className={`text-sm font-medium truncate ${
                        isDark ? 'text-green-300' : 'text-green-600'
                      }`}>在职教师</dt>
                      <dd className={`text-2xl font-bold ${
                        isDark ? 'text-green-100' : 'text-green-900'
                      }`}>
                        {teachers.filter(t => t.is_active).length}
                      </dd>
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
                    <StarIcon className="h-8 w-8 text-yellow-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className={`text-sm font-medium truncate ${
                        isDark ? 'text-yellow-300' : 'text-yellow-600'
                      }`}>平均经验</dt>
                      <dd className={`text-2xl font-bold ${
                        isDark ? 'text-yellow-100' : 'text-yellow-900'
                      }`}>
                        {teachers.length > 0 ? '5.0' : '0'}年
                      </dd>
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
                    <AcademicCapIcon className="h-8 w-8 text-purple-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className={`text-sm font-medium truncate ${
                        isDark ? 'text-purple-300' : 'text-purple-600'
                      }`}>专业领域</dt>
                      <dd className={`text-2xl font-bold ${
                        isDark ? 'text-purple-100' : 'text-purple-900'
                      }`}>
                        {specialties.length - 1}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 教师表单弹窗 */}
        <TeacherForm
          isOpen={showForm}
          onClose={handleFormCancel}
          onSuccess={() => {
            setShowForm(false);
            loadTeachers();
          }}
          teacherId={formMode === 'edit' ? editingTeacher?.id : undefined}
          initialData={formMode === 'edit' && editingTeacher ? {
            name: editingTeacher.name,
            description: editingTeacher.description || '',
            image_url: editingTeacher.image_url || undefined,
            is_active: editingTeacher.is_active ?? true,
            sort_order: editingTeacher.sort_order ?? 0,
            education_background: [],
            teaching_subjects: [],
            achievements: [],
          } : undefined}
        />

        {/* 教师详情弹窗 */}
        {showDetail && viewingTeacher && (
          <TeacherDetail
            isOpen={showDetail}
            onClose={() => {
              setShowDetail(false);
              setViewingTeacher(null);
            }}
            teacher={viewingTeacher}
          />
        )}
    </div>
  );
};

export default Teachers;