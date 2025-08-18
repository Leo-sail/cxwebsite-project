/**
 * 路由权限保护组件
 * 用于保护需要权限验证的路由
 */

import React, { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePagePermission, usePermissions } from '../hooks/usePermissions';
import { LoadingComponent } from './PermissionGuard';
import type {
  ResourceType,
  PermissionAction,
  PermissionCheckOptions
} from '../types/permission';

/**
 * 受保护路由组件属性
 */
interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRoles?: string | string[];
  resource?: ResourceType;
  action?: PermissionAction;
  redirectTo?: string;
  loginRedirect?: string;
  unauthorizedRedirect?: string;
  fallback?: ReactNode;
  showLoadingSpinner?: boolean;
  options?: PermissionCheckOptions;
}

/**
 * 受保护路由组件
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredRoles,
  resource,
  action,
  redirectTo,
  loginRedirect = '/admin/login',
  unauthorizedRedirect = '/admin/unauthorized',
  fallback,
  showLoadingSpinner = true,
  options
}) => {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { userPermissions, isLoading: permissionLoading } = usePermissions(options);
  const { allowed: pageAllowed, isLoading: pagePermissionLoading } = usePagePermission(
    location.pathname,
    options
  );

  const isLoading = authLoading || permissionLoading || pagePermissionLoading;

  // 显示加载状态
  if (isLoading) {
    if (showLoadingSpinner) {
      return fallback || <LoadingComponent />;
    }
    return null;
  }

  // 检查是否需要认证
  if (requireAuth && !user) {
    return (
      <Navigate 
        to={loginRedirect} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // 检查角色权限
  if (requiredRoles && user) {
    const userRole = (user as any).role;
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    if (!roles.includes(userRole)) {
      return (
        <Navigate 
          to={unauthorizedRedirect} 
          state={{ 
            from: location.pathname,
            reason: `需要角色: ${roles.join(' 或 ')}，当前角色: ${userRole}`
          }} 
          replace 
        />
      );
    }
  }

  // 检查资源权限
  if (resource && action && userPermissions) {
    const { hasPermission } = usePermissions(options);
    const permissionResult = hasPermission(resource, action);
    
    if (!permissionResult.allowed) {
      return (
        <Navigate 
          to={unauthorizedRedirect} 
          state={{ 
            from: location.pathname,
            reason: permissionResult.reason
          }} 
          replace 
        />
      );
    }
  }

  // 检查页面权限
  if (!pageAllowed) {
    return (
      <Navigate 
        to={redirectTo || unauthorizedRedirect} 
        state={{ 
          from: location.pathname,
          reason: '没有访问此页面的权限'
        }} 
        replace 
      />
    );
  }

  // 权限验证通过，渲染子组件
  return <>{children}</>;
};

/**
 * 管理员路由保护组件
 */
export const AdminRoute: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback
}) => {
  return (
    <ProtectedRoute
      requireAuth={true}
      requiredRoles={['super_admin', 'admin', 'editor', 'viewer']}
      loginRedirect="/admin/login"
      unauthorizedRedirect="/admin/unauthorized"
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
};

/**
 * 超级管理员路由保护组件
 */
export const SuperAdminRoute: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback
}) => {
  return (
    <ProtectedRoute
      requireAuth={true}
      requiredRoles="super_admin"
      loginRedirect="/admin/login"
      unauthorizedRedirect="/admin/unauthorized"
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
};

/**
 * 编辑员路由保护组件
 */
export const EditorRoute: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback
}) => {
  return (
    <ProtectedRoute
      requireAuth={true}
      requiredRoles={['super_admin', 'admin', 'editor']}
      loginRedirect="/admin/login"
      unauthorizedRedirect="/admin/unauthorized"
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
};

/**
 * 公共路由组件（不需要权限）
 */
export const PublicRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

/**
 * 访客路由组件（只有未登录用户可以访问）
 */
export const GuestRoute: React.FC<{ 
  children: ReactNode; 
  redirectTo?: string;
}> = ({ 
  children, 
  redirectTo = '/admin/dashboard' 
}) => {
  const { user, loading: isLoading } = useAuth();

  if (isLoading) {
    return <LoadingComponent />;
  }

  // 如果用户已登录，重定向到指定页面
  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  // 用户未登录，显示内容
  return <>{children}</>;
};

/**
 * 路由权限配置接口
 */
interface RoutePermissionConfig {
  path: string;
  requireAuth?: boolean;
  requiredRoles?: string[];
  resource?: ResourceType;
  action?: PermissionAction;
  redirectTo?: string;
}

/**
 * 动态路由保护组件
 */
interface DynamicProtectedRouteProps {
  children: ReactNode;
  config: RoutePermissionConfig;
  fallback?: ReactNode;
}

export const DynamicProtectedRoute: React.FC<DynamicProtectedRouteProps> = ({
  children,
  config,
  fallback
}) => {
  return (
    <ProtectedRoute
      requireAuth={config.requireAuth}
      requiredRoles={config.requiredRoles}
      resource={config.resource}
      action={config.action}
      redirectTo={config.redirectTo}
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
};

/**
 * 路由权限HOC
 */
export function withRoutePermission<P extends object>(
  Component: React.ComponentType<P>,
  config: RoutePermissionConfig
) {
  return function ProtectedComponent(props: P) {
    return (
      <DynamicProtectedRoute config={config}>
        <Component {...props} />
      </DynamicProtectedRoute>
    );
  };
}

/**
 * 权限路由守卫Hook
 */
export function useRouteGuard(
  config: RoutePermissionConfig,
  options?: {
    onUnauthorized?: () => void;
    onForbidden?: () => void;
  }
) {
  const location = useLocation();
  const { user } = useAuth();
  const authLoading = false; // 临时设置
  const { userPermissions, hasPermission, isLoading: permissionLoading } = usePermissions();

  const isLoading = authLoading || permissionLoading;
  const isAuthenticated = !!user;
  
  // 检查认证状态
  const authCheck = !config.requireAuth || isAuthenticated;
  
  // 检查角色权限
  let roleCheck = true;
  if (config.requiredRoles && user) {
    roleCheck = config.requiredRoles.includes((user as any).role);
  }
  
  // 检查资源权限
  let resourceCheck = true;
  if (config.resource && config.action && userPermissions) {
    const result = hasPermission(config.resource, config.action);
    resourceCheck = result.allowed;
  }

  const isAuthorized = authCheck && roleCheck && resourceCheck;

  useEffect(() => {
    if (!isLoading) {
      if (!authCheck && options?.onUnauthorized) {
        options.onUnauthorized();
      } else if (!isAuthorized && options?.onForbidden) {
        options.onForbidden();
      }
    }
  }, [isLoading, authCheck, isAuthorized, options]);

  return {
    isLoading,
    isAuthenticated,
    isAuthorized,
    authCheck,
    roleCheck,
    resourceCheck,
    currentPath: location.pathname
  };
}

/**
 * 批量路由保护配置
 */
interface BatchRouteConfig {
  [path: string]: RoutePermissionConfig;
}

/**
 * 批量路由保护组件
 */
interface BatchProtectedRoutesProps {
  children: ReactNode;
  configs: BatchRouteConfig;
  fallback?: ReactNode;
}

export const BatchProtectedRoutes: React.FC<BatchProtectedRoutesProps> = ({
  children,
  configs,
  fallback
}) => {
  const location = useLocation();
  const config = configs[location.pathname];

  if (!config) {
    // 没有配置的路径，默认允许访问
    return <>{children}</>;
  }

  return (
    <DynamicProtectedRoute config={config} fallback={fallback}>
      {children}
    </DynamicProtectedRoute>
  );
};

export default ProtectedRoute;