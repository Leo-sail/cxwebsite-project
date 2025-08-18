/**
 * 信息管理页面类型定义
 * 支持顶部导航布局和弹窗编辑功能
 */

import { ContentTableType } from './contentSettings';

// ============================================================================
// 基础数据类型
// ============================================================================

/**
 * 表格数据项基础接口
 */
export interface TableData {
  id: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

/**
 * 表格插入数据接口
 */
export interface TableInsertData {
  [key: string]: any;
}

/**
 * 表格更新数据接口
 */
export interface TableUpdateData {
  id: string;
  [key: string]: any;
}

/**
 * 分页配置接口
 */
export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

/**
 * 排序配置接口
 */
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * 筛选配置接口
 */
export interface FilterConfig {
  search?: string;
  [key: string]: any;
}

// ============================================================================
// 组件状态类型
// ============================================================================

/**
 * 编辑模式枚举
 */
export type EditMode = 'create' | 'edit' | 'view';

/**
 * 信息管理容器状态接口
 */
export interface InfoManagementState {
  // 当前激活的表格类型
  activeTable: ContentTableType;
  
  // 数据状态
  data: Record<ContentTableType, TableData[]>;
  loading: boolean;
  error: string | null;
  
  // 编辑状态
  editMode: EditMode;
  editingItem: TableData | null;
  isEditModalOpen: boolean;
  
  // 确认对话框状态
  isConfirmDialogOpen: boolean;
  confirmAction: (() => void) | null;
  confirmMessage: string;
  
  // 选择状态
  selectedItems: string[];
  
  // 分页、排序、筛选
  pagination: Record<ContentTableType, PaginationConfig>;
  sortConfig: Record<ContentTableType, SortConfig>;
  filterConfig: Record<ContentTableType, FilterConfig>;
}

/**
 * 信息管理操作类型
 */
export type InfoManagementAction =
  | { type: 'SET_ACTIVE_TABLE'; payload: ContentTableType }
  | { type: 'SET_DATA'; payload: { table: ContentTableType; data: TableData[] } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'OPEN_EDIT_MODAL'; payload: { mode: EditMode; item?: TableData } }
  | { type: 'CLOSE_EDIT_MODAL' }
  | { type: 'OPEN_CONFIRM_DIALOG'; payload: { message: string; action: () => void } }
  | { type: 'CLOSE_CONFIRM_DIALOG' }
  | { type: 'SET_SELECTED_ITEMS'; payload: string[] }
  | { type: 'SET_PAGINATION'; payload: { table: ContentTableType; pagination: PaginationConfig } }
  | { type: 'SET_SORT_CONFIG'; payload: { table: ContentTableType; sortConfig: SortConfig } }
  | { type: 'SET_FILTER_CONFIG'; payload: { table: ContentTableType; filterConfig: FilterConfig } };

// ============================================================================
// 组件Props类型
// ============================================================================

/**
 * 信息管理容器组件Props
 */
export interface InfoManagementContainerProps {
  className?: string;
  initialTab?: ContentTableType;
}

/**
 * 顶部Tab导航组件Props
 */
export interface TopTabNavigationProps {
  activeTable: ContentTableType;
  onTabChange: (tableType: ContentTableType) => void;
  className?: string;
}

/**
 * Tab项配置接口
 */
export interface TabItem {
  key: ContentTableType;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  count?: number;
}

/**
 * 内容表格视图组件Props
 */
export interface ContentTableViewProps {
  tableType: ContentTableType;
  data: TableData[];
  loading: boolean;
  pagination: PaginationConfig;
  sortConfig: SortConfig;
  filterConfig: FilterConfig;
  selectedItems: string[];
  onEdit: (item: TableData) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onBatchDelete: (ids: string[]) => void;
  onSelect: (ids: string[]) => void;
  onPageChange: (page: number, pageSize?: number) => void;
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  onFilterChange: (filters: FilterConfig) => void;
  className?: string;
}

/**
 * 编辑模态框组件Props
 */
export interface EditModalProps {
  isOpen: boolean;
  mode: EditMode;
  tableType: ContentTableType;
  initialData?: TableData;
  onSubmit: (data: TableInsertData | TableUpdateData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * 确认对话框组件Props
 */
export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}

// ============================================================================
// 表格配置类型
// ============================================================================

/**
 * 表格列配置接口
 */
export interface TableColumn {
  key: string;
  title: string;
  dataIndex: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: TableData) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

/**
 * 表格配置接口
 */
export interface TableConfig {
  columns: TableColumn[];
  searchable: boolean;
  sortable: boolean;
  filterable: boolean;
  batchActions: boolean;
  pagination: {
    defaultPageSize: number;
    pageSizeOptions: number[];
  };
}

// ============================================================================
// 服务层类型
// ============================================================================

/**
 * API响应基础接口
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 分页查询参数接口
 */
export interface PaginatedQuery {
  page: number;
  pageSize: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 批量操作结果接口
 */
export interface BatchOperationResult {
  success: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

// ============================================================================
// 表单相关类型
// ============================================================================

/**
 * 表单字段配置接口
 */
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'date' | 'email' | 'url';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: any }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
  disabled?: boolean;
  hidden?: boolean;
}

/**
 * 表单配置接口
 */
export interface FormConfig {
  fields: FormField[];
  layout: 'vertical' | 'horizontal';
  submitText?: string;
  cancelText?: string;
}

/**
 * 表单验证错误接口
 */
export interface FormValidationError {
  field: string;
  message: string;
}

// ============================================================================
// 工具类型
// ============================================================================

/**
 * 深度部分类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 可选的ID类型
 */
export type OptionalId<T> = Omit<T, 'id'> & { id?: string };

/**
 * 时间戳字段类型
 */
export type WithTimestamps<T> = T & {
  created_at: string;
  updated_at: string;
};

/**
 * 加载状态类型
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * 操作状态类型
 */
export type OperationStatus = {
  type: 'create' | 'update' | 'delete' | 'batch_delete';
  status: LoadingState;
  error?: string;
};