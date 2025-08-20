/**
 * 路由配置
 */
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Suspense } from 'react';

// 布局组件
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import LoadingSpinner from '../components/LoadingSpinner';

// 权限保护组件
import { AdminRoute, SuperAdminRoute, EditorRoute, GuestRoute } from '../components/ProtectedRoute';

// 懒加载包装器和性能监控
import { createLazyComponent, preloadComponents } from '../components/LazyWrapper/LazyWrapper';
import { performanceMonitor } from '../utils/performanceMonitor';

// 使用优化的懒加载组件
const HomePage = createLazyComponent(() => import('../pages/HomePage'), { preload: true });
const CoursesPage = createLazyComponent(() => import('../pages/CoursesPage'), { preload: true });
const CourseDetailPage = createLazyComponent(() => import('../pages/CourseDetailPage'));
const TeachersPage = createLazyComponent(() => import('../pages/TeachersPage'));
const TeacherDetailPage = createLazyComponent(() => import('../pages/TeacherDetailPage'));
const StudentCasesPage = createLazyComponent(() => import('../pages/StudentCasesPage'));
const StudentCaseDetailPage = createLazyComponent(() => import('../pages/StudentCaseDetailPage'));
const ArticlesPage = createLazyComponent(() => import('../pages/ArticlesPage'));
const ArticleDetailPage = createLazyComponent(() => import('../pages/ArticleDetailPage'));
const AboutPage = createLazyComponent(() => import('../pages/AboutPage'));
const ContactPage = createLazyComponent(() => import('../pages/ContactPage'));
const PrivacyPage = createLazyComponent(() => import('../pages/PrivacyPage'));
const TermsPage = createLazyComponent(() => import('../pages/TermsPage'));
// 管理后台页面
const AdminDashboard = createLazyComponent(() => import('../admin/pages/Dashboard'));
const AdminCourses = createLazyComponent(() => import('../admin/pages/Courses'));
const AdminTeachers = createLazyComponent(() => import('../admin/pages/Teachers'));
const AdminCases = createLazyComponent(() => import('../admin/pages/Cases'));
const AdminArticles = createLazyComponent(() => import('../admin/pages/Articles'));
const AdminMedia = createLazyComponent(() => import('../admin/pages/Media'));
const AdminContentManagement = createLazyComponent(() => import('../admin/pages/ContentManagement'));
const AdminLogin = createLazyComponent(() => import('../admin/pages/Login'), { preload: true });
// const DatabaseManager = createLazyComponent(() => import('../components/DatabaseManager')); // Removed - component deleted
// const DynamicContentDemo = createLazyComponent(() => import('../pages/DynamicContentDemo'));

const PermissionConfig = createLazyComponent(() => import('../pages/admin/PermissionConfig'));
const UnauthorizedPage = createLazyComponent(() => import('../pages/UnauthorizedPage'));

// 预加载关键页面
const preloadCriticalPages = () => {
  const criticalPages = [
    () => import('../pages/HomePage'),
    () => import('../pages/CoursesPage'),
    () => import('../admin/pages/Login')
  ];
  
  preloadComponents(criticalPages);
};

// 在空闲时预加载
if ('requestIdleCallback' in window) {
  requestIdleCallback(preloadCriticalPages);
} else {
  setTimeout(preloadCriticalPages, 2000);
}

/**
 * 路由配置
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HomePage />
          </Suspense>
        )
      },
      {
        path: 'courses',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <CoursesPage />
          </Suspense>
        )
      },
      {
        path: 'courses/:id',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <CourseDetailPage />
          </Suspense>
        )
      },
      {
        path: 'teachers',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <TeachersPage />
          </Suspense>
        )
      },
      {
        path: 'teachers/:id',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <TeacherDetailPage />
          </Suspense>
        )
      },
      {
        path: 'student-cases',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StudentCasesPage />
          </Suspense>
        )
      },
      {
        path: 'student-cases/:id',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StudentCaseDetailPage />
          </Suspense>
        )
      },
      {
        path: 'articles',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ArticlesPage />
          </Suspense>
        )
      },
      {
        path: 'articles/:id',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ArticleDetailPage />
          </Suspense>
        )
      },
      {
        path: 'about',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AboutPage />
          </Suspense>
        )
      },
      {
        path: 'contact',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ContactPage />
          </Suspense>
        )
      },
      {
        path: 'privacy',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <PrivacyPage />
          </Suspense>
        )
      },
      {
        path: 'terms',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <TermsPage />
          </Suspense>
        )
      },


    ]
  },
  {
    path: '/admin/login',
    element: (
      <GuestRoute>
        <Suspense fallback={<LoadingSpinner />}>
          <AdminLogin />
        </Suspense>
      </GuestRoute>
    )
  },
  {
    path: '/admin/unauthorized',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <UnauthorizedPage />
      </Suspense>
    )
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: (
          <AdminRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <AdminDashboard />
            </Suspense>
          </AdminRoute>
        )
      },
      {
        path: 'courses',
        element: (
          <EditorRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <AdminCourses />
            </Suspense>
          </EditorRoute>
        )
      },
      {
        path: 'teachers',
        element: (
          <EditorRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <AdminTeachers />
            </Suspense>
          </EditorRoute>
        )
      },
      {
        path: 'cases',
        element: (
          <EditorRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <AdminCases />
            </Suspense>
          </EditorRoute>
        )
      },
      {
        path: 'articles',
        element: (
          <EditorRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <AdminArticles />
            </Suspense>
          </EditorRoute>
        )
      },
      {
        path: 'content-management',
        element: (
          <EditorRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <AdminContentManagement />
            </Suspense>
          </EditorRoute>
        )
      },
      {
        path: 'media',
        element: (
          <EditorRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <AdminMedia />
            </Suspense>
          </EditorRoute>
        )
      },



      {
        path: 'permission-config',
        element: (
          <SuperAdminRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <PermissionConfig />
            </Suspense>
          </SuperAdminRoute>
        )
      },
      // {
      //   path: 'database-manager',
      //   element: (
      //     <SuperAdminRoute>
      //       <Suspense fallback={<LoadingSpinner />}>
      //         <DatabaseManager />
      //       </Suspense>
      //     </SuperAdminRoute>
      //   )
      // }, // Removed - DatabaseManager component deleted
      // {
      //   path: 'dynamic-content-demo',
      //   element: (
      
      //   )
      // }




    ]
  },
  {
    path: '*',
    element: (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-8">页面未找到</p>
          <a 
            href="/" 
            className="btn-primary"
          >
            返回首页
          </a>
        </div>
      </div>
    )
  }
]);

// 路由性能监控组件
const RouterWithPerformanceMonitoring: React.FC = () => {
  React.useEffect(() => {
    const startTime = performance.now();
    
    const handleRouteChange = () => {
      const endTime = performance.now();
      performanceMonitor.addMetric(
        '路由切换时间',
        endTime - startTime,
        'navigation'
      );
    };

    // 监听路由变化
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return null;
};

export { RouterWithPerformanceMonitoring };
export default router;