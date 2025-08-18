/**
 * 内容管理服务
 * 提供页面内容和组件实例的数据操作功能
 */
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type PageContent = Database['public']['Tables']['page_contents']['Row'];
type PageContentInsert = Database['public']['Tables']['page_contents']['Insert'];
type PageContentUpdate = Database['public']['Tables']['page_contents']['Update'];

type ComponentInstance = Database['public']['Tables']['component_instances']['Row'];
type ComponentInstanceInsert = Database['public']['Tables']['component_instances']['Insert'];
type ComponentInstanceUpdate = Database['public']['Tables']['component_instances']['Update'];

/**
 * 页面内容管理服务
 */
export class ContentService {
  /**
   * 获取页面的所有内容
   */
  static async getPageContents(pageId: string): Promise<PageContent[]> {
    const { data, error } = await supabase
      .from('page_contents')
      .select('*')
      .eq('page_id', pageId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(`获取页面内容失败: ${error.message}`);
    }

    return data || [];
  }

  /**
   * 根据内容键获取特定内容
   */
  static async getContentByKey(pageId: string, contentKey: string): Promise<PageContent | null> {
    const { data, error } = await supabase
      .from('page_contents')
      .select('*')
      .eq('page_id', pageId)
      .eq('content_key', contentKey)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`获取内容失败: ${error.message}`);
    }

    return data;
  }

  /**
   * 创建新的页面内容
   */
  static async createContent(contentData: PageContentInsert): Promise<PageContent> {
    const { data, error } = await supabase
      .from('page_contents')
      .insert(contentData)
      .select()
      .single();

    if (error) {
      throw new Error(`创建内容失败: ${error.message}`);
    }

    return data;
  }

  /**
   * 更新页面内容
   */
  static async updateContent(id: string, contentData: PageContentUpdate): Promise<PageContent> {
    const { data, error } = await supabase
      .from('page_contents')
      .update({ ...contentData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`更新内容失败: ${error.message}`);
    }

    return data;
  }

  /**
   * 批量更新内容顺序
   */
  static async updateContentOrder(contents: Array<{ id: string; sort_order: number }>): Promise<void> {
    const updates = contents.map(({ id, sort_order }) => 
      supabase
        .from('page_contents')
        .update({ sort_order, updated_at: new Date().toISOString() })
        .eq('id', id)
    );

    const results = await Promise.all(updates);
    const errors = results.filter(result => result.error);

    if (errors.length > 0) {
      throw new Error(`批量更新排序失败: ${errors[0].error?.message}`);
    }
  }

  /**
   * 删除页面内容（软删除）
   */
  static async deleteContent(id: string): Promise<void> {
    const { error } = await supabase
      .from('page_contents')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`删除内容失败: ${error.message}`);
    }
  }

  /**
   * 根据内容类型获取内容
   */
  static async getContentsByType(pageId: string, contentType: string): Promise<PageContent[]> {
    const { data, error } = await supabase
      .from('page_contents')
      .select('*')
      .eq('page_id', pageId)
      .eq('content_type', contentType)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(`获取${contentType}类型内容失败: ${error.message}`);
    }

    return data || [];
  }
}

/**
 * 组件实例管理服务
 */
export class ComponentInstanceService {
  /**
   * 获取页面的所有组件实例
   */
  static async getPageComponents(pageId: string): Promise<ComponentInstance[]> {
    const { data, error } = await supabase
      .from('component_instances')
      .select('*')
      .eq('page_id', pageId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(`获取页面组件失败: ${error.message}`);
    }

    return data || [];
  }

  /**
   * 获取嵌套组件结构
   */
  static async getComponentTree(pageId: string): Promise<ComponentInstance[]> {
    const { data, error } = await supabase
      .from('component_instances')
      .select('*')
      .eq('page_id', pageId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(`获取组件树失败: ${error.message}`);
    }

    // 构建树形结构
    const components = data || [];
    const componentMap = new Map(components.map(comp => [comp.id, { ...comp, children: [] as ComponentInstance[] }]));
    const rootComponents: ComponentInstance[] = [];

    components.forEach(component => {
      if (component.parent_id) {
        const parent = componentMap.get(component.parent_id);
        if (parent) {
          (parent as any).children.push(componentMap.get(component.id));
        }
      } else {
        rootComponents.push(componentMap.get(component.id)!);
      }
    });

    return rootComponents;
  }

  /**
   * 创建新的组件实例
   */
  static async createComponent(componentData: ComponentInstanceInsert): Promise<ComponentInstance> {
    const { data, error } = await supabase
      .from('component_instances')
      .insert(componentData)
      .select()
      .single();

    if (error) {
      throw new Error(`创建组件失败: ${error.message}`);
    }

    return data;
  }

  /**
   * 更新组件实例
   */
  static async updateComponent(id: string, componentData: ComponentInstanceUpdate): Promise<ComponentInstance> {
    const { data, error } = await supabase
      .from('component_instances')
      .update({ ...componentData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`更新组件失败: ${error.message}`);
    }

    return data;
  }

  /**
   * 批量更新组件顺序
   */
  static async updateComponentOrder(components: Array<{ id: string; sort_order: number; parent_id?: string }>): Promise<void> {
    const updates = components.map(({ id, sort_order, parent_id }) => 
      supabase
        .from('component_instances')
        .update({ 
          sort_order, 
          parent_id: parent_id || null,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
    );

    const results = await Promise.all(updates);
    const errors = results.filter(result => result.error);

    if (errors.length > 0) {
      throw new Error(`批量更新组件排序失败: ${errors[0].error?.message}`);
    }
  }

  /**
   * 删除组件实例（软删除）
   */
  static async deleteComponent(id: string): Promise<void> {
    const { error } = await supabase
      .from('component_instances')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`删除组件失败: ${error.message}`);
    }
  }

  /**
   * 根据组件类型获取组件实例
   */
  static async getComponentsByType(pageId: string, componentType: string): Promise<ComponentInstance[]> {
    const { data, error } = await supabase
      .from('component_instances')
      .select('*')
      .eq('page_id', pageId)
      .eq('component_type', componentType)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(`获取${componentType}类型组件失败: ${error.message}`);
    }

    return data || [];
  }

  /**
   * 复制组件实例
   */
  static async duplicateComponent(id: string, newPageId?: string): Promise<ComponentInstance> {
    // 获取原组件数据
    const { data: originalComponent, error: fetchError } = await supabase
      .from('component_instances')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`获取原组件失败: ${fetchError.message}`);
    }

    // 创建副本
    const duplicateData: ComponentInstanceInsert = {
      page_id: newPageId || originalComponent.page_id,
      component_type: originalComponent.component_type,
      component_name: `${originalComponent.component_name}_copy`,
      props: originalComponent.props,
      layout_config: originalComponent.layout_config,
      style_overrides: originalComponent.style_overrides,
      parent_id: originalComponent.parent_id,
      sort_order: (originalComponent.sort_order || 0) + 1
    };

    return this.createComponent(duplicateData);
  }
}

/**
 * 内容搜索和过滤服务
 */
export class ContentSearchService {
  /**
   * 搜索页面内容
   */
  static async searchContents(params: {
    pageId?: string;
    contentType?: string;
    searchText?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: PageContent[]; count: number }> {
    let query = supabase
      .from('page_contents')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    if (params.pageId) {
      query = query.eq('page_id', params.pageId);
    }

    if (params.contentType) {
      query = query.eq('content_type', params.contentType);
    }

    if (params.searchText) {
      query = query.or(`content_key.ilike.%${params.searchText}%,content_data->>text.ilike.%${params.searchText}%`);
    }

    if (params.limit) {
      query = query.limit(params.limit);
    }

    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }

    query = query.order('updated_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`搜索内容失败: ${error.message}`);
    }

    return { data: data || [], count: count || 0 };
  }

  /**
   * 搜索组件实例
   */
  static async searchComponents(params: {
    pageId?: string;
    componentType?: string;
    searchText?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: ComponentInstance[]; count: number }> {
    let query = supabase
      .from('component_instances')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    if (params.pageId) {
      query = query.eq('page_id', params.pageId);
    }

    if (params.componentType) {
      query = query.eq('component_type', params.componentType);
    }

    if (params.searchText) {
      query = query.or(`component_name.ilike.%${params.searchText}%,component_type.ilike.%${params.searchText}%`);
    }

    if (params.limit) {
      query = query.limit(params.limit);
    }

    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }

    query = query.order('updated_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`搜索组件失败: ${error.message}`);
    }

    return { data: data || [], count: count || 0 };
  }
}