import React, { useState, useEffect } from 'react';
import { SEO, AnimatedContainer } from '../components';
import { ContactService } from '../services/ContactService';
import { cn } from '../utils';
import {
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

/**
 * 联系表单提交数据接口
 */
interface ContactSubmission {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  course_interest?: string;
  status: 'pending' | 'contacted' | 'resolved';
  created_at: string;
  updated_at: string;
}

/**
 * 状态筛选选项
 */
type StatusFilter = 'all' | 'pending' | 'contacted' | 'resolved';

/**
 * 管理后台页面组件
 */
const AdminPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  /**
   * 加载联系表单提交数据
   */
  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await ContactService.getAllSubmissions();
      setSubmissions(data);
    } catch (err) {
      console.error('加载数据失败:', err);
      setError('加载数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 更新提交状态
   */
  const updateSubmissionStatus = async (id: string, newStatus: ContactSubmission['status']) => {
    try {
      await ContactService.updateSubmissionStatus(id, newStatus);
      
      // 更新本地状态
      setSubmissions(prev => 
        prev.map(submission => 
          submission.id === id 
            ? { ...submission, status: newStatus, updated_at: new Date().toISOString() }
            : submission
        )
      );
      
      console.log(`已更新提交 ${id} 的状态为 ${newStatus}`);
    } catch (err) {
      console.error('更新状态失败:', err);
      setError('更新状态失败，请稍后重试');
    }
  };

  /**
   * 删除提交记录
   */
  const deleteSubmission = async (id: string) => {
    if (!confirm('确定要删除这条记录吗？此操作不可恢复。')) {
      return;
    }
    
    try {
      await ContactService.deleteSubmission(id);
      
      // 更新本地状态
      setSubmissions(prev => prev.filter(submission => submission.id !== id));
      
      console.log(`已删除提交记录 ${id}`);
    } catch (err) {
      console.error('删除记录失败:', err);
      setError('删除记录失败，请稍后重试');
    }
  };

  /**
   * 筛选和搜索数据
   */
  const filteredSubmissions = submissions.filter(submission => {
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.phone.includes(searchTerm) ||
      submission.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  /**
   * 获取状态显示信息
   */
  const getStatusInfo = (status: ContactSubmission['status']) => {
    switch (status) {
      case 'pending':
        return {
          label: '待处理',
          icon: ClockIcon,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'contacted':
        return {
          label: '已联系',
          icon: CheckCircleIcon,
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'resolved':
        return {
          label: '已解决',
          icon: CheckCircleIcon,
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      default:
        return {
          label: '未知',
          icon: ExclamationTriangleIcon,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  /**
   * 格式化日期
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadSubmissions();
  }, []);

  return (
    <>
      <SEO
        title="管理后台 - 联系表单管理"
        description="管理联系表单提交数据，查看和处理客户咨询"
        keywords="管理后台,联系表单,客户管理"
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatedContainer animation={{ type: 'fade-in', duration: 500 }}>
            {/* 页面标题 */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                联系表单管理
              </h1>
              <p className="text-gray-600">
                查看和管理客户提交的联系表单数据
              </p>
            </div>

            {/* 筛选和搜索栏 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* 状态筛选 */}
                <div className="flex items-center gap-2">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">全部状态</option>
                    <option value="pending">待处理</option>
                    <option value="contacted">已联系</option>
                    <option value="resolved">已解决</option>
                  </select>
                </div>

                {/* 搜索框 */}
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索姓名、电话、邮箱或主题..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* 刷新按钮 */}
                <button
                  onClick={loadSubmissions}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? '加载中...' : '刷新'}
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* 数据统计 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-2xl font-bold text-gray-900">{submissions.length}</div>
                <div className="text-sm text-gray-600">总提交数</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {submissions.filter(s => s.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">待处理</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {submissions.filter(s => s.status === 'contacted').length}
                </div>
                <div className="text-sm text-gray-600">已联系</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-2xl font-bold text-green-600">
                  {submissions.filter(s => s.status === 'resolved').length}
                </div>
                <div className="text-sm text-gray-600">已解决</div>
              </div>
            </div>

            {/* 数据表格 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">加载中...</p>
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-600">暂无数据</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          联系人
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          主题
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          课程兴趣
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          状态
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          提交时间
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredSubmissions.map((submission) => {
                        const statusInfo = getStatusInfo(submission.status);
                        const StatusIcon = statusInfo.icon;
                        
                        return (
                          <tr key={submission.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {submission.name}
                                  </div>
                                  <div className="text-sm text-gray-500 flex items-center">
                                    <PhoneIcon className="h-4 w-4 mr-1" />
                                    {submission.phone}
                                  </div>
                                  {submission.email && (
                                    <div className="text-sm text-gray-500 flex items-center">
                                      <EnvelopeIcon className="h-4 w-4 mr-1" />
                                      {submission.email}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {submission.subject}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {submission.course_interest || '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={cn(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                                statusInfo.className
                              )}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusInfo.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                                {formatDate(submission.created_at)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedSubmission(submission);
                                    setShowDetailModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                  title="查看详情"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                <select
                                  value={submission.status}
                                  onChange={(e) => updateSubmissionStatus(submission.id, e.target.value as ContactSubmission['status'])}
                                  className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                  <option value="pending">待处理</option>
                                  <option value="contacted">已联系</option>
                                  <option value="resolved">已解决</option>
                                </select>
                                <button
                                  onClick={() => deleteSubmission(submission.id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded"
                                  title="删除记录"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </AnimatedContainer>
        </div>

        {/* 详情模态框 */}
        {showDetailModal && selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    联系表单详情
                  </h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                    <p className="text-gray-900">{selectedSubmission.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">电话</label>
                    <p className="text-gray-900">{selectedSubmission.phone}</p>
                  </div>
                  
                  {selectedSubmission.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                      <p className="text-gray-900">{selectedSubmission.email}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">主题</label>
                    <p className="text-gray-900">{selectedSubmission.subject}</p>
                  </div>
                  
                  {selectedSubmission.course_interest && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">感兴趣的课程</label>
                      <p className="text-gray-900">{selectedSubmission.course_interest}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">留言内容</label>
                    <div className="bg-gray-50 rounded-md p-3">
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedSubmission.message}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">提交时间</label>
                      <p className="text-gray-900">{formatDate(selectedSubmission.created_at)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">更新时间</label>
                      <p className="text-gray-900">{formatDate(selectedSubmission.updated_at)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                    <div className="flex items-center">
                      {(() => {
                        const statusInfo = getStatusInfo(selectedSubmission.status);
                        const StatusIcon = statusInfo.icon;
                        return (
                          <span className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                            statusInfo.className
                          )}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminPage;