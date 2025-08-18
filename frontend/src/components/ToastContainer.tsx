/**
 * 通知容器组件
 */
import { useState, type ReactNode, useCallback } from 'react';
import Toast, { type ToastProps } from './Toast';
import { generateId } from '../utils';
import { type ToastType, type ToastContextType, ToastContext } from '../utils/toast';

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
}

/**
 * 通知提供者组件
 */
export const ToastProvider = ({ children, maxToasts = 5 }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  /**
   * 移除通知
   */
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /**
   * 显示通知
   */
  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, duration?: number) => {
      const id = generateId();
      const newToast: ToastProps = {
        id,
        type,
        title,
        message,
        duration,
        onClose: removeToast,
      };

      setToasts((prev) => {
        const updated = [newToast, ...prev];
        // 限制最大通知数量
        return updated.slice(0, maxToasts);
      });
    },
    [maxToasts, removeToast]
  );

  /**
   * 成功通知
   */
  const success = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast('success', title, message, duration);
    },
    [showToast]
  );

  /**
   * 错误通知
   */
  const error = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast('error', title, message, duration);
    },
    [showToast]
  );

  /**
   * 警告通知
   */
  const warning = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast('warning', title, message, duration);
    },
    [showToast]
  );

  /**
   * 信息通知
   */
  const info = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast('info', title, message, duration);
    },
    [showToast]
  );

  const value: ToastContextType = {
    showToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* 通知容器 */}
      <div
        aria-live="assertive"
        className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
      >
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};



export default ToastProvider;