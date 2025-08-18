/**
 * 图片选择器组件
 * 从Supabase媒体库中选择图片
 */

import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, PhotoIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { MediaService } from '../../services/adminService';
import type { MediaFile } from '../../types/database';
import { supabase } from '../../lib/supabase';

interface ImageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
  currentValue?: string;
}

/**
 * 图片选择器组件
 */
export const ImageSelector: React.FC<ImageSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentValue
}) => {
  const [images, setImages] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(currentValue || null);
  const [error, setError] = useState<string | null>(null);

  /**
   * 获取图片列表
   */
  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await MediaService.getMediaFiles({
        fileType: 'image',
        search: searchTerm || undefined,
        limit: 50
      });
      
      setImages(data || []);
    } catch (err) {
      console.error('获取图片列表失败:', err);
      setError('获取图片列表失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取图片URL
   */
  const getImageUrl = (filePath: string): string => {
    const { data } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  /**
   * 处理图片选择
   */
  const handleImageSelect = (image: MediaFile) => {
    const imageUrl = getImageUrl(image.file_path);
    setSelectedImage(imageUrl);
  };

  /**
   * 确认选择
   */
  const handleConfirm = () => {
    if (selectedImage) {
      onSelect(selectedImage);
      onClose();
    }
  };

  /**
   * 处理搜索
   */
  const handleSearch = () => {
    fetchImages();
  };

  /**
   * 处理键盘事件
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 组件挂载时获取图片列表
  useEffect(() => {
    if (isOpen) {
      fetchImages();
      setSelectedImage(currentValue || null);
    }
  }, [isOpen, currentValue]);

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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* 模态框头部 */}
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    选择图片
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

                {/* 搜索栏 */}
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="搜索图片..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <button
                      type="button"
                      onClick={handleSearch}
                      className="absolute right-2 top-1.5 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      搜索
                    </button>
                  </div>
                </div>

                {/* 错误提示 */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* 图片网格 */}
                <div className="mb-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">加载中...</span>
                    </div>
                  ) : images.length === 0 ? (
                    <div className="text-center py-12">
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">没有找到图片</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ? '尝试使用不同的搜索词' : '暂无可用图片'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-96 overflow-y-auto">
                      {images.map((image) => {
                        const imageUrl = getImageUrl(image.file_path);
                        const isSelected = selectedImage === imageUrl;
                        
                        return (
                          <div
                            key={image.id}
                            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                              isSelected
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleImageSelect(image)}
                          >
                            <div className="aspect-square">
                              <img
                                src={imageUrl}
                                alt={image.alt_text || image.filename}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                            {isSelected && (
                              <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                              {image.filename}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 当前选择的图片预览 */}
                {selectedImage && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">已选择的图片:</h4>
                    <div className="flex items-center space-x-3">
                      <img
                        src={selectedImage}
                        alt="选择的图片"
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 break-all">{selectedImage}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 底部按钮 */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={onClose}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleConfirm}
                    disabled={!selectedImage}
                  >
                    确认选择
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ImageSelector;