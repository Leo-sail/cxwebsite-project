/**
 * 顶部标签导航组件
 * 用于信息管理页面的顶部导航
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Button,
  TextField,
  Menu,
  MenuItem,
  Chip,
  Tooltip,
  Box,
  Typography
} from '@mui/material';
import {
  Settings,
  MoreHorizontal,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Search,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Badge } from '../ui/Badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '../ui/dropdown-menu';
import type {
  TopTabNavigationProps,
  TabConfig,
  TabActionConfig
} from '../../types/infoManagement';
import type { ContentTableType } from '../../types/contentSettings';

// ============================================================================
// 标签配置
// ============================================================================

/**
 * 默认标签配置
 */
const DEFAULT_TAB_CONFIGS: Record<ContentTableType, TabConfig> = {
  site_content: {
    id: 'site_content',
    label: '站点内容',
    description: '管理网站的基础内容信息',
    icon: '🏠',
    color: 'blue',
    count: 0
  },
  navigation: {
    id: 'navigation',
    label: '导航管理',
    description: '管理网站导航菜单',
    icon: '🧭',
    color: 'green',
    count: 0
  },
  ui_texts: {
    id: 'ui_texts',
    label: 'UI文本',
    description: '管理界面文本内容',
    icon: '📝',
    color: 'purple',
    count: 0
  },
  page_sections: {
    id: 'page_sections',
    label: '页面区域',
    description: '管理页面区域配置',
    icon: '📄',
    color: 'orange',
    count: 0
  },
  seo_metadata: {
    id: 'seo_metadata',
    label: 'SEO元数据',
    description: '管理SEO相关信息',
    icon: '🔍',
    color: 'red',
    count: 0
  }
};

/**
 * 默认操作配置
 */
const DEFAULT_ACTIONS: TabActionConfig[] = [
  {
    id: 'add',
    label: '新增',
    icon: Plus,
    variant: 'default',
    shortcut: 'Ctrl+N'
  },
  {
    id: 'refresh',
    label: '刷新',
    icon: RefreshCw,
    variant: 'outline',
    shortcut: 'F5'
  },
  {
    id: 'export',
    label: '导出',
    icon: Download,
    variant: 'outline'
  },
  {
    id: 'import',
    label: '导入',
    icon: Upload,
    variant: 'outline'
  }
];

// ============================================================================
// 子组件
// ============================================================================

/**
 * 标签项组件
 */
interface TabItemProps {
  config: TabConfig;
  isActive: boolean;
  onClick: () => void;
}

const TabItem: React.FC<TabItemProps> = ({ config, isActive, onClick }) => {
  return (
    <TabsTrigger
      value={config.id}
      onClick={onClick}
      className={`
        relative flex items-center gap-2 px-4 py-2 text-sm font-medium
        transition-all duration-200 ease-in-out
        hover:bg-gray-50 dark:hover:bg-gray-800
        data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900
        data-[state=active]:shadow-sm
        data-[state=active]:border-b-2 data-[state=active]:border-blue-500
      `}
    >
      {/* 图标 */}
      <span className="text-base">{config.icon}</span>
      
      {/* 标签文本 */}
      <span>{config.label}</span>
      
      {/* 计数徽章 */}
      {config.count !== undefined && config.count > 0 && (
        <Badge
          variant="secondary"
          className={`
            ml-1 h-5 min-w-[20px] text-xs
            ${isActive ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : ''}
          `}
        >
          {config.count > 999 ? '999+' : config.count}
        </Badge>
      )}
      
      {/* 活跃指示器 */}
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </TabsTrigger>
  );
};

/**
 * 操作按钮组件
 */
interface ActionButtonProps {
  action: TabActionConfig;
  onClick: (actionId: string) => void;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ action, onClick, disabled }) => {
  const Icon = action.icon;
  
  return (
    <Button
      variant={action.variant || 'outline'}
      size="sm"
      onClick={() => onClick(action.id)}
      disabled={disabled}
      className="flex items-center gap-2"
      title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{action.label}</span>
    </Button>
  );
};

/**
 * 更多操作菜单组件
 */
interface MoreActionsMenuProps {
  actions: TabActionConfig[];
  onActionClick: (actionId: string) => void;
  disabled?: boolean;
}

const MoreActionsMenu: React.FC<MoreActionsMenuProps> = ({ actions, onActionClick, disabled }) => {
  if (actions.length === 0) return null;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <React.Fragment key={action.id}>
              <DropdownMenuItem
                onClick={() => onActionClick(action.id)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                <span>{action.label}</span>
                {action.shortcut && (
                  <span className="ml-auto text-xs text-gray-500">
                    {action.shortcut}
                  </span>
                )}
              </DropdownMenuItem>
              {index < actions.length - 1 && action.separator && (
                <DropdownMenuSeparator />
              )}
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ============================================================================
// 主组件
// ============================================================================

/**
 * 顶部标签导航组件
 */
export const TopTabNavigation: React.FC<TopTabNavigationProps> = ({
  activeTab,
  onTabChange,
  tabConfigs = DEFAULT_TAB_CONFIGS,
  actions = DEFAULT_ACTIONS,
  onActionClick,
  loading = false,
  className = '',
  showSearch = true,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = '搜索...',
  children
}) => {
  // ============================================================================
  // 状态管理
  // ============================================================================
  
  const [searchFocused, setSearchFocused] = useState(false);
  
  // ============================================================================
  // 事件处理
  // ============================================================================
  
  /**
   * 处理标签切换
   */
  const handleTabChange = useCallback((tabId: string) => {
    onTabChange(tabId as ContentTableType);
  }, [onTabChange]);
  
  /**
   * 处理操作点击
   */
  const handleActionClick = useCallback((actionId: string) => {
    onActionClick?.(actionId);
  }, [onActionClick]);
  
  /**
   * 处理搜索变化
   */
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(e.target.value);
  }, [onSearchChange]);
  
  // ============================================================================
  // 计算属性
  // ============================================================================
  
  /**
   * 获取标签配置数组
   */
  const tabConfigArray = Object.values(tabConfigs);
  
  /**
   * 主要操作（显示为按钮）
   */
  const primaryActions = actions.filter(action => !action.secondary).slice(0, 3);
  
  /**
   * 次要操作（显示在更多菜单中）
   */
  const secondaryActions = actions.filter(action => action.secondary || actions.indexOf(action) >= 3);
  
  // ============================================================================
  // 渲染
  // ============================================================================
  
  return (
    <div className={`bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* 导航头部 */}
        <div className="flex items-center justify-between px-6 py-4">
          {/* 左侧：标签列表 */}
          <TabsList className="h-auto p-0 bg-transparent">
            {tabConfigArray.map((config) => (
              <TabItem
                key={config.id}
                config={config}
                isActive={activeTab === config.id}
                onClick={() => handleTabChange(config.id)}
              />
            ))}
          </TabsList>
          
          {/* 右侧：搜索和操作 */}
          <div className="flex items-center gap-3">
            {/* 搜索框 */}
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={handleSearchChange}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder={searchPlaceholder}
                  className={`
                    pl-10 pr-4 py-2 w-64 text-sm
                    border border-gray-300 dark:border-gray-600
                    rounded-md bg-white dark:bg-gray-800
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200
                    ${searchFocused ? 'w-80' : 'w-64'}
                  `}
                />
              </div>
            )}
            
            {/* 主要操作按钮 */}
            <div className="flex items-center gap-2">
              {primaryActions.map((action) => (
                <ActionButton
                  key={action.id}
                  action={action}
                  onClick={handleActionClick}
                  disabled={loading}
                />
              ))}
              
              {/* 更多操作菜单 */}
              <MoreActionsMenu
                actions={secondaryActions}
                onActionClick={handleActionClick}
                disabled={loading}
              />
            </div>
          </div>
        </div>
        
        {/* 标签内容区域 */}
        <div className="px-6 pb-4">
          {tabConfigArray.map((config) => (
            <TabsContent key={config.id} value={config.id} className="mt-0">
              {/* 标签描述 */}
              {config.description && (
                <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  {config.description}
                </div>
              )}
              
              {/* 自定义内容 */}
              {children}
            </TabsContent>
          ))}
        </div>
      </Tabs>
      
      {/* 加载状态指示器 */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 h-1 bg-blue-500"
          >
            <motion.div
              className="h-full bg-blue-600"
              animate={{ x: ['-100%', '100%'] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: 'easeInOut'
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// 导出
// ============================================================================

export default TopTabNavigation;

// 导出类型
export type { TopTabNavigationProps, TabConfig, TabActionConfig };