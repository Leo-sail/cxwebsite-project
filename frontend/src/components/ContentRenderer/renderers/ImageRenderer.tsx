import React, { useState, useRef, useCallback } from 'react';
import type { ContentData, StyleData, PositionData } from '../../../types/content';
import { ImageUploadService } from '../../../services/imageUploadService';

interface ImageRendererProps {
  /** 内容ID */
  contentId: string;
  /** 内容数据 */
  data: ContentData;
  /** 样式数据 */
  style?: StyleData & PositionData;
  /** 是否为编辑模式 */
  isEditMode?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 内容更新回调 */
  onUpdate?: (contentId: string, newData: ContentData) => void;
}

/**
 * 图片内容渲染器
 * 支持图片上传、替换和样式自定义
 */
export const ImageRenderer: React.FC<ImageRendererProps> = ({
  contentId,
  data,
  style = {},
  isEditMode = false,
  className = '',
  onUpdate
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // 处理图片加载完成
  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  // 处理图片加载错误
  const handleImageError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  // 处理图片点击（编辑模式）
  const handleImageClick = useCallback(() => {
    if (isEditMode && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [isEditMode]);

  // 处理文件选择
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择有效的图片文件');
      return;
    }

    // 验证文件大小（5MB限制）
    if (file.size > 5 * 1024 * 1024) {
      alert('图片文件大小不能超过5MB');
      return;
    }

    setIsLoading(true);

    try {
      // 使用ImageUploadService上传到Supabase Storage
      const uploadResult = await ImageUploadService.uploadImage(
        file,
        {
          folder: 'content-images',
          maxSize: 5 * 1024 * 1024, // 5MB
          quality: 0.8
        },
        (progress) => {
          // 可以在这里显示上传进度
          console.log(`上传进度: ${progress}%`);
        }
      );
      
      const newData: ContentData = {
        ...data,
        src: uploadResult.url,
        alt: data.alt || file.name,
        metadata: {
          ...data.metadata,
          fileName: uploadResult.filename,
          fileSize: uploadResult.file_size,
          fileType: uploadResult.mime_type,
          uploadedAt: new Date().toISOString(),
          imageId: uploadResult.id,
          width: uploadResult.width,
          height: uploadResult.height
        }
      };

      if (onUpdate) {
        onUpdate(contentId, newData);
      }
    } catch (error) {
      console.error('图片上传失败:', error);
      alert(`图片上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [contentId, data, onUpdate]);

  // 获取图片样式
  const getImageStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      maxWidth: '100%',
      height: 'auto',
      display: 'block',
      ...style
    };

    // 编辑模式下的额外样式
    if (isEditMode) {
      baseStyle.cursor = 'pointer';
      baseStyle.transition = 'all 0.2s';
      
      if (isHovered) {
        baseStyle.opacity = 0.8;
        baseStyle.transform = 'scale(1.02)';
      }
    }

    return baseStyle;
  };

  // 获取容器样式
  const getContainerStyle = (): React.CSSProperties => {
    return {
      position: 'relative',
      display: 'inline-block',
      maxWidth: '100%',
      ...style
    };
  };

  // 渲染加载状态
  if (isLoading) {
    return (
      <div 
        className={`image-renderer loading ${className}`}
        style={getContainerStyle()}
        data-content-id={contentId}
      >
        <div className="loading-placeholder">
          <div className="loading-spinner"></div>
          <span>正在加载图片...</span>
        </div>
      </div>
    );
  }

  // 渲染错误状态
  if (hasError || !data.src) {
    return (
      <div 
        className={`image-renderer error ${isEditMode ? 'editable' : ''} ${className}`}
        style={getContainerStyle()}
        onClick={handleImageClick}
        data-content-id={contentId}
      >
        <div className="error-placeholder">
          <div className="error-icon">📷</div>
          <span>{hasError ? '图片加载失败' : '点击上传图片'}</span>
          {isEditMode && (
            <button className="upload-button">
              选择图片
            </button>
          )}
        </div>
        
        {/* 隐藏的文件输入 */}
        {isEditMode && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        )}
      </div>
    );
  }

  // 渲染正常图片
  return (
    <div 
      className={`image-renderer ${isEditMode ? 'editable' : ''} ${className}`}
      style={getContainerStyle()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleImageClick}
      data-content-id={contentId}
      data-content-type="image"
    >
      <img
        ref={imageRef}
        src={data.src || 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=暂无图片'}
        alt={data.alt || data.title || '图片'}
        title={data.title}
        style={getImageStyle()}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
      
      {/* 编辑模式覆盖层 */}
      {isEditMode && isHovered && (
        <div className="edit-overlay">
          <div className="edit-actions">
            <button className="edit-button">
              📝 编辑
            </button>
            <button className="replace-button">
              🔄 替换
            </button>
          </div>
        </div>
      )}
      
      {/* 图片信息 */}
      {data.metadata?.showInfo && (
        <div className="image-info">
          {data.title && <div className="image-title">{data.title}</div>}
          {data.description && <div className="image-description">{data.description}</div>}
        </div>
      )}
      
      {/* 隐藏的文件输入 */}
      {isEditMode && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      )}
    </div>
  );
};

// 样式
const styles = `
.image-renderer {
  position: relative;
  display: inline-block;
  max-width: 100%;
}

.image-renderer.editable {
  border: 2px dashed transparent;
  border-radius: 8px;
  transition: border-color 0.2s;
}

.image-renderer.editable:hover {
  border-color: #3b82f6;
}

.loading-placeholder,
.error-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  min-width: 300px;
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  color: #6b7280;
  text-align: center;
  padding: 2rem;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.upload-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.upload-button:hover {
  background: #2563eb;
}

.edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-renderer.editable:hover .edit-overlay {
  opacity: 1;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-button,
.replace-button {
  padding: 0.5rem 1rem;
  background: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.edit-button:hover,
.replace-button:hover {
  background: #f3f4f6;
  transform: translateY(-1px);
}

.image-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 1rem;
  border-radius: 0 0 8px 8px;
}

.image-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.image-description {
  font-size: 14px;
  opacity: 0.9;
}

.image-renderer img {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.image-renderer.editable img:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
`;

// 注入样式
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default ImageRenderer;