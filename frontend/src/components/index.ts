/**
 * 组件库统一导出文件
 * 提供所有可主题化组件的统一入口
 */

// 主题化基础组件
export { default as ThemedButton, ButtonGroup } from './themed/ThemedButton';
export type { ThemedButtonProps, ButtonVariant, ButtonSize, ButtonGroupProps } from './themed/ThemedButton';

export { default as ThemedInput, InputGroup } from './themed/ThemedInput';
export type { ThemedInputProps, InputVariant, InputSize, InputState, InputGroupProps } from './themed/ThemedInput';

export { default as ThemedCard, CardHeader, CardContent, CardFooter, CardGrid } from './themed/ThemedCard';
export type { 
  ThemedCardProps, 
  CardHeaderProps, 
  CardContentProps, 
  CardFooterProps, 
  CardGridProps,
  CardVariant, 
  CardSize, 
  CardState 
} from './themed/ThemedCard';

export { ThemedModal, ConfirmModal } from './themed/ThemedModal';
export type { ThemedModalProps, ConfirmModalProps } from './themed/ThemedModal';

export { ThemedDropdown, Select, MultiSelect } from './themed/ThemedDropdown';
export type { ThemedDropdownProps, DropdownOption, SelectProps } from './themed/ThemedDropdown';

export { ThemedTabs, TabPanel } from './themed/ThemedTabs';
export type { ThemedTabsProps, TabItem, TabPanelProps } from './themed/ThemedTabs';

export { ThemedTable, TablePagination } from './themed/ThemedTable';
export type { ThemedTableProps, TableColumn, TableRowData, PaginationConfig } from './themed/ThemedTable';

export { ThemedForm } from './themed/ThemedForm';
export { useFormBuilder } from '../utils/formUtils';
export type { ThemedFormProps, FormRef } from './themed/ThemedForm';
export type { FormField, FormLayout, ValidationRule } from '../utils/formUtils';

// UI基础组件
export { default as Badge } from './ui/Badge';
export type { BadgeProps, BadgeVariant, BadgeSize } from './ui/Badge';

export { 
  default as PageHeaderIcon, 
  TeachersPageHeaderIcon, 
  StudentCasesPageHeaderIcon, 
  DefaultPageHeaderIcon 
} from './ui/PageHeaderIcon';
export type { PageHeaderIconProps, IconComponent } from './ui/PageHeaderIcon';

export { default as Avatar, AvatarGroup } from './ui/Avatar';
export type { AvatarProps, AvatarSize, AvatarShape, AvatarGroupProps } from './ui/Avatar';

export { default as Tooltip } from './ui/Tooltip';
export type { TooltipProps, TooltipPlacement, TooltipTrigger } from './ui/Tooltip';

export { default as Progress, StepProgress } from './ui/Progress';
export type { ProgressProps, ProgressType, ProgressStatus, ProgressSize, StepProgressProps } from './ui/Progress';

export { default as Switch, SwitchGroup, SwitchItem } from './ui/Switch';
export type { SwitchProps, SwitchSize, SwitchGroupProps, SwitchItemProps } from './ui/Switch';

export { default as Checkbox, CheckboxGroup } from './ui/Checkbox';
export type { CheckboxProps, CheckboxSize, CheckboxGroupProps } from './ui/Checkbox';

export { default as Radio, RadioGroup, RadioCard } from './ui/Radio';
export type { RadioProps, RadioSize, RadioGroupProps, RadioCardProps } from './ui/Radio';

export { default as Slider } from './ui/Slider';
export type { SliderProps, SliderSize } from './ui/Slider';

export { default as Divider, SectionDivider, SpaceDivider, GradientDivider } from './ui/Divider';
export type { DividerProps, DividerOrientation, DividerVariant, DividerSize, SectionDividerProps, SpaceDividerProps, GradientDividerProps } from './ui/Divider';

export { default as Alert, AlertList, AlertBanner, AlertCard } from './ui/Alert';
export type { AlertProps, AlertType, AlertSize, AlertVariant, AlertListProps, AlertBannerProps, AlertCardProps } from './ui/Alert';

export { default as Skeleton, SkeletonText, SkeletonAvatar, SkeletonCard, SkeletonList, SkeletonTable, SkeletonImage, SkeletonButton } from './ui/Skeleton';
export type { SkeletonProps, SkeletonVariant, SkeletonAnimation, SkeletonTextProps, SkeletonAvatarProps, SkeletonCardProps, SkeletonListProps, SkeletonTableProps, SkeletonImageProps, SkeletonButtonProps } from './ui/Skeleton';

// 布局组件
export { default as Hero } from './layout/Hero';
export { default as Section } from './layout/Section';
export { default as Grid, GridItem } from './layout/Grid';

// SEO组件
export { default as SEO } from './SEO';

// 加载组件
export { default as LoadingSpinner } from './LoadingSpinner';
export { GlobalLoading, PageLoading, InlineLoading, LoadingOverlay } from './GlobalLoading';

// 数据表格组件
export { default as DataTable } from './DataTable';
export type { Column, SortConfig } from './DataTable';

// UI组件
export { default as GradientBackground } from './ui/GradientBackground';
export type { GradientType, GradientDirection, GradientBackgroundProps } from './ui/GradientBackground';

// 基础Modal组件
export { default as Modal } from './Modal';

// 动画组件
export { default as AnimatedContainer } from './animation/AnimatedContainer';

// 主题系统组件
export { ThemeProvider, ThemeSelector, ThemeToggle } from '../contexts/ThemeContext';

// 重新导出主题相关的hooks
export { 
  useTheme, 
  usePageStyles, 
  useComponentStyles, 
  useThemeAnimation, 
  useThemePreference,
  useCSSVariables 
} from '../hooks/useTheme';

// 新的响应式Hook系统
export {
  useResponsive,
  useWindowSize,
  useBreakpoint,
  useResponsiveValue,
  useMediaQuery,
  useContainerQuery,
  useOrientation,
  useResponsiveCSS
} from '../hooks/useResponsive';

// 重新导出主题工具类
export {
  CSSVariableGenerator,
  ColorUtils,
  /** @deprecated 请使用新的统一断点系统 from '../config/breakpoints' */
  ResponsiveUtils,
  StyleMerger,
  ThemeValidator,
  ThemeAnimationUtils,
  ThemeStorageUtils
} from '../utils/themeUtils';

// 重新导出服务类
export { ThemeService, themeService } from '../services/themeService';
export { PageStyleService, pageStyleService } from '../services/pageStyleService';
export { ComponentStyleService, componentStyleService } from '../services/componentStyleService';

// 重新导出类型定义
// export type { ThemeConfiguration } from '../services/themeService'; // 避免重复导出
export type { PageStyleConfiguration } from '../services/pageStyleService';
export type { ComponentStyleConfiguration } from '../services/componentStyleService';

// 组件库版本信息
export const COMPONENT_LIBRARY_VERSION = '1.0.0';

// 支持的主题变体
export const SUPPORTED_VARIANTS = {
  button: ['primary', 'secondary', 'outline', 'ghost', 'link', 'danger', 'success', 'warning'] as const,
  input: ['default', 'filled', 'outline', 'underline', 'ghost'] as const,
  card: ['default', 'elevated', 'outlined', 'filled', 'ghost'] as const,
  modal: ['default', 'centered', 'fullscreen', 'drawer', 'popup'] as const,
  dropdown: ['default', 'filled', 'outline', 'underline', 'ghost'] as const,
  tabs: ['default', 'pills', 'underline', 'card', 'segment'] as const,
  table: ['default', 'striped', 'bordered', 'hover', 'compact'] as const,
  form: ['default', 'filled', 'outlined', 'card'] as const
};

// 支持的组件尺寸
export const SUPPORTED_SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

// 支持的组件状态
export const SUPPORTED_STATES = {
  button: ['default', 'hover', 'active', 'focus', 'disabled', 'loading'] as const,
  input: ['default', 'error', 'warning', 'success'] as const,
  card: ['default', 'hover', 'active', 'disabled'] as const,
  modal: ['default', 'open', 'closed', 'animating'] as const,
  dropdown: ['default', 'error', 'warning', 'success', 'open', 'disabled'] as const,
  tabs: ['default', 'active', 'disabled'] as const,
  table: ['default', 'loading', 'empty'] as const,
  form: ['default', 'loading', 'disabled', 'submitting'] as const
};

// 默认主题配置
export const DEFAULT_THEME_CONFIG = {
  name: 'default',
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1f2937',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    muted: '#f3f4f6'
  },
  fonts: {
    primary: 'Inter, system-ui, sans-serif',
    secondary: 'Georgia, serif',
    mono: 'Fira Code, monospace'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  }
};