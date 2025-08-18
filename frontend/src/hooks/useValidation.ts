/**
 * 验证相关的React Hooks
 * 提供表单验证、实时验证等功能
 */

import { useState, useCallback, useMemo } from 'react';
import { ValidationMiddleware, CommonValidationRules } from '../middleware/validation';
import type { ValidationResult, FieldValidationConfig } from '../middleware/validation';

/**
 * 表单验证Hook
 * @param config 验证配置
 * @returns 验证相关的状态和方法
 */
export function useFormValidation(config: FieldValidationConfig) {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [warnings, setWarnings] = useState<Record<string, string[]>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(true);

  // 创建验证器
  const validator = useMemo(() => {
    return ValidationMiddleware.createFormValidator(config);
  }, [config]);

  /**
   * 验证单个字段
   * @param fieldName 字段名
   * @param value 字段值
   * @returns 验证结果
   */
  const validateField = useCallback((fieldName: string, value: any): ValidationResult => {
    const rule = config[fieldName];
    if (!rule) {
      return { isValid: true, errors: [] };
    }

    const result = ValidationMiddleware.validateField(value, rule, fieldName);
    
    // 更新字段错误状态
    setErrors(prev => ({
      ...prev,
      [fieldName]: result.errors
    }));

    // 更新字段警告状态
    setWarnings(prev => ({
      ...prev,
      [fieldName]: result.warnings || []
    }));

    return result;
  }, [config]);

  /**
   * 验证整个表单
   * @param data 表单数据
   * @returns 验证结果
   */
  const validateForm = useCallback((data: Record<string, any>): ValidationResult => {
    setIsValidating(true);
    
    const result = validator(data);
    
    // 解析字段级错误
    const fieldErrors: Record<string, string[]> = {};
    const fieldWarnings: Record<string, string[]> = {};
    
    // 为每个字段单独验证以获取详细错误信息
    Object.keys(config).forEach(fieldName => {
      const fieldResult = ValidationMiddleware.validateField(data[fieldName], config[fieldName], fieldName);
      fieldErrors[fieldName] = fieldResult.errors;
      fieldWarnings[fieldName] = fieldResult.warnings || [];
    });
    
    setErrors(fieldErrors);
    setWarnings(fieldWarnings);
    setIsValid(result.isValid);
    setIsValidating(false);
    
    return result;
  }, [validator, config]);

  /**
   * 清除字段错误
   * @param fieldName 字段名，不传则清除所有错误
   */
  const clearErrors = useCallback((fieldName?: string) => {
    if (fieldName) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: []
      }));
    } else {
      setErrors({});
    }
  }, []);

  /**
   * 清除字段警告
   * @param fieldName 字段名，不传则清除所有警告
   */
  const clearWarnings = useCallback((fieldName?: string) => {
    if (fieldName) {
      setWarnings(prev => ({
        ...prev,
        [fieldName]: []
      }));
    } else {
      setWarnings({});
    }
  }, []);

  /**
   * 获取字段错误
   * @param fieldName 字段名
   * @returns 错误数组
   */
  const getFieldErrors = useCallback((fieldName: string): string[] => {
    return errors[fieldName] || [];
  }, [errors]);

  /**
   * 获取字段警告
   * @param fieldName 字段名
   * @returns 警告数组
   */
  const getFieldWarnings = useCallback((fieldName: string): string[] => {
    return warnings[fieldName] || [];
  }, [warnings]);

  /**
   * 检查字段是否有错误
   * @param fieldName 字段名
   * @returns 是否有错误
   */
  const hasFieldError = useCallback((fieldName: string): boolean => {
    return (errors[fieldName] || []).length > 0;
  }, [errors]);

  /**
   * 检查字段是否有警告
   * @param fieldName 字段名
   * @returns 是否有警告
   */
  const hasFieldWarning = useCallback((fieldName: string): boolean => {
    return (warnings[fieldName] || []).length > 0;
  }, [warnings]);

  return {
    // 状态
    errors,
    warnings,
    isValidating,
    isValid,
    
    // 方法
    validateField,
    validateForm,
    clearErrors,
    clearWarnings,
    getFieldErrors,
    getFieldWarnings,
    hasFieldError,
    hasFieldWarning
  };
}

/**
 * 实时验证Hook
 * @param config 验证配置
 * @param debounceMs 防抖延迟时间（毫秒）
 * @returns 实时验证相关的状态和方法
 */
export function useRealtimeValidation(config: FieldValidationConfig, debounceMs: number = 300) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [debounceTimers, setDebounceTimers] = useState<Record<string, NodeJS.Timeout>>({});
  
  const formValidation = useFormValidation(config);

  /**
   * 更新字段值并触发验证
   * @param fieldName 字段名
   * @param value 字段值
   */
  const updateField = useCallback((fieldName: string, value: any) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    
    // 清除之前的定时器
    if (debounceTimers[fieldName]) {
      clearTimeout(debounceTimers[fieldName]);
    }
    
    // 设置新的防抖定时器
    const timer = setTimeout(() => {
      if (touchedFields.has(fieldName)) {
        formValidation.validateField(fieldName, value);
      }
    }, debounceMs);
    
    setDebounceTimers(prev => ({ ...prev, [fieldName]: timer }));
  }, [debounceTimers, touchedFields, formValidation, debounceMs]);

  /**
   * 标记字段为已触摸
   * @param fieldName 字段名
   */
  const touchField = useCallback((fieldName: string) => {
    setTouchedFields(prev => new Set([...prev, fieldName]));
    
    // 立即验证已触摸的字段
    if (values[fieldName] !== undefined) {
      formValidation.validateField(fieldName, values[fieldName]);
    }
  }, [values, formValidation]);

  /**
   * 获取字段值
   * @param fieldName 字段名
   * @returns 字段值
   */
  const getFieldValue = useCallback((fieldName: string) => {
    return values[fieldName];
  }, [values]);

  /**
   * 检查字段是否已触摸
   * @param fieldName 字段名
   * @returns 是否已触摸
   */
  const isFieldTouched = useCallback((fieldName: string): boolean => {
    return touchedFields.has(fieldName);
  }, [touchedFields]);

  /**
   * 重置表单
   */
  const resetForm = useCallback(() => {
    setValues({});
    setTouchedFields(new Set());
    formValidation.clearErrors();
    formValidation.clearWarnings();
    
    // 清除所有定时器
    Object.values(debounceTimers).forEach(timer => clearTimeout(timer));
    setDebounceTimers({});
  }, [formValidation, debounceTimers]);

  /**
   * 提交表单
   * @returns 验证结果和清理后的数据
   */
  const submitForm = useCallback(() => {
    // 标记所有字段为已触摸
    const allFields = Object.keys(config);
    setTouchedFields(new Set(allFields));
    
    // 验证整个表单
    const result = formValidation.validateForm(values);
    
    return {
      ...result,
      values: result.sanitizedValue || values
    };
  }, [config, formValidation, values]);

  return {
    // 继承表单验证的所有功能
    ...formValidation,
    
    // 实时验证特有的状态和方法
    values,
    touchedFields,
    updateField,
    touchField,
    getFieldValue,
    isFieldTouched,
    resetForm,
    submitForm
  };
}

/**
 * 文件上传验证Hook
 * @param allowedTypes 允许的文件类型
 * @param maxSize 最大文件大小（字节）
 * @param maxFiles 最大文件数量
 * @returns 文件验证相关的状态和方法
 */
export function useFileValidation(
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif'],
  maxSize: number = 5 * 1024 * 1024, // 5MB
  maxFiles: number = 10
) {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  /**
   * 验证文件
   * @param files 文件列表
   * @returns 验证结果
   */
  const validateFiles = useCallback((files: FileList | File[]): ValidationResult => {
    setIsValidating(true);
    const errors: string[] = [];
    const fileArray = Array.from(files);

    // 检查文件数量
    if (fileArray.length > maxFiles) {
      errors.push(`最多只能上传 ${maxFiles} 个文件`);
    }

    // 验证每个文件
    fileArray.forEach((file, _index) => {
      // 检查文件类型
      if (!allowedTypes.includes(file.type)) {
        errors.push(`文件 ${file.name} 的类型不被支持`);
      }

      // 检查文件大小
      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        errors.push(`文件 ${file.name} 大小超过 ${maxSizeMB}MB 限制`);
      }

      // 检查文件名
      if (file.name.length > 255) {
        errors.push(`文件 ${file.name} 名称过长`);
      }
    });

    setValidationErrors(errors);
    setIsValidating(false);

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: fileArray
    };
  }, [allowedTypes, maxSize, maxFiles]);

  /**
   * 清除验证错误
   */
  const clearValidationErrors = useCallback(() => {
    setValidationErrors([]);
  }, []);

  return {
    validationErrors,
    isValidating,
    validateFiles,
    clearValidationErrors
  };
}

// 导出常用的验证配置
export { CommonValidationRules };
export default useFormValidation;