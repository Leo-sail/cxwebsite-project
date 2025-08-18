import React, { useState, useCallback, useEffect } from 'react';
import type { PageContent, ComponentInstance } from '../../types/content';
import { ContentPreview } from './ContentPreview';
import { ContentManagementPanel } from './ContentManagementPanel';
import { ContentEditor } from './ContentEditor';
import { DragDropEditor } from './DragDropEditor';
import { usePageContents, useComponentInstances } from '../../hooks/useContentManagement';
import { useKeyboardShortcuts, COMMON_SHORTCUTS } from '../../hooks/useKeyboardShortcuts';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import { useContentManagementGestures } from '../../hooks/useTouchGestures';
import { isMobileDevice, isTabletDevice, isTouchDevice } from '../../utils/mobileDetection';
import '../../styles/mobile.css';
import type { Layout } from 'react-grid-layout';

interface ContentManagementSystemProps {
  /** 页面ID */
  pageId: string;
  /** 初始模式 */
  initialMode?: 'preview' | 'edit';
  /** 初始设备类型 */
  initialDevice?: 'desktop' | 'tablet' | 'mobile';
  /** 是否显示侧边栏 */
  showSidebar?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 内容管理系统主组件
 * 整合预览、编辑、管理等功能
 */
export const ContentManagementSystem: React.FC<ContentManagementSystemProps> = ({
  pageId,
  initialMode = 'edit',
  initialDevice = 'desktop',
  showSidebar = true,
  className = ''
}) => {
  // 状态管理
  const [mode, setMode] = useState<'preview' | 'edit'>(initialMode);
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>(initialDevice);
  const [selectedItem, setSelectedItem] = useState<{ type: 'content' | 'component', id: string } | null>(null);
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'contents' | 'components' | 'settings'>('contents');
  const [isDragMode, setIsDragMode] = useState(false);

  // 使用内容管理hooks获取数据
  const { contents, isLoading: contentsLoading, error: contentsError } = usePageContents(pageId);
  const { instances, isLoading: instancesLoading, error: instancesError } = useComponentInstances(pageId);

  // 撤销重做功能
  const {
    pushState: saveContentChange,
    undo: undoContentChange,
    redo: redoContentChange,
    canUndo,
    canRedo
  } = useUndoRedo<{ contents: PageContent[]; instances: ComponentInstance[] }>(
    { contents: [], instances: [] }, 
    { maxHistorySize: 50 }
  );

  // 设备检测
  const isMobile = isMobileDevice();
  const isTablet = isTabletDevice();
  const hasTouch = isTouchDevice();
  const isMobileOrTablet = isMobile || isTablet;

  // 移动端触摸手势支持
  const { bindGestures, isActive: isGestureActive } = useContentManagementGestures({
    onSidebarToggle: () => setIsSidebarCollapsed(!isSidebarCollapsed),
    onModeToggle: () => setMode(mode === 'preview' ? 'edit' : 'preview'),
    onItemSelect: (id) => {
        // 选择内容项
        const content = contents?.find((c: any) => c.id === id);
        if (content) {
          setSelectedItem({ type: 'content', id });
        }
      }
   });

  // 计算总体加载状态
  const isLoading = contentsLoading || instancesLoading;
  const error = contentsError || instancesError;

  // 处理选择变更
  const handleSelectionChange = useCallback((type: 'content' | 'component', id: string | null) => {
    if (id) {
      setSelectedItem({ type, id });
    } else {
      setSelectedItem(null);
    }
  }, []);

  // 处理编辑请求
  const handleEdit = useCallback((type: 'content' | 'component', id: string) => {
    setSelectedItem({ type, id });
    setIsEditorVisible(true);
  }, []);

  // 处理编辑器关闭
  const handleEditorClose = useCallback(() => {
    setIsEditorVisible(false);
  }, []);

  // 处理编辑器保存
  const handleEditorSave = useCallback((itemId: string, type: 'content' | 'component') => {
    console.log(`${type} ${itemId} saved successfully`);
    // 可以在这里添加保存成功的提示
  }, []);

  // 处理模式切换
  const handleModeToggle = useCallback(() => {
    setMode(prev => prev === 'preview' ? 'edit' : 'preview');
    if (mode === 'preview') {
      setSelectedItem(null);
      setIsEditorVisible(false);
    }
  }, [mode]);

  // 处理设备切换
  const handleDeviceChange = useCallback((newDevice: 'desktop' | 'tablet' | 'mobile') => {
    setDevice(newDevice);
  }, []);

  // 处理侧边栏切换
  const handleSidebarToggle = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  // 处理拖拽模式切换
  const handleDragModeToggle = useCallback(() => {
    setIsDragMode(!isDragMode);
  }, [isDragMode]);

  // 处理布局变更
  const handleLayoutChange = useCallback((layout: Layout[], layouts: { [key: string]: Layout[] }) => {
    console.log('Layout changed:', layout, layouts);
    // 这里可以保存布局到后端
  }, []);

  // 渲染手势提示
  const renderGestureHint = () => (
    <div className="gesture-hint" style={{ opacity: isGestureActive ? 1 : 0 }}>
      左右滑动切换侧边栏 | 双击切换模式 | 长按选择项目
    </div>
  );

  // 处理项目删除
  const handleItemDelete = useCallback(async (type: 'content' | 'component', id: string) => {
    try {
      console.log(`${type} deleted successfully:`, id);
      // 这里可以调用删除API
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
    }
  }, []);

  // 键盘快捷键配置
  useKeyboardShortcuts([
    {
      key: 'ctrl+e',
      handler: handleModeToggle,
      description: '切换编辑模式'
    },
    {
      key: COMMON_SHORTCUTS.SAVE,
      handler: () => {
        if (isEditorVisible && selectedItem) {
          handleEditorSave(selectedItem.id, selectedItem.type);
        }
      },
      description: '保存内容',
      enabled: isEditorVisible
    },
    {
      key: COMMON_SHORTCUTS.UNDO,
      handler: undoContentChange,
      description: '撤销操作',
      enabled: canUndo
    },
    {
      key: COMMON_SHORTCUTS.REDO,
      handler: redoContentChange,
      description: '重做操作',
      enabled: canRedo
    },
    {
      key: COMMON_SHORTCUTS.DELETE,
      handler: () => {
        if (selectedItem) {
          handleItemDelete(selectedItem.type, selectedItem.id);
        }
      },
      description: '删除选中项',
      enabled: !!selectedItem
    },
    {
      key: 'Escape',
      handler: () => {
        if (isEditorVisible) {
          setIsEditorVisible(false);
        } else if (selectedItem) {
          setSelectedItem(null);
        }
      },
      description: '取消/关闭'
    },
    {
      key: 'ctrl+b',
      handler: handleSidebarToggle,
      description: '切换侧边栏'
    },
    {
      key: 'ctrl+d',
      handler: handleDragModeToggle,
      description: '切换拖拽模式'
    }
  ]);

  // 监听内容变化，保存到撤销重做历史
  useEffect(() => {
    if (contents && instances) {
      saveContentChange({ contents, instances }, '内容更新');
    }
  }, [contents, instances, saveContentChange]);

  // 渲染顶部工具栏
  const renderToolbar = () => (
    <div className="cms-toolbar">
      <div className="toolbar-left">
        <div className="logo">
          <span className="logo-icon">🎨</span>
          <span className="logo-text">内容管理</span>
        </div>
        
        <div className="page-info">
          <span className="page-id">页面: {pageId}</span>
          {isLoading && <span className="loading-indicator">同步中...</span>}
          {error && <span className="error-indicator">⚠️ 错误</span>}
        </div>
      </div>
      
      <div className="toolbar-center">
        <div className="mode-toggle">
          <button 
            className={`mode-btn touch-feedback ${mode === 'preview' ? 'active' : ''}`}
            onClick={() => setMode('preview')}
          >
            👁️ 预览
          </button>
          <button 
            className={`mode-btn touch-feedback ${mode === 'edit' ? 'active' : ''}`}
            onClick={() => setMode('edit')}
          >
            ✏️ 编辑
          </button>
          
          {mode === 'edit' && (
            <button
              className={`mode-btn touch-feedback ${isDragMode ? 'active' : ''}`}
              onClick={handleDragModeToggle}
              title={isDragMode ? '退出拖拽模式' : '进入拖拽模式'}
            >
              {isDragMode ? '📋 列表' : '🔄 拖拽'}
            </button>
          )}
        </div>
        
        <div className="device-toggle">
          <button 
            className={`device-btn touch-feedback ${device === 'desktop' ? 'active' : ''}`}
            onClick={() => handleDeviceChange('desktop')}
            title="桌面视图"
          >
            🖥️
          </button>
          <button 
            className={`device-btn touch-feedback ${device === 'tablet' ? 'active' : ''}`}
            onClick={() => handleDeviceChange('tablet')}
            title="平板视图"
          >
            📱
          </button>
          <button 
            className={`device-btn touch-feedback ${device === 'mobile' ? 'active' : ''}`}
            onClick={() => handleDeviceChange('mobile')}
            title="手机视图"
          >
            📱
          </button>
        </div>
      </div>
      
      <div className="toolbar-right">
        <div className="stats">
          <span>内容: {contents.length}</span>
          <span>组件: {instances?.length || 0}</span>
        </div>
        
        {showSidebar && (
          <button 
            className="sidebar-toggle touch-feedback"
            onClick={handleSidebarToggle}
            title={isSidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
          >
            {isSidebarCollapsed ? '▶️' : '◀️'}
          </button>
        )}
      </div>
    </div>
  );

  // 渲染主要内容区域
  const renderMainContent = () => (
    <div className="cms-main">
      <div className="preview-area">
        {isDragMode && mode === 'edit' ? (
          <DragDropEditor
            pageId={pageId}
            contents={contents}
            instances={instances || []}
            isEditMode={true}
            onLayoutChange={handleLayoutChange}
            onContentUpdate={(id, data) => console.log('Content updated:', id, data)}
            onComponentUpdate={(id, data) => console.log('Component updated:', id, data)}
            onItemDelete={handleItemDelete}
            className="drag-editor"
          />
        ) : (
          <ContentPreview
            pageId={pageId}
            mode={device}
            showEditTools={mode === 'edit'}
            enableRealtime={true}
            onSelectionChange={handleSelectionChange}
            onEdit={handleEdit}
          />
        )}
      </div>
      
      {showSidebar && (
        <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          {!isSidebarCollapsed && (
            <>
              <div className="sidebar-tabs">
                <button 
                  className={`tab touch-feedback ${activeTab === 'contents' ? 'active' : ''}`}
                  onClick={() => setActiveTab('contents')}
                >
                  📄 内容
                </button>
                <button 
                  className={`tab touch-feedback ${activeTab === 'components' ? 'active' : ''}`}
                  onClick={() => setActiveTab('components')}
                >
                  🧩 组件
                </button>
                <button 
                  className={`tab touch-feedback ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('settings')}
                >
                  ⚙️ 设置
                </button>
              </div>
              
              <div className="sidebar-content">
                {activeTab === 'contents' && (
                  <ContentManagementPanel
                    pageId={pageId}
                    isEditMode={mode === 'edit'}
                    onContentChange={() => {}}
                  />
                )}
                
                {activeTab === 'components' && (
                  <ContentManagementPanel
                    pageId={pageId}
                    isEditMode={mode === 'edit'}
                    title="组件管理"
                    onContentChange={() => {}}
                  />
                )}
                
                {activeTab === 'settings' && (
                  <div className="settings-panel">
                    <h3>页面设置</h3>
                    <div className="setting-group">
                      <label>页面标题</label>
                      <input type="text" placeholder="输入页面标题" />
                    </div>
                    <div className="setting-group">
                      <label>页面描述</label>
                      <textarea placeholder="输入页面描述" rows={3} />
                    </div>
                    <div className="setting-group">
                      <label>SEO关键词</label>
                      <input type="text" placeholder="输入关键词，用逗号分隔" />
                    </div>
                    <div className="setting-group">
                      <label className="checkbox-label">
                        <input type="checkbox" />
                        启用实时同步
                      </label>
                    </div>
                    <div className="setting-group">
                      <label className="checkbox-label">
                        <input type="checkbox" />
                        启用版本控制
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  if (error) {
    return (
      <div className={`cms-container error ${className}`}>
        <div className="error-state">
          <h2>加载失败</h2>
          <p>{error instanceof Error ? error.message : String(error)}</p>
          <button onClick={() => window.location.reload()}>
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`cms-container ${className} ${isMobileOrTablet ? 'mobile-optimized' : ''} ${hasTouch ? 'touch-enabled' : ''}`}
      ref={hasTouch ? bindGestures : undefined}
    >
      {renderToolbar()}
      {renderMainContent()}
      
      {/* 编辑器 */}
      {isEditorVisible && selectedItem && (
        <ContentEditor
          type={selectedItem.type}
          itemId={selectedItem.id}
          pageId={pageId}
          isVisible={isEditorVisible}
          onClose={handleEditorClose}
          onSave={handleEditorSave}
        />
      )}
      
      {/* 手势提示 */}
      {renderGestureHint()}
      
      {/* 快捷键提示 */}
      <div className="shortcuts-hint">
        <div className="hint-item">Ctrl+E: 切换模式</div>
        <div className="hint-item">Ctrl+S: 保存</div>
        <div className="hint-item">Ctrl+Z: 撤销 {canUndo ? '✓' : '✗'}</div>
        <div className="hint-item">Ctrl+Y: 重做 {canRedo ? '✓' : '✗'}</div>
        <div className="hint-item">Ctrl+B: 侧边栏</div>
        <div className="hint-item">Ctrl+D: 拖拽模式</div>
        <div className="hint-item">Delete: 删除</div>
        <div className="hint-item">Esc: 取消</div>
      </div>
    </div>
  );
};

// 样式
const styles = `
.cms-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f9fafb;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.cms-container.error {
  justify-content: center;
  align-items: center;
}

.error-state {
  text-align: center;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.error-state h2 {
  color: #dc2626;
  margin: 0 0 1rem 0;
}

.error-state p {
  color: #6b7280;
  margin: 0 0 1rem 0;
}

.error-state button {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.cms-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.logo-icon {
  font-size: 20px;
}

.page-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
  color: #6b7280;
}

.loading-indicator {
  color: #3b82f6;
  font-size: 12px;
}

.error-indicator {
  color: #dc2626;
  font-size: 12px;
}

.toolbar-center {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mode-toggle,
.device-toggle {
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 2px;
}

.mode-btn,
.device-btn {
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
  transition: all 0.2s;
}

.mode-btn.active,
.device-btn.active {
  background: white;
  color: #374151;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.mode-btn:hover,
.device-btn:hover {
  color: #374151;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stats {
  display: flex;
  gap: 1rem;
  font-size: 14px;
  color: #6b7280;
}

.sidebar-toggle {
  padding: 0.5rem;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.sidebar-toggle:hover {
  background: #e5e7eb;
}

.cms-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.preview-area {
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 350px;
  background: white;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 0;
  overflow: hidden;
}

.sidebar-tabs {
  display: flex;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-tabs .tab {
  flex: 1;
  padding: 0.75rem 0.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 12px;
  color: #6b7280;
  transition: all 0.2s;
}

.sidebar-tabs .tab:hover {
  background: #f3f4f6;
  color: #374151;
}

.sidebar-tabs .tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: white;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
}

.settings-panel {
  padding: 1rem;
}

.settings-panel h3 {
  margin: 0 0 1rem 0;
  color: #374151;
  font-size: 16px;
}

.setting-group {
  margin-bottom: 1rem;
}

.setting-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0 !important;
}

.setting-group input,
.setting-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.setting-group input[type="checkbox"] {
  width: auto;
}

.shortcuts-hint {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 11px;
  z-index: 1000;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.shortcuts-hint:hover {
  opacity: 1;
}

.hint-item {
  margin-bottom: 0.25rem;
}

.hint-item:last-child {
  margin-bottom: 0;
}

/* 移动端优化基础样式 */
.mobile-optimized {
  -webkit-overflow-scrolling: touch;
  touch-action: manipulation;
}

.touch-enabled {
  -webkit-tap-highlight-color: transparent;
}

.touch-enabled * {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.touch-enabled input,
.touch-enabled textarea,
.touch-enabled [contenteditable] {
  -webkit-user-select: text;
  -khtml-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .sidebar {
    width: 300px;
  }
  
  .toolbar-center {
    gap: 0.5rem;
  }
  
  .mode-btn,
  .device-btn {
    padding: 0.5rem 0.75rem;
    font-size: 12px;
  }
  
  /* 触摸优化 */
  .touch-enabled .cms-toolbar button,
  .touch-enabled .sidebar button {
    min-height: 44px;
    min-width: 44px;
  }
}

@media (max-width: 768px) {
  .cms-container {
    touch-action: pan-y pinch-zoom;
    -webkit-overflow-scrolling: touch;
  }
  
  .cms-toolbar {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
    position: sticky;
    top: 0;
    z-index: 100;
    background: white;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .toolbar-left,
  .toolbar-center,
  .toolbar-right {
    width: 100%;
    justify-content: center;
  }
  
  .mode-btn,
  .device-btn {
    min-height: 48px;
    min-width: 48px;
    font-size: 16px;
    border-radius: 8px;
  }
  
  .sidebar {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    z-index: 200;
    box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .sidebar-content {
    padding: 16px;
  }
  
  .sidebar button {
    min-height: 48px;
    width: 100%;
    margin-bottom: 8px;
    font-size: 16px;
    border-radius: 8px;
  }
  
  .preview-area {
    padding: 16px 8px;
  }
  
  .shortcuts-hint {
    display: none;
  }
  
  /* 手势提示 */
  .gesture-hint {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 12px;
    z-index: 1001;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }
  
  /* 触摸反馈 */
  .touch-feedback {
    position: relative;
    overflow: hidden;
  }
  
  .touch-feedback::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.1);
    transform: translate(-50%, -50%);
    transition: width 0.3s ease, height 0.3s ease;
  }
  
  .touch-feedback:active::after {
    width: 100px;
    height: 100px;
  }
}

/* 超小屏幕优化 */
@media (max-width: 480px) {
  .cms-toolbar {
    padding: 6px 8px;
  }
  
  .mode-btn,
  .device-btn {
    min-height: 44px;
    min-width: 44px;
    padding: 8px;
    font-size: 14px;
  }
  
  .sidebar {
    width: 100vw;
  }
  
  .preview-area {
    padding: 12px 6px;
  }
}
`;

// 注入样式
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default ContentManagementSystem;