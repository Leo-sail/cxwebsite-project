import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

// 基础内容类型定义
type Article = Database['public']['Tables']['articles']['Row'];
type ArticleInsert = Database['public']['Tables']['articles']['Insert'];
type ArticleUpdate = Database['public']['Tables']['articles']['Update'];

type UIConfig = Database['public']['Tables']['ui_configs']['Row'];
type UIConfigInsert = Database['public']['Tables']['ui_configs']['Insert'];
type UIConfigUpdate = Database['public']['Tables']['ui_configs']['Update'];

// 内容操作结果类型
interface ContentOperationResult {
  success: boolean;
  data?: any;
  error?: string;
}

// 实时事件类型
interface ContentRealtimeEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  new?: any;
  old?: any;
  timestamp: string;
}

/**
 * 文章内容管理Hook
 * @param categoryId 分类ID（可选）
 */
export const useArticles = (categoryId?: string) => {
  const queryClient = useQueryClient();

  const {
    data: articles = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['articles', categoryId],
    queryFn: async () => {
      let query = supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (categoryId) {
        query = query.eq('category', categoryId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // 创建文章
  const createArticleMutation = useMutation({
    mutationFn: async (articleData: ArticleInsert): Promise<ContentOperationResult> => {
      try {
        const { data, error } = await supabase
          .from('articles')
          .insert(articleData)
          .select()
          .single();
        
        if (error) throw error;
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    }
  });

  // 更新文章
  const updateArticleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ArticleUpdate }): Promise<ContentOperationResult> => {
      try {
        const { data: result, error } = await supabase
          .from('articles')
          .update(data)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return { success: true, data: result };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    }
  });

  // 删除文章
  const deleteArticleMutation = useMutation({
    mutationFn: async (id: string): Promise<ContentOperationResult> => {
      try {
        const { error } = await supabase
          .from('articles')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    }
  });

  return {
    articles,
    isLoading,
    error,
    refetch,
    createArticle: createArticleMutation.mutateAsync,
    updateArticle: updateArticleMutation.mutateAsync,
    deleteArticle: deleteArticleMutation.mutateAsync,
    isCreating: createArticleMutation.isPending,
    isUpdating: updateArticleMutation.isPending,
    isDeleting: deleteArticleMutation.isPending
  };
};

/**
 * UI配置管理Hook
 * @param configType 配置类型
 */
export const useUIConfigs = (configType?: string) => {
  const queryClient = useQueryClient();

  const {
    data: configs = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['ui-configs', configType],
    queryFn: async () => {
      let query = supabase
        .from('ui_configs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (configType) {
        query = query.eq('config_type', configType);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // 创建配置
  const createConfigMutation = useMutation({
    mutationFn: async (configData: UIConfigInsert): Promise<ContentOperationResult> => {
      try {
        const { data, error } = await supabase
          .from('ui_configs')
          .insert(configData)
          .select()
          .single();
        
        if (error) throw error;
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ui-configs'] });
    }
  });

  // 更新配置
  const updateConfigMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UIConfigUpdate }): Promise<ContentOperationResult> => {
      try {
        const { data: result, error } = await supabase
          .from('ui_configs')
          .update(data)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return { success: true, data: result };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ui-configs'] });
    }
  });

  // 删除配置
  const deleteConfigMutation = useMutation({
    mutationFn: async (id: string): Promise<ContentOperationResult> => {
      try {
        const { error } = await supabase
          .from('ui_configs')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ui-configs'] });
    }
  });

  return {
    configs,
    isLoading,
    error,
    refetch,
    createConfig: createConfigMutation.mutateAsync,
    updateConfig: updateConfigMutation.mutateAsync,
    deleteConfig: deleteConfigMutation.mutateAsync,
    isCreating: createConfigMutation.isPending,
    isUpdating: updateConfigMutation.isPending,
    isDeleting: deleteConfigMutation.isPending
  };
};

/**
 * 内容搜索Hook
 */
export const useContentSearch = () => {
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  /**
   * 搜索文章内容
   * @param query 搜索关键词
   * @param category 分类过滤
   */
  const searchArticles = useCallback(async (query: string, category?: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      let supabaseQuery = supabase
        .from('articles')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,summary.ilike.%${query}%`)
        .order('created_at', { ascending: false });
      
      if (category) {
        supabaseQuery = supabaseQuery.eq('category', category);
      }
      
      const { data, error } = await supabaseQuery;
      
      if (error) throw error;
      setSearchResults(data || []);
    } catch (error: any) {
      setSearchError(error.message);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  /**
   * 清空搜索结果
   */
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchError(null);
  }, []);

  return {
    searchResults,
    isSearching,
    searchError,
    searchArticles,
    clearSearch
  };
};

/**
 * 内容实时更新Hook
 * @param table 监听的表名
 * @param filter 过滤条件
 * @param onUpdate 更新回调
 */
export const useContentRealtime = (
  table: 'articles' | 'ui_configs',
  filter?: string,
  onUpdate?: (event: ContentRealtimeEvent) => void
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<ContentRealtimeEvent | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const queryClient = useQueryClient();

  const stableOnUpdate = useCallback(
    (event: ContentRealtimeEvent) => {
      onUpdate?.(event);
    },
    [onUpdate]
  );

  const setupSubscription = useCallback(() => {
    if (!table) return null;

    console.log(`[Realtime] 设置 ${table} 表的实时订阅...`);
    setConnectionError(null);

    // 创建实时订阅
    const channel = supabase
      .channel(`${table}-changes-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          ...(filter && { filter })
        },
        (payload) => {
          console.log(`[Realtime] 收到 ${table} 表变更:`, payload.eventType);
          const event: ContentRealtimeEvent = {
            eventType: payload.eventType as any,
            table: table,
            new: payload.new,
            old: payload.old,
            timestamp: new Date().toISOString()
          };
          
          setLastEvent(event);
          stableOnUpdate(event);
          
          // 更新查询缓存
          queryClient.invalidateQueries({ queryKey: [table] });
        }
      )
      .subscribe((status, err) => {
        console.log(`[Realtime] ${table} 订阅状态:`, status);
        
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setConnectionError(null);
          setRetryCount(0);
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          setConnectionError(err?.message || '实时连接错误');
          console.error(`[Realtime] ${table} 连接错误:`, err);
          
          // 自动重连机制
          if (retryCount < 3) {
            setTimeout(() => {
              console.log(`[Realtime] 尝试重连 ${table} (${retryCount + 1}/3)`);
              setRetryCount(prev => prev + 1);
            }, 5000 * (retryCount + 1)); // 递增延迟
          }
        } else if (status === 'CLOSED') {
          setIsConnected(false);
          console.log(`[Realtime] ${table} 连接已关闭`);
        }
      });

    return channel;
  }, [table, filter, stableOnUpdate, queryClient, retryCount]);

  useEffect(() => {
    const channel = setupSubscription();
    
    return () => {
      if (channel) {
        console.log(`[Realtime] 清理 ${table} 订阅`);
        supabase.removeChannel(channel);
      }
    };
  }, [setupSubscription]);

  return {
    isConnected,
    connectionError,
    lastEvent,
    retryCount
  };
};

/**
 * 内容验证Hook
 */
export const useContentValidation = () => {
  /**
   * 验证文章数据
   * @param article 文章数据
   */
  const validateArticle = useCallback((article: Partial<ArticleInsert>) => {
    const errors: string[] = [];

    if (!article.title?.trim()) {
      errors.push('标题不能为空');
    }

    if (!article.content?.trim()) {
      errors.push('内容不能为空');
    }

    if (article.title && article.title.length > 200) {
      errors.push('标题长度不能超过200个字符');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  /**
   * 验证UI配置数据
   * @param config UI配置数据
   */
  const validateUIConfig = useCallback((config: Partial<UIConfigInsert>) => {
    const errors: string[] = [];

    if (!config.config_key?.trim()) {
      errors.push('配置键不能为空');
    }

    if (!config.config_type?.trim()) {
      errors.push('配置类型不能为空');
    }

    if (!config.config_value) {
      errors.push('配置值不能为空');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  return {
    validateArticle,
    validateUIConfig
  };
};