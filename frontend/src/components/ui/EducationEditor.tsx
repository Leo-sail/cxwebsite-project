import React from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils';
import type { EducationBackground } from '../../types';
import CollapsibleSection from './CollapsibleSection';

/**
 * 教育背景编辑器组件的属性接口
 */
interface EducationEditorProps {
  /** 教育背景数据 */
  value: EducationBackground[];
  /** 数据变化回调 */
  onChange: (value: EducationBackground[]) => void;
  /** 是否只读 */
  readOnly?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 错误信息 */
  error?: string;
}

/**
 * 创建空的教育背景对象
 */
const createEmptyEducation = (): EducationBackground => ({
  id: crypto.randomUUID(),
  degree: '',
  major: '',
  school: '',
  start_year: new Date().getFullYear(),
  description: ''
});

/**
 * 教育背景编辑器组件
 * 支持添加、编辑、删除教育背景信息
 */
export const EducationEditor: React.FC<EducationEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  className,
  error
}) => {
  /**
   * 添加新的教育背景
   */
  const handleAdd = () => {
    if (readOnly) return;
    onChange([...value, createEmptyEducation()]);
  };

  /**
   * 删除指定索引的教育背景
   */
  const handleRemove = (index: number) => {
    if (readOnly) return;
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  /**
   * 更新指定索引的教育背景
   */
  const handleUpdate = (index: number, field: keyof EducationBackground, fieldValue: any) => {
    if (readOnly) return;
    const newValue = value.map((item, i) => 
      i === index ? { ...item, [field]: fieldValue } : item
    );
    onChange(newValue);
  };

  return (
    <CollapsibleSection 
      title="教育背景" 
      defaultOpen={true}
      className={cn('border border-gray-200 rounded-lg', className)}
    >
      <div className="space-y-4">
        {/* 错误信息显示 */}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {/* 教育背景列表 */}
        {value.map((education, index) => (
          <div key={index} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium text-gray-900">教育背景 {index + 1}</h4>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="删除此教育背景"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 学位 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  学位 *
                </label>
                <input
                  type="text"
                  value={education.degree}
                  onChange={(e) => handleUpdate(index, 'degree', e.target.value)}
                  placeholder="如：学士、硕士、博士"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly={readOnly}
                  required
                />
              </div>

              {/* 专业 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  专业 *
                </label>
                <input
                  type="text"
                  value={education.major}
                  onChange={(e) => handleUpdate(index, 'major', e.target.value)}
                  placeholder="如：计算机科学与技术"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly={readOnly}
                  required
                />
              </div>

              {/* 学校 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  学校 *
                </label>
                <input
                  type="text"
                  value={education.school}
                  onChange={(e) => handleUpdate(index, 'school', e.target.value)}
                  placeholder="如：清华大学"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly={readOnly}
                  required
                />
              </div>

              {/* 毕业年份 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  毕业年份 *
                </label>
                <input
                  type="number"
                  value={education.start_year}
                  onChange={(e) => handleUpdate(index, 'start_year', parseInt(e.target.value))}
                  min="1950"
                  max={new Date().getFullYear() + 10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly={readOnly}
                  required
                />
              </div>
            </div>

            {/* 描述 */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                描述
              </label>
              <textarea
                value={education.description || ''}
                onChange={(e) => handleUpdate(index, 'description', e.target.value)}
                placeholder="补充说明，如：专业排名、获得荣誉等"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                readOnly={readOnly}
              />
            </div>
          </div>
        ))}

        {/* 添加按钮 */}
        {!readOnly && (
          <button
            type="button"
            onClick={handleAdd}
            className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            添加教育背景
          </button>
        )}

        {/* 空状态提示 */}
        {value.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-lg mb-2">暂无教育背景信息</div>
            <div className="text-sm">点击上方按钮添加教育背景</div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
};

export default EducationEditor;