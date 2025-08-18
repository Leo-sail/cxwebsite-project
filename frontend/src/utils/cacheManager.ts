/**
 * 统一缓存管理器
 * 提供内存缓存、本地存储缓存、会话存储缓存等多种缓存策略
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // 生存时间（毫秒）
  accessCount: number;
  lastAccess: number;
}

interface CacheConfig {
  defaultTTL: number; // 默认TTL（毫秒）
  maxSize: number; // 最大缓存项数
  cleanupInterval: number; // 清理间隔（毫秒）
  enablePersistence: boolean; // 是否启用持久化
  storageType: 'localStorage' | 'sessionStorage'; // 存储类型
}

type CacheStrategy = 'LRU' | 'LFU' | 'FIFO';

class CacheManager<T = any> {
  private cache = new Map<string, CacheItem<T>>();
  private config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;
  private strategy: CacheStrategy;
  private namespace: string;

  constructor(
    namespace: string = 'default',
    config: Partial<CacheConfig> = {},
    strategy: CacheStrategy = 'LRU'
  ) {
    this.namespace = namespace;
    this.strategy = strategy;
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5分钟
      maxSize: 100,
      cleanupInterval: 60 * 1000, // 1分钟
      enablePersistence: false,
      storageType: 'localStorage',
      ...config
    };

    this.init();
  }

  /**
   * 初始化缓存管理器
   */
  private init(): void {
    // 从持久化存储加载数据
    if (this.config.enablePersistence) {
      this.loadFromStorage();
    }

    // 启动定期清理
    if (this.config.cleanupInterval > 0) {
      this.startCleanup();
    }

    // 监听页面卸载，保存数据
    if (typeof window !== 'undefined' && this.config.enablePersistence) {
      window.addEventListener('beforeunload', () => {
        this.saveToStorage();
      });
    }
  }

  /**
   * 设置缓存项
   */
  public set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const item: CacheItem<T> = {
      data,
      timestamp: now,
      ttl: ttl || this.config.defaultTTL,
      accessCount: 0,
      lastAccess: now
    };

    // 检查缓存大小限制
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    this.cache.set(key, item);

    // 持久化
    if (this.config.enablePersistence) {
      this.saveToStorage();
    }
  }

  /**
   * 获取缓存项
   */
  public get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    const now = Date.now();
    
    // 检查是否过期
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    // 更新访问信息
    item.accessCount++;
    item.lastAccess = now;

    return item.data;
  }

  /**
   * 检查缓存项是否存在且未过期
   */
  public has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    const now = Date.now();
    
    // 检查是否过期
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 删除缓存项
   */
  public delete(key: string): boolean {
    const result = this.cache.delete(key);
    
    if (result && this.config.enablePersistence) {
      this.saveToStorage();
    }
    
    return result;
  }

  /**
   * 清空所有缓存
   */
  public clear(): void {
    this.cache.clear();
    
    if (this.config.enablePersistence) {
      this.clearStorage();
    }
  }

  /**
   * 获取或设置缓存（如果不存在则通过工厂函数创建）
   */
  public async getOrSet(
    key: string,
    factory: () => Promise<T> | T,
    ttl?: number
  ): Promise<T> {
    const cached = this.get(key);
    
    if (cached !== null) {
      return cached;
    }

    const data = await factory();
    this.set(key, data, ttl);
    return data;
  }

  /**
   * 批量获取
   */
  public getMultiple(keys: string[]): Record<string, T | null> {
    const result: Record<string, T | null> = {};
    
    keys.forEach(key => {
      result[key] = this.get(key);
    });
    
    return result;
  }

  /**
   * 批量设置
   */
  public setMultiple(items: Record<string, T>, ttl?: number): void {
    Object.entries(items).forEach(([key, data]) => {
      this.set(key, data, ttl);
    });
  }

  /**
   * 获取缓存统计信息
   */
  public getStats(): {
    size: number;
    hitRate: number;
    totalAccess: number;
    averageAge: number;
    oldestItem: number;
    newestItem: number;
  } {
    const now = Date.now();
    let totalAccess = 0;
    let totalAge = 0;
    let oldest = now;
    let newest = 0;

    this.cache.forEach(item => {
      totalAccess += item.accessCount;
      totalAge += now - item.timestamp;
      oldest = Math.min(oldest, item.timestamp);
      newest = Math.max(newest, item.timestamp);
    });

    return {
      size: this.cache.size,
      hitRate: totalAccess > 0 ? (totalAccess / (totalAccess + this.cache.size)) : 0,
      totalAccess,
      averageAge: this.cache.size > 0 ? totalAge / this.cache.size : 0,
      oldestItem: oldest === now ? 0 : now - oldest,
      newestItem: newest === 0 ? 0 : now - newest
    };
  }

  /**
   * 获取所有键
   */
  public keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 获取所有值
   */
  public values(): T[] {
    return Array.from(this.cache.values()).map(item => item.data);
  }

  /**
   * 获取缓存大小
   */
  public size(): number {
    return this.cache.size;
  }

  /**
   * 刷新缓存项的TTL
   */
  public refresh(key: string, ttl?: number): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    item.timestamp = Date.now();
    if (ttl !== undefined) {
      item.ttl = ttl;
    }

    return true;
  }

  /**
   * 缓存淘汰策略
   */
  private evict(): void {
    if (this.cache.size === 0) return;

    let keyToEvict: string | null = null;

    switch (this.strategy) {
      case 'LRU': // 最近最少使用
        keyToEvict = this.findLRUKey();
        break;
      case 'LFU': // 最少使用频率
        keyToEvict = this.findLFUKey();
        break;
      case 'FIFO': // 先进先出
        keyToEvict = this.findFIFOKey();
        break;
    }

    if (keyToEvict) {
      this.cache.delete(keyToEvict);
    }
  }

  /**
   * 查找最近最少使用的键
   */
  private findLRUKey(): string | null {
    let oldestAccess = Date.now();
    let keyToEvict: string | null = null;

    this.cache.forEach((item, key) => {
      if (item.lastAccess < oldestAccess) {
        oldestAccess = item.lastAccess;
        keyToEvict = key;
      }
    });

    return keyToEvict;
  }

  /**
   * 查找最少使用频率的键
   */
  private findLFUKey(): string | null {
    let minAccessCount = Infinity;
    let keyToEvict: string | null = null;

    this.cache.forEach((item, key) => {
      if (item.accessCount < minAccessCount) {
        minAccessCount = item.accessCount;
        keyToEvict = key;
      }
    });

    return keyToEvict;
  }

  /**
   * 查找最早添加的键
   */
  private findFIFOKey(): string | null {
    let oldestTimestamp = Date.now();
    let keyToEvict: string | null = null;

    this.cache.forEach((item, key) => {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        keyToEvict = key;
      }
    });

    return keyToEvict;
  }

  /**
   * 清理过期项
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.cache.delete(key);
    });

    if (keysToDelete.length > 0 && this.config.enablePersistence) {
      this.saveToStorage();
    }
  }

  /**
   * 启动定期清理
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * 保存到存储
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const storage = this.config.storageType === 'localStorage' 
        ? localStorage 
        : sessionStorage;
      
      const data = {
        cache: Array.from(this.cache.entries()),
        timestamp: Date.now()
      };
      
      storage.setItem(`cache-${this.namespace}`, JSON.stringify(data));
    } catch (e) {
      console.warn(`[缓存管理器] 保存到${this.config.storageType}失败:`, e);
    }
  }

  /**
   * 从存储加载
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const storage = this.config.storageType === 'localStorage' 
        ? localStorage 
        : sessionStorage;
      
      const data = storage.getItem(`cache-${this.namespace}`);
      
      if (data) {
        const parsed = JSON.parse(data);
        
        // 检查数据是否过期（24小时）
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          this.cache = new Map(parsed.cache);
          // 清理过期项
          this.cleanup();
        }
      }
    } catch (e) {
      console.warn(`[缓存管理器] 从${this.config.storageType}加载失败:`, e);
    }
  }

  /**
   * 清空存储
   */
  private clearStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const storage = this.config.storageType === 'localStorage' 
        ? localStorage 
        : sessionStorage;
      
      storage.removeItem(`cache-${this.namespace}`);
    } catch (e) {
      console.warn(`[缓存管理器] 清空${this.config.storageType}失败:`, e);
    }
  }

  /**
   * 销毁缓存管理器
   */
  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }

    if (this.config.enablePersistence) {
      this.saveToStorage();
    }

    this.cache.clear();
  }
}

// 预定义的缓存实例
export const memoryCache = new CacheManager('memory', {
  defaultTTL: 5 * 60 * 1000, // 5分钟
  maxSize: 100,
  enablePersistence: false
}, 'LRU');

export const persistentCache = new CacheManager('persistent', {
  defaultTTL: 30 * 60 * 1000, // 30分钟
  maxSize: 200,
  enablePersistence: true,
  storageType: 'localStorage'
}, 'LRU');

export const sessionCache = new CacheManager('session', {
  defaultTTL: 60 * 60 * 1000, // 1小时
  maxSize: 50,
  enablePersistence: true,
  storageType: 'sessionStorage'
}, 'LRU');

// 导出类型和类
export type { CacheItem, CacheConfig, CacheStrategy };
export { CacheManager };

// React Hook
export function useCache<T = any>(namespace: string = 'default') {
  const cache = new CacheManager<T>(namespace);
  
  return {
    get: cache.get.bind(cache),
    set: cache.set.bind(cache),
    has: cache.has.bind(cache),
    delete: cache.delete.bind(cache),
    clear: cache.clear.bind(cache),
    getOrSet: cache.getOrSet.bind(cache),
    getStats: cache.getStats.bind(cache),
    refresh: cache.refresh.bind(cache)
  };
}