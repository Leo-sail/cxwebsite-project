interface SEOProps {
  /** 页面标题 */
  title?: string;
  /** 页面描述 */
  description?: string;
  /** 页面关键词 */
  keywords?: string;
  /** 页面图片 */
  image?: string;
  /** 页面URL */
  url?: string;
  /** 页面类型 */
  type?: 'website' | 'article';
  /** 是否为首页 */
  isHomePage?: boolean;
}

/**
 * SEO组件 - 使用React 19原生API
 * 用于设置页面的meta标签，优化搜索引擎收录
 * 支持动态标题、meta标签、Open Graph、Twitter Cards和结构化数据
 */
export function SEO({
  title,
  description = '专业的考研培训机构，提供优质的考研辅导课程和师资团队，助力学员成功考研。',
  keywords = '考研培训,考研辅导,考研课程,考研老师,考研机构',
  image = '/images/og-image.jpg',
  url,
  type = 'website',
  isHomePage = false,
}: SEOProps) {
  const siteTitle = '考研培训机构';
  const fullTitle = isHomePage ? siteTitle : title ? `${title} - ${siteTitle}` : siteTitle;
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  // 结构化数据
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: siteTitle,
    description: description,
    url: currentUrl,
    logo: image,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'CN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
    },
  };

  return (
    <>
      {/* 页面标题 */}
      <title>{fullTitle}</title>
      
      {/* 基础meta标签 */}
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="考研培训机构" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      
      {/* Open Graph标签 */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="zh_CN" />
      
      {/* Twitter Card标签 */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* SEO优化标签 */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      
      {/* 移动端优化 */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
      
      {/* 结构化数据 */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
    </>
  );
}

export default SEO;
