import React, { useState, useCallback, useEffect } from 'react';
import type { PageContent } from '../../../types/content';

interface MarkdownRendererProps {
  /** 内容数据 */
  content: PageContent;
  /** 是否为编辑模式 */
  isEditMode?: boolean;
  /** 是否被选中 */
  isSelected?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 内容更新回调 */
  onUpdate?: (content: PageContent) => void;
}

/**
 * Markdown内容渲染器
 * 支持Markdown语法渲染和编辑
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  isEditMode = false,
  isSelected = false,
  className = '',
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState((content.config_value as any)?.value || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取Markdown内容
  const markdownContent = (content.config_value as any)?.value as string || '';

  // 初始化编辑值
  useEffect(() => {
    setEditValue(markdownContent);
  }, [markdownContent]);

  // 简单的Markdown转HTML函数
  const parseMarkdown = useCallback((markdown: string): string => {
    if (!markdown) return '';
    
    return markdown
      // 标题
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // 粗体
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      // 斜体
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // 链接
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // 代码块
      .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
      // 行内代码
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      // 换行
      .replace(/\n/gim, '<br>');
  }, []);

  // 处理双击编辑
  const handleDoubleClick = useCallback(() => {
    if (isEditMode) {
      setIsEditing(true);
      setError(null);
    }
  }, [isEditMode]);

  // 处理保存
  const handleSave = useCallback(async () => {
    if (!onUpdate || editValue === markdownContent) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedContent: PageContent = {
        ...content,
        config_value: {
          ...(content.config_value as any),
          value: editValue
        },
        updated_at: new Date().toISOString()
      };

      await onUpdate(updatedContent);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setIsLoading(false);
    }
  }, [editValue, markdownContent, content, onUpdate]);

  // 处理取消
  const handleCancel = useCallback(() => {
    setEditValue(markdownContent);
    setIsEditing(false);
    setError(null);
  }, [markdownContent]);

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  }, [handleCancel, handleSave]);

  // 应用样式
  const applyStyles = useCallback(() => {
    const styleData = content.config_data;
    if (!styleData) return {};

    return {
      color: (styleData as any).color,
      backgroundColor: (styleData as any).backgroundColor,
      fontSize: (styleData as any).fontSize,
      fontFamily: (styleData as any).fontFamily,
      fontWeight: (styleData as any).fontWeight,
      textAlign: (styleData as any).textAlign,
      lineHeight: (styleData as any).lineHeight,
      margin: (styleData as any).margin,
      padding: (styleData as any).padding,
      border: (styleData as any).border,
      borderRadius: (styleData as any).borderRadius,
      boxShadow: (styleData as any).boxShadow,
      ...(styleData as any).customStyles
    };
  }, [content.config_data]);

  // 渲染编辑模式
  if (isEditing) {
    return (
      <div className={`markdown-editor ${className}`}>
        <div className="editor-header">
          <span className="editor-title">编辑 Markdown</span>
          <div className="editor-actions">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="save-button"
            >
              {isLoading ? '保存中...' : '保存 (Ctrl+Enter)'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="cancel-button"
            >
              取消 (Esc)
            </button>
          </div>
        </div>
        
        <div className="editor-content">
          <div className="editor-input">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入 Markdown 内容..."
              className="markdown-textarea"
              autoFocus
            />
          </div>
          
          <div className="editor-preview">
            <h4>预览</h4>
            <div 
              className="markdown-preview"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(editValue) }}
            />
          </div>
        </div>
        
        {error && (
          <div className="error-message">
            错误: {error}
          </div>
        )}
      </div>
    );
  }

  // 渲染显示模式
  return (
    <div
      className={`markdown-renderer ${className} ${
        isEditMode ? 'editable' : ''
      } ${isSelected ? 'selected' : ''}`}
      style={applyStyles()}
      onDoubleClick={handleDoubleClick}
      title={isEditMode ? '双击编辑 Markdown' : undefined}
    >
      {markdownContent ? (
        <div 
          className="markdown-content"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(markdownContent) }}
        />
      ) : (
        <div className="empty-markdown">
          {isEditMode ? '双击添加 Markdown 内容' : '暂无内容'}
        </div>
      )}
      
      {isEditMode && isSelected && (
        <div className="edit-overlay">
          <span className="content-type-badge">Markdown</span>
        </div>
      )}
    </div>
  );
};

// 注入样式
const styles = `
.markdown-renderer {
  position: relative;
  min-height: 2rem;
  word-wrap: break-word;
}

.markdown-renderer.editable {
  cursor: pointer;
  border: 2px dashed transparent;
  transition: border-color 0.2s;
}

.markdown-renderer.editable:hover {
  border-color: #e2e8f0;
}

.markdown-renderer.selected {
  border-color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.05);
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3 {
  margin: 1rem 0 0.5rem 0;
  font-weight: bold;
}

.markdown-content h1 {
  font-size: 2rem;
}

.markdown-content h2 {
  font-size: 1.5rem;
}

.markdown-content h3 {
  font-size: 1.25rem;
}

.markdown-content strong {
  font-weight: bold;
}

.markdown-content em {
  font-style: italic;
}

.markdown-content a {
  color: #3b82f6;
  text-decoration: underline;
}

.markdown-content a:hover {
  color: #2563eb;
}

.markdown-content pre {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.markdown-content code {
  background: #f1f5f9;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

.markdown-content pre code {
  background: none;
  padding: 0;
}

.empty-markdown {
  color: #9ca3af;
  font-style: italic;
  padding: 1rem;
  text-align: center;
  border: 2px dashed #e5e7eb;
  border-radius: 0.5rem;
}

.edit-overlay {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 10;
}

.content-type-badge {
  background: #3b82f6;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.markdown-editor {
  border: 2px solid #3b82f6;
  border-radius: 0.5rem;
  background: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.editor-title {
  font-weight: 600;
  color: #374151;
}

.editor-actions {
  display: flex;
  gap: 0.5rem;
}

.save-button,
.cancel-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-button {
  background: #10b981;
  color: white;
}

.save-button:hover:not(:disabled) {
  background: #059669;
}

.save-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.cancel-button {
  background: #6b7280;
  color: white;
}

.cancel-button:hover:not(:disabled) {
  background: #4b5563;
}

.editor-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  min-height: 400px;
}

.editor-input h4,
.editor-preview h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
}

.markdown-textarea {
  width: 100%;
  height: 350px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
}

.markdown-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.markdown-preview {
  height: 350px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: #fafafa;
  overflow-y: auto;
}

.error-message {
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border-top: 1px solid #fecaca;
  color: #dc2626;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .editor-content {
    grid-template-columns: 1fr;
  }
  
  .markdown-textarea,
  .markdown-preview {
    height: 250px;
  }
}
`;

// 注入样式到页面
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default MarkdownRenderer;