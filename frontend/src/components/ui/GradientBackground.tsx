/**
 * GradientBackground 渐变背景组件
 */
import React from 'react';
import { cn } from '../../utils';

/**
 * 渐变类型
 */
export type GradientType = 'primary' | 'purple' | 'secondary' | 'success' | 'warning' | 'error' | 'custom';

/**
 * 渐变变体
 */
export type GradientVariant = 'default' | 'deep' | 'light';

/**
 * 渐变方向
 */
export type GradientDirection = 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-tr' | 'to-tl' | 'to-br' | 'to-bl';

/**
 * GradientBackground 组件属性
 */
export interface GradientBackgroundProps {
  children?: React.ReactNode;
  type?: GradientType;
  variant?: GradientVariant;
  direction?: GradientDirection;
  className?: string;
  customGradient?: string;
  opacity?: number;
}

/**
 * 验证variant参数
 */
const validateVariant = (variant?: string): GradientVariant => {
  const validVariants: GradientVariant[] = ['default', 'deep', 'light'];
  return validVariants.includes(variant as GradientVariant) ? (variant as GradientVariant) : 'default';
};

/**
 * 获取渐变类名
 */
const getGradientClass = (type: GradientType, variant: GradientVariant, direction: GradientDirection, customGradient?: string): string => {
  if (type === 'custom') {
    return customGradient || `bg-gradient-${direction} from-primary-500 to-primary-700`;
  }

  const gradientConfig = {
    primary: {
      default: `bg-gradient-${direction} from-primary-500 to-primary-700`,
      deep: `bg-gradient-${direction} from-primary-700 to-primary-900`,
      light: `bg-gradient-${direction} from-primary-300 to-primary-500`,
    },
    purple: {
      default: `bg-gradient-${direction} from-purple-500 to-purple-700`,
      deep: `bg-gradient-${direction} from-purple-700 to-purple-900`,
      light: `bg-gradient-${direction} from-purple-300 to-purple-500`,
    },
    secondary: {
      default: `bg-gradient-${direction} from-gray-500 to-gray-700`,
      deep: `bg-gradient-${direction} from-gray-700 to-gray-900`,
      light: `bg-gradient-${direction} from-gray-300 to-gray-500`,
    },
    success: {
      default: `bg-gradient-${direction} from-green-500 to-green-700`,
      deep: `bg-gradient-${direction} from-green-700 to-green-900`,
      light: `bg-gradient-${direction} from-green-300 to-green-500`,
    },
    warning: {
      default: `bg-gradient-${direction} from-yellow-500 to-yellow-700`,
      deep: `bg-gradient-${direction} from-yellow-700 to-yellow-900`,
      light: `bg-gradient-${direction} from-yellow-300 to-yellow-500`,
    },
    error: {
      default: `bg-gradient-${direction} from-red-500 to-red-700`,
      deep: `bg-gradient-${direction} from-red-700 to-red-900`,
      light: `bg-gradient-${direction} from-red-300 to-red-500`,
    },
  };

  const config = gradientConfig[type];
  return config?.[variant] || config?.default || `bg-gradient-${direction} from-gray-500 to-gray-700`;
};

/**
 * GradientBackground 组件
 */
export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  type = 'primary',
  variant = 'default',
  direction = 'to-r',
  className,
  customGradient,
  opacity = 1,
}) => {
  // 验证并获取有效的variant值
  const validVariant = validateVariant(variant);
  
  // 获取渐变类名
  const gradientClass = getGradientClass(type, validVariant, direction, customGradient);

  const opacityClass = opacity < 1 ? `opacity-${Math.round(opacity * 100)}` : '';

  return (
    <div
      className={cn(
        'relative',
        gradientClass,
        opacityClass,
        className
      )}
      style={{
        opacity: opacity < 1 ? opacity : undefined,
      }}
    >
      {children}
    </div>
  );
};

export default GradientBackground;