/**
 * 内容数据适配器
 * 处理富文本、Markdown和纯文本之间的转换
 * 确保与现有ContentData结构的兼容性
 */

import type { ContentData } from '../types/content';

/**
 * 内容格式常量
 */
export const ContentFormat = {
  HTML: 'html',
  MARKDOWN: 'markdown',
  PLAIN_TEXT: 'plain_text'
} as const;

export type ContentFormat = typeof ContentFormat[keyof typeof ContentFormat];

/**
 * 内容转换接口
 */
export interface ContentConversion {
  from: ContentFormat;
  to: ContentFormat;
  content: string;
}

/**
 * 内容适配器类
 */
export class ContentDataAdapter {
  /**
   * 从ContentData提取文本内容
   * @param contentData 内容数据
   * @param contentType 内容类型
   * @returns 文本内容
   */
  static extractTextContent(contentData: ContentData, contentType: string): string {
    if (!contentData) return '';
    
    // 处理不同的内容类型
    switch (contentType.toUpperCase()) {
      case 'TEXT':
        // TEXT类型可能存储HTML或纯文本
        return contentData.text || contentData.content || '';
      case 'MARKDOWN':
        // MARKDOWN类型存储markdown格式
        return contentData.markdown || contentData.content || contentData.text || '';
      default:
        // 其他类型返回通用内容
        return contentData.content || contentData.text || '';
    }
  }

  /**
   * 将文本内容保存到ContentData
   * @param content 文本内容
   * @param contentType 内容类型
   * @param existingData 现有数据
   * @returns 更新后的ContentData
   */
  static saveTextContent(
    content: string, 
    contentType: string, 
    existingData: ContentData = {}
  ): ContentData {
    const updatedData = { ...existingData };
    
    switch (contentType.toUpperCase()) {
      case 'TEXT':
        // TEXT类型存储为HTML格式
        updatedData.text = content;
        updatedData.content = content;
        break;
      case 'MARKDOWN':
        // MARKDOWN类型存储为markdown格式
        updatedData.markdown = content;
        updatedData.content = content;
        break;
      default:
        // 其他类型存储为通用内容
        updatedData.content = content;
        break;
    }
    
    return updatedData;
  }

  /**
   * 检测内容格式
   * @param content 内容字符串
   * @returns 内容格式
   */
  static detectContentFormat(content: string): ContentFormat {
    if (!content || typeof content !== 'string') {
      return ContentFormat.PLAIN_TEXT;
    }
    
    // 检测HTML标签
    const htmlTagRegex = /<\/?[a-z][\s\S]*>/i;
    if (htmlTagRegex.test(content)) {
      return ContentFormat.HTML;
    }
    
    // 检测Markdown语法
    const markdownPatterns = [
      /^#{1,6}\s+/m,           // 标题
      /\*\*.*?\*\*/,           // 粗体
      /\*.*?\*/,               // 斜体
      /\[.*?\]\(.*?\)/,        // 链接
      /^\s*[-*+]\s+/m,         // 无序列表
      /^\s*\d+\.\s+/m,         // 有序列表
      /^\s*>\s+/m,             // 引用
      /```[\s\S]*?```/,        // 代码块
      /`.*?`/,                 // 行内代码
    ];
    
    if (markdownPatterns.some(pattern => pattern.test(content))) {
      return ContentFormat.MARKDOWN;
    }
    
    return ContentFormat.PLAIN_TEXT;
  }

  /**
   * HTML转纯文本
   * @param html HTML内容
   * @returns 纯文本
   */
  static htmlToPlainText(html: string): string {
    if (!html) return '';
    
    // 创建临时DOM元素来解析HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  /**
   * Markdown转HTML（简单实现）
   * @param markdown Markdown内容
   * @returns HTML内容
   */
  static markdownToHtml(markdown: string): string {
    if (!markdown) return '';
    
    let html = markdown;
    
    // 标题转换
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // 粗体和斜体
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    
    // 链接
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2">$1</a>');
    
    // 代码
    html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
    
    // 换行
    html = html.replace(/\n/gim, '<br>');
    
    return html;
  }

  /**
   * HTML转Markdown（简单实现）
   * @param html HTML内容
   * @returns Markdown内容
   */
  static htmlToMarkdown(html: string): string {
    if (!html) return '';
    
    let markdown = html;
    
    // 标题转换
    markdown = markdown.replace(/<h1>(.*?)<\/h1>/gim, '# $1\n');
    markdown = markdown.replace(/<h2>(.*?)<\/h2>/gim, '## $1\n');
    markdown = markdown.replace(/<h3>(.*?)<\/h3>/gim, '### $1\n');
    
    // 粗体和斜体
    markdown = markdown.replace(/<strong>(.*?)<\/strong>/gim, '**$1**');
    markdown = markdown.replace(/<em>(.*?)<\/em>/gim, '*$1*');
    
    // 链接
    markdown = markdown.replace(/<a href="([^"]+)"[^>]*>(.*?)<\/a>/gim, '[$2]($1)');
    
    // 代码
    markdown = markdown.replace(/<code>(.*?)<\/code>/gim, '`$1`');
    
    // 清理HTML标签
    markdown = markdown.replace(/<[^>]+>/gim, '');
    
    // 清理多余的换行
    markdown = markdown.replace(/\n\s*\n/gim, '\n\n');
    
    return markdown.trim();
  }

  /**
   * 内容格式转换
   * @param conversion 转换配置
   * @returns 转换后的内容
   */
  static convertContent(conversion: ContentConversion): string {
    const { from, to, content } = conversion;
    
    if (from === to) return content;
    
    switch (`${from}->${to}`) {
      case `${ContentFormat.HTML}->${ContentFormat.PLAIN_TEXT}`:
        return this.htmlToPlainText(content);
      case `${ContentFormat.HTML}->${ContentFormat.MARKDOWN}`:
        return this.htmlToMarkdown(content);
      case `${ContentFormat.MARKDOWN}->${ContentFormat.HTML}`:
        return this.markdownToHtml(content);
      case `${ContentFormat.MARKDOWN}->${ContentFormat.PLAIN_TEXT}`:
        return this.htmlToPlainText(this.markdownToHtml(content));
      case `${ContentFormat.PLAIN_TEXT}->${ContentFormat.HTML}`:
        return content.replace(/\n/g, '<br>');
      case `${ContentFormat.PLAIN_TEXT}->${ContentFormat.MARKDOWN}`:
        return content; // 纯文本可以直接作为Markdown
      default:
        return content;
    }
  }

  /**
   * 验证内容数据完整性
   * @param contentData 内容数据
   * @param contentType 内容类型
   * @returns 验证结果
   */
  static validateContentData(contentData: ContentData, contentType: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (!contentData) {
      errors.push('内容数据不能为空');
      return { isValid: false, errors };
    }
    
    const content = this.extractTextContent(contentData, contentType);
    
    if (!content && contentType.toUpperCase() !== 'IMAGE') {
      errors.push('文本内容不能为空');
    }
    
    // 检查内容长度
    if (content && content.length > 100000) {
      errors.push('内容长度不能超过100,000字符');
    }
    
    // 检查HTML安全性（基础检查）
    if (contentType.toUpperCase() === 'TEXT' && content) {
      const dangerousPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi
      ];
      
      if (dangerousPatterns.some(pattern => pattern.test(content))) {
        errors.push('内容包含潜在的安全风险');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * 导出便捷函数
 */
export const {
  extractTextContent,
  saveTextContent,
  detectContentFormat,
  convertContent,
  validateContentData
} = ContentDataAdapter;