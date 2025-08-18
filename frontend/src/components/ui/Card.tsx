/**
 * Card 组件
 */
import React from 'react';
import { cn } from '../../utils';

/**
 * Card 组件属性
 */
export interface CardProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Card 组件
 */
export const Card: React.FC<CardProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * CardHeader 组件属性
 */
export interface CardHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * CardHeader 组件
 */
export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * CardTitle 组件属性
 */
export interface CardTitleProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * CardTitle 组件
 */
export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <h3
      className={cn(
        'text-2xl font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
};

/**
 * CardDescription 组件属性
 */
export interface CardDescriptionProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * CardDescription 组件
 */
export const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <p
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    >
      {children}
    </p>
  );
};

/**
 * CardContent 组件属性
 */
export interface CardContentProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * CardContent 组件
 */
export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  );
};

/**
 * CardFooter 组件属性
 */
export interface CardFooterProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * CardFooter 组件
 */
export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn('flex items-center p-6 pt-0', className)} {...props}>
      {children}
    </div>
  );
};

export default Card;