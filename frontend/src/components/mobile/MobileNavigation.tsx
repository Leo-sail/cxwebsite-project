/**
 * 移动端导航组件
 * 提供移动端友好的导航体验，包括底部导航栏和侧滑菜单
 */
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils';
import { TouchableArea } from './TouchableArea';
import { useResponsive } from '../../hooks/useResponsive';
import { hapticFeedback } from '../../utils/touchGestures';
import {
  HomeIcon,
  AcademicCapIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PhoneIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

/**
 * 导航项接口
 */
interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavigationItem[];
}

/**
 * 默认导航配置
 */
const defaultNavItems: NavigationItem[] = [
  {
    id: 'home',
    label: '首页',
    path: '/',
    icon: HomeIcon
  },
  {
    id: 'courses',
    label: '课程',
    path: '/courses',
    icon: AcademicCapIcon
  },
  {
    id: 'teachers',
    label: '师资',
    path: '/teachers',
    icon: UserGroupIcon
  },
  {
    id: 'articles',
    label: '文章',
    path: '/articles',
    icon: DocumentTextIcon
  },
  {
    id: 'contact',
    label: '联系',
    path: '/contact',
    icon: PhoneIcon
  }
];

/**
 * 底部导航栏属性接口
 */
interface BottomNavigationProps {
  items?: NavigationItem[];
  className?: string;
  activeColor?: string;
  inactiveColor?: string;
  backgroundColor?: string;
  showLabels?: boolean;
  maxItems?: number;
}

/**
 * 底部导航栏组件
 */
export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items = defaultNavItems,
  className,
  activeColor = 'text-blue-600',
  inactiveColor = 'text-gray-500',
  backgroundColor = 'bg-white',
  showLabels = true,
  maxItems = 5
}) => {
  const location = useLocation();
  const { isMobile } = useResponsive();
  
  // 限制显示的导航项数量
  const visibleItems = items.slice(0, maxItems);
  const hasMoreItems = items.length > maxItems;
  
  // 检查当前路径是否匹配
  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };
  
  // 处理导航点击
  const handleNavClick = (item: NavigationItem) => {
    if (isMobile) {
      hapticFeedback.light();
    }
    // 可以在这里添加额外的导航逻辑
    console.log('Navigation clicked:', item.label);
  };
  
  if (!isMobile) {
    return null;
  }
  
  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 z-50',
      'border-t border-gray-200',
      'safe-area-pb', // 适配iPhone底部安全区域
      backgroundColor,
      className
    )}>
      <div className="flex items-center justify-around px-2 py-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <TouchableArea
              key={item.id}
              onTap={() => handleNavClick(item)}
              className="flex-1 max-w-[80px]"
              hapticEnabled
              minTouchTarget={44}
            >
              <Link
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center',
                  'py-2 px-1 min-h-[44px]',
                  'transition-colors duration-200',
                  active ? activeColor : inactiveColor
                )}
              >
                <div className="relative">
                  <Icon className="w-6 h-6" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                      {item.badge}
                    </span>
                  )}
                </div>
                {showLabels && (
                  <span className="text-xs mt-1 leading-none">
                    {item.label}
                  </span>
                )}
              </Link>
            </TouchableArea>
          );
        })}
        
        {/* 更多菜单按钮 */}
        {hasMoreItems && (
          <TouchableArea
            className="flex-1 max-w-[80px]"
            hapticEnabled
            minTouchTarget={44}
          >
            <button className={cn(
              'flex flex-col items-center justify-center',
              'py-2 px-1 min-h-[44px] w-full',
              'transition-colors duration-200',
              inactiveColor
            )}>
              <Bars3Icon className="w-6 h-6" />
              {showLabels && (
                <span className="text-xs mt-1 leading-none">
                  更多
                </span>
              )}
            </button>
          </TouchableArea>
        )}
      </div>
    </nav>
  );
};

/**
 * 侧滑菜单属性接口
 */
interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items?: NavigationItem[];
  className?: string;
  overlayClassName?: string;
  menuClassName?: string;
  position?: 'left' | 'right';
  width?: string;
}

/**
 * 侧滑菜单组件
 */
export const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onClose,
  items = defaultNavItems,
  className,
  overlayClassName,
  menuClassName,
  position = 'left',
  width = '280px'
}) => {
  const location = useLocation();
  const { isMobile } = useResponsive();
  const menuRef = useRef<HTMLDivElement>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  // 检查当前路径是否匹配
  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };
  
  // 切换子菜单展开状态
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
    
    if (isMobile) {
      hapticFeedback.light();
    }
  };
  
  // 处理菜单项点击
  const handleItemClick = (item: NavigationItem) => {
    if (item.children && item.children.length > 0) {
      toggleExpanded(item.id);
    } else {
      onClose();
      if (isMobile) {
        hapticFeedback.light();
      }
    }
  };
  
  // 处理遮罩点击
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  
  // 渲染菜单项
  const renderMenuItem = (item: NavigationItem, level = 0) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    
    return (
      <div key={item.id}>
        <TouchableArea
          onTap={() => handleItemClick(item)}
          hapticEnabled
          minTouchTarget={44}
        >
          {hasChildren ? (
            <button
              className={cn(
                'flex items-center justify-between w-full',
                'px-4 py-3 text-left',
                'hover:bg-gray-50 transition-colors duration-200',
                active && 'bg-blue-50 text-blue-600 border-r-2 border-blue-600',
                level > 0 && 'pl-8'
              )}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {item.badge}
                  </span>
                )}
              </div>
              <ChevronRightIcon 
                className={cn(
                  'w-4 h-4 transition-transform duration-200',
                  isExpanded && 'rotate-90'
                )}
              />
            </button>
          ) : (
            <Link
              to={item.path}
              className={cn(
                'flex items-center space-x-3',
                'px-4 py-3 block',
                'hover:bg-gray-50 transition-colors duration-200',
                active && 'bg-blue-50 text-blue-600 border-r-2 border-blue-600',
                level > 0 && 'pl-8'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                  {item.badge}
                </span>
              )}
            </Link>
          )}
        </TouchableArea>
        
        {/* 子菜单 */}
        {hasChildren && isExpanded && (
          <div className="bg-gray-50">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };
  
  if (!isOpen) {
    return null;
  }
  
  return (
    <div className={cn('fixed inset-0 z-50', className)}>
      {/* 遮罩层 */}
      <div
        className={cn(
          'absolute inset-0 bg-black bg-opacity-50',
          'transition-opacity duration-300',
          overlayClassName
        )}
        onClick={handleOverlayClick}
      />
      
      {/* 菜单内容 */}
      <div
        ref={menuRef}
        className={cn(
          'absolute top-0 h-full bg-white shadow-xl',
          'transform transition-transform duration-300 ease-out',
          'overflow-y-auto',
          position === 'left' ? 'left-0' : 'right-0',
          menuClassName
        )}
        style={{ width }}
      >
        {/* 菜单头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">菜单</h2>
          <TouchableArea
            onTap={onClose}
            hapticEnabled
            minTouchTarget={44}
          >
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </TouchableArea>
        </div>
        
        {/* 菜单项列表 */}
        <div className="py-2">
          {items.map(item => renderMenuItem(item))}
        </div>
      </div>
    </div>
  );
};

/**
 * 移动端导航控制器属性接口
 */
interface MobileNavigationProps {
  showBottomNav?: boolean;
  bottomNavItems?: NavigationItem[];
  sideMenuItems?: NavigationItem[];
  className?: string;
}

/**
 * 移动端导航控制器组件
 */
export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  showBottomNav = true,
  bottomNavItems,
  sideMenuItems,
  className
}) => {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const { isMobile } = useResponsive();
  
  const openSideMenu = () => {
    setIsSideMenuOpen(true);
    if (isMobile) {
      hapticFeedback.medium();
    }
  };
  
  const closeSideMenu = () => {
    setIsSideMenuOpen(false);
  };
  
  if (!isMobile) {
    return null;
  }
  
  return (
    <div className={className}>
      {/* 底部导航栏 */}
      {showBottomNav && (
        <BottomNavigation items={bottomNavItems} />
      )}
      
      {/* 侧滑菜单 */}
      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={closeSideMenu}
        items={sideMenuItems}
      />
      
      {/* 全局菜单触发器（可选） */}
      <div className="fixed top-4 right-4 z-40">
        <TouchableArea
          onTap={openSideMenu}
          hapticEnabled
          minTouchTarget={44}
        >
          <button className="p-3 bg-white rounded-full shadow-lg border border-gray-200">
            <Bars3Icon className="w-6 h-6 text-gray-700" />
          </button>
        </TouchableArea>
      </div>
    </div>
  );
};

export default MobileNavigation;