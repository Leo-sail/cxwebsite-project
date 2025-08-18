/**
 * 全局状态管理
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AppState, AdminState } from '../types';
import type { Json } from '../types/database';

/**
 * 应用状态管理
 */
interface AppStore extends AppState {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUser: (user: unknown | null) => void;
  clearError: () => void;
}

export const useAppStore = create<AppStore>()((
  devtools(
    persist(
      (set) => ({
        isLoading: false,
        error: null,
        user: null,
        
        setLoading: (loading: boolean) => set({ isLoading: loading }),
        setError: (error: string | null) => set({ error }),
        setUser: (user: unknown | null) => set({ user }),
        clearError: () => set({ error: null })
      }),
      {
        name: 'app-store',
        partialize: (state) => ({ user: state.user })
      }
    ),
    { name: 'AppStore' }
  )
));

/**
 * 后台管理状态
 */
interface AdminStore extends AdminState {
  // 课程相关
  setCourses: (courses: AdminState['courses']) => void;
  addCourse: (course: AdminState['courses'][0]) => void;
  updateCourse: (id: string, course: Partial<AdminState['courses'][0]>) => void;
  deleteCourse: (id: string) => void;
  
  // 师资相关
  setTeachers: (teachers: AdminState['teachers']) => void;
  addTeacher: (teacher: AdminState['teachers'][0]) => void;
  updateTeacher: (id: string, teacher: Partial<AdminState['teachers'][0]>) => void;
  deleteTeacher: (id: string) => void;
  
  // 学员案例相关
  setStudentCases: (cases: AdminState['studentCases']) => void;
  addStudentCase: (studentCase: AdminState['studentCases'][0]) => void;
  updateStudentCase: (id: string, studentCase: Partial<AdminState['studentCases'][0]>) => void;
  deleteStudentCase: (id: string) => void;
  
  // 文章相关
  setArticles: (articles: AdminState['articles']) => void;
  addArticle: (article: AdminState['articles'][0]) => void;
  updateArticle: (id: string, article: Partial<AdminState['articles'][0]>) => void;
  deleteArticle: (id: string) => void;
  
  // 页面配置相关
  setPageConfigs: (configs: AdminState['pageConfigs']) => void;
  updatePageConfig: (pageName: string, config: Record<string, unknown>) => void;
  
  // 媒体文件相关
  setMediaFiles: (files: AdminState['mediaFiles']) => void;
  addMediaFile: (file: AdminState['mediaFiles'][0]) => void;
  deleteMediaFile: (id: string) => void;
  
  // 重置状态
  reset: () => void;
}

export const useAdminStore = create<AdminStore>()((
  devtools(
    (set) => ({
      courses: [],
      teachers: [],
      studentCases: [],
      articles: [],
      pageConfigs: [],
      mediaFiles: [],
      
      // 课程相关
      setCourses: (courses: AdminState['courses']) => set({ courses }),
      addCourse: (course: AdminState['courses'][0]) => set((state) => ({ 
        courses: [...state.courses, course] 
      })),
      updateCourse: (id: string, course: Partial<AdminState['courses'][0]>) => set((state) => ({
        courses: state.courses.map(c => c.id === id ? { ...c, ...course } : c)
      })),
      deleteCourse: (id: string) => set((state) => ({
        courses: state.courses.filter(c => c.id !== id)
      })),
      
      // 师资相关
      setTeachers: (teachers: AdminState['teachers']) => set({ teachers }),
      addTeacher: (teacher: AdminState['teachers'][0]) => set((state) => ({ 
        teachers: [...state.teachers, teacher] 
      })),
      updateTeacher: (id: string, teacher: Partial<AdminState['teachers'][0]>) => set((state) => ({
        teachers: state.teachers.map(t => t.id === id ? { ...t, ...teacher } : t)
      })),
      deleteTeacher: (id: string) => set((state) => ({
        teachers: state.teachers.filter(t => t.id !== id)
      })),
      
      // 学员案例相关
      setStudentCases: (studentCases: AdminState['studentCases']) => set({ studentCases }),
      addStudentCase: (studentCase: AdminState['studentCases'][0]) => set((state) => ({ 
        studentCases: [...state.studentCases, studentCase] 
      })),
      updateStudentCase: (id: string, studentCase: Partial<AdminState['studentCases'][0]>) => set((state) => ({
        studentCases: state.studentCases.map(sc => sc.id === id ? { ...sc, ...studentCase } : sc)
      })),
      deleteStudentCase: (id: string) => set((state) => ({
        studentCases: state.studentCases.filter(sc => sc.id !== id)
      })),
      
      // 文章相关
      setArticles: (articles: AdminState['articles']) => set({ articles }),
      addArticle: (article: AdminState['articles'][0]) => set((state) => ({ 
        articles: [...state.articles, article] 
      })),
      updateArticle: (id: string, article: Partial<AdminState['articles'][0]>) => set((state) => ({
        articles: state.articles.map(a => a.id === id ? { ...a, ...article } : a)
      })),
      deleteArticle: (id: string) => set((state) => ({
        articles: state.articles.filter(a => a.id !== id)
      })),
      
      // 页面配置相关
      setPageConfigs: (pageConfigs: AdminState['pageConfigs']) => set({ pageConfigs }),
      updatePageConfig: (pageName: string, config: Record<string, unknown>) => set((state) => ({
        pageConfigs: state.pageConfigs.map(pc => 
          pc.page_name === pageName 
            ? { ...pc, config_data: config as Json, updated_at: new Date().toISOString() }
            : pc
        )
      })),
      
      // 媒体文件相关
      setMediaFiles: (mediaFiles: AdminState['mediaFiles']) => set({ mediaFiles }),
      addMediaFile: (file: AdminState['mediaFiles'][0]) => set((state) => ({ 
        mediaFiles: [...state.mediaFiles, file] 
      })),
      deleteMediaFile: (id: string) => set((state) => ({
        mediaFiles: state.mediaFiles.filter(f => f.id !== id)
      })),
      
      // 重置状态
      reset: () => set({
        courses: [],
        teachers: [],
        studentCases: [],
        articles: [],
        pageConfigs: [],
        mediaFiles: []
      })
    }),
    { name: 'AdminStore' }
  )
));