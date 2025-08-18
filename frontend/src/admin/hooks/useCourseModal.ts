/**
 * 课程模态框状态管理Hook
 * 管理课程的查看、编辑、新增模态框状态和表单数据
 */

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { CourseService } from '../../services/adminService';
import { getCourseFormDefaultValues, formatCourseFormData, validateCourseForm } from '../config/courseFormConfig';
import type { Course } from '../../types/database';

export type ModalMode = 'view' | 'edit' | 'create' | null;

export interface CourseModalState {
  isOpen: boolean;
  mode: ModalMode;
  currentCourse: Course | null;
  formData: Record<string, any>;
  errors: Record<string, string>;
  loading: boolean;
  submitting: boolean;
}

export interface CourseModalActions {
  openViewModal: (course: Course) => void;
  openEditModal: (course: Course) => void;
  openCreateModal: () => void;
  closeModal: () => void;
  updateFormData: (field: string, value: any) => void;
  setFormData: (data: Record<string, any>) => void;
  validateForm: () => boolean;
  submitForm: () => Promise<boolean>;
  resetForm: () => void;
}

export interface UseCourseModalReturn extends CourseModalState, CourseModalActions {}

/**
 * 课程模态框状态管理Hook
 */
export const useCourseModal = (onSuccess?: () => void): UseCourseModalReturn => {
  const [state, setState] = useState<CourseModalState>({
    isOpen: false,
    mode: null,
    currentCourse: null,
    formData: getCourseFormDefaultValues(),
    errors: {},
    loading: false,
    submitting: false
  });

  /**
   * 打开查看模态框
   */
  const openViewModal = useCallback((course: Course) => {
    setState(prev => ({
      ...prev,
      isOpen: true,
      mode: 'view',
      currentCourse: course,
      formData: {
        name: course.name || '',
        description: course.description || '',
        category: course.category || '',
        image_url: course.image_url || '',
        sort_order: course.sort_order || 0,
        is_active: course.is_active ?? true
      },
      errors: {},
      loading: false,
      submitting: false
    }));
  }, []);

  /**
   * 打开编辑模态框
   */
  const openEditModal = useCallback(async (course: Course) => {
    setState(prev => ({
      ...prev,
      isOpen: true,
      mode: 'edit',
      currentCourse: course,
      loading: true,
      errors: {},
      submitting: false
    }));

    try {
      // 获取最新的课程数据
      const latestCourse = await CourseService.getCourse(course.id);
      setState(prev => ({
        ...prev,
        currentCourse: latestCourse,
        formData: {
          name: latestCourse.name || '',
          description: latestCourse.description || '',
          category: latestCourse.category || '',
          image_url: latestCourse.image_url || '',
          sort_order: latestCourse.sort_order || 0,
          is_active: latestCourse.is_active ?? true
        },
        loading: false
      }));
    } catch (error) {
      console.error('获取课程详情失败:', error);
      toast.error('获取课程详情失败');
      setState(prev => ({
        ...prev,
        loading: false,
        isOpen: false
      }));
    }
  }, []);

  /**
   * 打开新增模态框
   */
  const openCreateModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: true,
      mode: 'create',
      currentCourse: null,
      formData: getCourseFormDefaultValues(),
      errors: {},
      loading: false,
      submitting: false
    }));
  }, []);

  /**
   * 关闭模态框
   */
  const closeModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
      mode: null,
      currentCourse: null,
      formData: getCourseFormDefaultValues(),
      errors: {},
      loading: false,
      submitting: false
    }));
  }, []);

  /**
   * 更新表单字段数据
   */
  const updateFormData = useCallback((field: string, value: any) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value
      },
      // 清除该字段的错误信息
      errors: {
        ...prev.errors,
        [field]: ''
      }
    }));
  }, []);

  /**
   * 设置整个表单数据
   */
  const setFormData = useCallback((data: Record<string, any>) => {
    setState(prev => ({
      ...prev,
      formData: data,
      errors: {}
    }));
  }, []);

  /**
   * 验证表单
   */
  const validateForm = useCallback((): boolean => {
    const errors = validateCourseForm(state.formData);
    setState(prev => ({
      ...prev,
      errors
    }));
    return Object.keys(errors).length === 0;
  }, [state.formData]);

  /**
   * 提交表单
   */
  const submitForm = useCallback(async (): Promise<boolean> => {
    // 验证表单
    if (!validateForm()) {
      toast.error('请检查表单输入');
      return false;
    }

    setState(prev => ({ ...prev, submitting: true }));

    try {
      const formattedData = formatCourseFormData(state.formData);

      if (state.mode === 'create') {
        // 新增课程
        await CourseService.createCourse(formattedData);
        toast.success('课程创建成功');
      } else if (state.mode === 'edit' && state.currentCourse) {
        // 编辑课程
        await CourseService.updateCourse(state.currentCourse.id, formattedData);
        toast.success('课程更新成功');
      }

      // 调用成功回调
      onSuccess?.();
      
      // 关闭模态框
      closeModal();
      
      return true;
    } catch (error) {
      console.error('提交表单失败:', error);
      const errorMessage = error instanceof Error ? error.message : '操作失败';
      toast.error(errorMessage);
      return false;
    } finally {
      setState(prev => ({ ...prev, submitting: false }));
    }
  }, [state.formData, state.mode, state.currentCourse, validateForm, onSuccess, closeModal]);

  /**
   * 重置表单
   */
  const resetForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      formData: getCourseFormDefaultValues(),
      errors: {}
    }));
  }, []);

  return {
    // 状态
    isOpen: state.isOpen,
    mode: state.mode,
    currentCourse: state.currentCourse,
    formData: state.formData,
    errors: state.errors,
    loading: state.loading,
    submitting: state.submitting,
    
    // 操作方法
    openViewModal,
    openEditModal,
    openCreateModal,
    closeModal,
    updateFormData,
    setFormData,
    validateForm,
    submitForm,
    resetForm
  };
};