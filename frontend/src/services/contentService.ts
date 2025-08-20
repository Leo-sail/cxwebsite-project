import { supabase } from '../lib/supabase';
import type { Article, UIConfig } from '../types/database';
import type { ExtendedArticle, ExtendedUIConfig } from '../types/content';

/**
 * 内容服务类
 * 提供文章和UI配置的基本CRUD操作
 */
export class ContentService {
  /**
   * 获取所有文章
   */
  static async getArticles(): Promise<ExtendedArticle[]> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(article => ({
         ...article,
         tags: Array.isArray(article.tags) ? article.tags.filter(tag => typeof tag === 'string') as string[] : [],
         metadata: {},
         readTime: this.calculateReadTime(article.content || '')
       }));
    } catch (error) {
      console.error('获取文章失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取文章
   */
  static async getArticleById(id: string): Promise<ExtendedArticle | null> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
         ...data,
         tags: Array.isArray(data.tags) ? data.tags.filter(tag => typeof tag === 'string') as string[] : [],
         metadata: {},
         readTime: this.calculateReadTime(data.content || '')
       };
    } catch (error) {
      console.error('获取文章失败:', error);
      throw error;
    }
  }

  /**
   * 根据slug获取文章
   */
  static async getArticleBySlug(slug: string): Promise<ExtendedArticle | null> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
         ...data,
         tags: Array.isArray(data.tags) ? data.tags.filter(tag => typeof tag === 'string') as string[] : [],
         metadata: {},
         readTime: this.calculateReadTime(data.content || '')
       };
    } catch (error) {
      console.error('获取文章失败:', error);
      throw error;
    }
  }

  /**
   * 创建文章
   */
  static async createArticle(article: Omit<Article, 'id' | 'created_at' | 'updated_at'>): Promise<ExtendedArticle> {
     try {
       const { data, error } = await supabase
         .from('articles')
         .insert({
           ...article,
           created_at: new Date().toISOString(),
           updated_at: new Date().toISOString()
         })
         .select()
         .single();

      if (error) throw error;

      return {
         ...data,
         tags: Array.isArray(data.tags) ? data.tags.filter(tag => typeof tag === 'string') as string[] : [],
         metadata: {},
         readTime: this.calculateReadTime(data.content || '')
       };
    } catch (error) {
      console.error('创建文章失败:', error);
      throw error;
    }
  }

  /**
   * 更新文章
   */
  static async updateArticle(id: string, updates: Partial<Article>): Promise<ExtendedArticle> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
         ...data,
         tags: Array.isArray(data.tags) ? data.tags.filter(tag => typeof tag === 'string') as string[] : [],
         metadata: {},
         readTime: this.calculateReadTime(data.content || '')
       };
    } catch (error) {
      console.error('更新文章失败:', error);
      throw error;
    }
  }

  /**
   * 删除文章
   */
  static async deleteArticle(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('删除文章失败:', error);
      throw error;
    }
  }

  /**
   * 获取UI配置
   */
  static async getUIConfigs(configType?: string): Promise<ExtendedUIConfig[]> {
    try {
      let query = supabase
        .from('ui_configs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (configType) {
        query = query.eq('config_type', configType);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(config => ({
         ...config
       })) as ExtendedUIConfig[];
    } catch (error) {
      console.error('获取UI配置失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取UI配置
   */
  static async getUIConfigById(id: string): Promise<ExtendedUIConfig | null> {
    try {
      const { data, error } = await supabase
        .from('ui_configs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
         ...data
       } as ExtendedUIConfig;
    } catch (error) {
      console.error('获取UI配置失败:', error);
      throw error;
    }
  }

  /**
   * 创建UI配置
   */
  static async createUIConfig(config: Omit<UIConfig, 'id' | 'created_at' | 'updated_at'>): Promise<ExtendedUIConfig> {
     try {
       const { data, error } = await supabase
         .from('ui_configs')
         .insert({
           ...config,
           created_at: new Date().toISOString(),
           updated_at: new Date().toISOString()
         })
         .select()
         .single();

      if (error) throw error;

      return {
         ...data
       } as ExtendedUIConfig;
    } catch (error) {
      console.error('创建UI配置失败:', error);
      throw error;
    }
  }

  /**
   * 更新UI配置
   */
  static async updateUIConfig(id: string, updates: Partial<UIConfig>): Promise<ExtendedUIConfig> {
    try {
      const { data, error } = await supabase
        .from('ui_configs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data
      } as ExtendedUIConfig;
    } catch (error) {
      console.error('更新UI配置失败:', error);
      throw error;
    }
  }

  /**
   * 删除UI配置
   */
  static async deleteUIConfig(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ui_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('删除UI配置失败:', error);
      throw error;
    }
  }

  /**
   * 搜索文章
   */
  static async searchArticles(query: string): Promise<ExtendedArticle[]> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('is_active', true)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,summary.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(article => ({
         ...article,
         tags: Array.isArray(article.tags) ? article.tags.filter(tag => typeof tag === 'string') as string[] : [],
         metadata: {},
         readTime: this.calculateReadTime(article.content || '')
       }));
    } catch (error) {
      console.error('搜索文章失败:', error);
      throw error;
    }
  }

  /**
   * 根据分类获取文章
   */
  static async getArticlesByCategory(category: string): Promise<ExtendedArticle[]> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(article => ({
         ...article,
         tags: Array.isArray(article.tags) ? article.tags.filter(tag => typeof tag === 'string') as string[] : [],
         metadata: {},
         readTime: this.calculateReadTime(article.content || '')
       }));
    } catch (error) {
      console.error('获取分类文章失败:', error);
      throw error;
    }
  }

  /**
   * 获取特色文章
   */
  static async getFeaturedArticles(): Promise<ExtendedArticle[]> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(article => ({
         ...article,
         tags: Array.isArray(article.tags) ? article.tags.filter(tag => typeof tag === 'string') as string[] : [],
         metadata: {},
         readTime: this.calculateReadTime(article.content || '')
       }));
    } catch (error) {
      console.error('获取特色文章失败:', error);
      throw error;
    }
  }

  /**
   * 增加文章浏览量
   */
  static async incrementViews(id: string): Promise<void> {
     try {
       // 先获取当前浏览量，然后增加1
       const { data: currentData, error: fetchError } = await supabase
         .from('articles')
         .select('views')
         .eq('id', id)
         .single();

       if (fetchError) throw fetchError;

       const currentViews = currentData?.views || 0;
       const { error } = await supabase
         .from('articles')
         .update({ 
           views: currentViews + 1,
           updated_at: new Date().toISOString()
         })
         .eq('id', id);

       if (error) throw error;
     } catch (error) {
       console.error('增加浏览量失败:', error);
       // 不抛出错误，因为这不是关键功能
     }
   }

  /**
   * 计算阅读时间（分钟）
   */
  private static calculateReadTime(content: string): number {
    const wordsPerMinute = 200; // 平均阅读速度
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }
}

export default ContentService;