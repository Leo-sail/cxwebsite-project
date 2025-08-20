/**
 * Component Text Storage 类型定义
 * 基于 component_text_storage 表结构
 */

/**
 * 组件文本存储表的基础类型
 */
export interface ComponentText {
  /** 主键ID */
  id: string;
  /** 文本键名 */
  key: string;
  /** 区域名称 */
  area: string | null;
  /** 文本内容 */
  content: string;
  /** 描述信息 */
  description: string | null;
  /** 创建时间 */
  created_at: string | null;
  /** 更新时间 */
  updated_at: string | null;
}

/**
 * 创建组件文本时的输入类型
 */
export interface ComponentTextInsert {
  /** 文本键名 */
  key: string;
  /** 区域名称 */
  area?: string | null;
  /** 文本内容 */
  content: string;
  /** 描述信息 */
  description?: string | null;
}

/**
 * 更新组件文本时的输入类型
 */
export interface ComponentTextUpdate {
  /** 文本键名 */
  key?: string;
  /** 区域名称 */
  area?: string | null;
  /** 文本内容 */
  content?: string;
  /** 描述信息 */
  description?: string | null;
}

/**
 * 按区域分组的组件文本
 */
export interface ComponentTextByArea {
  [area: string]: ComponentText[];
}

/**
 * 组件文本查询参数
 */
export interface ComponentTextQuery {
  /** 按区域筛选 */
  area?: string | null;
  /** 按键名筛选 */
  key?: string;
  /** 搜索关键词 */
  search?: string;
  /** 分页：每页数量 */
  limit?: number;
  /** 分页：偏移量 */
  offset?: number;
}

/**
 * 组件文本查询结果
 */
export interface ComponentTextQueryResult {
  /** 文本列表 */
  data: ComponentText[];
  /** 总数量 */
  total: number;
  /** 每页数量 */
  limit: number;
  /** 偏移量 */
  offset: number;
}

/**
 * API 响应类型
 */
export interface ComponentTextApiResponse<T = ComponentText> {
  /** 是否成功 */
  success: boolean;
  /** 数据 */
  data?: T;
  /** 错误信息 */
  error?: string;
  /** 消息 */
  message?: string;
}

/**
 * 编辑状态类型
 */
export interface ComponentTextEditState {
  /** 是否正在编辑 */
  isEditing: boolean;
  /** 编辑的文本ID */
  editingId?: string;
  /** 表单数据 */
  formData: ComponentTextInsert;
  /** 错误信息 */
  errors: Record<string, string>;
}

/**
 * 常用区域名称常量
 */
export const COMPONENT_TEXT_AREAS = {
  HERO: 'hero',
  FEATURES: 'features',
  CTA: 'cta',
  FOOTER: 'footer',
  NAVIGATION: 'navigation',
  CONTACT: 'contact',
  ABOUT: 'about',
  COURSES: 'courses',
  TEACHERS: 'teachers',
  CASES: 'cases',
  ARTICLES: 'articles'
} as const;

/**
 * 区域名称类型
 */
export type ComponentTextAreaType = typeof COMPONENT_TEXT_AREAS[keyof typeof COMPONENT_TEXT_AREAS];