/**
 * 样式相关的类型定义
 */

// 响应式值类型
export type ResponsiveValue<T> = T | {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
};

// 组件样式配置
export interface ComponentStyleConfig {
  base?: string | StyleObject;
  variants?: {
    [key: string]: {
      [value: string]: string | StyleObject;
    };
  };
  sizes?: {
    [key: string]: {
      [value: string]: string | StyleObject;
    };
  };
  compoundVariants?: Array<{
    [key: string]: string | string[];
    class: string;
  }>;
  defaultVariants?: {
    [key: string]: string;
  };
}

// 主题颜色
export interface ThemeColors {
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  gray: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  success: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  warning: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  error: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
}

// 间距系统
export interface SpacingSystem {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
  20: string;
  24: string;
  32: string;
  40: string;
  48: string;
  56: string;
  64: string;
}

// 字体系统
export interface TypographySystem {
  fontFamily: {
    sans: string[];
    serif: string[];
    mono: string[];
  };
  fontSize: {
    xs: [string, { lineHeight: string }];
    sm: [string, { lineHeight: string }];
    base: [string, { lineHeight: string }];
    lg: [string, { lineHeight: string }];
    xl: [string, { lineHeight: string }];
    '2xl': [string, { lineHeight: string }];
    '3xl': [string, { lineHeight: string }];
    '4xl': [string, { lineHeight: string }];
    '5xl': [string, { lineHeight: string }];
    '6xl': [string, { lineHeight: string }];
  };
  fontWeight: {
    thin: string;
    extralight: string;
    light: string;
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
    extrabold: string;
    black: string;
  };
}

// 阴影系统
export interface ShadowSystem {
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  none: string;
}

// 边框圆角系统
export interface BorderRadiusSystem {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

// 完整的设计系统
export interface DesignSystem {
  colors: ThemeColors;
  spacing: SpacingSystem;
  typography: TypographySystem;
  shadows: ShadowSystem;
  borderRadius: BorderRadiusSystem;
}

// 样式变体类型
export type StyleVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'outline' | 'body' | 'label' | 'flex' | 'card' | 'flex-col' | 'muted' | 'outlined' | 'default' | 'underlined' | 'caption' | 'filled' | 'solid' | 'soft' | 'gradient' | 'grid' | 'link' | 'section';
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type ColorVariant = 'primary' | 'secondary' | 'gray' | 'success' | 'warning' | 'error';

// 组件基础属性
export interface BaseComponentProps {
  className?: string;
  variant?: StyleVariant;
  size?: SizeVariant;
  color?: ColorVariant;
  disabled?: boolean;
  loading?: boolean;
}

// 样式化组件属性
export interface StyledComponentProps extends BaseComponentProps {
  theme?: string;
  customStyles?: StyleObject;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  isActive?: boolean;
  isDisabled?: boolean;
  isDanger?: boolean;
  [key: string]: unknown;
}

// CSS-in-JS 样式对象类型
export type StyleObject = {
  [key: string]: string | number | StyleObject;
};

// 样式函数类型
export type StyleFunction<T = unknown> = (props: T) => StyleObject | string;

// 媒体查询断点
export interface Breakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

// 动画配置
export interface AnimationConfig {
  duration: string;
  timingFunction: string;
  delay?: string;
  iterationCount?: string | number;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

// 过渡配置
export interface TransitionConfig {
  property: string;
  duration: string;
  timingFunction: string;
  delay?: string;
}