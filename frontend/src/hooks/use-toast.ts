/**
 * Toast Hook
 */
import { useState, useCallback } from 'react';

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

interface ToastState {
  id: string;
  title?: string;
  description?: string;
  variant: 'default' | 'destructive' | 'success';
  duration: number;
}

let toastCount = 0;
const toastListeners: Array<(toasts: ToastState[]) => void> = [];
let toasts: ToastState[] = [];

const addToast = (toast: ToastProps) => {
  const id = (++toastCount).toString();
  const newToast: ToastState = {
    id,
    title: toast.title,
    description: toast.description,
    variant: toast.variant || 'default',
    duration: toast.duration || 5000,
  };
  
  toasts = [...toasts, newToast];
  toastListeners.forEach(listener => listener(toasts));
  
  // Auto remove after duration
  setTimeout(() => {
    removeToast(id);
  }, newToast.duration);
  
  return id;
};

const removeToast = (id: string) => {
  toasts = toasts.filter(toast => toast.id !== id);
  toastListeners.forEach(listener => listener(toasts));
};

/**
 * Toast hook
 */
export const useToast = () => {
  const [toastList] = useState<ToastState[]>(toasts); // Removed unused setToastList
  
  const subscribe = useCallback((listener: (toasts: ToastState[]) => void) => {
    toastListeners.push(listener);
    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) {
        toastListeners.splice(index, 1);
      }
    };
  }, []);
  
  const toast = useCallback((props: ToastProps) => {
    return addToast(props);
  }, []);
  
  const dismiss = useCallback((id: string) => {
    removeToast(id);
  }, []);
  
  return {
    toast,
    dismiss,
    toasts: toastList,
    subscribe,
  };
};

/**
 * Simple toast function for direct usage
 */
export const toast = (props: ToastProps) => {
  // Simple console log for now, can be enhanced with actual UI toast
  console.log('Toast:', props);
  
  // For development, show alert
  if (props.variant === 'destructive') {
    console.error('Error:', props.title || props.description);
  } else {
    console.info('Info:', props.title || props.description);
  }
};

export default useToast;