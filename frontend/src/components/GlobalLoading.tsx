/**
 * 全局加载指示器组件
 */
import React from 'react';
import { useAppStore } from '../store';
import { cn } from "../utils";

/**
 * 全局加载指示器
 */
export const GlobalLoading: React.FC = () => {
  const isLoading = useAppStore(state => state.isLoading);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 shadow-xl flex items-center space-x-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="text-gray-700 font-medium">加载中...</span>
      </div>
    </div>
  );
};

/**
 * 页面级加载指示器
 */
interface PageLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({ 
  size = 'md', 
  message = '加载中...', 
  className 
}) => {
  const sizeClasses = {
    sm: 'h-32',
    md: 'h-64', 
    lg: 'h-96'
  };

  const spinnerSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={cn(
      'flex items-center justify-center',
      sizeClasses[size],
      className
    )}>
      <div className="flex flex-col items-center space-y-3">
        <div className={cn(
          'animate-spin rounded-full border-b-2 border-blue-600',
          spinnerSizes[size]
        )}></div>
        <span className="text-gray-600 text-sm">{message}</span>
      </div>
    </div>
  );
};

/**
 * 内联加载指示器
 */
interface InlineLoadingProps {
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({ 
  size = 'sm', 
  className 
}) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5'
  };

  return (
    <div className={cn(
      'animate-spin rounded-full border-b-2 border-current',
      sizeClasses[size],
      className
    )}></div>
  );
};

/**
 * 加载覆盖层
 */
interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = '加载中...',
  children,
  className
}) => {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700 text-sm">{message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalLoading;