import { supabase } from '../lib/supabase'
import type { ContactSubmissionInsert, ContactInfo } from '../types/database'
import { EmailService } from './emailService'

/**
 * 联系表单提交结果接口
 */
export interface ContactSubmissionResult {
  success: boolean
  message: string
  submissionId?: string
}

/**
 * 联系表单数据接口
 */
export interface ContactFormData {
  name: string
  phone: string
  subject: string
  message: string
  courseInterest?: string
}

/**
 * 联系信息服务类
 * 负责处理联系表单提交和联系信息获取的业务逻辑
 */
export class ContactService {
  /**
   * 提交联系表单
   * @param formData 表单数据
   * @returns 提交结果
   */
  static async submitContactForm(formData: ContactFormData): Promise<ContactSubmissionResult> {
    try {
      // 数据验证
      const validationError = this.validateFormData(formData)
      if (validationError) {
        return {
          success: false,
          message: validationError
        }
      }

      // 准备插入数据
      const submissionData: ContactSubmissionInsert = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        course_interest: formData.courseInterest?.trim() || null,
        status: 'pending'
      }

      // 插入数据到Supabase
      const { data, error } = await supabase
        .from('contact_submissions')
        .insert(submissionData)
        .select('id, created_at')
        .single()

      if (error) {
        console.error('联系表单提交失败:', error)
        return {
          success: false,
          message: '提交失败，请稍后重试'
        }
      }

      // 发送邮件通知（异步执行，不影响表单提交结果）
      this.sendEmailNotifications(formData, data.created_at || new Date().toISOString()).catch(emailError => {
        console.error('邮件发送失败:', emailError)
        // 邮件发送失败不影响表单提交成功状态
      })

      return {
        success: true,
        message: '提交成功！我们会尽快与您联系。',
        submissionId: data.id
      }
    } catch (error) {
      console.error('联系表单提交异常:', error)
      return {
        success: false,
        message: '系统异常，请稍后重试'
      }
    }
  }

  /**
   * 获取联系信息配置
   * @returns 联系信息列表
   */
  static async getContactInfo(): Promise<ContactInfo[]> {
    try {
      const { data, error } = await supabase
        .from('contact_info')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) {
        console.error('获取联系信息失败:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('获取联系信息异常:', error)
      return []
    }
  }

  /**
   * 根据key获取特定联系信息
   * @param key 联系信息键
   * @returns 联系信息值
   */
  static async getContactInfoByKey(key: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('contact_info')
        .select('value')
        .eq('key', key)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        return null
      }

      return data.value
    } catch (error) {
      console.error(`获取联系信息 ${key} 异常:`, error)
      return null
    }
  }

  /**
   * 发送邮件通知
   * @param formData 表单数据
   * @param submittedAt 提交时间
   */
  private static async sendEmailNotifications(formData: ContactFormData, submittedAt: string): Promise<void> {
    try {
      // 准备邮件数据
      const emailData = {
        name: formData.name,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        courseInterest: formData.courseInterest,
        submittedAt: submittedAt
      }

      // 发送管理员通知邮件
      const adminNotification = await EmailService.sendContactNotification(emailData)
      if (adminNotification.success) {
        console.log('管理员通知邮件发送成功')
      } else {
        console.error('管理员通知邮件发送失败:', adminNotification.error)
      }
    } catch (error) {
      console.error('邮件通知发送异常:', error)
      throw error
    }
  }

  /**
   * 获取所有联系表单提交记录
   * @returns 提交记录列表
   */
  static async getAllSubmissions(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('获取提交记录失败:', error);
        throw new Error(`获取数据失败: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('获取提交记录失败:', error);
      throw error;
    }
  }

  /**
   * 更新联系表单提交状态
   * @param id 记录ID
   * @param status 新状态
   */
  static async updateSubmissionStatus(id: string, status: 'pending' | 'contacted' | 'resolved'): Promise<void> {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('更新状态失败:', error);
        throw new Error(`更新状态失败: ${error.message}`);
      }

      console.log(`成功更新记录 ${id} 的状态为 ${status}`);
    } catch (error) {
      console.error('更新状态失败:', error);
      throw error;
    }
  }

  /**
   * 删除联系表单提交记录
   * @param id 记录ID
   */
  static async deleteSubmission(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('删除记录失败:', error);
        throw new Error(`删除记录失败: ${error.message}`);
      }

      console.log(`成功删除记录 ${id}`);
    } catch (error) {
      console.error('删除记录失败:', error);
      throw error;
    }
  }

  /**
   * 验证表单数据
   * @param formData 表单数据
   * @returns 验证错误信息，无错误返回null
   */
  private static validateFormData(formData: ContactFormData): string | null {
    // 姓名验证
    if (!formData.name || formData.name.trim().length === 0) {
      return '请输入姓名'
    }
    if (formData.name.trim().length > 100) {
      return '姓名长度不能超过100个字符'
    }

    // 电话验证
    if (!formData.phone || formData.phone.trim().length === 0) {
      return '请输入联系电话'
    }
    const phoneRegex = /^[0-9+\-\s()]+$/
    if (!phoneRegex.test(formData.phone.trim())) {
      return '请输入有效的联系电话'
    }
    if (formData.phone.trim().length > 20) {
      return '联系电话长度不能超过20个字符'
    }



    // 主题验证
    if (!formData.subject || formData.subject.trim().length === 0) {
      return '请输入咨询主题'
    }
    if (formData.subject.trim().length > 200) {
      return '咨询主题长度不能超过200个字符'
    }

    // 留言验证
    if (!formData.message || formData.message.trim().length === 0) {
      return '请输入留言内容'
    }
    if (formData.message.trim().length > 2000) {
      return '留言内容长度不能超过2000个字符'
    }

    // 课程兴趣验证（可选）
    if (formData.courseInterest && formData.courseInterest.trim().length > 100) {
      return '课程兴趣长度不能超过100个字符'
    }

    return null
  }
}

export default ContactService