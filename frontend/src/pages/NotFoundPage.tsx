import { Link } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { SEO } from '../components';

/**
 * 404页面组件
 * 当用户访问不存在的页面时显示
 */
export function NotFoundPage() {
  return (
    <>
      <SEO 
        title="页面未找到"
        description="抱歉，您访问的页面不存在。请检查URL是否正确或返回首页。"
      />
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          {/* 404图标 */}
          <div className="mx-auto">
            <div className="text-9xl font-bold text-primary-600 mb-4">
              404
            </div>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
          </div>
          
          {/* 错误信息 */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">
              页面未找到
            </h1>
            <p className="text-lg text-gray-600">
              抱歉，您访问的页面不存在或已被移动。
            </p>
            <p className="text-sm text-gray-500">
              请检查URL是否正确，或者尝试以下操作：
            </p>
          </div>
          
          {/* 操作按钮 */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <HomeIcon className="w-5 h-5 mr-2" />
                返回首页
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                返回上页
              </button>
            </div>
          </div>
          
          {/* 快速导航 */}
          <div className="pt-8 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              您可能在寻找：
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Link
                to="/courses"
                className="text-primary-600 hover:text-primary-700 hover:underline transition-colors"
              >
                课程中心
              </Link>
              <Link
                to="/teachers"
                className="text-primary-600 hover:text-primary-700 hover:underline transition-colors"
              >
                师资团队
              </Link>
              <Link
                to="/student-cases"
                className="text-primary-600 hover:text-primary-700 hover:underline transition-colors"
              >
                学员案例
              </Link>
              <Link
                to="/articles"
                className="text-primary-600 hover:text-primary-700 hover:underline transition-colors"
              >
                新闻资讯
              </Link>
              <Link
                to="/about"
                className="text-primary-600 hover:text-primary-700 hover:underline transition-colors"
              >
                关于我们
              </Link>
              <Link
                to="/contact"
                className="text-primary-600 hover:text-primary-700 hover:underline transition-colors"
              >
                联系我们
              </Link>
            </div>
          </div>
          
          {/* 联系信息 */}
          <div className="pt-8 text-sm text-gray-500">
            <p>
              如果您认为这是一个错误，请
              <Link 
                to="/contact" 
                className="text-primary-600 hover:text-primary-700 hover:underline ml-1"
              >
                联系我们
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default NotFoundPage;