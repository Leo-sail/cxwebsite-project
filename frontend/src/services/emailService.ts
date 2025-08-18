/**
 * 邮件服务
 * 处理联系表单提交后的邮件通知功能
 */
import { supabase } from '../lib/supabase';

/**
 * 邮件发送配置接口
 */
export interface EmailConfig {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * 联系表单邮件数据接口
 */
export interface ContactEmailData {
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  courseInterest?: string;
  submittedAt: string;
}

/**
 * 邮件服务类
 */
export class EmailService {
  /**
   * 发送联系表单通知邮件
   * @param contactData 联系表单数据
   * @returns Promise<{success: boolean, error?: string}>
   */
  static async sendContactNotification(contactData: ContactEmailData): Promise<{success: boolean, error?: string}> {
    try {
      // 生成邮件HTML内容
      const emailHtml = this.generateContactEmailHtml(contactData);
      
      // 调用Supabase Edge Function发送邮件
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: process.env.VITE_ADMIN_EMAIL || 'admin@example.com',
          subject: `新的联系表单提交 - ${contactData.subject}`,
          html: emailHtml,
          from: process.env.VITE_FROM_EMAIL || 'noreply@example.com'
        }
      });

      if (error) {
        console.error('邮件发送失败:', error);
        return { success: false, error: error.message };
      }

      console.log('邮件发送成功:', data);
      return { success: true };
    } catch (error) {
      console.error('邮件服务错误:', error);
      return { success: false, error: '邮件发送失败' };
    }
  }

  /**
   * 生成联系表单邮件HTML内容
   * @param contactData 联系表单数据
   * @returns HTML字符串
   */
  private static generateContactEmailHtml(contactData: ContactEmailData): string {
    return `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>新的联系表单提交</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            margin: -30px -30px 30px -30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .field {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 6px;
            border-left: 4px solid #667eea;
          }
          .field-label {
            font-weight: bold;
            color: #495057;
            margin-bottom: 5px;
            display: block;
          }
          .field-value {
            color: #212529;
            word-wrap: break-word;
          }
          .message-field {
            background-color: #fff;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            padding: 15px;
            margin-top: 10px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
          }
          .timestamp {
            background-color: #e9ecef;
            padding: 10px;
            border-radius: 4px;
            font-size: 14px;
            color: #495057;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 新的联系表单提交</h1>
          </div>
          
          <div class="field">
            <span class="field-label">👤 姓名:</span>
            <div class="field-value">${contactData.name}</div>
          </div>
          
          <div class="field">
            <span class="field-label">📱 电话:</span>
            <div class="field-value">${contactData.phone}</div>
          </div>
          
          ${contactData.email ? `
          <div class="field">
            <span class="field-label">📧 邮箱:</span>
            <div class="field-value">${contactData.email}</div>
          </div>
          ` : ''}
          
          <div class="field">
            <span class="field-label">📝 主题:</span>
            <div class="field-value">${contactData.subject}</div>
          </div>
          
          ${contactData.courseInterest ? `
          <div class="field">
            <span class="field-label">📚 感兴趣的课程:</span>
            <div class="field-value">${contactData.courseInterest}</div>
          </div>
          ` : ''}
          
          <div class="field">
            <span class="field-label">💬 留言内容:</span>
            <div class="message-field">${contactData.message.replace(/\n/g, '<br>')}</div>
          </div>
          
          <div class="field">
            <span class="field-label">⏰ 提交时间:</span>
            <div class="timestamp">${new Date(contactData.submittedAt).toLocaleString('zh-CN')}</div>
          </div>
          
          <div class="footer">
            <p>此邮件由考研培训机构网站自动发送</p>
            <p>请及时回复客户咨询</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * 发送自动回复邮件给客户
   * @param customerEmail 客户邮箱
   * @param customerName 客户姓名
   * @returns Promise<{success: boolean, error?: string}>
   */
  static async sendAutoReply(customerEmail: string, customerName: string): Promise<{success: boolean, error?: string}> {
    try {
      const autoReplyHtml = this.generateAutoReplyHtml(customerName);
      
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: customerEmail,
          subject: '感谢您的咨询 - 我们已收到您的留言',
          html: autoReplyHtml,
          from: process.env.VITE_FROM_EMAIL || 'noreply@example.com'
        }
      });

      if (error) {
        console.error('自动回复邮件发送失败:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('自动回复邮件服务错误:', error);
      return { success: false, error: '自动回复邮件发送失败' };
    }
  }

  /**
   * 生成自动回复邮件HTML内容
   * @param customerName 客户姓名
   * @returns HTML字符串
   */
  private static generateAutoReplyHtml(customerName: string): string {
    return `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>感谢您的咨询</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            margin: -30px -30px 30px -30px;
            text-align: center;
          }
          .content {
            margin: 20px 0;
          }
          .highlight {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #28a745;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ 感谢您的咨询</h1>
          </div>
          
          <div class="content">
            <p>尊敬的 <strong>${customerName}</strong>，您好！</p>
            
            <p>感谢您对我们考研培训机构的关注和信任。我们已经收到您的咨询留言，我们的专业顾问将在 <strong>24小时内</strong> 与您取得联系。</p>
            
            <div class="highlight">
              <h3>🎯 我们的服务承诺</h3>
              <ul>
                <li>专业的考研指导团队</li>
                <li>个性化的学习方案</li>
                <li>全程跟踪辅导服务</li>
                <li>丰富的考研资源</li>
              </ul>
            </div>
            
            <p>如果您有紧急问题需要咨询，也可以直接拨打我们的服务热线：<strong>400-123-4567</strong></p>
            
            <p>再次感谢您的信任，期待为您提供优质的考研培训服务！</p>
          </div>
          
          <div class="footer">
            <p>此邮件由考研培训机构网站自动发送，请勿直接回复</p>
            <p>如需帮助，请访问我们的官网或拨打服务热线</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default EmailService;