/**
 * 管理后台布局组件
 * 支持响应式设计，在不同屏幕尺寸下提供优化的布局体验
 */
import { Outlet, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AdminSidebar from '../admin/components/AdminSidebar';
import AdminHeader from '../admin/components/AdminHeader';
import { useAppStore } from '../store';
import { useTheme, useResponsive } from '../hooks/useTheme';

/**
 * 管理后台布局组件
 */
const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAppStore();
  const { currentTheme } = useTheme();
  const responsive = useResponsive();
  const { isMobile, isTablet, isDesktop } = responsive;

  // 响应式配置变量
  const contentPadding = isMobile ? 'py-4' : 'py-6';
  const containerPadding = isMobile ? 'px-3 sm:px-4' : 'px-4 sm:px-6 md:px-8';
  const cardPadding = isMobile ? 'p-4' : 'p-6';
  const cardRadius = isMobile ? 'rounded-lg' : 'rounded-xl';

  // 应用主题到body
  useEffect(() => {
    document.body.className = currentTheme?.colors?.background === '#000000' ? 'dark' : '';
  }, [currentTheme]);

  // 检查用户是否已登录
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className={`h-screen flex overflow-hidden transition-colors duration-200 ${
      currentTheme?.colors?.background === '#000000' 
        ? 'bg-gray-900 text-white' 
        : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900'
    }`}>
      {/* 侧边栏 */}
      <AdminSidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* 主内容区域 */}
      <div className={`flex flex-col w-0 flex-1 overflow-hidden ${
        isDesktop ? 'md:ml-64' : isTablet ? 'md:ml-56' : ''
      }`}>
        {/* 顶部导航 */}
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        
        {/* 页面内容 */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className={contentPadding}>
            <div className={`max-w-7xl mx-auto ${containerPadding}`}>
              {/* 内容容器 */}
              <div className={`${cardRadius} shadow-sm border transition-colors duration-200 ${
                currentTheme?.colors?.background === '#000000'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}>
                <div className={cardPadding}>
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;