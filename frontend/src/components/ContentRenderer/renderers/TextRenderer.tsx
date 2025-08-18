import React, { useState, useRef, useEffect } from 'react';
import type { ContentData, StyleData, PositionData } from '../../../types/content';
import { RichTextEditor } from '../../RichTextEditor';
import { MarkdownEditor } from '../../MarkdownEditor';
import { getEditorType, EditorType } from '../../../utils/editorConfig';

type ValidHtmlTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';

interface TextRendererProps {
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
 * 文本内容渲染器
 * 支持富文本编辑和样式自定义
 */
export const TextRenderer: React.FC<TextRendererProps> = ({
  contentId,
  data,
  style = {},
  isEditMode = false,
  className = '',
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.value || '');
  const textRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 处理双击编辑
  const handleDoubleClick = () => {
    if (isEditMode) {
      setIsEditing(true);
      setEditValue(data.value || '');
    }
  };

  // 处理编辑完成
  const handleEditComplete = () => {
    setIsEditing(false);
    if (editValue !== data.value && onUpdate) {
      onUpdate(contentId, {
        ...data,
        value: editValue
      });
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleEditComplete();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(data.value || '');
    }
  };

  // 自动聚焦到编辑框
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // 获取文本标签类型
  const getTextTag = (): ValidHtmlTag => {
    const textType = data.metadata?.textType || 'p';
    // 确保返回有效的HTML标签名
    const validTags: ValidHtmlTag[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div'];
    return validTags.includes(textType as ValidHtmlTag) ? textType as ValidHtmlTag : 'p';
  };

  // 获取合并后的样式
  const getMergedStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      margin: 0,
      padding: 0,
      ...style
    };

    // 编辑模式下的额外样式
    if (isEditMode) {
      baseStyle.cursor = 'pointer';
      baseStyle.minHeight = '1.5em';
      baseStyle.outline = isEditing ? '2px solid #3b82f6' : 'none';
      baseStyle.transition = 'outline 0.2s';
    }

    return baseStyle;
  };

  // 获取编辑器类型
  const editorType = getEditorType(data.metadata?.contentType || 'text');
  const isRichText = data.metadata?.isHtml || editorType === EditorType.RICH_TEXT;
  const isMarkdown = editorType === EditorType.MARKDOWN;

  // 渲染编辑状态
  if (isEditing) {
    const containerStyle = getMergedStyle();
    
    // 富文本编辑器
    if (isRichText) {
      return (
        <div className={`text-renderer editing rich-text ${className}`} style={containerStyle}>
          <RichTextEditor
            contentData={{
              value: editValue,
              metadata: data.metadata
            }}
            onChange={(newContentData) => {
              setEditValue(newContentData.value || '');
            }}
            placeholder="输入富文本内容..."
            className="rich-text-editor"
            onError={(error) => console.error('Rich text editor error:', error)}
          />
          <div className="edit-actions">
            <button 
              onClick={handleEditComplete}
              className="save-button"
            >
              💾 保存
            </button>
            <button 
              onClick={() => {
                setIsEditing(false);
                setEditValue(data.value || '');
              }}
              className="cancel-button"
            >
              ❌ 取消
            </button>
          </div>
        </div>
      );
    }
    
    // Markdown编辑器
    if (isMarkdown) {
      return (
        <div className={`text-renderer editing markdown ${className}`} style={containerStyle}>
          <MarkdownEditor
            contentData={{
              value: editValue,
              metadata: data.metadata
            }}
            onChange={(newContentData) => {
              setEditValue(newContentData.value || '');
            }}
            placeholder="输入Markdown内容..."
            className="markdown-editor"
            showPreview={true}
            onError={(error) => console.error('Markdown editor error:', error)}
          />
          <div className="edit-actions">
            <button 
              onClick={handleEditComplete}
              className="save-button"
            >
              💾 保存
            </button>
            <button 
              onClick={() => {
                setIsEditing(false);
                setEditValue(data.value || '');
              }}
              className="cancel-button"
            >
              ❌ 取消
            </button>
          </div>
        </div>
      );
    }
    
    // 基础文本编辑器
    return (
      <div className={`text-renderer editing ${className}`} style={containerStyle}>
        <textarea
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleEditComplete}
          onKeyDown={handleKeyDown}
          className="text-editor"
          style={{
            width: '100%',
            minHeight: '3em',
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            fontWeight: 'inherit',
            color: 'inherit',
            backgroundColor: 'transparent',
            lineHeight: 'inherit'
          }}
          placeholder="输入文本内容..."
        />
        <div className="edit-hint">
          Ctrl+Enter 保存，Esc 取消
        </div>
      </div>
    );
  }

  // 渲染显示状态
  const TextTag = getTextTag();
  const textContent = data.value || data.metadata?.placeholder || '点击编辑文本';

  return (
    <div 
      className={`text-renderer ${isEditMode ? 'editable' : ''} ${className}`}
      style={getMergedStyle()}
      onDoubleClick={handleDoubleClick}
      ref={textRef}
      data-content-id={contentId}
      data-content-type="text"
    >
      <TextTag
        style={{
          margin: 0,
          padding: 0,
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          color: style.color,
          lineHeight: style.lineHeight,
          textAlign: style.textAlign as any,
          textDecoration: style.textDecoration,
          letterSpacing: style.letterSpacing,
          wordSpacing: style.wordSpacing
        }}
        dangerouslySetInnerHTML={{
          __html: data.metadata?.isHtml ? textContent : textContent.replace(/\n/g, '<br>')
        }}
      />
      
      {/* 编辑模式提示 */}
      {isEditMode && !textContent && (
        <div className="edit-placeholder">
          双击编辑文本
        </div>
      )}
    </div>
  );
};

// 样式
const styles = `
.text-renderer {
  position: relative;
  word-wrap: break-word;
  word-break: break-word;
}

.text-renderer.editable:hover {
  background-color: rgba(59, 130, 246, 0.1);
  border-radius: 4px;
}

.text-renderer.editing {
  background-color: rgba(59, 130, 246, 0.1);
  border-radius: 4px;
  padding: 8px;
}

.text-renderer.editing.rich-text {
  background-color: rgba(255, 255, 255, 0.95);
  border: 2px solid #3b82f6;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.text-renderer.editing.markdown {
  background-color: rgba(255, 255, 255, 0.95);
  border: 2px solid #10b981;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.text-editor {
  font-family: inherit !important;
}

.rich-text-editor {
  min-height: 200px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 12px;
}

.markdown-editor {
  min-height: 200px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 12px;
}

.edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}

.save-button {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.save-button:hover {
  background-color: #2563eb;
}

.cancel-button {
  background-color: #6b7280;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.cancel-button:hover {
  background-color: #4b5563;
}

.edit-hint {
  position: absolute;
  bottom: -20px;
  left: 0;
  font-size: 12px;
  color: #6b7280;
  background: white;
  padding: 2px 6px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  z-index: 10;
}

.edit-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #9ca3af;
  font-size: 14px;
  pointer-events: none;
  white-space: nowrap;
}

.text-renderer h1 {
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.2;
}

.text-renderer h2 {
  font-size: 1.875rem;
  font-weight: 600;
  line-height: 1.3;
}

.text-renderer h3 {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.4;
}

.text-renderer h4 {
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.4;
}

.text-renderer h5 {
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1.5;
}

.text-renderer h6 {
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5;
}

.text-renderer p {
  line-height: 1.6;
}

.text-renderer span {
  display: inline;
}

.text-renderer div {
  display: block;
}
`;

// 注入样式
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default TextRenderer;