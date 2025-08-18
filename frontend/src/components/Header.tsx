/**
 * 网站头部组件
 */
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '../utils';
import { useResponsive } from '../hooks/useResponsive';

/**
 * 导航菜单项
 */
const navigation = [
  { name: '首页', href: '/' },
  { name: '课程', href: '/courses' },
  { name: '师资', href: '/teachers' },
  { name: '学员案例', href: '/student-cases' },
  { name: '文章', href: '/articles' },
  { name: '关于我们', href: '/about' },
  { name: '联系我们', href: '/contact' },
];

/**
 * 网站头部组件
 */
const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isMobile } = useResponsive();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  /**
   * 检查当前路径是否激活
   */
  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };



  /**
   * 处理触摸开始事件
   */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  /**
   * 处理触摸移动事件 - 支持滑动关闭菜单
   */
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!mobileMenuOpen) return;

    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    // 检测向右滑动手势（关闭菜单）
    if (deltaX > 50 && Math.abs(deltaY) < 100) {
      setMobileMenuOpen(false);
    }
  };

  /**
   * 处理点击外部区域关闭菜单
   */
  const handleClickOutside = (e: React.MouseEvent) => {
    if (mobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
      setMobileMenuOpen(false);
    }
  };

  // 监听ESC键关闭菜单
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [mobileMenuOpen]);

  // 防止移动端菜单打开时页面滚动
  useEffect(() => {
    if (mobileMenuOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen, isMobile]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between border-b border-indigo-500 py-6 lg:border-none">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">
                {import.meta.env.VITE_APP_TITLE || '教育平台'}
              </span>
            </Link>
          </div>

          {/* 桌面端导航 */}
          <div className="ml-10 hidden space-x-8 lg:block">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'text-base font-medium transition-colors duration-200',
                  isActive(item.href)
                    ? 'text-primary-600 border-b-2 border-primary-600 pb-1'
                    : 'text-gray-700 hover:text-primary-600'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* 移动端菜单按钮 */}
          <div className="ml-10 space-x-4 lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">打开主菜单</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* 移动端导航 */}
        {mobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
            onClick={handleClickOutside}
          >
            <div 
              ref={mobileMenuRef}
              className={cn(
                "absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ease-in-out",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
              )}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 菜单头部 */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">菜单</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                  aria-label="关闭菜单"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {/* 菜单内容 */}
              <div className="px-4 py-6 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200',
                      isActive(item.href)
                        ? 'text-primary-600 bg-primary-50 border-l-4 border-primary-600'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50 active:bg-gray-100'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              
              {/* 滑动提示 */}
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="text-sm text-gray-400">向右滑动关闭菜单</p>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;