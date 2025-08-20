/**
 * 自定义Hook导出文件
 */
export { default as useDebounce } from './useDebounce';
export { default as useLocalStorage } from './useLocalStorage';
export { default as useClickOutside } from './useClickOutside';
export { default as useAsync } from './useAsync';
export { default as usePagination } from './usePagination';
export { AuthProvider } from './useAuth';
export { useAuth, useAuthGuard, useRoleGuard } from './useAuthHooks';
export { useComponentStyles } from './useComponentStyles';

// 组件文字内容管理相关hooks
export {
  useComponentTexts,
  useComponentText,
  useComponentTextByKey,
  useComponentTextsByArea,
  useCreateComponentText,
  useUpdateComponentText,
  useUpdateComponentTextByKey,
  useDeleteComponentText,
  useDeleteComponentTextByKey,
} from './useComponentText';

export {
  useText,
  useTexts,
  useTextInfo,
  useTextsInfo,
  useTextExists,
  useFormattedText,
} from './useText';