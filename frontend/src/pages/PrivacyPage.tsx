/**
 * 隐私政策页面
 */
import React from 'react';
import { SEO } from '../components';

/**
 * 隐私政策页面组件
 */
const PrivacyPage: React.FC = () => {
  return (
    <>
      <SEO
        title="隐私政策 - 考研教育平台"
        description="了解我们如何收集、使用和保护您的个人信息。我们承诺保护您的隐私权益。"
        keywords="隐私政策,个人信息保护,数据安全,用户隐私"
      />

      <div className="min-h-screen bg-gray-50">
        {/* 页面头部 */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">隐私政策</h1>
              <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
                我们重视并保护您的个人隐私
              </p>
            </div>
          </div>
        </section>

        {/* 政策内容 */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
              {/* 更新时间 */}
              <div className="mb-8 text-sm text-gray-500">
                最后更新时间：2024年1月1日
              </div>

              {/* 政策内容 */}
              <div className="prose prose-lg max-w-none">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">引言</h2>
                  <p className="text-gray-600 leading-relaxed">
                    考研教育平台（以下简称"我们"）非常重视用户的隐私保护。本隐私政策说明了我们如何收集、使用、存储和保护您的个人信息。
                    使用我们的服务即表示您同意本隐私政策的条款。
                  </p>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">1. 信息收集</h2>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">1.1 我们收集的信息类型</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                    <li>个人身份信息：姓名、电话号码、电子邮箱地址</li>
                    <li>学习信息：学历背景、专业方向、学习进度</li>
                    <li>技术信息：IP地址、浏览器类型、设备信息、访问时间</li>
                    <li>使用信息：页面访问记录、功能使用情况、学习行为数据</li>
                  </ul>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">1.2 信息收集方式</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>您主动提供的信息（注册、咨询、报名等）</li>
                    <li>自动收集的技术信息（Cookies、日志文件等）</li>
                    <li>第三方合作伙伴提供的信息（在您授权的情况下）</li>
                  </ul>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">2. 信息使用</h2>
                  <p className="text-gray-600 mb-4">我们使用收集的信息用于以下目的：</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>提供和改进我们的教育服务</li>
                    <li>个性化学习体验和课程推荐</li>
                    <li>处理您的咨询和报名申请</li>
                    <li>发送重要通知和学习提醒</li>
                    <li>进行数据分析以优化服务质量</li>
                    <li>防范欺诈和确保平台安全</li>
                    <li>遵守法律法规要求</li>
                  </ul>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. 信息共享</h2>
                  <p className="text-gray-600 mb-4">我们不会出售、出租或交易您的个人信息。在以下情况下，我们可能会共享您的信息：</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>获得您的明确同意</li>
                    <li>与我们的服务提供商共享（如支付处理、数据分析）</li>
                    <li>法律要求或政府部门要求</li>
                    <li>保护我们的权利、财产或安全</li>
                    <li>业务转让或合并情况下</li>
                  </ul>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">4. 信息安全</h2>
                  <p className="text-gray-600 mb-4">我们采取多种安全措施保护您的个人信息：</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>数据加密传输和存储</li>
                    <li>访问控制和身份验证</li>
                    <li>定期安全审计和漏洞扫描</li>
                    <li>员工隐私培训和保密协议</li>
                    <li>安全事件监控和响应机制</li>
                  </ul>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookies使用</h2>
                  <p className="text-gray-600 mb-4">
                    我们使用Cookies和类似技术来改善用户体验。Cookies帮助我们：
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>记住您的登录状态和偏好设置</li>
                    <li>分析网站使用情况和性能</li>
                    <li>提供个性化内容和广告</li>
                    <li>防范安全威胁</li>
                  </ul>
                  <p className="text-gray-600 mt-4">
                    您可以通过浏览器设置管理Cookies，但这可能影响某些功能的正常使用。
                  </p>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">6. 您的权利</h2>
                  <p className="text-gray-600 mb-4">您对个人信息享有以下权利：</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>访问权：查看我们持有的您的个人信息</li>
                    <li>更正权：要求更正不准确的个人信息</li>
                    <li>删除权：要求删除您的个人信息</li>
                    <li>限制处理权：限制我们处理您的个人信息</li>
                    <li>数据可携权：获取您的个人信息副本</li>
                    <li>反对权：反对我们处理您的个人信息</li>
                  </ul>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">7. 数据保留</h2>
                  <p className="text-gray-600">
                    我们仅在必要期间保留您的个人信息。保留期限取决于信息类型和使用目的：
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 mt-4">
                    <li>账户信息：账户存续期间及注销后1年</li>
                    <li>学习记录：完成学习后3年</li>
                    <li>技术日志：6个月</li>
                    <li>营销信息：您撤回同意后立即删除</li>
                  </ul>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">8. 未成年人保护</h2>
                  <p className="text-gray-600">
                    我们的服务主要面向成年人。如果您未满18岁，请在监护人同意和指导下使用我们的服务。
                    我们不会故意收集未满13岁儿童的个人信息。
                  </p>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">9. 政策更新</h2>
                  <p className="text-gray-600">
                    我们可能会不时更新本隐私政策。重大变更时，我们会通过网站公告、邮件等方式通知您。
                    继续使用我们的服务即表示您接受更新后的政策。
                  </p>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">10. 联系我们</h2>
                  <p className="text-gray-600 mb-4">
                    如果您对本隐私政策有任何疑问或需要行使您的权利，请通过以下方式联系我们：
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600 mb-2"><strong>邮箱：</strong> privacy@example.com</p>
                    <p className="text-gray-600 mb-2"><strong>电话：</strong> 400-123-4567</p>
                    <p className="text-gray-600 mb-2"><strong>地址：</strong> 北京市海淀区中关村大街1号</p>
                    <p className="text-gray-600"><strong>工作时间：</strong> 周一至周日 9:00-21:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default PrivacyPage;