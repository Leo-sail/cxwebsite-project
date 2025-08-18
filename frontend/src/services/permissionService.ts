/**
 * 权限管理服务
 * 提供权限验证、角色管理和访问控制功能
 */

import type {
  Permission,
  Role,
  UserPermissions,
  PermissionCheckResult,
  PermissionContext,
  PermissionCheckOptions,
  ResourceType,
  PermissionAction,
  PermissionCondition,
  IPermissionManager,
  MenuPermission,
  PermissionEvent,
  PermissionAuditLog
} from '../types/permission';

import {
  getPagePermission,
  getOperationPermission,
  isHigherRole
} from '../config/permissions';

/**
 * 权限管理器实现类
 */
export class PermissionManager implements IPermissionManager {
  private permissionCache = new Map<string, PermissionCheckResult>();
  private eventListeners = new Map<string, ((event: PermissionEvent) => void)[]>();
  private auditLogs: PermissionAuditLog[] = [];

  /**
   * 检查用户是否有特定权限
   */
  hasPermission(
    userPermissions: UserPermissions,
    resource: ResourceType,
    action: PermissionAction,
    options: PermissionCheckOptions = {}
  ): PermissionCheckResult {
    const cacheKey = this.generateCacheKey(userPermissions.userId, resource, action, options);
    
    // 检查缓存
    if (options.cache && this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey)!;
    }

    const result = this.performPermissionCheck(userPermissions, resource, action, options);
    
    // 缓存结果
    if (options.cache) {
      this.permissionCache.set(cacheKey, result);
    }

    // 记录审计日志
    this.logPermissionCheck(userPermissions.userId, resource, action, result, options.context);

    // 触发权限事件
    this.emitPermissionEvent({
      type: result.allowed ? 'permission_granted' : 'permission_denied',
      userId: userPermissions.userId,
      resource,
      action,
      timestamp: Date.now(),
      details: { reason: result.reason }
    });

    return result;
  }

  /**
   * 执行权限检查的核心逻辑
   */
  private performPermissionCheck(
    userPermissions: UserPermissions,
    resource: ResourceType,
    action: PermissionAction,
    options: PermissionCheckOptions
  ): PermissionCheckResult {
    // 超级管理员拥有所有权限
    if (userPermissions.role.name === 'super_admin') {
      return { allowed: true, reason: 'Super admin has all permissions' };
    }

    // 检查角色权限
    const rolePermissions = userPermissions.role.permissions;
    const hasRolePermission = this.checkPermissionInList(
      rolePermissions,
      resource,
      action,
      options.context
    );

    // 检查自定义权限
    const customPermissions = userPermissions.customPermissions || [];
    const hasCustomPermission = this.checkPermissionInList(
      customPermissions,
      resource,
      action,
      options.context
    );

    // 检查拒绝权限
    const deniedPermissions = userPermissions.deniedPermissions || [];
    const isDenied = this.checkPermissionInList(
      deniedPermissions,
      resource,
      action,
      options.context
    );

    if (isDenied.allowed) {
      return {
        allowed: false,
        reason: 'Permission explicitly denied',
        conditions: isDenied.conditions
      };
    }

    if (hasRolePermission.allowed || hasCustomPermission.allowed) {
      return {
        allowed: true,
        reason: hasRolePermission.allowed ? 'Role permission' : 'Custom permission',
        conditions: hasRolePermission.conditions || hasCustomPermission.conditions
      };
    }

    // 检查通配符权限
    const wildcardResult = this.checkWildcardPermissions(
      userPermissions,
      resource,
      action,
      options.context
    );

    if (wildcardResult.allowed) {
      return wildcardResult;
    }

    // 严格模式下，默认拒绝
    if (options.strict) {
      return {
        allowed: false,
        reason: 'Strict mode: permission not explicitly granted'
      };
    }

    // 非严格模式下，使用fallback设置
    return {
      allowed: options.fallback || false,
      reason: options.fallback ? 'Fallback permission granted' : 'Permission not found'
    };
  }

  /**
   * 在权限列表中检查权限
   */
  private checkPermissionInList(
    permissions: Permission[],
    resource: ResourceType,
    action: PermissionAction,
    context?: PermissionContext
  ): PermissionCheckResult {
    for (const permission of permissions) {
      if (this.matchesPermission(permission, resource, action)) {
        const conditionResult = this.checkConditions(permission.conditions, context);
        if (conditionResult.allowed) {
          return {
            allowed: true,
            reason: `Permission ${permission.id} granted`,
            conditions: permission.conditions
          };
        }
      }
    }

    return { allowed: false, reason: 'Permission not found in list' };
  }

  /**
   * 检查通配符权限
   */
  private checkWildcardPermissions(
    userPermissions: UserPermissions,
    resource: ResourceType,
    action: PermissionAction,
    context?: PermissionContext
  ): PermissionCheckResult {
    const allPermissions = [
      ...userPermissions.role.permissions,
      ...(userPermissions.customPermissions || [])
    ];

    // 检查资源通配符权限 (resource: *, action: specific)
    const resourceWildcard = allPermissions.find(p => 
      p.resource === '*' && (p.action === action || p.action === '*')
    );

    if (resourceWildcard) {
      const conditionResult = this.checkConditions(resourceWildcard.conditions, context);
      if (conditionResult.allowed) {
        return {
          allowed: true,
          reason: `Wildcard permission ${resourceWildcard.id} granted`,
          conditions: resourceWildcard.conditions
        };
      }
    }

    // 检查操作通配符权限 (resource: specific, action: *)
    const actionWildcard = allPermissions.find(p => 
      p.resource === resource && p.action === '*'
    );

    if (actionWildcard) {
      const conditionResult = this.checkConditions(actionWildcard.conditions, context);
      if (conditionResult.allowed) {
        return {
          allowed: true,
          reason: `Wildcard permission ${actionWildcard.id} granted`,
          conditions: actionWildcard.conditions
        };
      }
    }

    return { allowed: false, reason: 'No wildcard permissions match' };
  }

  /**
   * 检查权限是否匹配
   */
  private matchesPermission(
    permission: Permission,
    resource: ResourceType,
    action: PermissionAction
  ): boolean {
    const resourceMatch = permission.resource === resource || permission.resource === '*';
    const actionMatch = permission.action === action || permission.action === '*';
    return resourceMatch && actionMatch;
  }

  /**
   * 检查权限条件
   */
  private checkConditions(
    conditions?: PermissionCondition[],
    context?: PermissionContext
  ): PermissionCheckResult {
    if (!conditions || conditions.length === 0) {
      return { allowed: true, reason: 'No conditions to check' };
    }

    if (!context) {
      return { allowed: false, reason: 'Context required for condition check' };
    }

    for (const condition of conditions) {
      if (!this.evaluateCondition(condition, context)) {
        return {
          allowed: false,
          reason: `Condition failed: ${condition.field || 'custom'}`,
          conditions: [condition]
        };
      }
    }

    return { allowed: true, reason: 'All conditions passed', conditions };
  }

  /**
   * 评估单个条件
   */
  private evaluateCondition(condition: PermissionCondition, context: PermissionContext): boolean {
    // 自定义条件函数
    if (condition.custom) {
      try {
        return condition.custom(context);
      } catch (error) {
        console.error('Error evaluating custom condition:', error);
        return false;
      }
    }

    // 字段条件
    if (condition.field && condition.operator && condition.value !== undefined) {
      const fieldValue = this.getFieldValue(context, condition.field);
      return this.compareValues(fieldValue, condition.value, condition.operator);
    }

    return true;
  }

  /**
   * 获取字段值
   */
  private getFieldValue(context: PermissionContext, field: string): any {
    const parts = field.split('.');
    let value: any = context;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  /**
   * 比较值
   */
  private compareValues(fieldValue: any, conditionValue: any, operator: string): boolean {
    switch (operator) {
      case 'eq':
        return fieldValue === conditionValue;
      case 'ne':
        return fieldValue !== conditionValue;
      case 'in':
        return Array.isArray(conditionValue) && conditionValue.includes(fieldValue);
      case 'nin':
        return Array.isArray(conditionValue) && !conditionValue.includes(fieldValue);
      case 'gt':
        return fieldValue > conditionValue;
      case 'lt':
        return fieldValue < conditionValue;
      case 'gte':
        return fieldValue >= conditionValue;
      case 'lte':
        return fieldValue <= conditionValue;
      default:
        return false;
    }
  }

  /**
   * 检查用户是否可以访问页面
   */
  canAccessPage(
    userPermissions: UserPermissions,
    pagePath: string,
    options: PermissionCheckOptions = {}
  ): PermissionCheckResult {
    const pagePermission = getPagePermission(pagePath);
    
    if (!pagePermission) {
      return {
        allowed: options.fallback || false,
        reason: 'Page permission not configured'
      };
    }

    // 检查角色白名单
    if (pagePermission.allowedRoles) {
      const isAllowed = pagePermission.allowedRoles.includes(userPermissions.role.name);
      if (!isAllowed) {
        return {
          allowed: false,
          reason: `Role ${userPermissions.role.name} not in allowed roles`
        };
      }
    }

    // 检查角色黑名单
    if (pagePermission.deniedRoles) {
      const isDenied = pagePermission.deniedRoles.includes(userPermissions.role.name);
      if (isDenied) {
        return {
          allowed: false,
          reason: `Role ${userPermissions.role.name} is denied`
        };
      }
    }

    // 检查具体权限
    return this.hasPermission(
      userPermissions,
      pagePermission.resource,
      pagePermission.action,
      options
    );
  }

  /**
   * 获取用户可访问的菜单项
   */
  getAccessibleMenuItems(
    userPermissions: UserPermissions,
    menuItems: MenuPermission[]
  ): MenuPermission[] {
    return menuItems.filter(item => {
      // 检查角色要求
      if (item.requiredRole) {
        if (userPermissions.role.name !== item.requiredRole && 
            !isHigherRole(userPermissions.role.name, item.requiredRole)) {
          return false;
        }
      }

      // 检查权限
      const hasPermission = this.hasPermission(
        userPermissions,
        item.resource,
        item.action,
        { fallback: false }
      );

      if (!hasPermission.allowed) {
        return false;
      }

      // 递归处理子菜单
      if (item.children) {
        item.children = this.getAccessibleMenuItems(userPermissions, item.children);
      }

      return true;
    });
  }

  /**
   * 获取用户在特定资源上的操作权限
   */
  getResourcePermissions(
    userPermissions: UserPermissions,
    resource: ResourceType
  ): PermissionAction[] {
    const actions: PermissionAction[] = ['create', 'read', 'update', 'delete'];
    const allowedActions: PermissionAction[] = [];

    for (const action of actions) {
      const result = this.hasPermission(userPermissions, resource, action, { fallback: false });
      if (result.allowed) {
        allowedActions.push(action);
      }
    }

    return allowedActions;
  }

  /**
   * 验证角色权限
   */
  validateRolePermissions(role: Role): boolean {
    // 检查角色基本信息
    if (!role.id || !role.name || !role.displayName) {
      return false;
    }

    // 检查权限列表
    if (!Array.isArray(role.permissions)) {
      return false;
    }

    // 验证每个权限
    for (const permission of role.permissions) {
      if (!this.validatePermission(permission)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 验证单个权限
   */
  private validatePermission(permission: Permission): boolean {
    return !!(permission.id && permission.name && permission.resource && permission.action);
  }

  /**
   * 合并权限
   */
  mergePermissions(permissions1: Permission[], permissions2: Permission[]): Permission[] {
    const merged = new Map<string, Permission>();

    // 添加第一组权限
    permissions1.forEach(p => merged.set(p.id, p));

    // 添加第二组权限（覆盖重复的）
    permissions2.forEach(p => merged.set(p.id, p));

    return Array.from(merged.values());
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(
    userId: string,
    resource: ResourceType,
    action: PermissionAction,
    options: PermissionCheckOptions
  ): string {
    const optionsStr = JSON.stringify({
      strict: options.strict,
      fallback: options.fallback,
      contextHash: options.context ? this.hashContext(options.context) : null
    });
    return `${userId}:${resource}:${action}:${optionsStr}`;
  }

  /**
   * 生成上下文哈希
   */
  private hashContext(context: PermissionContext): string {
    return btoa(JSON.stringify(context)).slice(0, 16);
  }

  /**
   * 记录权限检查日志
   */
  private logPermissionCheck(
    userId: string,
    resource: ResourceType,
    action: PermissionAction,
    result: PermissionCheckResult,
    context?: PermissionContext
  ): void {
    const log: PermissionAuditLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      action: `${resource}:${action}`,
      resource,
      result: result.allowed ? 'granted' : 'denied',
      reason: result.reason,
      ip: context?.environment?.ip,
      userAgent: context?.environment?.userAgent,
      timestamp: Date.now(),
      context: context ? { ...context } : undefined
    };

    this.auditLogs.push(log);

    // 保持日志数量在合理范围内
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(-500);
    }
  }

  /**
   * 触发权限事件
   */
  private emitPermissionEvent(event: PermissionEvent): void {
    const listeners = this.eventListeners.get(event.type) || [];
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in permission event listener:', error);
      }
    });
  }

  /**
   * 添加事件监听器
   */
  addEventListener(eventType: string, listener: (event: PermissionEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(eventType: string, listener: (event: PermissionEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 清除权限缓存
   */
  clearCache(): void {
    this.permissionCache.clear();
  }

  /**
   * 获取审计日志
   */
  getAuditLogs(limit?: number): PermissionAuditLog[] {
    if (limit) {
      return this.auditLogs.slice(-limit);
    }
    return [...this.auditLogs];
  }

  /**
   * 检查操作权限
   */
  canPerformOperation(
    userPermissions: UserPermissions,
    operation: string,
    context?: PermissionContext
  ): PermissionCheckResult {
    const operationPermission = getOperationPermission(operation);
    
    if (!operationPermission) {
      return {
        allowed: false,
        reason: 'Operation permission not configured'
      };
    }

    return this.hasPermission(
      userPermissions,
      operationPermission.resource,
      operationPermission.action,
      {
        context,
        strict: true
      }
    );
  }
}

// 创建全局权限管理器实例
export const permissionManager = new PermissionManager();

// 导出便捷函数
export const {
  hasPermission,
  canAccessPage,
  getAccessibleMenuItems,
  getResourcePermissions,
  validateRolePermissions,
  mergePermissions,
  canPerformOperation
} = permissionManager;

export default permissionManager;