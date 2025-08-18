import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CalendarIcon,
  TagIcon,

} from '@heroicons/react/24/outline';
import { cn } from '../../utils';
import { DataTable } from '../../components';
import { CaseService } from '../../services/adminService';
import { toast } from 'react-hot-toast';
import CaseForm from '../components/CaseForm';

/**
 * 案例数据类型
 */
interface Case extends Record<string, unknown> {
  id: string;
  student_name: string;
  original_score: number;
  final_score: number;
  improvement: number;
  target_school: string;
  major: string;
  year: number;
  story: string;
  image_url: string;
  status: 'draft' | 'published';
  featured: boolean;
  created_at: string;
  updated_at: string;
}

// 数据库案例类型
interface DatabaseCase {
  id: string;
  name: string;
  exam_score: string | null;
  admitted_school: string | null;
  testimonial: string | null;
  image_url: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  sort_order: number | null;
  undergraduate_school: string | null;
}

/**
 * 案例管理页面
 */
const Cases: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  // 表单相关状态
  const [showForm, setShowForm] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  // 加载案例数据
  const loadCases = useCallback(async () => {
    try {
      setLoading(true);
      const { data, count } = await CaseService.getCases({
        search: searchTerm || undefined,
        status: selectedStatus !== 'all' ? selectedStatus as 'draft' | 'published' : undefined,
        page: currentPage,
        limit: itemsPerPage
      });
      
      // 映射数据库字段到Case类型
      const mappedCases = (data || []).map((caseItem: DatabaseCase) => ({
        id: caseItem.id,
        student_name: caseItem.name,
        exam_score: parseInt(caseItem.exam_score || '0'), // 修正：使用exam_score
        original_score: parseInt(caseItem.exam_score || '300'),
        final_score: 420,
        improvement: 120,
        target_school: caseItem.admitted_school || '目标院校', // 修正：使用admitted_school作为target_school
        admitted_school: caseItem.admitted_school || '录取院校',
        major: '专业课',
        year: 2024,
        testimonial: caseItem.testimonial || '感谢老师的指导',
        story: caseItem.testimonial || '学习经历分享', // 修正：使用testimonial作为story
        featured: false,
        image_url: caseItem.image_url || '',
        status: (caseItem.is_active ? 'published' : 'draft') as 'draft' | 'published',
        created_at: caseItem.created_at || new Date().toISOString(),
        updated_at: caseItem.updated_at || new Date().toISOString()
      }));
      setCases(mappedCases);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (error: unknown) {
      console.error('加载案例失败:', error);
      toast.error('加载案例失败');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedStatus, currentPage, itemsPerPage]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  // 状态选项
  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'draft', label: '草稿' },
    { value: 'published', label: '已发布' },
  ];

  // 状态映射
  const statusMap = {
    draft: '草稿',
    published: '已发布',
  };

  // 状态颜色映射
  const getStatusColor = (status: Case['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
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

  /**
   * 处理新增案例
   */
  const handleAddCase = () => {
    setFormMode('create');
    setEditingCase(null);
    setShowForm(true);
  };

  /**
   * 处理编辑案例
   */
  const handleEditCase = (caseId: string) => {
    const caseItem = cases.find(c => c.id === caseId);
    if (caseItem) {
      setFormMode('edit');
      setEditingCase(caseItem);
      setShowForm(true);
    }
  };

  /**
   * 处理删除案例
   */
  const handleDeleteCase = async (caseId: string) => {
    const caseItem = cases.find(c => c.id === caseId);
    if (!confirm(`确定要删除案例「${caseItem?.student_name}」吗？`)) {
      return;
    }
    
    try {
      await CaseService.deleteCase(caseId);
      toast.success('删除成功');
      loadCases();
    } catch (error: unknown) {
      console.error('删除失败:', error);
      toast.error('删除失败');
    }
  };

  /**
   * 处理查看案例详情
   */
  const handleViewCase = (caseId: string) => {
    const caseItem = cases.find(c => c.id === caseId);
    if (caseItem) {
      setFormMode('edit');
      setEditingCase(caseItem);
      setShowForm(true);
    }
  };

  /**
   * 处理表单提交成功
   */
  const handleFormSuccess = () => {
    loadCases();
  };

  /**
   * 处理表单取消
   */
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCase(null);
  };

  /**
   * 格式化数字显示
   */
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  // 表格列配置
  const columns = [
    {
      key: 'student_name',
      title: '学员姓名',
      render: (_: unknown, caseItem: Case) => (
        <div className="max-w-xs">
          <div className="text-sm font-medium text-gray-900 truncate">{caseItem.student_name}</div>
          <div className="text-sm text-gray-500 truncate">{caseItem.target_school}</div>
        </div>
      ),
    },
    {
      key: 'major',
      title: '专业',
      render: (_: unknown, caseItem: Case) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {caseItem.major}
        </span>
      ),
    },
    {
      key: 'scores',
      title: '分数提升',
      render: (_: unknown, caseItem: Case) => (
        <div className="text-sm">
          <div className="text-gray-900">{caseItem.original_score} → {caseItem.final_score}</div>
          <div className="text-green-600 font-medium">+{caseItem.improvement}</div>
        </div>
      ),
    },
    {
      key: 'year',
      title: '年份',
      render: (_: unknown, caseItem: Case) => (
        <span className="text-sm text-gray-900">{caseItem.year}</span>
      ),
    },
    {
      key: 'featured',
      title: '推荐',
      render: (_: unknown, caseItem: Case) => (
        <span className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          caseItem.featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
        )}>
          {caseItem.featured ? '推荐' : '普通'}
        </span>
      ),
    },
    {
      key: 'status',
      title: '状态',
      render: (_: unknown, caseItem: Case) => (
        <span className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          getStatusColor(caseItem.status)
        )}>
          {statusMap[caseItem.status]}
        </span>
      ),
    },
    {
      key: 'updated_at',
      title: '更新时间',
      render: (_: unknown, caseItem: Case) => (
        <div className="text-sm text-gray-500">
          {caseItem.updated_at}
        </div>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      render: (_: unknown, caseItem: Case) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewCase(caseItem.id)}
            className="text-blue-600 hover:text-blue-900"
            title="查看详情"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEditCase(caseItem.id)}
            className="text-indigo-600 hover:text-indigo-900"
            title="编辑"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteCase(caseItem.id)}
            className="text-red-600 hover:text-red-900"
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
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">案例管理</h1>
          <p className="mt-1 text-sm text-gray-500">管理所有学习案例，包括创建、编辑和发布案例内容</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleAddCase}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            新增案例
          </button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            {/* 搜索框 */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                placeholder="搜索案例标题、描述或标签..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>



            {/* 状态筛选 */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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

      {/* 案例列表 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <DataTable
             data={cases}
             columns={columns}
             loading={loading}
             empty="暂无案例数据"
           />
          
          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                显示 {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} 条，共 {totalCount} 条
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  上一页
                </button>
                <span className="text-sm">
                  第 {currentPage} 页，共 {totalPages} 页
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 统计信息 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">案例统计</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-blue-500 truncate">总案例数</dt>
                      <dd className="text-lg font-medium text-blue-900">{cases.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-green-500 truncate">已发布</dt>
                      <dd className="text-lg font-medium text-green-900">
                        {cases.filter(c => c.status === 'published').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TagIcon className="h-6 w-6 text-yellow-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-yellow-500 truncate">推荐案例</dt>
                      <dd className="text-lg font-medium text-yellow-900">
                        {formatNumber(cases.filter(caseItem => caseItem.featured).length)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-6 w-6 text-purple-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-purple-500 truncate">草稿数</dt>
                      <dd className="text-lg font-medium text-purple-900">
                        {cases.filter(c => c.status === 'draft').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 案例表单弹窗 */}
      {showForm && (
        <CaseForm
          isOpen={showForm}
          onClose={handleFormCancel}
          onSuccess={handleFormSuccess}
          caseId={formMode === 'edit' && editingCase ? editingCase.id : undefined}
          initialData={formMode === 'edit' && editingCase ? editingCase : undefined}
        />
      )}
    </div>
  );
};

export default Cases;