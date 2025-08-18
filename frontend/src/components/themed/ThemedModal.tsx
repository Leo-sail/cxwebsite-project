import React, { useEffect, useRef, useState } from 'react';
import { useComponentStyles } from '../../hooks/useTheme';
import { StyleMerger } from '../../utils/themeUtils';
import { ThemedButton } from './ThemedButton';
import { defaultModalStyles } from './modal.utils';

/**
 * Modal组件的属性接口
 */
export interface ThemedModalProps {
  /** 是否显示Modal */
  isOpen: boolean;
  /** 关闭Modal的回调函数 */
  onClose: () => void;
  /** Modal标题 */
  title?: string;
  /** Modal内容 */
  children: React.ReactNode;
  /** Modal变体 */
  variant?: 'default' | 'centered' | 'fullscreen' | 'drawer' | 'popup';
  /** Modal尺寸 */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** 是否显示关闭按钮 */
  showCloseButton?: boolean;
  /** 是否点击遮罩层关闭 */
  closeOnOverlayClick?: boolean;
  /** 是否按ESC键关闭 */
  closeOnEscape?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 头部内容 */
  header?: React.ReactNode;
  /** 底部内容 */
  footer?: React.ReactNode;
  /** 确认按钮文本 */
  confirmText?: string;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 确认回调 */
  onConfirm?: () => void;
  /** 取消回调 */
  onCancel?: () => void;
  /** 是否显示确认按钮 */
  showConfirmButton?: boolean;
  /** 是否显示取消按钮 */
  showCancelButton?: boolean;
  /** 确认按钮变体 */
  confirmVariant?: 'primary' | 'secondary' | 'danger' | 'success';
  /** 动画持续时间 */
  animationDuration?: number;
  /** z-index值 */
  zIndex?: number;
}

/**
 * 主题化Modal组件
 * 支持多种变体、尺寸和交互方式
 */
export const ThemedModal: React.FC<ThemedModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  variant = 'default',
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  style = {},
  header,
  footer,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  showConfirmButton = false,
  showCancelButton = false,
  confirmVariant = 'primary',
  animationDuration = 300,
  zIndex = 1000
}) => {
  const { getComponentStyles } = useComponentStyles('modal');
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // 获取组件样式
  const componentStyles = getComponentStyles() as Record<string, unknown>;
  const overlayStyles = ((componentStyles?.overlay as Record<string, unknown>)?.[variant] as React.CSSProperties) || {};
  const contentStyles = ((componentStyles?.content as Record<string, unknown>)?.[variant] as React.CSSProperties) || {};
  const headerStyles = ((componentStyles?.header as Record<string, unknown>)?.[variant] as React.CSSProperties) || {};
  const bodyStyles = ((componentStyles?.body as Record<string, unknown>)?.[variant] as React.CSSProperties) || {};
  const footerStyles = ((componentStyles?.footer as Record<string, unknown>)?.[variant] as React.CSSProperties) || {};

  // 处理Modal显示/隐藏动画
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
      
      // 动画结束后设置状态
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, animationDuration);
      
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(true);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsAnimating(false);
        document.body.style.overflow = '';
      }, animationDuration);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, animationDuration]);

  // ESC键关闭
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, isOpen, onClose]);

  // 处理遮罩层点击
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose();
    }
  };

  // 处理确认
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  // 处理取消
  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  // 如果不可见则不渲染
  if (!isVisible) return null;

  // 合并样式
  const overlayClassName = StyleMerger.mergeClassNames(
    'modal-overlay',
    `modal-overlay--${variant}`,
    isOpen ? 'modal-overlay--open' : 'modal-overlay--closed',
    isAnimating ? 'modal-overlay--animating' : ''
  );

  const contentClassName = StyleMerger.mergeClassNames(
    'modal-content',
    `modal-content--${variant}`,
    `modal-content--${size}`,
    isOpen ? 'modal-content--open' : 'modal-content--closed',
    isAnimating ? 'modal-content--animating' : '',
    className
  );

  const overlayStyle = {
    ...defaultModalStyles.overlay,
    ...overlayStyles,
    zIndex,
    animationDuration: `${animationDuration}ms`,
  } as React.CSSProperties;

  const contentStyle = {
    ...defaultModalStyles.content,
    ...contentStyles,
    ...style,
    animationDuration: `${animationDuration}ms`,
  } as React.CSSProperties;

  return (
    <div
      ref={overlayRef}
      className={overlayClassName}
      style={overlayStyle}
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className={contentClassName}
        style={contentStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        {(title || header || showCloseButton) && (
          <div className="modal-header" style={headerStyles}>
            {header || (
              <>
                {title && <h3 className="modal-title">{title}</h3>}
                {showCloseButton && (
                  <button
                    className="modal-close-button"
                    onClick={onClose}
                    aria-label="关闭"
                  >
                    ×
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* 主体内容 */}
        <div className="modal-body" style={bodyStyles}>
          {children}
        </div>

        {/* 底部 */}
        {(footer || showConfirmButton || showCancelButton) && (
          <div className="modal-footer" style={footerStyles}>
            {footer || (
              <div className="modal-actions">
                {showCancelButton && (
                  <ThemedButton
                    variant="secondary"
                    onClick={handleCancel}
                  >
                    {cancelText}
                  </ThemedButton>
                )}
                {showConfirmButton && (
                  <ThemedButton
                    variant={confirmVariant}
                    onClick={handleConfirm}
                  >
                    {confirmText}
                  </ThemedButton>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Modal确认对话框组件
 */
export interface ConfirmModalProps extends Omit<ThemedModalProps, 'children'> {
  /** 确认对话框内容 */
  message: string;
  /** 确认对话框类型 */
  type?: 'info' | 'warning' | 'error' | 'success';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  message,
  type = 'info',
  confirmVariant,
  ...props
}) => {
  // 根据类型设置默认的确认按钮变体
  const defaultConfirmVariant = confirmVariant || {
    info: 'primary',
    warning: 'primary',
    error: 'danger',
    success: 'success'
  }[type] as 'primary' | 'secondary' | 'danger' | 'success';

  return (
    <ThemedModal
      {...props}
      confirmVariant={defaultConfirmVariant}
      showConfirmButton={true}
      showCancelButton={true}
      variant="centered"
      size="sm"
    >
      <div className={`confirm-modal confirm-modal--${type}`}>
        <div className="confirm-modal__icon">
          {type === 'info' && 'ℹ️'}
          {type === 'warning' && '⚠️'}
          {type === 'error' && '❌'}
          {type === 'success' && '✅'}
        </div>
        <div className="confirm-modal__message">{message}</div>
      </div>
    </ThemedModal>
  );
};



export default ThemedModal;