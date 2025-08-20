import React, { useState, useRef, useCallback } from 'react';
import type { ContentData, StyleData, PositionData } from '../../../types/content';
import { isValidVideoSrc, logMediaValidation } from '../../../utils/mediaValidation';

interface VideoRendererProps {
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
 * 视频内容渲染器
 * 支持视频上传、URL输入和播放控制
 */
export const VideoRenderer: React.FC<VideoRendererProps> = ({
  contentId,
  data,
  style = {},
  isEditMode = false,
  className = '',
  onUpdate
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [urlInput, setUrlInput] = useState(data.src || '');
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理视频加载完成
  const handleVideoLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  // 处理视频加载错误
  const handleVideoError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  // 处理视频点击（编辑模式）
  const handleVideoClick = useCallback(() => {
    if (isEditMode) {
      setIsEditing(true);
    }
  }, [isEditMode]);

  // 处理URL输入确认
  const handleUrlSubmit = useCallback(() => {
    if (urlInput.trim() && onUpdate) {
      const newData: ContentData = {
        ...data,
        src: urlInput.trim(),
        metadata: {
          ...data.metadata,
          updatedAt: new Date().toISOString()
        }
      };
      onUpdate(contentId, newData);
    }
    setIsEditing(false);
  }, [contentId, data, urlInput, onUpdate]);

  // 处理文件上传
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('video/')) {
      alert('请选择有效的视频文件');
      return;
    }

    // 验证文件大小（50MB限制）
    if (file.size > 50 * 1024 * 1024) {
      alert('视频文件大小不能超过50MB');
      return;
    }

    setIsLoading(true);

    try {
      // 创建预览URL
      const previewUrl = URL.createObjectURL(file);
      
      const newData: ContentData = {
        ...data,
        src: previewUrl,
        metadata: {
          ...data.metadata,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadedAt: new Date().toISOString()
        }
      };

      if (onUpdate) {
        onUpdate(contentId, newData);
      }
    } catch (error) {
      console.error('视频上传失败:', error);
      alert('视频上传失败，请重试');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [contentId, data, onUpdate]);

  // 获取视频样式
  const getVideoStyle = (): React.CSSProperties => {
    return {
      width: '100%',
      maxWidth: '100%',
      height: 'auto',
      borderRadius: '8px',
      ...style
    };
  };

  // 获取容器样式
  const getContainerStyle = (): React.CSSProperties => {
    return {
      position: 'relative',
      display: 'block',
      maxWidth: '100%',
      ...style
    };
  };

  // 渲染URL编辑器
  if (isEditing) {
    return (
      <div 
        className={`video-renderer editing ${className}`}
        style={getContainerStyle()}
        data-content-id={contentId}
      >
        <div className="url-editor">
          <h4>设置视频源</h4>
          <div className="input-group">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="输入视频URL或选择本地文件"
              className="url-input"
            />
            <div className="button-group">
              <button onClick={handleUrlSubmit} className="confirm-button">
                确认
              </button>
              <button onClick={() => setIsEditing(false)} className="cancel-button">
                取消
              </button>
            </div>
          </div>
          <div className="divider">或</div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="upload-button"
          >
            📁 选择本地视频文件
          </button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
    );
  }

  // 渲染加载状态
  if (isLoading) {
    return (
      <div 
        className={`video-renderer loading ${className}`}
        style={getContainerStyle()}
        data-content-id={contentId}
      >
        <div className="loading-placeholder">
          <div className="loading-spinner"></div>
          <span>正在加载视频...</span>
        </div>
      </div>
    );
  }

  // 检查视频src是否有效
  const hasValidSrc = isValidVideoSrc(data.src);
  
  // 在开发环境记录无效src的情况
  if (!hasValidSrc && data.src) {
    logMediaValidation('Invalid video src detected', { contentId, src: data.src });
  }

  // 渲染错误状态或空状态
  if (hasError || !hasValidSrc) {
    return (
      <div 
        className={`video-renderer error ${isEditMode ? 'editable' : ''} ${className}`}
        style={getContainerStyle()}
        onClick={handleVideoClick}
        data-content-id={contentId}
      >
        <div className="error-placeholder">
          <div className="error-icon">🎥</div>
          <span>{hasError ? '视频加载失败' : '点击添加视频'}</span>
          {isEditMode && (
            <button className="add-video-button">
              添加视频
            </button>
          )}
        </div>
      </div>
    );
  }

  // 渲染正常视频（此时已确保src有效）
  return (
    <div 
      className={`video-renderer ${isEditMode ? 'editable' : ''} ${className}`}
      style={getContainerStyle()}
      data-content-id={contentId}
      data-content-type="video"
      
    >
      <video
        ref={videoRef}
        src={data.src} // 此时已通过isValidVideoSrc验证，确保不是空字符串
        style={getVideoStyle()}
        controls={data.metadata?.controls !== false}
        autoPlay={data.metadata?.autoPlay === true}
        loop={data.metadata?.loop === true}
        muted={data.metadata?.muted === true}
        poster={data.metadata?.poster}
        onLoadedData={handleVideoLoad}
        onError={handleVideoError}
        preload={data.metadata?.preload || 'metadata'}
      >
        您的浏览器不支持视频播放。
      </video>
      
      {/* 编辑模式覆盖层 */}
      {isEditMode && (
        <div className="edit-overlay" onClick={handleVideoClick}>
          <div className="edit-actions">
            <button className="edit-button">
              ⚙️ 设置
            </button>
            <button className="replace-button">
              🔄 替换
            </button>
          </div>
        </div>
      )}
      
      {/* 视频信息 */}
      {data.metadata?.showInfo && (
        <div className="video-info">
          {data.title && <div className="video-title">{data.title}</div>}
          {data.description && <div className="video-description">{data.description}</div>}
        </div>
      )}
    </div>
  );
};

// 样式
const styles = `
.video-renderer {
  position: relative;
  display: block;
  max-width: 100%;
}

.video-renderer.editable {
  border: 2px dashed transparent;
  border-radius: 8px;
  transition: border-color 0.2s;
}

.video-renderer.editable:hover {
  border-color: #3b82f6;
}

.loading-placeholder,
.error-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
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
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.add-video-button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.add-video-button:hover {
  background: #2563eb;
}

.url-editor {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 0 auto;
}

.url-editor h4 {
  margin: 0 0 1rem 0;
  color: #374151;
}

.input-group {
  margin-bottom: 1rem;
}

.url-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 1rem;
}

.url-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.button-group {
  display: flex;
  gap: 0.5rem;
}

.confirm-button,
.cancel-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.confirm-button {
  background: #10b981;
  color: white;
}

.confirm-button:hover {
  background: #059669;
}

.cancel-button {
  background: #6b7280;
  color: white;
}

.cancel-button:hover {
  background: #4b5563;
}

.divider {
  text-align: center;
  margin: 1rem 0;
  color: #9ca3af;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e5e7eb;
  z-index: 1;
}

.divider span {
  background: white;
  padding: 0 1rem;
  position: relative;
  z-index: 2;
}

.upload-button {
  width: 100%;
  padding: 0.75rem;
  background: #f3f4f6;
  border: 2px dashed #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
  transition: all 0.2s;
}

.upload-button:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
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
  cursor: pointer;
}

.video-renderer.editable:hover .edit-overlay {
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

.video-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 1rem;
  border-radius: 0 0 8px 8px;
}

.video-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.video-description {
  font-size: 14px;
  opacity: 0.9;
}

.video-renderer video {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.video-renderer.editable video:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
`;

// 注入样式
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default VideoRenderer;