/**
 * 后台管理服务
 * 提供后台管理相关的数据操作功能
 */
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type { CourseFormData } from '../types/api';

type Course = Database['public']['Tables']['courses']['Row'];
type Teacher = Database['public']['Tables']['teachers']['Row'];
type Case = Database['public']['Tables']['student_cases']['Row'];
type Article = Database['public']['Tables']['articles']['Row'];
type PageConfig = Database['public']['Tables']['page_configs']['Row'];

/**
 * 验证结果类型
 */
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * 课程管理服务
 */
export class CourseService {
  /**
   * 获取课程列表
   */
  static async getCourses(params?: {
    search?: string;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    let query = supabase
      .from('courses')
      .select('*');

    // 搜索过滤
    if (params?.search) {
      query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }

    // 分类过滤
    if (params?.category && params.category !== 'all') {
      query = query.eq('category', params.category);
    }

    // 状态过滤
    if (params?.status && params.status !== 'all') {
      query = query.eq('is_active', params.status === 'active');
    }

    // 分页
    if (params?.page && params?.limit) {
      const from = (params.page - 1) * params.limit;
      const to = from + params.limit - 1;
      query = query.range(from, to);
    }

    // 排序
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`获取课程列表失败: ${error.message}`);
    }

    return { data, count };
  }

  /**
   * 获取单个课程
   */
  static async getCourse(id: string) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`获取课程详情失败: ${error.message}`);
    }

    return data;
  }

  /**
   * 创建课程
   */
  static async createCourse(courseData: CourseFormData) {
    const { data, error } = await supabase
      .from('courses')
      .insert(courseData)
      .select()
      .single();

    if (error) {
      throw new Error(`创建课程失败: ${error.message}`);
    }

    return data;
  }

  /**
   * 更新课程
   */
  static async updateCourse(id: string, courseData: Partial<Course>) {
    const { data, error } = await supabase
      .from('courses')
      .update({ ...courseData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`更新课程失败: ${error.message}`);
    }

    return data;
  }

  /**
   * 删除课程
   */
  static async deleteCourse(id: string) {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`删除课程失败: ${error.message}`);
    }
  }

  /**
   * 获取课程统计
   */
  static async getCourseStats() {
    const { data, error } = await supabase
      .from('courses')
      .select('is_active');

    if (error) {
      throw new Error(`获取课程统计失败: ${error.message}`);
    }

    const stats = {
      total: data.length,
      active: data.filter((c: { is_active: boolean | null }) => c.is_active === true).length,
      inactive: data.filter((c: { is_active: boolean | null }) => c.is_active === false).length,
    };

    return stats;
  }
}

/**
 * 教师管理服务
 */
export class TeacherService {
  /**
   * 获取教师列表
   */
  static async getTeachers(params?: {
    search?: string;
    status?: string;
    specialty?: string;
    page?: number;
    limit?: number;
  }) {
    let query = supabase
      .from('teachers')
      .select('*');

    // 搜索过滤
    if (params?.search) {
      query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }

    // 状态过滤
    if (params?.status && params.status !== 'all') {
      query = query.eq('is_active', params.status === 'active');
    }

    // 专业过滤 - 暂时跳过，因为teaching_subjects是JSONB格式
    // if (params?.specialty && params.specialty !== 'all') {
    //   query = query.contains('teaching_subjects', [params.specialty]);
    // }

    // 分页
    if (params?.page && params?.limit) {
      const from = (params.page - 1) * params.limit;
      const to = from + params.limit - 1;
      query = query.range(from, to);
    }

    // 排序
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`获取教师列表失败: ${error.message}`);
    }

    return { data, count };
  }

  /**
   * 创建教师
   */
  static async createTeacher(teacherData: Omit<Teacher, 'id' | 'created_at' | 'updated_at'>) {
    // 验证新字段数据
    this.validateTeacherData(teacherData);

    const { data, error } = await supabase
      .from('teachers')
      .insert(teacherData)
      .select()
      .single();

    if (error) {
      throw new Error(`创建教师失败: ${error.message}`);
    }

    return data;
  }

  /**
   * 更新教师
   */
  static async updateTeacher(id: string, teacherData: Partial<Teacher>) {
    // 验证新字段数据（如果存在）
    this.validateTeacherData(teacherData);

    const { data, error } = await supabase
      .from('teachers')
      .update({ ...teacherData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`更新教师失败: ${error.message}`);
    }

    return data;
  }

  /**
   * 删除教师
   */
  static async deleteTeacher(id: string) {
    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`删除教师失败: ${error.message}`);
    }
  }

  /**
   * 上传教师头像
   */
  static async uploadAvatar(file: File, teacherId?: string): Promise<string> {
    try {
      // 生成唯一文件名
      const fileExt = file.name.split('.').pop();
      const fileName = `${teacherId || Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // 上传文件到存储桶
      const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

      if (uploadError) {
        throw new Error(`头像上传失败: ${uploadError.message}`);
      }

      // 获取公共URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: unknown) {
      throw new Error(`头像上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 验证教师数据
   * @param teacherData - 教师数据
   * @returns 验证结果
   */
  private static validateTeacherData(teacherData: Partial<Teacher>): ValidationResult {
    const errors: string[] = [];

    // 验证必填字段
    if (!teacherData.name?.trim()) {
      errors.push('教师姓名不能为空');
    }

    // 验证描述
    if (teacherData.description && typeof teacherData.description !== 'string') {
      errors.push('描述格式不正确');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * 案例管理服务
 */
export class CaseService {
  /**
   * 获取案例列表
   */
  static async getCases(params?: {
    search?: string;
    category?: string;
    status?: string;
    difficulty?: string;
    page?: number;
    limit?: number;
  }) {
    let query = supabase
      .from('student_cases')
      .select('*');

    // 搜索过滤
    if (params?.search) {
      query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }

    // 分类过滤
    if (params?.category && params.category !== 'all') {
      query = query.eq('category', params.category);
    }

    // 状态过滤
    if (params?.status && params.status !== 'all') {
      query = query.eq('status', params.status);
    }

    // 难度过滤
    if (params?.difficulty && params.difficulty !== 'all') {
      query = query.eq('difficulty', params.difficulty);
    }

    // 分页
    if (params?.page && params?.limit) {
      const from = (params.page - 1) * params.limit;
      const to = from + params.limit - 1;
      query = query.range(from, to);
    }

    // 排序
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`获取案例列表失败: ${error.message}`);
    }

    return { data, count };
  }

  /**
   * 创建案例
   */
  static async createCase(caseData: Omit<Case, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('student_cases')
      .insert(caseData)
      .select()
      .single();

    if (error) {
      throw new Error(`创建案例失败: ${error.message}`);
    }

    return data;
  }

  /**
   * 更新案例
   */
  static async updateCase(id: string, caseData: Partial<Case>) {
    const { data, error } = await supabase
      .from('student_cases')
      .update({ ...caseData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`更新案例失败: ${error.message}`);
    }

    return data;
  }

  /**
   * 删除案例
   */
  static async deleteCase(id: string) {
    const { error } = await supabase
      .from('student_cases')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`删除案例失败: ${error.message}`);
    }
  }

  /**
   * 上传案例图片
   */
  static async uploadImage(file: File): Promise<string> {
    try {
      // 生成文件名
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `cases/${fileName}`;

      // 上传文件到 Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`文件上传失败: ${uploadError.message}`);
      }

      // 获取公共URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error: unknown) {
      console.error('上传案例图片失败:', error);
      throw error;
    }
  }
}

/**
 * 文章管理服务
 */
export class ArticleService {
  /**
   * 获取文章列表
   */
  static async getArticles(params?: {
    search?: string;
    category?: string;
    status?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
  }) {
    let query = supabase
      .from('articles')
      .select('*');

    // 搜索过滤
    if (params?.search) {
      query = query.or(`title.ilike.%${params.search}%,excerpt.ilike.%${params.search}%`);
    }

    // 分类过滤
    if (params?.category && params.category !== 'all') {
      query = query.eq('category', params.category);
    }

    // 状态过滤
    if (params?.status && params.status !== 'all') {
      query = query.eq('status', params.status);
    }

    // 精选过滤
    if (params?.featured) {
      query = query.eq('is_featured', true);
    }

    // 分页
    if (params?.page && params?.limit) {
      const from = (params.page - 1) * params.limit;
      const to = from + params.limit - 1;
      query = query.range(from, to);
    }

    // 排序
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`获取文章列表失败: ${error.message}`);
    }

    return { data, count };
  }

  /**
   * 创建文章
   */
  static async createArticle(articleData: Omit<Article, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('articles')
      .insert(articleData)
      .select()
      .single();

    if (error) {
      throw new Error(`创建文章失败: ${error.message}`);
    }

    return data;
  }

  /**
   * 更新文章
   */
  static async updateArticle(id: string, articleData: Partial<Article>) {
    const { data, error } = await supabase
      .from('articles')
      .update({ ...articleData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`更新文章失败: ${error.message}`);
    }

    return data;
  }

  /**
   * 删除文章
   */
  static async deleteArticle(id: string) {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`删除文章失败: ${error.message}`);
    }
  }
}

/**
 * 媒体管理服务
 */
export class MediaService {
  /**
   * 获取媒体文件列表
   */
  static async getMediaFiles(params?: {
    search?: string;
    fileType?: string;
    folder?: string;
    page?: number;
    limit?: number;
  }) {
    let query = supabase
      .from('media_files')
      .select('*');

    // 搜索过滤
    if (params?.search) {
      query = query.or(`filename.ilike.%${params.search}%,original_name.ilike.%${params.search}%`);
    }

    // 文件类型过滤
    if (params?.fileType && params.fileType !== 'all') {
      query = query.eq('file_type', params.fileType);
    }

    // 文件夹过滤
    if (params?.folder && params.folder !== 'all') {
      query = query.eq('folder_path', params.folder);
    }

    // 分页
    if (params?.page && params?.limit) {
      const from = (params.page - 1) * params.limit;
      const to = from + params.limit - 1;
      query = query.range(from, to);
    }

    // 排序
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`获取媒体文件列表失败: ${error.message}`);
    }

    return { data, count };
  }

  /**
   * 上传媒体文件
   */
  static async uploadFile(file: File, folder: string = 'uploads') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // 上传文件到存储桶
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`文件上传失败: ${uploadError.message}`);
    }

    // 获取文件URL (如果需要可以使用)
    // const { data: { publicUrl } } = supabase.storage
    //   .from('media')
    //   .getPublicUrl(filePath);

    // 保存文件信息到数据库
    const mediaData = {
      filename: fileName,
      file_path: filePath,
      file_type: this.getFileType(file.type),
      file_size: file.size,
    };

    const { data, error } = await supabase
      .from('media_files')
      .insert(mediaData)
      .select()
      .single();

    if (error) {
      throw new Error(`保存文件信息失败: ${error.message}`);
    }

    return data;
  }

  /**
   * 删除媒体文件
   */
  static async deleteFile(id: string) {
    // 先获取文件信息
    const { data: fileData, error: fetchError } = await supabase
      .from('media_files')
      .select('file_path, filename')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`获取文件信息失败: ${fetchError.message}`);
    }

    // 从存储桶删除文件
    const filePath = fileData.file_path;
    const { error: deleteError } = await supabase.storage
      .from('media')
      .remove([filePath]);

    if (deleteError) {
      throw new Error(`删除文件失败: ${deleteError.message}`);
    }

    // 从数据库删除记录
    const { error } = await supabase
      .from('media_files')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`删除文件记录失败: ${error.message}`);
    }
  }

  /**
   * 获取文件类型
   */
  private static getFileType(mimeType: string): 'image' | 'video' | 'audio' | 'document' | 'other' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
      return 'document';
    }
    return 'other';
  }
}

/**
 * 页面配置管理服务
 */
export class PageConfigService {
  /**
   * 获取页面配置列表
   */
  static async getPageConfigs() {
    const { data, error } = await supabase
      .from('page_configs')
      .select('*')
      .order('page_name');

    if (error) {
      throw new Error(`获取页面配置失败: ${error.message}`);
    }

    return data;
  }

  /**
   * 获取单个页面配置
   */
  static async getPageConfig(key: string) {
    const { data, error } = await supabase
      .from('page_configs')
      .select('*')
      .eq('page_key', key)
      .single();

    if (error) {
      throw new Error(`获取页面配置失败: ${error.message}`);
    }

    return data;
  }

  /**
   * 更新页面配置
   */
  static async updatePageConfig(id: string, configData: Partial<PageConfig>) {
    const { data, error } = await supabase
      .from('page_configs')
      .update({ ...configData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`更新页面配置失败: ${error.message}`);
    }

    return data;
  }
}