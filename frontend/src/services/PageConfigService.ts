import { supabase } from '../lib/supabase';

/**
 * 页面配置数据接口
 */
export interface PageConfig {
  id: string;
  page_name: string;
  page_key: string | null;
  title: string | null;
  description: string | null;
  keywords: string | null;
  config_data: any;
  layout_config: any | null;
  route: string | null;
  grid_size: number | null;
  is_published: boolean | null;
  is_active: boolean | null;
  sort_order: number | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * 创建页面配置数据接口
 */
export interface CreatePageConfigData {
  page_name: string;
  page_key: string;
  title?: string;
  description?: string;
  keywords?: string;
  config_data?: any;
  layout_config?: any;
  route?: string;
  grid_size?: number;
  is_published?: boolean;
  is_active?: boolean;
  sort_order?: number;
}

/**
 * 更新页面配置数据接口
 */
export interface UpdatePageConfigData {
  page_name?: string;
  page_key?: string;
  title?: string;
  description?: string;
  keywords?: string;
  config_data?: any;
  layout_config?: any;
  route?: string;
  grid_size?: number;
  is_published?: boolean;
  is_active?: boolean;
  sort_order?: number;
}

/**
 * 页面配置服务类
 */
export class PageConfigService {
  /**
   * 获取所有页面配置
   * @param options 查询选项
   * @returns 页面配置列表
   */
  static async getPageConfigs(options?: {
    isActive?: boolean;
    isPublished?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<PageConfig[]> {
    try {
      let query = supabase
        .from('page_configs')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      // 添加筛选条件
      if (options?.isActive !== undefined) {
        query = query.eq('is_active', options.isActive);
      }

      if (options?.isPublished !== undefined) {
        query = query.eq('is_published', options.isPublished);
      }

      if (options?.search) {
        query = query.or(`page_name.ilike.%${options.search}%,title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('获取页面配置失败:', error);
        throw new Error(`获取页面配置失败: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('获取页面配置时发生错误:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取页面配置
   * @param id 页面配置ID
   * @returns 页面配置详情
   */
  static async getPageConfigById(id: string): Promise<PageConfig | null> {
    try {
      const { data, error } = await supabase
        .from('page_configs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // 记录不存在
        }
        console.error('获取页面配置详情失败:', error);
        throw new Error(`获取页面配置详情失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('获取页面配置详情时发生错误:', error);
      throw error;
    }
  }

  /**
   * 根据页面键获取页面配置
   * @param pageKey 页面键
   * @returns 页面配置详情
   */
  static async getPageConfigByKey(pageKey: string): Promise<PageConfig | null> {
    try {
      const { data, error } = await supabase
        .from('page_configs')
        .select('*')
        .eq('page_key', pageKey)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // 记录不存在
        }
        console.error('获取页面配置详情失败:', error);
        throw new Error(`获取页面配置详情失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('获取页面配置详情时发生错误:', error);
      throw error;
    }
  }

  /**
   * 创建页面配置
   * @param pageConfigData 页面配置数据
   * @returns 创建的页面配置
   */
  static async createPageConfig(pageConfigData: CreatePageConfigData): Promise<PageConfig> {
    try {
      const { data, error } = await supabase
        .from('page_configs')
        .insert({
          ...pageConfigData,
          config_data: pageConfigData.config_data || {},
          layout_config: pageConfigData.layout_config || {},
          is_active: pageConfigData.is_active ?? true,
          sort_order: pageConfigData.sort_order ?? 0,
        })
        .select()
        .single();

      if (error) {
        console.error('创建页面配置失败:', error);
        throw new Error(`创建页面配置失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('创建页面配置时发生错误:', error);
      throw error;
    }
  }

  /**
   * 更新页面配置
   * @param id 页面配置ID
   * @param pageConfigData 更新的页面配置数据
   * @returns 更新后的页面配置
   */
  static async updatePageConfig(id: string, pageConfigData: UpdatePageConfigData): Promise<PageConfig> {
    try {
      const { data, error } = await supabase
        .from('page_configs')
        .update(pageConfigData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('更新页面配置失败:', error);
        throw new Error(`更新页面配置失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('更新页面配置时发生错误:', error);
      throw error;
    }
  }

  /**
   * 删除页面配置
   * @param id 页面配置ID
   * @returns 删除结果
   */
  static async deletePageConfig(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('page_configs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('删除页面配置失败:', error);
        throw new Error(`删除页面配置失败: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('删除页面配置时发生错误:', error);
      throw error;
    }
  }

  /**
   * 批量更新页面配置状态
   * @param ids 页面配置ID列表
   * @param isActive 激活状态
   * @returns 更新结果
   */
  static async batchUpdateStatus(ids: string[], isActive: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('page_configs')
        .update({ is_active: isActive })
        .in('id', ids);

      if (error) {
        console.error('批量更新页面配置状态失败:', error);
        throw new Error(`批量更新页面配置状态失败: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('批量更新页面配置状态时发生错误:', error);
      throw error;
    }
  }

  /**
   * 更新页面配置排序
   * @param id 页面配置ID
   * @param sortOrder 排序值
   * @returns 更新结果
   */
  static async updateSortOrder(id: string, sortOrder: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('page_configs')
        .update({ sort_order: sortOrder })
        .eq('id', id);

      if (error) {
        console.error('更新页面配置排序失败:', error);
        throw new Error(`更新页面配置排序失败: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('更新页面配置排序时发生错误:', error);
      throw error;
    }
  }

  /**
   * 发布/取消发布页面配置
   * @param id 页面配置ID
   * @param isPublished 发布状态
   * @returns 更新结果
   */
  static async updatePublishStatus(id: string, isPublished: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('page_configs')
        .update({ is_published: isPublished })
        .eq('id', id);

      if (error) {
        console.error('更新页面配置发布状态失败:', error);
        throw new Error(`更新页面配置发布状态失败: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('更新页面配置发布状态时发生错误:', error);
      throw error;
    }
  }

  /**
   * 获取页面配置统计信息
   * @returns 统计信息
   */
  static async getPageConfigStats(): Promise<{
    total: number;
    active: number;
    published: number;
    draft: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('page_configs')
        .select('is_active, is_published');

      if (error) {
        console.error('获取页面配置统计信息失败:', error);
        throw new Error(`获取页面配置统计信息失败: ${error.message}`);
      }

      const stats = {
        total: data.length,
        active: data.filter(item => item.is_active).length,
        published: data.filter(item => item.is_published).length,
        draft: data.filter(item => !item.is_published).length,
      };

      return stats;
    } catch (error) {
      console.error('获取页面配置统计信息时发生错误:', error);
      throw error;
    }
  }
}

export default PageConfigService;