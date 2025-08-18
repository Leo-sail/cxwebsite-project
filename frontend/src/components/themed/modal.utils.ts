/**
 * Modal相关的工具函数、hooks和常量
 */
import { useState } from 'react';
import type { ThemedModalProps } from './ThemedModal';

/**
 * Modal Hook - 用于程序化控制Modal
 */
export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalProps, setModalProps] = useState<Partial<ThemedModalProps>>({});

  const openModal = (props?: Partial<ThemedModalProps>) => {
    setModalProps(props || {});
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    openModal,
    closeModal,
    modalProps
  };
};

// 默认样式配置
export const defaultModalStyles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'var(--modal-overlay-bg, rgba(0, 0, 0, 0.5))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--modal-overlay-padding, 1rem)',
  },
  content: {
    backgroundColor: 'var(--modal-bg, #ffffff)',
    borderRadius: 'var(--modal-border-radius, 8px)',
    boxShadow: 'var(--modal-shadow, 0 10px 25px rgba(0, 0, 0, 0.1))',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative' as const,
  },
  header: {
    padding: 'var(--modal-header-padding, 1.5rem 1.5rem 0)',
    borderBottom: 'var(--modal-header-border, 1px solid #e5e7eb)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  body: {
    padding: 'var(--modal-body-padding, 1.5rem)',
  },
  footer: {
    padding: 'var(--modal-footer-padding, 0 1.5rem 1.5rem)',
    borderTop: 'var(--modal-footer-border, 1px solid #e5e7eb)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'var(--modal-footer-gap, 0.5rem)',
  }
};