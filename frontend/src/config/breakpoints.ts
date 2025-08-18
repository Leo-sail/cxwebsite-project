/**
 * 统一断点配置
 * 整合项目中的响应式断点系统，提供标准化的断点定义
 * 支持传统媒体查询和现代容器查询
 */

/**
 * 标准断点定义
 * 基于Bootstrap 5和Material Design的断点标准
 */
export const BREAKPOINTS = {
  xs: 0,      // 超小屏幕 (手机竖屏)
  sm: 576,    // 小屏幕 (手机横屏)
  md: 768,    // 中等屏幕 (平板竖屏)
  lg: 992,    // 大屏幕 (平板横屏/小桌面)
  xl: 1200,   // 超大屏幕 (桌面)
  xxl: 1400   // 超超大屏幕 (大桌面)
} as const;

/**
 * 断点键类型
 */
export type BreakpointKey = keyof typeof BREAKPOINTS;

/**
 * 断点值类型
 */
export type BreakpointValue = typeof BREAKPOINTS[BreakpointKey];

/**
 * 媒体查询类型
 */
export type MediaQueryType = 'up' | 'down' | 'between' | 'only';

/**
 * 响应式值类型
 */
export type ResponsiveValue<T> = T | Partial<Record<BreakpointKey, T>>;

/**
 * 设备类型定义
 */
export const DEVICE_TYPES = {
  mobile: ['xs', 'sm'] as BreakpointKey[],
  tablet: ['md', 'lg'] as BreakpointKey[],
  desktop: ['xl', 'xxl'] as BreakpointKey[]
} as const;

/**
 * 设备类型键
 */
export type DeviceType = keyof typeof DEVICE_TYPES;

/**
 * 断点配置接口
 */
export interface BreakpointConfig {
  /** 断点值 */
  breakpoints: typeof BREAKPOINTS;
  /** 默认单位 */
  defaultUnit: string;
  /** 是否使用容器查询 */
  useContainerQueries: boolean;
  /** 防抖延迟 */
  debounceDelay: number;
}

/**
 * 默认断点配置
 */
export const DEFAULT_BREAKPOINT_CONFIG: BreakpointConfig = {
  breakpoints: BREAKPOINTS,
  defaultUnit: 'px',
  useContainerQueries: false,
  debounceDelay: 100
};

/**
 * 断点顺序数组
 */
export const BREAKPOINT_ORDER: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];

/**
 * 获取断点索引
 */
export function getBreakpointIndex(breakpoint: BreakpointKey): number {
  return BREAKPOINT_ORDER.indexOf(breakpoint);
}

/**
 * 比较断点大小
 */
export function compareBreakpoints(a: BreakpointKey, b: BreakpointKey): number {
  return getBreakpointIndex(a) - getBreakpointIndex(b);
}

/**
 * 检查断点是否大于目标断点
 */
export function isBreakpointAbove(current: BreakpointKey, target: BreakpointKey): boolean {
  return getBreakpointIndex(current) > getBreakpointIndex(target);
}

/**
 * 检查断点是否小于目标断点
 */
export function isBreakpointBelow(current: BreakpointKey, target: BreakpointKey): boolean {
  return getBreakpointIndex(current) < getBreakpointIndex(target);
}

/**
 * 获取设备类型
 */
export function getDeviceType(breakpoint: BreakpointKey): DeviceType {
  for (const [deviceType, breakpoints] of Object.entries(DEVICE_TYPES)) {
    if (breakpoints.includes(breakpoint)) {
      return deviceType as DeviceType;
    }
  }
  return 'desktop'; // 默认为桌面
}

/**
 * 检查是否为移动设备
 */
export function isMobileBreakpoint(breakpoint: BreakpointKey): boolean {
  return DEVICE_TYPES.mobile.includes(breakpoint);
}

/**
 * 检查是否为平板设备
 */
export function isTabletBreakpoint(breakpoint: BreakpointKey): boolean {
  return DEVICE_TYPES.tablet.includes(breakpoint);
}

/**
 * 检查是否为桌面设备
 */
export function isDesktopBreakpoint(breakpoint: BreakpointKey): boolean {
  return DEVICE_TYPES.desktop.includes(breakpoint);
}

/**
 * 根据宽度获取当前断点
 */
export function getCurrentBreakpoint(width: number): BreakpointKey {
  const sortedBreakpoints = BREAKPOINT_ORDER.slice().reverse();
  
  for (const breakpoint of sortedBreakpoints) {
    if (width >= BREAKPOINTS[breakpoint]) {
      return breakpoint;
    }
  }
  
  return 'xs'; // 默认最小断点
}

/**
 * 生成媒体查询字符串
 */
export function generateMediaQuery(
  type: MediaQueryType,
  breakpoint: BreakpointKey,
  endBreakpoint?: BreakpointKey,
  config: Partial<BreakpointConfig> = {}
): string {
  const { breakpoints = BREAKPOINTS, defaultUnit = 'px', useContainerQueries = false } = config;
  
  const bp = breakpoints[breakpoint];
  const prefix = useContainerQueries ? '@container' : '@media';
  const feature = useContainerQueries ? 'width' : 'screen and (width';
  const closing = useContainerQueries ? '' : ')';

  switch (type) {
    case 'up':
      return `${prefix} (min-${feature}: ${bp}${defaultUnit}${closing}`;
    
    case 'down':
      return `${prefix} (max-${feature}: ${bp - 1}${defaultUnit}${closing}`;
    
    case 'between': {
      if (!endBreakpoint) {
        throw new Error('endBreakpoint is required for "between" type');
      }
      const endBp = breakpoints[endBreakpoint];
      return `${prefix} (min-${feature}: ${bp}${defaultUnit}) and (max-${feature}: ${endBp - 1}${defaultUnit}${closing}`;
    }
    
    case 'only': {
      const currentIndex = getBreakpointIndex(breakpoint);
      const nextBreakpoint = BREAKPOINT_ORDER[currentIndex + 1];
      
      if (!nextBreakpoint) {
        return `${prefix} (min-${feature}: ${bp}${defaultUnit}${closing}`;
      }
      
      const nextBp = breakpoints[nextBreakpoint];
      return `${prefix} (min-${feature}: ${bp}${defaultUnit}) and (max-${feature}: ${nextBp - 1}${defaultUnit}${closing}`;
    }
    
    default:
      throw new Error(`Unknown media query type: ${type}`);
  }
}

/**
 * 检查宽度是否匹配断点条件
 */
export function matchesBreakpoint(
  width: number,
  type: MediaQueryType,
  breakpoint: BreakpointKey,
  endBreakpoint?: BreakpointKey
): boolean {
  const bp = BREAKPOINTS[breakpoint];

  switch (type) {
    case 'up':
      return width >= bp;
    
    case 'down':
      return width < bp;
    
    case 'between': {
      if (!endBreakpoint) {
        throw new Error('endBreakpoint is required for "between" type');
      }
      const endBp = BREAKPOINTS[endBreakpoint];
      return width >= bp && width < endBp;
    }
    
    case 'only': {
      const currentIndex = getBreakpointIndex(breakpoint);
      const nextBreakpoint = BREAKPOINT_ORDER[currentIndex + 1];
      
      if (!nextBreakpoint) {
        return width >= bp;
      }
      
      const nextBp = BREAKPOINTS[nextBreakpoint];
      return width >= bp && width < nextBp;
    }
    
    default:
      return false;
  }
}

/**
 * 解析响应式值
 */
export function resolveResponsiveValue<T>(
  value: ResponsiveValue<T>,
  currentBreakpoint: BreakpointKey
): T {
  // 如果不是对象，直接返回值
  if (typeof value !== 'object' || value === null) {
    return value as T;
  }

  // 如果是响应式对象，按断点优先级解析
  const responsiveValue = value as Partial<Record<BreakpointKey, T>>;
  
  // 首先检查当前断点
  if (responsiveValue[currentBreakpoint] !== undefined) {
    return responsiveValue[currentBreakpoint] as T;
  }

  // 向下查找最近的断点值
  const currentIndex = getBreakpointIndex(currentBreakpoint);
  for (let i = currentIndex - 1; i >= 0; i--) {
    const breakpoint = BREAKPOINT_ORDER[i];
    if (responsiveValue[breakpoint] !== undefined) {
      return responsiveValue[breakpoint] as T;
    }
  }

  // 如果没有找到，返回第一个可用值
  for (const breakpoint of BREAKPOINT_ORDER) {
    if (responsiveValue[breakpoint] !== undefined) {
      return responsiveValue[breakpoint] as T;
    }
  }

  // 如果都没有，抛出错误
  throw new Error('No valid responsive value found');
}

/**
 * 容器最大宽度配置
 * 用于限制容器在不同断点下的最大宽度
 */
export const CONTAINER_MAX_WIDTHS = {
  sm: 540,
  md: 720,
  lg: 960,
  xl: 1140,
  xxl: 1320
} as const;

/**
 * 获取容器最大宽度
 */
export function getContainerMaxWidth(breakpoint: BreakpointKey): number | undefined {
  return CONTAINER_MAX_WIDTHS[breakpoint as keyof typeof CONTAINER_MAX_WIDTHS];
}

/**
 * 生成容器CSS类
 */
export function generateContainerCSS(): string {
  const baseCSS = `
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}
`;

  const responsiveCSS = Object.entries(CONTAINER_MAX_WIDTHS)
    .map(([breakpoint, maxWidth]) => {
      const bp = BREAKPOINTS[breakpoint as BreakpointKey];
      return `
@media (min-width: ${bp}px) {
  .container {
    max-width: ${maxWidth}px;
  }
}`;
    })
    .join('');

  return baseCSS + responsiveCSS;
}

/**
 * 断点系统统计信息
 */
export const BREAKPOINT_STATS = {
  total: Object.keys(BREAKPOINTS).length,
  range: {
    min: Math.min(...Object.values(BREAKPOINTS)),
    max: Math.max(...Object.values(BREAKPOINTS))
  },
  gaps: BREAKPOINT_ORDER.slice(1).map((bp, index) => ({
    from: BREAKPOINT_ORDER[index],
    to: bp,
    size: BREAKPOINTS[bp] - BREAKPOINTS[BREAKPOINT_ORDER[index] as BreakpointKey]
  }))
} as const;

/**
 * 验证断点配置
 */
export function validateBreakpoints(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 检查断点顺序
  for (let i = 1; i < BREAKPOINT_ORDER.length; i++) {
    const current = BREAKPOINT_ORDER[i];
    const previous = BREAKPOINT_ORDER[i - 1];
    
    if (BREAKPOINTS[current] <= BREAKPOINTS[previous]) {
      errors.push(`断点 ${current} (${BREAKPOINTS[current]}px) 应该大于 ${previous} (${BREAKPOINTS[previous]}px)`);
    }
  }

  // 检查断点间隔
  for (let i = 1; i < BREAKPOINT_ORDER.length; i++) {
    const current = BREAKPOINT_ORDER[i];
    const previous = BREAKPOINT_ORDER[i - 1];
    const gap = BREAKPOINTS[current] - BREAKPOINTS[previous];
    
    if (gap < 100) {
      warnings.push(`断点 ${previous} 和 ${current} 之间的间隔较小 (${gap}px)，可能导致响应式行为不明显`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// 确保所有导出都可用