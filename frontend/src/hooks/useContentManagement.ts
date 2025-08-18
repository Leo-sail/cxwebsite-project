import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { ContentService, ComponentInstanceService, ContentSearchService } from '../services/contentService';
import type {
  PageContent,
  ComponentInstance,
  ExtendedComponentInstance,
  ContentSearchParams,
  ComponentInstanceSearchParams,
  ContentRealtimeEvent,
  ContentOperationResult
} from '../types/content';

/**
 * 页面内容管理Hook
 * @param pageId 页面ID
 */
export const usePageContents = (pageId: string) => {
  const queryClient = useQueryClient();

  const {
    data: contents = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['pageContents', pageId],
    queryFn: () => ContentService.getPageContents(pageId),
    enabled: !!pageId
  });

  // 创建内容
  const createContentMutation = useMutation({
    mutationFn: ContentService.createContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageContents', pageId] });
    }
  });

  // 更新内容
  const updateContentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PageContent> }) =>
      ContentService.updateContent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageContents', pageId] });
    }
  });

  // 删除内容
  const deleteContentMutation = useMutation({
    mutationFn: ContentService.deleteContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageContents', pageId] });
    }
  });

  // 批量更新排序
  const updateSortOrderMutation = useMutation({
    mutationFn: ContentService.updateContentOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageContents', pageId] });
    }
  });

  return {
    contents,
    isLoading,
    error,
    refetch,
    createContent: createContentMutation.mutateAsync,
    updateContent: updateContentMutation.mutateAsync,
    deleteContent: deleteContentMutation.mutateAsync,
    updateSortOrder: updateSortOrderMutation.mutateAsync,
    isCreating: createContentMutation.isPending,
    isUpdating: updateContentMutation.isPending,
    isDeleting: deleteContentMutation.isPending
  };
};

/**
 * 组件实例管理Hook
 * @param pageId 页面ID
 */
export const useComponentInstances = (pageId: string) => {
  const queryClient = useQueryClient();

  // 获取组件实例列表
  const {
    data: instances,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['component-instances', pageId],
    queryFn: () => ComponentInstanceService.getPageComponents(pageId),
    enabled: !!pageId
  });

  // 获取组件树
  const {
    data: componentTree,
    isLoading: isLoadingTree
  } = useQuery({
    queryKey: ['component-tree', pageId],
    queryFn: () => ComponentInstanceService.getComponentTree(pageId),
    enabled: !!pageId
  });

  // 创建组件实例
  const createInstanceMutation = useMutation({
    mutationFn: ComponentInstanceService.createComponent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['component-instances', pageId] });
      queryClient.invalidateQueries({ queryKey: ['component-tree', pageId] });
    }
  });

  // 更新组件实例
  const updateInstanceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ComponentInstance> }) =>
      ComponentInstanceService.updateComponent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['component-instances', pageId] });
      queryClient.invalidateQueries({ queryKey: ['component-tree', pageId] });
    }
  });

  // 删除组件实例
  const deleteInstanceMutation = useMutation({
    mutationFn: ComponentInstanceService.deleteComponent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['component-instances', pageId] });
      queryClient.invalidateQueries({ queryKey: ['component-tree', pageId] });
    }
  });

  // 复制组件实例
  const cloneInstanceMutation = useMutation({
    mutationFn: ({ id, newPageId }: { id: string; newPageId?: string }) =>
      ComponentInstanceService.duplicateComponent(id, newPageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['component-instances', pageId] });
      queryClient.invalidateQueries({ queryKey: ['component-tree', pageId] });
    }
  });

  return {
    instances,
    componentTree,
    isLoading,
    isLoadingTree,
    error,
    refetch,
    createInstance: createInstanceMutation.mutateAsync,
    updateInstance: updateInstanceMutation.mutateAsync,
    deleteInstance: deleteInstanceMutation.mutateAsync,
    cloneInstance: cloneInstanceMutation.mutateAsync,
    isCreating: createInstanceMutation.isPending,
    isUpdating: updateInstanceMutation.isPending,
    isDeleting: deleteInstanceMutation.isPending
  };
};

/**
 * 内容搜索Hook
 */
export const useContentSearch = () => {
  const [searchParams, setSearchParams] = useState<ContentSearchParams>({});
  const [componentSearchParams, setComponentSearchParams] = useState<ComponentInstanceSearchParams>({});

  // 搜索页面内容
  const {
    data: searchResults,
    isLoading: isSearching,
    error: searchError
  } = useQuery({
    queryKey: ['content-search', searchParams],
    queryFn: () => ContentSearchService.searchContents(searchParams),
    enabled: Object.keys(searchParams).length > 0
  });

  // 搜索组件实例
  const {
    data: componentSearchResults,
    isLoading: isSearchingComponents,
    error: componentSearchError
  } = useQuery({
    queryKey: ['component-search', componentSearchParams],
    queryFn: () => ContentSearchService.searchComponents(componentSearchParams),
    enabled: Object.keys(componentSearchParams).length > 0
  });

  const searchContents = useCallback((params: ContentSearchParams) => {
    setSearchParams(params);
  }, []);

  const searchComponents = useCallback((params: ComponentInstanceSearchParams) => {
    setComponentSearchParams(params);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchParams({});
    setComponentSearchParams({});
  }, []);

  return {
    searchResults,
    componentSearchResults,
    isSearching,
    isSearchingComponents,
    searchError,
    componentSearchError,
    searchContents,
    searchComponents,
    clearSearch
  };
};

/**
 * 实时内容更新Hook
 * @param pageId 页面ID
 * @param onUpdate 更新回调函数
 */
export const useContentRealtime = (
  pageId: string,
  onUpdate?: (event: ContentRealtimeEvent) => void
) => {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<ContentRealtimeEvent | null>(null);

  // 使用useCallback稳定化onUpdate回调
  const stableOnUpdate = useCallback((event: ContentRealtimeEvent) => {
    onUpdate?.(event);
  }, [onUpdate]);

  useEffect(() => {
    if (!pageId) return;

    // 订阅页面内容变更
    const contentChannel = supabase
      .channel(`page-contents-${pageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'page_contents',
          filter: `page_id=eq.${pageId}`
        },
        (payload) => {
          const event: ContentRealtimeEvent = {
            eventType: payload.eventType as any,
            table: 'page_contents',
            new: payload.new as PageContent,
            old: payload.old as PageContent,
            timestamp: new Date().toISOString()
          };
          
          setLastEvent(event);
          stableOnUpdate(event);
          
          // 更新查询缓存
          queryClient.invalidateQueries({ queryKey: ['page-contents', pageId] });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    // 订阅组件实例变更
    const componentChannel = supabase
      .channel(`component-instances-${pageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'component_instances',
          filter: `page_id=eq.${pageId}`
        },
        (payload) => {
          const event: ContentRealtimeEvent = {
            eventType: payload.eventType as any,
            table: 'component_instances',
            new: payload.new as ComponentInstance,
            old: payload.old as ComponentInstance,
            timestamp: new Date().toISOString()
          };
          
          setLastEvent(event);
          stableOnUpdate(event);
          
          // 更新查询缓存
          queryClient.invalidateQueries({ queryKey: ['component-instances', pageId] });
          queryClient.invalidateQueries({ queryKey: ['component-tree', pageId] });
        }
      )
      .subscribe();

    return () => {
      contentChannel.unsubscribe();
      componentChannel.unsubscribe();
    };
  }, [pageId, stableOnUpdate]);

  return {
    isConnected,
    lastEvent
  };
};

/**
 * 内容验证Hook
 */
export const useContentValidation = () => {
  const validateContent = useCallback((content: Partial<PageContent>): ContentOperationResult => {
    const errors: string[] = [];

    if (!content.page_id) {
      errors.push('页面ID不能为空');
    }

    if (!content.content_type) {
      errors.push('内容类型不能为空');
    }

    if (!content.content_key) {
      errors.push('内容键不能为空');
    }

    if (!content.content_data) {
      errors.push('内容数据不能为空');
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: errors.join(', ')
      };
    }

    return { success: true };
  }, []);

  const validateComponentInstance = useCallback((instance: Partial<ExtendedComponentInstance>): ContentOperationResult => {
    const errors: string[] = [];

    if (!instance.page_id) {
      errors.push('页面ID不能为空');
    }

    if (!instance.component_type) {
      errors.push('组件类型不能为空');
    }

    if (!instance.component_name) {
      errors.push('组件名称不能为空');
    }

    if (!instance.props_data) {
      errors.push('组件属性不能为空');
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: errors.join(', ')
      };
    }

    return { success: true };
  }, []);

  return {
    validateContent,
    validateComponentInstance
  };
};