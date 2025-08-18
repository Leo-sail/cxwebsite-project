/**
 * 权限验证Hook
 * 提供便捷的权限检查和状态管理功能
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { permissionManager } from '../services/permissionService';
import { getRolePermissions } from '../config/permissions';
import type {
  UserPermissions,
  PermissionCheckResult,
  PermissionContext,
  PermissionCheckOptions,
  ResourceType,
  PermissionAction,
  MenuPermission,
  PermissionEvent
} from '../types/permission';

/**
 * 权限Hook选项
 */
interface UsePermissionsOptions {
  cache?: boolean;
  strict?: boolean;
  fallback?: boolean;
  autoRefresh?: boolean;
  context?: PermissionContext;
}

/**
 * 权限Hook返回值
 */
interface UsePermissionsReturn {
  userPermissions: UserPermissions | null;
  hasPermission: (resource: ResourceType, action: PermissionAction, options?: PermissionCheckOptions) => PermissionCheckResult;
  canAccessPage: (pagePath: string, options?: PermissionCheckOptions) => PermissionCheckResult;
  canPerformOperation: (operation: string, context?: PermissionContext) => PermissionCheckResult;
  getResourcePermissions: (resource: ResourceType) => PermissionAction[];
  getAccessibleMenuItems: (menuItems: MenuPermission[]) => MenuPermission[];
  isLoading: boolean;
  error: string | null;
  refreshPermissions: () => void;
}

/**
 * 主要权限Hook
 */
export function usePermissions(options: UsePermissionsOptions = {}): UsePermissionsReturn {
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);

  /**
   * 构建用户权限对象
   */
  const buildUserPermissions = useCallback((): UserPermissions | null => {
    const typedUser = user as any;
    if (!user || !typedUser.role) {
      return null;
    }

    try {
      // 类型断言，假设用户对象有这些属性
      const typedUser = user as any;
      const rolePermissions = getRolePermissions(typedUser.role);
      return {
        userId: user.id,
        role: {
          id: typedUser.role || 'viewer',
          name: typedUser.role || 'viewer',
          displayName: typedUser.role_display_name || typedUser.role || 'viewer',
          level: typedUser.role_level || 0,
          permissions: rolePermissions,
          isActive: true
        },
        customPermissions: typedUser.custom_permissions || [],
        deniedPermissions: typedUser.denied_permissions || []
      };
    } catch (err) {
      console.error('Error building user permissions:', err);
      setError('Failed to build user permissions');
      return null;
    }
  }, [user]);

  /**
   * 刷新权限
   */
  const refreshPermissions = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    try {
      const permissions = buildUserPermissions();
      setUserPermissions(permissions);
    } catch (err) {
      console.error('Error refreshing permissions:', err);
      setError('Failed to refresh permissions');
    } finally {
      setIsLoading(false);
    }
  }, [buildUserPermissions]);

  /**
   * 初始化权限
   */
  useEffect(() => {
    if (!authLoading) {
      refreshPermissions();
    }
  }, [authLoading, refreshPermissions]);

  /**
   * 自动刷新权限
   */
  useEffect(() => {
    if (options.autoRefresh && user) {
      const interval = setInterval(refreshPermissions, 5 * 60 * 1000); // 5分钟刷新一次
      return () => clearInterval(interval);
    }
  }, [options.autoRefresh, user, refreshPermissions]);

  /**
   * 检查权限
   */
  const hasPermission = useCallback(
    (resource: ResourceType, action: PermissionAction, checkOptions?: PermissionCheckOptions): PermissionCheckResult => {
      if (!userPermissions) {
        return { allowed: false, reason: 'User permissions not available' };
      }

      const mergedOptions: PermissionCheckOptions = {
        cache: options.cache,
        strict: options.strict,
        fallback: options.fallback,
        context: options.context,
        ...checkOptions
      };

      return permissionManager.hasPermission(userPermissions, resource, action, mergedOptions);
    },
    [userPermissions, options]
  );

  /**
   * 检查页面访问权限
   */
  const canAccessPage = useCallback(
    (pagePath: string, checkOptions?: PermissionCheckOptions): PermissionCheckResult => {
      if (!userPermissions) {
        return { allowed: false, reason: 'User permissions not available' };
      }

      const mergedOptions: PermissionCheckOptions = {
        cache: options.cache,
        strict: options.strict,
        fallback: options.fallback,
        context: options.context,
        ...checkOptions
      };

      return permissionManager.canAccessPage(userPermissions, pagePath, mergedOptions);
    },
    [userPermissions, options]
  );

  /**
   * 检查操作权限
   */
  const canPerformOperation = useCallback(
    (operation: string, context?: PermissionContext): PermissionCheckResult => {
      if (!userPermissions) {
        return { allowed: false, reason: 'User permissions not available' };
      }

      const mergedContext = context || options.context;
      return permissionManager.canPerformOperation(userPermissions, operation, mergedContext);
    },
    [userPermissions, options.context]
  );

  /**
   * 获取资源权限
   */
  const getResourcePermissions = useCallback(
    (resource: ResourceType): PermissionAction[] => {
      if (!userPermissions) {
        return [];
      }

      return permissionManager.getResourcePermissions(userPermissions, resource);
    },
    [userPermissions]
  );

  /**
   * 获取可访问的菜单项
   */
  const getAccessibleMenuItems = useCallback(
    (menuItems: MenuPermission[]): MenuPermission[] => {
      if (!userPermissions) {
        return [];
      }

      return permissionManager.getAccessibleMenuItems(userPermissions, menuItems);
    },
    [userPermissions]
  );

  return {
    userPermissions,
    hasPermission,
    canAccessPage,
    canPerformOperation,
    getResourcePermissions,
    getAccessibleMenuItems,
    isLoading: authLoading || isLoading,
    error,
    refreshPermissions
  };
}

/**
 * 简化的权限检查Hook
 */
export function usePermission(
  resource: ResourceType,
  action: PermissionAction,
  options?: UsePermissionsOptions
) {
  const { hasPermission, isLoading, error } = usePermissions(options);
  
  const result = useMemo(() => {
    if (isLoading) {
      return { allowed: false, reason: 'Loading permissions' };
    }
    return hasPermission(resource, action);
  }, [hasPermission, resource, action, isLoading]);

  return {
    allowed: result.allowed,
    reason: result.reason,
    conditions: result.conditions,
    isLoading,
    error
  };
}

/**
 * 页面权限Hook
 */
export function usePagePermission(pagePath: string, options?: UsePermissionsOptions) {
  const { canAccessPage, isLoading, error } = usePermissions(options);
  
  const result = useMemo(() => {
    if (isLoading) {
      return { allowed: false, reason: 'Loading permissions' };
    }
    return canAccessPage(pagePath);
  }, [canAccessPage, pagePath, isLoading]);

  return {
    allowed: result.allowed,
    reason: result.reason,
    conditions: result.conditions,
    isLoading,
    error
  };
}

/**
 * 操作权限Hook
 */
export function useOperationPermission(
  operation: string,
  context?: PermissionContext,
  options?: UsePermissionsOptions
) {
  const { canPerformOperation, isLoading, error } = usePermissions(options);
  
  const result = useMemo(() => {
    if (isLoading) {
      return { allowed: false, reason: 'Loading permissions' };
    }
    return canPerformOperation(operation, context);
  }, [canPerformOperation, operation, context, isLoading]);

  return {
    allowed: result.allowed,
    reason: result.reason,
    conditions: result.conditions,
    isLoading,
    error
  };
}

/**
 * 资源权限Hook
 */
export function useResourcePermissions(
  resource: ResourceType,
  options?: UsePermissionsOptions
) {
  const { getResourcePermissions, isLoading, error } = usePermissions(options);
  
  const permissions = useMemo(() => {
    if (isLoading) {
      return [];
    }
    return getResourcePermissions(resource);
  }, [getResourcePermissions, resource, isLoading]);

  return {
    permissions,
    canCreate: permissions.includes('create'),
    canRead: permissions.includes('read'),
    canUpdate: permissions.includes('update'),
    canDelete: permissions.includes('delete'),
    hasFullAccess: permissions.includes('*'),
    isLoading,
    error
  };
}

/**
 * 菜单权限Hook
 */
export function useMenuPermissions(
  menuItems: MenuPermission[],
  options?: UsePermissionsOptions
) {
  const { getAccessibleMenuItems, isLoading, error } = usePermissions(options);
  
  const accessibleItems = useMemo(() => {
    if (isLoading) {
      return [];
    }
    return getAccessibleMenuItems(menuItems);
  }, [getAccessibleMenuItems, menuItems, isLoading]);

  return {
    accessibleItems,
    isLoading,
    error
  };
}

/**
 * 权限事件Hook
 */
export function usePermissionEvents() {
  const [events, setEvents] = useState<PermissionEvent[]>([]);

  useEffect(() => {
    const handlePermissionEvent = (event: PermissionEvent) => {
      setEvents(prev => [...prev.slice(-99), event]); // 保持最近100个事件
    };

    permissionManager.addEventListener('permission_granted', handlePermissionEvent);
    permissionManager.addEventListener('permission_denied', handlePermissionEvent);
    permissionManager.addEventListener('role_changed', handlePermissionEvent);
    permissionManager.addEventListener('permission_updated', handlePermissionEvent);

    return () => {
      permissionManager.removeEventListener('permission_granted', handlePermissionEvent);
      permissionManager.removeEventListener('permission_denied', handlePermissionEvent);
      permissionManager.removeEventListener('role_changed', handlePermissionEvent);
      permissionManager.removeEventListener('permission_updated', handlePermissionEvent);
    };
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    events,
    clearEvents,
    recentEvents: events.slice(-10),
    deniedEvents: events.filter(e => e.type === 'permission_denied'),
    grantedEvents: events.filter(e => e.type === 'permission_granted')
  };
}

/**
 * 角色检查Hook
 */
export function useRoleCheck(requiredRole: string | string[]) {
  const { user } = useAuth();
  
  const hasRole = useMemo(() => {
    const typedUser = user as any;
    if (!user || !typedUser.role) {
      return false;
    }

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(typedUser.role);
    }

    return typedUser.role === requiredRole;
  }, [user, requiredRole]);

  return {
    hasRole,
    userRole: (user as any)?.role,
    isAuthenticated: !!user
  };
}

/**
 * 权限守卫Hook
 */
export function usePermissionGuard(
  resource: ResourceType,
  action: PermissionAction,
  options?: UsePermissionsOptions & {
    redirectTo?: string;
    onDenied?: () => void;
  }
) {
  const { allowed, reason, isLoading, error } = usePermission(resource, action, options);
  
  useEffect(() => {
    if (!isLoading && !allowed) {
      if (options?.onDenied) {
        options.onDenied();
      } else if (options?.redirectTo) {
        window.location.href = options.redirectTo;
      }
    }
  }, [allowed, isLoading, options]);

  return {
    allowed,
    reason,
    isLoading,
    error,
    isDenied: !isLoading && !allowed
  };
}

export default usePermissions;