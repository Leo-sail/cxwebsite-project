/**
 * 安全验证工具类
 * 提供XSS防护、HTML内容过滤、输入验证等安全功能
 */

// 危险的HTML标签列表（已移除，因为代码中使用白名单机制）
// const DANGEROUS_TAGS = [
//   'script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea',
//   'button', 'select', 'option', 'link', 'meta', 'style', 'base',
//   'applet', 'body', 'html', 'head', 'title'
// ];

// 危险的HTML属性列表（已移除，因为代码中使用白名单机制）
// const DANGEROUS_ATTRIBUTES = [
//   'onload', 'onerror', 'onclick', 'onmouseover', 'onmouseout',
//   'onkeydown', 'onkeyup', 'onkeypress', 'onfocus', 'onblur',
//   'onchange', 'onsubmit', 'onreset', 'onselect', 'onresize',
//   'onscroll', 'ondblclick', 'oncontextmenu', 'ondrag', 'ondrop',
//   'javascript:', 'vbscript:', 'data:', 'about:'
// ];

// 允许的HTML标签列表（白名单）
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'i', 'b', 'span', 'div',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li',
  'blockquote', 'pre', 'code', 'a', 'img'
];

// 允许的HTML属性列表（白名单）
const ALLOWED_ATTRIBUTES = {
  'a': ['href', 'title', 'target'],
  'img': ['src', 'alt', 'title', 'width', 'height'],
  'div': ['class', 'id'],
  'span': ['class', 'id'],
  'p': ['class', 'id'],
  'h1': ['class', 'id'],
  'h2': ['class', 'id'],
  'h3': ['class', 'id'],
  'h4': ['class', 'id'],
  'h5': ['class', 'id'],
  'h6': ['class', 'id']
};

export class SecurityValidator {
  /**
   * 检测并移除XSS攻击代码
   * @param input 输入字符串
   * @returns 清理后的安全字符串
   */
  static sanitizeXSS(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    let sanitized = input;

    // 移除script标签及其内容
    sanitized = sanitized.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    
    // 移除javascript:协议
    sanitized = sanitized.replace(/javascript:/gi, '');
    
    // 移除vbscript:协议
    sanitized = sanitized.replace(/vbscript:/gi, '');
    
    // 移除data:协议（除了安全的图片格式）
    sanitized = sanitized.replace(/data:(?!image\/(png|jpg|jpeg|gif|svg\+xml))[^;]*;/gi, '');
    
    // 移除事件处理器
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');
    
    // 移除style属性中的expression
    sanitized = sanitized.replace(/style\s*=\s*["'][^"']*expression\s*\([^"']*["']/gi, '');
    
    return sanitized;
  }

  /**
   * HTML内容过滤器 - 只允许安全的HTML标签和属性
   * @param html HTML字符串
   * @returns 过滤后的安全HTML
   */
  static sanitizeHTML(html: string): string {
    if (!html || typeof html !== 'string') {
      return '';
    }

    // 首先进行XSS清理
    let sanitized = this.sanitizeXSS(html);

    // 创建临时DOM元素进行解析
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitized;

    // 递归清理所有元素
    this.cleanElement(tempDiv);

    return tempDiv.innerHTML;
  }

  /**
   * 递归清理DOM元素
   * @param element DOM元素
   */
  private static cleanElement(element: Element): void {
    const children = Array.from(element.children);
    
    children.forEach(child => {
      const tagName = child.tagName.toLowerCase();
      
      // 检查标签是否在允许列表中
      if (!ALLOWED_TAGS.includes(tagName)) {
        // 移除不允许的标签，但保留其文本内容
        const textContent = child.textContent || '';
        const textNode = document.createTextNode(textContent);
        child.parentNode?.replaceChild(textNode, child);
        return;
      }

      // 清理属性
      const allowedAttrs = ALLOWED_ATTRIBUTES[tagName as keyof typeof ALLOWED_ATTRIBUTES] || [];
      const attributes = Array.from(child.attributes);
      
      attributes.forEach(attr => {
        if (!allowedAttrs.includes(attr.name)) {
          child.removeAttribute(attr.name);
        } else {
          // 验证属性值
          const cleanValue = this.sanitizeAttributeValue(attr.value);
          child.setAttribute(attr.name, cleanValue);
        }
      });

      // 递归处理子元素
      this.cleanElement(child);
    });
  }

  /**
   * 清理属性值
   * @param value 属性值
   * @returns 清理后的属性值
   */
  private static sanitizeAttributeValue(value: string): string {
    if (!value) return '';
    
    // 移除危险的协议
    let cleaned = value.replace(/^\s*(javascript|vbscript|data):/gi, '');
    
    // 移除HTML实体编码的危险内容
    cleaned = cleaned.replace(/&#x?[0-9a-f]+;?/gi, '');
    
    return cleaned.trim();
  }

  /**
   * 验证输入数据类型和格式
   * @param input 输入值
   * @param type 期望的数据类型
   * @param options 验证选项
   * @returns 验证结果
   */
  static validateInput(
    input: any,
    type: 'string' | 'number' | 'email' | 'url' | 'json' | 'html',
    options: {
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      pattern?: RegExp;
      allowHTML?: boolean;
    } = {}
  ): { isValid: boolean; sanitized?: any; error?: string } {
    const { required = false, minLength, maxLength, pattern, allowHTML = false } = options;

    // 检查必填项
    if (required && (input === null || input === undefined || input === '')) {
      return { isValid: false, error: '该字段为必填项' };
    }

    // 如果不是必填且为空，返回空值
    if (!required && (input === null || input === undefined || input === '')) {
      return { isValid: true, sanitized: '' };
    }

    let sanitized = input;

    switch (type) {
      case 'string':
        if (typeof input !== 'string') {
          return { isValid: false, error: '输入必须是字符串类型' };
        }
        
        // XSS清理
        sanitized = allowHTML ? this.sanitizeHTML(input) : this.sanitizeXSS(input);
        
        // 长度验证
        if (minLength !== undefined && sanitized.length < minLength) {
          return { isValid: false, error: `最小长度为 ${minLength} 个字符` };
        }
        if (maxLength !== undefined && sanitized.length > maxLength) {
          return { isValid: false, error: `最大长度为 ${maxLength} 个字符` };
        }
        
        // 正则验证
        if (pattern && !pattern.test(sanitized)) {
          return { isValid: false, error: '输入格式不正确' };
        }
        
        break;

      case 'number':
        const num = Number(input);
        if (isNaN(num)) {
          return { isValid: false, error: '输入必须是有效数字' };
        }
        sanitized = num;
        break;

      case 'email':
        if (typeof input !== 'string') {
          return { isValid: false, error: '邮箱必须是字符串类型' };
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        sanitized = this.sanitizeXSS(input);
        if (!emailPattern.test(sanitized)) {
          return { isValid: false, error: '邮箱格式不正确' };
        }
        break;

      case 'url':
        if (typeof input !== 'string') {
          return { isValid: false, error: 'URL必须是字符串类型' };
        }
        try {
          const url = new URL(input);
          // 只允许http和https协议
          if (!['http:', 'https:'].includes(url.protocol)) {
            return { isValid: false, error: '只允许HTTP和HTTPS协议' };
          }
          sanitized = url.toString();
        } catch {
          return { isValid: false, error: 'URL格式不正确' };
        }
        break;

      case 'json':
        if (typeof input === 'string') {
          try {
            sanitized = JSON.parse(input);
          } catch {
            return { isValid: false, error: 'JSON格式不正确' };
          }
        } else if (typeof input === 'object') {
          sanitized = input;
        } else {
          return { isValid: false, error: '输入必须是有效的JSON' };
        }
        break;

      case 'html':
        if (typeof input !== 'string') {
          return { isValid: false, error: 'HTML内容必须是字符串类型' };
        }
        sanitized = this.sanitizeHTML(input);
        break;

      default:
        return { isValid: false, error: '不支持的验证类型' };
    }

    return { isValid: true, sanitized };
  }

  /**
   * 检测SQL注入攻击
   * @param input 输入字符串
   * @returns 是否包含SQL注入
   */
  static detectSQLInjection(input: string): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }

    const sqlPatterns = [
      /('|(\-\-)|(;)|(\||\|)|(\*|\*))/i,
      /(union|select|insert|delete|update|drop|create|alter|exec|execute)/i,
      /(script|javascript|vbscript|onload|onerror)/i,
      /(\<|\>|\&|\#)/i
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  /**
   * 生成内容安全策略(CSP)头
   * @param options CSP配置选项
   * @returns CSP头字符串
   */
  static generateCSPHeader(options: {
    allowInlineStyles?: boolean;
    allowInlineScripts?: boolean;
    allowedDomains?: string[];
    allowDataImages?: boolean;
    allowEval?: boolean;
    allowWebSockets?: boolean;
    reportUri?: string;
  } = {}): string {
    const {
      allowInlineStyles = false,
      allowInlineScripts = false,
      allowedDomains = [],
      allowDataImages = true,
      allowEval = false,
      allowWebSockets = false,
      reportUri
    } = options;

    const directives: string[] = [];

    // 默认源
    directives.push("default-src 'self'");

    // 脚本源
    let scriptSrc = "script-src 'self'";
    if (allowInlineScripts) {
      scriptSrc += " 'unsafe-inline'";
    }
    if (allowEval) {
      scriptSrc += " 'unsafe-eval'";
    }
    if (allowedDomains.length > 0) {
      scriptSrc += ` ${allowedDomains.join(' ')}`;
    }
    directives.push(scriptSrc);

    // 样式源
    let styleSrc = "style-src 'self'";
    if (allowInlineStyles) {
      styleSrc += " 'unsafe-inline'";
    }
    // 添加Google Fonts支持
    styleSrc += " https://fonts.googleapis.com";
    directives.push(styleSrc);

    // 图片源
    let imgSrc = "img-src 'self'";
    if (allowDataImages) {
      imgSrc += " data:";
    }
    if (allowedDomains.length > 0) {
      imgSrc += ` ${allowedDomains.join(' ')}`;
    }
    directives.push(imgSrc);

    // 字体源
    let fontSrc = "font-src 'self'";
    fontSrc += " https://fonts.gstatic.com";
    if (allowedDomains.length > 0) {
      fontSrc += ` ${allowedDomains.join(' ')}`;
    }
    directives.push(fontSrc);

    // 连接源
    let connectSrc = "connect-src 'self'";
    if (allowWebSockets) {
      connectSrc += " ws: wss:";
    }
    if (allowedDomains.length > 0) {
      connectSrc += ` ${allowedDomains.join(' ')}`;
    }
    directives.push(connectSrc);

    // 其他安全指令
    directives.push("object-src 'none'");
    directives.push("frame-ancestors 'none'");
    directives.push("base-uri 'self'");
    directives.push("form-action 'self'");
    directives.push("upgrade-insecure-requests");

    // 报告URI（如果提供）
    if (reportUri) {
      directives.push(`report-uri ${reportUri}`);
    }

    return directives.join('; ');
  }

  /**
   * 验证CSP违规报告
   * @param report CSP违规报告
   * @returns 是否为有效报告
   */
  static validateCSPReport(report: any): boolean {
    try {
      return (
        report &&
        typeof report === 'object' &&
        'csp-report' in report &&
        typeof report['csp-report'] === 'object'
      );
    } catch {
      return false;
    }
  }

  /**
   * 处理CSP违规报告
   * @param report CSP违规报告
   */
  static handleCSPViolation(report: any): void {
    if (!this.validateCSPReport(report)) {
      console.warn('Invalid CSP report received');
      return;
    }

    const violation = report['csp-report'];
    console.warn('CSP Violation detected:', {
      blockedUri: violation['blocked-uri'],
      violatedDirective: violation['violated-directive'],
      originalPolicy: violation['original-policy'],
      documentUri: violation['document-uri'],
      sourceFile: violation['source-file'],
      lineNumber: violation['line-number'],
      columnNumber: violation['column-number']
    });

    // 在开发环境下提供更详细的信息
    if (import.meta.env.DEV) {
      console.group('🔒 CSP Violation Details');
      console.log('Blocked URI:', violation['blocked-uri']);
      console.log('Violated Directive:', violation['violated-directive']);
      console.log('Source File:', violation['source-file']);
      console.log('Line:Column:', `${violation['line-number']}:${violation['column-number']}`);
      console.groupEnd();
    }
  }

  /**
   * 验证文件上传安全性
   * @param file 文件对象
   * @param options 验证选项
   * @returns 验证结果
   */
  static validateFileUpload(
    file: File,
    options: {
      allowedTypes?: string[];
      maxSize?: number; // 字节
      allowedExtensions?: string[];
    } = {}
  ): { isValid: boolean; error?: string } {
    const {
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      maxSize = 5 * 1024 * 1024, // 5MB
      allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    } = options;

    // 检查文件大小
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `文件大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`
      };
    }

    // 检查文件类型
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `不支持的文件类型: ${file.type}`
      };
    }

    // 检查文件扩展名
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return {
        isValid: false,
        error: `不支持的文件扩展名: ${extension}`
      };
    }

    // 检查文件名是否包含危险字符
    const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (dangerousChars.test(file.name)) {
      return {
        isValid: false,
        error: '文件名包含非法字符'
      };
    }

    return { isValid: true };
  }
}

/**
 * 安全工具函数
 */
export const SecurityUtils = {
  /**
   * 转义HTML特殊字符
   */
  escapeHTML: (str: string): string => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * 反转义HTML特殊字符
   */
  unescapeHTML: (str: string): string => {
    const div = document.createElement('div');
    div.innerHTML = str;
    return div.textContent || div.innerText || '';
  },

  /**
   * 生成随机令牌
   */
  generateToken: (length: number = 32): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * 安全的JSON解析
   */
  safeJSONParse: (str: string, defaultValue: any = null): any => {
    try {
      return JSON.parse(str);
    } catch {
      return defaultValue;
    }
  }
};

export default SecurityValidator;