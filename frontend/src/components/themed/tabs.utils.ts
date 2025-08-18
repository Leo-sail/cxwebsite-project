/**
 * Tabs相关的工具函数、hooks和常量
 */
import { useState } from 'react';
import type { TabItem } from './ThemedTabs';

/**
 * Tabs Hook - 用于管理Tab状态
 */
export const useTabs = (initialKey?: string) => {
  const [activeKey, setActiveKey] = useState<string | undefined>(initialKey);
  const [tabs, setTabs] = useState<TabItem[]>([]);

  const addTab = (tab: TabItem) => {
    setTabs(prev => [...prev, tab]);
  };

  const removeTab = (key: string) => {
    setTabs(prev => prev.filter(tab => tab.key !== key));
    if (activeKey === key) {
      const remainingTabs = tabs.filter(tab => tab.key !== key);
      if (remainingTabs.length > 0) {
        setActiveKey(remainingTabs[0].key);
      } else {
        setActiveKey(undefined);
      }
    }
  };

  const updateTab = (key: string, updates: Partial<TabItem>) => {
    setTabs(prev => prev.map(tab => 
      tab.key === key ? { ...tab, ...updates } : tab
    ));
  };

  return {
    activeKey,
    setActiveKey,
    tabs,
    setTabs,
    addTab,
    removeTab,
    updateTab
  };
};

// 默认样式配置
export const defaultTabsStyles = {
  base: {
    display: 'flex',
    flexDirection: 'column' as const,
    width: '100%',
  },
  tabList: {
    display: 'flex',
    position: 'relative' as const,
    borderBottom: 'var(--tabs-border, 1px solid #e5e7eb)',
  },
  tab: {
    padding: 'var(--tabs-tab-padding, 0.75rem 1rem)',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: 'var(--tabs-tab-font-size, 0.875rem)',
    fontWeight: 'var(--tabs-tab-font-weight, 500)',
    color: 'var(--tabs-tab-color, #6b7280)',
  },
  content: {
    padding: 'var(--tabs-content-padding, 1rem)',
    flex: 1,
  },
  indicator: {
    position: 'absolute' as const,
    backgroundColor: 'var(--tabs-indicator-color, #3b82f6)',
    transition: 'all 0.3s ease',
  }
};