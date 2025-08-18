/**
 * 信息管理服务层
 * 提供数据访问和API调用功能
 */

import { supabase } from '../lib/supabase';
import type {
  TableData,
  TableInsertData,
  TableUpdateData,
  PaginatedQuery,
  PaginatedResponse,
  BatchOperationResult,
  ApiResponse
} from '../types/infoManagement';
import type { ContentTableType } from '../types/contentSettings';

// ============================================================================
// 基础数据操作服务
// ============================================================================

/**
 * 信息管理服务类
 */
export class InfoManagementService {
  /**
   * 获取分页数据
   * @param tableName 表名
   * @param query 查询参数
   * @returns 分页数据响应
   */
  static async getPaginatedData(
    tableName: ContentTableType,
    query: PaginatedQuery
  ): Promise<ApiResponse<PaginatedResponse<TableData>>> {
    try {
      let supabaseQuery = supabase
        .from(tableName)
        .select('*', { count: 'exact' });

      // 搜索过滤
      if (query.search) {
        // 根据不同表类型应用不同的搜索策略
        supabaseQuery = this.applySearchFilter(supabaseQuery, tableName, query.search);
      }

      // 其他过滤条件
      if (query.filters) {
        Object.entries(query.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            supabaseQuery = supabaseQuery.eq(key, value);
          }
        });
      }

      // 排序
      if (query.sortField && query.sortDirection) {
        supabaseQuery = supabaseQuery.order(query.sortField, {
          ascending: query.sortDirection === 'asc'
        });
      } else {
        // 默认按创建时间倒序
        supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
      }

      // 分页
      const from = (query.page - 1) * query.pageSize;
      const to = from + query.pageSize - 1;
      supabaseQuery = supabaseQuery.range(from, to);

      const { data, error, count } = await supabaseQuery;

      if (error) {
        throw new Error(error.message);
      }

      const totalPages = Math.ceil((count || 0) / query.pageSize);

      return {
        success: true,
        data: {
          data: data || [],
          total: count || 0,
          page: query.page,
          pageSize: query.pageSize,
          totalPages
        }
      };
    } catch (error) {
      console.error('获取分页数据失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取数据失败'
      };
    }
  }

  /**
   * 创建记录
   * @param tableName 表名
   * @param data 插入数据
   * @returns 创建结果
   */
  static async createRecord(
    tableName: ContentTableType,
    data: TableInsertData
  ): Promise<ApiResponse<TableData>> {
    try {
      // 数据验证
      const validationResult = this.validateData(tableName, data, 'create');
      if (!validationResult.success) {
        return validationResult;
      }

      // 数据预处理
      const processedData = this.preprocessData(tableName, data, 'create');

      const { data: result, error } = await supabase
        .from(tableName)
        .insert(processedData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: result,
        message: '创建成功'
      };
    } catch (error) {
      console.error('创建记录失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建失败'
      };
    }
  }

  /**
   * 更新记录
   * @param tableName 表名
   * @param data 更新数据
   * @returns 更新结果
   */
  static async updateRecord(
    tableName: ContentTableType,
    data: TableUpdateData
  ): Promise<ApiResponse<TableData>> {
    try {
      // 数据验证
      const validationResult = this.validateData(tableName, data, 'update');
      if (!validationResult.success) {
        return validationResult;
      }

      // 数据预处理
      const processedData = this.preprocessData(tableName, data, 'update');
      const { id, ...updateData } = processedData;

      const { data: result, error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: result,
        message: '更新成功'
      };
    } catch (error) {
      console.error('更新记录失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新失败'
      };
    }
  }

  /**
   * 删除记录
   * @param tableName 表名
   * @param id 记录ID
   * @returns 删除结果
   */
  static async deleteRecord(
    tableName: ContentTableType,
    id: string
  ): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: '删除成功'
      };
    } catch (error) {
      console.error('删除记录失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除失败'
      };
    }
  }

  /**
   * 批量删除记录
   * @param tableName 表名
   * @param ids 记录ID数组
   * @returns 批量删除结果
   */
  static async batchDeleteRecords(
    tableName: ContentTableType,
    ids: string[]
  ): Promise<ApiResponse<BatchOperationResult>> {
    try {
      const results: BatchOperationResult = {
        success: 0,
        failed: 0,
        errors: []
      };

      // 批量删除
      const { error } = await supabase
        .from(tableName)
        .delete()
        .in('id', ids);

      if (error) {
        results.failed = ids.length;
        results.errors = ids.map(id => ({ id, error: error.message }));
      } else {
        results.success = ids.length;
      }

      return {
        success: results.failed === 0,
        data: results,
        message: `成功删除 ${results.success} 条记录${results.failed > 0 ? `，失败 ${results.failed} 条` : ''}`
      };
    } catch (error) {
      console.error('批量删除失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '批量删除失败'
      };
    }
  }

  /**
   * 获取单条记录
   * @param tableName 表名
   * @param id 记录ID
   * @returns 记录数据
   */
  static async getRecord(
    tableName: ContentTableType,
    id: string
  ): Promise<ApiResponse<TableData>> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('获取记录失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取记录失败'
      };
    }
  }

  // ============================================================================
  // 私有辅助方法
  // ============================================================================

  /**
   * 应用搜索过滤
   * @param query Supabase查询对象
   * @param tableName 表名
   * @param searchTerm 搜索词
   * @returns 应用搜索过滤后的查询对象
   */
  private static applySearchFilter(
    query: any,
    tableName: ContentTableType,
    searchTerm: string
  ) {
    const searchFields = this.getSearchFields(tableName);
    
    if (searchFields.length === 0) {
      return query;
    }

    // 构建搜索条件
    const searchConditions = searchFields
      .map(field => `${field}.ilike.%${searchTerm}%`)
      .join(',');

    return query.or(searchConditions);
  }

  /**
   * 获取表的搜索字段
   * @param tableName 表名
   * @returns 搜索字段数组
   */
  private static getSearchFields(tableName: ContentTableType): string[] {
    const searchFieldsMap: Record<ContentTableType, string[]> = {
      site_content: ['key', 'value', 'description'],
      navigation: ['title', 'url', 'description'],
      ui_texts: ['key', 'value', 'description'],
      page_sections: ['name', 'title', 'description'],
      seo_metadata: ['page', 'title', 'description', 'keywords']
    };

    return searchFieldsMap[tableName] || [];
  }

  /**
   * 数据验证
   * @param tableName 表名
   * @param data 数据
   * @param operation 操作类型
   * @returns 验证结果
   */
  private static validateData(
    tableName: ContentTableType,
    data: any,
    operation: 'create' | 'update'
  ): ApiResponse<void> {
    try {
      // 基础验证
      if (!data || typeof data !== 'object') {
        return {
          success: false,
          error: '数据格式无效'
        };
      }

      // 更新操作需要ID
      if (operation === 'update' && !data.id) {
        return {
          success: false,
          error: '更新操作需要提供记录ID'
        };
      }

      // 表特定验证
      const validationResult = this.validateTableSpecificData(tableName, data, operation);
      if (!validationResult.success) {
        return validationResult;
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '数据验证失败'
      };
    }
  }

  /**
   * 表特定数据验证
   * @param tableName 表名
   * @param data 数据
   * @param operation 操作类型
   * @returns 验证结果
   */
  private static validateTableSpecificData(
    tableName: ContentTableType,
    data: any,
    operation: 'create' | 'update'
  ): ApiResponse<void> {
    switch (tableName) {
      case 'site_content':
        if (operation === 'create' && !data.key) {
          return { success: false, error: '站点内容必须提供key字段' };
        }
        break;
      
      case 'navigation':
        if (operation === 'create' && !data.title) {
          return { success: false, error: '导航项必须提供标题' };
        }
        break;
      
      case 'ui_texts':
        if (operation === 'create' && !data.key) {
          return { success: false, error: 'UI文本必须提供key字段' };
        }
        break;
      
      case 'page_sections':
        if (operation === 'create' && !data.name) {
          return { success: false, error: '页面区域必须提供名称' };
        }
        break;
      
      case 'seo_metadata':
        if (operation === 'create' && !data.page) {
          return { success: false, error: 'SEO元数据必须指定页面' };
        }
        break;
    }

    return { success: true };
  }

  /**
   * 数据预处理
   * @param tableName 表名
   * @param data 原始数据
   * @param operation 操作类型
   * @returns 处理后的数据
   */
  private static preprocessData(
    tableName: ContentTableType,
    data: any,
    operation: 'create' | 'update'
  ): any {
    const processedData = { ...data };

    // 移除空值和undefined
    Object.keys(processedData).forEach(key => {
      if (processedData[key] === undefined || processedData[key] === '') {
        delete processedData[key];
      }
    });

    // 创建操作时移除时间戳字段（由数据库自动生成）
    if (operation === 'create') {
      delete processedData.id;
      delete processedData.created_at;
      delete processedData.updated_at;
    }

    // 更新操作时移除created_at字段
    if (operation === 'update') {
      delete processedData.created_at;
    }

    // 表特定预处理
    return this.preprocessTableSpecificData(tableName, processedData, operation);
  }

  /**
   * 表特定数据预处理
   * @param tableName 表名
   * @param data 数据
   * @param operation 操作类型
   * @returns 处理后的数据
   */
  private static preprocessTableSpecificData(
    tableName: ContentTableType,
    data: any,
    operation: 'create' | 'update'
  ): any {
    const processedData = { ...data };

    switch (tableName) {
      case 'site_content':
        // 确保key字段为小写
        if (processedData.key) {
          processedData.key = processedData.key.toLowerCase();
        }
        break;
      
      case 'navigation':
        // 确保order字段为数字
        if (processedData.order) {
          processedData.order = parseInt(processedData.order, 10);
        }
        break;
      
      case 'ui_texts':
        // 确保key字段为小写
        if (processedData.key) {
          processedData.key = processedData.key.toLowerCase();
        }
        break;
      
      case 'page_sections':
        // 确保order字段为数字
        if (processedData.order) {
          processedData.order = parseInt(processedData.order, 10);
        }
        break;
    }

    return processedData;
  }
}

// ============================================================================
// 导出便捷方法
// ============================================================================

/**
 * 获取分页数据的便捷方法
 */
export const getPaginatedData = InfoManagementService.getPaginatedData.bind(InfoManagementService);

/**
 * 创建记录的便捷方法
 */
export const createRecord = InfoManagementService.createRecord.bind(InfoManagementService);

/**
 * 更新记录的便捷方法
 */
export const updateRecord = InfoManagementService.updateRecord.bind(InfoManagementService);

/**
 * 删除记录的便捷方法
 */
export const deleteRecord = InfoManagementService.deleteRecord.bind(InfoManagementService);

/**
 * 批量删除记录的便捷方法
 */
export const batchDeleteRecords = InfoManagementService.batchDeleteRecords.bind(InfoManagementService);

/**
 * 获取单条记录的便捷方法
 */
export const getRecord = InfoManagementService.getRecord.bind(InfoManagementService);

// 默认导出
export default InfoManagementService;