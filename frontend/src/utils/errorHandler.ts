/**
 * 错误处理工具类
 * 提供统一的错误处理、日志记录和用户友好的错误消息
 */

// 错误类型枚举
export enum ErrorType {
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE', 
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  COMPONENT_RENDER = 'COMPONENT_RENDER',
  DATA_LOADING = 'DATA_LOADING',
  SUBSCRIPTION = 'SUBSCRIPTION',
  UNKNOWN = 'UNKNOWN'
}

// 错误严重级别
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// 错误信息接口
export interface ErrorInfo {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  originalError?: Error;
  context?: Record<string, any>;
  timestamp: Date;
  userMessage: string;
  actionable: boolean;
  retryable: boolean;
}

/**
 * 动态组件错误处理类
 */
export class DynamicComponentErrorHandler {
  private static errorLog: ErrorInfo[] = [];
  private static maxLogSize = 100;

  /**
   * 处理错误并返回标准化的错误信息
   * @param error 原始错误
   * @param context 错误上下文
   * @returns ErrorInfo 标准化错误信息
   */
  static handleError(error: unknown, context?: Record<string, any>): ErrorInfo {
    const errorInfo = this.categorizeError(error, context);
    this.logError(errorInfo);
    return errorInfo;
  }

  /**
   * 分类错误并生成错误信息
   * @param error 原始错误
   * @param context 错误上下文
   * @returns ErrorInfo 分类后的错误信息
   */
  private static categorizeError(error: unknown, context?: Record<string, any>): ErrorInfo {
    const timestamp = new Date();
    let errorInfo: ErrorInfo;

    if (error instanceof Error) {
      // 网络错误
      if (error.message.includes('fetch') || error.message.includes('network')) {
        errorInfo = {
          type: ErrorType.NETWORK,
          severity: ErrorSeverity.MEDIUM,
          message: error.message,
          originalError: error,
          context,
          timestamp,
          userMessage: '网络连接异常，请检查网络后重试',
          actionable: true,
          retryable: true
        };
      }
      // 数据库错误
      else if (error.message.includes('supabase') || error.message.includes('database')) {
        errorInfo = {
          type: ErrorType.DATABASE,
          severity: ErrorSeverity.HIGH,
          message: error.message,
          originalError: error,
          context,
          timestamp,
          userMessage: '数据加载失败，请稍后重试',
          actionable: true,
          retryable: true
        };
      }
      // 认证错误
      else if (error.message.includes('auth') || error.message.includes('unauthorized')) {
        errorInfo = {
          type: ErrorType.AUTHENTICATION,
          severity: ErrorSeverity.HIGH,
          message: error.message,
          originalError: error,
          context,
          timestamp,
          userMessage: '身份验证失败，请重新登录',
          actionable: true,
          retryable: false
        };
      }
      // 组件渲染错误
      else if (error.message.includes('render') || error.message.includes('component')) {
        errorInfo = {
          type: ErrorType.COMPONENT_RENDER,
          severity: ErrorSeverity.MEDIUM,
          message: error.message,
          originalError: error,
          context,
          timestamp,
          userMessage: '组件显示异常，正在尝试恢复',
          actionable: true,
          retryable: true
        };
      }
      // 通用错误
      else {
        errorInfo = {
          type: ErrorType.UNKNOWN,
          severity: ErrorSeverity.MEDIUM,
          message: error.message,
          originalError: error,
          context,
          timestamp,
          userMessage: '操作失败，请重试',
          actionable: true,
          retryable: true
        };
      }
    } else {
      // 非Error对象的错误
      errorInfo = {
        type: ErrorType.UNKNOWN,
        severity: ErrorSeverity.LOW,
        message: String(error),
        context,
        timestamp,
        userMessage: '发生未知错误，请重试',
        actionable: true,
        retryable: true
      };
    }

    return errorInfo;
  }

  /**
   * 记录错误到日志
   * @param errorInfo 错误信息
   */
  private static logError(errorInfo: ErrorInfo): void {
    // 添加到错误日志
    this.errorLog.unshift(errorInfo);
    
    // 保持日志大小限制
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // 控制台输出
    const logLevel = this.getLogLevel(errorInfo.severity);
    console[logLevel](`[DynamicComponent ${errorInfo.type}]`, {
      message: errorInfo.message,
      userMessage: errorInfo.userMessage,
      context: errorInfo.context,
      timestamp: errorInfo.timestamp,
      originalError: errorInfo.originalError
    });

    // 生产环境中可以发送到错误监控服务
    if (process.env.NODE_ENV === 'production' && errorInfo.severity === ErrorSeverity.CRITICAL) {
      this.reportToCrashlytics(errorInfo);
    }
  }

  /**
   * 获取日志级别
   * @param severity 错误严重级别
   * @returns 控制台日志方法名
   */
  private static getLogLevel(severity: ErrorSeverity): 'log' | 'warn' | 'error' {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'log';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return 'error';
      default:
        return 'log';
    }
  }

  /**
   * 上报到崩溃分析服务（生产环境）
   * @param errorInfo 错误信息
   */
  private static reportToCrashlytics(errorInfo: ErrorInfo): void {
    // 这里可以集成第三方错误监控服务，如 Sentry、Bugsnag 等
    // 示例：Sentry.captureException(errorInfo.originalError, { extra: errorInfo.context });
    console.error('Critical error reported to crashlytics:', errorInfo);
  }

  /**
   * 获取错误日志
   * @param limit 返回数量限制
   * @returns ErrorInfo[] 错误日志数组
   */
  static getErrorLog(limit?: number): ErrorInfo[] {
    return limit ? this.errorLog.slice(0, limit) : [...this.errorLog];
  }

  /**
   * 清空错误日志
   */
  static clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * 生成重试函数
   * @param originalFunction 原始函数
   * @param maxRetries 最大重试次数
   * @param retryDelay 重试延迟（毫秒）
   * @returns 带重试机制的函数
   */
  static withRetry<T extends (...args: any[]) => Promise<any>>(
    originalFunction: T,
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): T {
    return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      let lastError: unknown;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await originalFunction(...args);
        } catch (error) {
          lastError = error;
          const errorInfo = this.handleError(error, { 
            attempt: attempt + 1, 
            maxRetries: maxRetries + 1,
            functionName: originalFunction.name 
          });

          // 如果不可重试或已达到最大重试次数，直接抛出错误
          if (!errorInfo.retryable || attempt === maxRetries) {
            throw error;
          }

          // 等待后重试
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
          }
        }
      }
      
      throw lastError;
    }) as T;
  }

  /**
   * 创建错误边界组件的错误处理函数
   * @param componentName 组件名称
   * @returns 错误处理函数
   */
  static createErrorBoundaryHandler(componentName: string) {
    return (error: Error, errorInfo: React.ErrorInfo) => {
      const errorData = this.handleError(error, {
        componentName,
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      });

      return errorData;
    };
  }
}

/**
 * 动态组件加载状态管理
 */
export class LoadingStateManager {
  private static loadingStates = new Map<string, boolean>();
  private static loadingCallbacks = new Map<string, Set<(loading: boolean) => void>>();

  /**
   * 设置加载状态
   * @param key 状态键
   * @param loading 是否加载中
   */
  static setLoading(key: string, loading: boolean): void {
    this.loadingStates.set(key, loading);
    
    // 通知所有监听器
    const callbacks = this.loadingCallbacks.get(key);
    if (callbacks) {
      callbacks.forEach(callback => callback(loading));
    }
  }

  /**
   * 获取加载状态
   * @param key 状态键
   * @returns 是否加载中
   */
  static getLoading(key: string): boolean {
    return this.loadingStates.get(key) || false;
  }

  /**
   * 订阅加载状态变化
   * @param key 状态键
   * @param callback 回调函数
   * @returns 取消订阅函数
   */
  static subscribe(key: string, callback: (loading: boolean) => void): () => void {
    if (!this.loadingCallbacks.has(key)) {
      this.loadingCallbacks.set(key, new Set());
    }
    
    this.loadingCallbacks.get(key)!.add(callback);
    
    // 立即调用一次回调，传递当前状态
    callback(this.getLoading(key));
    
    // 返回取消订阅函数
    return () => {
      const callbacks = this.loadingCallbacks.get(key);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.loadingCallbacks.delete(key);
        }
      }
    };
  }

  /**
   * 清除指定键的加载状态
   * @param key 状态键
   */
  static clear(key: string): void {
    this.loadingStates.delete(key);
    this.loadingCallbacks.delete(key);
  }

  /**
   * 清除所有加载状态
   */
  static clearAll(): void {
    this.loadingStates.clear();
    this.loadingCallbacks.clear();
  }
}

export default DynamicComponentErrorHandler;