/**
 * Progress 进度条组件
 * 支持线性和圆形进度条
 */
import React from 'react';
import { cn } from '../../utils';

/**
 * Progress 类型
 */
export type ProgressType = 'line' | 'circle';

/**
 * Progress 状态
 */
export type ProgressStatus = 'normal' | 'success' | 'error' | 'warning';

/**
 * Progress 尺寸
 */
export type ProgressSize = 'sm' | 'md' | 'lg';

/**
 * Progress 组件属性
 */
export interface ProgressProps {
  /** 进度百分比 (0-100) */
  percent: number;
  /** 进度条类型 */
  type?: ProgressType;
  /** 进度条状态 */
  status?: ProgressStatus;
  /** 进度条尺寸 */
  size?: ProgressSize;
  /** 是否显示百分比文字 */
  showPercent?: boolean;
  /** 自定义文字内容 */
  format?: (percent: number) => string;
  /** 是否显示动画 */
  animated?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 圆形进度条的宽度（仅type='circle'时有效） */
  width?: number;
  /** 进度条颜色 */
  color?: string;
  /** 背景颜色 */
  backgroundColor?: string;
}

/**
 * 线性进度条组件
 */
const LineProgress: React.FC<ProgressProps> = ({
  percent,
  status = 'normal',
  size = 'md',
  showPercent = true,
  format,
  animated = true,
  className,
  color,
  backgroundColor,
}) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };
  
  const statusColors = {
    normal: 'bg-blue-500',
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
  };
  
  const backgroundClasses = backgroundColor || 'bg-gray-200';
  const progressColor = color || statusColors[status];
  
  const displayText = format ? format(percent) : `${Math.round(percent)}%`;
  
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center gap-3">
        <div className={cn(
          'flex-1 rounded-full overflow-hidden',
          sizeClasses[size],
          backgroundClasses
        )}>
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300 ease-out',
              progressColor,
              animated && 'animate-pulse'
            )}
            style={{
              width: `${Math.min(Math.max(percent, 0), 100)}%`,
              backgroundColor: color,
            }}
          />
        </div>
        
        {showPercent && (
          <span className={cn(
            'text-sm font-medium',
            status === 'error' ? 'text-red-600' :
            status === 'success' ? 'text-green-600' :
            status === 'warning' ? 'text-yellow-600' :
            'text-gray-600'
          )}>
            {displayText}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * 圆形进度条组件
 */
const CircleProgress: React.FC<ProgressProps> = ({
  percent,
  status = 'normal',
  size = 'md',
  showPercent = true,
  format,
  className,
  width: customWidth,
  color,
  backgroundColor,
}) => {
  const sizeConfig = {
    sm: { width: 80, strokeWidth: 4, fontSize: 'text-xs' },
    md: { width: 120, strokeWidth: 6, fontSize: 'text-sm' },
    lg: { width: 160, strokeWidth: 8, fontSize: 'text-base' },
  };
  
  const config = sizeConfig[size];
  const width = customWidth || config.width;
  const strokeWidth = config.strokeWidth;
  const radius = (width - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percent / 100) * circumference;
  
  const statusColors = {
    normal: '#3b82f6', // blue-500
    success: '#10b981', // green-500
    error: '#ef4444', // red-500
    warning: '#f59e0b', // yellow-500
  };
  
  const progressColor = color || statusColors[status];
  const bgColor = backgroundColor || '#e5e7eb'; // gray-200
  
  const displayText = format ? format(percent) : `${Math.round(percent)}%`;
  
  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={width}
        height={width}
        className="transform -rotate-90"
      >
        {/* 背景圆环 */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* 进度圆环 */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>
      
      {showPercent && (
        <div className={cn(
          'absolute inset-0 flex items-center justify-center',
          config.fontSize,
          'font-medium',
          status === 'error' ? 'text-red-600' :
          status === 'success' ? 'text-green-600' :
          status === 'warning' ? 'text-yellow-600' :
          'text-gray-600'
        )}>
          {displayText}
        </div>
      )}
    </div>
  );
};

/**
 * Progress 主组件
 */
export const Progress: React.FC<ProgressProps> = ({
  type = 'line',
  ...props
}) => {
  if (type === 'circle') {
    return <CircleProgress {...props} />;
  }
  
  return <LineProgress {...props} />;
};

/**
 * 步骤进度条组件
 */
export interface StepProgressProps {
  /** 当前步骤 (从0开始) */
  current: number;
  /** 步骤列表 */
  steps: Array<{
    title: string;
    description?: string;
    icon?: React.ReactNode;
  }>;
  /** 进度条方向 */
  direction?: 'horizontal' | 'vertical';
  /** 尺寸 */
  size?: ProgressSize;
  /** 自定义类名 */
  className?: string;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  current,
  steps,
  direction = 'horizontal',
  size = 'md',
  className,
}) => {
  const sizeConfig = {
    sm: { circle: 'w-6 h-6 text-xs', line: 'h-0.5' },
    md: { circle: 'w-8 h-8 text-sm', line: 'h-1' },
    lg: { circle: 'w-10 h-10 text-base', line: 'h-1.5' },
  };
  
  const config = sizeConfig[size];
  
  const getStepStatus = (index: number) => {
    if (index < current) return 'completed';
    if (index === current) return 'active';
    return 'pending';
  };
  
  const getStepClasses = (status: string) => {
    const baseClasses = `${config.circle} rounded-full flex items-center justify-center font-medium transition-all duration-200`;
    
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-500 text-white`;
      case 'active':
        return `${baseClasses} bg-blue-500 text-white`;
      default:
        return `${baseClasses} bg-gray-200 text-gray-500`;
    }
  };
  
  const getLineClasses = (index: number) => {
    const baseClasses = `${config.line} transition-all duration-200`;
    const isCompleted = index < current;
    
    return `${baseClasses} ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`;
  };
  
  if (direction === 'vertical') {
    return (
      <div className={cn('flex flex-col', className)}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;
          
          return (
            <div key={index} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={getStepClasses(status)}>
                  {step.icon || (index + 1)}
                </div>
                {!isLast && (
                  <div className={cn('w-0.5 flex-1 mt-2', getLineClasses(index))} />
                )}
              </div>
              
              <div className="flex-1 pb-8">
                <h4 className={cn(
                  'font-medium',
                  status === 'completed' ? 'text-green-600' :
                  status === 'active' ? 'text-blue-600' :
                  'text-gray-500'
                )}>
                  {step.title}
                </h4>
                {step.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  
  return (
    <div className={cn('flex items-center', className)}>
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const isLast = index === steps.length - 1;
        
        return (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={getStepClasses(status)}>
                {step.icon || (index + 1)}
              </div>
              <div className="mt-2 text-center">
                <h4 className={cn(
                  'text-sm font-medium',
                  status === 'completed' ? 'text-green-600' :
                  status === 'active' ? 'text-blue-600' :
                  'text-gray-500'
                )}>
                  {step.title}
                </h4>
                {step.description && (
                  <p className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
            
            {!isLast && (
              <div className={cn('flex-1 mx-4', getLineClasses(index))} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Progress;