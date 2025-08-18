import React from 'react';
import { useComponentStyles } from '../../hooks/useComponentStyles';

/**
 * Grid组件变体类型
 */
export type GridVariant = 'default' | 'masonry' | 'auto' | 'fixed';

/**
 * Grid组件间距类型
 */
export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Grid组件对齐方式
 */
export type GridAlignment = 'start' | 'center' | 'end' | 'stretch';

/**
 * 响应式断点配置
 */
export interface ResponsiveConfig {
  /** 移动端列数 */
  mobile?: number;
  /** 平板端列数 */
  tablet?: number;
  /** 桌面端列数 */
  desktop?: number;
  /** 大屏幕列数 */
  large?: number;
}

/**
 * Grid组件属性接口
 */
export interface GridProps {
  /** 列数 */
  columns?: number;
  /** 响应式配置 */
  responsive?: ResponsiveConfig;
  /** 行数（可选） */
  rows?: number;
  /** 网格间距 */
  gap?: GridGap;
  /** 行间距（如果与列间距不同） */
  rowGap?: GridGap;
  /** 列间距（如果与行间距不同） */
  columnGap?: GridGap;
  /** 组件变体 */
  variant?: GridVariant;
  /** 垂直对齐 */
  alignItems?: GridAlignment;
  /** 水平对齐 */
  justifyItems?: GridAlignment;
  /** 内容对齐 */
  alignContent?: GridAlignment;
  /** 内容分布 */
  justifyContent?: GridAlignment;
  /** 是否自动填充 */
  autoFit?: boolean;
  /** 最小列宽（用于auto-fit） */
  minColumnWidth?: string;
  /** 最大列宽（用于auto-fit） */
  maxColumnWidth?: string;
  /** 自定义CSS类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 子元素 */
  children: React.ReactNode;
}

/**
 * GridItem组件属性接口
 */
export interface GridItemProps {
  /** 列跨度 */
  colSpan?: number;
  /** 行跨度 */
  rowSpan?: number;
  /** 列起始位置 */
  colStart?: number;
  /** 列结束位置 */
  colEnd?: number;
  /** 行起始位置 */
  rowStart?: number;
  /** 行结束位置 */
  rowEnd?: number;
  /** 响应式列跨度 */
  responsiveColSpan?: ResponsiveConfig;
  /** 响应式行跨度 */
  responsiveRowSpan?: ResponsiveConfig;
  /** 自对齐 */
  alignSelf?: GridAlignment;
  /** 自分布 */
  justifySelf?: GridAlignment;
  /** 自定义CSS类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 子元素 */
  children: React.ReactNode;
}

/**
 * Grid组件
 * 提供响应式网格布局功能
 */
export const Grid: React.FC<GridProps> = ({
  columns = 12,
  responsive,
  rows,
  gap = 'md',
  rowGap,
  columnGap,
  variant = 'default',
  alignItems = 'stretch',
  justifyItems = 'stretch',
  alignContent = 'start',
  justifyContent = 'start',
  autoFit = false,
  minColumnWidth = '250px',
  maxColumnWidth = '1fr',
  className = '',
  style = {},
  children
}) => {
  const { getComponentStyles } = useComponentStyles('grid');

  // 获取组件样式
  const baseStyles = getComponentStyles(variant);

  // 获取间距值
  const getGapValue = (gapSize: GridGap): string => {
    switch (gapSize) {
      case 'none':
        return '0';
      case 'xs':
        return '0.25rem';
      case 'sm':
        return '0.5rem';
      case 'md':
        return '1rem';
      case 'lg':
        return '1.5rem';
      case 'xl':
        return '2rem';
      default:
        return '1rem';
    }
  };

  // 构建网格样式
  const getGridStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {
      display: 'grid',
      alignItems,
      justifyItems,
      alignContent,
      justifyContent
    };

    // 设置间距
    const gapValue = getGapValue(gap);
    const rowGapValue = rowGap ? getGapValue(rowGap) : gapValue;
    const columnGapValue = columnGap ? getGapValue(columnGap) : gapValue;
    
    styles.gap = `${rowGapValue} ${columnGapValue}`;

    // 设置网格模板
    if (autoFit) {
      styles.gridTemplateColumns = `repeat(auto-fit, minmax(${minColumnWidth}, ${maxColumnWidth}))`;
    } else if (responsive) {
      // 响应式网格将通过CSS类处理
      styles.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    } else {
      styles.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }

    if (rows) {
      styles.gridTemplateRows = `repeat(${rows}, 1fr)`;
    }

    return styles;
  };

  // 构建响应式类名
  const getResponsiveClasses = (): string => {
    if (!responsive) return '';

    const classes: string[] = [];

    if (responsive.mobile) {
      classes.push(`grid-cols-${responsive.mobile}`);
    }
    if (responsive.tablet) {
      classes.push(`md:grid-cols-${responsive.tablet}`);
    }
    if (responsive.desktop) {
      classes.push(`lg:grid-cols-${responsive.desktop}`);
    }
    if (responsive.large) {
      classes.push(`xl:grid-cols-${responsive.large}`);
    }

    return classes.join(' ');
  };

  // 获取变体类名
  const getVariantClass = (): string => {
    switch (variant) {
      case 'masonry':
        return 'grid-masonry';
      case 'auto':
        return 'grid-auto';
      case 'fixed':
        return 'grid-fixed';
      default:
        return 'grid-default';
    }
  };

  return (
    <div
      className={`grid-container ${getVariantClass()} ${getResponsiveClasses()} ${className}`}
      style={{
        ...baseStyles,
        ...getGridStyles(),
        ...style
      }}
    >
      {children}
    </div>
  );
};

/**
 * GridItem组件
 * 网格项目组件，用于控制单个网格项的布局
 */
export const GridItem: React.FC<GridItemProps> = ({
  colSpan,
  rowSpan,
  colStart,
  colEnd,
  rowStart,
  rowEnd,
  responsiveColSpan,
  responsiveRowSpan,
  alignSelf,
  justifySelf,
  className = '',
  style = {},
  children
}) => {
  const { getComponentStyles } = useComponentStyles('grid-item');

  // 获取组件样式
  const baseStyles = getComponentStyles();

  // 构建网格项样式
  const getGridItemStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {};

    if (colSpan) {
      styles.gridColumn = `span ${colSpan}`;
    }
    if (rowSpan) {
      styles.gridRow = `span ${rowSpan}`;
    }
    if (colStart && colEnd) {
      styles.gridColumn = `${colStart} / ${colEnd}`;
    } else if (colStart) {
      styles.gridColumnStart = colStart;
    } else if (colEnd) {
      styles.gridColumnEnd = colEnd;
    }
    if (rowStart && rowEnd) {
      styles.gridRow = `${rowStart} / ${rowEnd}`;
    } else if (rowStart) {
      styles.gridRowStart = rowStart;
    } else if (rowEnd) {
      styles.gridRowEnd = rowEnd;
    }

    if (alignSelf) {
      styles.alignSelf = alignSelf;
    }
    if (justifySelf) {
      styles.justifySelf = justifySelf;
    }

    return styles;
  };

  // 构建响应式类名
  const getResponsiveClasses = (): string => {
    const classes: string[] = [];

    if (responsiveColSpan) {
      if (responsiveColSpan.mobile) {
        classes.push(`col-span-${responsiveColSpan.mobile}`);
      }
      if (responsiveColSpan.tablet) {
        classes.push(`md:col-span-${responsiveColSpan.tablet}`);
      }
      if (responsiveColSpan.desktop) {
        classes.push(`lg:col-span-${responsiveColSpan.desktop}`);
      }
      if (responsiveColSpan.large) {
        classes.push(`xl:col-span-${responsiveColSpan.large}`);
      }
    }

    if (responsiveRowSpan) {
      if (responsiveRowSpan.mobile) {
        classes.push(`row-span-${responsiveRowSpan.mobile}`);
      }
      if (responsiveRowSpan.tablet) {
        classes.push(`md:row-span-${responsiveRowSpan.tablet}`);
      }
      if (responsiveRowSpan.desktop) {
        classes.push(`lg:row-span-${responsiveRowSpan.desktop}`);
      }
      if (responsiveRowSpan.large) {
        classes.push(`xl:row-span-${responsiveRowSpan.large}`);
      }
    }

    return classes.join(' ');
  };

  return (
    <div
      className={`grid-item ${getResponsiveClasses()} ${className}`}
      style={{
        ...baseStyles,
        ...getGridItemStyles(),
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default Grid;