/**
 * 诊断服务 - 用于系统性检测登录系统的各个层级
 * 仅在开发环境中启用，提供详细的诊断信息
 */

import { supabase } from './supabase';

// 诊断结果类型定义
export interface DiagnosticResult {
  level: 'network' | 'database' | 'auth' | 'state';
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: unknown;
  timestamp: string;
  duration?: number;
}

export interface DiagnosticReport {
  overall: 'healthy' | 'warning' | 'critical';
  results: DiagnosticResult[];
  summary: string;
  timestamp: string;
  totalDuration: number;
}

/**
 * 诊断服务类
 * 提供系统性的登录系统诊断功能
 */
export class DiagnosticService {
  private static instance: DiagnosticService;
  private diagnosticHistory: DiagnosticReport[] = [];

  private constructor() {
    // 确保仅在开发环境中使用
    if (import.meta.env.PROD) {
      console.warn('DiagnosticService should only be used in development environment');
    }
  }

  /**
   * 获取诊断服务单例实例
   */
  public static getInstance(): DiagnosticService {
    if (!DiagnosticService.instance) {
      DiagnosticService.instance = new DiagnosticService();
    }
    return DiagnosticService.instance;
  }

  /**
   * 执行完整的系统诊断
   * @returns 完整的诊断报告
   */
  public async runFullDiagnostic(): Promise<DiagnosticReport> {
    const startTime = Date.now();
    const results: DiagnosticResult[] = [];

    console.log('🔍 开始执行系统诊断...');

    try {
      // 1. 网络连接检测
      const networkResult = await this.checkNetworkConnection();
      results.push(networkResult);

      // 2. 数据库连接检测
      const dbResult = await this.checkDatabaseConnection();
      results.push(dbResult);

      // 3. 数据库查询检测
      const queryResult = await this.checkDatabaseQuery();
      results.push(queryResult);

      // 4. 认证逻辑检测
      const authResult = await this.checkAuthLogic();
      results.push(authResult);

    } catch (error) {
      results.push({
        level: 'network',
        status: 'error',
        message: '诊断过程中发生未预期错误',
        details: error,
        timestamp: new Date().toISOString()
      });
    }

    const endTime = Date.now();
    const totalDuration = endTime - startTime;

    // 生成诊断报告
    const report = this.generateReport(results, totalDuration);
    
    // 保存到历史记录
    this.diagnosticHistory.push(report);
    
    // 输出诊断报告
    this.logDiagnosticReport(report);
    
    return report;
  }

  /**
   * 检测网络连接
   */
  private async checkNetworkConnection(): Promise<DiagnosticResult> {
    const startTime = Date.now();
    
    try {
      console.log('🌐 检测网络连接...');
      
      // 检测基本网络连接
      const response = await fetch('https://httpbin.org/get', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        return {
          level: 'network',
          status: 'success',
          message: `网络连接正常 (${duration}ms)`,
          details: {
            status: response.status,
            statusText: response.statusText,
            duration
          },
          timestamp: new Date().toISOString(),
          duration
        };
      } else {
        return {
          level: 'network',
          status: 'warning',
          message: `网络连接异常: ${response.status} ${response.statusText}`,
          details: {
            status: response.status,
            statusText: response.statusText,
            duration
          },
          timestamp: new Date().toISOString(),
          duration
        };
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        level: 'network',
        status: 'error',
        message: '网络连接失败',
        details: error,
        timestamp: new Date().toISOString(),
        duration
      };
    }
  }

  /**
   * 检测数据库连接
   */
  private async checkDatabaseConnection(): Promise<DiagnosticResult> {
    const startTime = Date.now();
    
    try {
      console.log('🗄️ 检测数据库连接...');
      
      // 测试Supabase连接
      const { count, error } = await supabase
        .from('admin_users')
        .select('*', { count: 'exact', head: true });
      
      const duration = Date.now() - startTime;
      
      if (error) {
        return {
          level: 'database',
          status: 'error',
          message: `数据库连接失败: ${error.message}`,
          details: error,
          timestamp: new Date().toISOString(),
          duration
        };
      }
      
      return {
        level: 'database',
        status: 'success',
        message: `数据库连接正常，admin_users表有 ${count} 条记录 (${duration}ms)`,
        details: {
          count,
          duration
        },
        timestamp: new Date().toISOString(),
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        level: 'database',
        status: 'error',
        message: '数据库连接异常',
        details: error,
        timestamp: new Date().toISOString(),
        duration
      };
    }
  }

  /**
   * 检测数据库查询
   */
  private async checkDatabaseQuery(): Promise<DiagnosticResult> {
    const startTime = Date.now();
    
    try {
      console.log('📊 检测数据库查询...');
      
      // 查询admin_users表结构
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .limit(1);
      
      const duration = Date.now() - startTime;
      
      if (error) {
        return {
          level: 'database',
          status: 'error',
          message: `数据库查询失败: ${error.message}`,
          details: error,
          timestamp: new Date().toISOString(),
          duration
        };
      }
      
      const hasData = data && data.length > 0;
      const sampleUser = hasData ? data[0] : null;
      
      return {
        level: 'database',
        status: 'success',
        message: `数据库查询正常，${hasData ? '有' : '无'}示例数据 (${duration}ms)`,
        details: {
          hasData,
          sampleUser: sampleUser ? {
            id: sampleUser.id,
            email: sampleUser.email,
            hasPassword: !!sampleUser.password
          } : null,
          duration
        },
        timestamp: new Date().toISOString(),
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        level: 'database',
        status: 'error',
        message: '数据库查询异常',
        details: error,
        timestamp: new Date().toISOString(),
        duration
      };
    }
  }

  /**
   * 检测认证逻辑
   */
  private async checkAuthLogic(): Promise<DiagnosticResult> {
    const startTime = Date.now();
    
    try {
      console.log('🔐 检测认证逻辑...');
      
      // 测试认证逻辑（不实际登录）
      const testEmail = 'admin@example.com';
      
      const { data: users, error } = await supabase
        .from('admin_users')
        .select('id, email, password')
        .eq('email', testEmail)
        .limit(1);
      
      const duration = Date.now() - startTime;
      
      if (error) {
        return {
          level: 'auth',
          status: 'error',
          message: `认证查询失败: ${error.message}`,
          details: error,
          timestamp: new Date().toISOString(),
          duration
        };
      }
      
      const userExists = users && users.length > 0;
      const user = userExists ? users[0] : null;
      
      if (!userExists) {
        return {
          level: 'auth',
          status: 'warning',
          message: `测试用户 ${testEmail} 不存在`,
          details: {
            testEmail,
            userExists: false,
            duration
          },
          timestamp: new Date().toISOString(),
          duration
        };
      }
      
      const hasPassword = user && !!user.password;
      
      return {
        level: 'auth',
        status: hasPassword ? 'success' : 'warning',
        message: `测试用户 ${testEmail} ${userExists ? '存在' : '不存在'}，${hasPassword ? '有' : '无'}密码 (${duration}ms)`,
        details: {
          testEmail,
          userExists,
          hasPassword,
          userId: user?.id,
          duration
        },
        timestamp: new Date().toISOString(),
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        level: 'auth',
        status: 'error',
        message: '认证逻辑检测异常',
        details: error,
        timestamp: new Date().toISOString(),
        duration
      };
    }
  }

  /**
   * 生成诊断报告
   */
  private generateReport(results: DiagnosticResult[], totalDuration: number): DiagnosticReport {
    const errorCount = results.filter(r => r.status === 'error').length;
    const warningCount = results.filter(r => r.status === 'warning').length;
    
    let overall: 'healthy' | 'warning' | 'critical';
    let summary: string;
    
    if (errorCount > 0) {
      overall = 'critical';
      summary = `发现 ${errorCount} 个错误，${warningCount} 个警告`;
    } else if (warningCount > 0) {
      overall = 'warning';
      summary = `发现 ${warningCount} 个警告`;
    } else {
      overall = 'healthy';
      summary = '所有检测项目正常';
    }
    
    return {
      overall,
      results,
      summary,
      timestamp: new Date().toISOString(),
      totalDuration
    };
  }

  /**
   * 输出诊断报告到控制台
   */
  private logDiagnosticReport(report: DiagnosticReport): void {
    console.log('\n📋 诊断报告');
    console.log('='.repeat(50));
    console.log(`总体状态: ${report.overall}`);
    console.log(`总结: ${report.summary}`);
    console.log(`总耗时: ${report.totalDuration}ms`);
    console.log(`时间: ${report.timestamp}`);
    console.log('\n详细结果:');
    
    report.results.forEach((result, index) => {
      const statusIcon = {
        success: '✅',
        warning: '⚠️',
        error: '❌'
      }[result.status];
      
      console.log(`${index + 1}. ${statusIcon} [${result.level.toUpperCase()}] ${result.message}`);
      if (result.details && typeof result.details === 'object') {
        console.log(`   详情:`, result.details);
      }
    });
    
    console.log('='.repeat(50));
  }

  /**
   * 获取诊断历史记录
   */
  public getDiagnosticHistory(): DiagnosticReport[] {
    return [...this.diagnosticHistory];
  }

  /**
   * 清除诊断历史记录
   */
  public clearDiagnosticHistory(): void {
    this.diagnosticHistory = [];
    console.log('诊断历史记录已清除');
  }

  /**
   * 测试登录凭据
   */
  public async testLoginCredentials(email: string, password: string): Promise<DiagnosticResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🔑 测试登录凭据: ${email}`);
      
      const { data: users, error } = await supabase
        .from('admin_users')
        .select('id, email, password')
        .eq('email', email)
        .limit(1);
      
      const duration = Date.now() - startTime;
      
      if (error) {
        return {
          level: 'auth',
          status: 'error',
          message: `登录测试失败: ${error.message}`,
          details: error,
          timestamp: new Date().toISOString(),
          duration
        };
      }
      
      const userExists = users && users.length > 0;
      const user = userExists ? users[0] : null;
      
      if (!userExists) {
        return {
          level: 'auth',
          status: 'error',
          message: `用户 ${email} 不存在`,
          details: {
            email,
            userExists: false,
            duration
          },
          timestamp: new Date().toISOString(),
          duration
        };
      }
      
      const passwordMatch = user?.password === password;
      
      return {
        level: 'auth',
        status: passwordMatch ? 'success' : 'error',
        message: `用户 ${email} ${passwordMatch ? '密码正确' : '密码错误'} (${duration}ms)`,
        details: {
          email,
          userExists,
          passwordMatch,
          userId: user?.id,
          storedPassword: user?.password,
          inputPassword: password,
          duration
        },
        timestamp: new Date().toISOString(),
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        level: 'auth',
        status: 'error',
        message: '登录凭据测试异常',
        details: error,
        timestamp: new Date().toISOString(),
        duration
      };
    }
  }

  /**
   * 测试已知的管理员凭据
   */
  public async testKnownCredentials(): Promise<DiagnosticResult> {
    const knownEmail = 'admin@example.com';
    const knownPassword = 'admin123456';
    
    try {
      console.log('🔑 测试已知凭据:', { email: knownEmail, password: knownPassword });
      const result = await this.testLoginCredentials(knownEmail, knownPassword);
      
      return {
        level: 'auth',
        status: result.status,
        message: `已知凭据测试: ${result.message}`,
        details: {
          ...(result.details as Record<string, unknown> || {}),
          knownCredentials: { email: knownEmail, password: knownPassword }
        },
        timestamp: new Date().toISOString(),
        duration: result.duration
      };
    } catch (error) {
      return {
        level: 'auth',
        status: 'error',
        message: `已知凭据测试失败: ${error}`,
        details: { error },
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const diagnosticService = DiagnosticService.getInstance();