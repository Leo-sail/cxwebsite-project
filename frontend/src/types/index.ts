/**
 * 类型定义导出文件
 */

// 导出通用类型
export * from './common';

// 导出API类型（排除与数据库重复的类型）
export type {
  CourseRequest,
  TeacherRequest,
  StudentCaseRequest,
  ArticleRequest,
  MediaUploadRequest,
  MediaUpdateRequest,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  DashboardStats,
  SearchSuggestion,
  Comment,
  CommentRequest,
  Rating,
  RatingRequest,
  ComponentText,
  ComponentTextFormData,
  ComponentTextRequest
} from './api';

// 导出数据库类型
export type {
  Database,
  Course,
  CourseInsert,
  CourseUpdate,
  Teacher,
  TeacherInsert,
  TeacherUpdate,
  StudentCase,
  StudentCaseInsert,
  StudentCaseUpdate,
  Article,
  ArticleInsert,
  ArticleUpdate,
  MediaFile,
  MediaFileInsert,
  MediaFileUpdate,
  PageConfig,
  PageConfigInsert,
  PageConfigUpdate,
  AdminUser,
  AdminUserInsert,
  AdminUserUpdate,
  UIConfig as DatabaseThemeConfig,
  UIConfigInsert as ThemeConfigInsert,
  UIConfigUpdate as ThemeConfigUpdate
} from './database';

// 导入数据库类型用于类型别名
import type {
  Course as DatabaseCourse,
  Teacher as DatabaseTeacher,
  StudentCase as DatabaseStudentCase,
  Article as DatabaseArticle,
  PageConfig as DatabasePageConfig,
  MediaFile as DatabaseMediaFile
} from './database';

// 导入API类型用于表单数据
// 直接从api.ts导出这些类型
export type {
  EducationBackground,
  TeachingSubject,
  Achievement
} from './api';

// 从api模块导出基础类型，避免重复定义
export type {
  Course as ApiCourse,
  Teacher as ApiTeacher,
  StudentCase as ApiStudentCase,
  Article as ApiArticle,
  PageConfig as ApiPageConfig,
  MediaFile as ApiMediaFile
} from './api';

/**
 * 表单数据类型
 */
export interface CourseFormData {
  name: string;
  description?: string;
  image_url?: string;
  category?: string;
  sort_order?: number;
  is_active?: boolean;
}

// 使用导入的类型定义表单数据接口
export interface TeacherFormData {
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
  education_background?: import('./api').EducationBackground[];
  teaching_subjects?: import('./api').TeachingSubject[];
  achievements?: import('./api').Achievement[];
}

export interface StudentCaseFormData {
  name: string;
  undergraduate_school?: string;
  admitted_school?: string;
  exam_score?: string;
  testimonial?: string;
  image_url?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface ArticleFormData {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  featured_image: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  featured: boolean;
  author_id: string;
  views: number;
}

/**
 * 路由类型
 */
export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  title?: string;
  requireAuth?: boolean;
}

/**
 * 状态管理类型
 */
export interface AppState {
  isLoading: boolean;
  error: string | null;
  user: unknown | null;
}

export interface AdminState {
  courses: DatabaseCourse[];
  teachers: DatabaseTeacher[];
  studentCases: DatabaseStudentCase[];
  articles: DatabaseArticle[];
  pageConfigs: DatabasePageConfig[];
  mediaFiles: DatabaseMediaFile[];
}