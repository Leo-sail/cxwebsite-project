/**
 * 组件文字内容管理Hook
 * 基于React Query实现的组件文字内容管理功能
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { componentTextApi } from '../services/api';
import type { ComponentText, ComponentTextFormData } from '../types';

/**
 * 获取所有组件文字内容
 */
export const useComponentTexts = () => {
  return useQuery({
    queryKey: ['componentTexts'],
    queryFn: componentTextApi.getAll,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  });
};

/**
 * 根据ID获取组件文字内容
 */
export const useComponentText = (id: string) => {
  return useQuery({
    queryKey: ['componentText', id],
    queryFn: () => componentTextApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * 根据key获取组件文字内容
 */
export const useComponentTextByKey = (key: string, area?: string) => {
  return useQuery({
    queryKey: ['componentText', 'key', key, area],
    queryFn: () => componentTextApi.getByKey(key, area),
    enabled: !!key,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * 根据区域获取组件文字内容
 */
export const useComponentTextsByArea = (area: string) => {
  return useQuery({
    queryKey: ['componentTexts', 'area', area],
    queryFn: () => componentTextApi.getByArea(area),
    enabled: !!area,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * 创建组件文字内容
 */
export const useCreateComponentText = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ComponentTextFormData) => componentTextApi.create(data),
    onSuccess: () => {
      // 刷新相关查询
      queryClient.invalidateQueries({ queryKey: ['componentTexts'] });
      queryClient.invalidateQueries({ queryKey: ['componentText'] });
    },
    onError: (error) => {
      console.error('创建组件文字内容失败:', error);
    },
  });
};

/**
 * 更新组件文字内容
 */
export const useUpdateComponentText = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ComponentTextFormData> }) => 
      componentTextApi.update(id, data),
    onSuccess: (data) => {
      // 更新缓存
      queryClient.setQueryData(['componentText', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['componentTexts'] });
      queryClient.invalidateQueries({ queryKey: ['componentText', 'key'] });
    },
    onError: (error) => {
      console.error('更新组件文字内容失败:', error);
    },
  });
};

/**
 * 根据key更新组件文字内容
 */
export const useUpdateComponentTextByKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ key, area, data }: { 
      key: string; 
      area?: string; 
      data: Partial<ComponentTextFormData> 
    }) => componentTextApi.updateByKey(key, area, data),
    onSuccess: (data) => {
      // 更新缓存
      queryClient.setQueryData(['componentText', 'key', data.key, data.area], data);
      queryClient.invalidateQueries({ queryKey: ['componentTexts'] });
      queryClient.invalidateQueries({ queryKey: ['componentText'] });
    },
    onError: (error) => {
      console.error('根据key更新组件文字内容失败:', error);
    },
  });
};

/**
 * 删除组件文字内容
 */
export const useDeleteComponentText = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => componentTextApi.delete(id),
    onSuccess: (_, id) => {
      // 移除缓存
      queryClient.removeQueries({ queryKey: ['componentText', id] });
      queryClient.invalidateQueries({ queryKey: ['componentTexts'] });
      queryClient.invalidateQueries({ queryKey: ['componentText', 'key'] });
    },
    onError: (error) => {
      console.error('删除组件文字内容失败:', error);
    },
  });
};

/**
 * 根据key删除组件文字内容
 */
export const useDeleteComponentTextByKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ key, area }: { key: string; area?: string }) => 
      componentTextApi.deleteByKey(key, area),
    onSuccess: (_, { key, area }) => {
      // 移除缓存
      queryClient.removeQueries({ queryKey: ['componentText', 'key', key, area] });
      queryClient.invalidateQueries({ queryKey: ['componentTexts'] });
      queryClient.invalidateQueries({ queryKey: ['componentText'] });
    },
    onError: (error) => {
      console.error('根据key删除组件文字内容失败:', error);
    },
  });
};

/**
 * 便捷Hook：根据key获取单个文字内容
 * @param key 文字内容的key
 * @param area 可选的区域参数
 * @returns 文字内容字符串，加载中时返回key作为后备
 */
export const useText = (key: string, area?: string): string => {
  const { data, isLoading } = useComponentTextByKey(key, area);
  
  // 加载中或没有数据时返回key作为后备显示
  if (isLoading || !data) {
    return key;
  }
  
  return data.content;
};

/**
 * 便捷Hook：根据key数组获取多个文字内容
 * @param keys 文字内容的key数组
 * @param area 可选的区域参数
 * @returns 文字内容对象，key为键，content为值
 */
export const useTexts = (keys: string[], area?: string): Record<string, string> => {
  const results = keys.map(key => {
    const { data, isLoading } = useComponentTextByKey(key, area);
    return { key, data, isLoading };
  });
  
  const textMap: Record<string, string> = {};
  
  results.forEach(({ key, data, isLoading }) => {
    // 加载中或没有数据时返回key作为后备显示
    textMap[key] = (isLoading || !data) ? key : data.content;
  });
  
  return textMap;
};