/**
 * 容器查询配置
 * 提供现代的容器查询支持，作为断点系统的补充
 */

// Container query utilities for responsive design

/**
 * 容器查询断点
 * 基于标准断点，但用于容器查询
 */
export const CONTAINER_BREAKPOINTS = {
  xs: 0,      // 超小容器
  sm: 320,    // 小容器
  md: 480,    // 中等容器
  lg: 768,    // 大容器
  xl: 1024,   // 超大容器
  xxl: 1200   // 超超大容器
} as const;

/**
 * 容器查询键类型
 */
export type ContainerBreakpointKey = keyof typeof CONTAINER_BREAKPOINTS;

/**
 * 容器查询配置接口
 */
export interface ContainerQueryConfig {
  /** 容器名称 */
  name?: string;
  /** 是否启用容器查询 */
  enabled: boolean;
  /** 默认单位 */
  defaultUnit: string;
  /** 容器断点 */
  breakpoints: typeof CONTAINER_BREAKPOINTS;
}

/**
 * 默认容器查询配置
 */
export const DEFAULT_CONTAINER_CONFIG: ContainerQueryConfig = {
  name: 'responsive-container',
  enabled: true,
  defaultUnit: 'px',
  breakpoints: CONTAINER_BREAKPOINTS
};

/**
 * 生成容器查询字符串
 */
export function generateContainerQuery(
  type: 'min' | 'max' | 'between',
  breakpoint: ContainerBreakpointKey,
  endBreakpoint?: ContainerBreakpointKey,
  config: Partial<ContainerQueryConfig> = {}
): string {
  const { breakpoints = CONTAINER_BREAKPOINTS, defaultUnit = 'px', name } = {
    ...DEFAULT_CONTAINER_CONFIG,
    ...config
  };
  
  const bp = breakpoints[breakpoint];
  const containerName = name ? ` ${name}` : '';

  switch (type) {
    case 'min':
      return `@container${containerName} (min-width: ${bp}${defaultUnit})`;
    
    case 'max':
      return `@container${containerName} (max-width: ${bp - 1}${defaultUnit})`;
    
    case 'between': {
      if (!endBreakpoint) {
        throw new Error('endBreakpoint is required for "between" type');
      }
      const endBp = breakpoints[endBreakpoint];
      return `@container${containerName} (min-width: ${bp}${defaultUnit}) and (max-width: ${endBp - 1}${defaultUnit})`;
    }
    
    default:
      throw new Error(`Unknown container query type: ${type}`);
  }
}

/**
 * 检查容器宽度是否匹配断点条件
 */
export function matchesContainerBreakpoint(
  width: number,
  type: 'min' | 'max' | 'between',
  breakpoint: ContainerBreakpointKey,
  endBreakpoint?: ContainerBreakpointKey
): boolean {
  const bp = CONTAINER_BREAKPOINTS[breakpoint];

  switch (type) {
    case 'min':
      return width >= bp;
    
    case 'max':
      return width < bp;
    
    case 'between': {
      if (!endBreakpoint) {
        throw new Error('endBreakpoint is required for "between" type');
      }
      const endBp = CONTAINER_BREAKPOINTS[endBreakpoint];
      return width >= bp && width < endBp;
    }
    
    default:
      return false;
  }
}

/**
 * 获取当前容器断点
 */
export function getCurrentContainerBreakpoint(width: number): ContainerBreakpointKey {
  const breakpointKeys = Object.keys(CONTAINER_BREAKPOINTS) as ContainerBreakpointKey[];
  const sortedBreakpoints = breakpointKeys.slice().reverse();
  
  for (const breakpoint of sortedBreakpoints) {
    if (width >= CONTAINER_BREAKPOINTS[breakpoint]) {
      return breakpoint;
    }
  }
  
  return 'xs'; // 默认最小断点
}

/**
 * 容器查询CSS生成器
 */
export class ContainerQueryGenerator {
  private config: ContainerQueryConfig;

  constructor(config: Partial<ContainerQueryConfig> = {}) {
    this.config = { ...DEFAULT_CONTAINER_CONFIG, ...config };
  }

  /**
   * 生成容器查询CSS规则
   */
  generateCSS(
    breakpoint: ContainerBreakpointKey,
    styles: Record<string, string>,
    type: 'min' | 'max' | 'between' = 'min',
    endBreakpoint?: ContainerBreakpointKey
  ): string {
    const query = generateContainerQuery(type, breakpoint, endBreakpoint, this.config);
    const cssRules = Object.entries(styles)
      .map(([property, value]) => `  ${property}: ${value};`)
      .join('\n');
    
    return `${query} {\n${cssRules}\n}`;
  }

  /**
   * 生成响应式容器查询CSS
   */
  generateResponsiveCSS(
    property: string,
    values: Partial<Record<ContainerBreakpointKey, string>>
  ): string {
    const breakpointKeys = Object.keys(CONTAINER_BREAKPOINTS) as ContainerBreakpointKey[];
    const cssRules: string[] = [];

    for (const breakpoint of breakpointKeys) {
      const value = values[breakpoint];
      if (value !== undefined) {
        const query = generateContainerQuery('min', breakpoint, undefined, this.config);
        cssRules.push(`${query} {\n  ${property}: ${value};\n}`);
      }
    }

    return cssRules.join('\n\n');
  }
}

/**
 * 默认容器查询生成器实例
 */
export const containerQueryGenerator = new ContainerQueryGenerator();

/**
 * 容器查询支持检测
 */
export function supportsContainerQueries(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    return CSS.supports('container-type', 'inline-size');
  } catch {
    return false;
  }
}

/**
 * 容器查询polyfill检测
 */
export function needsContainerQueryPolyfill(): boolean {
  return !supportsContainerQueries();
}

// 所有类型和常量已在上方定义并导出