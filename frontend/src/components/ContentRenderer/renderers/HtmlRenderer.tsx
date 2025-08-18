import React, { useState, useRef, useCallback } from 'react';
import type { ContentData, StyleData, PositionData } from '../../../types/content';
import { SecurityValidator } from '../../../utils/security';
import { useXSSProtection } from '../../../hooks/useSecurity';

interface HtmlRendererProps {
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
 * HTML内容渲染器
 * 支持HTML代码编辑和安全渲染
 */
export const HtmlRenderer: React.FC<HtmlRendererProps> = ({
  contentId,
  data,
  style = {},
  isEditMode = false,
  className = '',
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [htmlCode, setHtmlCode] = useState(data.value || '');
  const [showPreview, setShowPreview] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  
  // 使用安全防护Hook
  useXSSProtection();

  // 处理双击编辑
  const handleDoubleClick = useCallback(() => {
    if (isEditMode) {
      setIsEditing(true);
      setHtmlCode(data.value || '');
      setShowPreview(false);
    }
  }, [isEditMode, data.value]);

  // 处理编辑完成
  const handleEditComplete = useCallback(() => {
    setIsEditing(false);
    setShowPreview(true);
    
    if (htmlCode !== data.value && onUpdate) {
      // 验证HTML内容安全性
      const validationResult = SecurityValidator.validateInput(htmlCode, 'html', {
        required: false,
        allowHTML: true
      });
      
      if (!validationResult.isValid) {
        setSecurityWarning(validationResult.error || '内容验证失败');
        return;
      }
      
      // 检测SQL注入
      if (SecurityValidator.detectSQLInjection(htmlCode)) {
        setSecurityWarning('检测到潜在的安全威胁，请检查输入内容');
        return;
      }
      
      setSecurityWarning(null);
      
      const newData: ContentData = {
        ...data,
        value: validationResult.sanitized || htmlCode,
        metadata: {
          ...data.metadata,
          updatedAt: new Date().toISOString(),
          isHtml: true,
          sanitized: true
        }
      };
      onUpdate(contentId, newData);
    }
  }, [contentId, data, htmlCode, onUpdate]);

  // 处理取消编辑
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setShowPreview(true);
    setHtmlCode(data.value || '');
  }, [data.value]);

  // 处理预览切换
  const handlePreviewToggle = useCallback(() => {
    setShowPreview(!showPreview);
  }, [showPreview]);

  // 清理HTML代码（使用安全验证工具类）
  const sanitizeHtml = useCallback((html: string): string => {
    try {
      // 使用新的安全验证工具类进行HTML清理
      const sanitized = SecurityValidator.sanitizeHTML(html);
      return sanitized;
    } catch (error) {
      console.error('HTML sanitization error:', error);
      // 如果清理失败，返回空字符串以确保安全
      return '';
    }
  }, []);

  // 获取容器样式
  const getContainerStyle = (): React.CSSProperties => {
    return {
      position: 'relative',
      width: '100%',
      minHeight: isEditMode ? '100px' : 'auto',
      ...style
    };
  };

  // 获取编辑器样式
  const getEditorStyle = (): React.CSSProperties => {
    return {
      width: '100%',
      minHeight: '200px',
      padding: '1rem',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontFamily: 'Monaco, Consolas, "Courier New", monospace',
      fontSize: '14px',
      lineHeight: '1.5',
      resize: 'vertical',
      outline: 'none'
    };
  };

  // 渲染编辑模式
  if (isEditing) {
    return (
      <div 
        className={`html-renderer editing ${className}`}
        style={getContainerStyle()}
        data-content-id={contentId}
      >
        <div className="editor-header">
          <h4>编辑HTML代码</h4>
          <div className="editor-controls">
            <button 
              onClick={handlePreviewToggle}
              className={`preview-toggle ${showPreview ? 'active' : ''}`}
            >
              {showPreview ? '📝 代码' : '👁️ 预览'}
            </button>
          </div>
        </div>
        
        <div className="editor-content">
          {showPreview ? (
            <div className="preview-panel">
              <div 
                className="html-preview"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(htmlCode) }}
              />
            </div>
          ) : (
            <textarea
              ref={editorRef}
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              style={getEditorStyle()}
              placeholder="输入HTML代码..."
              spellCheck={false}
            />
          )}
        </div>
        
        <div className="editor-footer">
          <div className="editor-actions">
            <button onClick={handleEditComplete} className="save-button">
              💾 保存
            </button>
            <button onClick={handleCancel} className="cancel-button">
              ❌ 取消
            </button>
          </div>
          <div className="editor-info">
            <span className="char-count">
              字符数: {htmlCode.length}
            </span>
          </div>
        </div>
        
        {/* 安全警告显示 */}
        {securityWarning && (
          <div className="security-warning">
            ⚠️ {securityWarning}
          </div>
        )}
      </div>
    );
  }

  // 渲染显示模式
  const htmlContent = data.value || '';
  const sanitizedHtml = sanitizeHtml(htmlContent);

  // 空状态
  if (!htmlContent && isEditMode) {
    return (
      <div 
        className={`html-renderer empty editable ${className}`}
        style={getContainerStyle()}
        onClick={handleDoubleClick}
        data-content-id={contentId}
      >
        <div className="empty-placeholder">
          <div className="empty-icon">📄</div>
          <span>双击添加HTML内容</span>
          <button className="add-html-button">
            添加HTML
          </button>
        </div>
      </div>
    );
  }

  // 错误状态
  if (hasError) {
    return (
      <div 
        className={`html-renderer error ${className}`}
        style={getContainerStyle()}
        data-content-id={contentId}
      >
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <span>HTML渲染出错</span>
          {isEditMode && (
            <button onClick={handleDoubleClick} className="edit-button">
              编辑修复
            </button>
          )}
        </div>
      </div>
    );
  }

  // 正常渲染
  return (
    <div 
      className={`html-renderer ${isEditMode ? 'editable' : ''} ${className}`}
      style={getContainerStyle()}
      onDoubleClick={handleDoubleClick}
      data-content-id={contentId}
      data-content-type="html"
    >
      <div 
        ref={previewRef}
        className="html-content"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        onError={() => setHasError(true)}
      />
      
      {/* 编辑模式提示 */}
      {isEditMode && (
        <div className="edit-hint">
          双击编辑HTML代码
        </div>
      )}
      
      {/* 安全警告 */}
      {data.metadata?.showWarning && (
        <div className="security-warning">
          ⚠️ 此内容包含HTML代码，请确保来源可信
        </div>
      )}
    </div>
  );
};

// 样式
const styles = `
.html-renderer {
  position: relative;
  width: 100%;
}

.html-renderer.editable {
  border: 2px dashed transparent;
  border-radius: 8px;
  transition: border-color 0.2s;
  min-height: 50px;
}

.html-renderer.editable:hover {
  border-color: #3b82f6;
}

.html-renderer.editing {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1rem 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.editor-header h4 {
  margin: 0;
  color: #374151;
  font-size: 16px;
}

.editor-controls {
  display: flex;
  gap: 0.5rem;
}

.preview-toggle {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.preview-toggle:hover {
  background: #e5e7eb;
}

.preview-toggle.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.editor-content {
  padding: 1rem;
}

.preview-panel {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  min-height: 200px;
  background: #fafafa;
}

.html-preview {
  padding: 1rem;
  min-height: 168px;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem 1rem;
  border-top: 1px solid #e5e7eb;
}

.editor-actions {
  display: flex;
  gap: 0.5rem;
}

.save-button,
.cancel-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.save-button {
  background: #10b981;
  color: white;
}

.save-button:hover {
  background: #059669;
}

.cancel-button {
  background: #6b7280;
  color: white;
}

.cancel-button:hover {
  background: #4b5563;
}

.editor-info {
  font-size: 12px;
  color: #6b7280;
}

.char-count {
  font-family: monospace;
}

.empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 150px;
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  color: #6b7280;
  text-align: center;
  padding: 2rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.add-html-button {
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

.add-html-button:hover {
  background: #2563eb;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  text-align: center;
  padding: 1rem;
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.edit-button {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.edit-button:hover {
  background: #b91c1c;
}

.html-content {
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.edit-hint {
  position: absolute;
  top: -30px;
  left: 0;
  font-size: 12px;
  color: #6b7280;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
  white-space: nowrap;
}

.html-renderer.editable:hover .edit-hint {
  opacity: 1;
}

.security-warning {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  font-size: 12px;
  color: #92400e;
}

/* HTML内容样式重置 */
.html-content * {
  max-width: 100%;
}

.html-content img {
  height: auto;
}

.html-content table {
  border-collapse: collapse;
  width: 100%;
}

.html-content th,
.html-content td {
  border: 1px solid #d1d5db;
  padding: 0.5rem;
  text-align: left;
}

.html-content th {
  background: #f9fafb;
  font-weight: 600;
}

.html-content pre {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  font-family: Monaco, Consolas, "Courier New", monospace;
}

.html-content code {
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: Monaco, Consolas, "Courier New", monospace;
  font-size: 0.875em;
}

.html-content pre code {
  background: none;
  padding: 0;
}
`;

// 注入样式
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default HtmlRenderer;