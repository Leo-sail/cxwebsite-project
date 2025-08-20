/**
 * 通用类型定义
 */

// 基础实体接口
export interface BaseEntity {
  id: string;
  created_at: string | null;
  updated_at: string | null;
}

// API响应基础结构
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

// 分页响应结构
export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  message?: string;
  success: boolean;
}

// 分页请求参数
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 搜索参数
export interface SearchParams extends PaginationParams {
  keyword?: string;
  category?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// 选项接口
export interface Option {
  value: string | number;
  label: string;
  disabled?: boolean;
}

// 表单字段错误
export interface FieldError {
  field: string;
  message: string;
}

// 表单验证结果
export interface ValidationResult {
  isValid: boolean;
  errors: FieldError[];
}

// 文件上传状态
export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

// 文件信息
export interface FileInfo {
  id?: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  status?: UploadStatus;
  progress?: number;
  error?: string;
}

// 通知类型
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// 通知消息
export interface NotificationMessage {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

// 模态框配置
export interface ModalConfig {
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  maskClosable?: boolean;
}

// 确认对话框配置
export interface ConfirmConfig {
  title?: string;
  message: string;
  type?: 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

// 数据表格列定义
export interface TableColumn<T = unknown> {
  key: string;
  title: string;
  dataIndex?: keyof T | string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
}

// 数据表格配置
export interface TableConfig<T = unknown> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    onChange?: (page: number, pageSize: number) => void;
  };
  rowKey?: keyof T | ((record: T) => string);
  onRowClick?: (record: T, index: number) => void;
  emptyText?: string;
}

// 面包屑项
export interface BreadcrumbItem {
  title: string;
  href?: string;
  icon?: React.ReactNode;
}

// 菜单项
export interface MenuItem {
  key: string;
  title: string;
  icon?: React.ReactNode;
  href?: string;
  children?: MenuItem[];
  disabled?: boolean;
  hidden?: boolean;
}

// 用户信息
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'admin' | 'user' | 'super_admin';
  created_at: string;
  updated_at: string;
}

// 认证状态
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// 主题配置
export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  borderRadius: number;
  fontSize: number;
}

// 应用配置
export interface AppConfig {
  title: string;
  description: string;
  version: string;
  apiUrl: string;
  theme: ThemeConfig;
}

// 错误信息
export interface ErrorInfo {
  code: string | number;
  message: string;
  details?: unknown;
  timestamp: string;
}

// 加载状态
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// 异步操作状态
export interface AsyncState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated?: string;
}

// 表单状态
export interface FormState<T = unknown> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// 路由参数
export interface RouteParams {
  [key: string]: string | undefined;
}

// 查询参数
export interface QueryParams {
  [key: string]: string | string[] | undefined;
}

// 元数据
export interface MetaData {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
}

// 统计数据
export interface Statistics {
  total: number;
  growth?: number;
  percentage?: number;
  trend?: 'up' | 'down' | 'stable';
}

// 图表数据点
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
  color?: string;
}

// 图表配置
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: ChartDataPoint[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  colors?: string[];
}