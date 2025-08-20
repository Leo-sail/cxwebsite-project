/**
 * 图片画廊组件
 * 用于显示和管理已上传的图片
 */
import React, { useState, useEffect, useCallback } from 'react';
import { ImageUploadService } from '../../services/imageUploadService';
import type { Database } from '../../types/database';
import { isValidImageSrc } from '../../utils/mediaValidation';

type ImageInfo = Database['public']['Tables']['media_files']['Row'];

/**
 * 图片画廊组件属性接口
 */
export interface ImageGalleryProps {
  /** 页面ID，用于筛选图片 */
  pageId?: string;
  /** 是否可选择图片 */
  selectable?: boolean;
  /** 是否支持多选 */
  multiSelect?: boolean;
  /** 选中的图片回调 */
  onImageSelect?: (images: ImageInfo[]) => void;
  /** 图片删除回调 */
  onImageDelete?: (imageId: string) => void;
  /** 自定义样式类名 */
  className?: string;
  /** 每页显示数量 */
  pageSize?: number;
}

/**
 * 图片画廊组件
 */
export const ImageGallery: React.FC<ImageGalleryProps> = ({
  pageId,
  selectable = false,
  multiSelect = false,
  onImageSelect,
  onImageDelete,
  className = '',
  pageSize = 20
}) => {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  /**
   * 加载图片列表
   */
  const loadImages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await ImageUploadService.getImages(
        currentPage,
        pageSize,
        'image'
      );
      
      setImages(result.data);
      setTotalCount(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载图片失败');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, pageId]);

  /**
   * 初始化加载
   */
  useEffect(() => {
    loadImages();
  }, [loadImages]);

  /**
   * 处理图片选择
   */
  const handleImageSelect = useCallback((image: ImageInfo) => {
    if (!selectable) return;

    setSelectedImages(prev => {
      const newSelected = new Set(prev);
      
      if (multiSelect) {
        if (newSelected.has(image.id)) {
          newSelected.delete(image.id);
        } else {
          newSelected.add(image.id);
        }
      } else {
        newSelected.clear();
        newSelected.add(image.id);
      }
      
      // 触发回调
      const selectedImageList = images.filter(img => newSelected.has(img.id));
      onImageSelect?.(selectedImageList);
      
      return newSelected;
    });
  }, [selectable, multiSelect, images, onImageSelect]);

  /**
   * 处理图片删除
   */
  const handleImageDelete = useCallback(async (imageId: string) => {
    try {
      await ImageUploadService.deleteImage(imageId);
      
      // 从列表中移除
      setImages(prev => prev.filter(img => img.id !== imageId));
      
      // 从选中列表中移除
      setSelectedImages(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(imageId);
        return newSelected;
      });
      
      // 更新总数
      setTotalCount(prev => prev - 1);
      
      // 触发回调
      onImageDelete?.(imageId);
      
      setShowDeleteModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除图片失败');
    }
  }, [onImageDelete]);

  /**
   * 处理页面变化
   */
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  /**
   * 格式化文件大小
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * 格式化日期
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * 计算总页数
   */
  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) {
    return (
      <div className={`image-gallery ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">加载中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`image-gallery ${className}`}>
        <div className="flex flex-col items-center justify-center h-64 text-red-600">
          <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium mb-2">加载失败</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={loadImages}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`image-gallery ${className}`}>
      {/* 头部信息 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900">图片库</h3>
          <span className="text-sm text-gray-500">共 {totalCount} 张图片</span>
        </div>
        
        {selectable && selectedImages.size > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">已选择 {selectedImages.size} 张</span>
            <button
              onClick={() => {
                setSelectedImages(new Set());
                onImageSelect?.([]);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              清除选择
            </button>
          </div>
        )}
      </div>

      {/* 图片网格 */}
      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg font-medium mb-2">暂无图片</p>
          <p className="text-sm">上传一些图片开始使用吧</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {images.map((image) => {
            const isSelected = selectedImages.has(image.id);
            
            return (
              <div
                key={image.id}
                className={`relative group bg-white rounded-lg border-2 overflow-hidden transition-all duration-200 ${
                  selectable ? 'cursor-pointer' : ''
                } ${
                  isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleImageSelect(image)}
              >
                {/* 图片 */}
                <div className="aspect-square overflow-hidden">
                  {isValidImageSrc(image.file_path) ? (
                    <img
                      src={image.file_path}
                      alt={image.filename}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">无效图片</span>
                    </div>
                  )}
                </div>
                
                {/* 选择指示器 */}
                {selectable && (
                  <div className={`absolute top-2 left-2 w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                    isSelected 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'bg-white border-gray-300 group-hover:border-blue-400'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                )}
                
                {/* 操作按钮 */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex space-x-1">
                    {/* 查看按钮 */}
                    <a
                      href={image.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </a>
                    
                    {/* 删除按钮 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteModal(image.id);
                      }}
                      className="p-1.5 bg-red-500 bg-opacity-80 text-white rounded-full hover:bg-opacity-100 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* 图片信息 */}
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate" title={image.filename}>
                    {image.filename}
                  </p>
                  <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                    <span>{formatFileSize(image.file_size)}</span>
                    <span>{image.width} × {image.height}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(image.created_at || '')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-8 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === page
                      ? 'text-blue-600 bg-blue-50 border border-blue-300'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      )}

      {/* 删除确认模态框 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">确认删除</h3>
            <p className="text-sm text-gray-600 mb-6">
              确定要删除这张图片吗？此操作无法撤销。
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleImageDelete(showDeleteModal)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;