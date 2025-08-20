/**
 * DebounceHandler - 防抖请求处理器
 * 防止频繁重复请求，优化性能
 */

export interface DebounceConfig {
  delay: number;
  maxWait?: number;
  leading?: boolean;
  trailing?: boolean;
}

export interface IDebounceHandler {
  execute<T>(fn: () => Promise<T>, key: string, config?: Partial<DebounceConfig>): Promise<T>;
  cancel(key: string): void;
  clear(): void;
  isPending(key: string): boolean;
}

interface DebounceEntry {
  timeoutId: NodeJS.Timeout | null;
  maxTimeoutId: NodeJS.Timeout | null;
  promise: Promise<any> | null;
  resolve: ((value: any) => void) | null;
  reject: ((reason: any) => void) | null;
  lastCallTime: number;
  config: DebounceConfig;
}

/**
 * 防抖请求处理器实现
 * 主要功能：
 * 1. 防止频繁重复请求
 * 2. 合并相同键的请求
 * 3. 支持可配置的防抖策略
 * 4. 提供立即执行和延迟执行选项
 */
export class DebounceHandler implements IDebounceHandler {
  private entries: Map<string, DebounceEntry> = new Map();
  private defaultConfig: DebounceConfig = {
    delay: 300,
    maxWait: 1000,
    leading: false,
    trailing: true
  };

  /**
   * 执行防抖函数
   * @param fn 要执行的函数
   * @param key 防抖键
   * @param config 防抖配置
   * @returns Promise结果
   */
  execute<T>(fn: () => Promise<T>, key: string, config?: Partial<DebounceConfig>): Promise<T> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const now = Date.now();
    
    let entry = this.entries.get(key);
    
    // 如果没有现有条目，创建新的
    if (!entry) {
      entry = {
        timeoutId: null,
        maxTimeoutId: null,
        promise: null,
        resolve: null,
        reject: null,
        lastCallTime: now,
        config: finalConfig
      };
      this.entries.set(key, entry);
    }

    // 如果已有Promise在执行，返回现有的Promise
    if (entry.promise) {
      return entry.promise as Promise<T>;
    }

    // 更新最后调用时间
    entry.lastCallTime = now;
    entry.config = finalConfig;

    // 创建新的Promise
    const promise = new Promise<T>((resolve, reject) => {
      entry!.resolve = resolve;
      entry!.reject = reject;

      // 如果配置了leading，立即执行
      if (finalConfig.leading && !entry!.timeoutId) {
        this.executeFunction(fn, key);
        return;
      }

      // 清除之前的超时
      if (entry!.timeoutId) {
        clearTimeout(entry!.timeoutId);
      }

      // 设置新的超时
      entry!.timeoutId = setTimeout(() => {
        if (finalConfig.trailing) {
          this.executeFunction(fn, key);
        } else {
          this.cleanup(key);
        }
      }, finalConfig.delay);

      // 设置最大等待时间
      if (finalConfig.maxWait && !entry!.maxTimeoutId) {
        entry!.maxTimeoutId = setTimeout(() => {
          this.executeFunction(fn, key);
        }, finalConfig.maxWait);
      }
    });

    entry.promise = promise;
    return promise;
  }

  /**
   * 取消指定键的防抖
   * @param key 防抖键
   */
  cancel(key: string): void {
    const entry = this.entries.get(key);
    if (!entry) return;

    // 清除超时
    if (entry.timeoutId) {
      clearTimeout(entry.timeoutId);
    }
    if (entry.maxTimeoutId) {
      clearTimeout(entry.maxTimeoutId);
    }

    // 拒绝Promise
    if (entry.reject) {
      entry.reject(new Error('Debounce cancelled'));
    }

    // 清理条目
    this.entries.delete(key);
  }

  /**
   * 清除所有防抖
   */
  clear(): void {
    for (const key of this.entries.keys()) {
      this.cancel(key);
    }
  }

  /**
   * 检查指定键是否有待处理的防抖
   * @param key 防抖键
   * @returns 是否待处理
   */
  isPending(key: string): boolean {
    return this.entries.has(key);
  }

  /**
   * 获取待处理的防抖数量
   * @returns 待处理数量
   */
  getPendingCount(): number {
    return this.entries.size;
  }

  /**
   * 获取指定键的防抖信息
   * @param key 防抖键
   * @returns 防抖信息
   */
  getDebounceInfo(key: string): {
    isPending: boolean;
    lastCallTime?: number;
    config?: DebounceConfig;
  } {
    const entry = this.entries.get(key);
    if (!entry) {
      return { isPending: false };
    }

    return {
      isPending: true,
      lastCallTime: entry.lastCallTime,
      config: entry.config
    };
  }

  // 私有方法

  /**
   * 执行函数
   * @param fn 要执行的函数
   * @param key 防抖键
   */
  private async executeFunction<T>(fn: () => Promise<T>, key: string): Promise<void> {
    const entry = this.entries.get(key);
    if (!entry || !entry.resolve || !entry.reject) {
      return;
    }

    try {
      const result = await fn();
      entry.resolve(result);
    } catch (error) {
      entry.reject(error);
    } finally {
      this.cleanup(key);
    }
  }

  /**
   * 清理条目
   * @param key 防抖键
   */
  private cleanup(key: string): void {
    const entry = this.entries.get(key);
    if (!entry) return;

    // 清除超时
    if (entry.timeoutId) {
      clearTimeout(entry.timeoutId);
    }
    if (entry.maxTimeoutId) {
      clearTimeout(entry.maxTimeoutId);
    }

    // 删除条目
    this.entries.delete(key);
  }
}

/**
 * 创建DebounceHandler实例的工厂函数
 * @param defaultConfig 默认配置
 * @returns DebounceHandler实例
 */
export function createDebounceHandler(defaultConfig?: Partial<DebounceConfig>): DebounceHandler {
  const handler = new DebounceHandler();
  if (defaultConfig) {
    (handler as any).defaultConfig = { ...(handler as any).defaultConfig, ...defaultConfig };
  }
  return handler;
}

/**
 * 默认导出DebounceHandler类
 */
export default DebounceHandler;

/**
 * 全局防抖处理器实例
 */
export const globalDebounceHandler = new DebounceHandler();