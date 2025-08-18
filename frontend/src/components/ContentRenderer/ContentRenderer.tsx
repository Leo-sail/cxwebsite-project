import React, { useMemo } from 'react';
import { usePageContents, useComponentInstances, useContentRealtime } from '../../hooks/useContentManagement';
import type {
  ExtendedPageContent,
  ExtendedComponentInstance,
  ContentRealtimeEvent
} from '../../types/content';
import {
  ContentType
} from '../../types/content';
import { TextRenderer } from './renderers/TextRenderer';
import { ImageRenderer } from './renderers/ImageRenderer';
import { VideoRenderer } from './renderers/VideoRenderer';
import { HtmlRenderer } from './renderers/HtmlRenderer';
import { MarkdownRenderer } from './renderers/MarkdownRenderer';
import { ComponentRenderer } from './renderers/ComponentRenderer';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorBoundary } from '../ui/ErrorBoundary';

interface ContentRendererProps {
  /** 页面ID */
  pageId: string;
  /** 是否为编辑模式 */
  isEditMode?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 内容更新回调 */
  onContentUpdate?: (event: ContentRealtimeEvent) => void;
  /** 错误处理回调 */
  onError?: (error: Error) => void;
}

/**
 * 内容渲染器组件
 * 根据页面配置动态渲染页面内容和组件
 */
export const ContentRenderer: React.FC<ContentRendererProps> = ({
  pageId,
  isEditMode = false,
  className = '',
  onContentUpdate,
  onError
}) => {
  // 获取页面内容数据
  const {
    contents,
    isLoading: isLoadingContents,
    error: contentsError
  } = usePageContents(pageId);

  // 获取组件实例数据
  const {
    instances,
    isLoading: isLoadingInstances,
    error: instancesError
  } = useComponentInstances(pageId);

  // 实时更新订阅
  const { isConnected } = useContentRealtime(pageId, onContentUpdate);

  // 处理错误
  const error = contentsError || instancesError;
  if (error && onError) {
    onError(error as Error);
  }

  // 按排序顺序排列内容
  const sortedContents = useMemo(() => {
    if (!contents) return [];
    return [...contents]
      .filter(content => content.is_active !== false)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [contents]);

  // 按排序顺序排列组件实例（仅顶级组件）
  const sortedInstances = useMemo(() => {
    if (!instances) return [];
    return [...instances]
      .filter(instance => instance.is_active !== false && !instance.parent_id)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [instances]);

  /**
   * 转换数据库内容为扩展内容类型
   */
  const transformContent = (content: any): ExtendedPageContent => {
    return {
      ...content,
      content_data: content.content_data as any || {},
      position_data: content.position_data as any || {},
      style_data: content.style_data as any || {}
    };
  };

  /**
   * 转换数据库组件实例为扩展组件实例类型
   */
  const transformInstance = (instance: any): ExtendedComponentInstance => {
    return {
      ...instance,
      props_data: instance.props_data || instance.layout_config || {},
      layout_data: instance.layout_config || {},
      style_overrides: instance.style_overrides || {},
      children: instance.children || []
    };
  };

  /**
   * 渲染单个内容项
   */
  const renderContent = (content: any) => {
    const transformedContent = transformContent(content);
    const { id, content_type, content_data, style_data, position_data } = transformedContent;
    
    const contentStyle = {
      ...style_data,
      ...position_data
    };

    const commonProps = {
      key: `content-${id}`,
      contentId: id,
      data: content_data,
      style: contentStyle,
      isEditMode,
      className: isEditMode ? 'content-editable' : ''
    };

    switch (content_type) {
      case ContentType.TEXT:
        return <TextRenderer {...commonProps} />;
      
      case ContentType.IMAGE:
        return <ImageRenderer {...commonProps} />;
      
      case ContentType.VIDEO:
        return <VideoRenderer {...commonProps} />;
      
      case ContentType.HTML:
        return <HtmlRenderer {...commonProps} />;
      
      case ContentType.MARKDOWN:
        return <MarkdownRenderer {...commonProps} content={transformedContent as any} />;
      
      default:
        console.warn(`未知的内容类型: ${content_type}`);
        return (
          <div key={`content-${id}`} className="unknown-content-type">
            <p>未支持的内容类型: {content_type}</p>
          </div>
        );
    }
  };

  /**
   * 渲染单个组件实例
   */
  const renderComponentInstance = (instance: ExtendedComponentInstance) => {
    const { id } = instance;

    return (
      <ComponentRenderer
        key={`component-${id}`}
        instance={instance}
        isEditMode={isEditMode}
      />
    );
  };

  // 加载状态
  if (isLoadingContents || isLoadingInstances) {
    return (
      <div className={`content-renderer loading ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className={`content-renderer error ${className}`}>
        <div className="error-message">
          <h3>内容加载失败</h3>
          <p>{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div 
        className={`content-renderer ${isEditMode ? 'edit-mode' : 'view-mode'} ${className}`}
        data-page-id={pageId}
        data-realtime-connected={isConnected}
      >
        {/* 实时连接状态指示器（仅编辑模式） */}
        {isEditMode && (
          <div className={`realtime-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="indicator-dot"></span>
            {isConnected ? '实时同步已连接' : '实时同步已断开'}
          </div>
        )}

        {/* 渲染页面内容 */}
        <div className="page-contents">
          {sortedContents.map(renderContent)}
        </div>

        {/* 渲染组件实例 */}
        <div className="component-instances">
          {sortedInstances.map((instance: any) => renderComponentInstance(transformInstance(instance)))}
        </div>

        {/* 空状态提示（仅编辑模式） */}
        {isEditMode && sortedContents.length === 0 && sortedInstances.length === 0 && (
          <div className="empty-state">
            <div className="empty-content">
              <h3>页面内容为空</h3>
              <p>开始添加内容和组件来构建您的页面</p>
              <button className="add-content-button">
                添加内容
              </button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

// 样式
const styles = `
.content-renderer {
  position: relative;
  width: 100%;
  min-height: 100vh;
}

.content-renderer.edit-mode {
  border: 2px dashed #e2e8f0;
  padding: 1rem;
}

.realtime-indicator {
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 0.875rem;
  z-index: 1000;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
}

.realtime-indicator.connected .indicator-dot {
  background: #10b981;
}

.page-contents,
.component-instances {
  display: contents;
}

.content-editable {
  position: relative;
  outline: 2px dashed transparent;
  transition: outline-color 0.2s;
}

.content-editable:hover {
  outline-color: #3b82f6;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.empty-content h3 {
  margin-bottom: 0.5rem;
  color: #6b7280;
}

.empty-content p {
  margin-bottom: 1rem;
  color: #9ca3af;
}

.add-content-button {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

.add-content-button:hover {
  background: #2563eb;
}

.error-message {
  text-align: center;
  padding: 2rem;
}

.error-message h3 {
  color: #ef4444;
  margin-bottom: 1rem;
}

.retry-button {
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.retry-button:hover {
  background: #dc2626;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.unknown-content-type {
  padding: 1rem;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 0.5rem;
  margin: 0.5rem 0;
}
`;

// 注入样式
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default ContentRenderer;