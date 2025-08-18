import React, { useState, useRef } from 'react';
import {
  CloudArrowUpIcon,
  XMarkIcon,
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../utils';
import { toast } from 'react-hot-toast';
import { MediaService } from '../../services/adminService';

/**
 * 文件上传组件属性
 */
interface FileUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // 字节
  folder?: string;
}

/**
 * 文件上传组件
 */
const FileUpload: React.FC<FileUploadProps> = ({
  isOpen,
  onClose,
  onSuccess,
  acceptedTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx'],
  maxFileSize = 50 * 1024 * 1024, // 50MB
  folder = 'uploads',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 获取文件类型图标
   */
  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) {
      return <PhotoIcon className="h-8 w-8 text-blue-500" />;
    } else if (type.startsWith('video/')) {
      return <VideoCameraIcon className="h-8 w-8 text-green-500" />;
    } else if (type.startsWith('audio/')) {
      return <MusicalNoteIcon className="h-8 w-8 text-purple-500" />;
    } else {
      return <DocumentIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  /**
   * 格式化文件大小
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * 验证文件
   */
  const validateFile = (file: File): boolean => {
    // 检查文件大小
    if (file.size > maxFileSize) {
      toast.error(`文件 ${file.name} 超过最大大小限制 ${formatFileSize(maxFileSize)}`);
      return false;
    }

    // 检查文件类型
    const isValidType = acceptedTypes.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('*', ''));
      }
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    });

    if (!isValidType) {
      toast.error(`文件 ${file.name} 类型不支持`);
      return false;
    }

    return true;
  };

  /**
   * 处理文件选择
   */
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    Array.from(files).forEach(file => {
      if (validateFile(file)) {
        validFiles.push(file);
      }
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  /**
   * 处理拖拽
   */
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  /**
   * 处理文件拖放
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  /**
   * 移除选中的文件
   */
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * 处理文件上传
   */
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('请选择要上传的文件');
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = selectedFiles.map(file => 
        MediaService.uploadFile(file, folder)
      );
      
      await Promise.all(uploadPromises);
      
      toast.success(`成功上传 ${selectedFiles.length} 个文件`);
      setSelectedFiles([]);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error('文件上传失败:', error);
      toast.error('文件上传失败');
    } finally {
      setUploading(false);
    }
  };

  /**
   * 重置状态
   */
  const resetState = () => {
    setSelectedFiles([]);
    setDragActive(false);
    setUploading(false);
  };

  /**
   * 处理关闭
   */
  const handleClose = () => {
    if (!uploading) {
      resetState();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        
        <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6 z-10">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handleClose}
              disabled={uploading}
            >
              <span className="sr-only">关闭</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          <div className="sm:flex sm:items-start">
            <div className="w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                上传文件
              </h3>
              
              {/* 文件拖放区域 */}
              <div
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                  dragActive
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    拖拽文件到此处，或
                    <button
                      type="button"
                      className="ml-1 text-blue-600 hover:text-blue-500 font-medium"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      点击选择文件
                    </button>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    支持图片、视频、音频、文档等格式，最大 {formatFileSize(maxFileSize)}
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={acceptedTypes.join(',')}
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                  disabled={uploading}
                />
              </div>
              
              {/* 选中的文件列表 */}
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    选中的文件 ({selectedFiles.length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center">
                          {getFileIcon(file)}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-400 hover:text-red-500"
                          disabled={uploading}
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 操作按钮 */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={handleClose}
                  disabled={uploading}
                >
                  取消
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleUpload}
                  disabled={uploading || selectedFiles.length === 0}
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      上传中...
                    </>
                  ) : (
                    '开始上传'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;