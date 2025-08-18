/**
 * 应用常量定义
 */

// API相关常量
export const API_ENDPOINTS = {
  // 课程相关
  COURSES: '/courses',
  COURSE_DETAIL: (id: string) => `/courses/${id}`,
  
  // 教师相关
  TEACHERS: '/teachers',
  TEACHER_DETAIL: (id: string) => `/teachers/${id}`,
  
  // 学员案例相关
  STUDENT_CASES: '/student-cases',
  STUDENT_CASE_DETAIL: (id: string) => `/student-cases/${id}`,
  
  // 文章相关
  ARTICLES: '/articles',
  ARTICLE_DETAIL: (id: string) => `/articles/${id}`,
  
  // 页面配置相关
  PAGE_CONFIGS: '/page-configs',
  PAGE_CONFIG_DETAIL: (id: string) => `/page-configs/${id}`,
  
  // 媒体文件相关
  MEDIA_FILES: '/media-files',
  MEDIA_FILE_DETAIL: (id: string) => `/media-files/${id}`,
  MEDIA_UPLOAD: '/media-files/upload',
  
  // 认证相关
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  PROFILE: '/auth/profile',
} as const;

// HTTP状态码
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// 本地存储键名
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
} as const;

// 分页配置
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

// 文件上传配置
export const FILE_UPLOAD = {
  // 图片文件
  IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  
  // 视频文件
  VIDEO_TYPES: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
  VIDEO_MAX_SIZE: 100 * 1024 * 1024, // 100MB
  
  // 文档文件
  DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  DOCUMENT_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  
  // 音频文件
  AUDIO_TYPES: ['audio/mp3', 'audio/wav', 'audio/ogg'],
  AUDIO_MAX_SIZE: 20 * 1024 * 1024, // 20MB
} as const;

// 表单验证规则
export const VALIDATION_RULES = {
  // 密码
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 50,
  
  // 用户名
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  
  // 邮箱
  EMAIL_MAX_LENGTH: 100,
  
  // 手机号
  PHONE_LENGTH: 11,
  
  // 标题
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 100,
  
  // 描述
  DESCRIPTION_MAX_LENGTH: 500,
  
  // 内容
  CONTENT_MAX_LENGTH: 10000,
} as const;

// 课程相关常量
export const COURSE = {
  LEVELS: [
    { value: 'beginner', label: '初级' },
    { value: 'intermediate', label: '中级' },
    { value: 'advanced', label: '高级' },
  ],
  
  CATEGORIES: [
    { value: 'programming', label: '编程开发' },
    { value: 'design', label: '设计创意' },
    { value: 'marketing', label: '市场营销' },
    { value: 'business', label: '商业管理' },
    { value: 'language', label: '语言学习' },
    { value: 'other', label: '其他' },
  ],
  
  STATUS: [
    { value: 'draft', label: '草稿' },
    { value: 'published', label: '已发布' },
    { value: 'archived', label: '已归档' },
  ],
} as const;

// 教师相关常量
export const TEACHER = {
  SPECIALTIES: [
    { value: 'frontend', label: '前端开发' },
    { value: 'backend', label: '后端开发' },
    { value: 'mobile', label: '移动开发' },
    { value: 'ai', label: '人工智能' },
    { value: 'data', label: '数据科学' },
    { value: 'design', label: '设计' },
    { value: 'product', label: '产品管理' },
    { value: 'other', label: '其他' },
  ],
  
  LEVELS: [
    { value: 'junior', label: '初级讲师' },
    { value: 'senior', label: '高级讲师' },
    { value: 'expert', label: '专家讲师' },
  ],
} as const;

// 文章相关常量
export const ARTICLE = {
  CATEGORIES: [
    { value: 'tech', label: '技术分享' },
    { value: 'industry', label: '行业资讯' },
    { value: 'tutorial', label: '教程指南' },
    { value: 'case', label: '案例分析' },
    { value: 'opinion', label: '观点评论' },
    { value: 'other', label: '其他' },
  ],
  
  STATUS: [
    { value: 'draft', label: '草稿' },
    { value: 'published', label: '已发布' },
    { value: 'archived', label: '已归档' },
  ],
} as const;

// 学员案例相关常量
export const STUDENT_CASE = {
  CATEGORIES: [
    { value: 'web', label: 'Web开发' },
    { value: 'mobile', label: '移动应用' },
    { value: 'ai', label: '人工智能' },
    { value: 'data', label: '数据分析' },
    { value: 'design', label: '设计作品' },
    { value: 'other', label: '其他' },
  ],
  
  STATUS: [
    { value: 'draft', label: '草稿' },
    { value: 'published', label: '已发布' },
    { value: 'featured', label: '精选' },
    { value: 'archived', label: '已归档' },
  ],
} as const;

// 媒体文件相关常量
export const MEDIA = {
  TYPES: [
    { value: 'image', label: '图片' },
    { value: 'video', label: '视频' },
    { value: 'audio', label: '音频' },
    { value: 'document', label: '文档' },
    { value: 'other', label: '其他' },
  ],
} as const;

// 主题配置
export const THEME = {
  COLORS: {
    PRIMARY: '#3B82F6',
    SECONDARY: '#6B7280',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
    INFO: '#06B6D4',
  },
  
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px',
  },
} as const;

// 动画配置
export const ANIMATION = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  
  EASING: {
    EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
    EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
    EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  SERVER_ERROR: '服务器错误，请稍后重试',
  UNAUTHORIZED: '登录已过期，请重新登录',
  FORBIDDEN: '没有权限访问此资源',
  NOT_FOUND: '请求的资源不存在',
  VALIDATION_ERROR: '数据验证失败',
  UPLOAD_ERROR: '文件上传失败',
  UNKNOWN_ERROR: '未知错误，请联系管理员',
} as const;

// 成功消息
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: '保存成功',
  UPDATE_SUCCESS: '更新成功',
  DELETE_SUCCESS: '删除成功',
  UPLOAD_SUCCESS: '上传成功',
  LOGIN_SUCCESS: '登录成功',
  LOGOUT_SUCCESS: '退出成功',
  COPY_SUCCESS: '复制成功',
} as const;