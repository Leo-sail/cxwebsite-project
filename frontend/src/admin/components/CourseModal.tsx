/**
 * 课程模态框组件
 * 支持查看、编辑、新增课程的统一模态框界面
 */

import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { COURSE_FORM_FIELDS } from '../config/courseFormConfig';
import type { ModalMode } from '../hooks/useCourseModal';
import type { Course } from '../../types/database';
import ImageSelector from './ImageSelector';

interface CourseModalProps {
  isOpen: boolean;
  mode: ModalMode;
  currentCourse: Course | null;
  formData: Record<string, any>;
  errors: Record<string, string>;
  loading: boolean;
  submitting: boolean;
  onClose: () => void;
  onUpdateFormData: (field: string, value: any) => void;
  onSubmit: () => Promise<boolean>;
}

/**
 * 获取模态框标题
 */
const getModalTitle = (mode: ModalMode): string => {
  switch (mode) {
    case 'view':
      return '查看课程';
    case 'edit':
      return '编辑课程';
    case 'create':
      return '新增课程';
    default:
      return '课程';
  }
};

/**
 * 渲染表单字段
 */
const renderFormField = (
  field: typeof COURSE_FORM_FIELDS[0],
  value: any,
  error: string,
  isReadonly: boolean,
  onChange: (value: any) => void,
  onOpenImageSelector?: () => void
) => {
  const baseInputClasses = `
    mt-1 block w-full rounded-md border-gray-300 shadow-sm 
    focus:border-blue-500 focus:ring-blue-500 sm:text-sm
    ${isReadonly ? 'bg-gray-50 cursor-not-allowed' : ''}
    ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
  `;

  const renderInput = () => {
    // 特殊处理图片URL字段
    if (field.name === 'image_url') {
      return (
        <div className="space-y-2">
          <div className="flex space-x-2">
            <input
              type="url"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder}
              readOnly={isReadonly}
              className={`${baseInputClasses} flex-1`}
            />
            {!isReadonly && onOpenImageSelector && (
              <button
                type="button"
                onClick={onOpenImageSelector}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-1"
              >
                <PhotoIcon className="h-4 w-4" />
                <span>选择图片</span>
              </button>
            )}
          </div>
          {value && (
            <div className="mt-2">
              <img
                src={value}
                alt="课程图片预览"
                className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      );
    }

    switch (field.type) {
      case 'text':
      case 'url':
        return (
          <input
            type={field.type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.rules?.find(rule => rule.maxLength)?.maxLength}
            readOnly={isReadonly}
            className={baseInputClasses}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.rules?.find(rule => rule.maxLength)?.maxLength}
            rows={4}
            readOnly={isReadonly}
            className={baseInputClasses}
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={isReadonly}
            className={baseInputClasses}
          >
            <option value="">请选择{field.label}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={field.placeholder}
            min={field.rules?.find(rule => rule.min)?.min}
            max={field.rules?.find(rule => rule.max)?.max}
            readOnly={isReadonly}
            className={baseInputClasses}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              disabled={isReadonly}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              {field.placeholder || '启用'}
            </label>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            readOnly={isReadonly}
            className={baseInputClasses}
          />
        );
    }
  };

  return (
    <div key={field.name} className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && !isReadonly && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>
      {renderInput()}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {field.description && (
        <p className="mt-1 text-sm text-gray-500">{field.description}</p>
      )}
    </div>
  );
};

/**
 * 课程模态框组件
 */
export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  mode,
  currentCourse,
  formData,
  errors,
  loading,
  submitting,
  onClose,
  onUpdateFormData,
  onSubmit
}) => {
  const isReadonly = mode === 'view';
  const title = getModalTitle(mode);
  
  // 图片选择器状态
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);

  /**
   * 打开图片选择器
   */
  const handleOpenImageSelector = () => {
    setIsImageSelectorOpen(true);
  };

  /**
   * 关闭图片选择器
   */
  const handleCloseImageSelector = () => {
    setIsImageSelectorOpen(false);
  };

  /**
   * 选择图片
   */
  const handleSelectImage = (imageUrl: string) => {
    onUpdateFormData('image_url', imageUrl);
    setIsImageSelectorOpen(false);
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadonly) return;
    
    await onSubmit();
    // 如果提交成功，模态框会在 onSubmit 中自动关闭
  };

  /**
   * 处理键盘事件
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel 
                className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                onKeyDown={handleKeyDown}
              >
                {/* 模态框头部 */}
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {title}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">关闭</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* 加载状态 */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">加载中...</span>
                  </div>
                ) : (
                  /* 表单内容 */
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 课程ID显示（仅编辑和查看模式） */}
                    {(mode === 'edit' || mode === 'view') && currentCourse && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-md">
                        <span className="text-sm text-gray-600">
                          课程ID: {currentCourse.id}
                        </span>
                        {currentCourse.created_at && (
                          <span className="ml-4 text-sm text-gray-600">
                            创建时间: {new Date(currentCourse.created_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}

                    {/* 表单字段 */}
                    <div className="max-h-96 overflow-y-auto">
                      {COURSE_FORM_FIELDS.map((field) =>
                        renderFormField(
                          field,
                          formData[field.name],
                          errors[field.name] || '',
                          isReadonly,
                          (value) => onUpdateFormData(field.name, value),
                          handleOpenImageSelector
                        )
                      )}
                    </div>

                    {/* 图片选择器 */}
                    <ImageSelector
                      isOpen={isImageSelectorOpen}
                      onClose={handleCloseImageSelector}
                      onSelect={handleSelectImage}
                    />

                    {/* 模态框底部按钮 */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={onClose}
                        disabled={submitting}
                      >
                        {isReadonly ? '关闭' : '取消'}
                      </button>
                      
                      {!isReadonly && (
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                              {mode === 'create' ? '创建中...' : '保存中...'}
                            </>
                          ) : (
                            mode === 'create' ? '创建课程' : '保存修改'
                          )}
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CourseModal;