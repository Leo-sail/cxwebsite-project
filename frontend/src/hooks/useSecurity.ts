/**
 * 安全验证相关的React Hook
 * 提供组件级别的安全验证功能
 */

import { useState, useCallback } from 'react';
import { SecurityValidator, SecurityUtils } from '../utils/security';

/**
 * 输入验证Hook
 * @param initialValue 初始值
 * @param validationType 验证类型
 * @param options 验证选项
 */
export function useInputValidation(
  initialValue: string = '',
  validationType: 'string' | 'number' | 'email' | 'url' | 'json' | 'html' = 'string',
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    allowHTML?: boolean;
    realTimeValidation?: boolean;
  } = {}
) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [hasBeenValidated, setHasBeenValidated] = useState(false);

  const { realTimeValidation = false } = options;

  /**
   * 验证当前值
   */
  const validate = useCallback(async (valueToValidate?: string): Promise<boolean> => {
    setIsValidating(true);
    const targetValue = valueToValidate !== undefined ? valueToValidate : value;
    
    try {
      const result = SecurityValidator.validateInput(targetValue, validationType, options);
      
      if (result.isValid) {
        setError(null);
        // 如果值被清理过，更新状态
        if (result.sanitized !== targetValue) {
          setValue(result.sanitized);
        }
        setHasBeenValidated(true);
        return true;
      } else {
        setError(result.error || '验证失败');
        setHasBeenValidated(true);
        return false;
      }
    } catch (err) {
      setError('验证过程中发生错误');
      setHasBeenValidated(true);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [value, validationType, options]);

  /**
   * 更新值并可选择性地进行验证
   */
  const updateValue = useCallback((newValue: string) => {
    setValue(newValue);
    
    // 如果启用了实时验证，则立即验证
    if (realTimeValidation) {
      validate(newValue);
    } else if (hasBeenValidated) {
      // 如果之前已经验证过，清除错误状态
      setError(null);
    }
  }, [realTimeValidation, hasBeenValidated, validate]);

  /**
   * 清除验证状态
   */
  const clearValidation = useCallback(() => {
    setError(null);
    setHasBeenValidated(false);
  }, []);

  /**
   * 重置到初始状态
   */
  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
    setHasBeenValidated(false);
    setIsValidating(false);
  }, [initialValue]);

  return {
    value,
    error,
    isValidating,
    hasBeenValidated,
    isValid: !error && hasBeenValidated,
    updateValue,
    validate,
    clearValidation,
    reset
  };
}

/**
 * 文件上传安全验证Hook
 * @param options 文件验证选项
 */
export function useFileUploadSecurity(options: {
  allowedTypes?: string[];
  maxSize?: number;
  allowedExtensions?: string[];
  onValidationError?: (error: string) => void;
} = {}) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  /**
   * 验证文件
   */
  const validateFile = useCallback(async (file: File, fileId?: string): Promise<boolean> => {
    setIsValidating(true);
    const id = fileId || file.name;
    
    try {
      const result = SecurityValidator.validateFileUpload(file, options);
      
      if (result.isValid) {
        // 移除该文件的错误信息
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[id];
          return newErrors;
        });
        return true;
      } else {
        // 添加错误信息
        setValidationErrors(prev => ({
          ...prev,
          [id]: result.error || '文件验证失败'
        }));
        
        // 调用错误回调
        if (options.onValidationError) {
          options.onValidationError(result.error || '文件验证失败');
        }
        
        return false;
      }
    } catch (err) {
      const errorMsg = '文件验证过程中发生错误';
      setValidationErrors(prev => ({
        ...prev,
        [id]: errorMsg
      }));
      
      if (options.onValidationError) {
        options.onValidationError(errorMsg);
      }
      
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [options]);

  /**
   * 验证多个文件
   */
  const validateFiles = useCallback(async (files: File[]): Promise<boolean> => {
    const results = await Promise.all(
      files.map(file => validateFile(file))
    );
    return results.every(result => result);
  }, [validateFile]);

  /**
   * 清除特定文件的验证错误
   */
  const clearFileError = useCallback((fileId: string) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fileId];
      return newErrors;
    });
  }, []);

  /**
   * 清除所有验证错误
   */
  const clearAllErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  return {
    validationErrors,
    isValidating,
    hasErrors: Object.keys(validationErrors).length > 0,
    validateFile,
    validateFiles,
    clearFileError,
    clearAllErrors
  };
}

/**
 * XSS防护Hook
 * 用于安全地渲染用户输入的内容
 */
export function useXSSProtection() {
  /**
   * 安全地清理HTML内容
   */
  const sanitizeHTML = useCallback((html: string): string => {
    return SecurityValidator.sanitizeHTML(html);
  }, []);

  /**
   * 清理XSS攻击代码
   */
  const sanitizeXSS = useCallback((input: string): string => {
    return SecurityValidator.sanitizeXSS(input);
  }, []);

  /**
   * 转义HTML特殊字符
   */
  const escapeHTML = useCallback((str: string): string => {
    return SecurityUtils.escapeHTML(str);
  }, []);

  /**
   * 创建安全的innerHTML属性
   */
  const createSafeHTML = useCallback((html: string) => {
    return {
      __html: sanitizeHTML(html)
    };
  }, [sanitizeHTML]);

  return {
    sanitizeHTML,
    sanitizeXSS,
    escapeHTML,
    createSafeHTML
  };
}

/**
 * 内容安全策略Hook
 * 用于动态设置CSP头
 */
export function useCSP() {
  /**
   * 生成CSP头
   */
  const generateCSPHeader = useCallback((options: {
    allowInlineStyles?: boolean;
    allowInlineScripts?: boolean;
    allowedDomains?: string[];
    allowDataImages?: boolean;
  } = {}) => {
    return SecurityValidator.generateCSPHeader(options);
  }, []);

  /**
   * 设置CSP meta标签
   */
  const setCSPMeta = useCallback((cspHeader: string) => {
    // 移除现有的CSP meta标签
    const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existingMeta) {
      existingMeta.remove();
    }

    // 创建新的CSP meta标签
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = cspHeader;
    document.head.appendChild(meta);
  }, []);

  return {
    generateCSPHeader,
    setCSPMeta
  };
}

/**
 * 安全令牌Hook
 * 用于生成和管理安全令牌
 */
export function useSecurityToken() {
  const [token, setToken] = useState<string | null>(null);

  /**
   * 生成新令牌
   */
  const generateToken = useCallback((length: number = 32) => {
    const newToken = SecurityUtils.generateToken(length);
    setToken(newToken);
    return newToken;
  }, []);

  /**
   * 清除令牌
   */
  const clearToken = useCallback(() => {
    setToken(null);
  }, []);

  /**
   * 验证令牌
   */
  const validateToken = useCallback((tokenToValidate: string): boolean => {
    return token === tokenToValidate;
  }, [token]);

  return {
    token,
    generateToken,
    clearToken,
    validateToken,
    hasToken: !!token
  };
}

/**
 * SQL注入检测Hook
 */
export function useSQLInjectionDetection() {
  const [detectedThreats, setDetectedThreats] = useState<string[]>([]);

  /**
   * 检测SQL注入
   */
  const detectSQLInjection = useCallback((input: string): boolean => {
    const hasThreat = SecurityValidator.detectSQLInjection(input);
    
    if (hasThreat) {
      setDetectedThreats(prev => [...prev, input]);
    }
    
    return hasThreat;
  }, []);

  /**
   * 清除威胁记录
   */
  const clearThreats = useCallback(() => {
    setDetectedThreats([]);
  }, []);

  return {
    detectedThreats,
    detectSQLInjection,
    clearThreats,
    threatCount: detectedThreats.length
  };
}

export default {
  useInputValidation,
  useFileUploadSecurity,
  useXSSProtection,
  useCSP,
  useSecurityToken,
  useSQLInjectionDetection
};