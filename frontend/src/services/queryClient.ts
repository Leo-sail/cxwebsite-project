import { QueryClient } from '@tanstack/react-query';
import { performanceMonitor } from '../utils/performanceMonitor';
import { persistentCache } from '../utils/cacheManager';

/**
 * React Query客户端配置
 * 配置了缓存策略、重试机制、错误处理和性能监控
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 数据被认为是新鲜的时间（5分钟）
      staleTime: 5 * 60 * 1000,
      // 数据在缓存中保持的时间（10分钟）
      gcTime: 10 * 60 * 1000,
      // 重试配置
      retry: (failureCount, error: any) => {
        // 对于401/403错误不重试
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        // 最多重试3次
        return failureCount < 3;
      },
      // 重试延迟（指数退避）
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // 窗口聚焦时重新获取数据
      refetchOnWindowFocus: true,
      // 网络重连时重新获取数据
      refetchOnReconnect: true,
      // 网络模式配置
      networkMode: 'online',
      // 启用后台重新获取
      refetchOnMount: 'always',
    },
    mutations: {
      // 变更重试配置
      retry: 1,
      // 变更重试延迟
      retryDelay: 1000,
      // 网络模式配置
      networkMode: 'online',
    },
  },
});

// 添加全局查询监听器用于性能监控
queryClient.getQueryCache().subscribe((event) => {
  if (event?.type === 'updated' && event.action?.type === 'success') {
    const query = event.query;
    const queryKey = JSON.stringify(query.queryKey);
    const duration = Date.now() - (query.state.dataUpdatedAt || 0);
    
    // 记录查询性能
    performanceMonitor.addMetric(
      `查询-${queryKey}`,
      duration,
      'custom'
    );
  }
});

// 添加变更监听器
queryClient.getMutationCache().subscribe((event) => {
  if (event?.type === 'updated' && event.action?.type === 'success') {
    const mutation = event.mutation;
    const mutationKey = JSON.stringify(mutation.options.mutationKey || 'unknown');
    const duration = Date.now() - (mutation.state.submittedAt || 0);
    
    // 记录变更性能
    performanceMonitor.addMetric(
      `变更-${mutationKey}`,
      duration,
      'custom'
    );
  }
});

/**
 * 持久化查询缓存
 * 将重要的查询结果保存到本地存储
 */
export function persistQueryData(queryKey: string[], data: any, ttl?: number): void {
  try {
    const key = `query-${JSON.stringify(queryKey)}`;
    persistentCache.set(key, data, ttl);
  } catch (error) {
    console.warn('[查询缓存] 持久化失败:', error);
  }
}

/**
 * 从持久化缓存获取查询数据
 */
export function getPersistedQueryData(queryKey: string[]): any | null {
  try {
    const key = `query-${JSON.stringify(queryKey)}`;
    return persistentCache.get(key);
  } catch (error) {
    console.warn('[查询缓存] 获取持久化数据失败:', error);
    return null;
  }
}

/**
 * 清除持久化查询缓存
 */
export function clearPersistedQueryData(queryKey?: string[]): void {
  try {
    if (queryKey) {
      const key = `query-${JSON.stringify(queryKey)}`;
      persistentCache.delete(key);
    } else {
      // 清除所有查询缓存
      const keys = persistentCache.keys().filter(key => key.startsWith('query-'));
      keys.forEach(key => persistentCache.delete(key));
    }
  } catch (error) {
    console.warn('[查询缓存] 清除持久化数据失败:', error);
  }
}

/**
 * 预加载查询数据
 */
export async function prefetchQuery(
  queryKey: string[],
  queryFn: () => Promise<any>,
  options?: {
    staleTime?: number;
    gcTime?: number;
    persist?: boolean;
  }
): Promise<void> {
  const startTime = performance.now();
  
  try {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: options?.staleTime,
      gcTime: options?.gcTime,
    });
    
    // 如果启用持久化，保存到本地缓存
    if (options?.persist) {
      const data = queryClient.getQueryData(queryKey);
      if (data) {
        persistQueryData(queryKey, data, options.staleTime);
      }
    }
    
    const endTime = performance.now();
    performanceMonitor.addMetric(
      `预加载-${JSON.stringify(queryKey)}`,
      endTime - startTime,
      'custom'
    );
  } catch (error) {
    const endTime = performance.now();
    performanceMonitor.addMetric(
      `预加载失败-${JSON.stringify(queryKey)}`,
      endTime - startTime,
      'custom'
    );
    throw error;
  }
}

/**
 * 批量预加载查询
 */
export async function prefetchQueries(
  queries: Array<{
    queryKey: string[];
    queryFn: () => Promise<any>;
    options?: {
      staleTime?: number;
      gcTime?: number;
      persist?: boolean;
    };
  }>
): Promise<void> {
  const startTime = performance.now();
  
  try {
    await Promise.all(
      queries.map(query => prefetchQuery(query.queryKey, query.queryFn, query.options))
    );
    
    const endTime = performance.now();
    performanceMonitor.addMetric(
      `批量预加载-${queries.length}个查询`,
      endTime - startTime,
      'custom'
    );
  } catch (error) {
    const endTime = performance.now();
    performanceMonitor.addMetric(
      `批量预加载失败-${queries.length}个查询`,
      endTime - startTime,
      'custom'
    );
    throw error;
  }
}

/**
 * Query Keys常量
 */
export const QUERY_KEYS = {
  // 课程相关
  COURSES: ['courses'] as const,
  COURSE: (id: string) => ['courses', id] as const,
  
  // 教师相关
  TEACHERS: ['teachers'] as const,
  TEACHER: (id: string) => ['teachers', id] as const,
  
  // 学员案例相关
  STUDENT_CASES: ['student-cases'] as const,
  STUDENT_CASE: (id: string) => ['student-cases', id] as const,
  
  // 文章相关
  ARTICLES: ['articles'] as const,
  ARTICLE: (id: string) => ['articles', id] as const,
  FEATURED_ARTICLES: ['articles', 'featured'] as const,
  
  // 页面配置相关
  PAGE_CONFIGS: ['page-configs'] as const,
  PAGE_CONFIG: (pageName: string) => ['page-configs', pageName] as const,
  
  // 媒体文件相关
  MEDIA_FILES: ['media-files'] as const,
  MEDIA_FILE: (id: string) => ['media-files', id] as const
} as const;