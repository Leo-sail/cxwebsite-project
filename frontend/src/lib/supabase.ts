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
  MEDIA_FILES: 'media_files',
  ADMIN_USERS: 'admin_users',
  CONTACT_SUBMISSIONS: 'contact_submissions',
  CONTACT_INFO: 'contact_info',
  UI_CONFIGS: 'ui_configs',
  COMPONENT_TEXT_STORAGE: 'component_text_storage'
} as const;