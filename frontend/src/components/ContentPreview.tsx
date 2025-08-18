/**
 * 内容预览组件
 * 统一预览不同类型的内容（富文本、Markdown、纯文本）
 */

import React, { useMemo } from 'react';
import type { ContentData } from '../types/content';
import { ContentDataAdapter } from '../utils/contentAdapter';
import { ContentValidator } from '../utils/contentValidator';

/**
 * 内容预览Props
 */
export interface ContentPreviewProps {
  /** 内容数据 */
  contentData: ContentData;
  /** 自定义样式类 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 是否显示类型标识 */
  showTypeIndicator?: boolean;
  /** 是否显示字符统计 */
  showStats?: boolean;
  /** 最大高度 */
  maxHeight?: string;
  /** 错误回调 */
  onError?: (error: string) => void;
  /** 预览模式 */
  mode?: 'full' | 'compact' | 'inline';
  /** 是否启用交互（链接点击等） */
  interactive?: boolean;
}

/**
 * 富文本预览组件
 */
const RichTextPreview: React.FC<{
  content: string;
  className?: string;
  interactive?: boolean;
}> = ({ content, className, interactive }) => {
  // 清理和验证HTML内容
  const sanitizedContent = useMemo(() => {
    const validation = ContentValidator.validateHtmlContent(content);
    if (!validation.isValid) {
      console.warn('HTML content validation failed:', validation.errors);
      return '<p>内容格式错误</p>';
    }
    return validation.cleanedContent || content;
  }, [content]);

  return (
    <div 
      className={`prose prose-sm max-w-none ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      onClick={interactive ? undefined : (e) => {
        // 禁用链接点击
        if ((e.target as HTMLElement).tagName === 'A') {
          e.preventDefault();
        }
      }}
    />
  );
};

/**
 * Markdown预览组件
 */
const MarkdownPreview: React.FC<{
  content: string;
  className?: string;
  interactive?: boolean;
}> = ({ content, className, interactive }) => {
  // 将Markdown转换为HTML并清理
  const htmlContent = useMemo(() => {
    try {
      const html = ContentDataAdapter.markdownToHtml(content);
      const validation = ContentValidator.validateHtmlContent(html);
      if (!validation.isValid) {
        console.warn('Markdown to HTML validation failed:', validation.errors);
        return '<p>Markdown格式错误</p>';
      }
      return validation.cleanedContent || html;
    } catch (error) {
      console.error('Markdown conversion error:', error);
      return '<p>Markdown转换失败</p>';
    }
  }, [content]);

  return (
    <div 
      className={`prose prose-sm max-w-none ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      onClick={interactive ? undefined : (e) => {
        // 禁用链接点击
        if ((e.target as HTMLElement).tagName === 'A') {
          e.preventDefault();
        }
      }}
    />
  );
};

/**
 * 纯文本预览组件
 */
const PlainTextPreview: React.FC<{
  content: string;
  className?: string;
  mode?: 'full' | 'compact' | 'inline';
}> = ({ content, className, mode = 'full' }) => {
  const formattedContent = useMemo(() => {
    if (mode === 'inline') {
      // 内联模式：单行显示，超长截断
      return content.replace(/\n/g, ' ').substring(0, 100) + (content.length > 100 ? '...' : '');
    }
    return content;
  }, [content, mode]);

  if (mode === 'inline') {
    return (
      <span className={`text-gray-700 ${className || ''}`}>
        {formattedContent}
      </span>
    );
  }

  return (
    <pre className={`whitespace-pre-wrap text-sm text-gray-700 font-sans ${className || ''}`}>
      {formattedContent}
    </pre>
  );
};

/**
 * 内容类型指示器
 */
const TypeIndicator: React.FC<{ type: string }> = ({ type }) => {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'TEXT':
        return { label: '富文本', color: 'bg-blue-100 text-blue-800', icon: '🎨' };
      case 'MARKDOWN':
        return { label: 'Markdown', color: 'bg-green-100 text-green-800', icon: '📝' };
      case 'PLAIN':
        return { label: '纯文本', color: 'bg-gray-100 text-gray-800', icon: '📄' };
      default:
        return { label: '未知', color: 'bg-red-100 text-red-800', icon: '❓' };
    }
  };

  const config = getTypeConfig(type);

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
};

/**
 * 内容统计组件
 */
const ContentStats: React.FC<{ contentData: ContentData }> = ({ contentData }) => {
  const stats = useMemo(() => {
    const textContent = ContentDataAdapter.extractTextContent(contentData, contentData.type);
    const charCount = textContent.length;
    const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
    const lineCount = textContent.split('\n').length;
    
    return { charCount, wordCount, lineCount };
  }, [contentData]);

  return (
    <div className="flex items-center gap-4 text-xs text-gray-500">
      <span>{stats.charCount} 字符</span>
      <span>{stats.wordCount} 词</span>
      <span>{stats.lineCount} 行</span>
    </div>
  );
};

/**
 * 内容预览组件
 */
export const ContentPreview: React.FC<ContentPreviewProps> = ({
  contentData,
  className,
  style,
  showTypeIndicator = false,
  showStats = false,
  maxHeight,
  onError,
  mode = 'full',
  interactive = false
}) => {
  // 提取内容
  const content = useMemo(() => {
    try {
      return ContentDataAdapter.extractTextContent(contentData, contentData.type);
    } catch (error) {
      const errorMsg = `内容提取失败: ${error instanceof Error ? error.message : '未知错误'}`;
      onError?.(errorMsg);
      return '';
    }
  }, [contentData, onError]);

  // 渲染内容预览
  const renderContent = () => {
    if (!content.trim()) {
      return (
        <div className="text-gray-400 italic text-sm p-4 text-center">
          暂无内容
        </div>
      );
    }

    const contentClassName = mode === 'compact' ? 'text-sm' : '';

    switch (contentData.type) {
      case 'TEXT':
        return (
          <RichTextPreview 
            content={content} 
            className={contentClassName}
            interactive={interactive}
          />
        );
      
      case 'MARKDOWN':
        return (
          <MarkdownPreview 
            content={content} 
            className={contentClassName}
            interactive={interactive}
          />
        );
      
      case 'PLAIN':
      default:
        return (
          <PlainTextPreview 
            content={content} 
            className={contentClassName}
            mode={mode}
          />
        );
    }
  };

  // 容器样式
  const containerStyle = {
    ...style,
    ...(maxHeight && { maxHeight, overflowY: 'auto' as const })
  };

  const containerClassName = `
    ${mode === 'inline' ? 'inline-block' : 'block'}
    ${mode === 'compact' ? 'space-y-2' : 'space-y-4'}
    ${className || ''}
  `.trim();

  if (mode === 'inline') {
    return (
      <div className={containerClassName} style={containerStyle}>
        {renderContent()}
      </div>
    );
  }

  return (
    <div className={containerClassName} style={containerStyle}>
      {/* 头部信息 */}
      {(showTypeIndicator || showStats) && (
        <div className="flex items-center justify-between mb-3">
          {showTypeIndicator && (
            <TypeIndicator type={contentData.type} />
          )}
          {showStats && (
            <ContentStats contentData={contentData} />
          )}
        </div>
      )}
      
      {/* 内容区域 */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4">
          {renderContent()}
        </div>
      </div>
      
      {/* 底部信息 */}
      {mode === 'full' && contentData.metadata && Object.keys(contentData.metadata).length > 0 && (
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">元数据</h4>
          <div className="space-y-1">
            {Object.entries(contentData.metadata).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 text-xs">
                <span className="font-medium text-gray-600">{key}:</span>
                <span className="text-gray-500">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentPreview;