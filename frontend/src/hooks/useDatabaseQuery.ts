import { useState, useEffect, useCallback } from 'react';
import {
  getAllTables,
  getTablesInfo,
  checkTablePermissions,
  getTableColumns,
  tableExists,
  getDatabaseStats,
  performHealthCheck,
  type TableInfo,
  type TablePermissions,
  type ColumnInfo,
  type TableName
} from '../services/databaseQueryService';

/**
 * 数据库查询状态接口
 */
interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * 获取所有表名的Hook
 */
export function useAllTables(): QueryState<string[]> {
  const [data, setData] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const tables = await getAllTables();
      setData(tables);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取表列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * 获取表详细信息的Hook
 */
export function useTablesInfo(): QueryState<TableInfo[]> {
  const [data, setData] = useState<TableInfo[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const tablesInfo = await getTablesInfo();
      setData(tablesInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取表信息失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * 检查表权限的Hook
 */
export function useTablePermissions(tableName: string | null): QueryState<TablePermissions> {
  const [data, setData] = useState<TablePermissions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!tableName) return;
    
    try {
      setLoading(true);
      setError(null);
      const permissions = await checkTablePermissions(tableName);
      setData(permissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : '检查表权限失败');
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  useEffect(() => {
    if (tableName) {
      fetchData();
    } else {
      setData(null);
      setLoading(false);
      setError(null);
    }
  }, [fetchData, tableName]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * 获取表列信息的Hook
 */
export function useTableColumns(tableName: string | null): QueryState<ColumnInfo[]> {
  const [data, setData] = useState<ColumnInfo[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!tableName) return;
    
    try {
      setLoading(true);
      setError(null);
      const columns = await getTableColumns(tableName);
      setData(columns);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取列信息失败');
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  useEffect(() => {
    if (tableName) {
      fetchData();
    } else {
      setData(null);
      setLoading(false);
      setError(null);
    }
  }, [fetchData, tableName]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * 检查表是否存在的Hook
 */
export function useTableExists(tableName: string | null): QueryState<boolean> {
  const [data, setData] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!tableName) return;
    
    try {
      setLoading(true);
      setError(null);
      const exists = await tableExists(tableName);
      setData(exists);
    } catch (err) {
      setError(err instanceof Error ? err.message : '检查表存在性失败');
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  useEffect(() => {
    if (tableName) {
      fetchData();
    } else {
      setData(null);
      setLoading(false);
      setError(null);
    }
  }, [fetchData, tableName]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * 获取数据库统计信息的Hook
 */
export function useDatabaseStats(): QueryState<any> {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await getDatabaseStats();
      setData(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据库统计失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * 数据库健康检查的Hook
 */
export function useDatabaseHealth(): QueryState<any> {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const health = await performHealthCheck();
      setData(health);
    } catch (err) {
      setError(err instanceof Error ? err.message : '健康检查失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * 综合数据库查询Hook
 * 提供所有数据库查询功能的统一接口
 */
export function useDatabaseQuery() {
  const tables = useAllTables();
  const tablesInfo = useTablesInfo();
  const stats = useDatabaseStats();
  const health = useDatabaseHealth();

  // 手动查询函数
  const queryTablePermissions = useCallback(async (tableName: string) => {
    return await checkTablePermissions(tableName);
  }, []);

  const queryTableColumns = useCallback(async (tableName: string) => {
    return await getTableColumns(tableName);
  }, []);

  const queryTableExists = useCallback(async (tableName: string) => {
    return await tableExists(tableName);
  }, []);

  // 刷新所有数据
  const refreshAll = useCallback(async () => {
    await Promise.all([
      tables.refetch(),
      tablesInfo.refetch(),
      stats.refetch(),
      health.refetch()
    ]);
  }, [tables.refetch, tablesInfo.refetch, stats.refetch, health.refetch]);

  return {
    // 自动查询的数据
    tables,
    tablesInfo,
    stats,
    health,
    
    // 手动查询函数
    queryTablePermissions,
    queryTableColumns,
    queryTableExists,
    
    // 工具函数
    refreshAll,
    
    // 整体状态
    isLoading: tables.loading || tablesInfo.loading || stats.loading || health.loading,
    hasError: !!(tables.error || tablesInfo.error || stats.error || health.error),
    errors: [tables.error, tablesInfo.error, stats.error, health.error].filter(Boolean)
  };
}