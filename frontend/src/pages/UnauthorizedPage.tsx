/**
 * 无权限访问页面组件
 * 当用户没有权限访问某个页面或功能时显示
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';

/**
 * 页面状态接口
 */
interface LocationState {
  from?: string;
  reason?: string;
  requiredRole?: string;
  requiredPermission?: string;
}

/**
 * 无权限页面组件
 */
const UnauthorizedPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { userPermissions } = usePermissions();

  const state = location.state as LocationState || {};
  const { from, reason, requiredRole, requiredPermission } = state;

  /**
   * 返回上一页
   */
  const handleGoBack = () => {
    if (from) {
      navigate(from, { replace: true });
    } else {
      navigate(-1);
    }
  };

  /**
   * 返回首页
   */
  const handleGoHome = () => {
    if (user) {
      // 导航到管理员首页
      navigate('/admin/dashboard', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  /**
   * 重新登录
   */
  const handleReLogin = async () => {
    await logout();
    navigate('/admin/login', { 
      state: { from: from || location.pathname },
      replace: true 
    });
  };

  /**
   * 联系管理员
   */
  const handleContactAdmin = () => {
    // 这里可以集成邮件系统或工单系统
    const subject = encodeURIComponent('权限申请');
    const body = encodeURIComponent(
      `用户: ${user?.email || '未知'}\n` +
      `请求访问: ${from || location.pathname}\n` +
      `需要权限: ${requiredPermission || requiredRole || '未知'}\n` +
      `申请原因: `
    );
    
    // 打开邮件客户端（可以替换为实际的管理员邮箱）
    window.location.href = `mailto:admin@yourcompany.com?subject=${subject}&body=${body}`;
  };

  /**
   * 获取错误图标
   */
  const getErrorIcon = () => {
    return (
      <svg 
        className="w-24 h-24 text-red-400 mx-auto mb-6" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
        />
      </svg>
    );
  };

  /**
   * 获取主要错误信息
   */
  const getMainMessage = () => {
    if (!user) {
      return '需要登录才能访问此页面';
    }
    
    if (reason) {
      return reason;
    }
    
    if (requiredRole) {
      return `此功能需要 ${requiredRole} 角色权限`;
    }
    
    if (requiredPermission) {
      return `此功能需要 ${requiredPermission} 权限`;
    }
    
    return '您没有权限访问此页面';
  };

  /**
   * 获取详细信息
   */
  const getDetailMessage = () => {
    if (!user) {
      return '请先登录您的账户，然后重试。';
    }
    
    return (
      <div className="space-y-2 text-sm text-gray-600">
        <p>当前用户: {user.email}</p>
        <p>用户邮箱: {user.email}</p>
        {from && <p>请求访问: {from}</p>}
        {userPermissions && (
          <p>当前权限数量: {userPermissions.role.permissions.length}</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* 错误图标 */}
          {getErrorIcon()}
          
          {/* 主要错误信息 */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              访问被拒绝
            </h2>
            
            <p className="text-lg text-red-600 mb-6">
              {getMainMessage()}
            </p>
            
            {/* 详细信息 */}
            <div className="mb-8">
              {getDetailMessage()}
            </div>
            
            {/* 操作按钮 */}
            <div className="space-y-4">
              {/* 主要操作 */}
              <div className="flex flex-col sm:flex-row gap-3">
                {!user ? (
                  <button
                    onClick={() => navigate('/admin/login', { 
                      state: { from: from || location.pathname } 
                    })}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    立即登录
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleGoHome}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      返回首页
                    </button>
                    
                    <button
                      onClick={handleReLogin}
                      className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      重新登录
                    </button>
                  </>
                )}
              </div>
              
              {/* 次要操作 */}
              <div className="flex flex-col sm:flex-row gap-3">
                {from && (
                  <button
                    onClick={handleGoBack}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    返回上页
                  </button>
                )}
                
                {user && (
                  <button
                    onClick={handleContactAdmin}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    申请权限
                  </button>
                )}
              </div>
            </div>
            
            {/* 帮助信息 */}
            <div className="mt-8 p-4 bg-gray-50 rounded-md">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                需要帮助？
              </h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• 如果您认为这是一个错误，请联系系统管理员</p>
                <p>• 确保您使用的是正确的账户登录</p>
                <p>• 某些功能可能需要特定的角色权限</p>
                {user && (
                  <p>• 查看员角色只能查看内容，不能进行编辑操作</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 页脚信息 */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          错误代码: 403 | 访问被拒绝
          {from && ` | 来源: ${from}`}
        </p>
      </div>
    </div>
  );
};

export default UnauthorizedPage;

/**
 * 简化版无权限组件（用于嵌入其他页面）
 */
export const UnauthorizedMessage: React.FC<{
  message?: string;
  showActions?: boolean;
  className?: string;
}> = ({ 
  message = '您没有权限执行此操作', 
  showActions = true,
  className = '' 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className={`text-center p-6 ${className}`}>
      <div className="w-16 h-16 mx-auto mb-4 text-red-400">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
          />
        </svg>
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        访问受限
      </h3>
      
      <p className="text-gray-600 mb-4">{message}</p>
      
      {showActions && (
        <div className="space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            返回
          </button>
          
          {user && (
            <button
              onClick={() => {
                const subject = encodeURIComponent('权限申请');
                const body = encodeURIComponent(
                  `用户: ${user.email}\n申请原因: `
                );
                window.location.href = `mailto:admin@yourcompany.com?subject=${subject}&body=${body}`;
              }}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              申请权限
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * 权限不足提示组件（用于操作按钮等）
 */
export const PermissionDeniedTooltip: React.FC<{
  children: React.ReactNode;
  message?: string;
  requiredPermission?: string;
}> = ({ 
  children, 
  message = '权限不足',
  requiredPermission 
}) => {
  const tooltipMessage = requiredPermission 
    ? `${message}，需要权限: ${requiredPermission}`
    : message;

  return (
    <div className="relative group">
      <div className="opacity-50 cursor-not-allowed">
        {children}
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        {tooltipMessage}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};