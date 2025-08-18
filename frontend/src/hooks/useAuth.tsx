/**
 * 认证Hook和Context
 */
import React, { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { authService, type AdminUser } from '../services/auth';
import { useAppStore } from '../store';

/**
 * 认证上下文类型
 */
interface AuthContextType {
  user: AdminUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error?: string }>;
  updateProfile: (profileData: Partial<Pick<AdminUser, 'email'>>) => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  isAuthenticated: boolean;
}

/**
 * 认证上下文
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 认证Provider组件属性
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 认证Provider组件
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 初始化认证状态
   */
  useEffect(() => {
    // 获取初始会话
    const initializeAuth = async () => {
      try {
        const currentSession = await authService.getCurrentSession();
        const currentUser = await authService.getCurrentUser();
        
        setSession(currentSession);
        setUser(currentUser);
        
        // 同步初始化useAppStore状态
        try {
          const { setUser: setAppUser } = useAppStore.getState();
          setAppUser(currentUser);
        } catch (syncError) {
          console.error('初始化状态同步失败:', syncError);
          // 不影响主要初始化流程
        }
      } catch (error) {
        console.error('Initialize auth error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // 监听认证状态变化
    const { data: { subscription } } = authService.onAuthStateChange(
      (user, session) => {
        setUser(user);
        setSession(session);
        setLoading(false);
        
        // 同步状态变化到useAppStore
        try {
          const { setUser: setAppUser } = useAppStore.getState();
          setAppUser(user);
        } catch (syncError) {
          console.error('状态变化同步失败:', syncError);
          // 不影响主要认证流程
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * 登录函数
   */
  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    setLoading(true);
    try {
      const result = await authService.login({ email, password });
      
      if (result.error) {
        return { error: result.error };
      }

      // 更新useAuth状态
      setUser(result.user);
      setSession(result.session);
      
      // 同步更新useAppStore状态
      try {
        const { setUser: setAppUser } = useAppStore.getState();
        setAppUser(result.user);
      } catch (syncError) {
        console.error('状态同步失败:', syncError);
        // 不影响主要登录流程
      }
      
      return {};
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '登录失败';
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 登出函数
   */
  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await authService.logout();
      
      // 清除useAuth状态
      setUser(null);
      setSession(null);
      
      // 同步清除useAppStore状态
      try {
        const { setUser: setAppUser } = useAppStore.getState();
        setAppUser(null);
      } catch (syncError) {
        console.error('状态同步失败:', syncError);
        // 不影响主要登出流程
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 更新密码
   */
  const updatePassword = async (newPassword: string): Promise<{ error?: string }> => {
    return await authService.updatePassword(newPassword);
  };

  /**
   * 更新用户档案
   */
  const updateProfile = async (
    profileData: Partial<Pick<AdminUser, 'email'>>
  ): Promise<{ error?: string }> => {
    const result = await authService.updateProfile(profileData);
    
    if (!result.error && user) {
      // 更新本地用户状态
      setUser({ ...user, ...profileData });
    }
    
    return result;
  };

  /**
   * 重置密码
   */
  const resetPassword = async (email: string): Promise<{ error?: string }> => {
    return await authService.resetPassword(email);
  };

  /**
   * 计算是否已认证
   */
  const isAuthenticated = !!(session && user && user.is_active);

  const value: AuthContextType = {
    user,
    session,
    loading,
    login,
    logout,
    updatePassword,
    updateProfile,
    resetPassword,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 * 用于在组件中访问认证状态和方法
 */
export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 导出上下文和类型供Hook使用
export { AuthContext };
export type { AuthContextType };