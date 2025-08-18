import React, { useState, useRef, useEffect } from 'react';
import { useComponentStyles } from '../../hooks/useTheme';
import { StyleMerger } from '../../utils/themeUtils';

/**
 * Tab项接口
 */
export interface TabItem {
  /** Tab唯一标识 */
  key: string;
  /** Tab标签 */
  label: string;
  /** Tab内容 */
  content: React.ReactNode;
  /** 是否禁用 */
  disabled?: boolean;
  /** Tab图标 */
  icon?: React.ReactNode;
  /** 是否可关闭 */
  closable?: boolean;
  /** 徽章内容 */
  badge?: string | number;
}

/**
 * Tabs组件的属性接口
 */
export interface ThemedTabsProps {
  /** Tab项列表 */
  items: TabItem[];
  /** 当前激活的Tab */
  activeKey?: string;
  /** Tab切换回调 */
  onChange?: (key: string) => void;
  /** Tab关闭回调 */
  onTabClose?: (key: string) => void;
  /** Tabs变体 */
  variant?: 'default' | 'pills' | 'underline' | 'card' | 'segment';
  /** Tabs尺寸 */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Tab位置 */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** 是否居中对齐 */
  centered?: boolean;
  /** 是否可滚动 */
  scrollable?: boolean;
  /** 是否显示添加按钮 */
  showAddButton?: boolean;
  /** 添加按钮回调 */
  onAddTab?: () => void;
  /** 添加按钮文本 */
  addButtonText?: string;
  /** 是否延迟加载内容 */
  lazyLoad?: boolean;
  /** 是否保持内容挂载 */
  keepAlive?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 自定义Tab渲染 */
  renderTab?: (item: TabItem, isActive: boolean) => React.ReactNode;
  /** 自定义内容渲染 */
  renderContent?: (item: TabItem) => React.ReactNode;
  /** 动画持续时间 */
  animationDuration?: number;
  /** 是否显示分隔线 */
  showDivider?: boolean;
}

/**
 * 主题化Tabs组件
 * 支持多种变体、位置和交互方式
 */
export const ThemedTabs: React.FC<ThemedTabsProps> = ({
  items,
  activeKey,
  onChange,
  onTabClose,
  variant = 'default',
  size = 'md',
  position = 'top',
  centered = false,
  scrollable = false,
  showAddButton = false,
  onAddTab,
  addButtonText = '+',
  lazyLoad = false,
  keepAlive = false,
  className = '',
  style = {},
  renderTab,
  renderContent,
  animationDuration = 300,
  showDivider = true
}) => {
  const [currentActiveKey, setCurrentActiveKey] = useState(activeKey || items[0]?.key);
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set([currentActiveKey]));
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabListRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  // 获取组件样式
  const { getComponentStyles } = useComponentStyles('tabs');
  const componentStyles = getComponentStyles();
  const baseStyles = componentStyles?.base || {};
  const tabListStyles = componentStyles?.tabList || {};
  const tabStyles = componentStyles?.tab || {};
  const contentStyles = componentStyles?.content || {};
  const indicatorStyles = componentStyles?.indicator || {};

  // 更新激活指示器位置
  useEffect(() => {
    if (activeTabRef.current && (variant === 'underline' || variant === 'pills')) {
      const tabElement = activeTabRef.current;
      const tabRect = tabElement.getBoundingClientRect();
      const containerRect = tabListRef.current?.getBoundingClientRect();
      
      if (containerRect) {
        const isVertical = position === 'left' || position === 'right';
        
        if (isVertical) {
          setIndicatorStyle({
            top: tabRect.top - containerRect.top,
            height: tabRect.height,
            width: variant === 'underline' ? '3px' : tabRect.width,
            left: variant === 'underline' ? 0 : tabRect.left - containerRect.left,
          });
        } else {
          setIndicatorStyle({
            left: tabRect.left - containerRect.left,
            width: tabRect.width,
            height: variant === 'underline' ? '3px' : tabRect.height,
            top: variant === 'underline' ? 'auto' : tabRect.top - containerRect.top,
            bottom: variant === 'underline' ? 0 : 'auto',
          });
        }
      }
    }
  }, [currentActiveKey, variant, position, items]);

  // 处理Tab切换
  const handleTabChange = (key: string) => {
    if (key === currentActiveKey) return;
    
    const targetTab = items.find(item => item.key === key);
    if (targetTab?.disabled) return;

    setCurrentActiveKey(key);
    onChange?.(key);

    // 延迟加载时记录已加载的Tab
    if (lazyLoad) {
      setLoadedTabs(prev => new Set([...prev, key]));
    }
  };

  // 处理Tab关闭
  const handleTabClose = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    onTabClose?.(key);

    // 如果关闭的是当前激活Tab，切换到下一个可用Tab
    if (key === currentActiveKey) {
      const currentIndex = items.findIndex(item => item.key === key);
      const nextTab = items[currentIndex + 1] || items[currentIndex - 1];
      if (nextTab) {
        handleTabChange(nextTab.key);
      }
    }
  };

  // 处理键盘导航
  const handleKeyDown = (e: React.KeyboardEvent, key: string) => {
    const currentIndex = items.findIndex(item => item.key === key);
    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = items.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleTabChange(key);
        return;
    }

    // 跳过禁用的Tab
    while (items[nextIndex]?.disabled && nextIndex !== currentIndex) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        nextIndex = nextIndex > 0 ? nextIndex - 1 : items.length - 1;
      } else {
        nextIndex = nextIndex < items.length - 1 ? nextIndex + 1 : 0;
      }
    }

    if (nextIndex !== currentIndex && !items[nextIndex]?.disabled) {
      handleTabChange(items[nextIndex].key);
    }
  };

  // 渲染Tab项
  const renderTabItem = (item: TabItem) => {
    const isActive = item.key === currentActiveKey;
    
    if (renderTab) {
      return renderTab(item, isActive);
    }

    return (
      <button
        ref={isActive ? activeTabRef : undefined}
        key={item.key}
        className={StyleMerger.mergeClassNames(
          'tab-item',
          `tab-item--${variant}`,
          `tab-item--${size}`,
          isActive ? 'tab-item--active' : '',
          item.disabled ? 'tab-item--disabled' : ''
        )}
        style={tabStyles as React.CSSProperties}
        onClick={() => handleTabChange(item.key)}
        onKeyDown={(e) => handleKeyDown(e, item.key)}
        disabled={item.disabled}
        role="tab"
        aria-selected={isActive}
        aria-controls={`tabpanel-${item.key}`}
        tabIndex={isActive ? 0 : -1}
      >
        {item.icon && (
          <span className="tab-item__icon">{item.icon}</span>
        )}
        <span className="tab-item__label">{item.label}</span>
        {item.badge && (
          <span className="tab-item__badge">{item.badge}</span>
        )}
        {item.closable && (
          <button
            className="tab-item__close"
            onClick={(e) => handleTabClose(e, item.key)}
            aria-label={`关闭 ${item.label}`}
          >
            ×
          </button>
        )}
      </button>
    );
  };

  // 渲染Tab内容
  const renderTabContent = () => {
    const activeTab = items.find(item => item.key === currentActiveKey);
    if (!activeTab) return null;

    if (renderContent) {
      return renderContent(activeTab);
    }

    // 延迟加载逻辑
    if (lazyLoad && !loadedTabs.has(currentActiveKey)) {
      return (
        <div className="tab-content__loading">
          <span>加载中...</span>
        </div>
      );
    }

    // 保持挂载逻辑
    if (keepAlive) {
      return (
        <div className="tab-content__keep-alive">
          {items.map(item => (
            <div
              key={item.key}
              className={StyleMerger.mergeClassNames(
                'tab-content__panel',
                item.key === currentActiveKey ? 'tab-content__panel--active' : 'tab-content__panel--hidden'
              )}
              role="tabpanel"
              id={`tabpanel-${item.key}`}
              aria-labelledby={`tab-${item.key}`}
            >
              {(!lazyLoad || loadedTabs.has(item.key)) && item.content}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div
        className="tab-content__panel tab-content__panel--active"
        role="tabpanel"
        id={`tabpanel-${currentActiveKey}`}
        aria-labelledby={`tab-${currentActiveKey}`}
      >
        {activeTab.content}
      </div>
    );
  };

  // 合并样式
  const tabsClassName = StyleMerger.mergeClassNames(
    'tabs',
    `tabs--${variant}`,
    `tabs--${size}`,
    `tabs--${position}`,
    centered ? 'tabs--centered' : '',
    scrollable ? 'tabs--scrollable' : '',
    className
  );

  const tabListClassName = StyleMerger.mergeClassNames(
    'tabs-list',
    `tabs-list--${variant}`,
    `tabs-list--${position}`,
    centered ? 'tabs-list--centered' : '',
    scrollable ? 'tabs-list--scrollable' : ''
  );

  const isVertical = position === 'left' || position === 'right';
  const isBottom = position === 'bottom';

  return (
    <div
      ref={tabsRef}
      className={tabsClassName}
      style={{ ...(baseStyles as React.CSSProperties), ...style }}
    >
      {/* 底部位置时，先渲染内容 */}
      {isBottom && (
        <div className="tabs-content" style={contentStyles as React.CSSProperties}>
          {renderTabContent()}
        </div>
      )}

      {/* Tab列表 */}
      <div
        ref={tabListRef}
        className={tabListClassName}
        style={tabListStyles as React.CSSProperties}
        role="tablist"
        aria-orientation={isVertical ? 'vertical' : 'horizontal'}
      >
        {/* 激活指示器 */}
        {(variant === 'underline' || variant === 'pills') && (
          <div
            className={`tabs-indicator tabs-indicator--${variant}`}
            style={{
              ...indicatorStyles,
              ...indicatorStyle,
              transition: `all ${animationDuration}ms ease`,
            }}
          />
        )}

        {/* Tab项 */}
        <div className="tabs-items">
          {items.map(renderTabItem)}
        </div>

        {/* 添加按钮 */}
        {showAddButton && (
          <button
            className="tabs-add-button"
            onClick={onAddTab}
            aria-label="添加标签页"
          >
            {addButtonText}
          </button>
        )}
      </div>

      {/* 分隔线 */}
      {showDivider && variant !== 'card' && (
        <div className={`tabs-divider tabs-divider--${position}`} />
      )}

      {/* 非底部位置时，后渲染内容 */}
      {!isBottom && (
        <div className="tabs-content" style={contentStyles as React.CSSProperties}>
          {renderTabContent()}
        </div>
      )}
    </div>
  );
};

/**
 * Tab面板组件
 */
export interface TabPanelProps {
  /** 面板内容 */
  children: React.ReactNode;
  /** 面板标识 */
  value: string;
  /** 当前激活值 */
  activeValue?: string;
  /** 是否延迟加载 */
  lazy?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  activeValue,
  lazy = false,
  className = '',
  style = {}
}) => {
  const isActive = value === activeValue;
  const [hasLoaded, setHasLoaded] = useState(!lazy || isActive);

  useEffect(() => {
    if (isActive && !hasLoaded) {
      setHasLoaded(true);
    }
  }, [isActive, hasLoaded]);

  if (!hasLoaded) {
    return null;
  }

  return (
    <div
      className={StyleMerger.mergeClassNames(
        'tab-panel',
        isActive ? 'tab-panel--active' : 'tab-panel--hidden',
        className
      )}
      style={style}
      role="tabpanel"
      aria-hidden={!isActive}
    >
      {children}
    </div>
  );
};



export default ThemedTabs;