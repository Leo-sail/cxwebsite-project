import React, { useState, useEffect } from 'react';
import { Modal } from '../../components';
import { CaseService } from '../../services/adminService';
import { ImageSelectionArea } from './ImageSelectionArea';
import { toast } from 'react-hot-toast';

/**
 * 案例表单数据类型
 */
interface CaseFormData {
  student_name: string;
  exam_score: number;
  target_school: string;
  major: string;
  year: number;
  story: string;
  image_url?: string;
  status: 'draft' | 'published';
  featured: boolean;
}

/**
 * 案例表单组件属性
 */
interface CaseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  caseId?: string;
  initialData?: Partial<CaseFormData>;
}

/**
 * 案例表单组件
 */
const CaseForm: React.FC<CaseFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  caseId,
  initialData,
}) => {
  const [formData, setFormData] = useState<CaseFormData>({
    student_name: '',
    exam_score: 0,
    target_school: '',
    major: '',
    year: new Date().getFullYear(),
    story: '',
    image_url: '',
    status: 'draft',
    featured: false,
  });

  const [loading, setLoading] = useState(false);

  // 状态选项
  const statusOptions = [
    { value: 'draft', label: '草稿' },
    { value: 'published', label: '已发布' },
  ];



  /**
   * 初始化表单数据
   */
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
      }));
    } else {
      setFormData({
        student_name: '',
        exam_score: 0,
        target_school: '',
        major: '',
        year: new Date().getFullYear(),
        story: '',
        image_url: '',
        status: 'draft',
        featured: false,
      });
    }
  }, [initialData, isOpen]);

  /**
   * 处理表单字段变化
   */
  const handleChange = (field: keyof CaseFormData, value: string | number | boolean | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };



  /**
   * 表单验证
   */
  const validateForm = (): boolean => {
    if (!formData.student_name.trim()) {
      toast.error('请输入学员姓名');
      return false;
    }
    if (!formData.target_school.trim()) {
      toast.error('请选择目标学校');
      return false;
    }
    if (!formData.major.trim()) {
      toast.error('请选择专业');
      return false;
    }
    if (!formData.story.trim()) {
      toast.error('请输入案例故事');
      return false;
    }
    if (formData.exam_score <= 0) {
      toast.error('考研成绩必须大于0');
      return false;
    }
    if (formData.exam_score > 500) {
      toast.error('考研成绩不能超过500分');
      return false;
    }
    return true;
  };

  /**
   * 提交表单
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // 映射表单数据到数据库字段
      const submitData = {
        name: formData.student_name,
        undergraduate_school: null, // 本科院校暂不使用
        admitted_school: `${formData.target_school} - ${formData.major}`, // 录取学校和专业
        exam_score: formData.exam_score?.toString(),
        testimonial: formData.story,
        image_url: formData.image_url || null,
        year: formData.year, // 添加年份字段映射
        is_active: formData.status === 'published',
        sort_order: 0,
      };

      if (caseId) {
        await CaseService.updateCase(caseId, submitData);
        toast.success('案例更新成功');
      } else {
        await CaseService.createCase(submitData);
        toast.success('案例创建成功');
      }
      
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error('保存失败:', error);
      toast.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={caseId ? '编辑案例' : '新增案例'}
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* 学员姓名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              学员姓名 *
            </label>
            <input
              type="text"
              value={formData.student_name}
              onChange={(e) => handleChange('student_name', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入学员姓名"
              required
            />
          </div>

          {/* 录取学校 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              录取学校 *
            </label>
            <input
              type="text"
              value={formData.target_school}
              onChange={(e) => handleChange('target_school', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入录取学校"
              required
            />
          </div>

          {/* 专业 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              专业 *
            </label>
            <input
              type="text"
              value={formData.major}
              onChange={(e) => handleChange('major', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入专业"
              required
            />
          </div>

          {/* 年份 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              年份 *
            </label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => handleChange('year', parseInt(e.target.value) || new Date().getFullYear())}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入年份"
              min="2020"
              max="2030"
              required
            />
          </div>

          {/* 考研成绩 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              考研成绩(分数) *
            </label>
            <input
              type="number"
              value={formData.exam_score}
              onChange={(e) => handleChange('exam_score', parseInt(e.target.value) || 0)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入考研成绩"
              min="0"
              max="500"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              预览: 考研成绩 {formData.exam_score}分
            </p>
          </div>

          {/* 状态 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              状态
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value as 'draft' | 'published')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 是否推荐 */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => handleChange('featured', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">推荐案例</span>
            </label>
          </div>

          {/* 案例故事 */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              案例故事 *
            </label>
            <textarea
              value={formData.story}
              onChange={(e) => handleChange('story', e.target.value)}
              rows={6}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入详细的案例故事"
              required
            />
          </div>

          {/* 图片选择 */}
          <div className="sm:col-span-2">
            <ImageSelectionArea
              value={formData.image_url}
              onChange={(imageUrl) => handleChange('image_url', imageUrl || undefined)}
              label="案例图片"
              helpText="选择一张图片来展示这个成功案例"
            />
          </div>
        </div>

        {/* 表单操作按钮 */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '保存中...' : (caseId ? '更新案例' : '创建案例')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CaseForm;