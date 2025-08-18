/**
 * 联系我们页面
 */
import React, { useState } from 'react';
import { SEO, AnimatedContainer, GradientBackground } from '../components';
import { useFormValidation } from '../hooks/useValidation';

import { ContactService } from '../services/ContactService';
import { cn } from '../utils';


import {
  PhoneIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

/**
 * 联系表单数据类型
 */
interface ContactFormData {
  name: string;
  phone: string;
  subject: string;
  message: string;
  course_interest?: string;
}

/**
 * 联系我们页面组件
 */
const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    phone: '',
    subject: '',
    message: '',
    course_interest: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // 表单验证配置
  const validationConfig = {
    name: {
      required: true,
      type: 'string' as const,
      minLength: 2,
      maxLength: 50,
      sanitize: true
    },
    phone: {
      required: true,
      type: 'string' as const,
      pattern: /^1[3-9]\d{9}$/,
      sanitize: true
    },


    message: {
      required: false,
      type: 'string' as const,
      minLength: 0,
      maxLength: 1000,
      sanitize: true
    },
    course_interest: {
      type: 'string' as const,
      sanitize: true
    }
  };

  const { validateField, validateForm, hasFieldError, getFieldErrors, clearErrors } = useFormValidation(validationConfig);

  /**
   * 处理表单输入变化
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // 实时验证
    if (name in validationConfig) {
      validateField(name, value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 清除之前的错误
    clearErrors();
    
    // 验证整个表单
    const validationResult = validateForm(formData);
    if (!validationResult.isValid) {
      setSubmitStatus('error');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // 使用ContactService提交表单数据到Supabase
      await ContactService.submitContactForm({
        name: formData.name,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        courseInterest: formData.course_interest || undefined
      });
      
      console.log('联系表单提交成功');
      setSubmitStatus('success');
      
      // 重置表单
      setFormData({
        name: '',
        phone: '',

        subject: '',
        message: '',
        course_interest: ''
      });
    } catch (error) {
      console.error('提交失败:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="联系我们 - 考研教育平台"
        description="联系我们获取专业的考研咨询服务。提供多种联系方式，专业团队为您答疑解惑。"
        keywords="联系我们,考研咨询,在线咨询,客服电话,地址"
      />

      <div className="min-h-screen bg-gray-50">
        {/* 页面头部 */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700">
          <div className="relative z-10 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <AnimatedContainer animation={{ type: 'fade-in', duration: 500 }}>
                <div className="text-center text-white">
                  <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                        <ChatBubbleLeftRightIcon className="w-10 h-10 text-white" />
                      </div>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">联系我们</h1>
                  <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-6">
                    专业的考研咨询团队，随时为您提供帮助和指导
                  </p>
                  
                  {/* 快速联系方式 */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <div className="flex items-center bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl">
                      <PhoneIcon className="w-5 h-5 mr-2" />
                      <span className="font-medium">400-123-4567</span>
                    </div>

                  </div>
                </div>
              </AnimatedContainer>
            </div>
          </div>
          
          {/* 背景装饰 */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </section>

        {/* 联系信息和表单 */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* 联系信息 */}
              <AnimatedContainer animation={{ type: 'slide-in-up', duration: 600 }}>
                <div className="space-y-8">
                  <div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">联系方式</h2>
                    <p className="text-lg text-gray-600 mb-12">多种联系方式，随时为您提供专业服务</p>
                    
                    {/* 咨询热线 */}
                    <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 mb-6 border border-gray-100">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <PhoneIcon className="w-7 h-7 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">咨询热线</h3>
                          <p className="text-lg text-blue-600 font-semibold mb-2">400-123-4567</p>
                          <p className="text-gray-600">免费咨询，专业解答</p>
                        </div>
                      </div>
                    </div>



                    {/* 办公地址 */}
                    <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 mb-6 border border-gray-100">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <MapPinIcon className="w-7 h-7 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">办公地址</h3>
                          <p className="text-gray-700 mb-1">北京市海淀区中关村大街123号</p>
                          <p className="text-gray-700 mb-2">科技大厦15层</p>
                          <p className="text-gray-600">欢迎预约实地参观</p>
                        </div>
                      </div>
                    </div>

                    {/* 微信咨询 */}
                    <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 mb-8 border border-gray-100">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <ChatBubbleLeftRightIcon className="w-7 h-7 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">微信咨询</h3>
                          <p className="text-lg text-purple-600 font-semibold mb-2">kaoyan_edu_2024</p>
                          <p className="text-gray-600">扫码添加，即时沟通</p>
                        </div>
                      </div>
                    </div>

                    {/* 工作时间 */}
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                          <ClockIcon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">工作时间</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-700 font-medium">周一至周五</span>
                          <span className="text-gray-900 font-bold bg-white px-4 py-2 rounded-lg">9:00 - 18:00</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-700 font-medium">周六至周日</span>
                          <span className="text-gray-900 font-bold bg-white px-4 py-2 rounded-lg">10:00 - 17:00</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-700 font-medium">节假日</span>
                          <span className="text-gray-900 font-bold bg-white px-4 py-2 rounded-lg">预约咨询</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedContainer>

              {/* 联系表单 */}
              <AnimatedContainer animation={{ type: 'slide-in-left', duration: 700 }}>
                <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100 relative overflow-hidden">
                  {/* 背景装饰 */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100 to-blue-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                        <PaperAirplaneIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900">在线咨询</h2>
                        <p className="text-gray-600 mt-1">填写表单，我们将尽快与您联系</p>
                      </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* 姓名 */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3">
                          姓名 <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className={cn(
                              "w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white focus:bg-white",
                              hasFieldError('name') && "border-red-300 focus:border-red-500 focus:ring-red-500"
                            )}
                            placeholder="请输入您的姓名"
                          />
                        </div>
                        {hasFieldError('name') && (
                          <p className="mt-2 text-sm text-red-600">
                            {getFieldErrors('name')[0]}
                          </p>
                        )}
                      </div>

                      {/* 电话 */}
                      <div>
                        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-3">
                          联系电话 <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <PhoneIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className={cn(
                              "w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white focus:bg-white",
                              hasFieldError('phone') && "border-red-300 focus:border-red-500 focus:ring-red-500"
                            )}
                            placeholder="请输入您的联系电话"
                          />
                        </div>
                        {hasFieldError('phone') && (
                          <p className="mt-2 text-sm text-red-600">
                            {getFieldErrors('phone')[0]}
                          </p>
                        )}
                      </div>



                      {/* 课程兴趣 */}
                      <div>
                        <label htmlFor="course_interest" className="block text-sm font-semibold text-gray-700 mb-3">
                          感兴趣的课程
                        </label>
                        <select
                          id="course_interest"
                          name="course_interest"
                          value={formData.course_interest}
                          onChange={handleInputChange}
                          className={cn(
                            "w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white focus:bg-white",
                            hasFieldError('course_interest') && "border-red-300 focus:border-red-500 focus:ring-red-500"
                          )}
                        >
                          <option value="">请选择感兴趣的课程</option>
                          <option value="数学">考研数学</option>
                          <option value="英语">考研英语</option>
                          <option value="政治">考研政治</option>
                          <option value="专业课">专业课辅导</option>
                          <option value="全程班">全程班</option>
                          <option value="冲刺班">冲刺班</option>
                        </select>
                        {hasFieldError('course_interest') && (
                          <p className="mt-2 text-sm text-red-600">
                            {getFieldErrors('course_interest')[0]}
                          </p>
                        )}
                      </div>



                      {/* 详细信息 */}
                      <div>
                        <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-3">
                          详细信息
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          rows={5}
                          className={cn(
                            "w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-300 bg-gray-50 hover:bg-white focus:bg-white",
                            hasFieldError('message') && "border-red-300 focus:border-red-500 focus:ring-red-500"
                          )}
                          placeholder="请详细描述您的问题或需求，我们会尽快为您解答"
                        />
                        {hasFieldError('message') && (
                          <p className="mt-2 text-sm text-red-600">
                            {getFieldErrors('message')[0]}
                          </p>
                        )}
                      </div>

                      {/* 提交状态提示 */}
                      {submitStatus === 'success' && (
                        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl shadow-lg">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4">
                              <CheckCircleIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="text-green-800 font-semibold text-lg">提交成功！</p>
                              <p className="text-green-700 text-sm mt-1">我们会尽快与您联系，请保持电话畅通。</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {submitStatus === 'error' && (
                        <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl shadow-lg">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-4">
                              <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="text-red-800 font-semibold text-lg">提交失败</p>
                              <p className="text-red-700 text-sm mt-1">请稍后重试或直接联系我们的客服热线。</p>
                            </div>
                          </div>
                        </div>
                      )}

                  {/* 提交按钮 */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        提交中...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                        提交咨询
                      </div>
                    )}
                  </button>
                    </form>
                  </div>
                </div>
              </AnimatedContainer>
            </div>
          </div>
        </section>

        {/* 地图区域 */}
        <section className="relative bg-gradient-to-br from-gray-50 to-blue-50 py-20">
          <GradientBackground />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedContainer animation={{ type: 'fade-in', duration: 800 }}>
              <div className="text-center mb-16">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                    <MapPinIcon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    位置导航
                  </h2>
                </div>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  欢迎来到我们的办公地点进行面对面咨询，我们期待与您的会面
                </p>
              </div>
              
              {/* 地图占位符 */}
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 h-96 flex items-center justify-center relative overflow-hidden">
                  {/* 背景装饰 */}
                  <div className="absolute inset-0">
                    <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-30 animate-pulse"></div>
                    <div className="absolute bottom-10 right-10 w-16 h-16 bg-purple-200 rounded-full opacity-40 animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-indigo-200 rounded-full opacity-25 animate-pulse delay-500"></div>
                  </div>
                  
                  <div className="text-center relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <MapPinIcon className="h-10 w-10 text-white" />
                    </div>
                    <p className="text-gray-600 text-lg font-medium mb-2">地图加载中...</p>
                    <p className="text-gray-500 mb-4">北京市海淀区中关村大街123号科技大厦15层</p>
                    <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span>营业时间: 9:00-18:00</span>
                      </div>
                      <div className="flex items-center">
                        <PhoneIcon className="h-4 w-4 mr-1" />
                        <span>400-123-4567</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 地图底部信息栏 */}
                <div className="bg-white p-6 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <MapPinIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">详细地址</p>
                        <p className="text-sm text-gray-600">北京市海淀区中关村大街123号科技大厦15层</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <ClockIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">营业时间</p>
                        <p className="text-sm text-gray-600">周一至周日 9:00-18:00</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <PhoneIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">联系电话</p>
                        <p className="text-sm text-gray-600">400-123-4567</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedContainer>
          </div>
        </section>
      </div>
    </>
  );
};

export default ContactPage;