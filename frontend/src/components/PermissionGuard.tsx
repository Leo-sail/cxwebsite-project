/**
 * 权限保护组件
 * 用于包装需要权限验证的UI组件
 */

import React from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePermission, usePagePermission, useOperationPermission } from '../hooks/usePermissions';
import type {
  ResourceType,
  PermissionAction,
  PermissionContext,
  PermissionCheckOptions
} from '../types/permission';

/**
 * 基础权限保护组件属性
 */
interface BasePermissionGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  showReason?: boolean;
  className?: string;
  onDenied?: () => void;
  options?: PermissionCheckOptions;
}

/**
 * 权限保护组件属性
 */
interface PermissionGuardProps extends BasePermissionGuardProps {
  resource: ResourceType;
  action: PermissionAction;
}

/**
 * 页面权限保护组件属性
 */
interface PagePermissionGuardProps extends BasePermissionGuardProps {
  pagePath: string;
}

/**
 * 操作权限保护组件属性
 */
interface OperationPermissionGuardProps extends BasePermissionGuardProps {
  operation: string;
  context?: PermissionContext;
}

/**
 * 角色权限保护组件属性
 */
interface RoleGuardProps extends BasePermissionGuardProps {
  roles: string | string[];
  requireAll?: boolean;
}

/**
 * 默认拒绝访问组件
 */
const DefaultDeniedComponent: React.FC<{ reason?: string; showReason?: boolean }> = ({ 
  reason, 
  showReason = false 
}) => (
  <div className="flex items-center justify-center min-h-[200px] bg-gray-50 rounded-lg border border-gray-200">
    <div className="text-center">
      <div className="text-6xl mb-4">🔒</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">访问被拒绝</h3>
      <p className="text-gray-600 mb-4">您没有权限访问此内容</p>
      {showReason && reason && (
        <p className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded">
          原因: {reason}
        </p>
      )}
    </div>
  </div>
);

/**
 * 加载组件
 */
const LoadingComponent: React.FC = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

/**
 * 基础权限保护组件
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  resource,
  action,
  children,
  fallback,
  redirectTo,
  showReason = false,
  className,
  onDenied,
  options
}) => {
  const { allowed, reason, isLoading, error } = usePermission(resource, action, options);

  // 处理加载状态
  if (isLoading) {
    return <LoadingComponent />;
  }

  // 处理错误状态
  if (error) {
    return (
      <DefaultDeniedComponent 
        reason={`权限检查错误: ${error}`} 
        showReason={showReason} 
      />
    );
  }

  // 权限被拒绝
  if (!allowed) {
    // 执行拒绝回调
    if (onDenied) {
      onDenied();
    }

    // 重定向
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    // 显示自定义fallback或默认拒绝组件
    if (fallback) {
      return <div className={className}>{fallback}</div>;
    }

    return (
      <div className={className}>
        <DefaultDeniedComponent reason={reason} showReason={showReason} />
      </div>
    );
  }

  // 权限通过，渲染子组件
  return <div className={className}>{children}</div>;
};

/**
 * 页面权限保护组件
 */
export const PagePermissionGuard: React.FC<PagePermissionGuardProps> = ({
  pagePath,
  children,
  fallback,
  redirectTo = '/admin/login',
  showReason = false,
  className,
  onDenied,
  options
}) => {
  const { allowed, reason, isLoading, error } = usePagePermission(pagePath, options);

  // 处理加载状态
  if (isLoading) {
    return <LoadingComponent />;
  }

  // 处理错误状态
  if (error) {
    return (
      <DefaultDeniedComponent 
        reason={`权限检查错误: ${error}`} 
        showReason={showReason} 
      />
    );
  }

  // 权限被拒绝
  if (!allowed) {
    // 执行拒绝回调
    if (onDenied) {
      onDenied();
    }

    // 重定向到登录页或指定页面
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    // 显示自定义fallback或默认拒绝组件
    if (fallback) {
      return <div className={className}>{fallback}</div>;
    }

    return (
      <div className={className}>
        <DefaultDeniedComponent reason={reason} showReason={showReason} />
      </div>
    );
  }

  // 权限通过，渲染子组件
  return <div className={className}>{children}</div>;
};

/**
 * 操作权限保护组件
 */
export const OperationPermissionGuard: React.FC<OperationPermissionGuardProps> = ({
  operation,
  context,
  children,
  fallback,
  redirectTo,
  showReason = false,
  className,
  onDenied,
  options
}) => {
  const { allowed, reason, isLoading, error } = useOperationPermission(operation, context, options);

  // 处理加载状态
  if (isLoading) {
    return <LoadingComponent />;
  }

  // 处理错误状态
  if (error) {
    return (
      <DefaultDeniedComponent 
        reason={`权限检查错误: ${error}`} 
        showReason={showReason} 
      />
    );
  }

  // 权限被拒绝
  if (!allowed) {
    // 执行拒绝回调
    if (onDenied) {
      onDenied();
    }

    // 重定向
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    // 显示自定义fallback或默认拒绝组件
    if (fallback) {
      return <div className={className}>{fallback}</div>;
    }

    return (
      <div className={className}>
        <DefaultDeniedComponent reason={reason} showReason={showReason} />
      </div>
    );
  }

  // 权限通过，渲染子组件
  return <div className={className}>{children}</div>;
};

/**
 * 角色权限保护组件
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  roles,
  requireAll = false,
  children,
  fallback,
  redirectTo,
  showReason = false,
  className,
  onDenied
}) => {
  const { userPermissions, isLoading } = usePermissions();

  // 处理加载状态
  if (isLoading) {
    return <LoadingComponent />;
  }

  // 检查用户是否有权限
  if (!userPermissions) {
    const reason = '用户未登录或权限信息不可用';
    
    if (onDenied) {
      onDenied();
    }

    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    if (fallback) {
      return <div className={className}>{fallback}</div>;
    }

    return (
      <div className={className}>
        <DefaultDeniedComponent reason={reason} showReason={showReason} />
      </div>
    );
  }

  // 检查角色权限
  const userRole = userPermissions.role.name;
  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  
  let hasPermission = false;
  let reason = '';

  if (requireAll) {
    // 需要所有角色（通常不太实用，但提供选项）
    hasPermission = requiredRoles.every(role => userRole === role);
    reason = hasPermission ? '' : `需要所有角色: ${requiredRoles.join(', ')}`;
  } else {
    // 需要任一角色
    hasPermission = requiredRoles.includes(userRole);
    reason = hasPermission ? '' : `需要角色: ${requiredRoles.join(' 或 ')}`;
  }

  // 权限被拒绝
  if (!hasPermission) {
    if (onDenied) {
      onDenied();
    }

    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    if (fallback) {
      return <div className={className}>{fallback}</div>;
    }

    return (
      <div className={className}>
        <DefaultDeniedComponent reason={reason} showReason={showReason} />
      </div>
    );
  }

  // 权限通过，渲染子组件
  return <div className={className}>{children}</div>;
};

/**
 * 条件权限保护组件
 */
interface ConditionalPermissionGuardProps extends BasePermissionGuardProps {
  condition: boolean;
  reason?: string;
}

export const ConditionalPermissionGuard: React.FC<ConditionalPermissionGuardProps> = ({
  condition,
  reason = '不满足访问条件',
  children,
  fallback,
  redirectTo,
  showReason = false,
  className,
  onDenied
}) => {
  // 条件不满足
  if (!condition) {
    if (onDenied) {
      onDenied();
    }

    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    if (fallback) {
      return <div className={className}>{fallback}</div>;
    }

    return (
      <div className={className}>
        <DefaultDeniedComponent reason={reason} showReason={showReason} />
      </div>
    );
  }

  // 条件满足，渲染子组件
  return <div className={className}>{children}</div>;
};

/**
 * 组合权限保护组件
 */
interface CombinedPermissionGuardProps extends BasePermissionGuardProps {
  guards: Array<{
    type: 'permission' | 'page' | 'operation' | 'role' | 'condition';
    resource?: ResourceType;
    action?: PermissionAction;
    pagePath?: string;
    operation?: string;
    context?: PermissionContext;
    roles?: string | string[];
    condition?: boolean;
    requireAll?: boolean;
  }>;
  logic?: 'and' | 'or'; // 多个守卫的逻辑关系
}

export const CombinedPermissionGuard: React.FC<CombinedPermissionGuardProps> = ({
  guards,
  logic = 'and',
  children,
  fallback,
  redirectTo,
  showReason = false,
  className,
  onDenied,
  options
}) => {
  const { userPermissions, hasPermission, canAccessPage, canPerformOperation, isLoading } = usePermissions(options);

  // 处理加载状态
  if (isLoading) {
    return <LoadingComponent />;
  }

  const results = guards.map(guard => {
    switch (guard.type) {
      case 'permission':
        if (!guard.resource || !guard.action) return { allowed: false, reason: '权限配置错误' };
        return hasPermission(guard.resource, guard.action);
      
      case 'page':
        if (!guard.pagePath) return { allowed: false, reason: '页面路径配置错误' };
        return canAccessPage(guard.pagePath);
      
      case 'operation':
        if (!guard.operation) return { allowed: false, reason: '操作配置错误' };
        return canPerformOperation(guard.operation, guard.context);
      
      case 'role':
        if (!guard.roles || !userPermissions) return { allowed: false, reason: '角色配置错误或用户未登录' };
        const userRole = userPermissions.role.name;
        const requiredRoles = Array.isArray(guard.roles) ? guard.roles : [guard.roles];
        const hasRole = guard.requireAll 
          ? requiredRoles.every(role => userRole === role)
          : requiredRoles.includes(userRole);
        return { 
          allowed: hasRole, 
          reason: hasRole ? '' : `需要角色: ${requiredRoles.join(guard.requireAll ? ' 和 ' : ' 或 ')}` 
        };
      
      case 'condition':
        return { 
          allowed: guard.condition || false, 
          reason: guard.condition ? '' : '条件不满足' 
        };
      
      default:
        return { allowed: false, reason: '未知的守卫类型' };
    }
  });

  // 根据逻辑关系判断最终结果
  let finalAllowed = false;
  let finalReason = '';

  if (logic === 'and') {
    finalAllowed = results.every(r => r.allowed);
    if (!finalAllowed) {
      const failedReasons = results.filter(r => !r.allowed).map(r => r.reason).filter(Boolean);
      finalReason = failedReasons.join('; ');
    }
  } else {
    finalAllowed = results.some(r => r.allowed);
    if (!finalAllowed) {
      const allReasons = results.map(r => r.reason).filter(Boolean);
      finalReason = allReasons.join('; ');
    }
  }

  // 权限被拒绝
  if (!finalAllowed) {
    if (onDenied) {
      onDenied();
    }

    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    if (fallback) {
      return <div className={className}>{fallback}</div>;
    }

    return (
      <div className={className}>
        <DefaultDeniedComponent reason={finalReason} showReason={showReason} />
      </div>
    );
  }

  // 权限通过，渲染子组件
  return <div className={className}>{children}</div>;
};

// 导入usePermissions Hook
import { usePermissions } from '../hooks/usePermissions';

// 导出所有组件
export {
  DefaultDeniedComponent,
  LoadingComponent
};

export default PermissionGuard;