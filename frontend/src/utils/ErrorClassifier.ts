/**
 * ErrorClassifier - 智能错误分类器
 * 专门处理AbortError和其他类型的错误分类
 */

export interface ErrorClassification {
  type: 'abort' | 'network' | 'api' | 'timeout' | 'unknown';
  isExpected: boolean;
  shouldRetry: boolean;
  shouldLog: boolean;
  userMessage?: string;
  severity: 'low' | 'medium' | 'high';
}

export interface IErrorClassifier {
  classify(error: Error | any): ErrorClassification;
  isAbortError(error: Error | any): boolean;
  isNetworkError(error: Error | any): boolean;
  isTimeoutError(error: Error | any): boolean;
}

/**
 * 智能错误分类器实现
 * 主要功能：
 * 1. 识别和分类不同类型的错误
 * 2. 特别处理AbortError，避免不必要的错误报告
 * 3. 提供用户友好的错误消息
 * 4. 决定是否需要重试和日志记录
 */
export class ErrorClassifier implements IErrorClassifier {
  
  /**
   * 分类错误
   * @param error 错误对象
   * @returns 错误分类结果
   */
  classify(error: Error | any): ErrorClassification {
    // 处理AbortError - 这是预期的行为，不应该作为错误处理
    if (this.isAbortError(error)) {
      return {
        type: 'abort',
        isExpected: true,
        shouldRetry: false,
        shouldLog: false,
        severity: 'low',
        userMessage: undefined // 不显示给用户
      };
    }

    // 处理超时错误
    if (this.isTimeoutError(error)) {
      return {
        type: 'timeout',
        isExpected: false,
        shouldRetry: true,
        shouldLog: true,
        severity: 'medium',
        userMessage: '请求超时，请检查网络连接后重试'
      };
    }

    // 处理网络错误
    if (this.isNetworkError(error)) {
      return {
        type: 'network',
        isExpected: false,
        shouldRetry: true,
        shouldLog: true,
        severity: 'medium',
        userMessage: '网络连接异常，请检查网络设置后重试'
      };
    }

    // 处理API错误
    if (this.isApiError(error)) {
      return {
        type: 'api',
        isExpected: false,
        shouldRetry: false,
        shouldLog: true,
        severity: 'high',
        userMessage: '服务暂时不可用，请稍后重试'
      };
    }

    // 未知错误
    return {
      type: 'unknown',
      isExpected: false,
      shouldRetry: false,
      shouldLog: true,
      severity: 'high',
      userMessage: '发生未知错误，请稍后重试'
    };
  }

  /**
   * 检查是否为AbortError
   * @param error 错误对象
   * @returns 是否为AbortError
   */
  isAbortError(error: Error | any): boolean {
    if (!error) return false;

    // 检查错误名称
    if (error.name === 'AbortError') {
      return true;
    }

    // 检查错误消息
    const message = error.message || '';
    const abortMessages = [
      'signal is aborted without reason',
      'Request cancelled',
      'The operation was aborted',
      'AbortError',
      'Request aborted',
      'signal aborted'
    ];

    return abortMessages.some(msg => 
      message.toLowerCase().includes(msg.toLowerCase())
    );
  }

  /**
   * 检查是否为网络错误
   * @param error 错误对象
   * @returns 是否为网络错误
   */
  isNetworkError(error: Error | any): boolean {
    if (!error) return false;

    const message = error.message || '';
    const networkMessages = [
      'network error',
      'fetch failed',
      'connection refused',
      'connection timeout',
      'dns lookup failed',
      'no internet connection',
      'ERR_NETWORK',
      'ERR_INTERNET_DISCONNECTED'
    ];

    return networkMessages.some(msg => 
      message.toLowerCase().includes(msg.toLowerCase())
    ) || error.code === 'NETWORK_ERROR';
  }

  /**
   * 检查是否为超时错误
   * @param error 错误对象
   * @returns 是否为超时错误
   */
  isTimeoutError(error: Error | any): boolean {
    if (!error) return false;

    const message = error.message || '';
    const timeoutMessages = [
      'timeout',
      'request timeout',
      'connection timeout',
      'ERR_TIMEOUT'
    ];

    return timeoutMessages.some(msg => 
      message.toLowerCase().includes(msg.toLowerCase())
    ) || error.code === 'TIMEOUT';
  }

  /**
   * 检查是否为API错误
   * @param error 错误对象
   * @returns 是否为API错误
   */
  private isApiError(error: Error | any): boolean {
    if (!error) return false;

    // 检查HTTP状态码
    if (error.status && error.status >= 400) {
      return true;
    }

    // 检查Supabase特定错误
    if (error.code && typeof error.code === 'string') {
      return true;
    }

    const message = error.message || '';
    const apiMessages = [
      'api error',
      'server error',
      'internal server error',
      'bad request',
      'unauthorized',
      'forbidden',
      'not found',
      'service unavailable'
    ];

    return apiMessages.some(msg => 
      message.toLowerCase().includes(msg.toLowerCase())
    );
  }

  /**
   * 获取错误的简短描述
   * @param error 错误对象
   * @returns 错误描述
   */
  getErrorDescription(error: Error | any): string {
    const classification = this.classify(error);
    
    if (classification.userMessage) {
      return classification.userMessage;
    }

    // 如果是AbortError，返回空字符串（不显示）
    if (classification.type === 'abort') {
      return '';
    }

    // 返回原始错误消息的清理版本
    const message = error?.message || '未知错误';
    return message.length > 100 ? message.substring(0, 100) + '...' : message;
  }

  /**
   * 检查错误是否应该被忽略
   * @param error 错误对象
   * @returns 是否应该忽略
   */
  shouldIgnoreError(error: Error | any): boolean {
    const classification = this.classify(error);
    return classification.type === 'abort' && classification.isExpected;
  }
}

/**
 * 创建ErrorClassifier实例的工厂函数
 * @returns ErrorClassifier实例
 */
export function createErrorClassifier(): ErrorClassifier {
  return new ErrorClassifier();
}

/**
 * 默认导出ErrorClassifier类
 */
export default ErrorClassifier;

/**
 * 全局错误分类器实例
 */
export const globalErrorClassifier = new ErrorClassifier();