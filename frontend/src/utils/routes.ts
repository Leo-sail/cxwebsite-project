/**
 * 路由工具函数
 */

/**
 * 前台路由路径常量
 */
export const ROUTES = {
  HOME: '/',
  COURSES: '/courses',
  COURSE_DETAIL: '/courses/:id',
  TEACHERS: '/teachers',
  TEACHER_DETAIL: '/teachers/:id',
  STUDENT_CASES: '/student-cases',
  CASE_DETAIL: '/student-cases/:id',
  ARTICLES: '/articles',
  ARTICLE_DETAIL: '/articles/:id',
  ABOUT: '/about',
  CONTACT: '/contact',
} as const;

/**
 * 后台路由路径常量
 */
export const ADMIN_ROUTES = {
  LOGIN: '/admin/login',
  DASHBOARD: '/admin/dashboard',
  COURSES: '/admin/courses',
  TEACHERS: '/admin/teachers',
  STUDENT_CASES: '/admin/cases',                    // 修复：与实际路由一致
  ARTICLES: '/admin/articles',
  PAGE_CONFIGS: '/admin/page-config',               // 修复：与实际路由一致
  MEDIA_FILES: '/admin/media',                      // 修复：与实际路由一致
  THEME_MANAGEMENT: '/admin/theme-management',      // 新增：补充缺少的常量
  STYLE_CONFIGURATION: '/admin/style-configuration', // 新增：补充缺少的常量
  CONTENT_MANAGEMENT: '/admin/content-management',  // 新增：补充缺少的常量
  CONTENT_SETTINGS: '/admin/content-settings',      // 新增：信息管理
  PERMISSION_CONFIG: '/admin/permission-config',
  CONTACT_MANAGEMENT: '/admin/contact-management',
  UI_CONFIG_MANAGER: '/admin/ui-config-manager',
} as const;

/**
 * 生成课程详情页路径
 */
export function getCourseDetailPath(id: string | number): string {
  return `/courses/${id}`;
}

/**
 * 生成教师详情页路径
 */
export function getTeacherDetailPath(id: string | number): string {
  return `/teachers/${id}`;
}

/**
 * 生成学员案例详情页路径
 */
export function getCaseDetailPath(id: string | number): string {
  return `/student-cases/${id}`;
}

/**
 * 生成文章详情页路径
 */
export function getArticleDetailPath(id: string | number): string {
  return `/articles/${id}`;
}

/**
 * 检查当前路径是否匹配指定路由
 */
export function isRouteActive(currentPath: string, targetPath: string): boolean {
  if (targetPath === '/') {
    return currentPath === '/';
  }
  return currentPath.startsWith(targetPath);
}

/**
 * 获取路由的面包屑信息
 */
export function getBreadcrumbForRoute(pathname: string): Array<{ label: string; path?: string }> {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: Array<{ label: string; path?: string }> = [];
  
  const routeLabels: Record<string, string> = {
    'courses': '课程中心',
    'teachers': '师资团队',
    'student-cases': '学员案例',
    'articles': '新闻资讯',
    'about': '关于我们',
    'contact': '联系我们',
  };
  
  let currentPath = '';
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // 跳过数字ID段
    if (/^\d+$/.test(segment)) {
      return;
    }
    
    const label = routeLabels[segment] || segment;
    const isLast = index === segments.length - 1;
    
    breadcrumbs.push({
      label,
      path: isLast ? undefined : currentPath,
    });
  });
  
  return breadcrumbs;
}

/**
 * 导航菜单项配置
 */
export const NAVIGATION_ITEMS = [
  {
    label: '首页',
    path: ROUTES.HOME,
  },
  {
    label: '课程中心',
    path: ROUTES.COURSES,
  },
  {
    label: '师资团队',
    path: ROUTES.TEACHERS,
  },
  {
    label: '学员案例',
    path: ROUTES.STUDENT_CASES,
  },
  {
    label: '新闻资讯',
    path: ROUTES.ARTICLES,
  },
  {
    label: '关于我们',
    path: ROUTES.ABOUT,
  },
  {
    label: '联系我们',
    path: ROUTES.CONTACT,
  },
] as const;

/**
 * 后台管理导航菜单项
 * 注意：已删除页面配置、主题管理、样式配置、UI配置管理、权限演示菜单项
 */
export const ADMIN_NAVIGATION_ITEMS = [
  {
    label: '仪表盘',
    path: ADMIN_ROUTES.DASHBOARD,
    icon: 'dashboard',
  },
  {
    label: '课程管理',
    path: ADMIN_ROUTES.COURSES,
    icon: 'courses',
  },
  {
    label: '师资管理',
    path: ADMIN_ROUTES.TEACHERS,
    icon: 'teachers',
  },
  {
    label: '学员案例',
    path: ADMIN_ROUTES.STUDENT_CASES,
    icon: 'cases',
  },
  {
    label: '文章管理',
    path: ADMIN_ROUTES.ARTICLES,
    icon: 'articles',
  },
  {
    label: '联系管理',
    path: ADMIN_ROUTES.CONTACT_MANAGEMENT,
    icon: 'contact',
  },
  {
    label: '媒体文件',
    path: ADMIN_ROUTES.MEDIA_FILES,
    icon: 'media',
  },
  {
    label: '权限配置',
    path: ADMIN_ROUTES.PERMISSION_CONFIG,
    icon: 'settings',
  },
  // 已删除的菜单项（路由常量保留，可通过直接URL访问）：
  // {
  //   label: '页面配置',
  //   path: ADMIN_ROUTES.PAGE_CONFIGS,
  //   icon: 'settings',
  // },
  // {
  //   label: '主题管理',
  //   path: ADMIN_ROUTES.THEME_MANAGEMENT,
  //   icon: 'theme',
  // },
  // {
  //   label: '样式配置',
  //   path: ADMIN_ROUTES.STYLE_CONFIGURATION,
  //   icon: 'style',
  // },
  // {
  //   label: 'UI配置管理',
  //   path: ADMIN_ROUTES.UI_CONFIG_MANAGER,
  //   icon: 'cog',
  // },
  // {
  //   label: '权限演示',
  //   path: ADMIN_ROUTES.PERMISSION_DEMO,
  //   icon: 'shield',
  // },
] as const;