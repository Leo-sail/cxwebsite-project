import React, { useState, useCallback, useMemo } from 'react';
import { ComponentType, type LayoutData, type StyleData } from '../../../types/content';
import type { ExtendedComponentInstance } from '../../../types/content';

interface ComponentRendererProps {
  /** 组件实例数据 */
  instance: ExtendedComponentInstance;
  /** 是否为编辑模式 */
  isEditMode?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 组件更新回调 */
  onUpdate?: (instanceId: string, updates: Partial<ExtendedComponentInstance>) => void;
  /** 组件删除回调 */
  onDelete?: (instanceId: string) => void;
  /** 子组件实例列表 */
  children?: ExtendedComponentInstance[];
}

/**
 * 动态组件渲染器
 * 根据组件类型和配置动态渲染组件
 */
export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  instance,
  isEditMode = false,
  className = '',
  onUpdate,
  onDelete,
  children = []
}) => {
  const [isSelected, setIsSelected] = useState(false);

  const [showConfig, setShowConfig] = useState(false);

  // 处理组件选择
  const handleSelect = useCallback((e: React.MouseEvent) => {
    if (isEditMode) {
      e.stopPropagation();
      setIsSelected(!isSelected);
    }
  }, [isEditMode, isSelected]);

  // 处理组件编辑
  const handleEdit = useCallback(() => {
    if (isEditMode) {
      setShowConfig(true);
    }
  }, [isEditMode]);

  // 处理组件删除
  const handleDelete = useCallback(() => {
    if (isEditMode && onDelete) {
      onDelete(instance.id);
    }
  }, [isEditMode, onDelete, instance.id]);

  // 处理属性更新
  const handlePropsUpdate = useCallback((newProps: any) => {
    if (onUpdate) {
      onUpdate(instance.id, {
        config_data: newProps,
        updated_at: new Date().toISOString()
      });
    }
  }, [onUpdate, instance.id]);

  // 处理样式更新
  const handleStyleUpdate = useCallback((newStyles: StyleData) => {
    if (onUpdate) {
      onUpdate(instance.id, {
        config_value: newStyles,
        updated_at: new Date().toISOString()
      });
    }
  }, [onUpdate, instance.id]);

  // 处理布局更新
  const handleLayoutUpdate = useCallback((newLayout: LayoutData) => {
    if (onUpdate) {
      onUpdate(instance.id, {
        layout_config: newLayout,
        updated_at: new Date().toISOString()
      });
    }
  }, [onUpdate, instance.id]);

  // 获取组件样式
  const getComponentStyle = useMemo((): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {};
    
    // 应用布局数据
    if (instance.layout_config) {
      const layout = instance.layout_config;
      if (layout.width) baseStyle.width = layout.width;
      if (layout.height) baseStyle.height = layout.height;
      if (layout.margin) baseStyle.margin = layout.margin;
      if (layout.padding) baseStyle.padding = layout.padding;
      if (layout.display) baseStyle.display = layout.display;
      if (layout.flexDirection) baseStyle.flexDirection = layout.flexDirection;
      if (layout.justifyContent) baseStyle.justifyContent = layout.justifyContent;
      if (layout.alignItems) baseStyle.alignItems = layout.alignItems;
      if (layout.gap) baseStyle.gap = layout.gap;
    }
    
    // 应用样式覆盖
    if (instance.config_value) {
      Object.assign(baseStyle, instance.config_value);
    }
    
    // 编辑模式样式
    if (isEditMode) {
      baseStyle.position = 'relative';
      baseStyle.border = isSelected ? '2px solid #3b82f6' : '1px dashed #d1d5db';
      baseStyle.borderRadius = '4px';
      baseStyle.minHeight = baseStyle.minHeight || '50px';
    }
    
    return baseStyle;
  }, [instance.layout_config, instance.config_value, isEditMode, isSelected]);

  // 渲染具体组件
  const renderComponent = useCallback(() => {
    const props = instance.config_data || {};
    
    switch (instance.component_type) {
      case ComponentType.BUTTON:
        return (
          <button
            {...props}
            className={`dynamic-button ${props.className || ''}`}
            onClick={props.onClick}
          >
            {props.text || '按钮'}
          </button>
        );
        
      case ComponentType.CARD:
        return (
          <div className={`dynamic-card ${props.className || ''}`}>
            {props.title && (
              <div className="card-header">
                <h3>{props.title}</h3>
              </div>
            )}
            <div className="card-body">
              {props.content || '卡片内容'}
              {children.length > 0 && (
                <div className="card-children">
                  {children.map(child => (
                    <ComponentRenderer
                      key={child.id}
                      instance={child}
                      isEditMode={isEditMode}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              )}
            </div>
            {props.footer && (
              <div className="card-footer">
                {props.footer}
              </div>
            )}
          </div>
        );
        
      case ComponentType.LIST:
        return (
          <div className={`dynamic-list ${props.className || ''}`}>
            {props.title && <h4>{props.title}</h4>}
            <ul>
              {(props.items || []).map((item: any, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        );
        
      case ComponentType.GRID:
        return (
          <div 
            className={`dynamic-grid ${props.className || ''}`}
            style={{
              display: 'grid',
              gridTemplateColumns: props.columns || 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: props.gap || '1rem'
            }}
          >
            {children.map(child => (
              <ComponentRenderer
                key={child.id}
                instance={child}
                isEditMode={isEditMode}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </div>
        );
        
      case ComponentType.FORM:
        return (
          <form className={`dynamic-form ${props.className || ''}`}>
            {props.title && <h3>{props.title}</h3>}
            {(props.fields || []).map((field: any, index: number) => (
              <div key={index} className="form-field">
                <label>{field.label}</label>
                <input
                  type={field.type || 'text'}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              </div>
            ))}
            <button type="submit">{props.submitText || '提交'}</button>
          </form>
        );
        
      case ComponentType.NAVIGATION:
        return (
          <nav className={`dynamic-nav ${props.className || ''}`}>
            <ul>
              {(props.items || []).map((item: any, index: number) => (
                <li key={index}>
                  <a href={item.href || '#'}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        );
        
      case ComponentType.HERO:
        return (
          <div className={`dynamic-hero ${props.className || ''}`}>
            {props.backgroundImage && (
              <div 
                className="hero-background"
                style={{ backgroundImage: `url(${props.backgroundImage})` }}
              />
            )}
            <div className="hero-content">
              {props.title && <h1>{props.title}</h1>}
              {props.subtitle && <p>{props.subtitle}</p>}
              {props.buttonText && (
                <button className="hero-button">
                  {props.buttonText}
                </button>
              )}
            </div>
          </div>
        );
        
      case ComponentType.GALLERY:
        return (
          <div className={`dynamic-gallery ${props.className || ''}`}>
            {props.title && <h3>{props.title}</h3>}
            <div className="gallery-grid">
              {(props.images || []).map((image: any, index: number) => (
                <div key={index} className="gallery-item">
                  <img src={(image.src && image.src.trim() !== '') ? image.src : 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=暂无图片'} alt={image.alt || ''} />
                  {image.caption && (
                    <div className="gallery-caption">{image.caption}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
        
      case ComponentType.MODAL:
        return (
          <div className={`dynamic-modal ${props.className || ''} ${props.isOpen ? 'open' : ''}`}>
            <div className="modal-backdrop" onClick={props.onClose}></div>
            <div className="modal-content">
              <div className="modal-header">
                {props.title && <h3>{props.title}</h3>}
                <button className="modal-close" onClick={props.onClose}>✕</button>
              </div>
              <div className="modal-body">
                {props.content || children.map(child => (
                  <ComponentRenderer
                    key={child.id}
                    instance={child}
                    isEditMode={isEditMode}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                  />
                ))}
              </div>
              {props.footer && (
                <div className="modal-footer">{props.footer}</div>
              )}
            </div>
          </div>
        );
        
      case ComponentType.TABS:
        return (
          <div className={`dynamic-tabs ${props.className || ''}`}>
            <div className="tabs-header">
              {(props.tabs || []).map((tab: any, index: number) => (
                <button
                  key={index}
                  className={`tab-button ${props.activeTab === index ? 'active' : ''}`}
                  onClick={() => props.onTabChange?.(index)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="tabs-content">
              {props.tabs?.[props.activeTab || 0]?.content || children[props.activeTab || 0] && (
                <ComponentRenderer
                  key={children[props.activeTab || 0]?.id}
                  instance={children[props.activeTab || 0]}
                  isEditMode={isEditMode}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              )}
            </div>
          </div>
        );
        
      case ComponentType.ACCORDION:
        return (
          <div className={`dynamic-accordion ${props.className || ''}`}>
            {(props.items || []).map((item: any, index: number) => (
              <div key={index} className="accordion-item">
                <button
                  className={`accordion-header ${props.openItems?.includes(index) ? 'open' : ''}`}
                  onClick={() => props.onToggle?.(index)}
                >
                  {item.title}
                  <span className="accordion-icon">▼</span>
                </button>
                {props.openItems?.includes(index) && (
                  <div className="accordion-content">
                    {item.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
        
      case ComponentType.CAROUSEL:
        return (
          <div className={`dynamic-carousel ${props.className || ''}`}>
            <div className="carousel-container">
              <div 
                className="carousel-track"
                style={{ transform: `translateX(-${(props.currentSlide || 0) * 100}%)` }}
              >
                {(props.slides || []).map((slide: any, index: number) => (
                  <div key={index} className="carousel-slide">
                    {(slide.image && slide.image.trim() !== '') && <img src={slide.image} alt={slide.alt || ''} />}
                    {slide.content && <div className="slide-content">{slide.content}</div>}
                  </div>
                ))}
              </div>
              <button 
                className="carousel-prev"
                onClick={() => props.onPrevSlide?.()}
              >
                ‹
              </button>
              <button 
                className="carousel-next"
                onClick={() => props.onNextSlide?.()}
              >
                ›
              </button>
            </div>
            <div className="carousel-indicators">
              {(props.slides || []).map((_: any, index: number) => (
                <button
                  key={index}
                  className={`indicator ${props.currentSlide === index ? 'active' : ''}`}
                  onClick={() => props.onSlideChange?.(index)}
                />
              ))}
            </div>
          </div>
        );
        
      case ComponentType.TABLE:
        return (
          <div className={`dynamic-table ${props.className || ''}`}>
            {props.title && <h3>{props.title}</h3>}
            <table>
              {props.headers && (
                <thead>
                  <tr>
                    {props.headers.map((header: string, index: number) => (
                      <th key={index}>{header}</th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {(props.rows || []).map((row: any[], rowIndex: number) => (
                  <tr key={rowIndex}>
                    {row.map((cell: any, cellIndex: number) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        
      case ComponentType.BADGE:
        return (
          <span className={`dynamic-badge ${props.variant || 'default'} ${props.className || ''}`}>
            {props.text || 'Badge'}
          </span>
        );
        
      case ComponentType.ALERT:
        return (
          <div className={`dynamic-alert ${props.type || 'info'} ${props.className || ''}`}>
            {props.icon && <span className="alert-icon">{props.icon}</span>}
            <div className="alert-content">
              {props.title && <h4>{props.title}</h4>}
              <p>{props.message || 'Alert message'}</p>
            </div>
            {props.closable && (
              <button className="alert-close" onClick={props.onClose}>✕</button>
            )}
          </div>
        );
        
      case ComponentType.PROGRESS:
        return (
          <div className={`dynamic-progress ${props.className || ''}`}>
            {props.label && <label>{props.label}</label>}
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${props.value || 0}%` }}
              />
            </div>
            {props.showValue && (
              <span className="progress-value">{props.value || 0}%</span>
            )}
          </div>
        );
        
      case ComponentType.AVATAR:
        return (
          <div className={`dynamic-avatar ${props.size || 'medium'} ${props.className || ''}`}>
            {(props.image && props.image.trim() !== '') ? (
              <img src={props.image} alt={props.alt || 'Avatar'} />
            ) : (
              <span className="avatar-initials">
                {props.initials || props.name?.charAt(0) || 'U'}
              </span>
            )}
          </div>
        );
        
      case ComponentType.BREADCRUMB:
        return (
          <nav className={`dynamic-breadcrumb ${props.className || ''}`}>
            <ol>
              {(props.items || []).map((item: any, index: number) => (
                <li key={index}>
                  {item.href ? (
                    <a href={item.href}>{item.label}</a>
                  ) : (
                    <span>{item.label}</span>
                  )}
                  {index < (props.items?.length - 1) && (
                    <span className="breadcrumb-separator">/</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        );
        
      case ComponentType.PAGINATION:
        return (
          <nav className={`dynamic-pagination ${props.className || ''}`}>
            <button 
              className="pagination-prev"
              disabled={props.currentPage <= 1}
              onClick={() => props.onPageChange?.(props.currentPage - 1)}
            >
              上一页
            </button>
            <div className="pagination-pages">
              {Array.from({ length: props.totalPages || 1 }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`pagination-page ${props.currentPage === page ? 'active' : ''}`}
                  onClick={() => props.onPageChange?.(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            <button 
              className="pagination-next"
              disabled={props.currentPage >= (props.totalPages || 1)}
              onClick={() => props.onPageChange?.(props.currentPage + 1)}
            >
              下一页
            </button>
          </nav>
        );
        
      case ComponentType.DROPDOWN:
        return (
          <div className={`dynamic-dropdown ${props.isOpen ? 'open' : ''} ${props.className || ''}`}>
            <button 
              className="dropdown-trigger"
              onClick={() => props.onToggle?.()}
            >
              {props.label || 'Dropdown'}
              <span className="dropdown-arrow">▼</span>
            </button>
            {props.isOpen && (
              <div className="dropdown-menu">
                {(props.items || []).map((item: any, index: number) => (
                  <button
                    key={index}
                    className="dropdown-item"
                    onClick={() => props.onSelect?.(item)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
        
      case ComponentType.SIDEBAR:
        return (
          <aside className={`dynamic-sidebar ${props.position || 'left'} ${props.className || ''}`}>
            {props.title && <h3>{props.title}</h3>}
            <nav>
              {(props.items || []).map((item: any, index: number) => (
                <a key={index} href={item.href || '#'} className="sidebar-item">
                  {item.icon && <span className="sidebar-icon">{item.icon}</span>}
                  {item.label}
                </a>
              ))}
            </nav>
            {children.length > 0 && (
              <div className="sidebar-content">
                {children.map(child => (
                  <ComponentRenderer
                    key={child.id}
                    instance={child}
                    isEditMode={isEditMode}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </aside>
        );
        
      case ComponentType.HEADER:
        return (
          <header className={`dynamic-header ${props.className || ''}`}>
            {props.logo && (
              <div className="header-logo">
                <img src={props.logo || 'https://via.placeholder.com/120x40/3B82F6/FFFFFF?text=LOGO'} alt={props.logoAlt || 'Logo'} />
              </div>
            )}
            {props.title && <h1>{props.title}</h1>}
            {props.navigation && (
              <nav className="header-nav">
                {props.navigation.map((item: any, index: number) => (
                  <a key={index} href={item.href || '#'}>{item.label}</a>
                ))}
              </nav>
            )}
            {children.length > 0 && (
              <div className="header-content">
                {children.map(child => (
                  <ComponentRenderer
                    key={child.id}
                    instance={child}
                    isEditMode={isEditMode}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </header>
        );
        
      case ComponentType.FOOTER:
        return (
          <footer className={`dynamic-footer ${props.className || ''}`}>
            <div className="footer-content">
              {props.sections && props.sections.map((section: any, index: number) => (
                <div key={index} className="footer-section">
                  {section.title && <h4>{section.title}</h4>}
                  {section.links && (
                    <ul>
                      {section.links.map((link: any, linkIndex: number) => (
                        <li key={linkIndex}>
                          <a href={link.href || '#'}>{link.label}</a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            {props.copyright && (
              <div className="footer-bottom">
                <p>{props.copyright}</p>
              </div>
            )}
            {children.length > 0 && (
              <div className="footer-children">
                {children.map(child => (
                  <ComponentRenderer
                    key={child.id}
                    instance={child}
                    isEditMode={isEditMode}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </footer>
        );
        
      case ComponentType.CONTAINER:
      default:
        return (
          <div className={`dynamic-container ${props.className || ''}`}>
            {props.title && <h3>{props.title}</h3>}
            {children.map(child => (
              <ComponentRenderer
                key={child.id}
                instance={child}
                isEditMode={isEditMode}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </div>
        );
    }
  }, [instance, children, isEditMode, onUpdate, onDelete]);

  // 渲染配置面板
  const renderConfigPanel = () => {
    if (!showConfig) return null;
    
    return (
      <div className="component-config-panel">
        <div className="config-header">
          <h4>组件配置</h4>
          <button onClick={() => setShowConfig(false)}>✕</button>
        </div>
        
        <div className="config-content">
          <div className="config-section">
            <h5>基本信息</h5>
            <div className="config-field">
              <label>组件名称</label>
              <input 
                type="text" 
                value={instance.config_name}
                onChange={(e) => onUpdate?.(instance.id, { config_name: e.target.value })}
              />
            </div>
            <div className="config-field">
              <label>组件类型</label>
              <select 
                value={instance.component_type}
                onChange={(e) => onUpdate?.(instance.id, { component_type: e.target.value as ComponentType })}
              >
                {Object.values(ComponentType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="config-section">
            <h5>属性配置</h5>
            <textarea
              value={JSON.stringify(instance.config_data, null, 2)}
              onChange={(e) => {
                try {
                  const newProps = JSON.parse(e.target.value);
                  handlePropsUpdate(newProps);
                } catch (error) {
                  console.warn('Invalid JSON:', error);
                }
              }}
              placeholder="JSON格式的组件属性"
              rows={6}
            />
          </div>
          
          <div className="config-section">
            <h5>样式配置</h5>
            <textarea
              value={JSON.stringify(instance.config_value, null, 2)}
              onChange={(e) => {
                try {
                  const newStyles = JSON.parse(e.target.value);
                  handleStyleUpdate(newStyles);
                } catch (error) {
                  console.warn('Invalid JSON:', error);
                }
              }}
              placeholder="JSON格式的样式覆盖"
              rows={4}
            />
          </div>
          
          <div className="config-section">
            <h5>布局配置</h5>
            <textarea
              value={JSON.stringify(instance.layout_config, null, 2)}
              onChange={(e) => {
                try {
                  const newLayout = JSON.parse(e.target.value);
                  handleLayoutUpdate(newLayout);
                } catch (error) {
                  console.warn('Invalid JSON:', error);
                }
              }}
              placeholder="JSON格式的布局配置"
              rows={4}
            />
          </div>
        </div>
        
        <div className="config-actions">
          <button onClick={() => setShowConfig(false)} className="save-button">
            保存
          </button>
          <button onClick={handleDelete} className="delete-button">
            删除组件
          </button>
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`component-renderer ${className} ${isEditMode ? 'editable' : ''} ${isSelected ? 'selected' : ''}`}
      style={getComponentStyle}
      onClick={handleSelect}
      onDoubleClick={handleEdit}
      data-component-id={instance.id}
      data-component-type={instance.component_type}
    >
      {/* 编辑模式工具栏 */}
      {isEditMode && isSelected && (
        <div className="component-toolbar">
          <span className="component-label">
            {instance.config_name || instance.component_type}
          </span>
          <div className="toolbar-actions">
            <button onClick={handleEdit} title="配置">
              ⚙️
            </button>
            <button onClick={handleDelete} title="删除">
              🗑️
            </button>
          </div>
        </div>
      )}
      
      {/* 组件内容 */}
      <div className="component-content">
        {renderComponent()}
      </div>
      
      {/* 配置面板 */}
      {renderConfigPanel()}
    </div>
  );
};

// 样式
const styles = `
.component-renderer {
  position: relative;
  transition: all 0.2s;
}

.component-renderer.editable {
  cursor: pointer;
}

.component-renderer.editable:hover {
  border-color: #3b82f6 !important;
}

.component-renderer.selected {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.component-toolbar {
  position: absolute;
  top: -40px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #374151;
  color: white;
  padding: 0.5rem;
  border-radius: 4px 4px 0 0;
  font-size: 12px;
  z-index: 10;
}

.component-label {
  font-weight: 500;
}

.toolbar-actions {
  display: flex;
  gap: 0.25rem;
}

.toolbar-actions button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 2px;
  font-size: 12px;
}

.toolbar-actions button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.component-content {
  position: relative;
  z-index: 1;
}

.component-config-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  max-height: 80vh;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.config-header h4 {
  margin: 0;
  color: #374151;
}

.config-header button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #6b7280;
}

.config-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 1rem;
}

.config-section {
  margin-bottom: 1.5rem;
}

.config-section h5 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
}

.config-field {
  margin-bottom: 1rem;
}

.config-field label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.config-field input,
.config-field select,
.config-field textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.config-field textarea {
  font-family: Monaco, Consolas, "Courier New", monospace;
  font-size: 12px;
  resize: vertical;
}

.config-actions {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.save-button,
.delete-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.save-button {
  background: #10b981;
  color: white;
}

.save-button:hover {
  background: #059669;
}

.delete-button {
  background: #ef4444;
  color: white;
}

.delete-button:hover {
  background: #dc2626;
}

/* 动态组件样式 */
.dynamic-button {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.dynamic-button:hover {
  background: #2563eb;
}

.dynamic-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.card-header {
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.card-header h3 {
  margin: 0;
  color: #374151;
}

.card-body {
  padding: 1rem;
}

.card-footer {
  padding: 1rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.dynamic-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dynamic-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.dynamic-list li:last-child {
  border-bottom: none;
}

.dynamic-form {
  max-width: 500px;
}

.form-field {
  margin-bottom: 1rem;
}

.form-field label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
  color: #374151;
}

.form-field input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

.dynamic-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 1rem;
}

.dynamic-nav a {
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.dynamic-nav a:hover {
  background: #f3f4f6;
}

.dynamic-hero {
  position: relative;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

.hero-background::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 600px;
  padding: 2rem;
}

.hero-content h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero-content p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
}

.hero-button {
  padding: 1rem 2rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.125rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.hero-button:hover {
  background: #2563eb;
}

.dynamic-gallery {
  width: 100%;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.gallery-item {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.gallery-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.2s;
}

.gallery-item:hover img {
  transform: scale(1.05);
}

.gallery-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 1rem;
  font-size: 14px;
}

.dynamic-container {
  width: 100%;
}
`;

// 注入样式
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default ComponentRenderer;