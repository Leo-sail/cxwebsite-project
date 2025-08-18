import React, { type ComponentType } from 'react';
import type { ComponentStyleConfig, StyledComponentProps } from '../types/style';
import { createStyledComponent } from '../components/styled/StyledComponentFactory';

/**
 * 样式化组件配置接口
 */
export interface StyledComponentConfig {
  /** 组件名称 */
  componentName: string;
  /** 默认样式 */
  defaultStyles: ComponentStyleConfig;
  /** 默认变体 */
  defaultVariant?: string;
  /** 默认尺寸 */
  defaultSize?: string;
  /** 是否响应式 */
  responsive?: boolean;
  /** 自定义样式合并器 */
  customStyleMerger?: (styles: ComponentStyleConfig[], props: StyledComponentProps) => ComponentStyleConfig;
}

/**
 * 高阶组件：为组件添加样式化功能
 * @param config 样式化组件配置
 * @returns 高阶组件
 */
export function withStyledComponent(config: StyledComponentConfig) {
  return function <T extends ComponentType<unknown>>(Component: T) {
    return createStyledComponent(Component, config);
  };
}

/**
 * 样式化组件工厂集合
 */
export const StyledComponentFactories = {
  /**
   * 创建容器组件
   */
  createContainer: (componentName: string, defaultStyles: ComponentStyleConfig) =>
    createStyledElement('div', {
      componentName,
      defaultStyles,
      responsive: true
    }),

  /**
   * 创建文本组件
   */
  createText: (componentName: string, defaultStyles: ComponentStyleConfig) =>
    createStyledElement('span', {
      componentName,
      defaultStyles,
      responsive: true
    }),

  /**
   * 创建标题组件
   */
  createHeading: (componentName: string, defaultStyles: ComponentStyleConfig, level: 1 | 2 | 3 | 4 | 5 | 6 = 1) =>
    createStyledElement(`h${level}` as keyof React.JSX.IntrinsicElements, {
      componentName,
      defaultStyles,
      responsive: true
    }),

  /**
   * 创建输入框组件
   */
  createInput: (componentName: string, defaultStyles: ComponentStyleConfig) =>
    createStyledElement('input', {
      componentName,
      defaultStyles,
      defaultVariant: 'default',
      defaultSize: 'md',
      responsive: true
    }),

  /**
   * 创建按钮组件
   */
  createButton: (componentName: string, defaultStyles: ComponentStyleConfig) =>
    createStyledElement('button', {
      componentName,
      defaultStyles,
      defaultVariant: 'primary',
      defaultSize: 'md',
      responsive: true
    })
};

/**
 * 创建样式化元素
 * @param element HTML元素类型
 * @param config 样式化组件配置
 * @returns 样式化元素组件
 */
export function createStyledElement(
  element: keyof React.JSX.IntrinsicElements,
  config: StyledComponentConfig
) {
  return createStyledComponent(
    element as unknown as ComponentType<unknown>,
    config
  );
}

/**
 * 样式化组件装饰器
 * @param config 样式化组件配置
 * @returns 样式化组件
 */
export function StyledComponent(config: StyledComponentConfig) {
  return function <T extends ComponentType<unknown>>(target: T): T {
    return createStyledComponent(target, config) as unknown as T;
  };
}

/**
 * 默认导出工具函数集合
 */
export default {
  withStyledComponent,
  StyledComponentFactories,
  createStyledElement,
  StyledComponent
};