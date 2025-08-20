/**
 * 网站底部组件
 */
import { Link } from 'react-router-dom';
import { useText } from '../hooks/useText';

/**
 * 快速链接
 */
const quickLinks = [
  { name: '首页', href: '/' },
  { name: '课程', href: '/courses' },
  { name: '师资', href: '/teachers' },
  { name: '学员案例', href: '/student-cases' },
];

/**
 * 服务链接
 */
const serviceLinks = [
  { name: '文章', href: '/articles' },
  { name: '关于我们', href: '/about' },
  { name: '联系我们', href: '/contact' },
];

/**
 * 网站底部组件
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  // 获取Footer文字内容
  const footerPhone = useText('footer_phone', 'footer');
  const footerEmail = useText('footer_email', 'footer');
  const footerAddress = useText('footer_address', 'footer');
  const footerTitle = useText('footer_title', 'footer');
  const footerDescription = useText('footer_description', 'footer');

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* 公司信息 */}
          <div className="space-y-8 xl:col-span-1">
            <div>
              <span className="text-2xl font-bold text-white">
                {footerTitle || import.meta.env.VITE_APP_TITLE || '教育平台'}
              </span>
              <p className="mt-4 text-gray-300 text-base">
                {footerDescription || import.meta.env.VITE_APP_DESCRIPTION || '专业的考研培训机构，助您实现名校梦想'}
              </p>
              <div className="flex justify-center space-x-6 mt-6">
                {/* 社交媒体链接 */}
                <a href="#" className="text-gray-400 hover:text-gray-300 hover:opacity-80 transition-all duration-200">
                  <span className="sr-only">微信</span>
                  <img 
                    src="/images/social/wechat-placeholder.svg"
                    alt="微信"
                    className="w-20 h-20 object-cover rounded-lg"
                    loading="lazy"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.dataset.fallback) {
                        img.src = '/images/social/default-placeholder.svg';
                        img.dataset.fallback = 'true';
                      }
                    }}
                  />
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-300 hover:opacity-80 transition-all duration-200">
                  <span className="sr-only">微博</span>
                  <img 
                    src="/images/social/weibo-placeholder.svg"
                    alt="微博"
                    className="w-20 h-20 object-cover rounded-lg"
                    loading="lazy"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.dataset.fallback) {
                        img.src = '/images/social/default-placeholder.svg';
                        img.dataset.fallback = 'true';
                      }
                    }}
                  />
                </a>
              </div>
            </div>
          </div>

          {/* 链接区域 */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  快速链接
                </h3>
                <ul className="mt-4 space-y-4">
                  {quickLinks.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="text-base text-gray-300 hover:text-white transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  服务
                </h3>
                <ul className="mt-4 space-y-4">
                  {serviceLinks.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="text-base text-gray-300 hover:text-white transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-1">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  联系信息
                </h3>
                <ul className="mt-4 space-y-4">
                  <li className="text-base text-gray-300">
                    <span className="block">{footerPhone || "电话：400-123-4567"}</span>
                  </li>
                  <li className="text-base text-gray-300">
                    <span className="block">{footerEmail || "邮箱：info@yourcompany.com"}</span>
                  </li>
                  <li className="text-base text-gray-300">
                    <span className="block">{footerAddress || "地址：北京市朝阳区示例街道123号"}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="mt-12 border-t border-gray-700 pt-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <Link to="/privacy" className="text-gray-400 hover:text-gray-300">
                隐私政策
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-gray-300">
                服务条款
              </Link>
            </div>
            <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
              &copy; {currentYear} {footerTitle || import.meta.env.VITE_APP_TITLE || '教育平台'}. 保留所有权利.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;