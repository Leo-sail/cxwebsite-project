/**
 * 信息管理系统数据服务层
 * 提供与Supabase数据库交互的所有方法
 */

import { supabase } from '../lib/supabase';
import type {
  ContentTableType
} from '../types/tableTypes';
import {
  TABLE_MAPPING
} from '../types/tableTypes';
import type {
  TableData,
  TableInsertData,
  PaginationParams,
  PaginatedResponse
} from '../types/contentSettings';

// 重新导出类型以保持向后兼容
export type TableType = ContentTableType;
export type { TableData, TableInsertData, TableUpdateData } from '../types/contentSettings';
export type { PaginationParams, ApiResponse, PaginatedResponse } from '../types/contentSettings';

// 定义批量操作参数
export type BatchOperationParams = {
  batchSize?: number;
  onProgress?: (completed: number, total: number) => void;
};

// 兼容性类型别名
export type ApiResult<T> = {
  data: T | null;
  error: string | null;
  success: boolean;
};
export type CreateData = TableInsertData;
export type UpdateData = Partial<TableInsertData>;

/**
 * 获取实际数据库表名
 * @param virtualTableName 虚拟表名
 * @returns 实际数据库表名
 */
function getRealTableNameInternal(virtualTableName: ContentTableType): string {
  const realTableName = TABLE_MAPPING[virtualTableName as keyof typeof TABLE_MAPPING];
  if (!realTableName) {
    throw new Error(`未找到表类型 ${virtualTableName} 对应的实际表名`);
  }
  return realTableName;
}

// 默认分页参数
export const DEFAULT_PAGINATION: PaginationParams = {
  page: 1,
  pageSize: 10,
  sortBy: 'created_at',
  sortOrder: 'desc'
};

// ============================================================================
// 错误处理工具函数
// ============================================================================

/**
 * 包装Supabase操作，统一错误处理
 * @param operation Supabase操作函数
 * @returns 标准化的API结果
 */
async function wrapSupabaseOperation<T>(
  operation: () => Promise<{ data: T | null; error: any }>
): Promise<ApiResult<T>> {
  try {
    const { data, error } = await operation();
    
    if (error) {
      console.error('Supabase operation error:', error);
      return {
        data: null,
        error: error.message || '数据库操作失败',
        success: false
      };
    }
    
    if (data === null) {
      return {
        data: null,
        error: '未找到数据',
        success: false
      };
    }
    
    return {
      data,
      error: null,
      success: true
    };
  } catch (err) {
    console.error('Service operation error:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : '未知错误',
      success: false
    };
  }
}

/**
 * 验证表类型是否有效
 * @param tableType 表类型
 * @returns 是否有效
 */
function validateTableType(tableType: string): tableType is TableType {
  const validTypes = Object.keys(TABLE_MAPPING) as TableType[];
  return validTypes.includes(tableType as TableType);
}

// ============================================================================
// 基础CRUD操作
// ============================================================================

/**
 * 获取指定表的所有数据
 * @param tableType 表类型
 * @param pagination 分页参数
 * @returns 表数据列表
 */
export async function fetchTableData<T extends TableType>(
  tableType: T,
  pagination: PaginationParams = DEFAULT_PAGINATION
): Promise<ApiResult<PaginatedResponse<TableData>>> {
  if (!validateTableType(tableType)) {
    return {
      data: null,
      error: `无效的表类型: ${tableType}`,
      success: false
    };
  }

  const {
    page = DEFAULT_PAGINATION.page,
    pageSize = DEFAULT_PAGINATION.pageSize,
    sortBy = DEFAULT_PAGINATION.sortBy,
    sortOrder = DEFAULT_PAGINATION.sortOrder
  } = pagination;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return wrapSupabaseOperation(async () => {
    const realTableName = getRealTableNameInternal(tableType);
    // 获取总数
    const { count } = await supabase
      .from(realTableName as any)
      .select('*', { count: 'exact', head: true });

    // 获取分页数据
    const { data, error } = await supabase
      .from(realTableName as any)
      .select('*')
      .order(sortBy || 'created_at', { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) throw error;

    const totalPages = Math.ceil((count || 0) / pageSize);

    return {
      data: {
        data: (data as any) || [],
        total: count || 0,
        page,
        pageSize,
        totalPages
      },
      error: null
    };
  });
}

/**
 * 获取指定表的数据总数
 * @param tableType 表类型
 * @returns 数据总数
 */
export async function fetchTableCount(tableType: TableType): Promise<ApiResult<number>> {
  if (!validateTableType(tableType)) {
    return {
      data: null,
      error: `无效的表类型: ${tableType}`,
      success: false
    };
  }

  return wrapSupabaseOperation(async () => {
    const realTableName = getRealTableNameInternal(tableType);
    const { count, error } = await supabase
      .from(realTableName as any)
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return { data: count || 0, error: null };
  });
}

/**
 * 根据ID获取单条记录
 * @param tableType 表类型
 * @param id 记录ID
 * @returns 单条记录数据
 */
export async function fetchRecordById<T extends TableType>(
  tableType: T,
  id: string
): Promise<ApiResult<TableData>> {
  if (!validateTableType(tableType)) {
    return {
      data: null,
      error: `无效的表类型: ${tableType}`,
      success: false
    };
  }

  return wrapSupabaseOperation(async () => {
    const realTableName = getRealTableNameInternal(tableType);
    const { data, error } = await supabase
      .from(realTableName as any)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return { data: data as any, error: null };
  });
}

/**
 * 创建新记录
 * @param tableType 表类型
 * @param recordData 记录数据（不包含id、created_at、updated_at）
 * @returns 创建的记录
 */
export async function createRecord<T extends TableType>(
  tableType: T,
  recordData: CreateData
): Promise<ApiResult<TableData>> {
  if (!validateTableType(tableType)) {
    return {
      data: null,
      error: `无效的表类型: ${tableType}`,
      success: false
    };
  }

  // 基本数据验证
  if (!recordData || typeof recordData !== 'object') {
    return {
      data: null,
      error: '无效的记录数据',
      success: false
    };
  }

  return wrapSupabaseOperation(async () => {
    const realTableName = getRealTableNameInternal(tableType);
    const { data, error } = await supabase
      .from(realTableName as any)
      .insert([recordData])
      .select()
      .single();

    if (error) throw error;

    return {
      data: data as any,
      error: null
    };
  });
}

/**
 * 更新记录
 * @param tableType 表类型
 * @param id 记录ID
 * @param updateData 更新数据
 * @returns 更新后的记录
 */
export async function updateRecord<T extends TableType>(
  tableType: T,
  id: string,
  updateData: UpdateData
): Promise<ApiResult<TableData>> {
  if (!validateTableType(tableType)) {
    return {
      data: null,
      error: `无效的表类型: ${tableType}`,
      success: false
    };
  }

  // 添加更新时间戳
  const dataWithTimestamp = {
    ...updateData,
    updated_at: new Date().toISOString()
  };

  return wrapSupabaseOperation(async () => {
    const realTableName = getRealTableNameInternal(tableType);
    const { data, error } = await supabase
      .from(realTableName as any)
      .update(dataWithTimestamp)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      data: data as any,
      error: null
    };
  });
}

/**
 * 删除记录
 * @param tableType 表类型
 * @param id 记录ID
 * @returns 删除结果
 */
export async function deleteRecord<T extends TableType>(
  tableType: T,
  id: string
): Promise<ApiResult<{ success: boolean }>> {
  if (!validateTableType(tableType)) {
    return {
      data: null,
      error: `无效的表类型: ${tableType}`,
      success: false
    };
  }

  return wrapSupabaseOperation(async () => {
    const realTableName = getRealTableNameInternal(tableType);
    const { error } = await supabase
      .from(realTableName as any)
      .delete()
      .eq('id', id);

    if (error) throw error;

    return {
      data: { success: true },
      error: null
    };
  });
}

/**
 * 批量删除记录
 * @param tableType 表类型
 * @param ids 记录ID数组
 * @returns 删除结果
 */
export async function batchDeleteRecords(
  tableType: TableType,
  ids: string[]
): Promise<ApiResult<{ deletedIds: string[] }>> {
  if (!validateTableType(tableType)) {
    return {
      data: null,
      error: `无效的表类型: ${tableType}`,
      success: false
    };
  }

  if (ids.length === 0) {
    return {
      data: { deletedIds: [] },
      error: null,
      success: true
    };
  }

  return wrapSupabaseOperation(async () => {
    const realTableName = getRealTableNameInternal(tableType);
    const { error } = await supabase
      .from(realTableName as any)
      .delete()
      .in('id', ids);

    if (error) throw error;

    return {
      data: { deletedIds: ids },
      error: null
    };
  });
}

// ============================================================================
// 数据验证函数
// ============================================================================

/**
 * 验证记录数据的必填字段
 * @param tableType 表类型
 * @param data 记录数据
 * @returns 验证错误信息，无错误返回null
 */
export function validateRecordData<T extends TableType>(
  tableType: T,
  data: any
): string | null {
  // 使用tableType参数进行验证
  if (!tableType || !data) {
    return 'Invalid table type or data';
  }
  if (!data || typeof data !== 'object') {
    return '数据不能为空且必须是对象类型';
  }
  
  // 基本验证，具体字段验证由数据库约束处理
  return null;
}

// ============================================================================
// 高级查询功能
// ============================================================================

/**
 * 搜索记录
 * @param tableType 表类型
 * @param searchTerm 搜索词
 * @param searchFields 搜索字段
 * @param pagination 分页参数
 * @returns 搜索结果
 */
export async function searchRecords<T extends TableType>(
  tableType: T,
  searchTerm: string,
  searchFields: string[],
  pagination: PaginationParams = DEFAULT_PAGINATION
): Promise<ApiResult<PaginatedResponse<TableData>>> {
  if (!validateTableType(tableType)) {
    return {
      data: null,
      error: `无效的表类型: ${tableType}`,
      success: false
    };
  }

  const {
    page = DEFAULT_PAGINATION.page,
    pageSize = DEFAULT_PAGINATION.pageSize,
    sortBy = DEFAULT_PAGINATION.sortBy,
    sortOrder = DEFAULT_PAGINATION.sortOrder
  } = pagination;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return wrapSupabaseOperation(async () => {
    const realTableName = getRealTableNameInternal(tableType);
    let query = supabase.from(realTableName as any).select('*', { count: 'exact' });
    
    // 构建搜索条件
    if (searchTerm && searchFields.length > 0) {
      const searchConditions = searchFields
        .map(field => `${field}.ilike.%${searchTerm}%`)
        .join(',');
      query = query.or(searchConditions);
    }
    
    // 应用排序和分页
    const { data, error, count } = await query
      .order(sortBy || 'created_at', { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) throw error;

    const totalPages = Math.ceil((count || 0) / pageSize);

    return {
      data: {
        data: (data as any) || [],
        total: count || 0,
        page,
        pageSize,
        totalPages
      },
      error: null
    };
  });
}

/**
 * 根据字段值筛选记录
 * @param tableType 表类型
 * @param filters 筛选条件
 * @param pagination 分页参数
 * @returns 筛选结果
 */
export async function filterRecords<T extends TableType>(
  tableType: T,
  filters: Record<string, any>,
  pagination: PaginationParams = DEFAULT_PAGINATION
): Promise<ApiResult<PaginatedResponse<TableData>>> {
  if (!validateTableType(tableType)) {
    return {
      data: null,
      error: `无效的表类型: ${tableType}`,
      success: false
    };
  }

  const {
    page = DEFAULT_PAGINATION.page,
    pageSize = DEFAULT_PAGINATION.pageSize,
    sortBy = DEFAULT_PAGINATION.sortBy,
    sortOrder = DEFAULT_PAGINATION.sortOrder
  } = pagination;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return wrapSupabaseOperation(async () => {
    const realTableName = getRealTableNameInternal(tableType);
    let query = supabase.from(realTableName as any).select('*', { count: 'exact' });
    
    // 应用筛选条件
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query = query.eq(key, value);
      }
    });
    
    // 应用排序和分页
    const { data, error, count } = await query
      .order(sortBy || 'created_at', { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) throw error;

    const totalPages = Math.ceil((count || 0) / pageSize);

    return {
      data: {
        data: (data as any) || [],
        total: count || 0,
        page,
        pageSize,
        totalPages
      },
      error: null
    };
  });
}

// ============================================================================
// 批量操作
// ============================================================================

/**
 * 批量创建记录
 * @param tableType 表类型
 * @param records 记录数组
 * @returns 创建结果
 */
export async function batchCreateRecords<T extends TableType>(
  tableType: T,
  records: CreateData[]
): Promise<ApiResult<TableData[]>> {
  if (!validateTableType(tableType)) {
    return {
      data: null,
      error: `无效的表类型: ${tableType}`,
      success: false
    };
  }

  if (records.length === 0) {
    return {
      data: [],
      error: null,
      success: true
    };
  }

  // 验证所有记录
  for (let i = 0; i < records.length; i++) {
    const validationError = validateRecordData(tableType, records[i]);
    if (validationError) {
      return {
        data: null,
        error: `第 ${i + 1} 条记录验证失败: ${validationError}`,
        success: false
      };
    }
  }

  return wrapSupabaseOperation(async () => {
    const realTableName = getRealTableNameInternal(tableType);
    const { data, error } = await supabase
      .from(realTableName as any)
      .insert(records)
      .select();

    if (error) throw error;

    return {
      data: (data as any) || [],
      error: null
    };
  });
}

/**
 * 批量更新记录
 * @param tableType 表类型
 * @param updates 更新数据数组，每个元素包含id和更新数据
 * @returns 更新结果
 */
export async function batchUpdateRecords<T extends TableType>(
  tableType: T,
  updates: Array<{ id: string; data: UpdateData }>
): Promise<ApiResult<TableData[]>> {
  if (!validateTableType(tableType)) {
    return {
      data: null,
      error: `无效的表类型: ${tableType}`,
      success: false
    };
  }

  if (updates.length === 0) {
    return {
      data: [],
      error: null,
      success: true
    };
  }

  // 由于Supabase不支持批量更新不同数据，我们需要逐个更新
  const results: TableData[] = [];
  const errors: string[] = [];

  for (const update of updates) {
    const result = await updateRecord(tableType, update.id, update.data);
    if (result.error) {
      errors.push(`ID ${update.id}: ${result.error}`);
    } else if (result.data) {
      results.push(result.data);
    }
  }

  if (errors.length > 0) {
    return {
      data: null,
      error: `批量更新失败: ${errors.join('; ')}`,
      success: false
    };
  }

  return {
    data: results,
    error: null,
    success: true
  };
}

// ============================================================================
// 实时订阅功能
// ============================================================================

/**
 * 订阅表数据变化
 * @param tableType 表类型
 * @param callback 变化回调函数
 * @returns 取消订阅函数
 */
export function subscribeToTableChanges(
  tableType: TableType,
  callback: (payload: any) => void
): () => void {
  if (!validateTableType(tableType)) {
    console.error(`无效的表类型: ${tableType}`);
    return () => {};
  }

  const subscription = supabase
    .channel(`${tableType}_changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: getRealTableNameInternal(tableType)
      },
      callback
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}

// ============================================================================
// 导出所有服务函数
// ============================================================================

export const contentSettingsService = {
  // 基础CRUD
  fetchTableData,
  fetchTableCount,
  fetchRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
  batchDeleteRecords,
  
  // 高级查询
  searchRecords,
  filterRecords,
  
  // 批量操作
  batchCreateRecords,
  batchUpdateRecords,
  
  // 实时订阅
  subscribeToTableChanges,
  
  // 工具函数
  validateTableType,
  validateRecordData
};

export default contentSettingsService;