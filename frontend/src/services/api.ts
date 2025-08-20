/**
 * API服务层
 */
import { supabase, TABLES } from '../lib/supabase';
import type {
  Course,
  Teacher,
  StudentCase,
  Article,
  PageConfig,
  MediaFile,
  ComponentText,
  CourseFormData,
  TeacherFormData,
  StudentCaseFormData,
  ArticleFormData,
  ComponentTextFormData
} from '../types';
import type {
  ComponentTextStorage,
  ComponentTextStorageInsert,
  ComponentTextStorageUpdate
} from '../types/database';
import type { Json, UIConfig, UIConfigInsert, UIConfigUpdate } from '../types/database';


/**
 * 通用错误处理
 */
function handleError(error: unknown): never {
  console.error('API Error:', error);
  const message = error instanceof Error ? error.message : '操作失败，请稍后重试';
  throw new Error(message);
}

/**
 * 课程相关API
 */
export const courseApi = {
  /**
   * 获取所有课程
   */
  async getAll(): Promise<Course[]> {
    const { data, error } = await supabase
      .from(TABLES.COURSES)
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) handleError(error);
    return data || [];
  },

  /**
   * 根据ID获取课程
   */
  async getById(id: string): Promise<Course | null> {
    const { data, error } = await supabase
      .from(TABLES.COURSES)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) handleError(error);
    return data;
  },

  /**
   * 创建课程
   */
  async create(courseData: CourseFormData): Promise<Course> {
    const { data, error } = await supabase
      .from(TABLES.COURSES)
      .insert(courseData)
      .select()
      .single();
    
    if (error) handleError(error);
    return data;
  },

  /**
   * 更新课程
   */
  async update(id: string, courseData: Partial<CourseFormData>): Promise<Course> {
    const { data, error } = await supabase
      .from(TABLES.COURSES)
      .update(courseData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleError(error);
    return data;
  },

  /**
   * 删除课程
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.COURSES)
      .delete()
      .eq('id', id);
    
    if (error) handleError(error);
  },

  /**
   * 获取管理员课程列表（包含非活跃课程）
   */
  async getAllForAdmin(): Promise<Course[]> {
    const { data, error } = await supabase
      .from(TABLES.COURSES)
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) handleError(error);
    return data || [];
  }
};

/**
 * 统计数据相关API
 */
export const statsApi = {
  /**
   * 获取仪表盘统计数据
   */
  async getDashboardStats() {
    try {
      // 并行获取各种统计数据 - 使用更简单的计数查询
      const [coursesResult, teachersResult, casesResult, articlesResult] = await Promise.all([
        supabase.from(TABLES.COURSES).select('*', { count: 'exact', head: true }),
        supabase.from(TABLES.TEACHERS).select('*', { count: 'exact', head: true }),
        supabase.from(TABLES.STUDENT_CASES).select('*', { count: 'exact', head: true }),
        supabase.from(TABLES.ARTICLES).select('*', { count: 'exact', head: true })
      ]);

      // 检查错误
      if (coursesResult.error) throw coursesResult.error;
      if (teachersResult.error) throw teachersResult.error;
      if (casesResult.error) throw casesResult.error;
      if (articlesResult.error) throw articlesResult.error;

      return {
        courses: coursesResult.count || 0,
        teachers: teachersResult.count || 0,
        studentCases: casesResult.count || 0,
        articles: articlesResult.count || 0
      };
    } catch (error) {
      handleError(error);
    }
  },

  /**
   * 获取最近活动数据
   */
  async getRecentActivities(limit: number = 10) {
    try {
      // 获取最近更新的各类数据
      const [courses, teachers, cases, articles] = await Promise.all([
        supabase
          .from(TABLES.COURSES)
          .select('id, name, created_at, updated_at')
          .order('updated_at', { ascending: false })
          .limit(3),
        supabase
          .from(TABLES.TEACHERS)
          .select('id, name, created_at, updated_at')
          .order('updated_at', { ascending: false })
          .limit(3),
        supabase
          .from(TABLES.STUDENT_CASES)
          .select('id, name, created_at, updated_at')
          .order('updated_at', { ascending: false })
          .limit(3),
        supabase
          .from(TABLES.ARTICLES)
          .select('id, title, created_at, updated_at')
          .order('updated_at', { ascending: false })
          .limit(3)
      ]);

      const activities: Array<{
        id: string;
        type: string;
        title: string;
        description: string;
        time: string | null;
      }> = [];

      // 处理课程数据
      courses.data?.forEach(course => {
        activities.push({
          id: `course-${course.id}`,
          type: 'course',
          title: '课程更新',
          description: `${course.name}`,
          time: course.updated_at
        });
      });

      // 处理教师数据
      teachers.data?.forEach(teacher => {
        activities.push({
          id: `teacher-${teacher.id}`,
          type: 'teacher',
          title: '教师信息',
          description: `${teacher.name}`,
          time: teacher.updated_at
        });
      });

      // 处理学员案例数据
      cases.data?.forEach(case_ => {
        activities.push({
          id: `case-${case_.id}`,
          type: 'case',
          title: '学员案例',
          description: `${case_.name}`,
          time: case_.updated_at
        });
      });

      // 处理文章数据
      articles.data?.forEach(article => {
        activities.push({
          id: `article-${article.id}`,
          type: 'article',
          title: '文章更新',
          description: `${article.title}`,
          time: article.updated_at
        });
      });

      // 按时间排序并限制数量
       return activities
         .filter(activity => activity.time) // 过滤掉时间为null的记录
         .sort((a, b) => new Date(b.time!).getTime() - new Date(a.time!).getTime())
         .slice(0, limit)
         .map(activity => ({
           ...activity,
           time: statsApi.formatRelativeTime(activity.time!)
         }));
    } catch (error) {
      handleError(error);
    }
  },

  /**
   * 格式化相对时间
   */
  formatRelativeTime(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return '刚刚';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}分钟前`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}小时前`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  }
};

/**
 * 教师相关API
 */
export const teacherApi = {
  /**
   * 获取所有教师
   */
  async getAll(): Promise<Teacher[]> {
    const { data, error } = await supabase
      .from(TABLES.TEACHERS)
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) handleError(error);
    return data || [];
  },

  /**
   * 根据ID获取教师
   */
  async getById(id: string): Promise<Teacher | null> {
    const { data, error } = await supabase
      .from(TABLES.TEACHERS)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) handleError(error);
    return data;
  },

  /**
   * 创建教师
   */
  async create(teacherData: TeacherFormData): Promise<Teacher> {
    // 转换数据类型以匹配数据库期望的Json格式
    const dbData = {
      ...teacherData,
      education_background: teacherData.education_background as unknown as Json,
      teaching_subjects: teacherData.teaching_subjects as unknown as Json,
      achievements: teacherData.achievements as unknown as Json,
    };
    
    const { data, error } = await supabase
      .from(TABLES.TEACHERS)
      .insert(dbData)
      .select()
      .single();
    
    if (error) handleError(error);
    return data;
  },

  /**
   * 更新教师
   */
  async update(id: string, teacherData: Partial<TeacherFormData>): Promise<Teacher> {
    // 转换数据类型以匹配数据库期望的Json格式
    const dbData: any = {
      ...teacherData,
      ...(teacherData.education_background && {
        education_background: teacherData.education_background as unknown as Json
      }),
      ...(teacherData.teaching_subjects && {
        teaching_subjects: teacherData.teaching_subjects as unknown as Json
      }),
      ...(teacherData.achievements && {
        achievements: teacherData.achievements as unknown as Json
      }),
    };
    
    const { data, error } = await supabase
      .from(TABLES.TEACHERS)
      .update(dbData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleError(error);
    return data;
  },

  /**
   * 删除教师
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.TEACHERS)
      .delete()
      .eq('id', id);
    
    if (error) handleError(error);
  },

  /**
   * 获取管理员教师列表（包含非活跃教师）
   */
  async getAllForAdmin(): Promise<Teacher[]> {
    const { data, error } = await supabase
      .from(TABLES.TEACHERS)
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) handleError(error);
    return data || [];
  }
};

/**
 * 学员案例相关API
 */
export const studentCaseApi = {
  /**
   * 获取所有学员案例
   */
  async getAll(): Promise<StudentCase[]> {
    const { data, error } = await supabase
      .from(TABLES.STUDENT_CASES)
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) handleError(error);
    return data || [];
  },

  /**
   * 根据ID获取学员案例
   */
  async getById(id: string): Promise<StudentCase | null> {
    const { data, error } = await supabase
      .from(TABLES.STUDENT_CASES)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) handleError(error);
    return data;
  },

  /**
   * 创建学员案例
   */
  async create(caseData: StudentCaseFormData): Promise<StudentCase> {
    const { data, error } = await supabase
      .from(TABLES.STUDENT_CASES)
      .insert(caseData)
      .select()
      .single();
    
    if (error) handleError(error);
    return data;
  },

  /**
   * 更新学员案例
   */
  async update(id: string, caseData: Partial<StudentCaseFormData>): Promise<StudentCase> {
    const { data, error } = await supabase
      .from(TABLES.STUDENT_CASES)
      .update(caseData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleError(error);
    return data;
  },

  /**
   * 删除学员案例
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.STUDENT_CASES)
      .delete()
      .eq('id', id);
    
    if (error) handleError(error);
  },

  /**
   * 获取管理员学员案例列表（包含非活跃案例）
   */
  async getAllForAdmin(): Promise<StudentCase[]> {
    const { data, error } = await supabase
      .from(TABLES.STUDENT_CASES)
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) handleError(error);
    return data || [];
  }
};

/**
 * 文章相关API
 */
export const articleApi = {
  /**
   * 获取所有文章
   */
  async getAll(category?: string): Promise<Article[]> {
    let query = supabase
      .from(TABLES.ARTICLES)
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) handleError(error);
    return data || [];
  },

  /**
   * 获取精选文章
   */
  async getFeatured(): Promise<Article[]> {
    const { data, error } = await supabase
      .from(TABLES.ARTICLES)
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false });
    
    if (error) handleError(error);
    return data || [];
  },

  /**
   * 根据ID获取文章
   */
  async getById(id: string): Promise<Article | null> {
    const { data, error } = await supabase
      .from(TABLES.ARTICLES)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) handleError(error);
    return data;
  },

  /**
   * 创建文章
   */
  async create(articleData: ArticleFormData): Promise<Article> {
    const { data, error } = await supabase
      .from(TABLES.ARTICLES)
      .insert(articleData)
      .select()
      .single();
    
    if (error) handleError(error);
    return data;
  },

  /**
   * 更新文章
   */
  async update(id: string, articleData: Partial<ArticleFormData>): Promise<Article> {
    const { data, error } = await supabase
      .from(TABLES.ARTICLES)
      .update(articleData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleError(error);
    return data;
  },

  /**
   * 删除文章
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.ARTICLES)
      .delete()
      .eq('id', id);
    
    if (error) handleError(error);
  },

  /**
   * 获取管理员文章列表（包含非活跃文章）
   */
  async getAllForAdmin(): Promise<Article[]> {
    const { data, error } = await supabase
      .from(TABLES.ARTICLES)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) handleError(error);
    return data || [];
  }
};

/**
 * 页面配置相关API
 */
export const pageConfigApi = {
  /**
   * 获取页面配置
   */
  async getByPageName(pageName: string): Promise<PageConfig | null> {
    const { data, error } = await supabase
      .from(TABLES.PAGE_CONFIGS)
      .select('*')
      .eq('page_name', pageName)
      .single();
    
    if (error && error.code !== 'PGRST116') handleError(error);
    return data;
  },

  /**
   * 获取所有页面配置
   */
  async getAll(): Promise<PageConfig[]> {
    const { data, error } = await supabase
      .from(TABLES.PAGE_CONFIGS)
      .select('*')
      .order('page_name', { ascending: true });
    
    if (error) handleError(error);
    return data || [];
  },

  /**
   * 更新页面配置
   */
  async upsert(pageName: string, configData: Json): Promise<PageConfig> {
    const { data, error } = await supabase
      .from(TABLES.PAGE_CONFIGS)
      .upsert(
        { page_name: pageName, config_data: configData },
        { onConflict: 'page_name' }
      )
      .select()
      .single();
    
    if (error) handleError(error);
    return data;
  }
};

/**
 * 媒体文件相关API
 */
export const mediaFileApi = {
  /**
   * 获取所有媒体文件
   */
  async getAll(): Promise<MediaFile[]> {
    const { data, error } = await supabase
      .from(TABLES.MEDIA_FILES)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) handleError(error);
    return data || [];
  },

  /**
   * 根据ID获取媒体文件
   */
  async getById(id: string): Promise<MediaFile | null> {
    const { data, error } = await supabase
      .from(TABLES.MEDIA_FILES)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) handleError(error);
    return data;
  },

  /**
   * 创建媒体文件记录
   */
  async create(fileData: Omit<MediaFile, 'id' | 'created_at'>): Promise<MediaFile> {
    const { data, error } = await supabase
      .from(TABLES.MEDIA_FILES)
      .insert(fileData)
      .select()
      .single();
    
    if (error) handleError(error);
    return data;
  },

  /**
   * 删除媒体文件
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.MEDIA_FILES)
      .delete()
      .eq('id', id);
    
    if (error) handleError(error);
  }
};

/**
 * UI配置API
 */
export const uiConfigApi = {
  /**
   * 获取所有UI配置
   */
  async getAll(): Promise<UIConfig[]> {
    const { data, error } = await supabase
      .from(TABLES.UI_CONFIGS)
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) handleError(error);
    return data || [];
  },

  /**
   * 根据配置键获取UI配置
   */
  async getByConfigKey(configKey: string): Promise<UIConfig | null> {
    const { data, error } = await supabase
      .from(TABLES.UI_CONFIGS)
      .select('*')
      .eq('config_key', configKey)
      .eq('is_active', true)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // 未找到记录
      handleError(error);
    }
    return data;
  },

  /**
   * 根据组件类型获取UI配置
   */
  async getByComponentType(componentType: string): Promise<UIConfig[]> {
    const { data, error } = await supabase
      .from(TABLES.UI_CONFIGS)
      .select('*')
      .eq('component_type', componentType)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) handleError(error);
    return data || [];
  },

  /**
   * 根据页面范围获取UI配置
   */
  async getByPageScope(pageScope: string): Promise<UIConfig[]> {
    const { data, error } = await supabase
      .from(TABLES.UI_CONFIGS)
      .select('*')
      .contains('page_scope', [pageScope])
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) handleError(error);
    return data || [];
  },

  /**
   * 创建UI配置
   */
  async create(configData: UIConfigInsert): Promise<UIConfig> {
    const { data, error } = await supabase
      .from(TABLES.UI_CONFIGS)
      .insert(configData)
      .select()
      .single();
    
    if (error) handleError(error);
    return data;
  },

  /**
   * 更新UI配置
   */
  async update(id: string, configData: UIConfigUpdate): Promise<UIConfig> {
    const { data, error } = await supabase
      .from(TABLES.UI_CONFIGS)
      .update(configData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleError(error);
    return data;
  },

  /**
   * 根据配置键更新UI配置
   */
  async updateByConfigKey(configKey: string, configData: UIConfigUpdate): Promise<UIConfig> {
    const { data, error } = await supabase
      .from(TABLES.UI_CONFIGS)
      .update(configData)
      .eq('config_key', configKey)
      .select()
      .single();
    
    if (error) handleError(error);
    return data;
  },

  /**
   * 删除UI配置
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.UI_CONFIGS)
      .delete()
      .eq('id', id);
    
    if (error) handleError(error);
  },

  /**
   * 批量更新UI配置
   */
  async batchUpdate(configs: Array<{ id: string; data: UIConfigUpdate }>): Promise<UIConfig[]> {
    const promises = configs.map(({ id, data }) => 
      supabase
        .from(TABLES.UI_CONFIGS)
        .update(data)
        .eq('id', id)
        .select()
        .single()
    );
    
    const results = await Promise.all(promises);
    
    // 检查是否有错误
    for (const result of results) {
      if (result.error) handleError(result.error);
    }
    
    return results.map(result => result.data).filter(Boolean) as UIConfig[];
  }
};

/**
 * 组件文字内容API
 */
export const componentTextApi = {
  /**
   * 获取所有组件文字内容
   */
  async getAll(): Promise<ComponentText[]> {
    const { data, error } = await supabase
      .from(TABLES.COMPONENT_TEXT_STORAGE)
      .select('*')
      .order('key', { ascending: true });

    if (error) handleError(error);
    return data || [];
  },

  /**
   * 根据ID获取组件文字内容
   */
  async getById(id: string): Promise<ComponentText | null> {
    const { data, error } = await supabase
      .from(TABLES.COMPONENT_TEXT_STORAGE)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      handleError(error);
    }
    return data;
  },

  /**
   * 根据key获取组件文字内容
   */
  async getByKey(key: string, area?: string): Promise<ComponentText | null> {
    let query = supabase
      .from(TABLES.COMPONENT_TEXT_STORAGE)
      .select('*')
      .eq('key', key);

    if (area) {
      query = query.eq('area', area);
    } else {
      query = query.is('area', null);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      handleError(error);
    }
    return data;
  },

  /**
   * 根据区域获取组件文字内容
   */
  async getByArea(area: string): Promise<ComponentText[]> {
    const { data, error } = await supabase
      .from(TABLES.COMPONENT_TEXT_STORAGE)
      .select('*')
      .eq('area', area)
      .order('key', { ascending: true });

    if (error) handleError(error);
    return data || [];
  },

  /**
   * 创建组件文字内容
   */
  async create(textData: ComponentTextFormData): Promise<ComponentText> {
    const { data, error } = await supabase
      .from(TABLES.COMPONENT_TEXT_STORAGE)
      .insert(textData)
      .select()
      .single();

    if (error) handleError(error);
    return data;
  },

  /**
   * 更新组件文字内容
   */
  async update(id: string, textData: Partial<ComponentTextFormData>): Promise<ComponentText> {
    const { data, error } = await supabase
      .from(TABLES.COMPONENT_TEXT_STORAGE)
      .update(textData)
      .eq('id', id)
      .select()
      .single();

    if (error) handleError(error);
    return data;
  },

  /**
   * 根据key更新组件文字内容
   */
  async updateByKey(key: string, area: string | undefined, textData: Partial<ComponentTextFormData>): Promise<ComponentText> {
    let query = supabase
      .from(TABLES.COMPONENT_TEXT_STORAGE)
      .update(textData)
      .eq('key', key);

    if (area) {
      query = query.eq('area', area);
    } else {
      query = query.is('area', null);
    }

    const { data, error } = await query.select().single();

    if (error) handleError(error);
    return data;
  },

  /**
   * 删除组件文字内容
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.COMPONENT_TEXT_STORAGE)
      .delete()
      .eq('id', id);

    if (error) handleError(error);
  },

  /**
   * 根据key删除组件文字内容
   */
  async deleteByKey(key: string, area?: string): Promise<void> {
    let query = supabase
      .from(TABLES.COMPONENT_TEXT_STORAGE)
      .delete()
      .eq('key', key);

    if (area) {
      query = query.eq('area', area);
    } else {
      query = query.is('area', null);
    }

    const { error } = await query;

    if (error) handleError(error);
  },

  /**
   * 获取所有区域列表
   */
  async getAllAreas(): Promise<string[]> {
    const { data, error } = await supabase
      .from(TABLES.COMPONENT_TEXT_STORAGE)
      .select('area')
      .not('area', 'is', null);

    if (error) handleError(error);
    
    // 去重并排序
    const areas = [...new Set(data?.map(item => item.area).filter(Boolean))] as string[];
    return areas.sort();
  },

  /**
   * 按区域分组获取所有组件文字内容
   */
  async getAllGroupedByArea(): Promise<{ area: string; texts: ComponentText[] }[]> {
    const { data, error } = await supabase
      .from(TABLES.COMPONENT_TEXT_STORAGE)
      .select('*')
      .order('area', { ascending: true })
      .order('key', { ascending: true });

    if (error) handleError(error);
    
    if (!data) return [];

    // 按区域分组
    const grouped = data.reduce((acc, item) => {
      const area = item.area || '未分组';
      if (!acc[area]) {
        acc[area] = [];
      }
      acc[area].push(item);
      return acc;
    }, {} as Record<string, ComponentText[]>);

    // 转换为数组格式
    return Object.entries(grouped).map(([area, texts]) => ({
      area,
      texts
    }));
  },

  /**
   * 批量创建或更新组件文字内容
   */
  async batchUpsert(textDataList: ComponentTextFormData[]): Promise<ComponentText[]> {
    const { data, error } = await supabase
      .from(TABLES.COMPONENT_TEXT_STORAGE)
      .upsert(textDataList, {
        onConflict: 'key,area',
        ignoreDuplicates: false
      })
      .select();

    if (error) handleError(error);
    return data || [];
  },

  /**
   * 搜索组件文字内容
   */
  async search(searchTerm: string, area?: string): Promise<ComponentText[]> {
    let query = supabase
      .from(TABLES.COMPONENT_TEXT_STORAGE)
      .select('*');

    if (area) {
      query = query.eq('area', area);
    }

    // 搜索key、content或description字段
    query = query.or(`key.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    
    query = query.order('key', { ascending: true });

    const { data, error } = await query;

    if (error) handleError(error);
    return data || [];
  }
};