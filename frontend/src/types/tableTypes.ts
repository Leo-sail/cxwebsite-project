/**
 * 表类型定义文件
 * 重新导出contentSettings中的类型定义，保持向后兼容
 */

import { ContentTableType, TABLE_MAPPING } from './contentSettings';

// 重新导出ContentTableType以保持向后兼容
export { ContentTableType } from './contentSettings';

// 定义表类型常量（保持向后兼容）
export const TABLE_TYPES = {
  SITE_CONTENT: 'site_content' as ContentTableType,
  NAVIGATION_ITEMS: 'navigation_items' as ContentTableType,
  UI_TEXT_ELEMENTS: 'ui_text_elements' as ContentTableType,
  PAGE_SECTIONS: 'page_sections' as ContentTableType,
  SEO_METADATA: 'seo_metadata' as ContentTableType
} as const;

// 导出类型数组
export const CONTENT_TABLE_TYPE_VALUES = Object.values(TABLE_TYPES);

// 类型守卫函数
export function isContentTableType(value: string): value is ContentTableType {
  return CONTENT_TABLE_TYPE_VALUES.includes(value as ContentTableType);
}

// 重新导出TABLE_MAPPING以便其他模块使用
export { TABLE_MAPPING } from './contentSettings';

/**
 * 获取实际数据库表名
 * @param virtualTableName 虚拟表名
 * @returns 实际数据库表名
 */
export function getRealTableName(virtualTableName: ContentTableType): string {
  return TABLE_MAPPING[virtualTableName];
}

/**
 * 获取所有虚拟表名
 * @returns 虚拟表名数组
 */
export function getAllVirtualTableNames(): ContentTableType[] {
  return Object.keys(TABLE_MAPPING) as ContentTableType[];
}

/**
 * 获取所有实际表名
 * @returns 实际表名数组
 */
export function getAllRealTableNames(): string[] {
  return Object.values(TABLE_MAPPING);
}