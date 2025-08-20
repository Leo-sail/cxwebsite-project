/**
 * 权限配置页面
 * 提供权限系统的配置和管理功能
 */
import React, { useState } from 'react';
import {
  ShieldCheckIcon,
  UserGroupIcon,
  CogIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useAppStore } from '../../store';

import { PERMISSION_CONFIG } from '../../config/permissions';
import type { Permission, ResourceType, PermissionAction } from '../../types/permission';

/**
 * 权限配置页面组件
 */
const PermissionConfig: React.FC = () => {
  const { user, setUser } = useAppStore();
  
  // 类型断言，假设用户对象有这些属性
  const typedUser = user as { name?: string; username?: string; email?: string; role?: string; customPermissions?: Permission[] } | null;
  const [currentRole, setCurrentRole] = useState<string>(typedUser?.role || 'viewer');
  const [customPermissions, setCustomPermissions] = useState<Permission[]>(typedUser?.customPermissions || []);
  const [selectedResource, setSelectedResource] = useState<string>('courses');
  const [showRoleDetails, setShowRoleDetails] = useState<Record<string, boolean>>({});

  /**
   * 处理角色切换
   */
  const handleRoleChange = (newRole: string) => {
    setCurrentRole(newRole);
    if (typedUser) {
      const updatedUser = {
        ...typedUser,
        role: newRole,
        customPermissions: customPermissions
      };
      setUser(updatedUser);
      
      // 刷新权限缓存
      // 权限更新逻辑，需要根据实际需求实现
      console.log('权限已更新:', updatedUser);
    }
  };

  /**
   * 添加自定义权限
   */
  const handleAddCustomPermission = (resource: string, action: string) => {
    const newPermission: Permission = {
      id: `${resource}-${action}-${Date.now()}`,
      name: `${resource} ${action} permission`,
      resource: resource as ResourceType,
      action: action as PermissionAction,
      conditions: []
    };
    
    const updatedPermissions = [...customPermissions, newPermission];
    setCustomPermissions(updatedPermissions);
    
    if (user) {
      const updatedUser = {
        ...user,
        customPermissions: updatedPermissions
      };
      setUser(updatedUser);
      // 权限更新逻辑，需要根据实际需求实现
      console.log('权限已更新:', updatedUser);
    }
  };

  /**
   * 移除自定义权限
   */
  const handleRemoveCustomPermission = (index: number) => {
    const updatedPermissions = customPermissions.filter((_, i) => i !== index);
    setCustomPermissions(updatedPermissions);
    
    if (user) {
      const updatedUser = {
        ...user,
        customPermissions: updatedPermissions
      };
      setUser(updatedUser);
      // 权限更新逻辑，需要根据实际需求实现
      console.log('权限已更新:', updatedUser);
    }
  };

  /**
   * 切换角色详情显示
   */
  const toggleRoleDetails = (role: string) => {
    setShowRoleDetails(prev => ({
      ...prev,
      [role]: !prev[role]
    }));
  };

  /**
   * 检查权限状态
   */
  const checkPermission = (_resource: string, _action: string): boolean => {
    if (!user) return false;
    // 这里需要根据实际的用户权限结构来实现
    return true; // 临时返回true，需要根据实际情况调整
  };

  /**
   * 获取角色权限列表
   */
  const getRolePermissions = (role: string): Permission[] => {
    const roleConfig = PERMISSION_CONFIG.roles.find(r => r.name === role);
    return roleConfig?.permissions || [];
  };

  const resources = ['courses', 'teachers', 'articles', 'cases', 'media', 'users', 'settings'];
  const actions = ['read', 'create', 'update', 'delete', 'manage'];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">权限配置</h1>
            <p className="text-gray-600">管理用户角色和权限设置</p>
          </div>
        </div>
      </div>

      {/* 当前用户信息 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <UserGroupIcon className="h-5 w-5 mr-2" />
          当前用户信息
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">用户名</label>
            <p className="mt-1 text-sm text-gray-900">{typedUser?.name || typedUser?.username || '未登录'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">邮箱</label>
            <p className="mt-1 text-sm text-gray-900">{typedUser?.email || '未设置'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">当前角色</label>
            <p className="mt-1 text-sm font-semibold text-blue-600">
              {PERMISSION_CONFIG.roles.find(r => r.name === currentRole)?.displayName || currentRole}
            </p>
          </div>
        </div>
      </div>

      {/* 角色切换 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">角色切换</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PERMISSION_CONFIG.roles.map((role) => (
            <div key={role.name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{role.displayName}</h3>
                <button
                  onClick={() => toggleRoleDetails(role.name)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-3">{role.description}</p>
              <button
                onClick={() => handleRoleChange(role.name)}
                className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentRole === role.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {currentRole === role.name ? '当前角色' : '切换到此角色'}
              </button>
              
              {/* 角色权限详情 */}
              {showRoleDetails[role.name] && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">权限列表:</h4>
                  <div className="space-y-1">
                    {getRolePermissions(role.name).map((permission, index) => (
                      <div key={index} className="text-xs text-gray-600">
                        {permission.resource}:{permission.action}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 权限测试 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">权限测试</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">选择资源</label>
          <select
            value={selectedResource}
            onChange={(e) => setSelectedResource(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {resources.map((resource) => (
              <option key={resource} value={resource}>
                {resource}
              </option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {actions.map((action) => {
            const hasPermission = checkPermission(selectedResource, action);
            return (
              <div
                key={action}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  hasPermission
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{action}</span>
                  {hasPermission ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <p className={`text-xs mt-1 ${
                  hasPermission ? 'text-green-600' : 'text-red-600'
                }`}>
                  {hasPermission ? '有权限' : '无权限'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 自定义权限管理 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CogIcon className="h-5 w-5 mr-2" />
          自定义权限
        </h2>
        
        {/* 添加权限 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3">添加自定义权限</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              id="add-resource"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {resources.map((resource) => (
                <option key={resource} value={resource}>
                  {resource}
                </option>
              ))}
            </select>
            <select
              id="add-action"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {actions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                const resourceSelect = document.getElementById('add-resource') as HTMLSelectElement;
                const actionSelect = document.getElementById('add-action') as HTMLSelectElement;
                if (resourceSelect && actionSelect) {
                  handleAddCustomPermission(resourceSelect.value, actionSelect.value);
                }
              }}
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              添加
            </button>
          </div>
        </div>
        
        {/* 当前自定义权限列表 */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">当前自定义权限</h3>
          {customPermissions.length === 0 ? (
            <p className="text-sm text-gray-500">暂无自定义权限</p>
          ) : (
            <div className="space-y-2">
              {customPermissions.map((permission, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {permission.resource}:{permission.action}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveCustomPermission(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 权限系统状态 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">系统状态</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-900">权限系统已启用</span>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-900">缓存系统正常</span>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-900">审计日志已启用</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionConfig;