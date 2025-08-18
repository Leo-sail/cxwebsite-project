/**
 * Alert 警告提示组件
 * 支持多种类型、尺寸和自定义样式
 */
import React, { useState } from 'react';
import { cn } from '../../utils';

/**
 * Alert 类型
 */
export type AlertType = 'info' | 'success' | 'warning' | 'error';

/**
 * Alert 尺寸
 */
export type AlertSize = 'sm' | 'md' | 'lg';

/**
 * Alert 变体
 */
export type AlertVariant = 'filled' | 'outlined' | 'soft';

/**
 * Alert 组件属性
 */
export interface AlertProps {
  /** 警告类型 */
  type?: AlertType;
  /** 尺寸 */
  size?: AlertSize;
  /** 变体 */
  variant?: AlertVariant;
  /** 标题 */
  title?: string;
  /** 内容 */
  children?: React.ReactNode;
  /** 是否可关闭 */
  closable?: boolean;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 自定义图标 */
  icon?: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 关闭回调 */
  onClose?: () => void;
  /** 操作按钮 */
  action?: React.ReactNode;
  /** 是否显示边框 */
  bordered?: boolean;
}

/**
 * 默认图标组件
 */
const DefaultIcons = {
  info: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
  success: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
};

/**
 * 关闭图标组件
 */
const CloseIcon: React.FC = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

/**
 * Alert 主组件
 */
export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  size = 'md',
  variant = 'soft',
  title,
  children,
  closable = false,
  showIcon = true,
  icon,
  className,
  onClose,
  action,
  bordered = false,
}) => {
  const [visible, setVisible] = useState(true);
  
  const sizeConfig = {
    sm: {
      padding: 'p-3',
      iconSize: 'w-4 h-4',
      titleSize: 'text-sm font-medium',
      contentSize: 'text-sm',
      gap: 'gap-2',
    },
    md: {
      padding: 'p-4',
      iconSize: 'w-5 h-5',
      titleSize: 'text-base font-medium',
      contentSize: 'text-sm',
      gap: 'gap-3',
    },
    lg: {
      padding: 'p-6',
      iconSize: 'w-6 h-6',
      titleSize: 'text-lg font-semibold',
      contentSize: 'text-base',
      gap: 'gap-4',
    },
  };
  
  const config = sizeConfig[size];
  
  const getTypeClasses = () => {
    const typeConfig = {
      info: {
        filled: 'bg-blue-500 text-white border-blue-500',
        outlined: 'bg-white text-blue-700 border-blue-500',
        soft: 'bg-blue-50 text-blue-700 border-blue-200',
      },
      success: {
        filled: 'bg-green-500 text-white border-green-500',
        outlined: 'bg-white text-green-700 border-green-500',
        soft: 'bg-green-50 text-green-700 border-green-200',
      },
      warning: {
        filled: 'bg-yellow-500 text-white border-yellow-500',
        outlined: 'bg-white text-yellow-700 border-yellow-500',
        soft: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      },
      error: {
        filled: 'bg-red-500 text-white border-red-500',
        outlined: 'bg-white text-red-700 border-red-500',
        soft: 'bg-red-50 text-red-700 border-red-200',
      },
    };
    
    return typeConfig[type][variant];
  };
  
  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };
  
  if (!visible) {
    return null;
  }
  
  const alertIcon = icon || (showIcon ? DefaultIcons[type] : null);
  
  return (
    <div className={cn(
      'rounded-lg transition-all duration-200',
      config.padding,
      getTypeClasses(),
      bordered && 'border-2',
      className
    )}>
      <div className={cn('flex', config.gap)}>
        {/* 图标 */}
        {alertIcon && (
          <div className="flex-shrink-0">
            <div className={config.iconSize}>
              {alertIcon}
            </div>
          </div>
        )}
        
        {/* 内容区域 */}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={cn(config.titleSize, 'mb-1')}>
              {title}
            </h3>
          )}
          
          {children && (
            <div className={config.contentSize}>
              {children}
            </div>
          )}
        </div>
        
        {/* 操作区域 */}
        {(action || closable) && (
          <div className="flex-shrink-0 flex items-start gap-2">
            {action && (
              <div>
                {action}
              </div>
            )}
            
            {closable && (
              <button
                type="button"
                className={cn(
                  'inline-flex rounded-md p-1.5 transition-colors duration-200',
                  variant === 'filled'
                    ? 'text-white hover:bg-black hover:bg-opacity-10'
                    : type === 'info'
                    ? 'text-blue-500 hover:bg-blue-100'
                    : type === 'success'
                    ? 'text-green-500 hover:bg-green-100'
                    : type === 'warning'
                    ? 'text-yellow-500 hover:bg-yellow-100'
                    : 'text-red-500 hover:bg-red-100'
                )}
                onClick={handleClose}
              >
                <CloseIcon />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * AlertList 组件 - 警告列表
 */
export interface AlertListProps {
  /** 警告列表 */
  alerts: Array<{
    id: string;
    type?: AlertType;
    title?: string;
    message: string;
    closable?: boolean;
  }>;
  /** 最大显示数量 */
  maxCount?: number;
  /** 自定义类名 */
  className?: string;
  /** 关闭回调 */
  onClose?: (id: string) => void;
}

export const AlertList: React.FC<AlertListProps> = ({
  alerts,
  maxCount = 5,
  className,
  onClose,
}) => {
  const displayAlerts = alerts.slice(0, maxCount);
  
  return (
    <div className={cn('space-y-3', className)}>
      {displayAlerts.map((alert) => (
        <Alert
          key={alert.id}
          type={alert.type}
          title={alert.title}
          closable={alert.closable}
          onClose={() => onClose?.(alert.id)}
        >
          {alert.message}
        </Alert>
      ))}
      
      {alerts.length > maxCount && (
        <div className="text-sm text-gray-500 text-center">
          还有 {alerts.length - maxCount} 条消息
        </div>
      )}
    </div>
  );
};

/**
 * AlertBanner 组件 - 横幅警告
 */
export interface AlertBannerProps extends Omit<AlertProps, 'size'> {
  /** 是否固定在顶部 */
  fixed?: boolean;
  /** 是否全宽 */
  fullWidth?: boolean;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  fixed = false,
  fullWidth = true,
  className,
  ...alertProps
}) => {
  return (
    <div className={cn(
      fixed && 'fixed top-0 left-0 right-0 z-50',
      fullWidth && 'w-full',
      className
    )}>
      <Alert
        {...alertProps}
        size="md"
        className={cn(
          fullWidth && 'rounded-none',
          className
        )}
      />
    </div>
  );
};

/**
 * AlertCard 组件 - 卡片式警告
 */
export interface AlertCardProps extends AlertProps {
  /** 是否显示阴影 */
  shadow?: boolean;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  shadow = true,
  className,
  ...alertProps
}) => {
  return (
    <Alert
      {...alertProps}
      bordered
      className={cn(
        shadow && 'shadow-lg',
        className
      )}
    />
  );
};

/**
 * AlertDescription 组件属性
 */
export interface AlertDescriptionProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * AlertDescription 组件
 */
export const AlertDescription: React.FC<AlertDescriptionProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Alert;