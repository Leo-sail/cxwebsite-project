/**
 * 便捷文字内容Hook
 * 提供简化的API用于组件中快速获取和使用文字内容
 */
import { useComponentTextByKey, useComponentTextsByArea } from './useComponentText';

/**
 * 便捷Hook：根据key获取单个文字内容
 * @param key 文字内容的唯一标识
 * @param area 可选的区域标识
 * @param fallback 当文字内容不存在时的默认值
 * @returns 文字内容字符串
 */
export const useText = (key: string, area?: string, fallback?: string): string => {
  const { data: componentText, isLoading, error } = useComponentTextByKey(key, area);
  
  // 如果正在加载，返回fallback或空字符串
  if (isLoading) {
    return fallback || '';
  }
  
  // 如果有错误或没有数据，返回fallback或key作为默认值
  if (error || !componentText) {
    return fallback || key;
  }
  
  return componentText.content;
};

/**
 * 便捷Hook：根据区域获取多个文字内容
 * @param area 区域标识
 * @returns 文字内容对象，以key为键，content为值
 */
export const useTexts = (area: string): Record<string, string> => {
  const { data: componentTexts, isLoading, error } = useComponentTextsByArea(area);
  
  // 如果正在加载或有错误，返回空对象
  if (isLoading || error || !componentTexts) {
    return {};
  }
  
  // 将数组转换为对象，以key为键，content为值
  return componentTexts.reduce((acc, text) => {
    acc[text.key] = text.content;
    return acc;
  }, {} as Record<string, string>);
};

/**
 * 便捷Hook：获取文字内容的详细信息
 * @param key 文字内容的唯一标识
 * @param area 可选的区域标识
 * @returns 包含文字内容、加载状态和错误信息的对象
 */
export const useTextInfo = (key: string, area?: string) => {
  const { data: componentText, isLoading, error } = useComponentTextByKey(key, area);
  
  return {
    text: componentText?.content || key,
    description: componentText?.description,
    isLoading,
    error,
    exists: !!componentText,
  };
};

/**
 * 便捷Hook：获取区域文字内容的详细信息
 * @param area 区域标识
 * @returns 包含文字内容数组、加载状态和错误信息的对象
 */
export const useTextsInfo = (area: string) => {
  const { data: componentTexts, isLoading, error } = useComponentTextsByArea(area);
  
  return {
    texts: componentTexts || [],
    textsMap: componentTexts?.reduce((acc, text) => {
      acc[text.key] = text.content;
      return acc;
    }, {} as Record<string, string>) || {},
    isLoading,
    error,
    count: componentTexts?.length || 0,
  };
};

/**
 * 便捷Hook：检查文字内容是否存在
 * @param key 文字内容的唯一标识
 * @param area 可选的区域标识
 * @returns 布尔值，表示文字内容是否存在
 */
export const useTextExists = (key: string, area?: string): boolean => {
  const { data: componentText, isLoading } = useComponentTextByKey(key, area);
  
  // 如果正在加载，返回false
  if (isLoading) {
    return false;
  }
  
  return !!componentText;
};

/**
 * 便捷Hook：获取格式化的文字内容（支持简单的变量替换）
 * @param key 文字内容的唯一标识
 * @param variables 要替换的变量对象
 * @param area 可选的区域标识
 * @param fallback 当文字内容不存在时的默认值
 * @returns 格式化后的文字内容
 */
export const useFormattedText = (
  key: string, 
  variables?: Record<string, string | number>, 
  area?: string, 
  fallback?: string
): string => {
  const text = useText(key, area, fallback);
  
  // 如果没有变量，直接返回文字内容
  if (!variables || Object.keys(variables).length === 0) {
    return text;
  }
  
  // 简单的变量替换，支持 {{variable}} 格式
  let formattedText = text;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    formattedText = formattedText.replace(regex, String(value));
  });
  
  return formattedText;
};