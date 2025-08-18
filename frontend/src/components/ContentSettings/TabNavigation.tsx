/**
 * 信息管理系统标签页导航组件
 * 提供不同内容表之间的切换功能
 */

import React, { useState } from 'react';
import { 
  Database, 
  Navigation, 
  Type, 
  Layout, 
  Search,
  Badge,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { ContentTableType } from '../../types/contentSettings';
import { Button, LoadingSpinner } from './BaseComponents';
import { cn } from '../../utils';

// ============================================================================
// 类型定义
// ============================================================================

interface TabItem {
  key: ContentTableType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface TabStats {
  total: number;
  active: number;
  inactive: number;
}

interface TabNavigationProps {
  activeTab: ContentTableType;
  onTabChange: (tab: ContentTableType) => void;
  tabStats?: Record<ContentTableType, TabStats>;
  loading?: boolean;
  children?: React.ReactNode;
  className?: string;
}

// ============================================================================
// 标签页配置
// ============================================================================

/**
 * 获取标签页配置
 */
const getTabConfig = (): TabItem[] => [
  {
    key: ContentTableType.SITE_CONTENT,
    label: '站点内容',
    description: '管理网站的文本内容、图片链接等基础内容',
    icon: <Database className="h-4 w-4" />,
    color: 'blue'
  },
  {
    key: ContentTableType.NAVIGATION_ITEMS,
    label: '导航菜单',
    description: '管理网站的导航菜单项和链接结构',
    icon: <Navigation className="h-4 w-4" />,
    color: 'green'
  },
  {
    key: ContentTableType.UI_TEXT_ELEMENTS,
    label: 'UI文本',
    description: '管理界面中的按钮、标签、提示等文本元素',
    icon: <Type className="h-4 w-4" />,
    color: 'purple'
  },
  {
    key: ContentTableType.PAGE_SECTIONS,
    label: '页面区域',
    description: '管理页面的各个区域和布局组件',
    icon: <Layout className="h-4 w-4" />,
    color: 'orange'
  },
  {
    key: ContentTableType.SEO_METADATA,
    label: 'SEO元数据',
    description: '管理页面的SEO标题、描述、关键词等',
    icon: <Search className="h-4 w-4" />,
    color: 'red'
  }
];

// ============================================================================
// 标签页统计组件
// ============================================================================

interface TabStatsDisplayProps {
  stats: TabStats;
  color: string;
}

/**
 * 标签页统计显示组件
 * 显示每个标签页的数据统计信息
 */
const TabStatsDisplay: React.FC<TabStatsDisplayProps> = ({ stats, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    orange: 'text-orange-600 bg-orange-50 border-orange-200',
    red: 'text-red-600 bg-red-50 border-red-200'
  };

  return (
    <div className="flex items-center space-x-2 text-xs">
      <Badge 
        className={cn(
          'px-2 py-1 rounded-full border',
          colorClasses[color as keyof typeof colorClasses] || colorClasses.blue
        )}
      >
        {stats.total}
      </Badge>
      
      {stats.active !== undefined && (
        <span className="flex items-center space-x-1 text-muted-foreground">
          <CheckCircle className="h-3 w-3" />
          <span>{stats.active}</span>
        </span>
      )}
      
      {stats.inactive !== undefined && stats.inactive > 0 && (
        <span className="flex items-center space-x-1 text-muted-foreground">
          <AlertCircle className="h-3 w-3" />
          <span>{stats.inactive}</span>
        </span>
      )}
    </div>
  );
};

// ============================================================================
// 标签页项组件
// ============================================================================

interface TabItemComponentProps {
  tab: TabItem;
  isActive: boolean;
  onClick: () => void;
  stats?: TabStats;
  loading?: boolean;
}

/**
 * 标签页项组件
 * 渲染单个标签页
 */
const TabItemComponent: React.FC<TabItemComponentProps> = ({
  tab,
  isActive,
  onClick,
  stats,
  loading = false
}) => {
  const colorClasses = {
    blue: {
      active: 'border-blue-500 text-blue-600 bg-blue-50',
      inactive: 'border-transparent text-muted-foreground hover:text-blue-600 hover:border-blue-300'
    },
    green: {
      active: 'border-green-500 text-green-600 bg-green-50',
      inactive: 'border-transparent text-muted-foreground hover:text-green-600 hover:border-green-300'
    },
    purple: {
      active: 'border-purple-500 text-purple-600 bg-purple-50',
      inactive: 'border-transparent text-muted-foreground hover:text-purple-600 hover:border-purple-300'
    },
    orange: {
      active: 'border-orange-500 text-orange-600 bg-orange-50',
      inactive: 'border-transparent text-muted-foreground hover:text-orange-600 hover:border-orange-300'
    },
    red: {
      active: 'border-red-500 text-red-600 bg-red-50',
      inactive: 'border-transparent text-muted-foreground hover:text-red-600 hover:border-red-300'
    }
  };

  const currentColorClass = colorClasses[tab.color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        'relative flex flex-col items-start p-4 border-l-4 transition-all duration-200',
        'hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        isActive ? currentColorClass.active : currentColorClass.inactive,
        loading && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="flex items-center space-x-3 w-full">
        <div className="flex-shrink-0">
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            tab.icon
          )}
        </div>
        
        <div className="flex-1 text-left">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">{tab.label}</h3>
            {stats && (
              <TabStatsDisplay stats={stats} color={tab.color} />
            )}
          </div>
          
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {tab.description}
          </p>
        </div>
      </div>
      
      {/* 活动指示器 */}
      {isActive && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <div className={cn(
            'w-2 h-2 rounded-full',
            `bg-${tab.color}-500`
          )} />
        </div>
      )}
    </button>
  );
};

// ============================================================================
// 标签页内容区域组件
// ============================================================================

interface TabContentProps {
  activeTab: ContentTableType;
  children: React.ReactNode;
  loading?: boolean;
}

/**
 * 标签页内容区域组件
 * 渲染当前活动标签页的内容
 */
const TabContent: React.FC<TabContentProps> = ({ activeTab, children, loading = false }) => {
  const tabConfig = getTabConfig().find(tab => tab.key === activeTab);

  return (
    <div className="flex-1 flex flex-col">
      {/* 内容头部 */}
      <div className="bg-background border-b px-6 py-4">
        <div className="flex items-center space-x-3">
          {tabConfig?.icon}
          <div>
            <h2 className="text-lg font-semibold">{tabConfig?.label}</h2>
            <p className="text-sm text-muted-foreground">{tabConfig?.description}</p>
          </div>
        </div>
      </div>
      
      {/* 内容区域 */}
      <div className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 主标签页导航组件
// ============================================================================

/**
 * 标签页导航组件
 * 提供不同内容表之间的切换功能
 */
export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  tabStats,
  loading = false,
  children,
  className
}) => {
  const [loadingTabs, setLoadingTabs] = useState<Set<ContentTableType>>(new Set());
  const tabConfig = getTabConfig();

  /**
   * 处理标签页切换
   */
  const handleTabChange = async (tabKey: ContentTableType) => {
    if (tabKey === activeTab || loadingTabs.has(tabKey)) {
      return;
    }

    setLoadingTabs(prev => new Set(prev).add(tabKey));
    
    try {
      await onTabChange(tabKey);
    } finally {
      setLoadingTabs(prev => {
        const newSet = new Set(prev);
        newSet.delete(tabKey);
        return newSet;
      });
    }
  };

  /**
   * 获取标签页统计信息
   */
  const getTabStats = (tabKey: ContentTableType): TabStats | undefined => {
    return tabStats?.[tabKey];
  };

  return (
    <div className={cn('flex h-full bg-background', className)}>
      {/* 左侧标签页列表 */}
      <div className="w-80 border-r bg-muted/30">
        <div className="p-4 border-b">
          <h1 className="text-lg font-semibold">信息管理</h1>
          <p className="text-sm text-muted-foreground mt-1">
            管理网站的各类内容和配置信息
          </p>
        </div>
        
        <div className="overflow-y-auto">
          <nav className="space-y-1 p-2">
            {tabConfig.map((tab) => (
              <TabItemComponent
                key={tab.key}
                tab={tab}
                isActive={activeTab === tab.key}
                onClick={() => handleTabChange(tab.key)}
                stats={getTabStats(tab.key)}
                loading={loadingTabs.has(tab.key)}
              />
            ))}
          </nav>
        </div>
        
        {/* 底部操作区域 */}
        <div className="p-4 border-t bg-background">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="w-full"
          >
            刷新数据
          </Button>
        </div>
      </div>
      
      {/* 右侧内容区域 */}
      <TabContent activeTab={activeTab} loading={loading}>
        {children}
      </TabContent>
    </div>
  );
};

// ============================================================================
// 响应式标签页组件
// ============================================================================

interface ResponsiveTabNavigationProps {
  activeTab: ContentTableType;
  onTabChange: (tab: ContentTableType) => void;
  tabStats?: Record<ContentTableType, TabStats>;
  loading?: boolean;
  children?: React.ReactNode;
  className?: string;
  isMobile?: boolean;
}

/**
 * 响应式标签页导航组件
 * 在移动端使用不同的布局
 */
export const ResponsiveTabNavigation: React.FC<ResponsiveTabNavigationProps> = ({
  isMobile = false,
  activeTab,
  onTabChange,
  tabStats,
  loading = false,
  children,
  className
}: ResponsiveTabNavigationProps) => {
  const props = { activeTab, onTabChange, tabStats, loading, children, className };
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const tabConfig = getTabConfig();
  const activeTabConfig = tabConfig.find(tab => tab.key === props.activeTab);

  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        {/* 移动端顶部标签栏 */}
        <div className="bg-background border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              {activeTabConfig?.icon}
              <h1 className="font-semibold">{activeTabConfig?.label}</h1>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              切换
            </Button>
          </div>
          
          {sidebarOpen && (
            <div className="border-t bg-muted/30">
              <div className="grid grid-cols-2 gap-1 p-2">
                {tabConfig.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      props.onTabChange(tab.key);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      'flex items-center space-x-2 p-3 rounded-md text-sm transition-colors',
                      props.activeTab === tab.key
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* 移动端内容区域 */}
        <div className="flex-1 overflow-hidden">
          <TabContent activeTab={props.activeTab} loading={props.loading}>
            {props.children}
          </TabContent>
        </div>
      </div>
    );
  }

  return <TabNavigation {...props} />;
};

export default TabNavigation;