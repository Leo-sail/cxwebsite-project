/**
 * Supabase客户端配置
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Supabase客户端实例
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'x-my-custom-header': 'my-app-name'
    }
  }
});

/**
 * 数据库表名常量
 */
export const TABLES = {
  COURSES: 'courses',
  TEACHERS: 'teachers',
  STUDENT_CASES: 'student_cases',
  ARTICLES: 'articles',
  PAGE_CONFIGS: 'page_configs',
  MEDIA_FILES: 'media_files'
} as const;

/**
 * 存储桶名称常量
 */
export const STORAGE_BUCKETS = {
  IMAGES: 'images',
  VIDEOS: 'videos',
  DOCUMENTS: 'documents'
} as const;