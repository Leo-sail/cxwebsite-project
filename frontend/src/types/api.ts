/**
 * API相关类型定义
 */
import type { BaseEntity } from './common';

// 课程相关类型 - 匹配数据库结构
export interface Course extends BaseEntity {
  name: string;
  description?: string;
  image_url?: string;
  category: string;
  sort_order: number;
  is_active: boolean;
}

// 课程表单数据类型
export interface CourseFormData {
  name: string;
  description?: string;
  image_url?: string;
  category: string;
  sort_order: number;
  is_active: boolean;
}

// 旧的Course接口保留用于兼容性
export interface LegacyCourse extends BaseEntity {
  title: string;
  description: string;
  content: string;
  cover_image?: string;
  price: number;
  original_price?: number;
  duration: number; // 课程时长（分钟）
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  teacher_id: string;
  teacher?: Teacher;
  enrollment_count: number;
  rating: number;
  rating_count: number;
  is_featured: boolean;
  sort_order: number;
}

// 课程创建/更新请求
export interface CourseRequest {
  title: string;
  description: string;
  content: string;
  cover_image?: string;
  price: number;
  original_price?: number;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  teacher_id: string;
  is_featured?: boolean;
  sort_order?: number;
}

// 教育背景接口
export interface EducationBackground {
  id: string;
  degree: string; // 学位
  major: string; // 专业
  school: string; // 学校
  start_year: number; // 开始年份
  end_year?: number; // 结束年份，可选（在读时为空）
  description?: string; // 描述
}

// 教学科目接口
export interface TeachingSubject {
  id: string;
  subject_name: string; // 科目名称
  level: string; // 教学水平
  years_of_experience: number; // 教学年限
  specialization?: string; // 专业方向
  description?: string; // 描述
}

// 成就荣誉接口
export interface Achievement {
  id: string;
  title: string; // 奖项标题
  type: string; // 成就类型
  date_received: string; // 获奖日期
  issuing_organization: string; // 颁发机构
  description?: string; // 描述
  certificate_url?: string; // 证书链接
  [key: string]: any; // 索引签名
}

// 教师相关类型
export interface Teacher extends BaseEntity {
  name: string;
  bio: string;
  avatar?: string;
  email: string;
  phone?: string;
  specialties: string[];
  experience_years: number;
  education: string;
  certifications: string[];
  social_links: {
    website?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
  rating: number;
  rating_count: number;
  course_count: number;
  student_count: number;
  is_featured: boolean;
  status: 'active' | 'inactive';
  sort_order: number;
  // 新增字段
  education_background?: EducationBackground[];
  teaching_subjects?: TeachingSubject[];
  achievements?: Achievement[];
}

// 教师创建/更新请求
export interface TeacherRequest {
  name: string;
  bio: string;
  avatar?: string;
  email: string;
  phone?: string;
  specialties: string[];
  experience_years: number;
  education: string;
  certifications: string[];
  social_links: {
    website?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
  is_featured?: boolean;
  status?: 'active' | 'inactive';
  sort_order?: number;
  // 新增字段
  education_background?: EducationBackground[];
  teaching_subjects?: TeachingSubject[];
  achievements?: Achievement[];
}

// 学员案例相关类型
export interface StudentCase extends BaseEntity {
  title: string;
  description: string;
  content: string;
  cover_image?: string;
  images: string[];
  student_name: string;
  student_avatar?: string;
  course_id?: string;
  course?: Course;
  teacher_id?: string;
  teacher?: Teacher;
  category: string;
  tags: string[];
  technologies: string[];
  project_url?: string;
  github_url?: string;
  completion_date: string;
  status: 'draft' | 'published' | 'featured' | 'archived';
  views: number;
  likes: number;
  sort_order: number;
}

// 学员案例创建/更新请求
export interface StudentCaseRequest {
  title: string;
  description: string;
  content: string;
  cover_image?: string;
  images: string[];
  student_name: string;
  student_avatar?: string;
  course_id?: string;
  teacher_id?: string;
  category: string;
  tags: string[];
  technologies: string[];
  project_url?: string;
  github_url?: string;
  completion_date: string;
  status: 'draft' | 'published' | 'featured' | 'archived';
  sort_order?: number;
}

// 文章相关类型
export interface Article extends BaseEntity {
  title: string;
  summary: string;
  content: string;
  cover_image?: string;
  author_id: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  views: number;
  likes: number;
  comments_count: number;
  reading_time: number; // 预估阅读时间（分钟）
  published_at?: string;
  sort_order: number;
}

// 文章创建/更新请求
export interface ArticleRequest {
  title: string;
  summary: string;
  content: string;
  cover_image?: string;
  author_id: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  is_featured?: boolean;
  published_at?: string;
  sort_order?: number;
}

// 页面配置相关类型
export interface PageConfig extends BaseEntity {
  page_key: string; // 页面标识符
  page_name: string; // 页面名称
  config_data: {
    seo?: {
      title?: string;
      description?: string;
      keywords?: string[];
    };
    hero?: {
      title?: string;
      subtitle?: string;
      background_image?: string;
      cta_text?: string;
      cta_link?: string;
    };
    sections?: Array<{
      id: string;
      type: string;
      title?: string;
      content?: unknown;
      visible: boolean;
      sort_order: number;
    }>;
    [key: string]: unknown;
  };
  is_active: boolean;
  version: number;
}

// 页面配置创建/更新请求
export interface PageConfigRequest {
  page_key: string;
  page_name: string;
  config_data: {
    seo?: {
      title?: string;
      description?: string;
      keywords?: string[];
    };
    hero?: {
      title?: string;
      subtitle?: string;
      background_image?: string;
      cta_text?: string;
      cta_link?: string;
    };
    sections?: Array<{
      id: string;
      type: string;
      title?: string;
      content?: unknown;
      visible: boolean;
      sort_order: number;
    }>;
    [key: string]: unknown;
  };
  is_active?: boolean;
}

// 媒体文件相关类型
export interface MediaFile extends BaseEntity {
  filename: string;
  original_name: string;
  file_path: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  file_type: 'image' | 'video' | 'audio' | 'document' | 'other';
  width?: number;
  height?: number;
  duration?: number; // 视频/音频时长（秒）
  alt_text?: string;
  description?: string;
  tags: string[];
  folder_path?: string;
  is_public: boolean;
  uploaded_by: string;
  uploader?: {
    id: string;
    name: string;
  };
}

// 媒体文件上传请求
export interface MediaUploadRequest {
  file: File;
  alt_text?: string;
  description?: string;
  tags?: string[];
  folder_path?: string;
  is_public?: boolean;
}

// 媒体文件更新请求
export interface MediaUpdateRequest {
  alt_text?: string;
  description?: string;
  tags?: string[];
  folder_path?: string;
  is_public?: boolean;
}

// 认证相关类型
export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    role: 'admin' | 'user';
  };
  expires_in: number;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  expires_in: number;
}

// 统计数据类型
export interface DashboardStats {
  courses: {
    total: number;
    published: number;
    draft: number;
    growth: number;
  };
  teachers: {
    total: number;
    active: number;
    growth: number;
  };
  students: {
    total: number;
    active: number;
    growth: number;
  };
  articles: {
    total: number;
    published: number;
    views: number;
    growth: number;
  };
}

// 搜索建议类型
export interface SearchSuggestion {
  type: 'course' | 'teacher' | 'article' | 'case';
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  url: string;
}

// 评论类型
export interface Comment extends BaseEntity {
  content: string;
  author_name: string;
  author_email: string;
  author_avatar?: string;
  target_type: 'course' | 'article' | 'case';
  target_id: string;
  parent_id?: string;
  replies?: Comment[];
  status: 'pending' | 'approved' | 'rejected';
  likes: number;
}

// 评论创建请求
export interface CommentRequest {
  content: string;
  author_name: string;
  author_email: string;
  target_type: 'course' | 'article' | 'case';
  target_id: string;
  parent_id?: string;
}

// 评分类型
export interface Rating extends BaseEntity {
  rating: number; // 1-5星
  comment?: string;
  author_name: string;
  author_email: string;
  target_type: 'course' | 'teacher';
  target_id: string;
  status: 'pending' | 'approved' | 'rejected';
}

// 评分创建请求
export interface RatingRequest {
  rating: number;
  comment?: string;
  author_name: string;
  author_email: string;
  target_type: 'course' | 'teacher';
  target_id: string;
}

// 组件文字内容相关类型
export interface ComponentText extends BaseEntity {
  key: string;
  area: string | null;
  content: string;
  description: string | null;
}

// 组件文字内容表单数据类型
export interface ComponentTextFormData {
  key: string;
  area?: string | null;
  content: string;
  description?: string | null;
}

// 组件文字内容创建/更新请求
export interface ComponentTextRequest {
  key: string;
  area?: string | null;
  content: string;
  description?: string | null;
}