import React from 'react';

interface LoadingSpinnerProps {
  /** 加载文本 */
  text?: string;
  /** 尺寸大小 */
  size?: 'small' | 'medium' | 'large';
  /** 自定义类名 */
  className?: string;
  /** 是否显示文本 */
  showText?: boolean;
}

/**
 * 加载旋转器组件
 * 提供统一的加载状态显示
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = '加载中...',
  size = 'medium',
  className = '',
  showText = true
}) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  };

  return (
    <div className={`loading-spinner ${sizeClasses[size]} ${className}`}>
      <div className="spinner-circle">
        <div className="spinner-inner"></div>
      </div>
      {showText && (
        <span className="spinner-text">{text}</span>
      )}
    </div>
  );
};

// 注入样式
const styles = `
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.spinner-circle {
  position: relative;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  animation: spin 1s linear infinite;
}

.spinner-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.spinner-small .spinner-circle {
  width: 1rem;
  height: 1rem;
}

.spinner-medium .spinner-circle {
  width: 2rem;
  height: 2rem;
}

.spinner-large .spinner-circle {
  width: 3rem;
  height: 3rem;
  border-width: 3px;
}

.spinner-text {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.spinner-small .spinner-text {
  font-size: 0.75rem;
}

.spinner-large .spinner-text {
  font-size: 1rem;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .spinner-circle {
    border-color: #374151;
    border-top-color: #60a5fa;
  }
  
  .spinner-text {
    color: #9ca3af;
  }
}
`;

// 注入样式到页面
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default LoadingSpinner;