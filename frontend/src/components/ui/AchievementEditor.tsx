import React from 'react';
import { PlusIcon, TrashIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils';
import type { Achievement } from '../../types';
import CollapsibleSection from './CollapsibleSection';

/**
 * 成就荣誉编辑器组件的属性接口
 */
interface AchievementEditorProps {
  /** 成就荣誉数据 */
  value: Achievement[];
  /** 数据变化回调 */
  onChange: (value: Achievement[]) => void;
  /** 是否只读 */
  readOnly?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 错误信息 */
  error?: string;
}

/**
 * 创建空的成就荣誉对象
 */
const createEmptyAchievement = (): Achievement => ({
  id: crypto.randomUUID(),
  title: '',
  type: '',
  date_received: '',
  issuing_organization: '',
  description: ''
});

/**
 * 成就类型选项
 */
const ACHIEVEMENT_TYPES = [
  { value: '教学奖项', label: '教学奖项' },
  { value: '学术荣誉', label: '学术荣誉' },
  { value: '专业认证', label: '专业认证' },
  { value: '科研成果', label: '科研成果' },
  { value: '社会荣誉', label: '社会荣誉' },
  { value: '竞赛获奖', label: '竞赛获奖' },
  { value: '其他', label: '其他' }
];

/**
 * 成就荣誉编辑器组件
 * 支持添加、编辑、删除成就荣誉信息
 */
export const AchievementEditor: React.FC<AchievementEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  className,
  error
}) => {
  /**
   * 添加新的成就荣誉
   */
  const handleAdd = () => {
    if (readOnly) return;
    onChange([...value, createEmptyAchievement()]);
  };

  /**
   * 删除指定索引的成就荣誉
   */
  const handleRemove = (index: number) => {
    if (readOnly) return;
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  /**
   * 更新指定索引的成就荣誉
   */
  const handleUpdate = (index: number, field: keyof Achievement, fieldValue: any) => {
    if (readOnly) return;
    const newValue = value.map((item, i) => 
      i === index ? { ...item, [field]: fieldValue } : item
    );
    onChange(newValue);
  };

  /**
   * 格式化日期为YYYY-MM格式
   */
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 7); // YYYY-MM
  };

  /**
   * 处理日期变化
   */
  const handleDateChange = (index: number, dateValue: string) => {
    // 将YYYY-MM格式转换为完整日期字符串
    const fullDate = dateValue ? `${dateValue}-01` : '';
    handleUpdate(index, 'date_received', fullDate);
  };

  return (
    <CollapsibleSection 
      title="成就荣誉" 
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

        {/* 成就荣誉列表 */}
        {value.map((achievement, index) => (
          <div key={index} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium text-gray-900">成就荣誉 {index + 1}</h4>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="删除此成就荣誉"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 荣誉标题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  荣誉标题 *
                </label>
                <input
                  type="text"
                  value={achievement.title}
                  onChange={(e) => handleUpdate(index, 'title', e.target.value)}
                  placeholder="如：优秀教师奖、教学成果一等奖"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly={readOnly}
                  required
                />
              </div>

              {/* 荣誉类型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  荣誉类型 *
                </label>
                <select
                  value={achievement.type}
                  onChange={(e) => handleUpdate(index, 'type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={readOnly}
                  required
                >
                  <option value="">请选择荣誉类型</option>
                  {ACHIEVEMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 获得时间 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  获得时间 *
                </label>
                <div className="relative">
                  <input
                    type="month"
                    value={formatDateForInput(achievement.date_received)}
                    onChange={(e) => handleDateChange(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly={readOnly}
                    required
                  />
                  <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* 颁发机构 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  颁发机构 *
                </label>
                <input
                  type="text"
                  value={achievement.issuing_organization}
                  onChange={(e) => handleUpdate(index, 'issuing_organization', e.target.value)}
                  placeholder="如：教育部、学校、行业协会"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly={readOnly}
                  required
                />
              </div>
            </div>

            {/* 描述 */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                详细描述
              </label>
              <textarea
                value={achievement.description || ''}
                onChange={(e) => handleUpdate(index, 'description', e.target.value)}
                placeholder="描述获奖背景、意义、影响等"
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
            添加成就荣誉
          </button>
        )}

        {/* 空状态提示 */}
        {value.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-lg mb-2">暂无成就荣誉信息</div>
            <div className="text-sm">点击上方按钮添加成就荣誉</div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
};

export default AchievementEditor;