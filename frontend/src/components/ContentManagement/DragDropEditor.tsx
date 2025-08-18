/**
 * 拖拽编辑器组件
 * 提供可视化拖拽布局编辑功能
 */
import React, { useState, useCallback, useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import type { PageContent, ComponentInstance } from '../../types/content';
import { ContentRenderer } from '../ContentRenderer/ContentRenderer';
import { ComponentRenderer } from '../ContentRenderer/renderers/ComponentRenderer';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DragDropEditorProps {
  /** 页面ID */
  pageId: string;
  /** 页面内容 */
  contents: PageContent[];
  /** 组件实例 */
  instances: ComponentInstance[];
  /** 是否启用编辑模式 */
  isEditMode?: boolean;
  /** 布局更新回调 */
  onLayoutChange?: (layout: Layout[], layouts: { [key: string]: Layout[] }) => void;
  /** 内容更新回调 */
  onContentUpdate?: (contentId: string, updates: Partial<PageContent>) => void;
  /** 组件更新回调 */
  onComponentUpdate?: (instanceId: string, updates: Partial<ComponentInstance>) => void;
  /** 项目删除回调 */
  onItemDelete?: (type: 'content' | 'component', id: string) => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 拖拽编辑器组件
 * 支持内容和组件的拖拽排序、调整大小等功能
 */
export const DragDropEditor: React.FC<DragDropEditorProps> = ({
  pageId,
  contents,
  instances,
  isEditMode = false,
  onLayoutChange,
  onContentUpdate,
  onComponentUpdate,
  onItemDelete,
  className = ''
}) => {
  const [selectedItem, setSelectedItem] = useState<{ type: 'content' | 'component', id: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 生成布局数据
  const generateLayouts = useCallback(() => {
    const layouts: { [key: string]: Layout[] } = {
      lg: [],
      md: [],
      sm: [],
      xs: [],
      xxs: []
    };

    // 处理内容项
    contents.forEach((content, index) => {
      const layoutItem: Layout = {
        i: `content-${content.id}`,
        x: (index % 2) * 6,
        y: Math.floor(index / 2) * 4,
        w: 6,
        h: 4,
        minW: 2,
        minH: 2,
        maxW: 12,
        maxH: 8
      };
      
      Object.keys(layouts).forEach(breakpoint => {
        layouts[breakpoint].push({ ...layoutItem });
      });
    });

    // 处理组件实例
    instances.forEach((instance, index) => {
      const layoutItem: Layout = {
        i: `component-${instance.id}`,
        x: (index % 2) * 6,
        y: Math.floor((contents.length + index) / 2) * 4,
        w: 6,
        h: 4,
        minW: 2,
        minH: 2,
        maxW: 12,
        maxH: 8
      };
      
      Object.keys(layouts).forEach(breakpoint => {
        layouts[breakpoint].push({ ...layoutItem });
      });
    });

    return layouts;
  }, [contents, instances]);

  const layouts = useMemo(() => generateLayouts(), [generateLayouts]);

  // 处理布局变更
  const handleLayoutChange = useCallback((layout: Layout[], allLayouts: { [key: string]: Layout[] }) => {
    if (onLayoutChange) {
      onLayoutChange(layout, allLayouts);
    }

    // 更新内容和组件的排序
    layout.forEach((item, index) => {
      if (item.i.startsWith('content-')) {
        const contentId = item.i.replace('content-', '');
        if (onContentUpdate) {
          onContentUpdate(contentId, {
            sort_order: index,
            updated_at: new Date().toISOString()
          });
        }
      } else if (item.i.startsWith('component-')) {
        const instanceId = item.i.replace('component-', '');
        if (onComponentUpdate) {
          onComponentUpdate(instanceId, {
            sort_order: index,
            updated_at: new Date().toISOString()
          });
        }
      }
    });
  }, [onLayoutChange, onContentUpdate, onComponentUpdate]);

  // 处理拖拽开始
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  // 处理拖拽结束
  const handleDragStop = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 处理项目选择
  const handleItemSelect = useCallback((type: 'content' | 'component', id: string) => {
    setSelectedItem({ type, id });
  }, []);

  // 处理项目删除
  const handleItemDelete = useCallback((type: 'content' | 'component', id: string) => {
    if (onItemDelete) {
      onItemDelete(type, id);
    }
    if (selectedItem?.type === type && selectedItem.id === id) {
      setSelectedItem(null);
    }
  }, [onItemDelete, selectedItem]);

  // 渲染内容项
  const renderContentItem = useCallback((content: PageContent) => {
    const isSelected = selectedItem?.type === 'content' && selectedItem.id === content.id;
    
    return (
      <div
        key={`content-${content.id}`}
        className={`drag-item content-item ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
        onClick={() => handleItemSelect('content', content.id)}
      >
        <ContentRenderer
          pageId={pageId}
          isEditMode={isEditMode}
          className="item-content"
        />
        
        {isEditMode && (
          <div className="item-controls">
            <div className="item-info">
              <span className="item-type">内容</span>
              <span className="item-key">{content.content_key}</span>
            </div>
            <div className="item-actions">
              <button
                className="action-btn edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  // 触发编辑
                }}
                title="编辑内容"
              >
                ✏️
              </button>
              <button
                className="action-btn delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemDelete('content', content.id);
                }}
                title="删除内容"
              >
                🗑️
              </button>
            </div>
          </div>
        )}
        
        {isEditMode && (
          <div className="drag-handle" title="拖拽移动">
            ⋮⋮
          </div>
        )}
      </div>
    );
  }, [pageId, isEditMode, selectedItem, isDragging, handleItemSelect, handleItemDelete]);

  // 渲染组件项
  const renderComponentItem = useCallback((instance: ComponentInstance) => {
    const isSelected = selectedItem?.type === 'component' && selectedItem.id === instance.id;
    
    return (
      <div
        key={`component-${instance.id}`}
        className={`drag-item component-item ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
        onClick={() => handleItemSelect('component', instance.id)}
      >
        <ComponentRenderer
          instance={{
            ...instance,
            props_data: instance.layout_config || {},
            layout_data: instance.layout_config || {},
            style_overrides: instance.style_overrides || {},
            children: []
          } as any}
          isEditMode={isEditMode}
          className="item-content"
        />
        
        {isEditMode && (
          <div className="item-controls">
            <div className="item-info">
              <span className="item-type">组件</span>
              <span className="item-key">{instance.component_type}</span>
            </div>
            <div className="item-actions">
              <button
                className="action-btn edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  // 触发编辑
                }}
                title="编辑组件"
              >
                ⚙️
              </button>
              <button
                className="action-btn delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemDelete('component', instance.id);
                }}
                title="删除组件"
              >
                🗑️
              </button>
            </div>
          </div>
        )}
        
        {isEditMode && (
          <div className="drag-handle" title="拖拽移动">
            ⋮⋮
          </div>
        )}
      </div>
    );
  }, [isEditMode, selectedItem, isDragging, handleItemSelect, handleItemDelete]);

  // 渲染所有项目
  const renderItems = useCallback(() => {
    const items: React.ReactNode[] = [];
    
    // 渲染内容项
    contents.forEach(content => {
      items.push(renderContentItem(content));
    });
    
    // 渲染组件项
    instances.forEach(instance => {
      items.push(renderComponentItem(instance));
    });
    
    return items;
  }, [contents, instances, renderContentItem, renderComponentItem]);

  if (!isEditMode) {
    // 非编辑模式下使用普通布局
    return (
      <div className={`drag-drop-editor preview-mode ${className}`}>
        <div className="static-layout">
          {contents.map(content => (
            <div key={content.id} className="static-item">
              <ContentRenderer
                pageId={pageId}
                isEditMode={false}
              />
            </div>
          ))}
          {instances.map(instance => (
            <div key={instance.id} className="static-item">
              <ComponentRenderer
                instance={{
                  ...instance,
                  props_data: instance.layout_config || {},
                  layout_data: instance.layout_config || {},
                  style_overrides: instance.style_overrides || {},
                  children: []
                } as any}
                isEditMode={false}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`drag-drop-editor edit-mode ${className}`}>
      <div className="editor-header">
        <h3>拖拽编辑器</h3>
        <div className="editor-info">
          <span>内容: {contents.length}</span>
          <span>组件: {instances.length}</span>
          {selectedItem && (
            <span className="selected-info">
              已选择: {selectedItem.type === 'content' ? '内容' : '组件'}
            </span>
          )}
        </div>
      </div>
      
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={60}
        margin={[16, 16]}
        containerPadding={[16, 16]}
        isDraggable={true}
        isResizable={true}
        onLayoutChange={handleLayoutChange}
        onDragStart={handleDragStart}
        onDragStop={handleDragStop}
        onResizeStart={handleDragStart}
        onResizeStop={handleDragStop}
        draggableHandle=".drag-handle"
      >
        {renderItems()}
      </ResponsiveGridLayout>
      
      {selectedItem && (
        <div className="selection-info">
          <p>
            已选择 {selectedItem.type === 'content' ? '内容' : '组件'}: {selectedItem.id}
          </p>
          <p className="tip">
            💡 拖拽右下角调整大小，拖拽 ⋮⋮ 图标移动位置
          </p>
        </div>
      )}
    </div>
  );
};

// 样式已移至全局CSS文件 (src/index.css)

export default DragDropEditor;