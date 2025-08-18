import React from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils';
import type { TeachingSubject } from '../../types';
import CollapsibleSection from './CollapsibleSection';

/**
 * 教学科目编辑器组件的属性接口
 */
interface SubjectEditorProps {
  /** 教学科目数据 */
  value: TeachingSubject[];
  /** 数据变化回调 */
  onChange: (value: TeachingSubject[]) => void;
  /** 是否只读 */
  readOnly?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 错误信息 */
  error?: string;
}

/**
 * 创建空的教学科目对象
 */
const createEmptySubject = (): TeachingSubject => ({
  id: crypto.randomUUID(),
  subject_name: '',
  level: '',
  years_of_experience: 0,
  specialization: '',
  description: ''
});

/**
 * 科目级别选项
 */
const LEVEL_OPTIONS = [
  { value: '初中', label: '初中' },
  { value: '高中', label: '高中' },
  { value: '大学', label: '大学' },
  { value: '研究生', label: '研究生' },
  { value: '成人教育', label: '成人教育' },
  { value: '职业培训', label: '职业培训' }
];

/**
 * 教学科目编辑器组件
 * 支持添加、编辑、删除教学科目信息
 */
export const SubjectEditor: React.FC<SubjectEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  className,
  error
}) => {
  /**
   * 添加新的教学科目
   */
  const handleAdd = () => {
    if (readOnly) return;
    onChange([...value, createEmptySubject()]);
  };

  /**
   * 删除指定索引的教学科目
   */
  const handleRemove = (index: number) => {
    if (readOnly) return;
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  /**
   * 更新指定索引的教学科目
   */
  const handleUpdate = (index: number, field: keyof TeachingSubject, fieldValue: any) => {
    if (readOnly) return;
    const newValue = value.map((item, i) => 
      i === index ? { ...item, [field]: fieldValue } : item
    );
    onChange(newValue);
  };

  return (
    <CollapsibleSection 
      title="教学科目" 
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

        {/* 教学科目列表 */}
        {value.map((subject, index) => (
          <div key={index} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium text-gray-900">教学科目 {index + 1}</h4>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="删除此教学科目"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 科目名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  科目名称 *
                </label>
                <input
                  type="text"
                  value={subject.subject_name}
                  onChange={(e) => handleUpdate(index, 'subject_name', e.target.value)}
                  placeholder="如：数学、英语、物理"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly={readOnly}
                  required
                />
              </div>

              {/* 教学级别 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  教学级别 *
                </label>
                <select
                  value={subject.level}
                  onChange={(e) => handleUpdate(index, 'level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={readOnly}
                  required
                >
                  <option value="">请选择教学级别</option>
                  {LEVEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 教学经验年数 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  教学经验（年）*
                </label>
                <input
                  type="number"
                  value={subject.years_of_experience}
                  onChange={(e) => handleUpdate(index, 'years_of_experience', parseInt(e.target.value) || 0)}
                  min="0"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly={readOnly}
                  required
                />
              </div>

              {/* 专业方向 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  专业方向
                </label>
                <input
                  type="text"
                  value={subject.specialization || ''}
                  onChange={(e) => handleUpdate(index, 'specialization', e.target.value)}
                  placeholder="如：代数、几何、语法、阅读理解"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly={readOnly}
                />
              </div>
            </div>

            {/* 描述 */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                教学特色与方法
              </label>
              <textarea
                value={subject.description || ''}
                onChange={(e) => handleUpdate(index, 'description', e.target.value)}
                placeholder="描述教学特色、方法、成果等"
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
            添加教学科目
          </button>
        )}

        {/* 空状态提示 */}
        {value.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-lg mb-2">暂无教学科目信息</div>
            <div className="text-sm">点击上方按钮添加教学科目</div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
};

export default SubjectEditor;