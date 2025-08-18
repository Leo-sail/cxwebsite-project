/**
 * 性能监控工具
 * 用于监控应用的性能指标，包括页面加载时间、组件渲染时间等
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'navigation' | 'resource' | 'measure' | 'custom';
}

interface PerformanceConfig {
  enableConsoleLog: boolean;
  enableLocalStorage: boolean;
  maxMetrics: number;
  reportInterval: number; // 毫秒
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private config: PerformanceConfig;
  private reportTimer?: NodeJS.Timeout;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableConsoleLog: false,
      enableLocalStorage: true,
      maxMetrics: 100,
      reportInterval: 30000, // 30秒
      ...config
    };

    this.init();
  }

  /**
   * 初始化性能监控
   */
  private init(): void {
    // 加载本地存储的数据
    if (this.config.enableLocalStorage) {
      this.loadFromLocalStorage();
    }

    // 监听页面加载完成
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        this.measurePageLoad();
      });

      // 监听导航性能
      this.measureNavigation();

      // 启动定期报告
      if (this.config.reportInterval > 0) {
        this.startPeriodicReport();
      }
    }
  }

  /**
   * 测量页面加载性能
   */
  private measurePageLoad(): void {
    if (!performance || !performance.timing) return;

    const timing = performance.timing;
    const navigationStart = timing.navigationStart;

    // 各个阶段的时间
    const metrics = {
      'DNS查询时间': timing.domainLookupEnd - timing.domainLookupStart,
      'TCP连接时间': timing.connectEnd - timing.connectStart,
      '请求响应时间': timing.responseEnd - timing.requestStart,
      'DOM解析时间': timing.domContentLoadedEventEnd - timing.domLoading,
      '页面完全加载时间': timing.loadEventEnd - navigationStart,
      '首次内容绘制时间': this.getFirstContentfulPaint(),
      '最大内容绘制时间': this.getLargestContentfulPaint()
    };

    Object.entries(metrics).forEach(([name, value]) => {
      if (value > 0) {
        this.addMetric(name, value, 'navigation');
      }
    });
  }

  /**
   * 测量导航性能
   */
  private measureNavigation(): void {
    if (!performance || !performance.getEntriesByType) return;

    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    
    navigationEntries.forEach(entry => {
      this.addMetric('导航类型', entry.type === 'navigate' ? 1 : 0, 'navigation');
      this.addMetric('重定向时间', entry.redirectEnd - entry.redirectStart, 'navigation');
      this.addMetric('缓存查找时间', entry.domainLookupStart - entry.fetchStart, 'navigation');
    });
  }

  /**
   * 获取首次内容绘制时间
   */
  private getFirstContentfulPaint(): number {
    if (!performance || !performance.getEntriesByType) return 0;

    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcpEntry ? fcpEntry.startTime : 0;
  }

  /**
   * 获取最大内容绘制时间
   */
  private getLargestContentfulPaint(): number {
    return new Promise<number>((resolve) => {
      if (!('PerformanceObserver' in window)) {
        resolve(0);
        return;
      }

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry ? lastEntry.startTime : 0);
        observer.disconnect();
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        // 5秒后超时
        setTimeout(() => {
          observer.disconnect();
          resolve(0);
        }, 5000);
      } catch (e) {
        resolve(0);
      }
    }) as any;
  }

  /**
   * 添加性能指标
   */
  public addMetric(name: string, value: number, type: PerformanceMetric['type'] = 'custom'): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      type
    };

    this.metrics.push(metric);

    // 限制指标数量
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics);
    }

    // 控制台输出
    if (this.config.enableConsoleLog) {
      console.log(`[性能监控] ${name}: ${value}ms`);
    }

    // 本地存储
    if (this.config.enableLocalStorage) {
      this.saveToLocalStorage();
    }
  }

  /**
   * 测量函数执行时间
   */
  public measureFunction<T>(name: string, fn: () => T): T {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    
    this.addMetric(`函数执行-${name}`, endTime - startTime, 'measure');
    return result;
  }

  /**
   * 测量异步函数执行时间
   */
  public async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    
    this.addMetric(`异步函数执行-${name}`, endTime - startTime, 'measure');
    return result;
  }

  /**
   * 开始测量
   */
  public startMeasure(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      this.addMetric(name, endTime - startTime, 'measure');
    };
  }

  /**
   * 获取所有指标
   */
  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * 获取指定类型的指标
   */
  public getMetricsByType(type: PerformanceMetric['type']): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.type === type);
  }

  /**
   * 获取性能报告
   */
  public getPerformanceReport(): {
    summary: Record<string, { avg: number; min: number; max: number; count: number }>;
    recent: PerformanceMetric[];
    total: number;
  } {
    const summary: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    // 按名称分组统计
    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          avg: 0,
          min: metric.value,
          max: metric.value,
          count: 0
        };
      }
      
      const stat = summary[metric.name];
      stat.min = Math.min(stat.min, metric.value);
      stat.max = Math.max(stat.max, metric.value);
      stat.count++;
    });

    // 计算平均值
    Object.keys(summary).forEach(name => {
      const values = this.metrics.filter(m => m.name === name).map(m => m.value);
      summary[name].avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    return {
      summary,
      recent: this.metrics.slice(-10), // 最近10条
      total: this.metrics.length
    };
  }

  /**
   * 清除所有指标
   */
  public clearMetrics(): void {
    this.metrics = [];
    if (this.config.enableLocalStorage) {
      localStorage.removeItem('performance-metrics');
    }
  }

  /**
   * 保存到本地存储
   */
  private saveToLocalStorage(): void {
    try {
      const data = {
        metrics: this.metrics.slice(-50), // 只保存最近50条
        timestamp: Date.now()
      };
      localStorage.setItem('performance-metrics', JSON.stringify(data));
    } catch (e) {
      console.warn('[性能监控] 保存到本地存储失败:', e);
    }
  }

  /**
   * 从本地存储加载
   */
  private loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem('performance-metrics');
      if (data) {
        const parsed = JSON.parse(data);
        // 只加载24小时内的数据
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          this.metrics = parsed.metrics || [];
        }
      }
    } catch (e) {
      console.warn('[性能监控] 从本地存储加载失败:', e);
    }
  }

  /**
   * 启动定期报告
   */
  private startPeriodicReport(): void {
    this.reportTimer = setInterval(() => {
      const report = this.getPerformanceReport();
      if (this.config.enableConsoleLog) {
        console.group('[性能监控] 定期报告');
        console.table(report.summary);
        console.log('最近指标:', report.recent);
        console.log('总计指标数:', report.total);
        console.groupEnd();
      }
    }, this.config.reportInterval);
  }

  /**
   * 停止监控
   */
  public destroy(): void {
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = undefined;
    }
  }
}

// 创建全局实例
export const performanceMonitor = new PerformanceMonitor({
  enableConsoleLog: process.env.NODE_ENV === 'development',
  enableLocalStorage: true,
  maxMetrics: 200,
  reportInterval: 60000 // 1分钟
});

// 导出类型和类
export type { PerformanceMetric, PerformanceConfig };
export { PerformanceMonitor };

// React Hook
export function usePerformanceMonitor() {
  return {
    addMetric: performanceMonitor.addMetric.bind(performanceMonitor),
    measureFunction: performanceMonitor.measureFunction.bind(performanceMonitor),
    measureAsyncFunction: performanceMonitor.measureAsyncFunction.bind(performanceMonitor),
    startMeasure: performanceMonitor.startMeasure.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    getReport: performanceMonitor.getPerformanceReport.bind(performanceMonitor),
    clearMetrics: performanceMonitor.clearMetrics.bind(performanceMonitor)
  };
}