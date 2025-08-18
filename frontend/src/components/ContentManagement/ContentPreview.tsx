import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { PageContent, ComponentInstance, ContentRealtimeEvent } from '../../types/content';
import { usePageContents, useComponentInstances, useContentRealtime } from '../../hooks/useContentManagement';
import { ContentRenderer } from '../ContentRenderer/ContentRenderer';
import { ComponentRenderer } from '../ContentRenderer/renderers/ComponentRenderer';

interface ContentPreviewProps {
  /** 页面ID */
  pageId: string;
  /** 预览模式 */
  mode?: 'desktop' | 'tablet' | 'mobile';
  /** 是否显示编辑工具 */
  showEditTools?: boolean;
  /** 是否启用实时更新 */
  enableRealtime?: boolean;
  /** 选中项变更回调 */
  onSelectionChange?: (type: 'content' | 'component', id: string | null) => void;
  /** 编辑回调 */
  onEdit?: (type: 'content' | 'component', id: string) => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 内容预览组件
 * 提供页面内容的实时预览功能
 */
export const ContentPreview: React.FC<ContentPreviewProps> = ({
  pageId,
  mode = 'desktop',
  showEditTools = false,
  enableRealtime = true,
  onSelectionChange,
  onEdit,
  className = ''
}) => {
  const [selectedItem, setSelectedItem] = useState<{ type: 'content' | 'component', id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  // 使用内容管理hooks
  const { contents = [], isLoading: contentsLoading, error: contentsError } = usePageContents(pageId);
  const { instances = [], isLoading: instancesLoading, error: instancesError } = useComponentInstances(pageId);
  
  // 稳定化实时更新回调
  const handleRealtimeUpdate = useCallback((event: ContentRealtimeEvent) => {
    // 处理实时更新事件
    console.log('Content realtime event:', event);
  }, []);

  // 启用实时更新
  useContentRealtime(pageId, enableRealtime ? handleRealtimeUpdate : undefined);

  // 计算加载状态
  useEffect(() => {
    setIsLoading(contentsLoading || instancesLoading);
    setError(contentsError?.message || instancesError?.message || null);
  }, [contentsLoading, instancesLoading, contentsError, instancesError]);

  // 获取激活的内容和组件
  const activeContents = useMemo(() => {
    return contents
      .filter((content: any) => content.is_active)
      .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [contents]);

  const activeInstances = useMemo(() => {
    return instances
      .filter((instance: any) => instance.is_active)
      .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [instances]);

  // 处理项目选择
  const handleItemSelect = useCallback((type: 'content' | 'component', id: string) => {
    const newSelection = { type, id };
    setSelectedItem(newSelection);
    onSelectionChange?.(type, id);
  }, [onSelectionChange]);

  // 处理项目编辑
  const handleItemEdit = useCallback((type: 'content' | 'component', id: string) => {
    onEdit?.(type, id);
  }, [onEdit]);

  // 处理缩放
  const handleScaleChange = useCallback((newScale: number) => {
    setScale(Math.max(0.25, Math.min(2, newScale)));
  }, []);

  // 获取预览容器样式
  const getPreviewContainerStyle = useCallback(() => {
    const baseStyles = {
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      transition: 'transform 0.3s ease'
    };

    switch (mode) {
      case 'mobile':
        return {
          ...baseStyles,
          width: '375px',
          minHeight: '667px'
        };
      case 'tablet':
        return {
          ...baseStyles,
          width: '768px',
          minHeight: '1024px'
        };
      case 'desktop':
      default:
        return {
          ...baseStyles,
          width: '100%',
          minHeight: '100vh'
        };
    }
  }, [mode, scale]);

  // 渲染内容项
  const renderContentItem = useCallback((content: PageContent) => {
    const isSelected = selectedItem?.type === 'content' && selectedItem.id === content.id;
    
    return (
      <div
        key={content.id}
        className={`preview-content-item ${isSelected ? 'selected' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          if (showEditTools) {
            handleItemSelect('content', content.id);
          }
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (showEditTools) {
            handleItemEdit('content', content.id);
          }
        }}
      >
        <ContentRenderer
          pageId={pageId}
          isEditMode={showEditTools}
          onContentUpdate={(event: ContentRealtimeEvent) => {
            // 处理内容更新
            console.log('Content updated:', event);
          }}
        />
        
        {showEditTools && isSelected && (
          <div className="item-tools">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleItemEdit('content', content.id);
              }}
              title="编辑内容"
            >
              ✏️
            </button>
            <span className="item-info">
              {content.content_type} - {content.content_key}
            </span>
          </div>
        )}
      </div>
    );
  }, [selectedItem, showEditTools, handleItemSelect, handleItemEdit]);

  // 渲染组件项
  const renderComponentItem = useCallback((instance: ComponentInstance) => {
    const isSelected = selectedItem?.type === 'component' && selectedItem.id === instance.id;
    
    return (
      <div
        key={instance.id}
        className={`preview-component-item ${isSelected ? 'selected' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          if (showEditTools) {
            handleItemSelect('component', instance.id);
          }
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (showEditTools) {
            handleItemEdit('component', instance.id);
          }
        }}
      >
        <ComponentRenderer
          instance={{
            ...instance,
            props_data: instance.layout_config || {},
            layout_data: instance.layout_config || {},
            style_overrides: instance.style_overrides || {},
            children: []
          } as any}
          isEditMode={showEditTools}
          onUpdate={(instanceId: string, updates: any) => {
            // 处理组件更新
            console.log('Instance updated:', instanceId, updates);
          }}
        />
        
        {showEditTools && isSelected && (
          <div className="item-tools">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleItemEdit('component', instance.id);
              }}
              title="编辑组件"
            >
              ⚙️
            </button>
            <span className="item-info">
              {instance.component_type} - {instance.component_name}
            </span>
          </div>
        )}
      </div>
    );
  }, [selectedItem, showEditTools, handleItemSelect, handleItemEdit]);

  // 渲染预览工具栏
  const renderToolbar = () => {
    if (!showEditTools) return null;

    return (
      <div className="preview-toolbar">
        <div className="toolbar-section">
          <label>设备模式:</label>
          <select
            value={mode}
            onChange={(e) => {
              // 这里需要父组件处理模式变更
              console.log('Mode change requested:', e.target.value);
            }}
          >
            <option value="desktop">桌面</option>
            <option value="tablet">平板</option>
            <option value="mobile">手机</option>
          </select>
        </div>
        
        <div className="toolbar-section">
          <label>缩放:</label>
          <div className="scale-controls">
            <button onClick={() => handleScaleChange(scale - 0.25)}>-</button>
            <span>{Math.round(scale * 100)}%</span>
            <button onClick={() => handleScaleChange(scale + 0.25)}>+</button>
            <button onClick={() => handleScaleChange(1)}>重置</button>
          </div>
        </div>
        
        <div className="toolbar-section">
          <button
            onClick={() => setSelectedItem(null)}
            disabled={!selectedItem}
          >
            取消选择
          </button>
        </div>
        
        <div className="toolbar-section">
          <span className="stats">
            内容: {activeContents.length} | 组件: {activeInstances.length}
          </span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`content-preview loading ${className}`}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>加载预览中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`content-preview error ${className}`}>
        <div className="error-message">
          <h3>预览加载失败</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`content-preview ${mode} ${className}`}>
      {renderToolbar()}
      
      <div className="preview-container">
        <div 
          className="preview-content"
          style={getPreviewContainerStyle()}
          onClick={() => {
            if (showEditTools) {
              setSelectedItem(null);
              onSelectionChange?.('content', null);
            }
          }}
        >
          {/* 渲染页面内容 */}
          <div className="page-contents">
            {activeContents.map(renderContentItem)}
          </div>
          
          {/* 渲染组件实例 */}
          <div className="page-components">
            {activeInstances.map(renderComponentItem)}
          </div>
          
          {/* 空状态 */}
          {activeContents.length === 0 && activeInstances.length === 0 && (
            <div className="empty-state">
              <div className="empty-content">
                <h3>页面为空</h3>
                <p>还没有添加任何内容或组件</p>
                {showEditTools && (
                  <p>使用右侧的管理面板添加内容</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 实时更新指示器 */}
      {enableRealtime && (
        <div className="realtime-indicator">
          <span className="indicator-dot"></span>
          实时同步
        </div>
      )}
    </div>
  );
};

// 样式
const styles = `
.content-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f9fafb;
  position: relative;
}

.content-preview.loading,
.content-preview.error {
  justify-content: center;
  align-items: center;
}

.loading-spinner {
  text-align: center;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  text-align: center;
  color: #dc2626;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.error-message h3 {
  margin: 0 0 1rem 0;
}

.error-message p {
  margin: 0 0 1rem 0;
  color: #6b7280;
}

.error-message button {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.preview-toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toolbar-section label {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.toolbar-section select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
}

.scale-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: #f3f4f6;
  border-radius: 6px;
  padding: 0.25rem;
}

.scale-controls button {
  width: 24px;
  height: 24px;
  border: none;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scale-controls button:hover {
  background: #e5e7eb;
}

.scale-controls span {
  padding: 0 0.5rem;
  font-size: 12px;
  color: #374151;
  min-width: 40px;
  text-align: center;
}

.stats {
  font-size: 12px;
  color: #6b7280;
}

.preview-container {
  flex: 1;
  overflow: auto;
  padding: 1rem;
  background: #e5e7eb;
}

.content-preview.mobile .preview-container {
  display: flex;
  justify-content: center;
}

.content-preview.tablet .preview-container {
  display: flex;
  justify-content: center;
}

.preview-content {
  background: white;
  min-height: 100%;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.content-preview.mobile .preview-content {
  border-radius: 20px;
  overflow: hidden;
}

.content-preview.tablet .preview-content {
  border-radius: 12px;
  overflow: hidden;
}

.page-contents,
.page-components {
  position: relative;
}

.preview-content-item,
.preview-component-item {
  position: relative;
  transition: all 0.2s ease;
}

.preview-content-item:hover,
.preview-component-item:hover {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.preview-content-item.selected,
.preview-component-item.selected {
  outline: 2px solid #10b981;
  outline-offset: 2px;
  background: rgba(16, 185, 129, 0.05);
}

.item-tools {
  position: absolute;
  top: -30px;
  left: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #374151;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 12px;
  z-index: 10;
  white-space: nowrap;
}

.item-tools button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 2px;
  font-size: 12px;
}

.item-tools button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.item-info {
  font-size: 11px;
  opacity: 0.8;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #6b7280;
}

.empty-content {
  text-align: center;
}

.empty-content h3 {
  margin: 0 0 0.5rem 0;
  color: #374151;
}

.empty-content p {
  margin: 0 0 0.5rem 0;
  font-size: 14px;
}

.realtime-indicator {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  z-index: 100;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .preview-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .toolbar-section {
    justify-content: space-between;
  }
  
  .preview-container {
    padding: 0.5rem;
  }
}
`;

// 注入样式
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default ContentPreview;