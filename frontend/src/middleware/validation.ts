/**
 * 输入数据验证中间件
 * 提供统一的数据验证和过滤机制
 */

import { SecurityValidator } from '../utils/security';

// 验证规则接口
export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'url' | 'html' | 'json';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  sanitize?: boolean;
}

// 验证结果接口
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: any;
  warnings?: string[];
}

// 字段验证配置
export interface FieldValidationConfig {
  [fieldName: string]: ValidationRule;
}

/**
 * 数据验证中间件类
 */
export class ValidationMiddleware {
  // private static securityValidator = new SecurityValidator(); // 暂时注释掉未使用的变量

  /**
   * 验证单个字段
   * @param value 字段值
   * @param rule 验证规则
   * @param fieldName 字段名称
   * @returns 验证结果
   */
  static validateField(value: any, rule: ValidationRule, fieldName: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // 必填验证
    if (rule.required && (value === undefined || value === null || value === '')) {
      result.isValid = false;
      result.errors.push(`${fieldName} 是必填字段`);
      return result;
    }

    // 如果值为空且非必填，直接返回有效
    if (!rule.required && (value === undefined || value === null || value === '')) {
      result.sanitizedValue = value;
      return result;
    }

    // 类型验证
    if (rule.type) {
      const typeValidation = this.validateType(value, rule.type, fieldName);
      if (!typeValidation.isValid) {
        result.isValid = false;
        result.errors.push(...typeValidation.errors);
      }
      if (typeValidation.warnings) {
        result.warnings?.push(...typeValidation.warnings);
      }
    }

    // 长度验证（字符串）
    if (typeof value === 'string') {
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        result.isValid = false;
        result.errors.push(`${fieldName} 长度不能少于 ${rule.minLength} 个字符`);
      }
      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        result.isValid = false;
        result.errors.push(`${fieldName} 长度不能超过 ${rule.maxLength} 个字符`);
      }
    }

    // 数值范围验证
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        result.isValid = false;
        result.errors.push(`${fieldName} 不能小于 ${rule.min}`);
      }
      if (rule.max !== undefined && value > rule.max) {
        result.isValid = false;
        result.errors.push(`${fieldName} 不能大于 ${rule.max}`);
      }
    }

    // 正则表达式验证
    if (rule.pattern && typeof value === 'string') {
      if (!rule.pattern.test(value)) {
        result.isValid = false;
        result.errors.push(`${fieldName} 格式不正确`);
      }
    }

    // 自定义验证
    if (rule.custom) {
      const customResult = rule.custom(value);
      if (typeof customResult === 'string') {
        result.isValid = false;
        result.errors.push(customResult);
      } else if (!customResult) {
        result.isValid = false;
        result.errors.push(`${fieldName} 验证失败`);
      }
    }

    // 数据清理
    if (rule.sanitize && typeof value === 'string') {
      if (rule.type === 'html') {
        result.sanitizedValue = SecurityValidator.sanitizeHTML(value);
      } else {
        result.sanitizedValue = SecurityValidator.sanitizeXSS(value);
      }
    } else {
      result.sanitizedValue = value;
    }

    // SQL注入检测
    if (typeof value === 'string') {
      const hasSQLInjection = SecurityValidator.detectSQLInjection(value);
      if (hasSQLInjection) {
        result.isValid = false;
        result.errors.push('检测到潜在的SQL注入攻击');
      }
    }

    return result;
  }

  /**
   * 验证数据类型
   * @param value 值
   * @param type 期望类型
   * @param fieldName 字段名称
   * @returns 验证结果
   */
  private static validateType(value: any, type: string, fieldName: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          result.isValid = false;
          result.errors.push(`${fieldName} 必须是字符串类型`);
        }
        break;

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          result.isValid = false;
          result.errors.push(`${fieldName} 必须是有效的数字`);
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof value !== 'string' || !emailRegex.test(value)) {
          result.isValid = false;
          result.errors.push(`${fieldName} 必须是有效的邮箱地址`);
        }
        break;

      case 'url':
        try {
          new URL(value);
        } catch {
          result.isValid = false;
          result.errors.push(`${fieldName} 必须是有效的URL`);
        }
        break;

      case 'html':
        if (typeof value !== 'string') {
          result.isValid = false;
          result.errors.push(`${fieldName} 必须是字符串类型`);
        } else {
          // 检查HTML内容的安全性
          const htmlValidation = SecurityValidator.validateInput(value, 'html');
          if (!htmlValidation.isValid) {
            result.warnings?.push(`${fieldName} 包含潜在的安全风险`);
          }
        }
        break;

      case 'json':
        if (typeof value === 'string') {
          try {
            JSON.parse(value);
          } catch {
            result.isValid = false;
            result.errors.push(`${fieldName} 必须是有效的JSON格式`);
          }
        } else if (typeof value !== 'object') {
          result.isValid = false;
          result.errors.push(`${fieldName} 必须是有效的JSON对象`);
        }
        break;

      default:
        result.warnings?.push(`未知的验证类型: ${type}`);
    }

    return result;
  }

  /**
   * 验证对象数据
   * @param data 要验证的数据对象
   * @param config 验证配置
   * @returns 验证结果
   */
  static validateObject(data: Record<string, any>, config: FieldValidationConfig): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedValue: {}
    };

    // 验证配置中的每个字段
    for (const [fieldName, rule] of Object.entries(config)) {
      const fieldValue = data[fieldName];
      const fieldResult = this.validateField(fieldValue, rule, fieldName);

      if (!fieldResult.isValid) {
        result.isValid = false;
        result.errors.push(...fieldResult.errors);
      }

      if (fieldResult.warnings) {
        result.warnings?.push(...fieldResult.warnings);
      }

      // 保存清理后的值
      if (fieldResult.sanitizedValue !== undefined) {
        result.sanitizedValue[fieldName] = fieldResult.sanitizedValue;
      }
    }

    // 检查是否有未配置的字段
    for (const fieldName of Object.keys(data)) {
      if (!config[fieldName]) {
        result.warnings?.push(`字段 ${fieldName} 未配置验证规则`);
        result.sanitizedValue[fieldName] = data[fieldName];
      }
    }

    return result;
  }

  /**
   * 创建Express中间件
   * @param config 验证配置
   * @returns Express中间件函数
   */
  static createExpressMiddleware(config: FieldValidationConfig) {
    return (req: any, res: any, next: any) => {
      const validationResult = this.validateObject(req.body, config);

      if (!validationResult.isValid) {
        return res.status(400).json({
          success: false,
          message: '数据验证失败',
          errors: validationResult.errors,
          warnings: validationResult.warnings
        });
      }

      // 将清理后的数据替换原始数据
      req.body = validationResult.sanitizedValue;
      req.validationWarnings = validationResult.warnings;

      next();
    };
  }

  /**
   * 创建React Hook表单验证器
   * @param config 验证配置
   * @returns 验证函数
   */
  static createFormValidator(config: FieldValidationConfig) {
    return (data: Record<string, any>) => {
      return this.validateObject(data, config);
    };
  }
}

// 预定义的验证规则
export const CommonValidationRules = {
  // 用户名验证
  username: {
    required: true,
    type: 'string' as const,
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    sanitize: true
  },

  // 邮箱验证
  email: {
    required: true,
    type: 'email' as const,
    maxLength: 100,
    sanitize: true
  },

  // 密码验证
  password: {
    required: true,
    type: 'string' as const,
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  },

  // 标题验证
  title: {
    required: true,
    type: 'string' as const,
    minLength: 1,
    maxLength: 200,
    sanitize: true
  },

  // 内容验证
  content: {
    type: 'string' as const,
    maxLength: 10000,
    sanitize: true
  },

  // HTML内容验证
  htmlContent: {
    type: 'html' as const,
    maxLength: 50000,
    sanitize: true
  },

  // URL验证
  url: {
    type: 'url' as const,
    maxLength: 500,
    sanitize: true
  },

  // 数字验证
  positiveNumber: {
    type: 'number' as const,
    min: 0
  },

  // ID验证
  id: {
    required: true,
    type: 'string' as const,
    pattern: /^[a-zA-Z0-9-_]+$/,
    minLength: 1,
    maxLength: 50
  }
};

export default ValidationMiddleware;