/**
 * CSP违规报告处理工具
 * 用于收集和处理内容安全策略违规报告
 */

import { SecurityValidator } from './security';

/**
 * CSP违规报告接口
 */
interface CSPViolationReport {
  'csp-report': {
    'blocked-uri': string;
    'violated-directive': string;
    'original-policy': string;
    'document-uri': string;
    'source-file'?: string;
    'line-number'?: number;
    'column-number'?: number;
    'status-code'?: number;
  };
}

/**
 * CSP违规统计信息
 */
interface CSPViolationStats {
  totalViolations: number;
  violationsByDirective: Record<string, number>;
  violationsBySource: Record<string, number>;
  recentViolations: CSPViolationReport[];
}

/**
 * CSP报告管理器
 */
export class CSPReportManager {
  private static violations: CSPViolationReport[] = [];
  private static maxStoredViolations = 100;

  /**
   * 处理CSP违规报告
   * @param report 违规报告
   */
  static handleViolationReport(report: CSPViolationReport): void {
    try {
      // 验证报告格式
      if (!SecurityValidator.validateCSPReport(report)) {
        console.warn('Invalid CSP violation report format');
        return;
      }

      // 存储违规报告
      this.storeViolation(report);

      // 处理违规
      SecurityValidator.handleCSPViolation(report);

      // 在开发环境下提供额外的调试信息
      if (import.meta.env.DEV) {
        this.logDevelopmentInfo(report);
      }

      // 在生产环境下发送到监控系统
      if (import.meta.env.PROD) {
        this.sendToMonitoring(report);
      }
    } catch (error) {
      console.error('Error handling CSP violation report:', error);
    }
  }

  /**
   * 存储违规报告
   * @param report 违规报告
   */
  private static storeViolation(report: CSPViolationReport): void {
    this.violations.push(report);
    
    // 保持存储数量在限制内
    if (this.violations.length > this.maxStoredViolations) {
      this.violations = this.violations.slice(-this.maxStoredViolations);
    }
  }

  /**
   * 获取违规统计信息
   * @returns 统计信息
   */
  static getViolationStats(): CSPViolationStats {
    const violationsByDirective: Record<string, number> = {};
    const violationsBySource: Record<string, number> = {};

    this.violations.forEach(violation => {
      const directive = violation['csp-report']['violated-directive'];
      const source = violation['csp-report']['source-file'] || 'unknown';

      violationsByDirective[directive] = (violationsByDirective[directive] || 0) + 1;
      violationsBySource[source] = (violationsBySource[source] || 0) + 1;
    });

    return {
      totalViolations: this.violations.length,
      violationsByDirective,
      violationsBySource,
      recentViolations: this.violations.slice(-10) // 最近10条
    };
  }

  /**
   * 清除违规报告
   */
  static clearViolations(): void {
    this.violations = [];
  }

  /**
   * 开发环境日志信息
   * @param report 违规报告
   */
  private static logDevelopmentInfo(report: CSPViolationReport): void {
    const violation = report['csp-report'];
    
    console.group('🔒 CSP Violation Development Info');
    console.log('📍 Location:', {
      document: violation['document-uri'],
      source: violation['source-file'],
      position: `${violation['line-number']}:${violation['column-number']}`
    });
    console.log('🚫 Blocked:', violation['blocked-uri']);
    console.log('📋 Directive:', violation['violated-directive']);
    console.log('📜 Policy:', violation['original-policy']);
    
    // 提供修复建议
    this.provideFixSuggestions(violation);
    console.groupEnd();
  }

  /**
   * 提供修复建议
   * @param violation 违规信息
   */
  private static provideFixSuggestions(violation: any): void {
    const directive = violation['violated-directive'];
    const blockedUri = violation['blocked-uri'];

    console.log('💡 Fix Suggestions:');
    
    if (directive.includes('script-src')) {
      if (blockedUri.includes('eval')) {
        console.log('  - Consider removing eval() usage or adding \'unsafe-eval\' to script-src');
      } else if (blockedUri.startsWith('inline')) {
        console.log('  - Move inline scripts to external files or add \'unsafe-inline\' to script-src');
      } else {
        console.log(`  - Add '${blockedUri}' to script-src allowlist`);
      }
    }
    
    if (directive.includes('style-src')) {
      if (blockedUri.startsWith('inline')) {
        console.log('  - Move inline styles to external CSS or add \'unsafe-inline\' to style-src');
      } else {
        console.log(`  - Add '${blockedUri}' to style-src allowlist`);
      }
    }
    
    if (directive.includes('img-src')) {
      console.log(`  - Add '${blockedUri}' to img-src allowlist`);
    }
  }

  /**
   * 发送到监控系统
   * @param report 违规报告
   */
  private static async sendToMonitoring(report: CSPViolationReport): Promise<void> {
    try {
      // 这里可以集成实际的监控系统，如Sentry、LogRocket等
      // 示例：发送到自定义监控端点
      await fetch('/api/csp-violations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });
    } catch (error) {
      console.error('Failed to send CSP violation to monitoring:', error);
    }
  }

  /**
   * 初始化CSP报告监听器
   */
  static initializeReportListener(): void {
    // 监听CSP违规事件
    document.addEventListener('securitypolicyviolation', (event) => {
      const report: CSPViolationReport = {
        'csp-report': {
          'blocked-uri': event.blockedURI,
          'violated-directive': event.violatedDirective,
          'original-policy': event.originalPolicy,
          'document-uri': event.documentURI,
          'source-file': event.sourceFile,
          'line-number': event.lineNumber,
          'column-number': event.columnNumber,
          'status-code': event.statusCode
        }
      };
      
      this.handleViolationReport(report);
    });

    // 在开发环境下提供全局访问
    if (import.meta.env.DEV) {
      (window as any).CSPReportManager = this;
      console.log('🔒 CSP Report Manager initialized. Access via window.CSPReportManager');
    }
  }
}

/**
 * 导出便捷函数
 */
export const initializeCSPReporting = () => CSPReportManager.initializeReportListener();
export const getCSPStats = () => CSPReportManager.getViolationStats();
export const clearCSPViolations = () => CSPReportManager.clearViolations();