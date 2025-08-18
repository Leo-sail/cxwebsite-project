import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  PhotoIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { TeacherService } from '../../services/adminService';
import { toast } from 'react-hot-toast';
import CollapsibleSection from '../../components/ui/CollapsibleSection';
import EducationEditor from '../../components/ui/EducationEditor';
import SubjectEditor from '../../components/ui/SubjectEditor';
import AchievementEditor from '../../components/ui/AchievementEditor';
import type { EducationBackground, TeachingSubject, Achievement } from '../../types/api';
import type { Json } from '../../types/database';

/**
 * 教师表单数据类型
 */
interface TeacherFormData {
  name: string;
  description: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  education_background: EducationBackground[];
  teaching_subjects: TeachingSubject[];
  achievements: Achievement[];
}

/**
 * 教师表单组件属性
 */
interface TeacherFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teacherId?: string;
  initialData?: Partial<TeacherFormData>;
}

/**
 * 教师表单组件
 */
const TeacherForm: React.FC<TeacherFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  teacherId,
  initialData,
}) => {
  const [formData, setFormData] = useState<TeacherFormData>({
    name: '',
    description: '',
    image_url: '',
    is_active: true,
    sort_order: 0,
    education_background: [],
    teaching_subjects: [],
    achievements: [],
  });
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // 初始化表单数据
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        image_url: initialData.image_url || '',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
        sort_order: initialData.sort_order || 0,
        education_background: (initialData as any)?.education_background || [],
        teaching_subjects: (initialData as any)?.teaching_subjects || [],
        achievements: (initialData as any)?.achievements || [],
      });
      setAvatarPreview(initialData.image_url && initialData.image_url.trim() !== '' ? initialData.image_url : null);
    } else {
      // 重置表单
      setFormData({
        name: '',
        description: '',
        image_url: '',
        is_active: true,
        sort_order: 0,
        education_background: [],
        teaching_subjects: [],
        achievements: [],
      });
      setAvatarPreview(null);
      setAvatarFile(null);
    }
  }, [initialData, isOpen]);

  /**
   * 处理头像文件选择
   */
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };



  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('请填写教师姓名');
      return;
    }

    try {
      setLoading(true);
      
      let imageUrl = formData.image_url;
      
      // 如果有新的头像文件，先上传
      if (avatarFile) {
        imageUrl = await TeacherService.uploadAvatar(avatarFile);
      }

      const submitData = {
        name: formData.name,
        description: formData.description,
        image_url: imageUrl || null,
        is_active: formData.is_active,
        sort_order: formData.sort_order,
        education_background: formData.education_background as unknown as Json,
        teaching_subjects: formData.teaching_subjects as unknown as Json,
        achievements: formData.achievements as unknown as Json,
      };

      if (teacherId) {
        // 更新教师
        await TeacherService.updateTeacher(teacherId, submitData);
        toast.success('教师信息更新成功');
      } else {
        // 创建教师
        await TeacherService.createTeacher(submitData);
        toast.success('教师创建成功');
      }
      
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error('保存教师失败:', error);
      const errorMessage = error instanceof Error ? error.message : '保存失败，请重试';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full z-10">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {teacherId ? '编辑教师' : '新增教师'}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* 头像上传 */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    头像
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {avatarPreview ? (
                        <img
                          className="h-20 w-20 rounded-full object-cover"
                          src={avatarPreview}
                          alt="头像预览"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                          <UserIcon className="h-10 w-10 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <PhotoIcon className="h-4 w-4 mr-2" />
                        选择头像
                      </label>
                    </div>
                  </div>
                </div>

                {/* 基本信息 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    姓名 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    排序
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.sort_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    状态
                  </label>
                  <select
                    value={formData.is_active ? 'active' : 'inactive'}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'active' }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="active">在职</option>
                    <option value="inactive">离职</option>
                  </select>
                </div>

                {/* 描述 */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="请输入教师描述"
                  />
                </div>
              </div>

              {/* 扩展信息折叠面板 */}
              <div className="mt-6 space-y-4">
                <CollapsibleSection title="教育背景" defaultOpen={false}>
                  <EducationEditor
                    value={formData.education_background}
                    onChange={(value) => setFormData(prev => ({ ...prev, education_background: value }))}
                  />
                </CollapsibleSection>

                <CollapsibleSection title="教学科目" defaultOpen={false}>
                  <SubjectEditor
                    value={formData.teaching_subjects}
                    onChange={(value) => setFormData(prev => ({ ...prev, teaching_subjects: value }))}
                  />
                </CollapsibleSection>

                <CollapsibleSection title="成就荣誉" defaultOpen={false}>
                  <AchievementEditor
                    value={formData.achievements}
                    onChange={(value) => setFormData(prev => ({ ...prev, achievements: value }))}
                  />
                </CollapsibleSection>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {loading ? '保存中...' : (teacherId ? '更新' : '创建')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherForm;