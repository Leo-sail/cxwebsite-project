import type { Database } from './database';

// 数据库表类型
export type PageContent = Database['public']['Tables']['page_contents']['Row'];
export type PageContentInsert = Database['public']['Tables']['page_contents']['Insert'];
export type PageContentUpdate = Database['public']['Tables']['page_contents']['Update'];

export type ComponentInstance = Database['public']['Tables']['component_instances']['Row'];
export type ComponentInstanceInsert = Database['public']['Tables']['component_instances']['Insert'];
export type ComponentInstanceUpdate = Database['public']['Tables']['component_instances']['Update'];

// 内容类型
export const ContentType = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  COMPONENT: 'component',
  HTML: 'html',
  MARKDOWN: 'markdown',
  JSON: 'json'
} as const;

export type ContentType = typeof ContentType[keyof typeof ContentType];

// 组件类型
export const ComponentType = {
  LAYOUT: 'layout',
  CONTENT: 'content',
  NAVIGATION: 'navigation',
  FORM: 'form',
  MEDIA: 'media',
  CHART: 'chart',
  CUSTOM: 'custom',
  
  // 具体组件类型
  BUTTON: 'button',
  CARD: 'card',
  LIST: 'list',
  GRID: 'grid',
  HERO: 'hero',
  GALLERY: 'gallery',
  CONTAINER: 'container',
  
  // 新增组件类型
  MODAL: 'modal',
  TABS: 'tabs',
  ACCORDION: 'accordion',
  CAROUSEL: 'carousel',
  TABLE: 'table',
  BADGE: 'badge',
  ALERT: 'alert',
  PROGRESS: 'progress',
  AVATAR: 'avatar',
  BREADCRUMB: 'breadcrumb',
  PAGINATION: 'pagination',
  TOOLTIP: 'tooltip',
  DROPDOWN: 'dropdown',
  SIDEBAR: 'sidebar',
  FOOTER: 'footer',
  HEADER: 'header'
} as const;

export type ComponentType = typeof ComponentType[keyof typeof ComponentType];

// 位置数据接口
export interface PositionData {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  zIndex?: number;
  gridColumn?: string;
  gridRow?: string;
  flexOrder?: number;
  [key: string]: any;
}

// 样式数据接口
export interface StyleData {
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  margin?: string;
  padding?: string;
  border?: string;
  borderRadius?: string;
  boxShadow?: string;
  [key: string]: any;
}

// 布局数据接口
export interface LayoutData {
  display?: 'block' | 'inline' | 'flex' | 'grid' | 'none';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gap?: string;
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  [key: string]: any;
}

// 组件属性数据接口
export interface ComponentPropsData {
  [key: string]: any;
}

// 内容数据接口
export interface ContentData {
  value?: any;
  src?: string;
  alt?: string;
  title?: string;
  description?: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}

// 扩展的页面内容接口
export interface ExtendedPageContent extends Omit<PageContent, 'content_data' | 'position_data' | 'style_data'> {
  content_data: ContentData;
  position_data?: PositionData;
  style_data?: StyleData;
}

// 扩展的组件实例接口
export interface ExtendedComponentInstance extends Omit<ComponentInstance, 'props' | 'layout_config' | 'style_overrides'> {
  props_data: ComponentPropsData;
  layout_data?: LayoutData;
  style_overrides?: StyleData;
  children?: ExtendedComponentInstance[];
}

// 内容搜索参数接口
export interface ContentSearchParams {
  pageId?: string;
  contentType?: ContentType;
  contentKey?: string;
  isActive?: boolean;
  sortBy?: 'created_at' | 'updated_at' | 'sort_order';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// 组件实例搜索参数接口
export interface ComponentInstanceSearchParams {
  pageId?: string;
  componentType?: ComponentType;
  componentName?: string;
  parentId?: string;
  isActive?: boolean;
  sortBy?: 'created_at' | 'updated_at' | 'sort_order';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// 批量排序更新接口
export interface BatchSortUpdate {
  id: string;
  sort_order: number;
}

// 组件树节点接口
export interface ComponentTreeNode extends ExtendedComponentInstance {
  children: ComponentTreeNode[];
  depth: number;
  path: string[];
}

// 内容管理操作结果接口
export interface ContentOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 实时更新事件接口
export interface ContentRealtimeEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: 'page_contents' | 'component_instances';
  new?: PageContent | ComponentInstance;
  old?: PageContent | ComponentInstance;
  timestamp: string;
}

// 内容验证规则接口
export interface ContentValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => boolean | string;
}

// 内容模板接口
export interface ContentTemplate {
  id: string;
  name: string;
  description?: string;
  contentType: ContentType;
  defaultData: ContentData;
  defaultStyle?: StyleData;
  defaultPosition?: PositionData;
  validationRules?: ContentValidationRule[];
}

// 组件模板接口
export interface ComponentTemplate {
  id: string;
  name: string;
  description?: string;
  componentType: ComponentType;
  componentName: string;
  defaultProps: ComponentPropsData;
  defaultLayout?: LayoutData;
  defaultStyle?: StyleData;
  allowedChildren?: string[];
  validationRules?: ContentValidationRule[];
}