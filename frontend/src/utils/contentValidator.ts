/**
 * 内容验证器
 * 提供内容安全验证、格式验证和清理功能
 */

/**
 * 验证结果接口
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  cleanedContent?: string;
}

/**
 * 验证规则配置
 */
export interface ValidationConfig {
  maxLength?: number;
  minLength?: number;
  allowedTags?: string[];
  allowedAttributes?: string[];
  stripDangerousContent?: boolean;
  validateLinks?: boolean;
}

/**
 * 内容验证器类
 */
export class ContentValidator {
  /**
   * 默认验证配置
   */
  private static readonly DEFAULT_CONFIG: ValidationConfig = {
    maxLength: 100000,
    minLength: 0,
    allowedTags: [
      'p', 'br', 'strong', 'em', 'u', 's',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'a', 'span', 'div'
    ],
    allowedAttributes: [
      'href', 'title', 'target', 'rel',
      'class', 'style'
    ],
    stripDangerousContent: true,
    validateLinks: true
  };

  /**
   * 危险的HTML模式
   */
  private static readonly DANGEROUS_PATTERNS = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>/gi,
    /<form[^>]*>.*?<\/form>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /on\w+\s*=/gi,
    /<meta[^>]*>/gi,
    /<link[^>]*>/gi,
    /<style[^>]*>.*?<\/style>/gi
  ];

  /**
   * 验证HTML内容
   * @param content HTML内容
   * @param config 验证配置
   * @returns 验证结果
   */
  static validateHtmlContent(
    content: string, 
    config: Partial<ValidationConfig> = {}
  ): ValidationResult {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const errors: string[] = [];
    const warnings: string[] = [];
    let cleanedContent = content;

    // 基础验证
    if (!content || typeof content !== 'string') {
      errors.push('内容必须是有效的字符串');
      return { isValid: false, errors, warnings };
    }

    // 长度验证
    if (finalConfig.maxLength && content.length > finalConfig.maxLength) {
      errors.push(`内容长度不能超过${finalConfig.maxLength}字符`);
    }

    if (finalConfig.minLength && content.length < finalConfig.minLength) {
      errors.push(`内容长度不能少于${finalConfig.minLength}字符`);
    }

    // 安全性验证
    if (finalConfig.stripDangerousContent) {
      const securityResult = this.checkSecurity(content);
      if (!securityResult.isSecure) {
        if (finalConfig.stripDangerousContent) {
          cleanedContent = securityResult.cleanedContent;
          warnings.push('已移除潜在的危险内容');
        } else {
          errors.push('内容包含潜在的安全风险');
        }
      }
    }

    // 标签验证
    if (finalConfig.allowedTags) {
      const tagResult = this.validateTags(cleanedContent, finalConfig.allowedTags);
      if (!tagResult.isValid) {
        warnings.push('包含不允许的HTML标签，已自动清理');
        cleanedContent = tagResult.cleanedContent;
      }
    }

    // 属性验证
    if (finalConfig.allowedAttributes) {
      const attrResult = this.validateAttributes(cleanedContent, finalConfig.allowedAttributes);
      if (!attrResult.isValid) {
        warnings.push('包含不允许的HTML属性，已自动清理');
        cleanedContent = attrResult.cleanedContent;
      }
    }

    // 链接验证
    if (finalConfig.validateLinks) {
      const linkResult = this.validateLinks(cleanedContent);
      if (!linkResult.isValid) {
        warnings.push(...linkResult.warnings);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      cleanedContent: cleanedContent !== content ? cleanedContent : undefined
    };
  }

  /**
   * 验证Markdown内容
   * @param content Markdown内容
   * @param config 验证配置
   * @returns 验证结果
   */
  static validateMarkdownContent(
    content: string,
    config: Partial<ValidationConfig> = {}
  ): ValidationResult {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const errors: string[] = [];
    const warnings: string[] = [];
    let cleanedContent = content;

    // 基础验证
    if (!content || typeof content !== 'string') {
      errors.push('内容必须是有效的字符串');
      return { isValid: false, errors, warnings };
    }

    // 长度验证
    if (finalConfig.maxLength && content.length > finalConfig.maxLength) {
      errors.push(`内容长度不能超过${finalConfig.maxLength}字符`);
    }

    if (finalConfig.minLength && content.length < finalConfig.minLength) {
      errors.push(`内容长度不能少于${finalConfig.minLength}字符`);
    }

    // 检查嵌入的HTML
    const htmlTagRegex = /<[^>]+>/g;
    const htmlMatches = content.match(htmlTagRegex);
    if (htmlMatches && htmlMatches.length > 0) {
      if (finalConfig.stripDangerousContent) {
        // 验证嵌入的HTML
        const htmlValidation = this.validateHtmlContent(content, config);
        if (htmlValidation.cleanedContent) {
          cleanedContent = htmlValidation.cleanedContent;
          warnings.push('已清理Markdown中的危险HTML内容');
        }
        warnings.push(...htmlValidation.warnings);
      } else {
        warnings.push('Markdown内容包含HTML标签');
      }
    }

    // 验证Markdown语法
    const syntaxResult = this.validateMarkdownSyntax(cleanedContent);
    if (!syntaxResult.isValid) {
      warnings.push(...syntaxResult.warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      cleanedContent: cleanedContent !== content ? cleanedContent : undefined
    };
  }

  /**
   * 安全性检查
   * @param content 内容
   * @returns 安全检查结果
   */
  private static checkSecurity(content: string): {
    isSecure: boolean;
    cleanedContent: string;
    threats: string[];
  } {
    const threats: string[] = [];
    let cleanedContent = content;

    // 检查并移除危险模式
    this.DANGEROUS_PATTERNS.forEach((pattern, index) => {
      if (pattern.test(content)) {
        threats.push(`检测到危险模式 ${index + 1}`);
        cleanedContent = cleanedContent.replace(pattern, '');
      }
    });

    return {
      isSecure: threats.length === 0,
      cleanedContent,
      threats
    };
  }

  /**
   * 验证HTML标签
   * @param content 内容
   * @param allowedTags 允许的标签
   * @returns 验证结果
   */
  private static validateTags(content: string, allowedTags: string[]): {
    isValid: boolean;
    cleanedContent: string;
  } {
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
    let isValid = true;
    let cleanedContent = content;

    const matches = content.matchAll(tagRegex);
    for (const match of matches) {
      const tagName = match[1].toLowerCase();
      if (!allowedTags.includes(tagName)) {
        isValid = false;
        cleanedContent = cleanedContent.replace(match[0], '');
      }
    }

    return { isValid, cleanedContent };
  }

  /**
   * 验证HTML属性
   * @param content 内容
   * @param allowedAttributes 允许的属性
   * @returns 验证结果
   */
  private static validateAttributes(content: string, allowedAttributes: string[]): {
    isValid: boolean;
    cleanedContent: string;
  } {
    const attrRegex = /<([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g;
    let isValid = true;
    let cleanedContent = content;

    cleanedContent = cleanedContent.replace(attrRegex, (match, tagName, attributes) => {
      if (!attributes.trim()) return match;

      const attrPairs = attributes.match(/\s+([a-zA-Z-]+)\s*=\s*["'][^"']*["']/g) || [];
      const cleanedAttrs = attrPairs.filter((attr: string) => {
        const attrName = attr.match(/\s+([a-zA-Z-]+)/)?.[1]?.toLowerCase();
        const isAllowed = attrName && allowedAttributes.includes(attrName);
        if (!isAllowed) isValid = false;
        return isAllowed;
      });

      return `<${tagName}${cleanedAttrs.join('')}>`;
    });

    return { isValid, cleanedContent };
  }

  /**
   * 验证链接
   * @param content 内容
   * @returns 验证结果
   */
  private static validateLinks(content: string): {
    isValid: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];
    const linkRegex = /<a[^>]+href\s*=\s*["']([^"']+)["'][^>]*>/gi;
    const markdownLinkRegex = /\[([^\]]+)\]\(([^\)]+)\)/g;

    // 验证HTML链接
    const htmlMatches = content.matchAll(linkRegex);
    for (const match of htmlMatches) {
      const url = match[1];
      if (!this.isValidUrl(url)) {
        warnings.push(`无效的链接: ${url}`);
      }
    }

    // 验证Markdown链接
    const markdownMatches = content.matchAll(markdownLinkRegex);
    for (const match of markdownMatches) {
      const url = match[2];
      if (!this.isValidUrl(url)) {
        warnings.push(`无效的Markdown链接: ${url}`);
      }
    }

    return {
      isValid: warnings.length === 0,
      warnings
    };
  }

  /**
   * 验证Markdown语法
   * @param content Markdown内容
   * @returns 验证结果
   */
  private static validateMarkdownSyntax(content: string): {
    isValid: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];

    // 检查未闭合的代码块
    const codeBlockMatches = content.match(/```/g);
    if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
      warnings.push('检测到未闭合的代码块');
    }

    // 检查链接格式
    const malformedLinks = content.match(/\[[^\]]*\]\([^\)]*$/gm);
    if (malformedLinks) {
      warnings.push('检测到格式错误的链接');
    }

    return {
      isValid: warnings.length === 0,
      warnings
    };
  }

  /**
   * 验证URL格式
   * @param url URL字符串
   * @returns 是否有效
   */
  private static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:', 'mailto:'].includes(urlObj.protocol);
    } catch {
      // 相对路径也认为是有效的
      return /^[.\/]/.test(url) || /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*$/.test(url);
    }
  }

  /**
   * 清理内容
   * @param content 原始内容
   * @param contentType 内容类型
   * @param config 验证配置
   * @returns 清理后的内容
   */
  static sanitizeContent(
    content: string,
    contentType: 'html' | 'markdown' | 'text',
    config: Partial<ValidationConfig> = {}
  ): string {
    if (!content) return '';

    switch (contentType) {
      case 'html':
        const htmlResult = this.validateHtmlContent(content, config);
        return htmlResult.cleanedContent || content;
      case 'markdown':
        const markdownResult = this.validateMarkdownContent(content, config);
        return markdownResult.cleanedContent || content;
      default:
        // 纯文本只需要基础清理
        return content.replace(/[<>"'&]/g, (char) => {
          const entities: Record<string, string> = {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '&': '&amp;'
          };
          return entities[char] || char;
        });
    }
  }
}

/**
 * 导出便捷函数
 */
export const {
  validateHtmlContent,
  validateMarkdownContent,
  sanitizeContent
} = ContentValidator;