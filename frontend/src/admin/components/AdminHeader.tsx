/**
 * 管理后台头部组件
 * 支持响应式设计，在不同屏幕尺寸下提供优化的布局和交互
 */
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { 
  Bars3Icon, 
  BellIcon, 
  UserCircleIcon, 
  SunIcon, 
  MoonIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';
import { useAppStore } from '../../store';
import { useTheme } from '../../hooks/useTheme';
import { useResponsive } from '../../hooks/useResponsive';
import { cn } from '../../utils';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

/**
 * 用户菜单项
 */
const userNavigation = [
  { name: '个人资料', href: '#' },
  { name: '设置', href: '#' },
  { name: '退出登录', href: '#', action: 'logout' },
];

/**
 * 管理后台头部组件
 */
const AdminHeader = ({ onMenuClick }: AdminHeaderProps) => {
  const { user, setUser } = useAppStore();
  const { currentTheme, switchTheme } = useTheme();
  const theme = currentTheme?.id || 'light';
  const toggleTheme = () => switchTheme(theme === 'dark' ? 'light' : 'dark');
  const responsive = useResponsive();
  const { isMobile, isTablet } = responsive;

  // 响应式配置变量
  const headerHeight = 'h-16';
  const titleSize = isMobile ? 'text-base' : 'text-lg';
  const searchWidth = isMobile ? 'w-32' : isTablet ? 'w-48' : 'w-64';
  const buttonSize = isMobile ? 'p-1.5' : 'p-2';
  const iconSize = isMobile ? 'h-5 w-5' : 'h-5 w-5';
  const avatarSize = isMobile ? 'h-7 w-7' : 'h-8 w-8';

  /**
   * 处理用户菜单点击
   */
  const handleUserMenuClick = (item: typeof userNavigation[0]) => {
    if (item.action === 'logout') {
      // 退出登录
      setUser(null);
      // 这里可以添加更多退出登录的逻辑，比如清除token等
    }
  };

  return (
    <div className={`relative z-10 flex-shrink-0 flex ${headerHeight} shadow-lg border-b transition-colors duration-200 ${
      theme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white/80 backdrop-blur-sm border-gray-200'
    }`}>
      {/* 移动端菜单按钮 */}
      <button
        type="button"
        className={`${isMobile ? 'px-3' : 'px-4'} border-r transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden ${
          theme === 'dark'
            ? 'border-gray-700 text-gray-400 hover:text-gray-300 hover:bg-gray-700'
            : 'border-gray-200 text-gray-500 hover:text-gray-600 hover:bg-gray-50'
        }`}
        onClick={onMenuClick}
      >
        <span className="sr-only">打开侧边栏</span>
        <Bars3Icon className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} aria-hidden="true" />
      </button>

      <div className={`flex-1 ${isMobile ? 'px-2' : 'px-4'} flex justify-between`}>
        {/* 左侧内容 */}
        <div className="flex-1 flex items-center">
          <div className="w-full flex md:ml-0">
            {/* 标题和搜索框 */}
            <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-4'}`}>
              <h1 className={`${titleSize} font-semibold transition-colors duration-200 ${isMobile ? 'truncate' : ''} ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {isMobile ? '管理' : '管理后台'}
              </h1>
              {/* 搜索框 - 在平板及以上显示 */}
              <div className={`${isMobile ? 'hidden' : 'hidden md:block'}`}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className={`${iconSize} ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                    }`} aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    placeholder={isTablet ? '搜索' : '搜索...'}
                    className={`block ${searchWidth} pl-10 pr-3 py-2 border rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧内容 */}
        <div className={`${isMobile ? 'ml-2' : 'ml-4'} flex items-center ${isMobile ? 'space-x-1' : 'space-x-3'} md:ml-6`}>
          {/* 主题切换按钮 */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`${buttonSize} rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                : 'text-gray-500 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="sr-only">切换主题</span>
            {theme === 'dark' ? (
              <SunIcon className={iconSize} aria-hidden="true" />
            ) : (
              <MoonIcon className={iconSize} aria-hidden="true" />
            )}
          </button>

          {/* 通知按钮 */}
          <button
            type="button"
            className={`${buttonSize} rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                : 'text-gray-500 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="sr-only">查看通知</span>
            <BellIcon className={iconSize} aria-hidden="true" />
            {/* 通知小红点 */}
            <span className={`absolute ${isMobile ? 'top-0.5 right-0.5' : 'top-1 right-1'} block ${isMobile ? 'h-1.5 w-1.5' : 'h-2 w-2'} rounded-full bg-red-400 ring-2 ring-white`}></span>
          </button>

          {/* 用户菜单 */}
          <Menu as="div" className={`${isMobile ? 'ml-1' : 'ml-3'} relative`}>
            <div>
              <Menu.Button className={`max-w-xs flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <span className="sr-only">打开用户菜单</span>
                <div className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
                  <UserCircleIcon className={`${avatarSize} ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                  <span className={`${isMobile ? 'hidden' : 'hidden md:block'} text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {(user as any)?.email || '管理员'}
                  </span>
                </div>
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className={`origin-top-right absolute right-0 mt-2 ${isMobile ? 'w-40' : 'w-48'} rounded-lg shadow-lg py-1 ring-1 ring-opacity-5 focus:outline-none transition-colors duration-200 ${
                theme === 'dark'
                  ? 'bg-gray-800 ring-gray-700'
                  : 'bg-white ring-black'
              }`}>
                {userNavigation.map((item) => (
                  <Menu.Item key={item.name}>
                    {({ active }) => (
                      <button
                        onClick={() => handleUserMenuClick(item)}
                        className={cn(
                          `block w-full text-left ${isMobile ? 'px-3 py-2' : 'px-4 py-2'} ${isMobile ? 'text-xs' : 'text-sm'} transition-colors duration-200`,
                          active
                            ? theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                            : '',
                          theme === 'dark'
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        )}
                      >
                        {item.name}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;