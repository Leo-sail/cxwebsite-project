/**
 * 权限管理相关类型定义
 */

/**
 * 用户接口
 */
export interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

/**
 * 权限操作类型
 */
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | '*';

/**
 * 资源类型
 */
export type ResourceType = 
  | 'dashboard'
  | 'courses'
  | 'teachers'
  | 'articles'
  | 'student-cases'
  | 'page-configs'
  | 'media'
  | 'users'
  | 'roles'
  | '*';

/**
 * 权限条件接口
 */
export interface PermissionCondition {
  field?: string;
  operator?: 'eq' | 'ne' | 'in' | 'nin' | 'gt' | 'lt' | 'gte' | 'lte';
  value?: any;
  custom?: (context: any) => boolean;
}

/**
 * 权限接口
 */
export interface Permission {
  id: string;
  name: string;
  resource: ResourceType;
  action: PermissionAction;
  conditions?: PermissionCondition[];
  description?: string;
}

/**
 * 角色接口
 */
export interface Role {
  id: string;
  name: string;
  displayName: string;
  level: number;
  permissions: Permission[];
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 用户权限接口
 */
export interface UserPermissions {
  userId: string;
  role: Role;
  customPermissions?: Permission[];
  deniedPermissions?: Permission[];
}

/**
 * 权限检查结果
 */
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  conditions?: PermissionCondition[];
}

/**
 * 权限上下文
 */
export interface PermissionContext {
  user: {
    id: string;
    role: string;
    [key: string]: any;
  };
  resource?: {
    id?: string;
    type: ResourceType;
    [key: string]: any;
  };
  environment?: {
    ip?: string;
    userAgent?: string;
    timestamp?: number;
    [key: string]: any;
  };
}

/**
 * 菜单项权限配置
 */
export interface MenuPermission {
  path: string;
  resource: ResourceType;
  action: PermissionAction;
  requiredRole?: string;
  children?: MenuPermission[];
}

/**
 * 页面权限配置
 */
export interface PagePermission {
  path: string;
  resource: ResourceType;
  action: PermissionAction;
  requiredRole?: string;
  allowedRoles?: string[];
  deniedRoles?: string[];
}

/**
 * 操作权限配置
 */
export interface OperationPermission {
  operation: string;
  resource: ResourceType;
  action: PermissionAction;
  conditions?: PermissionCondition[];
}

/**
 * 权限配置接口
 */
export interface PermissionConfig {
  roles: Role[];
  pages: PagePermission[];
  operations: OperationPermission[];
  menus: MenuPermission[];
}

/**
 * 权限验证选项
 */
export interface PermissionCheckOptions {
  strict?: boolean;           // 严格模式，所有条件都必须满足
  cache?: boolean;           // 是否缓存结果
  context?: PermissionContext; // 权限检查上下文
  fallback?: boolean;        // 当权限不明确时的默认行为
}

/**
 * 权限管理器接口
 */
export interface IPermissionManager {
  /**
   * 检查用户是否有特定权限
   */
  hasPermission(
    userPermissions: UserPermissions,
    resource: ResourceType,
    action: PermissionAction,
    options?: PermissionCheckOptions
  ): PermissionCheckResult;

  /**
   * 检查用户是否可以访问页面
   */
  canAccessPage(
    userPermissions: UserPermissions,
    pagePath: string,
    options?: PermissionCheckOptions
  ): PermissionCheckResult;

  /**
   * 获取用户可访问的菜单项
   */
  getAccessibleMenuItems(
    userPermissions: UserPermissions,
    menuItems: MenuPermission[]
  ): MenuPermission[];

  /**
   * 获取用户在特定资源上的操作权限
   */
  getResourcePermissions(
    userPermissions: UserPermissions,
    resource: ResourceType
  ): PermissionAction[];

  /**
   * 验证角色权限
   */
  validateRolePermissions(role: Role): boolean;

  /**
   * 合并权限
   */
  mergePermissions(permissions1: Permission[], permissions2: Permission[]): Permission[];
}

/**
 * 权限事件类型
 */
export type PermissionEventType = 
  | 'permission_granted'
  | 'permission_denied'
  | 'role_changed'
  | 'permission_updated';

/**
 * 权限事件接口
 */
export interface PermissionEvent {
  type: PermissionEventType;
  userId: string;
  resource?: ResourceType;
  action?: PermissionAction;
  timestamp: number;
  details?: any;
}

/**
 * 权限审计日志接口
 */
export interface PermissionAuditLog {
  id: string;
  userId: string;
  action: string;
  resource: ResourceType;
  resourceId?: string;
  result: 'granted' | 'denied';
  reason?: string;
  ip?: string;
  userAgent?: string;
  timestamp: number;
  context?: any;
}