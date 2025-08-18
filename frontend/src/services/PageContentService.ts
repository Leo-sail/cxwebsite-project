/**
 * 页面内容管理服务
 * 专门用于管理首页、关于我们、联系我们页面的内容
 * 基于site_content表进行操作
 */

import { supabase } from '../lib/supabase';
import type { 
  SiteContent, 
  SiteContentInsert, 
  SiteContentUpdate 
} from '../types/database';

// 页面内容相关类型定义
export type PageLocation = 'home' | 'about' | 'contact';

// 使用数据库类型别名
export type PageContent = SiteContent;
export type PageContentUpdate = SiteContentUpdate;
export type PageContentCreate = SiteContentInsert;

// 扩展类型以确保类型兼容性
export interface PageContentCreateWithLocation extends Omit<SiteContentInsert, 'page_location'> {
  page_location: PageLocation;
}

export interface PageContentUpdateWithKey extends SiteContentUpdate {
  content_key?: string;
}

// API响应类型
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

/**
 * 包装Supabase操作，统一错误处理
 */
async function wrapSupabaseOperation<T>(
  operation: () => Promise<{ data: T | null; error: any }>
): Promise<ApiResponse<T>> {
  try {
    const { data, error } = await operation();
    
    if (error) {
      console.error('Supabase操作错误:', error);
      return {
        data: null,
        error: error.message || '操作失败',
        success: false
      };
    }
    
    return {
      data,
      error: null,
      success: true
    };
  } catch (err) {
    console.error('服务层错误:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : '未知错误',
      success: false
    };
  }
}

/**
 * 获取指定页面的所有内容
 * @param pageLocation 页面位置 ('home' | 'about' | 'contact')
 * @returns 页面内容数组
 */
export async function getPageContent(
  pageLocation: PageLocation
): Promise<ApiResponse<PageContent[]>> {
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('page_location', pageLocation)
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    return { data, error };
  });
}

/**
 * 获取指定页面的特定内容项
 * @param pageLocation 页面位置
 * @param contentKey 内容键
 * @returns 单个内容项
 */
export async function getPageContentByKey(
  pageLocation: PageLocation,
  contentKey: string
): Promise<ApiResponse<PageContent>> {
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('page_location', pageLocation)
      .eq('content_key', contentKey)
      .single();
    
    return { data, error };
  });
}

/**
 * 更新页面内容项
 * @param pageLocation 页面位置
 * @param contentKey 内容键
 * @param updateData 更新数据
 * @returns 更新后的内容项
 */
export async function updatePageContent(
  pageLocation: PageLocation,
  contentKey: string,
  updateData: PageContentUpdate
): Promise<ApiResponse<PageContent>> {
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('site_content')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('page_location', pageLocation)
      .eq('content_key', contentKey)
      .select()
      .single();
    
    return { data, error };
  });
}

/**
 * 批量更新页面内容
 * @param pageLocation 页面位置
 * @param updates 更新数据数组
 * @returns 更新结果
 */
export async function batchUpdatePageContent(
  pageLocation: PageLocation,
  updates: PageContentUpdateWithKey[]
): Promise<ApiResponse<{ updated: number; errors: string[] }>> {
  const errors: string[] = [];
  let updated = 0;
  
  try {
    // 使用事务处理批量更新
    for (const update of updates) {
      const { content_key, ...updateData } = update;
      
      // 检查content_key是否存在
      if (!content_key) {
        errors.push('缺少content_key参数');
        continue;
      }
      
      const result = await updatePageContent(pageLocation, content_key, updateData);
      
      if (result.success) {
        updated++;
      } else {
        errors.push(`更新 ${content_key} 失败: ${result.error}`);
      }
    }
    
    return {
      data: { updated, errors },
      error: errors.length > 0 ? `部分更新失败: ${errors.join(', ')}` : null,
      success: errors.length === 0
    };
  } catch (err) {
    return {
      data: { updated, errors },
      error: err instanceof Error ? err.message : '批量更新失败',
      success: false
    };
  }
}

/**
 * 创建新的页面内容项
 * @param contentData 内容数据
 * @returns 创建的内容项
 */
export async function createPageContent(
  contentData: PageContentCreateWithLocation
): Promise<ApiResponse<PageContent>> {
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('site_content')
      .insert({
        ...contentData,
        is_active: contentData.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    return { data, error };
  });
}

/**
 * 删除页面内容项
 * @param pageLocation 页面位置
 * @param contentKey 内容键
 * @returns 删除结果
 */
export async function deletePageContent(
  pageLocation: PageLocation,
  contentKey: string
): Promise<ApiResponse<{ success: boolean }>> {
  return wrapSupabaseOperation(async () => {
    const { error } = await supabase
      .from('site_content')
      .delete()
      .eq('page_location', pageLocation)
      .eq('content_key', contentKey);
    
    return { data: { success: !error }, error };
  });
}

/**
 * 获取页面内容的结构化数据（按section分组）
 * @param pageLocation 页面位置
 * @returns 按section分组的内容
 */
export async function getPageContentStructured(
  pageLocation: PageLocation
): Promise<ApiResponse<Record<string, PageContent[]>>> {
  const result = await getPageContent(pageLocation);
  
  if (!result.success || !result.data) {
    return {
      data: null,
      error: result.error,
      success: false
    };
  }
  
  // 按metadata中的section字段分组
  const grouped = result.data.reduce((acc, content) => {
    // 安全地访问metadata.section属性
    let section = 'default';
    if (content.metadata && typeof content.metadata === 'object' && content.metadata !== null) {
      const metadata = content.metadata as { [key: string]: any };
      section = metadata.section || 'default';
    }
    
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(content);
    return acc;
  }, {} as Record<string, PageContent[]>);
  
  return {
    data: grouped,
    error: null,
    success: true
  };
}

/**
 * 验证页面内容数据
 * @param contentData 内容数据
 * @returns 验证错误信息，无错误返回null
 */
export function validatePageContentData(
  contentData: Partial<PageContentCreateWithLocation | PageContentUpdateWithKey>
): string | null {
  if ('content_key' in contentData && !contentData.content_key) {
    return 'content_key 不能为空';
  }
  
  if ('page_location' in contentData && !['home', 'about', 'contact'].includes(contentData.page_location as string)) {
    return 'page_location 必须是 home、about 或 contact';
  }
  
  if ('title' in contentData && !contentData.title) {
    return 'title 不能为空';
  }
  
  if ('content_type' in contentData && !contentData.content_type) {
    return 'content_type 不能为空';
  }
  
  if ('component_type' in contentData && !contentData.component_type) {
    return 'component_type 不能为空';
  }
  
  return null;
}

/**
 * 订阅页面内容变化
 * @param pageLocation 页面位置
 * @param callback 变化回调函数
 * @returns 取消订阅函数
 */
export function subscribeToPageContentChanges(
  pageLocation: PageLocation,
  callback: (payload: any) => void
): () => void {
  const subscription = supabase
    .channel(`page_content_${pageLocation}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'site_content',
        filter: `page_location=eq.${pageLocation}`
      },
      callback
    )
    .subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
}

// 导出服务对象
export const pageContentService = {
  getPageContent,
  getPageContentByKey,
  updatePageContent,
  batchUpdatePageContent,
  createPageContent,
  deletePageContent,
  getPageContentStructured,
  validatePageContentData,
  subscribeToPageContentChanges
};

export default pageContentService;