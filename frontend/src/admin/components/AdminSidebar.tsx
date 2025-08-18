/**
 * 管理后台侧边栏组件
 * 支持响应式设计，在移动端和桌面端提供不同的交互体验
 */
import { Fragment, useEffect, useRef, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Link, useLocation } from 'react-router-dom';
import {
  XMarkIcon,
  HomeIcon,
  AcademicCapIcon,
  UserGroupIcon,
  DocumentTextIcon,
  NewspaperIcon,
  CogIcon,
  PhotoIcon,
  PencilSquareIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '../../hooks/useTheme';
import { useResponsive } from '../../hooks/useResponsive';
import { cn } from '../../utils';
import { ADMIN_ROUTES } from '../../utils/routes';

/**
 * 导航菜单项
 * 使用路径常量确保与路由配置一致
 * 注意：已删除页面配置、主题管理、样式配置、UI配置管理、权限演示菜单项
 */
const navigation = [
  { name: '仪表板', href: ADMIN_ROUTES.DASHBOARD, icon: HomeIcon },
  { name: '课程管理', href: ADMIN_ROUTES.COURSES, icon: AcademicCapIcon },
  { name: '师资管理', href: ADMIN_ROUTES.TEACHERS, icon: UserGroupIcon },
  { name: '学员案例', href: ADMIN_ROUTES.STUDENT_CASES, icon: DocumentTextIcon },
  { name: '文章管理', href: ADMIN_ROUTES.ARTICLES, icon: NewspaperIcon },
  { name: '联系管理', href: ADMIN_ROUTES.CONTACT_MANAGEMENT, icon: EnvelopeIcon },
  { name: '信息管理', href: ADMIN_ROUTES.CONTENT_SETTINGS, icon: PencilSquareIcon },
  { name: '媒体文件', href: ADMIN_ROUTES.MEDIA_FILES, icon: PhotoIcon },
  { name: '权限配置', href: ADMIN_ROUTES.PERMISSION_CONFIG, icon: CogIcon },
  // 已删除的菜单项（可通过直接URL访问）：
  // { name: '页面配置', href: ADMIN_ROUTES.PAGE_CONFIGS, icon: CogIcon },
  // { name: '主题管理', href: ADMIN_ROUTES.THEME_MANAGEMENT, icon: SwatchIcon },
  // { name: '样式配置', href: ADMIN_ROUTES.STYLE_CONFIGURATION, icon: PaintBrushIcon },
  // { name: 'UI配置管理', href: ADMIN_ROUTES.UI_CONFIG_MANAGER, icon: CogIcon },
  // { name: '权限演示', href: ADMIN_ROUTES.PERMISSION_DEMO, icon: ShieldCheckIcon },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

/**
 * 管理后台侧边栏组件
 */
const AdminSidebar = ({ open, onClose }: AdminSidebarProps) => {
  const location = useLocation();
  const { currentTheme } = useTheme();
  const responsive = useResponsive();
  const { isMobile, isTablet } = responsive;
  const sidebarRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  // 响应式配置变量
  const logoHeight = isMobile ? 'h-14' : 'h-16';
  const logoTextSize = isMobile ? 'text-lg' : 'text-xl';
  const logoIconSize = isMobile ? 'w-7 h-7' : 'w-8 h-8';
  const navPadding = isMobile ? 'px-2 py-3' : 'px-3 py-4';
  const navItemPadding = isMobile ? 'px-2 py-2.5' : 'px-3 py-3';
  const navTextSize = isMobile ? 'text-xs' : 'text-sm';
  const iconSize = isMobile ? 'h-4 w-4' : 'h-5 w-5';
  const sidebarWidth = isMobile ? 'max-w-xs' : isTablet ? 'max-w-sm' : 'w-64';

  /**
   * 检查当前路径是否激活
   */
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  /**
   * 处理触摸开始事件
   */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  /**
   * 处理触摸移动事件 - 支持滑动关闭侧边栏
   */
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!open) return;

    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    // 检测向左滑动手势（关闭侧边栏）
    if (deltaX < -50 && Math.abs(deltaY) < 100) {
      onClose();
    }
  };

  // 监听ESC键关闭侧边栏
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [open, onClose]);

  // 防止移动端侧边栏打开时页面滚动
  useEffect(() => {
    if (open && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open, isMobile]);

  /**
   * 判断是否为深色主题
   */
  const isDarkTheme = useMemo(() => {
    if (!currentTheme?.colors?.background) return false;
    // 通过背景色判断是否为深色主题
    const bgColor = currentTheme.colors.background;
    // 如果背景色包含深色关键词或者是深色值
    return bgColor.includes('gray-') || bgColor.includes('slate-') || 
           bgColor.includes('zinc-') || bgColor.includes('neutral-') ||
           bgColor.includes('stone-') || bgColor === '#000000' ||
           (bgColor.startsWith('#') && parseInt(bgColor.slice(1), 16) < 0x808080);
  }, [currentTheme]);

  /**
   * 侧边栏内容
   */
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center ${logoHeight} flex-shrink-0 px-4 transition-colors duration-200 ${
        isDarkTheme
          ? 'bg-gradient-to-r from-blue-800 to-blue-900'
          : 'bg-gradient-to-r from-blue-600 to-blue-700'
      }`}>
        <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
          <div className={`${logoIconSize} bg-white rounded-lg flex items-center justify-center`}>
            <span className={`text-blue-600 font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>M</span>
          </div>
          <span className={`${logoTextSize} font-bold text-white ${isMobile ? 'truncate' : ''}`}>
            {isMobile ? '管理' : '管理后台'}
          </span>
        </div>
      </div>

      {/* 导航菜单 */}
      <div className={`flex-1 flex flex-col overflow-y-auto transition-colors duration-200 ${
        isDarkTheme
          ? 'bg-gray-800'
          : 'bg-gradient-to-b from-blue-700 to-blue-800'
      }`}>
        <nav className={`flex-1 ${navPadding} ${isMobile ? 'space-y-1' : 'space-y-2'}`}>
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  `group flex items-center ${navItemPadding} ${navTextSize} font-medium rounded-xl transition-all duration-200 relative overflow-hidden`,
                  active
                    ? isDarkTheme
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                    : isDarkTheme
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                )}
                onClick={() => onClose()}
              >
                {/* 激活状态指示器 */}
                {active && (
                  <div className={`absolute left-0 top-0 bottom-0 ${isMobile ? 'w-0.5' : 'w-1'} bg-blue-400 rounded-r-full`} />
                )}
                
                <Icon
                  className={cn(
                    `${isMobile ? 'mr-2' : 'mr-3'} flex-shrink-0 ${iconSize} transition-colors duration-200`,
                    active
                      ? 'text-blue-200'
                      : isDarkTheme
                        ? 'text-gray-400 group-hover:text-gray-300'
                        : 'text-blue-200 group-hover:text-blue-100'
                  )}
                  aria-hidden="true"
                />
                <span className={`truncate ${isMobile ? 'text-xs' : ''}`}>{item.name}</span>
                
                {/* 悬停效果 */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />
              </Link>
            );
          })}
        </nav>
        
        {/* 底部装饰 */}
        <div className={`${isMobile ? 'p-3' : 'p-4'} border-t transition-colors duration-200 ${
          isDarkTheme
            ? 'border-gray-700'
            : 'border-blue-600/30'
        }`}>
          {/* 移动端滑动提示 */}
          {isMobile && (
            <div className={`${isMobile ? 'text-2xs' : 'text-xs'} text-center mb-2 transition-colors duration-200 ${
              isDarkTheme ? 'text-gray-500' : 'text-blue-300'
            }`}>
              向左滑动关闭菜单
            </div>
          )}
          <div className={`${isMobile ? 'text-2xs' : 'text-xs'} text-center transition-colors duration-200 ${
            isDarkTheme ? 'text-gray-400' : 'text-blue-200'
          }`}>
            © 2024 管理系统
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 移动端侧边栏 */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40 md:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 flex z-40">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel 
                ref={sidebarRef}
                className={`relative flex-1 flex flex-col ${sidebarWidth} w-full transition-colors duration-200 ${
                  isDarkTheme ? 'bg-gray-800' : 'bg-blue-800'
                }`}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
              >
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className={`absolute top-0 right-0 ${isMobile ? '-mr-10' : '-mr-12'} ${isMobile ? 'pt-1' : 'pt-2'}`}>
                    <button
                      type="button"
                      className={`ml-1 flex items-center justify-center ${isMobile ? 'h-8 w-8' : 'h-10 w-10'} rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-all duration-200 hover:bg-white/10`}
                      onClick={onClose}
                    >
                      <span className="sr-only">关闭侧边栏</span>
                      <XMarkIcon className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-white`} aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
            <div className="flex-shrink-0 w-14">
              {/* 强制侧边栏缩小以适应关闭图标 */}
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* 桌面端侧边栏 */}
      <div className={`hidden md:flex ${isTablet ? 'md:w-56' : 'md:w-64'} lg:w-64 md:flex-col md:fixed md:inset-y-0`}>
        <div className={`flex-1 flex flex-col min-h-0 transition-colors duration-200 ${
          isDarkTheme ? 'bg-gray-800' : 'bg-blue-800'
        }`}>
          <SidebarContent />
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;