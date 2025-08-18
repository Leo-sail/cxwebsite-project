/**
 * 内存优化 Hook
 * 提供内存监控、清理、优化等功能
 */

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { performanceMonitor } from '../utils/performanceMonitor';

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface MemoryOptimizationOptions {
  enableMonitoring?: boolean;
  monitoringInterval?: number;
  memoryThreshold?: number; // 内存使用阈值（MB）
  autoCleanup?: boolean;
  onMemoryWarning?: (memoryInfo: MemoryInfo) => void;
  onMemoryError?: (error: Error) => void;
}

interface MemoryOptimizationResult {
  memoryInfo: MemoryInfo | null;
  isMemoryHigh: boolean;
  cleanup: () => void;
  forceGC: () => void;
  getMemoryUsage: () => number;
  addCleanupTask: (task: () => void) => void;
  removeCleanupTask: (task: () => void) => void;
}

/**
 * 内存优化 Hook
 */
export const useMemoryOptimization = ({
  enableMonitoring = true,
  monitoringInterval = 5000,
  memoryThreshold = 100, // 100MB
  autoCleanup = true,
  onMemoryWarning,
  onMemoryError
}: MemoryOptimizationOptions = {}): MemoryOptimizationResult => {
  const memoryInfoRef = useRef<MemoryInfo | null>(null);
  const cleanupTasksRef = useRef<Set<() => void>>(new Set());
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastWarningTimeRef = useRef<number>(0);
  const isMonitoringRef = useRef<boolean>(false);

  // 获取内存信息
  const getMemoryInfo = useCallback((): MemoryInfo | null => {
    try {
      if ('memory' in performance && (performance as any).memory) {
        const memory = (performance as any).memory;
        return {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        };
      }
    } catch (error) {
      onMemoryError?.(error as Error);
    }
    return null;
  }, [onMemoryError]);

  // 获取内存使用量（MB）
  const getMemoryUsage = useCallback((): number => {
    const memoryInfo = getMemoryInfo();
    if (!memoryInfo) return 0;
    return memoryInfo.usedJSHeapSize / (1024 * 1024);
  }, [getMemoryInfo]);

  // 检查内存是否过高
  const isMemoryHigh = useMemo(() => {
    const usage = getMemoryUsage();
    return usage > memoryThreshold;
  }, [getMemoryUsage, memoryThreshold]);

  // 强制垃圾回收
  const forceGC = useCallback(() => {
    try {
      if ('gc' in window && typeof (window as any).gc === 'function') {
        (window as any).gc();
        performanceMonitor.addMetric('强制垃圾回收', 0, 'custom');
      } else if ('webkitRequestFileSystem' in window) {
        // 在某些浏览器中触发垃圾回收的替代方法
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 0);
      }
    } catch (error) {
      onMemoryError?.(error as Error);
    }
  }, [onMemoryError]);

  // 执行清理任务
  const cleanup = useCallback(() => {
    const startTime = performance.now();
    let cleanedTasks = 0;

    try {
      // 执行所有清理任务
      cleanupTasksRef.current.forEach(task => {
        try {
          task();
          cleanedTasks++;
        } catch (error) {
          console.warn('清理任务执行失败:', error);
        }
      });

      // 清理 DOM 中的无用元素
      cleanupDOMElements();

      // 清理事件监听器
      cleanupEventListeners();

      // 清理定时器
      cleanupTimers();

      // 如果内存使用过高，尝试强制垃圾回收
      if (isMemoryHigh && autoCleanup) {
        forceGC();
      }

      const endTime = performance.now();
      performanceMonitor.addMetric(
        `内存清理-${cleanedTasks}个任务`,
        endTime - startTime,
        'custom'
      );
    } catch (error) {
      onMemoryError?.(error as Error);
    }
  }, [isMemoryHigh, autoCleanup, forceGC, onMemoryError]);

  // 清理 DOM 元素
  const cleanupDOMElements = useCallback(() => {
    try {
      // 移除孤立的 DOM 节点
      const orphanedElements = document.querySelectorAll('[data-cleanup="true"]');
      orphanedElements.forEach(element => {
        element.remove();
      });

      // 清理空的文本节点
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            return node.textContent?.trim() === '' ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
          }
        }
      );

      const emptyTextNodes: Node[] = [];
      let node;
      while (node = walker.nextNode()) {
        emptyTextNodes.push(node);
      }

      emptyTextNodes.forEach(textNode => {
        if (textNode.parentNode) {
          textNode.parentNode.removeChild(textNode);
        }
      });
    } catch (error) {
      console.warn('DOM 清理失败:', error);
    }
  }, []);

  // 清理事件监听器
  const cleanupEventListeners = useCallback(() => {
    try {
      // 清理全局事件监听器（需要应用层面配合）
      if ('__eventListeners' in window) {
        const listeners = (window as any).__eventListeners;
        Object.keys(listeners).forEach(key => {
          if (listeners[key].cleanup) {
            listeners[key].cleanup();
          }
        });
      }
    } catch (error) {
      console.warn('事件监听器清理失败:', error);
    }
  }, []);

  // 清理定时器
  const cleanupTimers = useCallback(() => {
    try {
      // 清理全局定时器（需要应用层面配合）
      if ('__timers' in window) {
        const timers = (window as any).__timers;
        timers.forEach((timerId: number) => {
          clearTimeout(timerId);
          clearInterval(timerId);
        });
        (window as any).__timers = [];
      }
    } catch (error) {
      console.warn('定时器清理失败:', error);
    }
  }, []);

  // 添加清理任务
  const addCleanupTask = useCallback((task: () => void) => {
    cleanupTasksRef.current.add(task);
  }, []);

  // 移除清理任务
  const removeCleanupTask = useCallback((task: () => void) => {
    cleanupTasksRef.current.delete(task);
  }, []);

  // 内存监控
  const startMonitoring = useCallback(() => {
    if (!enableMonitoring || isMonitoringRef.current) return;

    isMonitoringRef.current = true;
    
    const monitor = () => {
      try {
        const memoryInfo = getMemoryInfo();
        if (memoryInfo) {
          memoryInfoRef.current = memoryInfo;
          const usage = memoryInfo.usedJSHeapSize / (1024 * 1024);
          
          // 记录内存使用情况
          performanceMonitor.addMetric('内存使用量(MB)', usage, 'custom');
          
          // 检查内存警告
          if (usage > memoryThreshold) {
            const now = Date.now();
            // 避免频繁警告，至少间隔 30 秒
            if (now - lastWarningTimeRef.current > 30000) {
              lastWarningTimeRef.current = now;
              onMemoryWarning?.(memoryInfo);
              
              // 自动清理
              if (autoCleanup) {
                cleanup();
              }
            }
          }
        }
      } catch (error) {
        onMemoryError?.(error as Error);
      }
    };

    // 立即执行一次
    monitor();
    
    // 设置定期监控
    monitoringIntervalRef.current = setInterval(monitor, monitoringInterval);
  }, [enableMonitoring, getMemoryInfo, memoryThreshold, onMemoryWarning, autoCleanup, cleanup, onMemoryError, monitoringInterval]);

  // 停止监控
  const stopMonitoring = useCallback(() => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }
    isMonitoringRef.current = false;
  }, []);

  // 开始监控
  useEffect(() => {
    startMonitoring();
    return stopMonitoring;
  }, [startMonitoring, stopMonitoring]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanup();
      stopMonitoring();
    };
  }, [cleanup, stopMonitoring]);

  return {
    memoryInfo: memoryInfoRef.current,
    isMemoryHigh,
    cleanup,
    forceGC,
    getMemoryUsage,
    addCleanupTask,
    removeCleanupTask
  };
};

/**
 * 内存监控 Hook
 */
export const useMemoryMonitor = (interval: number = 5000) => {
  const memoryInfoRef = useRef<MemoryInfo | null>(null);
  const historyRef = useRef<number[]>([]);

  useEffect(() => {
    const monitor = () => {
      if ('memory' in performance && (performance as any).memory) {
        const memory = (performance as any).memory;
        const memoryInfo: MemoryInfo = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        };
        
        memoryInfoRef.current = memoryInfo;
        
        // 记录历史数据（最多保留 100 个数据点）
        const usage = memoryInfo.usedJSHeapSize / (1024 * 1024);
        historyRef.current.push(usage);
        if (historyRef.current.length > 100) {
          historyRef.current.shift();
        }
      }
    };

    monitor();
    const intervalId = setInterval(monitor, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return {
    memoryInfo: memoryInfoRef.current,
    history: historyRef.current,
    getCurrentUsage: () => {
      const info = memoryInfoRef.current;
      return info ? info.usedJSHeapSize / (1024 * 1024) : 0;
    },
    getAverageUsage: () => {
      const history = historyRef.current;
      if (history.length === 0) return 0;
      return history.reduce((sum, usage) => sum + usage, 0) / history.length;
    },
    getPeakUsage: () => {
      const history = historyRef.current;
      return history.length > 0 ? Math.max(...history) : 0;
    }
  };
};

/**
 * 对象池 Hook
 */
export const useObjectPool = <T>(factory: () => T, reset?: (obj: T) => void, maxSize: number = 10) => {
  const poolRef = useRef<T[]>([]);
  const activeObjectsRef = useRef<Set<T>>(new Set());

  const acquire = useCallback((): T => {
    let obj = poolRef.current.pop();
    if (!obj) {
      obj = factory();
    }
    activeObjectsRef.current.add(obj);
    return obj;
  }, [factory]);

  const release = useCallback((obj: T) => {
    if (!activeObjectsRef.current.has(obj)) return;
    
    activeObjectsRef.current.delete(obj);
    
    if (reset) {
      reset(obj);
    }
    
    if (poolRef.current.length < maxSize) {
      poolRef.current.push(obj);
    }
  }, [reset, maxSize]);

  const clear = useCallback(() => {
    poolRef.current = [];
    activeObjectsRef.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      clear();
    };
  }, [clear]);

  return {
    acquire,
    release,
    clear,
    getPoolSize: () => poolRef.current.length,
    getActiveCount: () => activeObjectsRef.current.size
  };
};

/**
 * 弱引用缓存 Hook
 */
export const useWeakCache = <K extends object, V>() => {
  const cacheRef = useRef<WeakMap<K, V>>(new WeakMap());

  const get = useCallback((key: K): V | undefined => {
    return cacheRef.current.get(key);
  }, []);

  const set = useCallback((key: K, value: V): void => {
    cacheRef.current.set(key, value);
  }, []);

  const has = useCallback((key: K): boolean => {
    return cacheRef.current.has(key);
  }, []);

  const remove = useCallback((key: K): boolean => {
    return cacheRef.current.delete(key);
  }, []);

  const clear = useCallback(() => {
    cacheRef.current = new WeakMap();
  }, []);

  return {
    get,
    set,
    has,
    remove,
    clear
  };
};

export default useMemoryOptimization;