/**
 * Markdown编辑器组件
 * 轻量级Markdown编辑器，支持实时预览和语法高亮
 */

import React, { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import type { ContentData } from '../types/content';
import { ContentDataAdapter } from '../utils/contentAdapter';
import { ContentValidator } from '../utils/contentValidator';
import { DEFAULT_MARKDOWN_CONFIG, type MarkdownEditorConfig } from '../utils/editorConfig';

/**
 * Markdown编辑器Props
 */
export interface MarkdownEditorProps {
  /** 内容数据 */
  contentData: ContentData;
  /** 内容变化回调 */
  onChange: (contentData: ContentData) => void;
  /** 是否只读 */
  readOnly?: boolean;
  /** 占位符 */
  placeholder?: string;
  /** 自定义样式类 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 错误回调 */
  onError?: (error: string) => void;
  /** 是否显示预览 */
  showPreview?: boolean;
  /** 编辑器配置 */
  config?: Partial<MarkdownEditorConfig>;
  /** 验证配置 */
  validationConfig?: {
    maxLength?: number;
    minLength?: number;
  };
}

/**
 * Markdown编辑器Ref接口
 */
export interface MarkdownEditorRef {
  /** 获取编辑器内容 */
  getContent: () => string;
  /** 设置编辑器内容 */
  setContent: (content: string) => void;
  /** 聚焦编辑器 */
  focus: () => void;
  /** 失焦编辑器 */
  blur: () => void;
  /** 验证内容 */
  validate: () => { isValid: boolean; errors: string[] };
  /** 插入文本 */
  insertText: (text: string) => void;
  /** 切换预览模式 */
  togglePreview: () => void;
}

/**
 * Markdown工具栏按钮配置
 */
interface ToolbarButton {
  icon: string;
  title: string;
  action: (editor: HTMLTextAreaElement) => void;
  shortcut?: string;
}

/**
 * Markdown预览组件
 */
const MarkdownPreview: React.FC<{ content: string; className?: string }> = ({ 
  content, 
  className 
}) => {
  const htmlContent = ContentDataAdapter.markdownToHtml(content);
  
  return (
    <div 
      className={`prose prose-sm max-w-none p-4 bg-gray-50 border border-gray-300 rounded-md overflow-auto ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

/**
 * Markdown工具栏组件
 */
const MarkdownToolbar: React.FC<{
  onAction: (action: (editor: HTMLTextAreaElement) => void) => void;
  disabled?: boolean;
}> = ({ onAction, disabled }) => {
  const buttons: ToolbarButton[] = [
    {
      icon: '𝐁',
      title: '粗体',
      shortcut: 'Ctrl+B',
      action: (editor) => {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);
        const replacement = selectedText ? `**${selectedText}**` : '**粗体文本**';
        
        editor.setRangeText(replacement, start, end, 'end');
        editor.focus();
      }
    },
    {
      icon: '𝐼',
      title: '斜体',
      shortcut: 'Ctrl+I',
      action: (editor) => {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);
        const replacement = selectedText ? `*${selectedText}*` : '*斜体文本*';
        
        editor.setRangeText(replacement, start, end, 'end');
        editor.focus();
      }
    },
    {
      icon: 'H1',
      title: '标题1',
      action: (editor) => {
        const start = editor.selectionStart;
        const lineStart = editor.value.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = editor.value.indexOf('\n', start);
        const currentLine = editor.value.substring(lineStart, lineEnd === -1 ? undefined : lineEnd);
        
        const replacement = currentLine.startsWith('# ') ? 
          currentLine.substring(2) : 
          `# ${currentLine}`;
        
        editor.setRangeText(replacement, lineStart, lineEnd === -1 ? editor.value.length : lineEnd);
        editor.focus();
      }
    },
    {
      icon: 'H2',
      title: '标题2',
      action: (editor) => {
        const start = editor.selectionStart;
        const lineStart = editor.value.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = editor.value.indexOf('\n', start);
        const currentLine = editor.value.substring(lineStart, lineEnd === -1 ? undefined : lineEnd);
        
        const replacement = currentLine.startsWith('## ') ? 
          currentLine.substring(3) : 
          `## ${currentLine}`;
        
        editor.setRangeText(replacement, lineStart, lineEnd === -1 ? editor.value.length : lineEnd);
        editor.focus();
      }
    },
    {
      icon: '•',
      title: '无序列表',
      action: (editor) => {
        const start = editor.selectionStart;
        const lineStart = editor.value.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = editor.value.indexOf('\n', start);
        const currentLine = editor.value.substring(lineStart, lineEnd === -1 ? undefined : lineEnd);
        
        const replacement = currentLine.startsWith('- ') ? 
          currentLine.substring(2) : 
          `- ${currentLine}`;
        
        editor.setRangeText(replacement, lineStart, lineEnd === -1 ? editor.value.length : lineEnd);
        editor.focus();
      }
    },
    {
      icon: '1.',
      title: '有序列表',
      action: (editor) => {
        const start = editor.selectionStart;
        const lineStart = editor.value.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = editor.value.indexOf('\n', start);
        const currentLine = editor.value.substring(lineStart, lineEnd === -1 ? undefined : lineEnd);
        
        const replacement = /^\d+\. /.test(currentLine) ? 
          currentLine.replace(/^\d+\. /, '') : 
          `1. ${currentLine}`;
        
        editor.setRangeText(replacement, lineStart, lineEnd === -1 ? editor.value.length : lineEnd);
        editor.focus();
      }
    },
    {
      icon: '🔗',
      title: '链接',
      action: (editor) => {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);
        const replacement = selectedText ? 
          `[${selectedText}](url)` : 
          '[链接文本](url)';
        
        editor.setRangeText(replacement, start, end, 'end');
        editor.focus();
      }
    },
    {
      icon: '💬',
      title: '引用',
      action: (editor) => {
        const start = editor.selectionStart;
        const lineStart = editor.value.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = editor.value.indexOf('\n', start);
        const currentLine = editor.value.substring(lineStart, lineEnd === -1 ? undefined : lineEnd);
        
        const replacement = currentLine.startsWith('> ') ? 
          currentLine.substring(2) : 
          `> ${currentLine}`;
        
        editor.setRangeText(replacement, lineStart, lineEnd === -1 ? editor.value.length : lineEnd);
        editor.focus();
      }
    },
    {
      icon: '</>', 
      title: '代码',
      action: (editor) => {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);
        
        if (selectedText.includes('\n')) {
          // 多行代码块
          const replacement = `\`\`\`\n${selectedText}\n\`\`\``;
          editor.setRangeText(replacement, start, end, 'end');
        } else {
          // 行内代码
          const replacement = selectedText ? `\`${selectedText}\`` : '`代码`';
          editor.setRangeText(replacement, start, end, 'end');
        }
        
        editor.focus();
      }
    }
  ];

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-gray-100 border-b border-gray-300 rounded-t-md">
      {buttons.map((button, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onAction(button.action)}
          disabled={disabled}
          title={`${button.title}${button.shortcut ? ` (${button.shortcut})` : ''}`}
          className="px-2 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {button.icon}
        </button>
      ))}
    </div>
  );
};

/**
 * Markdown编辑器组件
 */
export const MarkdownEditor = forwardRef<MarkdownEditorRef, MarkdownEditorProps>((
  {
    contentData,
    onChange,
    readOnly = false,
    placeholder,
    className,
    style,
    onError,
    showPreview = false,
    config = {},
    validationConfig = {}
  },
  ref
) => {
  const [content, setContent] = useState<string>('');
  const [isPreviewMode, setIsPreviewMode] = useState(showPreview);
  const [lineCount, setLineCount] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const finalConfig = { ...DEFAULT_MARKDOWN_CONFIG, ...config };

  // 初始化内容
  useEffect(() => {
    const initialContent = ContentDataAdapter.extractTextContent(contentData, 'MARKDOWN');
    setContent(initialContent);
    setLineCount(initialContent.split('\n').length);
  }, [contentData]);

  /**
   * 处理内容变化
   */
  const handleContentChange = useCallback((value: string) => {
    setContent(value);
    setLineCount(value.split('\n').length);
    
    // 验证内容
    const validation = ContentValidator.validateMarkdownContent(value, {
      maxLength: validationConfig.maxLength,
      minLength: validationConfig.minLength
    });
    
    if (!validation.isValid) {
      onError?.(validation.errors.join(', '));
      return;
    }
    
    if (validation.warnings.length > 0) {
      console.warn('Markdown validation warnings:', validation.warnings);
    }
    
    // 使用清理后的内容
    const finalContent = validation.cleanedContent || value;
    const updatedContentData = ContentDataAdapter.saveTextContent(
      finalContent,
      'MARKDOWN',
      contentData
    );
    
    onChange(updatedContentData);
  }, [contentData, onChange, onError, validationConfig]);

  /**
   * 处理键盘快捷键
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!textareaRef.current) return;
    
    const editor = textareaRef.current;
    
    // Tab键处理
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      
      if (e.shiftKey) {
        // Shift+Tab: 减少缩进
        const lineStart = editor.value.lastIndexOf('\n', start - 1) + 1;
        const currentLine = editor.value.substring(lineStart, editor.value.indexOf('\n', start));
        if (currentLine.startsWith('  ')) {
          editor.setRangeText('', lineStart, lineStart + 2);
        }
      } else {
        // Tab: 增加缩进
        editor.setRangeText('  ', start, end, 'end');
      }
      return;
    }
    
    // 快捷键处理
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          const boldStart = editor.selectionStart;
          const boldEnd = editor.selectionEnd;
          const boldText = editor.value.substring(boldStart, boldEnd);
          const boldReplacement = boldText ? `**${boldText}**` : '**粗体文本**';
          editor.setRangeText(boldReplacement, boldStart, boldEnd, 'end');
          break;
          
        case 'i':
          e.preventDefault();
          const italicStart = editor.selectionStart;
          const italicEnd = editor.selectionEnd;
          const italicText = editor.value.substring(italicStart, italicEnd);
          const italicReplacement = italicText ? `*${italicText}*` : '*斜体文本*';
          editor.setRangeText(italicReplacement, italicStart, italicEnd, 'end');
          break;
      }
    }
  }, []);

  /**
   * 工具栏操作处理
   */
  const handleToolbarAction = useCallback((action: (editor: HTMLTextAreaElement) => void) => {
    if (textareaRef.current) {
      action(textareaRef.current);
      handleContentChange(textareaRef.current.value);
    }
  }, [handleContentChange]);

  /**
   * 切换预览模式
   */
  const togglePreview = useCallback(() => {
    setIsPreviewMode(prev => !prev);
  }, []);

  // 暴露ref方法
  useImperativeHandle(ref, () => ({
    getContent: () => content,
    setContent: (newContent: string) => {
      setContent(newContent);
      if (textareaRef.current) {
        textareaRef.current.value = newContent;
      }
    },
    focus: () => {
      textareaRef.current?.focus();
    },
    blur: () => {
      textareaRef.current?.blur();
    },
    validate: () => {
      const validation = ContentValidator.validateMarkdownContent(content, validationConfig);
      return {
        isValid: validation.isValid,
        errors: validation.errors
      };
    },
    insertText: (text: string) => {
      if (textareaRef.current) {
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        textareaRef.current.setRangeText(text, start, end, 'end');
        handleContentChange(textareaRef.current.value);
      }
    },
    togglePreview
  }), [content, validationConfig, handleContentChange, togglePreview]);

  return (
    <div className={`border border-gray-300 rounded-md overflow-hidden ${className || ''}`} style={style}>
      {/* 工具栏 */}
      {!readOnly && (
        <div className="flex items-center justify-between bg-gray-100 border-b border-gray-300">
          <MarkdownToolbar onAction={handleToolbarAction} disabled={readOnly} />
          <div className="flex items-center gap-2 px-2">
            <button
              type="button"
              onClick={togglePreview}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              {isPreviewMode ? '编辑' : '预览'}
            </button>
            <span className="text-xs text-gray-500">
              {lineCount} 行
            </span>
          </div>
        </div>
      )}
      
      {/* 编辑器内容 */}
      <div className="relative">
        {isPreviewMode ? (
          <MarkdownPreview content={content} className="min-h-[200px]" />
        ) : (
          <div className="flex">
            {/* 行号 */}
            {finalConfig.lineNumbers && (
              <div className="flex-shrink-0 w-12 bg-gray-50 border-r border-gray-200 text-right text-xs text-gray-500 font-mono leading-6 py-3">
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i + 1} className="px-2">
                    {i + 1}
                  </div>
                ))}
              </div>
            )}
            
            {/* 文本编辑区 */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || finalConfig.placeholder}
              readOnly={readOnly}
              autoFocus={finalConfig.autofocus}
              spellCheck={finalConfig.spellcheck}
              className={`
                flex-1 min-h-[200px] p-3 resize-none border-0 outline-none font-mono text-sm leading-6
                ${finalConfig.lineWrapping ? 'whitespace-pre-wrap' : 'whitespace-pre overflow-x-auto'}
                focus:ring-0
              `}
              style={{
                tabSize: finalConfig.tabSize,
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
              }}
            />
          </div>
        )}
      </div>
      
      {/* 状态栏 */}
      <div className="flex items-center justify-between px-3 py-1 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        <span>Markdown</span>
        <span>{content.length} 字符</span>
      </div>
    </div>
  );
});

MarkdownEditor.displayName = 'MarkdownEditor';

export default MarkdownEditor;