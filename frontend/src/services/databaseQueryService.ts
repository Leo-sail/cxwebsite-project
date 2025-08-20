import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

/**
 * 数据库查询服务
 * 提供可靠的数据库表查询和管理功能
 */

// 表信息接口定义
export interface TableInfo {
  table_name: string;
  column_count: number;
  has_primary_key: boolean;
  rls_enabled: boolean;
  table_comment: string | null;
}

// 表权限接口定义
export interface TablePermissions {
  table_name: string;
  can_select: boolean;
  can_insert: boolean;
  can_update: boolean;
  can_delete: boolean;
  error_message?: string;
}

// 列信息接口定义
export interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: boolean;
  column_default: string | null;
  ordinal_position: number;
}

/**
 * 获取所有表名列表
 * 使用自定义SQL函数查询数据库表信息
 */
export async function getAllTables(): Promise<string[]> {
  try {
    const { data, error } = await supabase.rpc('get_all_tables');
    
    if (error) {
      console.error('获取表列表失败:', error);
      throw new Error(`获取表列表失败: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('getAllTables 执行失败:', error);
    throw error;
  }
}

/**
 * 获取所有表的详细信息
 * 包括列数、主键状态、RLS状态等
 */
export async function getTablesInfo(): Promise<TableInfo[]> {
  try {
    const { data, error } = await supabase.rpc('get_table_info');
    
    if (error) {
      console.error('获取表信息失败:', error);
      throw new Error(`获取表信息失败: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('getTablesInfo 执行失败:', error);
    throw error;
  }
}

/**
 * 检查指定表的访问权限
 * @param tableName 表名
 */
export async function checkTablePermissions(tableName: string): Promise<TablePermissions> {
  try {
    const { data, error } = await supabase.rpc('check_table_access', {
      table_name: tableName
    });
    
    if (error) {
      console.error(`检查表 ${tableName} 权限失败:`, error);
      return {
        table_name: tableName,
        can_select: false,
        can_insert: false,
        can_update: false,
        can_delete: false,
        error_message: error.message
      };
    }
    
    return data || {
      table_name: tableName,
      can_select: false,
      can_insert: false,
      can_update: false,
      can_delete: false,
      error_message: '未知错误'
    };
  } catch (error) {
    console.error(`checkTablePermissions 执行失败:`, error);
    return {
      table_name: tableName,
      can_select: false,
      can_insert: false,
      can_update: false,
      can_delete: false,
      error_message: error instanceof Error ? error.message : '未知错误'
    };
  }
}

/**
 * 获取指定表的列信息
 * @param tableName 表名
 */
export async function getTableColumns(tableName: string): Promise<ColumnInfo[]> {
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default, ordinal_position')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .order('ordinal_position');
    
    if (error) {
      console.error(`获取表 ${tableName} 列信息失败:`, error);
      throw new Error(`获取表 ${tableName} 列信息失败: ${error.message}`);
    }
    
    return data?.map(col => ({
      column_name: col.column_name,
      data_type: col.data_type,
      is_nullable: col.is_nullable === 'YES',
      column_default: col.column_default,
      ordinal_position: col.ordinal_position
    })) || [];
  } catch (error) {
    console.error(`getTableColumns 执行失败:`, error);
    throw error;
  }
}

/**
 * 验证表是否存在
 * @param tableName 表名
 */
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    const tables = await getAllTables();
    return tables.includes(tableName);
  } catch (error) {
    console.error(`验证表 ${tableName} 是否存在失败:`, error);
    return false;
  }
}

/**
 * 获取数据库统计信息
 */
export async function getDatabaseStats() {
  try {
    const tables = await getAllTables();
    const tablesInfo = await getTablesInfo();
    
    const stats = {
      total_tables: tables.length,
      tables_with_rls: tablesInfo.filter(t => t.rls_enabled).length,
      tables_with_primary_key: tablesInfo.filter(t => t.has_primary_key).length,
      total_columns: tablesInfo.reduce((sum, t) => sum + t.column_count, 0),
      table_list: tables,
      detailed_info: tablesInfo
    };
    
    return stats;
  } catch (error) {
    console.error('获取数据库统计信息失败:', error);
    throw error;
  }
}

/**
 * 数据库健康检查
 * 验证所有核心功能是否正常工作
 */
export async function performHealthCheck() {
  const results = {
    get_all_tables: false,
    get_table_info: false,
    check_permissions: false,
    connection_status: false,
    errors: [] as string[]
  };
  
  try {
    // 测试获取表列表
    const tables = await getAllTables();
    results.get_all_tables = tables.length > 0;
    
    // 测试获取表信息
    const tablesInfo = await getTablesInfo();
    results.get_table_info = tablesInfo.length > 0;
    
    // 测试权限检查（使用第一个表）
    if (tables.length > 0) {
      const permissions = await checkTablePermissions(tables[0]);
      results.check_permissions = !permissions.error_message;
    }
    
    // 测试基本连接
    const { error } = await supabase.from('admin_users').select('count').limit(1);
    results.connection_status = !error;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    results.errors.push(errorMessage);
  }
  
  return results;
}

// 导出常用的表名常量（基于实际数据库表）
export const TABLE_NAMES = {
  ADMIN_USERS: 'admin_users',
  ARTICLES: 'articles',
  COMPONENT_TEXT_STORAGE: 'component_text_storage',
  CONTACT_INFO: 'contact_info',
  CONTACT_SUBMISSIONS: 'contact_submissions',
  COURSES: 'courses',
  MEDIA_FILES: 'media_files',
  PAGE_CONFIGS: 'page_configs',
  STUDENT_CASES: 'student_cases',
  TEACHERS: 'teachers',
  UI_CONFIGS: 'ui_configs'
} as const;

// 表名类型定义
export type TableName = typeof TABLE_NAMES[keyof typeof TABLE_NAMES];