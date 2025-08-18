/**
 * 认证相关Hook函数
 */
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './useAuth';
import type { AuthContextType } from './useAuth';

/**
 * 使用认证上下文的Hook
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * 认证守卫Hook
 */
export const useAuthGuard = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, loading, navigate]);

  return { isAuthenticated, loading };
};

/**
 * 角色守卫Hook
 */
export const useRoleGuard = (requiredRole?: 'admin' | 'super_admin') => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated && requiredRole) {
      if (requiredRole === 'super_admin' && (user as any)?.role !== 'super_admin') {
        navigate('/admin/dashboard');
      } else if (requiredRole === 'admin' && !['admin', 'super_admin'].includes((user as any)?.role || '')) {
        navigate('/admin/login');
      }
    }
  }, [loading, isAuthenticated, requiredRole, user, navigate]);

  return {
    hasAccess: !requiredRole || ((user as any)?.role === requiredRole || (requiredRole === 'admin' && (user as any)?.role === 'super_admin')),
    loading
  };
};