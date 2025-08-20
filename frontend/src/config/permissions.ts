/**
 * 权限配置文件
 * 定义系统中的角色、权限和访问控制规则
 */

import type {
  Role,
  Permission,
  PermissionConfig,
  PagePermission,
  OperationPermission,
  MenuPermission,
  ResourceType,
  PermissionAction
} from '../types/permission';

/**
 * 系统默认权限定义
 */
export const DEFAULT_PERMISSIONS: Permission[] = [
  // 仪表板权限
  {
    id: 'dashboard.read',
    name: '查看仪表板',
    resource: 'dashboard',
    action: 'read',
    description: '查看系统仪表板和统计信息'
  },

  // 课程管理权限
  {
    id: 'courses.create',
    name: '创建课程',
    resource: 'courses',
    action: 'create',
    description: '创建新的课程信息'
  },
  {
    id: 'courses.read',
    name: '查看课程',
    resource: 'courses',
    action: 'read',
    description: '查看课程列表和详情'
  },
  {
    id: 'courses.update',
    name: '编辑课程',
    resource: 'courses',
    action: 'update',
    description: '编辑课程信息'
  },
  {
    id: 'courses.delete',
    name: '删除课程',
    resource: 'courses',
    action: 'delete',
    description: '删除课程信息'
  },

  // 教师管理权限
  {
    id: 'teachers.create',
    name: '添加教师',
    resource: 'teachers',
    action: 'create',
    description: '添加新的教师信息'
  },
  {
    id: 'teachers.read',
    name: '查看教师',
    resource: 'teachers',
    action: 'read',
    description: '查看教师列表和详情'
  },
  {
    id: 'teachers.update',
    name: '编辑教师',
    resource: 'teachers',
    action: 'update',
    description: '编辑教师信息'
  },
  {
    id: 'teachers.delete',
    name: '删除教师',
    resource: 'teachers',
    action: 'delete',
    description: '删除教师信息'
  },

  // 文章管理权限
  {
    id: 'articles.create',
    name: '创建文章',
    resource: 'articles',
    action: 'create',
    description: '创建新的文章'
  },
  {
    id: 'articles.read',
    name: '查看文章',
    resource: 'articles',
    action: 'read',
    description: '查看文章列表和详情'
  },
  {
    id: 'articles.update',
    name: '编辑文章',
    resource: 'articles',
    action: 'update',
    description: '编辑文章内容'
  },
  {
    id: 'articles.delete',
    name: '删除文章',
    resource: 'articles',
    action: 'delete',
    description: '删除文章'
  },

  // 学员案例权限
  {
    id: 'student-cases.create',
    name: '创建学员案例',
    resource: 'student-cases',
    action: 'create',
    description: '创建新的学员案例'
  },
  {
    id: 'student-cases.read',
    name: '查看学员案例',
    resource: 'student-cases',
    action: 'read',
    description: '查看学员案例列表和详情'
  },
  {
    id: 'student-cases.update',
    name: '编辑学员案例',
    resource: 'student-cases',
    action: 'update',
    description: '编辑学员案例信息'
  },
  {
    id: 'student-cases.delete',
    name: '删除学员案例',
    resource: 'student-cases',
    action: 'delete',
    description: '删除学员案例'
  },

  // 页面配置权限
  {
    id: 'page-configs.create',
    name: '创建页面配置',
    resource: 'page-configs',
    action: 'create',
    description: '创建新的页面配置'
  },
  {
    id: 'page-configs.read',
    name: '查看页面配置',
    resource: 'page-configs',
    action: 'read',
    description: '查看页面配置信息'
  },
  {
    id: 'page-configs.update',
    name: '编辑页面配置',
    resource: 'page-configs',
    action: 'update',
    description: '编辑页面配置'
  },
  {
    id: 'page-configs.delete',
    name: '删除页面配置',
    resource: 'page-configs',
    action: 'delete',
    description: '删除页面配置'
  },

  // 媒体管理权限
  {
    id: 'media.create',
    name: '上传媒体',
    resource: 'media',
    action: 'create',
    description: '上传图片、视频等媒体文件'
  },
  {
    id: 'media.read',
    name: '查看媒体',
    resource: 'media',
    action: 'read',
    description: '查看媒体文件列表'
  },
  {
    id: 'media.update',
    name: '编辑媒体',
    resource: 'media',
    action: 'update',
    description: '编辑媒体文件信息'
  },
  {
    id: 'media.delete',
    name: '删除媒体',
    resource: 'media',
    action: 'delete',
    description: '删除媒体文件'
  },

  // 用户管理权限
  {
    id: 'users.create',
    name: '创建用户',
    resource: 'users',
    action: 'create',
    description: '创建新用户账户'
  },
  {
    id: 'users.read',
    name: '查看用户',
    resource: 'users',
    action: 'read',
    description: '查看用户列表和详情'
  },
  {
    id: 'users.update',
    name: '编辑用户',
    resource: 'users',
    action: 'update',
    description: '编辑用户信息'
  },
  {
    id: 'users.delete',
    name: '删除用户',
    resource: 'users',
    action: 'delete',
    description: '删除用户账户'
  },

  // 角色管理权限
  {
    id: 'roles.create',
    name: '创建角色',
    resource: 'roles',
    action: 'create',
    description: '创建新的角色'
  },
  {
    id: 'roles.read',
    name: '查看角色',
    resource: 'roles',
    action: 'read',
    description: '查看角色列表和权限'
  },
  {
    id: 'roles.update',
    name: '编辑角色',
    resource: 'roles',
    action: 'update',
    description: '编辑角色权限'
  },
  {
    id: 'roles.delete',
    name: '删除角色',
    resource: 'roles',
    action: 'delete',
    description: '删除角色'
  },

  // 信息管理权限
  {
    id: 'content-management.create',
    name: '创建信息',
    resource: 'content-management',
    action: 'create',
    description: '创建新的信息内容'
  },
  {
    id: 'content-management.read',
    name: '查看信息',
    resource: 'content-management',
    action: 'read',
    description: '查看信息列表和详情'
  },
  {
    id: 'content-management.update',
    name: '编辑信息',
    resource: 'content-management',
    action: 'update',
    description: '编辑信息内容'
  },
  {
    id: 'content-management.delete',
    name: '删除信息',
    resource: 'content-management',
    action: 'delete',
    description: '删除信息内容'
  }
];

/**
 * 系统默认角色定义
 */
export const DEFAULT_ROLES: Role[] = [
  {
    id: 'super_admin',
    name: 'super_admin',
    displayName: '超级管理员',
    level: 100,
    permissions: DEFAULT_PERMISSIONS, // 拥有所有权限
    description: '系统超级管理员，拥有所有权限',
    isActive: true
  },
  {
    id: 'admin',
    name: 'admin',
    displayName: '管理员',
    level: 80,
    permissions: DEFAULT_PERMISSIONS.filter(p => 
      !['users.delete', 'roles.delete'].includes(p.id)
    ),
    description: '系统管理员，拥有大部分管理权限',
    isActive: true
  },
  {
    id: 'editor',
    name: 'editor',
    displayName: '编辑员',
    level: 60,
    permissions: DEFAULT_PERMISSIONS.filter(p => 
      ['dashboard.read', 'courses', 'teachers', 'articles', 'student-cases', 'media', 'content-management'].some(resource => 
        p.resource === resource && !p.id.includes('delete')
      )
    ),
    description: '内容编辑员，可以管理课程、教师、文章等内容',
    isActive: true
  },
  {
    id: 'viewer',
    name: 'viewer',
    displayName: '查看员',
    level: 20,
    permissions: DEFAULT_PERMISSIONS.filter(p => p.action === 'read'),
    description: '只读用户，只能查看内容',
    isActive: true
  }
];

/**
 * 页面权限配置
 */
export const PAGE_PERMISSIONS: PagePermission[] = [
  {
    path: '/admin',
    resource: 'dashboard',
    action: 'read',
    allowedRoles: ['super_admin', 'admin', 'editor', 'viewer']
  },
  {
    path: '/admin/dashboard',
    resource: 'dashboard',
    action: 'read',
    allowedRoles: ['super_admin', 'admin', 'editor', 'viewer']
  },
  {
    path: '/admin/courses',
    resource: 'courses',
    action: 'read',
    allowedRoles: ['super_admin', 'admin', 'editor', 'viewer']
  },
  {
    path: '/admin/courses/create',
    resource: 'courses',
    action: 'create',
    allowedRoles: ['super_admin', 'admin', 'editor']
  },
  {
    path: '/admin/courses/edit',
    resource: 'courses',
    action: 'update',
    allowedRoles: ['super_admin', 'admin', 'editor']
  },
  {
    path: '/admin/teachers',
    resource: 'teachers',
    action: 'read',
    allowedRoles: ['super_admin', 'admin', 'editor', 'viewer']
  },
  {
    path: '/admin/teachers/create',
    resource: 'teachers',
    action: 'create',
    allowedRoles: ['super_admin', 'admin', 'editor']
  },
  {
    path: '/admin/teachers/edit',
    resource: 'teachers',
    action: 'update',
    allowedRoles: ['super_admin', 'admin', 'editor']
  },
  {
    path: '/admin/articles',
    resource: 'articles',
    action: 'read',
    allowedRoles: ['super_admin', 'admin', 'editor', 'viewer']
  },
  {
    path: '/admin/articles/create',
    resource: 'articles',
    action: 'create',
    allowedRoles: ['super_admin', 'admin', 'editor']
  },
  {
    path: '/admin/articles/edit',
    resource: 'articles',
    action: 'update',
    allowedRoles: ['super_admin', 'admin', 'editor']
  },
  {
    path: '/admin/student-cases',
    resource: 'student-cases',
    action: 'read',
    allowedRoles: ['super_admin', 'admin', 'editor', 'viewer']
  },
  {
    path: '/admin/student-cases/create',
    resource: 'student-cases',
    action: 'create',
    allowedRoles: ['super_admin', 'admin', 'editor']
  },
  {
    path: '/admin/student-cases/edit',
    resource: 'student-cases',
    action: 'update',
    allowedRoles: ['super_admin', 'admin', 'editor']
  },
  {
    path: '/admin/page-configs',
    resource: 'page-configs',
    action: 'read',
    allowedRoles: ['super_admin', 'admin']
  },
  {
    path: '/admin/page-configs/edit',
    resource: 'page-configs',
    action: 'update',
    allowedRoles: ['super_admin', 'admin']
  },
  {
    path: '/admin/media',
    resource: 'media',
    action: 'read',
    allowedRoles: ['super_admin', 'admin', 'editor', 'viewer']
  },
  {
    path: '/admin/users',
    resource: 'users',
    action: 'read',
    allowedRoles: ['super_admin', 'admin']
  },
  {
    path: '/admin/users/create',
    resource: 'users',
    action: 'create',
    allowedRoles: ['super_admin', 'admin']
  },
  {
    path: '/admin/users/edit',
    resource: 'users',
    action: 'update',
    allowedRoles: ['super_admin', 'admin']
  },
  {
    path: '/admin/roles',
    resource: 'roles',
    action: 'read',
    allowedRoles: ['super_admin']
  },
  {
    path: '/admin/content-management',
    resource: 'content-management',
    action: 'read',
    allowedRoles: ['super_admin', 'admin', 'editor', 'viewer']
  }
];

/**
 * 操作权限配置
 */
export const OPERATION_PERMISSIONS: OperationPermission[] = [
  {
    operation: 'create_course',
    resource: 'courses',
    action: 'create'
  },
  {
    operation: 'update_course',
    resource: 'courses',
    action: 'update',
    conditions: [
      {
        field: 'created_by',
        operator: 'eq',
        custom: (context) => context.user.id === context.resource.created_by || context.user.role === 'admin'
      }
    ]
  },
  {
    operation: 'delete_course',
    resource: 'courses',
    action: 'delete'
  },
  {
    operation: 'publish_article',
    resource: 'articles',
    action: 'update',
    conditions: [
      {
        field: 'status',
        operator: 'eq',
        value: 'draft'
      }
    ]
  },
  {
    operation: 'upload_media',
    resource: 'media',
    action: 'create'
  },
  {
    operation: 'delete_media',
    resource: 'media',
    action: 'delete',
    conditions: [
      {
        field: 'uploaded_by',
        operator: 'eq',
        custom: (context) => context.user.id === context.resource.uploaded_by || ['admin', 'super_admin'].includes(context.user.role)
      }
    ]
  }
];

/**
 * 菜单权限配置
 */
export const MENU_PERMISSIONS: MenuPermission[] = [
  {
    path: '/admin/dashboard',
    resource: 'dashboard',
    action: 'read'
  },
  {
    path: '/admin/courses',
    resource: 'courses',
    action: 'read',
    children: [
      {
        path: '/admin/courses/create',
        resource: 'courses',
        action: 'create'
      }
    ]
  },
  {
    path: '/admin/teachers',
    resource: 'teachers',
    action: 'read',
    children: [
      {
        path: '/admin/teachers/create',
        resource: 'teachers',
        action: 'create'
      }
    ]
  },
  {
    path: '/admin/articles',
    resource: 'articles',
    action: 'read',
    children: [
      {
        path: '/admin/articles/create',
        resource: 'articles',
        action: 'create'
      }
    ]
  },
  {
    path: '/admin/student-cases',
    resource: 'student-cases',
    action: 'read',
    children: [
      {
        path: '/admin/student-cases/create',
        resource: 'student-cases',
        action: 'create'
      }
    ]
  },
  {
    path: '/admin/page-configs',
    resource: 'page-configs',
    action: 'read',
    requiredRole: 'admin'
  },
  {
    path: '/admin/media',
    resource: 'media',
    action: 'read'
  },
  {
    path: '/admin/users',
    resource: 'users',
    action: 'read',
    requiredRole: 'admin',
    children: [
      {
        path: '/admin/users/create',
        resource: 'users',
        action: 'create'
      }
    ]
  },
  {
    path: '/admin/roles',
    resource: 'roles',
    action: 'read',
    requiredRole: 'super_admin'
  },
  {
    path: '/admin/content-management',
    resource: 'content-management',
    action: 'read'
  }
];

/**
 * 完整权限配置
 */
export const PERMISSION_CONFIG: PermissionConfig = {
  roles: DEFAULT_ROLES,
  pages: PAGE_PERMISSIONS,
  operations: OPERATION_PERMISSIONS,
  menus: MENU_PERMISSIONS
};

/**
 * 获取角色权限
 */
export function getRolePermissions(roleName: string): Permission[] {
  const role = DEFAULT_ROLES.find(r => r.name === roleName);
  return role ? role.permissions : [];
}

/**
 * 获取资源的所有操作
 */
export function getResourceActions(resource: ResourceType): PermissionAction[] {
  const actions = new Set<PermissionAction>();
  DEFAULT_PERMISSIONS
    .filter(p => p.resource === resource)
    .forEach(p => actions.add(p.action));
  return Array.from(actions);
}

/**
 * 检查角色等级
 */
export function isHigherRole(role1: string, role2: string): boolean {
  const r1 = DEFAULT_ROLES.find(r => r.name === role1);
  const r2 = DEFAULT_ROLES.find(r => r.name === role2);
  if (!r1 || !r2) return false;
  return r1.level > r2.level;
}

/**
 * 获取页面权限配置
 */
export function getPagePermission(path: string): PagePermission | undefined {
  return PAGE_PERMISSIONS.find(p => {
    // 精确匹配或路径前缀匹配
    return p.path === path || (path.startsWith(p.path) && path.charAt(p.path.length) === '/');
  });
}

/**
 * 获取操作权限配置
 */
export function getOperationPermission(operation: string): OperationPermission | undefined {
  return OPERATION_PERMISSIONS.find(p => p.operation === operation);
}

export default PERMISSION_CONFIG;