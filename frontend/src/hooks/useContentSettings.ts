/**
 * 信息管理系统自定义Hooks
 * 提供数据管理、操作和状态管理的React Hooks
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import {
  fetchTableData,
  createRecord,
  updateRecord,
  deleteRecord,
  batchDeleteRecords,
  subscribeToTableChanges
} from '../services/contentSettingsService';
import type {
  TableInsertData,
  TableUpdateData,
  PaginationParams
} from '../services/contentSettingsService';
import type { ContentTableType } from '../types/tableTypes';
import { TABLE_TYPES } from '../types/tableTypes';

// 默认分页参数
const DEFAULT_PAGINATION: PaginationParams = {
  page: 1,
  pageSize: 10,
  sortBy: 'created_at',
  sortOrder: 'desc'
};

// 辅助函数
function isApiSuccess<T>(result: { data: T | null; error: string | null; success: boolean }): result is { data: T; error: null; success: true } {
  return result.success && result.data !== null;
}



// Hook返回类型定义
export interface UseContentDataReturn {
  data: Record<ContentTableType, any[]>;
  loading: Record<ContentTableType, boolean>;
  error: Record<ContentTableType, string | null>;
  counts: Record<ContentTableType, number>;
  fetchSingleTableData: (tableType: ContentTableType, pagination?: PaginationParams) => Promise<void>;
  fetchAllData: () => Promise<void>;
  refreshData: (tableType?: ContentTableType) => Promise<void>;
  clearCache: (tableType?: ContentTableType) => void;
  subscribeToChanges: (tableType: ContentTableType) => void;
  unsubscribeFromChanges: (tableType: ContentTableType) => void;
}

export interface UseTableOperationsReturn {
  createRecord: (tableType: ContentTableType, data: TableInsertData) => Promise<boolean>;
  updateRecord: (tableType: ContentTableType, id: string, data: TableUpdateData) => Promise<boolean>;
  deleteRecord: (tableType: ContentTableType, id: string) => Promise<boolean>;
  batchDelete: (tableType: ContentTableType, ids: string[]) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export interface UsePreviewReturn {
  previewData: Record<ContentTableType, any[]>;
  isPreviewMode: boolean;
  enablePreview: () => void;
  disablePreview: () => void;
  applyChanges: () => Promise<boolean>;
  discardChanges: () => void;
  hasChanges: boolean;
}

// ============================================================================
// 数据获取和管理Hook
// ============================================================================

/**
 * 内容数据管理Hook
 * 提供所有表的数据获取、缓存和刷新功能
 */
export function useContentData(): UseContentDataReturn {
  // 状态定义
  const [data, setData] = useState<Record<ContentTableType, any[]>>({
    site_content: [],
    navigation_items: [],
    ui_text_elements: [],
    page_sections: [],
    seo_metadata: []
  });

  const [loading, setLoading] = useState<Record<ContentTableType, boolean>>({
    site_content: false,
    navigation_items: false,
    ui_text_elements: false,
    page_sections: false,
    seo_metadata: false
  });

  const [error, setError] = useState<Record<ContentTableType, string | null>>({
    site_content: null,
    navigation_items: null,
    ui_text_elements: null,
    page_sections: null,
    seo_metadata: null
  });

  const [counts, setCounts] = useState<Record<ContentTableType, number>>({
    site_content: 0,
    navigation_items: 0,
    ui_text_elements: 0,
    page_sections: 0,
    seo_metadata: 0
  });

  // 实时订阅引用
  const subscriptionsRef = useRef<Record<ContentTableType, (() => void) | null>>({
    site_content: null,
    navigation_items: null,
    ui_text_elements: null,
    page_sections: null,
    seo_metadata: null
  });

  /**
   * 获取单个表的数据
   * @param tableType 表类型
   * @param pagination 分页参数
   */
  const fetchSingleTableData = useCallback(async (
    tableType: ContentTableType,
    pagination: PaginationParams = DEFAULT_PAGINATION
  ) => {
    setLoading(prev => ({ ...prev, [tableType]: true }));
    setError(prev => ({ ...prev, [tableType]: null }));

    try {
      const result = await fetchTableData(tableType, pagination);
      
      if (isApiSuccess(result)) {
        setData(prev => ({ 
          ...prev, 
          [tableType]: result.data.data as any[]
        }));
        setCounts(prev => ({ 
          ...prev, 
          [tableType]: result.data.total 
        }));
      } else {
        const errorMessage = result.error || `获取${tableType}数据失败`;
        setError(prev => ({ ...prev, [tableType]: errorMessage }));
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(prev => ({ ...prev, [tableType]: errorMessage }));
      toast.error(`获取${tableType}数据失败: ${errorMessage}`);
    } finally {
      setLoading(prev => ({ ...prev, [tableType]: false }));
    }
  }, []);



  /**
   * 刷新指定表的数据
   * @param tableType 表类型，不传则刷新所有表
   */
  const refetch = useCallback(async (tableType?: ContentTableType) => {
    if (tableType) {
      await fetchSingleTableData(tableType);
    } else {
      // 刷新所有表
      const tableTypes: ContentTableType[] = [
        TABLE_TYPES.SITE_CONTENT,
        TABLE_TYPES.NAVIGATION_ITEMS,
        TABLE_TYPES.UI_TEXT_ELEMENTS,
        TABLE_TYPES.PAGE_SECTIONS,
        TABLE_TYPES.SEO_METADATA
      ];
      
      await Promise.all(
        tableTypes.map(type => fetchSingleTableData(type))
      );
    }
  }, [fetchSingleTableData]);

  /**
   * 刷新所有表数据
   */
  const refetchAll = useCallback(async () => {
    await refetch();
  }, [refetch]);

  /**
   * 设置实时订阅
   * @param tableType 表类型
   */
  const setupSubscription = useCallback((tableType: ContentTableType) => {
    // 清理现有订阅
    if (subscriptionsRef.current[tableType]) {
      subscriptionsRef.current[tableType]!();
    }

    // 创建新订阅
    const unsubscribe = subscribeToTableChanges(tableType, (payload) => {
      console.log(`${tableType} 数据变化:`, payload);
      
      // 根据变化类型更新本地数据
      switch (payload.eventType) {
        case 'INSERT':
          setData(prev => ({
            ...prev,
            [tableType]: [...prev[tableType], payload.new]
          }));
          setCounts(prev => ({ ...prev, [tableType]: prev[tableType] + 1 }));
          break;
          
        case 'UPDATE':
          setData(prev => ({
            ...prev,
            [tableType]: prev[tableType].map(item => 
              item.id === payload.new.id ? payload.new : item
            )
          }));
          break;
          
        case 'DELETE':
          setData(prev => ({
            ...prev,
            [tableType]: prev[tableType].filter(item => item.id !== payload.old.id)
          }));
          setCounts(prev => ({ ...prev, [tableType]: prev[tableType] - 1 }));
          break;
      }
    });

    subscriptionsRef.current[tableType] = unsubscribe;
  }, []);

  // 初始化数据加载
  useEffect(() => {
    const tableTypes: ContentTableType[] = [
      TABLE_TYPES.SITE_CONTENT,
      TABLE_TYPES.NAVIGATION_ITEMS,
      TABLE_TYPES.UI_TEXT_ELEMENTS,
      TABLE_TYPES.PAGE_SECTIONS,
      TABLE_TYPES.SEO_METADATA
    ];

    // 加载所有表数据
    tableTypes.forEach(tableType => {
      fetchSingleTableData(tableType);
      setupSubscription(tableType);
    });

    // 清理订阅
    return () => {
      Object.values(subscriptionsRef.current).forEach(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, [fetchSingleTableData, setupSubscription]);

  return {
    data,
    loading,
    error,
    counts,
    fetchSingleTableData,
    fetchAllData: refetchAll,
    refreshData: refetch,
    clearCache: (tableType?: ContentTableType) => {
      if (tableType) {
        setData(prev => ({ ...prev, [tableType]: [] }));
        setError(prev => ({ ...prev, [tableType]: null }));
        setCounts(prev => ({ ...prev, [tableType]: 0 }));
      } else {
        setData({
          site_content: [],
          navigation_items: [],
          ui_text_elements: [],
          page_sections: [],
          seo_metadata: []
        });
        setError({
          site_content: null,
          navigation_items: null,
          ui_text_elements: null,
          page_sections: null,
          seo_metadata: null
        });
        setCounts({
          site_content: 0,
          navigation_items: 0,
          ui_text_elements: 0,
          page_sections: 0,
          seo_metadata: 0
        });
      }
    },
    subscribeToChanges: setupSubscription,
    unsubscribeFromChanges: (tableType: ContentTableType) => {
      if (subscriptionsRef.current[tableType]) {
        subscriptionsRef.current[tableType]!();
        subscriptionsRef.current[tableType] = null;
      }
    }
  };
}

// ============================================================================
// 表操作Hook
// ============================================================================

/**
 * 表操作Hook
 * 提供创建、更新、删除等操作功能
 */
export function useTableOperations(): UseTableOperationsReturn {
  const [isOperating, setIsOperating] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);

  /**
   * 创建记录
   * @param tableType 表类型
   * @param data 记录数据
   * @returns 是否创建成功
   */
  const create = useCallback(async (
    tableType: ContentTableType,
    data: TableInsertData
  ): Promise<boolean> => {
    setIsOperating(true);
    setOperationError(null);

    try {
      const result = await createRecord(tableType, data);
      
      if (isApiSuccess(result)) {
        toast.success('创建成功');
        return true;
      } else {
        const errorMessage = result.error || '创建失败';
        setOperationError(errorMessage);
        toast.error(errorMessage);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建失败';
      setOperationError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsOperating(false);
    }
  }, []);

  /**
   * 更新记录
   * @param tableType 表类型
   * @param id 记录ID
   * @param data 更新数据
   * @returns 是否更新成功
   */
  const update = useCallback(async (
    tableType: ContentTableType,
    id: string,
    data: TableUpdateData
  ): Promise<boolean> => {
    setIsOperating(true);
    setOperationError(null);

    try {
      const result = await updateRecord(tableType, id, data as any);
      
      if (isApiSuccess(result)) {
        toast.success('更新成功');
        return true;
      } else {
        const errorMessage = result.error || '更新失败';
        setOperationError(errorMessage);
        toast.error(errorMessage);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新失败';
      setOperationError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsOperating(false);
    }
  }, []);

  /**
   * 删除记录
   * @param tableType 表类型
   * @param id 记录ID
   * @returns 是否删除成功
   */
  const deleteItem = useCallback(async (
    tableType: ContentTableType,
    id: string
  ): Promise<boolean> => {
    setIsOperating(true);
    setOperationError(null);

    try {
      const result = await deleteRecord(tableType, id);
      
      if (isApiSuccess(result)) {
        toast.success('删除成功');
        return true;
      } else {
        const errorMessage = result.error || '删除失败';
        setOperationError(errorMessage);
        toast.error(errorMessage);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除失败';
      setOperationError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsOperating(false);
    }
  }, []);

  /**
   * 批量删除记录
   * @param tableType 表类型
   * @param ids 记录ID数组
   * @returns 是否删除成功
   */
  const batchDelete = useCallback(async (
    tableType: ContentTableType,
    ids: string[]
  ): Promise<boolean> => {
    if (ids.length === 0) return true;

    setIsOperating(true);
    setOperationError(null);

    try {
      const result = await batchDeleteRecords(tableType, ids);
      
      if (isApiSuccess(result)) {
        toast.success(`成功删除 ${ids.length} 条记录`);
        return true;
      } else {
        const errorMessage = result.error || '批量删除失败';
        setOperationError(errorMessage);
        toast.error(errorMessage);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '批量删除失败';
      setOperationError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsOperating(false);
    }
  }, []);

  return {
    createRecord: create,
    updateRecord: update,
    deleteRecord: deleteItem,
    batchDelete,
    loading: isOperating,
    error: operationError
  };
}

// ============================================================================
// 预览功能Hook
// ============================================================================

/**
 * 预览功能Hook
 * 提供数据预览和实时更新功能
 */
export function usePreview(): UsePreviewReturn {
  const [previewData, setPreviewData] = useState<any>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  // updatePreview函数已移除，因为未被使用

  /**
   * 隐藏预览
   */
  const hidePreview = useCallback(() => {
    setIsPreviewVisible(false);
  }, []);

  /**
   * 显示预览
   */
  const showPreview = useCallback(() => {
    if (previewData) {
      setIsPreviewVisible(true);
    }
  }, [previewData]);

  /**
   * 重置预览
   */
  const resetPreview = useCallback(() => {
    setPreviewData(null);
    setIsPreviewVisible(false);
  }, []);

  return {
    previewData,
    isPreviewMode: isPreviewVisible,
    enablePreview: showPreview,
    disablePreview: hidePreview,
    applyChanges: async () => {
      // TODO: 实现应用更改逻辑
      return true;
    },
    discardChanges: resetPreview,
    hasChanges: previewData !== null
  };
}

// ============================================================================
// 表单管理Hook
// ============================================================================

/**
 * 表单管理Hook
 * 提供表单状态管理和验证功能
 */
export function useFormManagement<T extends Record<string, any>>(
  initialValues: T,
  validationRules?: Record<keyof T, any>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 更新字段值
   * @param field 字段名
   * @param value 字段值
   */
  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  /**
   * 设置字段为已触摸
   * @param field 字段名
   */
  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  /**
   * 验证表单
   * @returns 是否验证通过
   */
  const validate = useCallback((): boolean => {
    if (!validationRules) return true;

    const newErrors: Record<keyof T, string> = {} as Record<keyof T, string>;
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      const rule = validationRules[field as keyof T];
      const value = values[field as keyof T];

      if (rule.required && (!value || value.toString().trim() === '')) {
        newErrors[field as keyof T] = `${field} 是必填字段`;
        isValid = false;
      } else if (rule.minLength && value && value.toString().length < rule.minLength) {
        newErrors[field as keyof T] = `${field} 最少需要 ${rule.minLength} 个字符`;
        isValid = false;
      } else if (rule.maxLength && value && value.toString().length > rule.maxLength) {
        newErrors[field as keyof T] = `${field} 最多允许 ${rule.maxLength} 个字符`;
        isValid = false;
      } else if (rule.pattern && value && !rule.pattern.test(value.toString())) {
        newErrors[field as keyof T] = `${field} 格式不正确`;
        isValid = false;
      } else if (rule.custom && value) {
        const customError = rule.custom(value);
        if (customError) {
          newErrors[field as keyof T] = customError;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationRules]);

  /**
   * 重置表单
   */
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({} as Record<keyof T, string>);
    setTouched({} as Record<keyof T, boolean>);
    setIsSubmitting(false);
  }, [initialValues]);

  /**
   * 提交表单
   * @param onSubmit 提交处理函数
   */
  const handleSubmit = useCallback(async (
    onSubmit: (values: T) => Promise<void>
  ) => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      reset();
    } catch (err) {
      console.error('表单提交失败:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, reset]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    validate,
    reset,
    handleSubmit,
    isValid: Object.keys(errors).length === 0
  };
}

// ============================================================================
// 分页管理Hook
// ============================================================================

/**
 * 分页管理Hook
 * 提供分页状态管理功能
 */
export function usePagination(initialParams: PaginationParams = DEFAULT_PAGINATION) {
  const [pagination, setPagination] = useState<Required<PaginationParams>>({
    page: initialParams.page ?? DEFAULT_PAGINATION.page,
    pageSize: initialParams.pageSize ?? DEFAULT_PAGINATION.pageSize,
    sortBy: (initialParams.sortBy ?? DEFAULT_PAGINATION.sortBy) as string,
    sortOrder: (initialParams.sortOrder ?? DEFAULT_PAGINATION.sortOrder) as 'desc' | 'asc'
  });

  /**
   * 更新分页参数
   * @param newParams 新的分页参数
   */
  const updatePagination = useCallback((newParams: Partial<PaginationParams>) => {
    setPagination(prev => ({ ...prev, ...newParams }));
  }, []);

  /**
   * 跳转到指定页面
   * @param page 页码
   */
  const goToPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  /**
   * 更改页面大小
   * @param pageSize 页面大小
   */
  const changePageSize = useCallback((pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  /**
   * 更改排序
   * @param sortBy 排序字段
   * @param sortOrder 排序方向
   */
  const changeSort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    setPagination(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
  }, []);

  /**
   * 重置分页
   */
  const resetPagination = useCallback(() => {
    setPagination({
      page: DEFAULT_PAGINATION.page,
      pageSize: DEFAULT_PAGINATION.pageSize,
      sortBy: DEFAULT_PAGINATION.sortBy ?? 'created_at',
      sortOrder: DEFAULT_PAGINATION.sortOrder ?? 'desc'
    });
  }, []);

  return {
    pagination,
    updatePagination,
    goToPage,
    changePageSize,
    changeSort,
    resetPagination
  };
}

// ============================================================================
// 表配置Hook
// ============================================================================

/**
 * 表配置Hook
 * 提供表字段配置信息
 */
export function useTableConfig(tableType: ContentTableType) {
  const tableConfig = useMemo(() => {
    // 根据表类型返回对应的配置
    const configs = {
      site_content: {
        fields: [
          { name: 'id', label: 'ID', type: 'string' },
          { name: 'title', label: '标题', type: 'string' },
          { name: 'content', label: '内容', type: 'text' },
          { name: 'status', label: '状态', type: 'string' },
          { name: 'created_at', label: '创建时间', type: 'date' },
          { name: 'updated_at', label: '更新时间', type: 'date' }
        ]
      },
      navigation_items: {
        fields: [
          { name: 'id', label: 'ID', type: 'string' },
          { name: 'title', label: '标题', type: 'string' },
          { name: 'url', label: '链接', type: 'string' },
          { name: 'order', label: '排序', type: 'number' },
          { name: 'status', label: '状态', type: 'string' },
          { name: 'created_at', label: '创建时间', type: 'date' }
        ]
      },
      ui_text_elements: {
        fields: [
          { name: 'id', label: 'ID', type: 'string' },
          { name: 'key', label: '键名', type: 'string' },
          { name: 'text', label: '文本', type: 'string' },
          { name: 'status', label: '状态', type: 'string' },
          { name: 'created_at', label: '创建时间', type: 'date' }
        ]
      },
      page_sections: {
        fields: [
          { name: 'id', label: 'ID', type: 'string' },
          { name: 'name', label: '名称', type: 'string' },
          { name: 'content', label: '内容', type: 'text' },
          { name: 'status', label: '状态', type: 'string' },
          { name: 'created_at', label: '创建时间', type: 'date' }
        ]
      },
      seo_metadata: {
        fields: [
          { name: 'id', label: 'ID', type: 'string' },
          { name: 'page', label: '页面', type: 'string' },
          { name: 'title', label: 'SEO标题', type: 'string' },
          { name: 'description', label: 'SEO描述', type: 'text' },
          { name: 'keywords', label: '关键词', type: 'string' },
          { name: 'created_at', label: '创建时间', type: 'date' }
        ]
      }
    };
    
    return configs[tableType] || { fields: [] };
  }, [tableType]);
  
  return { tableConfig };
}

// ============================================================================
// 导出所有Hooks
// ============================================================================

export default {
  useContentData,
  useTableOperations,
  usePreview,
  useFormManagement,
  usePagination,
  useTableConfig
};