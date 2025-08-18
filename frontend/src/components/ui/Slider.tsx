/**
 * Slider 滑块组件
 * 支持单值和范围选择，多种尺寸和自定义样式
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '../../utils';

/**
 * Slider 尺寸
 */
export type SliderSize = 'sm' | 'md' | 'lg';

/**
 * Slider 组件属性
 */
export interface SliderProps {
  /** 当前值 */
  value?: number | [number, number];
  /** 默认值 */
  defaultValue?: number | [number, number];
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 步长 */
  step?: number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否为范围选择 */
  range?: boolean;
  /** 尺寸 */
  size?: SliderSize;
  /** 是否垂直方向 */
  vertical?: boolean;
  /** 是否显示标记 */
  marks?: boolean | Record<number, string | React.ReactNode>;
  /** 是否显示提示 */
  tooltip?: boolean | 'always' | 'hover';
  /** 提示格式化函数 */
  tipFormatter?: (value: number) => string;
  /** 自定义类名 */
  className?: string;
  /** 变化回调 */
  onChange?: (value: number | [number, number]) => void;
  /** 变化完成回调 */
  onAfterChange?: (value: number | [number, number]) => void;
  /** 标签 */
  label?: string;
  /** 描述 */
  description?: string;
  /** 是否必填 */
  required?: boolean;
  /** 错误状态 */
  error?: boolean;
  /** 错误信息 */
  errorMessage?: string;
}

/**
 * 获取滑块轨道上的位置百分比
 */
const getPercentage = (value: number, min: number, max: number): number => {
  return ((value - min) / (max - min)) * 100;
};

/**
 * 根据位置百分比获取值
 */
const getValue = (percentage: number, min: number, max: number, step: number): number => {
  const value = min + (percentage / 100) * (max - min);
  return Math.round(value / step) * step;
};

/**
 * Tooltip 组件
 */
const SliderTooltip: React.FC<{
  value: number;
  visible: boolean;
  formatter?: (value: number) => string;
  position: { left: string };
}> = ({ value, visible, formatter, position }) => {
  const displayValue = formatter ? formatter(value) : value.toString();
  
  return (
    <div
      className={cn(
        'absolute bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded',
        'transform -translate-x-1/2 transition-opacity duration-200',
        'pointer-events-none whitespace-nowrap',
        visible ? 'opacity-100' : 'opacity-0'
      )}
      style={position}
    >
      {displayValue}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900" />
    </div>
  );
};

/**
 * Slider 主组件
 */
export const Slider: React.FC<SliderProps> = ({
  value: controlledValue,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  range = false,
  size = 'md',
  vertical = false,
  marks = false,
  tooltip = 'hover',
  tipFormatter,
  className,
  onChange,
  onAfterChange,
  label,
  description,
  required = false,
  error = false,
  errorMessage,
}) => {
  const [internalValue, setInternalValue] = useState<number | [number, number]>(
    defaultValue
  );
  const [isDragging, setIsDragging] = useState(false);
  const [activeThumb, setActiveThumb] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const trackRef = useRef<HTMLDivElement>(null);
  
  // 判断是否为受控组件
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;
  
  const sizeConfig = {
    sm: {
      track: vertical ? 'w-1' : 'h-1',
      thumb: 'w-4 h-4',
      container: vertical ? 'h-32' : 'w-full',
    },
    md: {
      track: vertical ? 'w-2' : 'h-2',
      thumb: 'w-5 h-5',
      container: vertical ? 'h-40' : 'w-full',
    },
    lg: {
      track: vertical ? 'w-3' : 'h-3',
      thumb: 'w-6 h-6',
      container: vertical ? 'h-48' : 'w-full',
    },
  };
  
  const config = sizeConfig[size];
  
  // 确保值在有效范围内
  const normalizeValue = useCallback((val: number | [number, number]): number | [number, number] => {
    if (Array.isArray(val)) {
      return [
        Math.max(min, Math.min(max, val[0])),
        Math.max(min, Math.min(max, val[1]))
      ];
    }
    return Math.max(min, Math.min(max, val));
  }, [min, max]);
  
  const handleMouseDown = useCallback((event: React.MouseEvent, thumbIndex?: number) => {
    if (disabled) return;
    
    event.preventDefault();
    setIsDragging(true);
    setActiveThumb(thumbIndex ?? 0);
    
    if (tooltip === 'hover' || tooltip === 'always') {
      setShowTooltip(true);
    }
  }, [disabled, tooltip]);
  
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    let percentage: number;
    
    if (vertical) {
      percentage = ((rect.bottom - event.clientY) / rect.height) * 100;
    } else {
      percentage = ((event.clientX - rect.left) / rect.width) * 100;
    }
    
    percentage = Math.max(0, Math.min(100, percentage));
    const newValue = getValue(percentage, min, max, step);
    
    let updatedValue: number | [number, number];
    
    if (range && Array.isArray(value)) {
      if (activeThumb === 0) {
        updatedValue = [newValue, value[1]];
        if (updatedValue[0] > updatedValue[1]) {
          updatedValue = [updatedValue[1], updatedValue[0]];
          setActiveThumb(1);
        }
      } else {
        updatedValue = [value[0], newValue];
        if (updatedValue[1] < updatedValue[0]) {
          updatedValue = [updatedValue[1], updatedValue[0]];
          setActiveThumb(0);
        }
      }
    } else {
      updatedValue = newValue;
    }
    
    updatedValue = normalizeValue(updatedValue);
    
    if (!isControlled) {
      setInternalValue(updatedValue);
    }
    
    onChange?.(updatedValue);
  }, [isDragging, vertical, min, max, step, range, value, activeThumb, normalizeValue, isControlled, onChange]);
  
  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    setActiveThumb(null);
    
    if (tooltip === 'hover') {
      setShowTooltip(false);
    }
    
    onAfterChange?.(value);
  }, [isDragging, tooltip, onAfterChange, value]);
  
  const handleTrackClick = useCallback((event: React.MouseEvent) => {
    if (disabled || isDragging) return;
    
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    let percentage: number;
    
    if (vertical) {
      percentage = ((rect.bottom - event.clientY) / rect.height) * 100;
    } else {
      percentage = ((event.clientX - rect.left) / rect.width) * 100;
    }
    
    percentage = Math.max(0, Math.min(100, percentage));
    const newValue = getValue(percentage, min, max, step);
    
    let updatedValue: number | [number, number];
    
    if (range && Array.isArray(value)) {
      // 选择距离点击位置最近的滑块
      const dist1 = Math.abs(newValue - value[0]);
      const dist2 = Math.abs(newValue - value[1]);
      
      if (dist1 <= dist2) {
        updatedValue = [newValue, value[1]];
      } else {
        updatedValue = [value[0], newValue];
      }
    } else {
      updatedValue = newValue;
    }
    
    updatedValue = normalizeValue(updatedValue);
    
    if (!isControlled) {
      setInternalValue(updatedValue);
    }
    
    onChange?.(updatedValue);
    onAfterChange?.(updatedValue);
  }, [disabled, isDragging, vertical, min, max, step, range, value, normalizeValue, isControlled, onChange, onAfterChange]);
  
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  const renderMarks = () => {
    if (!marks) return null;
    
    const markPoints = typeof marks === 'boolean' 
      ? Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => min + i * step)
      : Object.keys(marks).map(Number);
    
    return (
      <div className={cn(
        'absolute',
        vertical ? 'left-full ml-2 h-full' : 'top-full mt-2 w-full'
      )}>
        {markPoints.map((mark) => {
          const percentage = getPercentage(mark, min, max);
          const markLabel = typeof marks === 'object' ? marks[mark] : mark.toString();
          
          return (
            <div
              key={mark}
              className={cn(
                'absolute text-xs text-gray-500',
                vertical ? 'transform -translate-y-1/2' : 'transform -translate-x-1/2'
              )}
              style={{
                [vertical ? 'bottom' : 'left']: `${percentage}%`,
              }}
            >
              {markLabel}
            </div>
          );
        })}
      </div>
    );
  };
  
  const renderThumb = (thumbValue: number, thumbIndex: number = 0) => {
    const percentage = getPercentage(thumbValue, min, max);
    const isActive = activeThumb === thumbIndex;
    const shouldShowTooltip = tooltip === 'always' || (tooltip === 'hover' && (showTooltip || isActive));
    
    return (
      <div
        key={thumbIndex}
        className={cn(
          'absolute transform -translate-x-1/2 -translate-y-1/2',
          'bg-white border-2 rounded-full shadow-md cursor-pointer transition-all duration-200',
          'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2',
          config.thumb,
          disabled
            ? 'border-gray-300 cursor-not-allowed'
            : error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-blue-500 focus:ring-blue-500',
          isActive && 'scale-110'
        )}
        style={{
          [vertical ? 'bottom' : 'left']: `${percentage}%`,
          [vertical ? 'left' : 'top']: '50%',
        }}
        onMouseDown={(e) => handleMouseDown(e, thumbIndex)}
        onMouseEnter={() => tooltip === 'hover' && setShowTooltip(true)}
        onMouseLeave={() => tooltip === 'hover' && !isDragging && setShowTooltip(false)}
        tabIndex={disabled ? -1 : 0}
      >
        {shouldShowTooltip && (
          <SliderTooltip
            value={thumbValue}
            visible={shouldShowTooltip}
            formatter={tipFormatter}
            position={{ left: '50%' }}
          />
        )}
      </div>
    );
  };
  
  const renderTrack = () => {
    let fillStyle: React.CSSProperties = {};
    
    if (range && Array.isArray(value)) {
      const startPercentage = getPercentage(value[0], min, max);
      const endPercentage = getPercentage(value[1], min, max);
      
      if (vertical) {
        fillStyle = {
          bottom: `${startPercentage}%`,
          height: `${endPercentage - startPercentage}%`,
        };
      } else {
        fillStyle = {
          left: `${startPercentage}%`,
          width: `${endPercentage - startPercentage}%`,
        };
      }
    } else {
      const percentage = getPercentage(value as number, min, max);
      
      if (vertical) {
        fillStyle = {
          bottom: 0,
          height: `${percentage}%`,
        };
      } else {
        fillStyle = {
          left: 0,
          width: `${percentage}%`,
        };
      }
    }
    
    return (
      <div
        ref={trackRef}
        className={cn(
          'relative rounded-full cursor-pointer',
          config.track,
          config.container,
          disabled
            ? 'bg-gray-200'
            : error
            ? 'bg-red-200'
            : 'bg-gray-200'
        )}
        onClick={handleTrackClick}
      >
        {/* 填充轨道 */}
        <div
          className={cn(
            'absolute rounded-full transition-all duration-200',
            config.track,
            disabled
              ? 'bg-gray-400'
              : error
              ? 'bg-red-500'
              : 'bg-blue-500'
          )}
          style={fillStyle}
        />
        
        {/* 滑块 */}
        {range && Array.isArray(value) ? (
          <>
            {renderThumb(value[0], 0)}
            {renderThumb(value[1], 1)}
          </>
        ) : (
          renderThumb(value as number, 0)
        )}
      </div>
    );
  };
  
  return (
    <div className={cn('space-y-2', className)}>
      {(label || description) && (
        <div>
          {label && (
            <h3 className={cn(
              'text-sm font-medium',
              error ? 'text-red-700' : 'text-gray-900'
            )}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className={cn(
        'relative',
        vertical ? 'flex justify-center' : 'py-2',
        marks && (vertical ? 'pr-12' : 'pb-6')
      )}>
        {renderTrack()}
        {renderMarks()}
      </div>
      
      {error && errorMessage && (
        <p className="text-sm text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default Slider;