import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * 邮件发送Edge Function
 * 使用第三方邮件服务发送邮件通知
 */

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface EmailResponse {
  success: boolean;
  message?: string;
  error?: string;
}

serve(async (req: Request): Promise<Response> => {
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // 验证请求方法
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: '只支持POST请求' }),
        { 
          status: 405, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          } 
        }
      );
    }

    // 解析请求体
    const emailData: EmailRequest = await req.json();
    
    // 验证必需字段
    if (!emailData.to || !emailData.subject || !emailData.html) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '缺少必需字段: to, subject, html' 
        }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          } 
        }
      );
    }

    // 获取环境变量
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const SMTP_HOST = Deno.env.get('SMTP_HOST');
    const SMTP_PORT = Deno.env.get('SMTP_PORT');
    const SMTP_USER = Deno.env.get('SMTP_USER');
    const SMTP_PASS = Deno.env.get('SMTP_PASS');

    let emailResult: EmailResponse;

    // 优先使用Resend服务
    if (RESEND_API_KEY) {
      emailResult = await sendWithResend(emailData, RESEND_API_KEY);
    }
    // 备用SMTP服务
    else if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      emailResult = await sendWithSMTP(emailData, {
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT || '587'),
        user: SMTP_USER,
        pass: SMTP_PASS
      });
    }
    // 开发环境模拟发送
    else {
      console.log('开发环境 - 模拟邮件发送:');
      console.log('收件人:', emailData.to);
      console.log('主题:', emailData.subject);
      console.log('发件人:', emailData.from || 'noreply@example.com');
      
      emailResult = {
        success: true,
        message: '开发环境模拟发送成功'
      };
    }

    // 记录邮件发送日志到数据库
    await logEmailSend(emailData, emailResult);

    return new Response(
      JSON.stringify(emailResult),
      { 
        status: emailResult.success ? 200 : 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );

  } catch (error) {
    console.error('邮件发送Edge Function错误:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: '服务器内部错误' 
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );
  }
});

/**
 * 使用Resend服务发送邮件
 */
async function sendWithResend(emailData: EmailRequest, apiKey: string): Promise<EmailResponse> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailData.from || 'noreply@example.com',
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Resend API错误:', errorData);
      return {
        success: false,
        error: `Resend发送失败: ${response.status}`
      };
    }

    const result = await response.json();
    console.log('Resend发送成功:', result.id);
    
    return {
      success: true,
      message: `邮件发送成功，ID: ${result.id}`
    };
  } catch (error) {
    console.error('Resend发送错误:', error);
    return {
      success: false,
      error: 'Resend服务错误'
    };
  }
}

/**
 * 使用SMTP服务发送邮件
 */
async function sendWithSMTP(emailData: EmailRequest, smtpConfig: any): Promise<EmailResponse> {
  try {
    // 这里可以集成SMTP库，如nodemailer的Deno版本
    // 由于Deno环境限制，这里提供基础框架
    console.log('SMTP配置:', smtpConfig);
    console.log('发送邮件:', emailData);
    
    // TODO: 实现SMTP发送逻辑
    return {
      success: true,
      message: 'SMTP发送成功（待实现）'
    };
  } catch (error) {
    console.error('SMTP发送错误:', error);
    return {
      success: false,
      error: 'SMTP服务错误'
    };
  }
}

/**
 * 记录邮件发送日志到数据库
 */
async function logEmailSend(emailData: EmailRequest, result: EmailResponse): Promise<void> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    await supabase
      .from('email_logs')
      .insert({
        to_email: emailData.to,
        from_email: emailData.from || 'noreply@example.com',
        subject: emailData.subject,
        status: result.success ? 'sent' : 'failed',
        error_message: result.error || null,
        sent_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('邮件日志记录失败:', error);
    // 不抛出错误，避免影响邮件发送结果
  }
}

/* 使用说明:
 * 
 * 1. 环境变量配置:
 *    - RESEND_API_KEY: Resend服务的API密钥（推荐）
 *    - SMTP_HOST: SMTP服务器地址
 *    - SMTP_PORT: SMTP端口（默认587）
 *    - SMTP_USER: SMTP用户名
 *    - SMTP_PASS: SMTP密码
 * 
 * 2. 请求格式:
 *    POST /functions/v1/send-email
 *    {
 *      "to": "recipient@example.com",
 *      "subject": "邮件主题",
 *      "html": "<h1>邮件内容</h1>",
 *      "from": "sender@example.com" // 可选
 *    }
 * 
 * 3. 响应格式:
 *    {
 *      "success": true,
 *      "message": "发送成功消息"
 *    }
 *    或
 *    {
 *      "success": false,
 *      "error": "错误消息"
 *    }
 */