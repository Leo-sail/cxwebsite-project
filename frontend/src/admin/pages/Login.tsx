/**
 * 管理员登录页面
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { SEO } from '../../components';
import { useAuth } from '../../hooks/useAuth';

import { useFormValidation, CommonValidationRules } from '../../hooks/useValidation';

/**
 * 管理员登录页面组件
 */
const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  // 表单验证配置
  const validationConfig = {
    email: CommonValidationRules.email,
    password: {
      required: true,
      type: 'string' as const,
      minLength: 6,
      maxLength: 128,
      sanitize: true
    }
  };

  // 使用验证Hook
  const {
    validateField,
    validateForm,
    getFieldErrors,
    hasFieldError,
    clearErrors
  } = useFormValidation(validationConfig);

  // 如果已经登录，重定向到管理后台
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  /**
   * 处理输入变化
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 清除之前的错误
    clearErrors(name);
    
    // 实时验证
    if (value.trim()) {
      validateField(name, value);
    }
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    clearErrors();

    // 验证表单数据
    const validationResult = validateForm(formData);
    
    if (!validationResult.isValid) {
      setError('请检查输入信息是否正确');
      setLoading(false);
      return;
    }

    try {
      // 使用清理后的数据进行登录
      const sanitizedData = validationResult.sanitizedValue || formData;
      const result = await login(sanitizedData.email, sanitizedData.password);
      
      if (result.error) {
        // 提供更具体的错误信息
        if (result.error.includes('Invalid login credentials')) {
          setError('邮箱或密码错误，请检查后重试');
        } else if (result.error.includes('Email not confirmed')) {
          setError('邮箱未验证，请先验证邮箱');
        } else if (result.error.includes('Too many requests')) {
          setError('登录尝试过于频繁，请稍后再试');
        } else if (result.error.includes('Network')) {
          setError('网络连接异常，请检查网络后重试');
        } else {
          setError(result.error || '登录失败，请重试');
        }
        return;
      }
      
      // 登录成功的情况下，useEffect会处理重定向
    } catch (err: unknown) {
      console.error('登录错误:', err);
      if (err instanceof Error) {
        if (err.message.includes('fetch')) {
          setError('网络连接失败，请检查网络连接');
        } else {
          setError(`登录失败: ${err.message}`);
        }
      } else {
        setError('登录失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="管理员登录 - 考研教育平台"
        description="管理员登录页面，请输入您的账号和密码进行登录。"
      />
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              管理员登录
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              请输入您的管理员账号和密码
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  邮箱地址
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${
                    hasFieldError('email') 
                      ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="邮箱地址"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {hasFieldError('email') && (
                  <div className="mt-1 text-sm text-red-600">
                    {getFieldErrors('email').join(', ')}
                  </div>
                )}
              </div>
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  密码
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className={`appearance-none relative block w-full px-3 py-2 pr-10 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${
                    hasFieldError('password') 
                      ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="密码"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {hasFieldError('password') && (
                  <div className="mt-1 text-sm text-red-600">
                    {getFieldErrors('password').join(', ')}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    登录中...
                  </div>
                ) : (
                  '登录'
                )}
              </button>
            </div>


          </form>
        </div>
      </div>

    </>
  );
};

export default Login;