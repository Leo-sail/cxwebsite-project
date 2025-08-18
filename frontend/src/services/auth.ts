/**
 * 认证服务
 */
import { supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';
import type { Database } from '../types/database';

/**
 * 管理员用户类型
 */
export type AdminUser = Database['public']['Tables']['admin_users']['Row'];

/**
 * 登录表单数据
 */
export interface LoginFormData {
  email: string;
  password: string;
}

/**
 * 注册表单数据
 */
export interface RegisterFormData {
  email: string;
  password: string;
  username: string;
  name: string;
}

/**
 * 认证响应类型
 */
export interface AuthResponse {
  user: AdminUser | null;
  session: Session | null;
  error?: string;
}

/**
 * 认证服务类
 */
class AuthService {
  /**
   * 用户登录
   */
  async login(credentials: LoginFormData): Promise<AuthResponse> {
    try {
      console.log('登录尝试:', credentials.email);
      
      // 测试Supabase连接
      const { data: testData, error: testError } = await supabase
        .from('admin_users')
        .select('count')
        .limit(1);
      
      console.log('Supabase连接测试:', { testData, testError });
      
      // 直接验证admin_users表中的用户名和密码
      const { data: adminUsers, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', credentials.email)
        .eq('is_active', true)
        .single();

      console.log('数据库查询结果:', { adminUsers, error });

      if (error || !adminUsers) {
        console.log('用户不存在或查询错误');
        return {
          user: null,
          session: null,
          error: '用户名或密码错误'
        };
      }

      // 验证密码（明文比较）
      console.log('密码比较:', { input: credentials.password, stored: adminUsers.password });
      if (credentials.password !== adminUsers.password) {
        console.log('密码不匹配');
        return {
          user: null,
          session: null,
          error: '用户名或密码错误'
        };
      }

      // 创建JWT token用于Supabase认证
      const payload = {
        aud: 'authenticated',
        exp: Math.floor(Date.now() / 1000) + 3600, // 1小时后过期
        sub: adminUsers.id,
        email: adminUsers.email,
        role: 'authenticated',
        iat: Math.floor(Date.now() / 1000)
      };
      
      // 创建简单的JWT token（仅用于开发环境）
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payloadStr = btoa(JSON.stringify(payload));
      const signature = btoa('dev_signature'); // 开发环境简化签名
      const jwtToken = `${header}.${payloadStr}.${signature}`;
      
      // 创建session对象
      const mockSession = {
        access_token: jwtToken,
        refresh_token: 'mock_refresh_' + Date.now(),
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
        user: {
          id: adminUsers.id,
          email: adminUsers.email,
          aud: 'authenticated',
          role: 'authenticated',
          email_confirmed_at: new Date().toISOString(),
          phone: '',
          confirmed_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          app_metadata: { role: 'authenticated' },
          user_metadata: { role: adminUsers.role },
          identities: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
      
      // 设置Supabase session
      await supabase.auth.setSession({
        access_token: jwtToken,
        refresh_token: mockSession.refresh_token
      });

      return {
        user: {
          id: adminUsers.id,
          email: adminUsers.email,
          password: adminUsers.password,
          is_active: adminUsers.is_active,
          role: adminUsers.role
        },
        session: mockSession as Session
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '登录失败，请稍后重试';
      return {
        user: null,
        session: null,
        error: errorMessage
      };
    }
  }

  /**
   * 用户注册（仅限管理员）
   */
  async register(userData: RegisterFormData): Promise<AuthResponse> {
    try {
      // 检查当前用户是否已登录
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        return {
          user: null,
          session: null,
          error: '只有管理员可以创建新的管理员账号'
        };
      }

      // 创建管理员用户档案
      const { data: newUser, error: insertError } = await supabase
        .from('admin_users')
        .insert({
          id: crypto.randomUUID(),
          email: userData.email,
          password: userData.password,
          is_active: true
        })
        .select()
        .single();

      if (insertError) {
        return {
          user: null,
          session: null,
          error: '创建用户档案失败：' + insertError.message
        };
      }

      return {
        user: newUser,
        session: null
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '注册失败，请稍后重试';
      return {
        user: null,
        session: null,
        error: errorMessage
      };
    }
  }

  /**
   * 用户登出
   */
  async logout(): Promise<void> {
    try {
      // 清除Supabase session
      await supabase.auth.signOut();
      
      // 清除本地存储的认证信息
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * 获取当前用户
   */
  async getCurrentUser(): Promise<AdminUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      return await this.getAdminUserProfile(user.id);
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * 获取当前会话
   */
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Get current session error:', error);
      return null;
    }
  }

  /**
   * 检查用户是否已登录
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getCurrentSession();
    const user = await this.getCurrentUser();
    return !!(session && user && user.is_active);
  }

  /**
   * 检查用户是否具有指定权限
   */
  async hasPermission(requiredRole: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user || !user.is_active) {
      return false;
    }

    // 权限层级：super_admin > admin > user
    const roleHierarchy: Record<string, number> = {
      'user': 1,
      'admin': 2,
      'super_admin': 3
    };

    const userRoleLevel = roleHierarchy[user.role || 'user'] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    return userRoleLevel >= requiredRoleLevel;
  }

  /**
   * 检查用户是否为超级管理员
   */
  async isSuperAdmin(): Promise<boolean> {
    return await this.hasPermission('super_admin');
  }

  /**
   * 检查用户是否为管理员（包括超级管理员）
   */
  async isAdmin(): Promise<boolean> {
    return await this.hasPermission('admin');
  }

  /**
   * 获取当前用户角色
   */
  async getCurrentUserRole(): Promise<string | null> {
    const user = await this.getCurrentUser();
    return user?.role || null;
  }

  /**
   * 更新用户密码
   */
  async updatePassword(newPassword: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { error: this.getErrorMessage(error.message) };
      }

      return {};
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '密码更新失败';
      return { error: errorMessage };
    }
  }

  /**
   * 更新用户档案
   */
  async updateProfile(profileData: Partial<Pick<AdminUser, 'email'>>): Promise<{ error?: string }> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        return { error: '用户未登录' };
      }

      const { error } = await supabase
        .from('admin_users')
        .update(profileData)
        .eq('id', currentUser.id);

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '档案更新失败';
      return { error: errorMessage };
    }
  }

  /**
   * 重置密码（发送重置邮件）
   */
  async resetPassword(email: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`
      });

      if (error) {
        return { error: this.getErrorMessage(error.message) };
      }

      return {};
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '发送重置邮件失败';
      return { error: errorMessage };
    }
  }

  /**
   * 监听认证状态变化
   */
  onAuthStateChange(callback: (user: AdminUser | null, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(async (_, session) => {
      let user: AdminUser | null = null;
      
      if (session?.user) {
        user = await this.getAdminUserProfile(session.user.id);
      }
      
      callback(user, session);
    });
  }

  /**
   * 获取管理员用户档案
   */
  private async getAdminUserProfile(userId: string): Promise<AdminUser | null> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return data as AdminUser;
    } catch (error) {
      console.error('Get admin user profile error:', error);
      return null;
    }
  }

  /**
   * 获取友好的错误信息
   */
  private getErrorMessage(errorMessage: string): string {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': '用户名或密码错误',
      'Email not confirmed': '邮箱未验证，请检查您的邮箱',
      'User not found': '用户不存在',
      'Invalid email': '邮箱格式不正确',
      'Password should be at least 6 characters': '密码至少需要6个字符',
      'User already registered': '该邮箱已被注册',
      'Email rate limit exceeded': '邮件发送频率过高，请稍后再试',
      'Signup is disabled': '注册功能已禁用',
      'Email link is invalid or has expired': '邮件链接无效或已过期',
      'Token has expired or is invalid': '令牌已过期或无效'
    };

    return errorMap[errorMessage] || errorMessage;
  }
}

// 导出认证服务实例
export const authService = new AuthService();

// 导出默认实例
export default authService;