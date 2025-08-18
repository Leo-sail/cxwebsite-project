/**
 * 富文本编辑器组件
 * 基于React-Quill实现，支持富文本编辑功能
 */

import React, { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import type { ContentData } from '../types/content';
import { ContentDataAdapter } from '../utils/contentAdapter';
import { ContentValidator } from '../utils/contentValidator';
import { DEFAULT_RICH_TEXT_CONFIG } from '../utils/editorConfig';

// React-Quill类型定义
interface ReactQuillProps {
  value?: string;
  onChange?: (value: string, delta?: any, source?: any, editor?: any) => void;
  onBlur?: (previousRange: any, source: string, editor: any) => void;
  onFocus?: (range: any, source: string, editor: any) => void;
  placeholder?: string;
  readOnly?: boolean;
  theme?: string;
  modules?: any;
  formats?: string[];
  bounds?: string | HTMLElement;
  scrollingContainer?: string | HTMLElement;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<any>;
}

// 动态导入React-Quill
let ReactQuill: React.ComponentType<ReactQuillProps> | null = null;
let isQuillLoading = false;
let quillLoadPromise: Promise<void> | null = null;

/**
 * 懒加载React-Quill
 */
const loadQuill = async (): Promise<void> => {
  if (ReactQuill) return;
  if (quillLoadPromise) return quillLoadPromise;
  if (isQuillLoading) return;
  
  isQuillLoading = true;
  quillLoadPromise = (async () => {
    try {
      // 动态导入React-Quill和样式
      const [quillModule] = await Promise.all([
        import('react-quill'),
        import('react-quill/dist/quill.snow.css')
      ]);
      
      ReactQuill = quillModule.default;
    } catch (error) {
      console.error('Failed to load React-Quill:', error);
      throw error;
    } finally {
      isQuillLoading = false;
    }
  })();
  
  return quillLoadPromise;
};

/**
 * 富文本编辑器Props
 */
export interface RichTextEditorProps {
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
  /** 验证配置 */
  validationConfig?: {
    maxLength?: number;
    minLength?: number;
  };
}

/**
 * 富文本编辑器Ref接口
 */
export interface RichTextEditorRef {
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
}

/**
 * 加载中组件
 */
const LoadingEditor: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ 
  className, 
  style 
}) => (
  <div 
    className={`border border-gray-300 rounded-md p-4 bg-gray-50 ${className || ''}`}
    style={style}
  >
    <div className="flex items-center justify-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span className="ml-2 text-gray-600">加载编辑器中...</span>
    </div>
  </div>
);

/**
 * 错误显示组件
 */
const ErrorEditor: React.FC<{ 
  error: string; 
  onRetry: () => void;
  className?: string; 
  style?: React.CSSProperties;
}> = ({ error, onRetry, className, style }) => (
  <div 
    className={`border border-red-300 rounded-md p-4 bg-red-50 ${className || ''}`}
    style={style}
  >
    <div className="text-center">
      <div className="text-red-600 mb-2">编辑器加载失败</div>
      <div className="text-sm text-gray-600 mb-4">{error}</div>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        重试
      </button>
    </div>
  </div>
);

/**
 * 降级文本编辑器
 */
const FallbackEditor: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
}> = ({ value, onChange, placeholder, readOnly, className, style }) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    readOnly={readOnly}
    className={`w-full min-h-[200px] p-3 border border-gray-300 rounded-md resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className || ''}`}
    style={style}
  />
);

/**
 * 富文本编辑器组件
 */
export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>((
  {
    contentData,
    onChange,
    readOnly = false,
    placeholder,
    className,
    style,
    onError,
    validationConfig = {}
  },
  ref
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [useFallback, setUseFallback] = useState(false);
  const quillRef = useRef<any>(null);
  const editorRef = useRef<any>(null);

  // 初始化内容
  useEffect(() => {
    const initialContent = ContentDataAdapter.extractTextContent(contentData, 'TEXT');
    setContent(initialContent);
  }, [contentData]);

  // 加载Quill编辑器
  useEffect(() => {
    const initializeEditor = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        await loadQuill();
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize rich text editor:', error);
        setLoadError(error instanceof Error ? error.message : '未知错误');
        setIsLoading(false);
        setUseFallback(true);
        onError?.('富文本编辑器加载失败，已切换到基础编辑器');
      }
    };

    initializeEditor();
  }, [onError]);

  /**
   * 处理内容变化
   */
  const handleContentChange = useCallback((value: string, _delta?: any, _source?: any, _editor?: any) => {
    setContent(value);
    
    // 验证内容
    const validation = ContentValidator.validateHtmlContent(value, {
      maxLength: validationConfig.maxLength,
      minLength: validationConfig.minLength
    });
    
    if (!validation.isValid) {
      onError?.(validation.errors.join(', '));
      return;
    }
    
    if (validation.warnings.length > 0) {
      console.warn('Content validation warnings:', validation.warnings);
    }
    
    // 使用清理后的内容
    const finalContent = validation.cleanedContent || value;
    const updatedContentData = ContentDataAdapter.saveTextContent(
      finalContent,
      'TEXT',
      contentData
    );
    
    onChange(updatedContentData);
  }, [contentData, onChange, onError, validationConfig]);

  /**
   * 重试加载编辑器
   */
  const handleRetry = useCallback(() => {
    setLoadError(null);
    setUseFallback(false);
    setIsLoading(true);
    
    loadQuill()
      .then(() => setIsLoading(false))
      .catch((error) => {
        setLoadError(error.message);
        setIsLoading(false);
        setUseFallback(true);
      });
  }, []);

  // 暴露ref方法
  useImperativeHandle(ref, () => ({
    getContent: () => content,
    setContent: (newContent: string) => {
      setContent(newContent);
      if (quillRef.current) {
        quillRef.current.getEditor().setContents(quillRef.current.getEditor().clipboard.convert(newContent));
      }
    },
    focus: () => {
      if (quillRef.current) {
        quillRef.current.focus();
      } else if (editorRef.current) {
        editorRef.current.focus();
      }
    },
    blur: () => {
      if (quillRef.current) {
        quillRef.current.blur();
      } else if (editorRef.current) {
        editorRef.current.blur();
      }
    },
    validate: () => {
      const validation = ContentValidator.validateHtmlContent(content, validationConfig);
      return {
        isValid: validation.isValid,
        errors: validation.errors
      };
    }
  }), [content, validationConfig]);

  // 渲染加载状态
  if (isLoading) {
    return <LoadingEditor className={className} style={style} />;
  }

  // 渲染错误状态
  if (loadError && !useFallback) {
    return (
      <ErrorEditor 
        error={loadError} 
        onRetry={handleRetry}
        className={className}
        style={style}
      />
    );
  }

  // 渲染降级编辑器
  if (useFallback || !ReactQuill) {
    return (
      <div className={className} style={style}>
        <div className="mb-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
          ⚠️ 富文本编辑器不可用，已切换到基础编辑器
        </div>
        <FallbackEditor
          value={content}
          onChange={(value: string) => handleContentChange(value)}
          placeholder={placeholder}
          readOnly={readOnly}
        />
      </div>
    );
  }

  // 渲染富文本编辑器
  return (
    <div className={className} style={style}>
      {React.createElement(ReactQuill as any, {
        ref: quillRef,
        value: content,
        onChange: handleContentChange,
        readOnly: readOnly,
        placeholder: placeholder || DEFAULT_RICH_TEXT_CONFIG.placeholder,
        ...DEFAULT_RICH_TEXT_CONFIG,
        className: "bg-white"
      })}
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;