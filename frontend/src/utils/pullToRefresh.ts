/**
 * PullToRefresh 工具类型和常量
 */

export const RefreshState = {
  IDLE: 'idle',
  PULLING: 'pulling',
  READY: 'ready',
  REFRESHING: 'refreshing',
  COMPLETE: 'complete'
} as const;

export type RefreshState = typeof RefreshState[keyof typeof RefreshState];

/**
 * 使用下拉刷新的Hook
 */
export const usePullToRefresh = (onRefresh: () => Promise<void> | void) => {
  const refresh = async () => {
    try {
      await onRefresh();
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  return {
    refresh,
    isRefreshing: false
  };
};