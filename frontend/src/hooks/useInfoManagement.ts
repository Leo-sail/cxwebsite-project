/**
 * 信息管理状态管理Hook
 * 提供信息管理页面的状态管理和业务逻辑
 */

import { useReducer, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import type {
  InfoManagementState,
  InfoManagementAction,
  TableData,
  TableInsertData,
  TableUpdateData,
  PaginatedQuery,
  UseInfoManagementOptions,
  UseInfoManagementReturn
} from '../types/infoManagement';
import type { ContentTableType } from '../types/contentSettings';
import { InfoManagementService } from '../services/infoManagementService';

// ============================================================================
// 状态管理Reducer
// ============================================================================

/**
 * 初始状态
 */
const initialState: InfoManagementState = {
  // 数据状态
  data: [],
  total: 0,
  loading: false,
  error: null,
  
  // 分页状态
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  },
  
  // 查询状态
  query: {
    search: '',
    filters: {},
    sortField: undefined,
    sortDirection: undefined
  },
  
  // UI状态
  selectedRows: [],
  editingRecord: null,
  isEditModalOpen: false,
  isDeleteConfirmOpen: false,
  
  // 操作状态
  operationLoading: false,
  lastOperation: null
};

/**
 * 状态管理Reducer
 * @param state 当前状态
 * @param action 动作
 * @returns 新状态
 */
function infoManagementReducer(
  state: InfoManagementState,
  action: InfoManagementAction
): InfoManagementState {
  switch (action.type) {
    // 数据加载
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
        error: action.payload ? null : state.error
      };
    
    case 'SET_DATA':
      return {
        ...state,
        data: action.payload.data,
        total: action.payload.total,
        pagination: {
          ...state.pagination,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
          page: action.payload.page,
          pageSize: action.payload.pageSize
        },
        loading: false,
        error: null
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    // 查询状态
    case 'SET_SEARCH':
      return {
        ...state,
        query: {
          ...state.query,
          search: action.payload
        },
        pagination: {
          ...state.pagination,
          page: 1 // 搜索时重置到第一页
        }
      };
    
    case 'SET_FILTERS':
      return {
        ...state,
        query: {
          ...state.query,
          filters: action.payload
        },
        pagination: {
          ...state.pagination,
          page: 1 // 过滤时重置到第一页
        }
      };
    
    case 'SET_SORT':
      return {
        ...state,
        query: {
          ...state.query,
          sortField: action.payload.field,
          sortDirection: action.payload.direction
        }
      };
    
    // 分页状态
    case 'SET_PAGE':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          page: action.payload
        }
      };
    
    case 'SET_PAGE_SIZE':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          pageSize: action.payload,
          page: 1 // 改变页面大小时重置到第一页
        }
      };
    
    // 选择状态
    case 'SET_SELECTED_ROWS':
      return {
        ...state,
        selectedRows: action.payload
      };
    
    case 'TOGGLE_ROW_SELECTION':
      const isSelected = state.selectedRows.includes(action.payload);
      return {
        ...state,
        selectedRows: isSelected
          ? state.selectedRows.filter(id => id !== action.payload)
          : [...state.selectedRows, action.payload]
      };
    
    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedRows: []
      };
    
    // 编辑状态
    case 'SET_EDITING_RECORD':
      return {
        ...state,
        editingRecord: action.payload
      };
    
    case 'SET_EDIT_MODAL_OPEN':
      return {
        ...state,
        isEditModalOpen: action.payload,
        editingRecord: action.payload ? state.editingRecord : null
      };
    
    case 'SET_DELETE_CONFIRM_OPEN':
      return {
        ...state,
        isDeleteConfirmOpen: action.payload
      };
    
    // 操作状态
    case 'SET_OPERATION_LOADING':
      return {
        ...state,
        operationLoading: action.payload
      };
    
    case 'SET_LAST_OPERATION':
      return {
        ...state,
        lastOperation: action.payload
      };
    
    // 重置状态
    case 'RESET_STATE':
      return {
        ...initialState,
        pagination: {
          ...initialState.pagination,
          pageSize: state.pagination.pageSize // 保持页面大小设置
        }
      };
    
    default:
      return state;
  }
}

// ============================================================================
// 主要Hook
// ============================================================================

/**
 * 信息管理Hook
 * @param tableName 表名
 * @param options 配置选项
 * @returns Hook返回值
 */
export function useInfoManagement(
  tableName: ContentTableType,
  options: UseInfoManagementOptions = {}
): UseInfoManagementReturn {
  const {
    initialPageSize = 10,
    autoLoad = true,
    enableSelection = true,
    onDataChange,
    onError
  } = options;

  // 状态管理
  const [state, dispatch] = useReducer(infoManagementReducer, {
    ...initialState,
    pagination: {
      ...initialState.pagination,
      pageSize: initialPageSize
    }
  });

  // ============================================================================
  // 数据操作方法
  // ============================================================================

  /**
   * 加载数据
   */
  const loadData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const query: PaginatedQuery = {
        page: state.pagination.page,
        pageSize: state.pagination.pageSize,
        search: state.query.search,
        filters: state.query.filters,
        sortField: state.query.sortField,
        sortDirection: state.query.sortDirection
      };

      const response = await InfoManagementService.getPaginatedData(tableName, query);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_DATA', payload: response.data });
        onDataChange?.(response.data.data);
      } else {
        const errorMessage = response.error || '加载数据失败';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        onError?.(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '加载数据失败';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      onError?.(errorMessage);
      toast.error(errorMessage);
    }
  }, [tableName, state.pagination.page, state.pagination.pageSize, state.query, onDataChange, onError]);

  /**
   * 创建记录
   * @param data 创建数据
   */
  const createRecord = useCallback(async (data: TableInsertData) => {
    dispatch({ type: 'SET_OPERATION_LOADING', payload: true });
    
    try {
      const response = await InfoManagementService.createRecord(tableName, data);
      
      if (response.success) {
        dispatch({ type: 'SET_LAST_OPERATION', payload: { type: 'create', success: true } });
        toast.success(response.message || '创建成功');
        await loadData(); // 重新加载数据
        return { success: true, data: response.data };
      } else {
        dispatch({ type: 'SET_LAST_OPERATION', payload: { type: 'create', success: false } });
        toast.error(response.error || '创建失败');
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建失败';
      dispatch({ type: 'SET_LAST_OPERATION', payload: { type: 'create', success: false } });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: 'SET_OPERATION_LOADING', payload: false });
    }
  }, [tableName, loadData]);

  /**
   * 更新记录
   * @param data 更新数据
   */
  const updateRecord = useCallback(async (data: TableUpdateData) => {
    dispatch({ type: 'SET_OPERATION_LOADING', payload: true });
    
    try {
      const response = await InfoManagementService.updateRecord(tableName, data);
      
      if (response.success) {
        dispatch({ type: 'SET_LAST_OPERATION', payload: { type: 'update', success: true } });
        toast.success(response.message || '更新成功');
        await loadData(); // 重新加载数据
        return { success: true, data: response.data };
      } else {
        dispatch({ type: 'SET_LAST_OPERATION', payload: { type: 'update', success: false } });
        toast.error(response.error || '更新失败');
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新失败';
      dispatch({ type: 'SET_LAST_OPERATION', payload: { type: 'update', success: false } });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: 'SET_OPERATION_LOADING', payload: false });
    }
  }, [tableName, loadData]);

  /**
   * 删除记录
   * @param id 记录ID
   */
  const deleteRecord = useCallback(async (id: string) => {
    dispatch({ type: 'SET_OPERATION_LOADING', payload: true });
    
    try {
      const response = await InfoManagementService.deleteRecord(tableName, id);
      
      if (response.success) {
        dispatch({ type: 'SET_LAST_OPERATION', payload: { type: 'delete', success: true } });
        toast.success(response.message || '删除成功');
        
        // 清除选择状态
        dispatch({ type: 'SET_SELECTED_ROWS', payload: state.selectedRows.filter(rowId => rowId !== id) });
        
        await loadData(); // 重新加载数据
        return { success: true };
      } else {
        dispatch({ type: 'SET_LAST_OPERATION', payload: { type: 'delete', success: false } });
        toast.error(response.error || '删除失败');
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '删除失败';
      dispatch({ type: 'SET_LAST_OPERATION', payload: { type: 'delete', success: false } });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: 'SET_OPERATION_LOADING', payload: false });
    }
  }, [tableName, loadData, state.selectedRows]);

  /**
   * 批量删除记录
   * @param ids 记录ID数组
   */
  const batchDeleteRecords = useCallback(async (ids: string[]) => {
    dispatch({ type: 'SET_OPERATION_LOADING', payload: true });
    
    try {
      const response = await InfoManagementService.batchDeleteRecords(tableName, ids);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_LAST_OPERATION', payload: { type: 'batchDelete', success: true } });
        toast.success(response.message || `成功删除 ${response.data.success} 条记录`);
        
        // 清除选择状态
        dispatch({ type: 'CLEAR_SELECTION' });
        
        await loadData(); // 重新加载数据
        return { success: true, data: response.data };
      } else {
        dispatch({ type: 'SET_LAST_OPERATION', payload: { type: 'batchDelete', success: false } });
        toast.error(response.error || '批量删除失败');
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '批量删除失败';
      dispatch({ type: 'SET_LAST_OPERATION', payload: { type: 'batchDelete', success: false } });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: 'SET_OPERATION_LOADING', payload: false });
    }
  }, [tableName, loadData]);

  // ============================================================================
  // UI操作方法
  // ============================================================================

  /**
   * 设置搜索条件
   * @param search 搜索词
   */
  const setSearch = useCallback((search: string) => {
    dispatch({ type: 'SET_SEARCH', payload: search });
  }, []);

  /**
   * 设置过滤条件
   * @param filters 过滤条件
   */
  const setFilters = useCallback((filters: Record<string, any>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  /**
   * 设置排序
   * @param field 排序字段
   * @param direction 排序方向
   */
  const setSort = useCallback((field: string, direction: 'asc' | 'desc') => {
    dispatch({ type: 'SET_SORT', payload: { field, direction } });
  }, []);

  /**
   * 设置页码
   * @param page 页码
   */
  const setPage = useCallback((page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  }, []);

  /**
   * 设置页面大小
   * @param pageSize 页面大小
   */
  const setPageSize = useCallback((pageSize: number) => {
    dispatch({ type: 'SET_PAGE_SIZE', payload: pageSize });
  }, []);

  /**
   * 切换行选择
   * @param id 行ID
   */
  const toggleRowSelection = useCallback((id: string) => {
    if (enableSelection) {
      dispatch({ type: 'TOGGLE_ROW_SELECTION', payload: id });
    }
  }, [enableSelection]);

  /**
   * 设置选中行
   * @param ids 行ID数组
   */
  const setSelectedRows = useCallback((ids: string[]) => {
    if (enableSelection) {
      dispatch({ type: 'SET_SELECTED_ROWS', payload: ids });
    }
  }, [enableSelection]);

  /**
   * 清除选择
   */
  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  /**
   * 打开编辑弹窗
   * @param record 编辑记录
   */
  const openEditModal = useCallback((record?: TableData) => {
    dispatch({ type: 'SET_EDITING_RECORD', payload: record || null });
    dispatch({ type: 'SET_EDIT_MODAL_OPEN', payload: true });
  }, []);

  /**
   * 关闭编辑弹窗
   */
  const closeEditModal = useCallback(() => {
    dispatch({ type: 'SET_EDIT_MODAL_OPEN', payload: false });
  }, []);

  /**
   * 打开删除确认弹窗
   */
  const openDeleteConfirm = useCallback(() => {
    dispatch({ type: 'SET_DELETE_CONFIRM_OPEN', payload: true });
  }, []);

  /**
   * 关闭删除确认弹窗
   */
  const closeDeleteConfirm = useCallback(() => {
    dispatch({ type: 'SET_DELETE_CONFIRM_OPEN', payload: false });
  }, []);

  /**
   * 刷新数据
   */
  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // ============================================================================
  // 计算属性
  // ============================================================================

  /**
   * 是否有选中行
   */
  const hasSelection = useMemo(() => {
    return state.selectedRows.length > 0;
  }, [state.selectedRows]);

  /**
   * 是否全选
   */
  const isAllSelected = useMemo(() => {
    return state.data.length > 0 && state.selectedRows.length === state.data.length;
  }, [state.data, state.selectedRows]);

  /**
   * 是否部分选中
   */
  const isIndeterminate = useMemo(() => {
    return state.selectedRows.length > 0 && state.selectedRows.length < state.data.length;
  }, [state.data, state.selectedRows]);

  // ============================================================================
  // 副作用
  // ============================================================================

  // 自动加载数据
  useEffect(() => {
    if (autoLoad) {
      loadData();
    }
  }, [autoLoad, loadData]);

  // 查询条件变化时重新加载数据
  useEffect(() => {
    if (autoLoad) {
      loadData();
    }
  }, [state.query, state.pagination.page, state.pagination.pageSize]);

  // ============================================================================
  // 返回值
  // ============================================================================

  return {
    // 状态
    state,
    
    // 数据操作
    loadData,
    createRecord,
    updateRecord,
    deleteRecord,
    batchDeleteRecords,
    
    // UI操作
    setSearch,
    setFilters,
    setSort,
    setPage,
    setPageSize,
    toggleRowSelection,
    setSelectedRows,
    clearSelection,
    openEditModal,
    closeEditModal,
    openDeleteConfirm,
    closeDeleteConfirm,
    refresh,
    reset,
    
    // 计算属性
    hasSelection,
    isAllSelected,
    isIndeterminate
  };
}

// 默认导出
export default useInfoManagement;