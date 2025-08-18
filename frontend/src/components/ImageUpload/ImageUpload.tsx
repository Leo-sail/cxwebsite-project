/**
 * 图片上传组件
 * 支持拖拽上传、进度显示、预览等功能
 */
import React, { useState, useRef, useCallback } from 'react';
import { ImageUploadService, type ImageUploadResult, type ImageUploadConfig } from '../../services/imageUploadService';

/**
 * 图片上传组件属性接口
 */
export interface ImageUploadProps {
  /** 上传配置 */
  config?: ImageUploadConfig;
  /** 是否支持多文件上传 */
  multiple?: boolean;
  /** 上传成功回调 */
  onUploadSuccess?: (results: ImageUploadResult[]) => void;
  /** 上传失败回调 */
  onUploadError?: (error: Error) => void;
  /** 上传进度回调 */
  onUploadProgress?: (fileIndex: number, progress: number) => void;
  /** 自定义样式类名 */
  className?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 占位符文本 */
  placeholder?: string;
}

/**
 * 上传状态类型
 */
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

/**
 * 上传状态常量
 */
const UploadStatusValues = {
  IDLE: 'idle' as const,
  UPLOADING: 'uploading' as const,
  SUCCESS: 'success' as const,
  ERROR: 'error' as const
} as const;

/**
 * 文件上传状态接口
 */
interface FileUploadState {
  file: File;
  progress: number;
  status: UploadStatus;
  error?: string;
  result?: ImageUploadResult;
}

/**
 * 图片上传组件
 */
export const ImageUpload: React.FC<ImageUploadProps> = ({
  config = {},
  multiple = false,
  onUploadSuccess,
  onUploadError,
  onUploadProgress,
  className = '',
  disabled = false,
  placeholder = '点击或拖拽图片到此处上传'
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStates, setUploadStates] = useState<FileUploadState[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 处理文件选择
   */
  const handleFileSelect = useCallback(async (files: FileList) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      onUploadError?.(new Error('请选择图片文件'));
      return;
    }

    // 如果不支持多文件，只取第一个
    const filesToUpload = multiple ? imageFiles : [imageFiles[0]];

    // 初始化上传状态
    const initialStates: FileUploadState[] = filesToUpload.map(file => ({
      file,
      progress: 0,
      status: UploadStatusValues.UPLOADING
    }));

    setUploadStates(initialStates);

    try {
      const results: ImageUploadResult[] = [];

      // 逐个上传文件
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        
        try {
          const result = await ImageUploadService.uploadImage(
            file,
            config,
            (progress) => {
              setUploadStates(prev => 
                prev.map((state, index) => 
                  index === i ? { ...state, progress } : state
                )
              );
              onUploadProgress?.(i, progress);
            }
          );

          // 更新成功状态
          setUploadStates(prev => 
            prev.map((state, index) => 
              index === i 
                ? { ...state, status: UploadStatusValues.SUCCESS, result, progress: 100 }
                : state
            )
          );

          results.push(result);
        } catch (error) {
          // 更新错误状态
          setUploadStates(prev => 
            prev.map((state, index) => 
              index === i 
                ? { 
                    ...state, 
                    status: UploadStatusValues.ERROR, 
                    error: error instanceof Error ? error.message : '上传失败' 
                  }
                : state
            )
          );
          throw error;
        }
      }

      onUploadSuccess?.(results);
      
      // 3秒后清除上传状态
      setTimeout(() => {
        setUploadStates([]);
      }, 3000);

    } catch (error) {
      onUploadError?.(error instanceof Error ? error : new Error('上传失败'));
    }
  }, [config, multiple, disabled, onUploadSuccess, onUploadError, onUploadProgress]);

  /**
   * 处理拖拽进入
   */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  /**
   * 处理拖拽离开
   */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  /**
   * 处理拖拽悬停
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  /**
   * 处理文件拖拽放置
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [disabled, handleFileSelect]);

  /**
   * 处理点击上传
   */
  const handleClick = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  /**
   * 处理文件输入变化
   */
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    // 清空input值，允许重复选择同一文件
    e.target.value = '';
  }, [handleFileSelect]);

  /**
   * 获取上传区域样式类名
   */
  const getUploadAreaClassName = () => {
    const baseClasses = [
      'border-2',
      'border-dashed',
      'rounded-lg',
      'p-8',
      'text-center',
      'transition-all',
      'duration-200',
      'cursor-pointer'
    ];

    if (disabled) {
      baseClasses.push('border-gray-300', 'bg-gray-50', 'cursor-not-allowed');
    } else if (isDragOver) {
      baseClasses.push('border-blue-500', 'bg-blue-50');
    } else {
      baseClasses.push('border-gray-300', 'hover:border-blue-400', 'hover:bg-gray-50');
    }

    return baseClasses.join(' ');
  };

  return (
    <div className={`image-upload ${className}`}>
      {/* 上传区域 */}
      <div
        className={getUploadAreaClassName()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center space-y-4">
          {/* 上传图标 */}
          <svg
            className={`w-12 h-12 ${disabled ? 'text-gray-400' : 'text-gray-500'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          
          {/* 提示文本 */}
          <div className="text-sm text-gray-600">
            <p className="font-medium">{placeholder}</p>
            <p className="text-xs text-gray-500 mt-1">
              支持 JPG、PNG、GIF、WebP 格式，最大 5MB
              {multiple && '，可选择多个文件'}
            </p>
          </div>
        </div>
      </div>

      {/* 上传进度显示 */}
      {uploadStates.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadStates.map((state, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 truncate">
                  {state.file.name}
                </span>
                <span className="text-xs text-gray-500">
                  {(state.file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              
              {/* 进度条 */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    state.status === UploadStatusValues.SUCCESS
                      ? 'bg-green-500'
                      : state.status === UploadStatusValues.ERROR
                      ? 'bg-red-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${state.progress}%` }}
                />
              </div>
              
              {/* 状态信息 */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  {state.status === UploadStatusValues.UPLOADING && `上传中... ${state.progress}%`}
                  {state.status === UploadStatusValues.SUCCESS && '上传成功'}
                  {state.status === UploadStatusValues.ERROR && `上传失败: ${state.error}`}
                </span>
                
                {state.status === UploadStatusValues.SUCCESS && state.result && (
                  <a
                    href={state.result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    查看图片
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;