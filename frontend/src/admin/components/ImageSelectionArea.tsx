/**
 * 图片选择区域组件
 * 为表单提供图片选择、预览和管理功能
 */

import React, { useState } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ImageSelector } from './ImageSelector';

interface ImageSelectionAreaProps {
  /** 当前图片URL值 */
  value?: string;
  /** 图片URL变化回调 */
  onChange: (imageUrl: string | null) => void;
  /** 字段标签 */
  label?: string;
  /** 是否必填 */
  required?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 错误信息 */
  error?: string;
  /** 帮助文本 */
  helpText?: string;
}

/**
 * 图片选择区域组件
 * 提供图片选择、预览、清除功能的完整UI
 */
export const ImageSelectionArea: React.FC<ImageSelectionAreaProps> = ({
  value,
  onChange,
  label = '图片',
  required = false,
  disabled = false,
  error,
  helpText
}) => {
  // 图片选择器开关状态
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);

  /**
   * 打开图片选择器
   */
  const handleOpenSelector = () => {
    if (!disabled) {
      setIsImageSelectorOpen(true);
    }
  };

  /**
   * 关闭图片选择器
   */
  const handleCloseSelector = () => {
    setIsImageSelectorOpen(false);
  };

  /**
   * 处理图片选择
   */
  const handleImageSelect = (imageUrl: string) => {
    onChange(imageUrl);
    setIsImageSelectorOpen(false);
  };

  /**
   * 清除选中的图片
   */
  const handleClearImage = () => {
    onChange(null);
  };

  /**
   * 获取显示的图片URL
   */
  const getDisplayImageUrl = (): string | null => {
    if (!value) return null;
    // 如果是完整URL，直接返回
    if (value.startsWith('http')) {
      return value;
    }
    // 如果是相对路径，需要构建完整URL
    return value;
  };

  const displayImageUrl = getDisplayImageUrl();

  return (
    <div className="space-y-2">
      {/* 标签 */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* 图片选择区域 */}
      <div className="space-y-3">
        {/* 当前图片预览 */}
        {displayImageUrl ? (
          <div className="relative inline-block">
            <div className="w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              <img
                src={displayImageUrl}
                alt="选中的图片"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // 图片加载失败时显示占位符
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center text-gray-400">
                      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  `;
                }}
              />
            </div>
            {/* 清除按钮 */}
            {!disabled && (
              <button
                type="button"
                onClick={handleClearImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                title="清除图片"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          /* 空状态占位符 */
          <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">暂无图片</p>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleOpenSelector}
            disabled={disabled}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PhotoIcon className="w-4 h-4 mr-2" />
            {value ? '更换图片' : '选择图片'}
          </button>
          
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClearImage}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <XMarkIcon className="w-4 h-4 mr-2" />
              清除
            </button>
          )}
        </div>
      </div>

      {/* 帮助文本 */}
      {helpText && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}

      {/* 错误信息 */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* 图片选择器模态框 */}
      <ImageSelector
        isOpen={isImageSelectorOpen}
        onClose={handleCloseSelector}
        onSelect={handleImageSelect}
        currentValue={value}
      />
    </div>
  );
};

export default ImageSelectionArea;