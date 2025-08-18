import React, { useState, useCallback, useEffect } from 'react';
import { usePageContents, useComponentInstances, useContentSearch } from '../../hooks/useContentManagement';
import type { PageContent, ComponentInstance, ContentRealtimeEvent } from '../../types/content';
import { ComponentType, ContentType } from '../../types/content';
import { ContentRenderer } from '../ContentRenderer/ContentRenderer';

interface ContentManagementPanelProps {
  /** 页面ID */
  pageId: string;
  /** 是否为编辑模式 */
  isEditMode?: boolean;
  /** 面板标题 */
  title?: string;
  /** 自定义类名 */
  className?: string;
  /** 内容变更回调 */
  onContentChange?: (pageId: string) => void;
}

/**
 * 内容管理面板
 * 提供页面内容和组件的可视化管理界面
 */
export const ContentManagementPanel: React.FC<ContentManagementPanelProps> = ({
  pageId,
  isEditMode = false,
  title = '内容管理',
  className = '',
  onContentChange
}) => {
  const [activeTab, setActiveTab] = useState<'contents' | 'components' | 'preview'>('preview');
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addType, setAddType] = useState<'content' | 'component'>('content');
  const [searchQuery, setSearchQuery] = useState('');

  // 使用内容管理hooks
  const {
    contents,
    isLoading: contentsLoading,
    error: contentsError,
    createContent,
    deleteContent,
    refetch: refreshContents
  } = usePageContents(pageId);

  const {
    instances,
    isLoading: instancesLoading,
    error: instancesError,
    createInstance,
    deleteInstance,
    refetch: refetchInstances
  } = useComponentInstances(pageId);

  const {
    searchResults,
    componentSearchResults,
    searchContents,
    searchComponents
  } = useContentSearch();

  // 搜索结果
  const [filteredContents, setFilteredContents] = useState<PageContent[]>([]);
  const [filteredInstances, setFilteredInstances] = useState<ComponentInstance[]>([]);

  // 处理搜索
  useEffect(() => {
    if (searchQuery.trim()) {
      searchContents({
        pageId,
        contentKey: searchQuery,
        contentType: 'text'
      });
      searchComponents({
        pageId,
        componentType: 'button'
      });
      
      setFilteredContents(searchResults?.data || []);
      setFilteredInstances(componentSearchResults?.data || []);
    } else {
      setFilteredContents(contents || []);
      setFilteredInstances(instances || []);
    }
  }, [searchQuery, contents, instances, pageId, searchContents, searchComponents, searchResults, componentSearchResults]);

  // 处理内容创建
  const handleCreateContent = useCallback(async (type: ContentType) => {
    try {
      const newContent = await createContent({
        page_id: pageId,
        content_type: type,
        content_key: `${type}_${Date.now()}`,
        title: `新${type}内容`,
        content_data: {
          value: type === ContentType.TEXT ? '新文本内容' : '',
          metadata: {
            createdAt: new Date().toISOString()
          }
        },
        position_data: {
          x: 0,
          y: 0,
          width: '100%',
          height: 'auto'
        },
        style_data: {},
        sort_order: contents.length
      });
      
      setSelectedContentId(newContent.id);
      setShowAddDialog(false);
      onContentChange?.(pageId);
    } catch (error) {
      console.error('创建内容失败:', error);
    }
  }, [createContent, contents.length, pageId, onContentChange]);

  // 处理组件创建
  const handleCreateComponent = useCallback(async (type: ComponentType) => {
    try {
      const newInstance = await createInstance({
        page_id: pageId,
        component_type: type,
        component_name: `${type}_${Date.now()}`,
        layout_config: getDefaultProps(type),

        style_overrides: {},
        sort_order: instances?.length || 0
      });
      
      setSelectedComponentId(newInstance.id);
      setShowAddDialog(false);
      onContentChange?.(pageId);
    } catch (error) {
      console.error('创建组件失败:', error);
    }
  }, [createInstance, instances?.length, pageId, onContentChange]);

  // 获取默认属性
  const getDefaultProps = (type: ComponentType): any => {
    switch (type) {
      case ComponentType.BUTTON:
        return { text: '按钮', className: 'btn-primary' };
      case ComponentType.CARD:
        return { title: '卡片标题', content: '卡片内容' };
      case ComponentType.LIST:
        return { title: '列表', items: ['项目1', '项目2', '项目3'] };
      case ComponentType.FORM:
        return {
          title: '表单',
          fields: [
            { label: '姓名', type: 'text', required: true },
            { label: '邮箱', type: 'email', required: true }
          ],
          submitText: '提交'
        };
      case ComponentType.NAVIGATION:
        return {
          items: [
            { label: '首页', href: '/' },
            { label: '关于', href: '/about' },
            { label: '联系', href: '/contact' }
          ]
        };
      case ComponentType.HERO:
        return {
          title: '欢迎标题',
          subtitle: '副标题描述',
          buttonText: '了解更多'
        };
      case ComponentType.GALLERY:
        return {
          title: '图片画廊',
          images: [
            { src: '/placeholder.jpg', alt: '图片1', caption: '图片说明1' },
            { src: '/placeholder.jpg', alt: '图片2', caption: '图片说明2' }
          ]
        };
      default:
        return {};
    }
  };

  // 处理内容更新
  const handleContentUpdate = useCallback((_event: ContentRealtimeEvent) => {
    // Handle real-time content updates
    onContentChange?.(pageId);
  }, [onContentChange, pageId]);



  // 处理内容删除
  const handleContentDelete = useCallback(async (contentId: string) => {
    if (confirm('确定要删除这个内容吗？')) {
      try {
        await deleteContent(contentId);
        setSelectedContentId(null);
        onContentChange?.(pageId);
      } catch (error) {
        console.error('删除内容失败:', error);
      }
    }
  }, [deleteContent, pageId, onContentChange]);

  // 处理组件删除
  const handleComponentDelete = useCallback(async (instanceId: string) => {
    if (confirm('确定要删除这个组件吗？')) {
      try {
        await deleteInstance(instanceId);
        setSelectedComponentId(null);
        onContentChange?.(pageId);
      } catch (error) {
        console.error('删除组件失败:', error);
      }
    }
  }, [deleteInstance, pageId, onContentChange]);

  // 渲染标签页
  const renderTabs = () => (
    <div className="panel-tabs">
      <button 
        className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
        onClick={() => setActiveTab('preview')}
      >
        📄 预览
      </button>
      <button 
        className={`tab ${activeTab === 'contents' ? 'active' : ''}`}
        onClick={() => setActiveTab('contents')}
      >
        📝 内容 ({filteredContents.length})
      </button>
      <button 
        className={`tab ${activeTab === 'components' ? 'active' : ''}`}
        onClick={() => setActiveTab('components')}
      >
        🧩 组件 ({filteredInstances.length})
      </button>
    </div>
  );

  // 渲染搜索栏
  const renderSearchBar = () => (
    <div className="search-bar">
      <input
        type="text"
        placeholder="搜索内容或组件..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />
      {isEditMode && (
        <button 
          className="add-button"
          onClick={() => setShowAddDialog(true)}
        >
          ➕ 添加
        </button>
      )}
    </div>
  );

  // 渲染内容列表
  const renderContentsList = () => (
    <div className="contents-list">
      {contentsLoading && <div className="loading">加载中...</div>}
      {contentsError && <div className="error">错误: {contentsError.message}</div>}
      
      {filteredContents.map((content) => (
        <div 
          key={content.id}
          className={`content-item ${selectedContentId === content.id ? 'selected' : ''}`}
          onClick={() => setSelectedContentId(content.id)}
        >
          <div className="content-header">
            <span className="content-type">{content.content_type}</span>
            <span className="content-key">{content.content_key}</span>
          </div>
          <div className="content-preview">
            {typeof content.content_data === 'string' ? content.content_data.substring(0, 50) : (content.content_data as any)?.value?.substring(0, 50) || JSON.stringify(content.content_data).substring(0, 50) || '空内容'}...
          </div>
          <div className="content-meta">
            <span className="sort-order">#{content.sort_order}</span>
            <span className="status">{content.is_active ? '✅' : '❌'}</span>
          </div>
          {isEditMode && (
            <div className="content-actions">
              <button onClick={(e) => {
                e.stopPropagation();
                handleContentDelete(content.id);
              }}>
                🗑️
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // 渲染组件列表
  const renderComponentsList = () => (
    <div className="components-list">
      {instancesLoading && <div className="loading">加载中...</div>}
      {instancesError && <div className="error">错误: {instancesError.message}</div>}
      
      {filteredInstances.map((instance) => (
        <div 
          key={instance.id}
          className={`component-item ${selectedComponentId === instance.id ? 'selected' : ''}`}
          onClick={() => setSelectedComponentId(instance.id)}
        >
          <div className="component-header">
            <span className="component-type">{instance.component_type}</span>
            <span className="component-name">{instance.component_name}</span>
          </div>
          <div className="component-preview">
            {JSON.stringify(instance.layout_config || {}).substring(0, 50)}...
          </div>
          <div className="component-meta">
            <span className="sort-order">#{instance.sort_order}</span>
            <span className="status">{instance.is_active ? '✅' : '❌'}</span>
          </div>
          {isEditMode && (
            <div className="component-actions">
              <button onClick={(e) => {
                e.stopPropagation();
                handleComponentDelete(instance.id);
              }}>
                🗑️
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // 渲染预览
  const renderPreview = () => (
    <div className="preview-container">
      <ContentRenderer
        pageId={pageId}
        isEditMode={isEditMode}
        onContentUpdate={handleContentUpdate}
      />
    </div>
  );

  // 渲染添加对话框
  const renderAddDialog = () => {
    if (!showAddDialog) return null;
    
    return (
      <div className="add-dialog-overlay">
        <div className="add-dialog">
          <div className="dialog-header">
            <h3>添加新{addType === 'content' ? '内容' : '组件'}</h3>
            <button onClick={() => setShowAddDialog(false)}>✕</button>
          </div>
          
          <div className="dialog-tabs">
            <button 
              className={`dialog-tab ${addType === 'content' ? 'active' : ''}`}
              onClick={() => setAddType('content')}
            >
              内容
            </button>
            <button 
              className={`dialog-tab ${addType === 'component' ? 'active' : ''}`}
              onClick={() => setAddType('component')}
            >
              组件
            </button>
          </div>
          
          <div className="dialog-content">
            {addType === 'content' ? (
              <div className="content-types">
                {Object.values(ContentType).map(type => (
                  <button
                    key={type}
                    className="type-button"
                    onClick={() => handleCreateContent(type)}
                  >
                    <div className="type-icon">
                      {type === ContentType.TEXT && '📝'}
                      {type === ContentType.IMAGE && '🖼️'}
                      {type === ContentType.VIDEO && '🎥'}
                      {type === ContentType.HTML && '📄'}
                    </div>
                    <span>{type}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="component-types">
                {Object.values(ComponentType).map(type => (
                  <button
                    key={type}
                    className="type-button"
                    onClick={() => handleCreateComponent(type)}
                  >
                    <div className="type-icon">
                      {type === ComponentType.BUTTON && '🔘'}
                      {type === ComponentType.CARD && '🃏'}
                      {type === ComponentType.LIST && '📋'}
                      {type === ComponentType.GRID && '⚏'}
                      {type === ComponentType.FORM && '📝'}
                      {type === ComponentType.NAVIGATION && '🧭'}
                      {type === ComponentType.HERO && '🎯'}
                      {type === ComponentType.GALLERY && '🖼️'}
                      {type === ComponentType.CONTAINER && '📦'}
                    </div>
                    <span>{type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`content-management-panel ${className}`}>
      <div className="panel-header">
        <h2>{title}</h2>
        <div className="panel-controls">
          <button 
            onClick={() => {
              refreshContents();
              refetchInstances();
            }}
            className="refresh-button"
          >
            🔄 刷新
          </button>
        </div>
      </div>
      
      {renderTabs()}
      {renderSearchBar()}
      
      <div className="panel-content">
        {activeTab === 'preview' && renderPreview()}
        {activeTab === 'contents' && renderContentsList()}
        {activeTab === 'components' && renderComponentsList()}
      </div>
      
      {renderAddDialog()}
    </div>
  );
};

// 样式
const styles = `
.content-management-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.panel-header h2 {
  margin: 0;
  color: #374151;
  font-size: 18px;
}

.panel-controls {
  display: flex;
  gap: 0.5rem;
}

.refresh-button {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.refresh-button:hover {
  background: #e5e7eb;
}

.panel-tabs {
  display: flex;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.tab {
  flex: 1;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
  transition: all 0.2s;
}

.tab:hover {
  background: #f3f4f6;
  color: #374151;
}

.tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: white;
}

.search-bar {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.search-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.add-button {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
}

.add-button:hover {
  background: #2563eb;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
}

.contents-list,
.components-list {
  padding: 1rem;
}

.content-item,
.component-item {
  position: relative;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.content-item:hover,
.component-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
}

.content-item.selected,
.component-item.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.content-header,
.component-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.content-type,
.component-type {
  background: #3b82f6;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.content-key,
.component-name {
  font-weight: 500;
  color: #374151;
}

.content-preview,
.component-preview {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 0.5rem;
  font-family: monospace;
}

.content-meta,
.component-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #6b7280;
}

.sort-order {
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.content-actions,
.component-actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
}

.content-actions button,
.component-actions button {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem;
  cursor: pointer;
  font-size: 12px;
}

.preview-container {
  padding: 1rem;
  min-height: 400px;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.error {
  text-align: center;
  padding: 2rem;
  color: #ef4444;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  margin: 1rem;
}

.add-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.add-dialog {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-header h3 {
  margin: 0;
  color: #374151;
}

.dialog-header button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #6b7280;
}

.dialog-tabs {
  display: flex;
  background: #f9fafb;
}

.dialog-tab {
  flex: 1;
  padding: 0.75rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
}

.dialog-tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: white;
}

.dialog-content {
  padding: 1rem;
  max-height: 60vh;
  overflow-y: auto;
}

.content-types,
.component-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.type-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.type-button:hover {
  background: #f3f4f6;
  border-color: #3b82f6;
}

.type-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.type-button span {
  font-size: 12px;
  color: #374151;
  font-weight: 500;
}
`;

// 注入样式
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default ContentManagementPanel;