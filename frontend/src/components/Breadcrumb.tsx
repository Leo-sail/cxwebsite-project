import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  /** 自定义面包屑项目 */
  items?: BreadcrumbItem[];
  /** 是否显示首页链接 */
  showHome?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 面包屑导航组件
 * 显示当前页面在网站中的位置层级
 */
export function Breadcrumb({ 
  items, 
  showHome = true, 
  className = '' 
}: BreadcrumbProps) {
  const location = useLocation();
  
  // 如果没有提供自定义items，则根据当前路径生成
  const breadcrumbItems = items || generateBreadcrumbItems(location.pathname);
  
  // 如果只有一个项目且是首页，则不显示面包屑
  if (breadcrumbItems.length <= 1 && location.pathname === '/') {
    return null;
  }

  return (
    <nav 
      className={`flex items-center space-x-1 text-sm text-gray-600 ${className}`}
      aria-label="面包屑导航"
    >
      {showHome && (
        <>
          <Link 
            to="/" 
            className="flex items-center hover:text-primary-600 transition-colors"
            aria-label="返回首页"
          >
            <HomeIcon className="w-4 h-4" />
            <span className="ml-1">首页</span>
          </Link>
          {breadcrumbItems.length > 0 && (
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          )}
        </>
      )}
      
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        
        return (
          <div key={item.path || index} className="flex items-center">
            {item.path && !isLast ? (
              <Link 
                to={item.path} 
                className="hover:text-primary-600 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-gray-900 font-medium' : ''}>
                {item.label}
              </span>
            )}
            
            {!isLast && (
              <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />
            )}
          </div>
        );
      })}
    </nav>
  );
}

/**
 * 根据路径生成面包屑项目
 */
function generateBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const pathSegments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];
  
  // 路径映射表
  const pathMap: Record<string, string> = {
    'courses': '课程中心',
    'teachers': '师资团队',
    'cases': '学员案例',
    'student-cases': '学员案例',
    'news': '新闻资讯',
    'articles': '新闻资讯',
    'about': '关于我们',
    'contact': '联系我们',
  };
  
  let currentPath = '';
  
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // 如果是详情页面（通常是数字ID），则不添加到面包屑
    if (/^\d+$/.test(segment)) {
      return;
    }
    
    const label = pathMap[segment] || segment;
    
    // 最后一个路径段不需要链接
    const isLast = index === pathSegments.length - 1;
    
    items.push({
      label,
      path: isLast ? undefined : currentPath,
    });
  });
  
  return items;
}

export default Breadcrumb;