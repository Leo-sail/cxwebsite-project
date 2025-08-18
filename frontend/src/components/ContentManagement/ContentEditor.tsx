import React, { useState, useCallback, useEffect } from 'react';
import type { PageContent, ComponentInstance, ContentData, PositionData } from '../../types/content';
import { ContentType, ComponentType } from '../../types/content';
import { usePageContents, useComponentInstances } from '../../hooks/useContentManagement';
import { ImageUpload } from '../ImageUpload/ImageUpload';
import { RichTextEditor } from '../RichTextEditor';
import { MarkdownEditor } from '../MarkdownEditor';

import { ContentValidator } from '../../utils/contentValidator';

interface ContentEditorProps {
  /** 编辑类型 */
  type: 'content' | 'component';
  /** 内容ID或组件ID */
  itemId: string | null;
  /** 页面ID */
  pageId: string;
  /** 是否显示编辑器 */
  isVisible: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 保存回调 */
  onSave?: (itemId: string, type: 'content' | 'component') => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 内容编辑器
 * 提供内容和组件的详细编辑功能
 */
export const ContentEditor: React.FC<ContentEditorProps> = ({
  type,
  itemId,
  pageId,
  isVisible,
  onClose,
  onSave,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'style' | 'position' | 'advanced'>('basic');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // 内容编辑状态
  const [contentData, setContentData] = useState<Partial<PageContent>>({});
  const [componentData, setComponentData] = useState<Partial<ComponentInstance>>({});

  // 使用内容管理hooks
  const { contents, updateContent } = usePageContents(pageId);
  const { instances, updateInstance } = useComponentInstances(pageId);

  // 获取当前编辑项
  const currentContent = contents.find((c: PageContent) => c.id === itemId);
  const currentComponent = instances?.find((i: ComponentInstance) => i.id === itemId);
  const currentItem = type === 'content' ? currentContent : currentComponent;

  // 初始化编辑数据
  useEffect(() => {
    if (currentItem) {
      if (type === 'content' && currentContent) {
        setContentData({
          content_type: currentContent.content_type,
          content_key: currentContent.content_key,
          content_data: currentContent.content_data,
          position_data: currentContent.position_data,
          style_data: currentContent.style_data,
          is_active: currentContent.is_active,
          sort_order: currentContent.sort_order
        });
      } else if (type === 'component' && currentComponent) {
        setComponentData({
          component_type: currentComponent.component_type,
          component_name: currentComponent.component_name,
          props: currentComponent.props || {},
          layout_config: currentComponent.layout_config || {},
          style_overrides: currentComponent.style_overrides,
          is_active: currentComponent.is_active,
          sort_order: currentComponent.sort_order
        });
      }
      setHasChanges(false);
      setValidationErrors([]);
    }
  }, [currentItem, type, currentContent, currentComponent]);

  // 处理保存
  const handleSave = useCallback(async () => {
    if (!itemId || !currentItem) return;

    // 验证数据
    const errors = validateData();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      if (type === 'content') {
        await updateContent({ id: itemId, data: contentData });
      } else {
        await updateInstance({ id: itemId, data: componentData });
      }
      
      setHasChanges(false);
      setValidationErrors([]);
      onSave?.(itemId, type);
    } catch (error) {
      console.error('保存失败:', error);
      setValidationErrors(['保存失败，请重试']);
    } finally {
      setIsSaving(false);
    }
  }, [itemId, currentItem, type, contentData, componentData, updateContent, updateInstance, onSave]);

  // 验证数据
  const validateData = useCallback((): string[] => {
    const errors: string[] = [];

    if (type === 'content') {
      // 基本字段验证
      if (!contentData.content_key?.trim()) {
        errors.push('内容键不能为空');
      }
      if (!contentData.content_type) {
        errors.push('内容类型不能为空');
      }

      // 内容安全验证
      if (contentData.content_data) {
        const contentDataObj = contentData.content_data as ContentData;
        const contentValue = contentDataObj.value;
        if (contentValue && typeof contentValue === 'string') {
          let validationResult;
          
          // 根据内容类型进行相应的验证
          switch (contentData.content_type) {
            case 'text':
              validationResult = ContentValidator.validateHtmlContent(contentValue);
              break;
            case 'markdown':
              validationResult = ContentValidator.validateMarkdownContent(contentValue);
              break;
            case 'html':
              validationResult = ContentValidator.validateHtmlContent(contentValue);
              break;
            default:
              // 对于其他类型，进行基本的安全检查
              validationResult = ContentValidator.validateHtmlContent(contentValue);
          }

          if (!validationResult.isValid) {
            const validationErrors = validationResult.errors || [];
            errors.push(...validationErrors.map(error => `内容安全验证: ${error}`));
          }
        }
      }
    } else {
      // 组件验证
      if (!componentData.component_name?.trim()) {
        errors.push('组件名称不能为空');
      }
      if (!componentData.component_type) {
        errors.push('组件类型不能为空');
      }

      // 组件属性安全验证
      if (componentData.props) {
        try {
          const propsString = JSON.stringify(componentData.props);
          const validationResult = ContentValidator.validateHtmlContent(propsString);
          if (!validationResult.isValid) {
            const validationErrors = validationResult.errors || [];
            errors.push(...validationErrors.map(error => `组件属性安全验证: ${error}`));
          }
        } catch (error) {
          errors.push('组件属性格式无效');
        }
      }
    }

    return errors;
  }, [type, contentData, componentData]);

  // 处理内容数据变更
  const handleContentDataChange = useCallback((field: keyof PageContent, value: any) => {
    setContentData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);

  // 处理组件数据变更
  const handleComponentDataChange = useCallback((field: keyof ComponentInstance, value: any) => {
    setComponentData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);

  // 处理JSON编辑
  const handleJsonEdit = useCallback((field: string, jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (type === 'content') {
        handleContentDataChange(field as keyof PageContent, parsed);
      } else {
        handleComponentDataChange(field as keyof ComponentInstance, parsed);
      }
    } catch (error) {
      console.warn('Invalid JSON:', error);
    }
  }, [type, handleContentDataChange, handleComponentDataChange]);

  // 渲染基本信息标签页
  const renderBasicTab = () => {
    if (type === 'content') {
      return (
        <div className="tab-content">
          <div className="form-group">
            <label>内容类型</label>
            <select
              value={contentData.content_type || ''}
              onChange={(e) => handleContentDataChange('content_type', e.target.value as ContentType)}
            >
              <option value="">选择类型</option>
              {Object.values(ContentType).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>内容键</label>
            <input
              type="text"
              value={contentData.content_key || ''}
              onChange={(e) => handleContentDataChange('content_key', e.target.value)}
              placeholder="唯一标识符"
            />
          </div>
          
          {/* 根据内容类型渲染不同的编辑器 */}
          {contentData.content_type === 'image' ? (
            <div className="form-group">
              <label>图片</label>
              <ImageUpload
                onUploadSuccess={(results) => {
                  if (results.length > 0) {
                    const result = results[0];
                    const currentData = (contentData.content_data as ContentData) || ({} as ContentData);
                    handleContentDataChange('content_data', {
                      ...currentData,
                      src: result.url,
                      value: result.url,
                      title: result.filename,
                      metadata: {
                        ...currentData.metadata,
                        filename: result.filename,
                        uploadedAt: new Date().toISOString()
                      }
                    });
                  }
                }}
                onUploadError={(error) => {
                  console.error('图片上传失败:', error);
                }}
                placeholder="点击或拖拽图片到此处上传"
              />
              
              {/* Alt文本输入 */}
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Alt文本</label>
                <input
                  type="text"
                  value={(contentData.content_data as ContentData)?.alt || ''}
                  onChange={(e) => {
                    const currentData = (contentData.content_data as ContentData) || ({} as ContentData);
                    handleContentDataChange('content_data', {
                      ...currentData,
                      alt: e.target.value
                    });
                  }}
                  placeholder="图片描述文本"
                />
              </div>
              
              {/* 图片标题 */}
              <div className="form-group">
                <label>图片标题</label>
                <input
                  type="text"
                  value={(contentData.content_data as ContentData)?.title || ''}
                  onChange={(e) => {
                     const currentData = (contentData.content_data as ContentData) || ({} as ContentData);
                     handleContentDataChange('content_data', {
                       ...currentData,
                       title: e.target.value
                     });
                   }}
                  placeholder="图片标题"
                />
              </div>
              
              {/* 图片描述 */}
              <div className="form-group">
                <label>图片描述</label>
                <textarea
                  value={(contentData.content_data as ContentData)?.description || ''}
                  onChange={(e) => {
                     const currentData = (contentData.content_data as ContentData) || ({} as ContentData);
                     handleContentDataChange('content_data', {
                       ...currentData,
                       description: e.target.value
                     });
                   }}
                  placeholder="详细描述"
                  rows={3}
                />
              </div>
            </div>
          ) : contentData.content_type === 'text' ? (
            <div className="form-group">
              <label>富文本内容</label>
              <RichTextEditor
                contentData={(contentData.content_data as ContentData) || { type: 'TEXT', value: '', metadata: {} }}
                onChange={(updatedContentData) => {
                  handleContentDataChange('content_data', updatedContentData);
                }}
                onError={(error) => {
                  console.error('富文本编辑器错误:', error);
                  setValidationErrors(prev => [...prev, `富文本编辑器: ${error}`]);
                }}
                className="rich-text-editor-container"
              />
            </div>
          ) : contentData.content_type === 'markdown' ? (
            <div className="form-group">
              <label>Markdown内容</label>
              <MarkdownEditor
                contentData={(contentData.content_data as ContentData) || { type: 'MARKDOWN', value: '', metadata: {} }}
                onChange={(updatedContentData) => {
                  handleContentDataChange('content_data', updatedContentData);
                }}
                onError={(error) => {
                  console.error('Markdown编辑器错误:', error);
                  setValidationErrors(prev => [...prev, `Markdown编辑器: ${error}`]);
                }}
                showPreview={false}
                className="markdown-editor-container"
              />
            </div>
          ) : (
           <div className="form-group">
             <label>内容数据</label>
             <textarea
               value={JSON.stringify(contentData.content_data, null, 2)}
               onChange={(e) => handleJsonEdit('content_data', e.target.value)}
               placeholder="JSON格式的内容数据"
               rows={8}
             />
           </div>
         )}
          
          <div className="form-group">
            <label>排序顺序</label>
            <input
              type="number"
              value={contentData.sort_order || 0}
              onChange={(e) => handleContentDataChange('sort_order', parseInt(e.target.value))}
            />
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={contentData.is_active ?? true}
                onChange={(e) => handleContentDataChange('is_active', e.target.checked)}
              />
              激活状态
            </label>
          </div>
        </div>
      );
    } else {
      return (
        <div className="tab-content">
          <div className="form-group">
            <label>组件类型</label>
            <select
              value={componentData.component_type || ''}
              onChange={(e) => handleComponentDataChange('component_type', e.target.value as ComponentType)}
            >
              <option value="">选择类型</option>
              {Object.values(ComponentType).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>组件名称</label>
            <input
              type="text"
              value={componentData.component_name || ''}
              onChange={(e) => handleComponentDataChange('component_name', e.target.value)}
              placeholder="组件显示名称"
            />
          </div>
          
          <div className="form-group">
            <label>组件属性</label>
            <textarea
              value={componentData.props ? JSON.stringify(componentData.props, null, 2) : '{}'}
              onChange={(e) => {
                try {
                  handleComponentDataChange('props', JSON.parse(e.target.value));
                } catch {
                  handleComponentDataChange('props', {});
                }
              }}
              placeholder="JSON格式的组件属性"
              rows={8}
            />
          </div>
          
          <div className="form-group">
            <label>排序顺序</label>
            <input
              type="number"
              value={componentData.sort_order || 0}
              onChange={(e) => handleComponentDataChange('sort_order', parseInt(e.target.value))}
            />
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={componentData.is_active ?? true}
                onChange={(e) => handleComponentDataChange('is_active', e.target.checked)}
              />
              激活状态
            </label>
          </div>
        </div>
      );
    }
  };

  // 渲染样式标签页
  const renderStyleTab = () => {
    const styleData = type === 'content' ? contentData.style_data : componentData.style_overrides;
    const handleStyleChange = (newStyle: any) => {
      if (type === 'content') {
        handleContentDataChange('style_data', newStyle);
      } else {
        handleComponentDataChange('style_overrides', newStyle);
      }
    };

    return (
      <div className="tab-content">
        <div className="form-group">
          <label>样式配置</label>
          <textarea
            value={JSON.stringify(styleData, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleStyleChange(parsed);
              } catch (error) {
                console.warn('Invalid JSON:', error);
              }
            }}
            placeholder="JSON格式的样式配置"
            rows={12}
          />
        </div>
        
        <div className="style-presets">
          <h4>样式预设</h4>
          <div className="preset-buttons">
            <button onClick={() => handleStyleChange({ color: '#333', fontSize: '16px' })}>
              默认文本
            </button>
            <button onClick={() => handleStyleChange({ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '8px' })}>
              卡片样式
            </button>
            <button onClick={() => handleStyleChange({ display: 'flex', justifyContent: 'center', alignItems: 'center' })}>
              居中布局
            </button>
            <button onClick={() => handleStyleChange({})}>
              清除样式
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 渲染位置标签页
  const renderPositionTab = () => {
    if (type === 'content') {
      return (
        <div className="tab-content">
          <div className="form-group">
            <label>位置数据</label>
            <textarea
              value={JSON.stringify(contentData.position_data, null, 2)}
              onChange={(e) => handleJsonEdit('position_data', e.target.value)}
              placeholder="JSON格式的位置配置"
              rows={8}
            />
          </div>
          
          <div className="position-controls">
            <h4>快速设置</h4>
            <div className="control-grid">
              <div className="control-group">
                <label>宽度</label>
                <select onChange={(e) => {
                  const currentPosition = (contentData.position_data as PositionData) || {};
                  const newPosition: PositionData = { ...currentPosition, width: e.target.value as any };
                  handleContentDataChange('position_data', newPosition);
                }}>
                  <option value="auto">自动</option>
                  <option value="100%">100%</option>
                  <option value="50%">50%</option>
                  <option value="300px">300px</option>
                </select>
              </div>
              
              <div className="control-group">
                <label>高度</label>
                <select onChange={(e) => {
                  const currentPosition = (contentData.position_data as PositionData) || {};
                  const newPosition: PositionData = { ...currentPosition, height: e.target.value as any };
                  handleContentDataChange('position_data', newPosition);
                }}>
                  <option value="auto">自动</option>
                  <option value="100px">100px</option>
                  <option value="200px">200px</option>
                  <option value="300px">300px</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="tab-content">
          <div className="form-group">
            <label>布局数据</label>
            <textarea
              value={componentData.layout_config ? JSON.stringify(componentData.layout_config, null, 2) : '{}'}
              onChange={(e) => {
                try {
                  handleComponentDataChange('layout_config', JSON.parse(e.target.value));
                } catch {
                  handleComponentDataChange('layout_config', {});
                }
              }}
              placeholder="JSON格式的布局配置"
              rows={8}
            />
          </div>
          
          <div className="layout-presets">
            <h4>布局预设</h4>
            <div className="preset-buttons">
              <button onClick={() => handleComponentDataChange('layout_config', {
                display: 'flex',
                flexDirection: 'row',
                gap: '1rem'
              })}>
                水平布局
              </button>
              <button onClick={() => handleComponentDataChange('layout_config', {
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              })}>
                垂直布局
              </button>
              <button onClick={() => handleComponentDataChange('layout_config', {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              })}>
                网格布局
              </button>
            </div>
          </div>
        </div>
      );
    }
  };

  // 渲染高级标签页
  const renderAdvancedTab = () => (
    <div className="tab-content">
      <div className="form-group">
        <label>创建时间</label>
        <input
          type="text"
          value={currentItem?.created_at || ''}
          disabled
        />
      </div>
      
      <div className="form-group">
        <label>更新时间</label>
        <input
          type="text"
          value={currentItem?.updated_at || ''}
          disabled
        />
      </div>
      
      <div className="form-group">
        <label>ID</label>
        <input
          type="text"
          value={currentItem?.id || ''}
          disabled
        />
      </div>
      
      <div className="form-group">
        <label>页面ID</label>
        <input
          type="text"
          value={currentItem?.page_id || ''}
          disabled
        />
      </div>
      
      <div className="danger-zone">
        <h4>危险操作</h4>
        <p>以下操作不可逆，请谨慎操作</p>
        <button className="danger-button" onClick={() => {
          if (confirm('确定要重置所有数据吗？此操作不可逆！')) {
            if (type === 'content' && currentContent) {
              setContentData({
                content_type: currentContent.content_type,
                content_key: currentContent.content_key,
                content_data: { value: '' },
                position_data: {},
                style_data: {},
                is_active: true,
                sort_order: 0
              });
            } else if (type === 'component' && currentComponent) {
              setComponentData({
                component_type: currentComponent.component_type,
                component_name: currentComponent.component_name,
                props: {},
                layout_config: {},
                style_overrides: {},
                is_active: true,
                sort_order: 0
              });
            }
            setHasChanges(true);
          }
        }}>
          重置数据
        </button>
      </div>
    </div>
  );

  if (!isVisible || !itemId || !currentItem) {
    return null;
  }

  return (
    <div className={`content-editor ${className}`}>
      <div className="editor-header">
        <div className="header-info">
          <h3>
            编辑{type === 'content' ? '内容' : '组件'}: 
            {type === 'content' ? currentContent?.content_key : currentComponent?.component_name}
          </h3>
          {hasChanges && <span className="changes-indicator">●</span>}
        </div>
        
        <div className="header-actions">
          <button 
            onClick={handleSave} 
            disabled={!hasChanges || isSaving}
            className="save-button"
          >
            {isSaving ? '保存中...' : '💾 保存'}
          </button>
          <button onClick={onClose} className="close-button">
            ✕
          </button>
        </div>
      </div>
      
      {validationErrors.length > 0 && (
        <div className="validation-errors">
          {validationErrors.map((error, index) => (
            <div key={index} className="error-message">
              ⚠️ {error}
            </div>
          ))}
        </div>
      )}
      
      <div className="editor-tabs">
        <button 
          className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          基本信息
        </button>
        <button 
          className={`tab ${activeTab === 'style' ? 'active' : ''}`}
          onClick={() => setActiveTab('style')}
        >
          样式配置
        </button>
        <button 
          className={`tab ${activeTab === 'position' ? 'active' : ''}`}
          onClick={() => setActiveTab('position')}
        >
          {type === 'content' ? '位置配置' : '布局配置'}
        </button>
        <button 
          className={`tab ${activeTab === 'advanced' ? 'active' : ''}`}
          onClick={() => setActiveTab('advanced')}
        >
          高级设置
        </button>
      </div>
      
      <div className="editor-content">
        {activeTab === 'basic' && renderBasicTab()}
        {activeTab === 'style' && renderStyleTab()}
        {activeTab === 'position' && renderPositionTab()}
        {activeTab === 'advanced' && renderAdvancedTab()}
      </div>
    </div>
  );
};

// 样式
const styles = `
.content-editor {
  position: fixed;
  top: 0;
  right: 0;
  width: 500px;
  height: 100vh;
  background: white;
  border-left: 1px solid #e5e7eb;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-info h3 {
  margin: 0;
  color: #374151;
  font-size: 16px;
}

.changes-indicator {
  color: #f59e0b;
  font-size: 20px;
  line-height: 1;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.save-button {
  padding: 0.5rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.save-button:hover:not(:disabled) {
  background: #059669;
}

.save-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.close-button {
  padding: 0.5rem;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.close-button:hover {
  background: #4b5563;
}

.validation-errors {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-left: none;
  border-right: none;
  padding: 1rem;
}

.error-message {
  color: #dc2626;
  font-size: 14px;
  margin-bottom: 0.5rem;
}

.error-message:last-child {
  margin-bottom: 0;
}

.editor-tabs {
  display: flex;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.editor-tabs .tab {
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

.editor-tabs .tab:hover {
  background: #f3f4f6;
  color: #374151;
}

.editor-tabs .tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: white;
}

.editor-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.checkbox-label {
  flex-direction: row !important;
  align-items: center;
  gap: 0.5rem !important;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.form-group textarea {
  font-family: Monaco, Consolas, "Courier New", monospace;
  font-size: 12px;
  resize: vertical;
  min-height: 100px;
}

.form-group input:disabled {
  background: #f9fafb;
  color: #6b7280;
}

.style-presets,
.layout-presets {
  margin-top: 1rem;
}

.style-presets h4,
.layout-presets h4 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 14px;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.preset-buttons button {
  padding: 0.5rem 0.75rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.preset-buttons button:hover {
  background: #e5e7eb;
  border-color: #3b82f6;
}

.position-controls {
  margin-top: 1rem;
}

.position-controls h4 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 14px;
}

.control-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.control-group label {
  font-size: 12px;
  color: #6b7280;
}

.control-group select {
  padding: 0.25rem;
  font-size: 12px;
}

.danger-zone {
  margin-top: 2rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
}

.danger-zone h4 {
  margin: 0 0 0.5rem 0;
  color: #dc2626;
  font-size: 14px;
}

.danger-zone p {
  margin: 0 0 1rem 0;
  color: #6b7280;
  font-size: 12px;
}

.danger-button {
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.danger-button:hover {
  background: #dc2626;
}
`;

// 注入样式
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default ContentEditor;