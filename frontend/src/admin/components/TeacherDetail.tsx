import React from 'react';
import {
  XMarkIcon,
  UserIcon,
  AcademicCapIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { Database } from '../../types/database';

type Teacher = Database['public']['Tables']['teachers']['Row'];

/**
 * 教师详情组件属性
 */
interface TeacherDetailProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher;
}

/**
 * 教师详情组件
 */
const TeacherDetail: React.FC<TeacherDetailProps> = ({
  isOpen,
  onClose,
  teacher,
}) => {
  if (!isOpen) return null;

  /**
   * 获取状态标签样式
   */
  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'inactive':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* 背景遮罩 */}
        <div 
          className="fixed inset-0 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* 居中对齐 */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* 弹窗内容 */}
        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full z-10">
          {/* 头部 */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                教师详情
              </h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150"
                onClick={onClose}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* 内容 */}
          <div className="bg-white px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 左侧：基本信息 */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6">
                  {/* 头像 */}
                  <div className="flex justify-center mb-4">
                    {teacher.image_url ? (
                      <img
                        src={teacher.image_url}
                        alt={teacher.name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center">
                        <UserIcon className="h-12 w-12 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* 姓名和职位 */}
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-semibold text-gray-900 mb-1">
                      {teacher.name}
                    </h4>
                    <p className="text-gray-600 mb-2">专业讲师</p>
                    <span className={getStatusBadge(teacher.is_active ? 'active' : 'inactive')}>
                      {teacher.is_active ? '在职' : '离职'}
                    </span>
                  </div>

                  {/* 基本信息 */}
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      <span>5 年教学经验</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 右侧：详细信息 */}
              <div className="lg:col-span-2 space-y-6">
                {/* 个人简介 */}
                <div>
                  <h5 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2" />
                    个人简介
                  </h5>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">
                      {teacher.description || '暂无个人简介'}
                    </p>
                  </div>
                </div>

                {/* 教育背景 */}
                <div>
                  <h5 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <AcademicCapIcon className="h-5 w-5 mr-2" />
                    教育背景
                  </h5>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">
                      暂无教育背景信息
                    </p>
                  </div>
                </div>

                {/* 教学科目 */}
                <div>
                  <h5 className="text-lg font-medium text-gray-900 mb-3">
                    教学科目
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      考研专业课
                    </span>
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      学术指导
                    </span>
                  </div>
                </div>

                {/* 成就荣誉 */}
                <div>
                  <h5 className="text-lg font-medium text-gray-900 mb-3">
                    成就荣誉
                  </h5>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <span>优秀教学成果</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <span>学生满意度高</span>
                    </div>
                  </div>
                </div>

                {/* 统计信息 */}
                <div>
                  <h5 className="text-lg font-medium text-gray-900 mb-3">
                    统计信息
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {0}
                      </div>
                      <div className="text-sm text-blue-600">授课数量</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {0}
                      </div>
                      <div className="text-sm text-green-600">学员数量</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 底部 */}
          <div className="bg-gray-50 px-6 py-3">
            <div className="flex justify-end">
              <button
                type="button"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={onClose}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetail;