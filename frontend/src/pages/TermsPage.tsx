/**
 * 服务条款页面
 */
import React from 'react';
import { SEO } from '../components';

/**
 * 服务条款页面组件
 */
const TermsPage: React.FC = () => {
  return (
    <>
      <SEO
        title="服务条款 - 考研教育平台"
        description="了解使用我们平台的条款和条件。请仔细阅读这些条款，它们构成您与我们之间的法律协议。"
        keywords="服务条款,使用协议,法律条款,用户协议"
      />

      <div className="min-h-screen bg-gray-50">
        {/* 页面头部 */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">服务条款</h1>
              <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
                使用我们的服务前，请仔细阅读以下条款
              </p>
            </div>
          </div>
        </section>

        {/* 条款内容 */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
              {/* 更新时间 */}
              <div className="mb-8 text-sm text-gray-500">
                最后更新时间：2024年1月1日
              </div>

              {/* 条款内容 */}
              <div className="prose prose-lg max-w-none">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">引言</h2>
                  <p className="text-gray-600 leading-relaxed">
                    欢迎使用考研教育平台（以下简称"本平台"或"我们"）。本服务条款（以下简称"条款"）构成您与我们之间的法律协议。
                    通过访问或使用我们的服务，您同意受这些条款的约束。如果您不同意这些条款，请不要使用我们的服务。
                  </p>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">1. 服务描述</h2>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">1.1 服务内容</h3>
                  <p className="text-gray-600 mb-4">
                    本平台提供考研相关的教育服务，包括但不限于：
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                    <li>在线课程和学习资料</li>
                    <li>师资介绍和教学服务</li>
                    <li>学习进度跟踪和评估</li>
                    <li>学习社区和交流平台</li>
                    <li>考研资讯和成功案例分享</li>
                    <li>在线咨询和客服支持</li>
                  </ul>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">1.2 服务变更</h3>
                  <p className="text-gray-600">
                    我们保留随时修改、暂停或终止部分或全部服务的权利。对于重大变更，我们会提前通知用户。
                  </p>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">2. 用户账户</h2>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 账户注册</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                    <li>您必须提供真实、准确、完整的注册信息</li>
                    <li>您有责任维护账户信息的准确性和及时性</li>
                    <li>您必须年满18周岁或在监护人同意下使用服务</li>
                    <li>每个用户只能注册一个账户</li>
                  </ul>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 账户安全</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>您有责任保护账户密码的安全</li>
                    <li>不得与他人共享账户信息</li>
                    <li>发现账户被盗用应立即通知我们</li>
                    <li>您对账户下的所有活动承担责任</li>
                  </ul>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. 用户行为规范</h2>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 禁止行为</h3>
                  <p className="text-gray-600 mb-4">使用我们的服务时，您不得：</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                    <li>发布违法、有害、威胁、辱骂、诽谤的内容</li>
                    <li>侵犯他人的知识产权或其他权利</li>
                    <li>传播病毒、恶意代码或其他有害技术</li>
                    <li>进行任何形式的网络攻击或破坏行为</li>
                    <li>使用自动化工具或机器人访问服务</li>
                    <li>复制、修改、分发我们的内容用于商业目的</li>
                    <li>干扰或破坏服务的正常运行</li>
                  </ul>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 内容发布</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>您发布的内容必须真实、合法、不侵权</li>
                    <li>我们有权审核、编辑或删除不当内容</li>
                    <li>您授予我们使用您发布内容的非排他性许可</li>
                    <li>您对发布的内容承担全部法律责任</li>
                  </ul>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">4. 知识产权</h2>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 平台内容</h3>
                  <p className="text-gray-600 mb-4">
                    本平台的所有内容，包括但不限于文字、图片、视频、音频、软件、商标、标识等，
                    均受知识产权法保护，归我们或相关权利人所有。
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 使用许可</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>我们授予您有限的、非排他的、不可转让的使用许可</li>
                    <li>仅限于个人学习和非商业用途</li>
                    <li>不得进行反向工程、反编译或反汇编</li>
                    <li>不得移除或修改任何版权声明</li>
                  </ul>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">5. 付费服务</h2>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 费用和支付</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                    <li>部分服务可能需要付费，具体价格以页面显示为准</li>
                    <li>支付成功后即视为购买完成</li>
                    <li>我们保留调整价格的权利，但不影响已购买的服务</li>
                    <li>支付过程中的技术问题请及时联系客服</li>
                  </ul>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 退款政策</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>数字内容一经交付，原则上不支持退款</li>
                    <li>因技术故障导致的问题，我们会提供相应解决方案</li>
                    <li>特殊情况下的退款申请，我们会根据具体情况处理</li>
                    <li>退款处理时间为7-15个工作日</li>
                  </ul>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">6. 免责声明</h2>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 服务免责</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                    <li>我们不保证服务的绝对连续性和稳定性</li>
                    <li>不对学习效果或考试结果承担保证责任</li>
                    <li>不对第三方内容的准确性或可靠性负责</li>
                    <li>不对因不可抗力导致的服务中断承担责任</li>
                  </ul>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 损害赔偿限制</h3>
                  <p className="text-gray-600">
                    在法律允许的最大范围内，我们对任何间接、偶然、特殊或后果性损害不承担责任，
                    包括但不限于利润损失、数据丢失或业务中断。
                  </p>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">7. 隐私保护</h2>
                  <p className="text-gray-600">
                    我们重视您的隐私保护。关于个人信息的收集、使用和保护，请参阅我们的
                    <a href="/privacy" className="text-primary-600 hover:text-primary-700 underline">隐私政策</a>。
                    使用我们的服务即表示您同意我们的隐私政策。
                  </p>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">8. 服务终止</h2>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">8.1 终止条件</h3>
                  <p className="text-gray-600 mb-4">在以下情况下，我们可能暂停或终止您的账户：</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                    <li>违反本服务条款</li>
                    <li>提供虚假信息</li>
                    <li>长期不活跃（超过2年）</li>
                    <li>涉嫌违法行为</li>
                    <li>其他我们认为必要的情况</li>
                  </ul>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">8.2 终止后果</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>您将失去访问账户和服务的权利</li>
                    <li>账户中的数据可能被删除</li>
                    <li>未使用的付费服务可能无法继续使用</li>
                    <li>相关条款在终止后仍然有效</li>
                  </ul>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">9. 争议解决</h2>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">9.1 适用法律</h3>
                  <p className="text-gray-600 mb-4">
                    本条款的解释和执行适用中华人民共和国法律。
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">9.2 争议处理</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>优先通过友好协商解决争议</li>
                    <li>协商不成的，提交北京市海淀区人民法院管辖</li>
                    <li>争议解决期间，其他条款继续有效</li>
                  </ul>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">10. 条款修改</h2>
                  <p className="text-gray-600 mb-4">
                    我们保留随时修改本服务条款的权利。修改后的条款将在网站上公布，并自公布之日起生效。
                    如果您不同意修改后的条款，应停止使用我们的服务。继续使用服务即表示您接受修改后的条款。
                  </p>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">11. 其他条款</h2>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">11.1 完整协议</h3>
                  <p className="text-gray-600 mb-4">
                    本条款构成您与我们之间关于使用服务的完整协议，取代之前的所有协议和理解。
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">11.2 可分割性</h3>
                  <p className="text-gray-600 mb-4">
                    如果本条款的任何部分被认定为无效或不可执行，其余部分仍然有效。
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">11.3 不弃权</h3>
                  <p className="text-gray-600">
                    我们未行使或延迟行使任何权利或救济，不构成对该权利或救济的放弃。
                  </p>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">12. 联系我们</h2>
                  <p className="text-gray-600 mb-4">
                    如果您对本服务条款有任何疑问或建议，请通过以下方式联系我们：
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600 mb-2"><strong>邮箱：</strong> legal@example.com</p>
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

export default TermsPage;