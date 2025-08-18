import React from 'react';

/**
 * 确认对话框组件属性接口
 */
interface ConfirmDialogProps {
  /** 是否显示对话框 */
  isOpen: boolean;
  /** 对话框标题 */
  title: string;
  /** 对话框消息内容 */
  message: string;
  /** 确认按钮文本 */
  confirmText?: string;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 确认按钮样式类型 */
  confirmVariant?: 'default' | 'destructive';
  /** 确认回调函数 */
  onConfirm: () => void;
  /** 取消回调函数 */
  onCancel: () => void;
}

/**
 * 确认对话框组件
 * 用于显示需要用户确认的操作对话框
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  confirmVariant = 'default',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={onCancel}
      />
      
      {/* 对话框内容 */}
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        {/* 标题 */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {title}
        </h3>
        
        {/* 消息内容 */}
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        {/* 按钮组 */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              confirmVariant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;