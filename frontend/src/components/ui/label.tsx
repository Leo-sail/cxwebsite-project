/**
 * Label 组件
 */
import React from 'react';
import { cn } from '../../utils';

/**
 * Label 组件属性
 */
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
}

/**
 * Label 组件
 */
export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className
        )}
        {...props}
      />
    );
  }
);

Label.displayName = "Label";

export default Label;