/**
 * 富文本编辑器配置工具
 * 提供React-Quill和Markdown编辑器的配置选项
 */

import type { ReactQuillProps } from 'react-quill';

/**
 * React-Quill工具栏配置
 * 精简版工具栏，包含基础格式化功能
 */
export const RICH_TEXT_TOOLBAR_CONFIG = [
  [{ 'header': [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'align': [] }],
  ['blockquote', 'code-block'],
  ['link'],
  ['clean']
];

/**
 * React-Quill格式配置
 * 定义允许的格式，确保安全性
 */
export const RICH_TEXT_FORMATS = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'align',
  'blockquote', 'code-block',
  'link'
];

/**
 * React-Quill主题配置
 */
export const RICH_TEXT_THEME = 'snow';

/**
 * React-Quill默认配置
 */
export const DEFAULT_RICH_TEXT_CONFIG: Partial<ReactQuillProps> = {
  theme: RICH_TEXT_THEME,
  modules: {
    toolbar: RICH_TEXT_TOOLBAR_CONFIG,
    clipboard: {
      // 清理粘贴内容，防止XSS
      matchVisual: false,
    },
  },
  formats: RICH_TEXT_FORMATS,
  placeholder: '请输入内容...',
  bounds: 'self',
  scrollingContainer: 'self',
};

/**
 * Markdown编辑器配置
 */
export interface MarkdownEditorConfig {
  placeholder: string;
  lineNumbers: boolean;
  lineWrapping: boolean;
  tabSize: number;
  indentWithTabs: boolean;
  autofocus: boolean;
  spellcheck: boolean;
}

/**
 * Markdown编辑器默认配置
 */
export const DEFAULT_MARKDOWN_CONFIG: MarkdownEditorConfig = {
  placeholder: '请输入Markdown内容...',
  lineNumbers: true,
  lineWrapping: true,
  tabSize: 2,
  indentWithTabs: false,
  autofocus: false,
  spellcheck: false,
};

/**
 * 编辑器类型常量
 */
export const EditorType = {
  RICH_TEXT: 'rich_text',
  MARKDOWN: 'markdown',
  PLAIN_TEXT: 'plain_text'
} as const;

export type EditorType = typeof EditorType[keyof typeof EditorType];

/**
 * 根据内容类型获取编辑器类型
 * @param contentType 内容类型
 * @returns 编辑器类型
 */
export function getEditorType(contentType: string): EditorType {
  switch (contentType.toUpperCase()) {
    case 'TEXT':
      return EditorType.RICH_TEXT;
    case 'MARKDOWN':
      return EditorType.MARKDOWN;
    default:
      return EditorType.PLAIN_TEXT;
  }
}

/**
 * 获取编辑器配置
 * @param editorType 编辑器类型
 * @returns 编辑器配置
 */
export function getEditorConfig(editorType: EditorType) {
  switch (editorType) {
    case EditorType.RICH_TEXT:
      return DEFAULT_RICH_TEXT_CONFIG;
    case EditorType.MARKDOWN:
      return DEFAULT_MARKDOWN_CONFIG;
    default:
      return {};
  }
}

/**
 * 验证编辑器配置
 * @param config 配置对象
 * @param editorType 编辑器类型
 * @returns 是否有效
 */
export function validateEditorConfig(config: any, editorType: EditorType): boolean {
  if (!config) return false;
  
  switch (editorType) {
    case EditorType.RICH_TEXT:
      return (
        config.theme &&
        config.modules &&
        config.modules.toolbar &&
        Array.isArray(config.formats)
      );
    case EditorType.MARKDOWN:
      return (
        typeof config.placeholder === 'string' &&
        typeof config.lineNumbers === 'boolean' &&
        typeof config.lineWrapping === 'boolean'
      );
    default:
      return true;
  }
}