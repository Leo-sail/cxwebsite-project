import type { Database } from './database';

// 数据库表类型 - 使用实际存在的表
export type Article = Database['public']['Tables']['articles']['Row'];
export type ArticleInsert = Database['public']['Tables']['articles']['Insert'];
export type ArticleUpdate = Database['public']['Tables']['articles']['Update'];

export type UIConfig = Database['public']['Tables']['ui_configs']['Row'];
export type UIConfigInsert = Database['public']['Tables']['ui_configs']['Insert'];
export type UIConfigUpdate = Database['public']['Tables']['ui_configs']['Update'];

// ComponentTextStorage 类型已移除 - 表已被删除
// 如需类似功能，请使用 UIConfig 类型

export type PageConfig = Database['public']['Tables']['page_configs']['Row'];
export type PageConfigInsert = Database['public']['Tables']['page_configs']['Insert'];
export type PageConfigUpdate = Database['public']['Tables']['page_configs']['Update'];

// 向后兼容的类型别名 - 现在映射到 UIConfig
export type PageContent = UIConfig;
export type PageContentInsert = UIConfigInsert;
export type PageContentUpdate = UIConfigUpdate;

export type ComponentInstance = PageConfig;
export type ComponentInstanceInsert = PageConfigInsert;
export type ComponentInstanceUpdate = PageConfigUpdate;

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
export interface ExtendedPageContent extends Omit<PageContent, 'config_value'> {
  content_data: ContentData;
  position_data?: PositionData;
  style_data?: StyleData;
}

// 扩展的组件实例接口
export interface ExtendedComponentInstance extends Omit<ComponentInstance, 'config_data' | 'layout_config'> {
  config_data?: ComponentPropsData;
  layout_config?: LayoutData;
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

// 内容操作结果接口
export interface ContentOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 内容实时事件接口
export interface ContentRealtimeEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: 'articles' | 'ui_configs' | 'page_configs';
  new?: Article | UIConfig | PageConfig;
  old?: Article | UIConfig | PageConfig;
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

// 文章相关的扩展接口
export interface ExtendedArticle extends Omit<Article, 'tags'> {
  metadata?: Record<string, any>;
  tags?: string[] | null;
  readTime?: number;
}

// UI配置相关的扩展接口
export interface ExtendedUIConfig extends UIConfig {
  parsedValue?: any;
  isActive?: boolean;
}