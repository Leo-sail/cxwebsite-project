import { useState, useEffect } from 'react';
import { uiConfigApi } from '../services/api';

/**
 * UI配置数据类型定义
 */
export interface UIConfigValue {
  mobile: {
    width: string;
    height: string;
    size_rem: number;
  };
  desktop: {
    width: string;
    height: string;
    size_rem: number;
  };
  variants?: Record<string, {
    mobile: { width: string; height: string; size_rem: number };
    desktop: { width: string; height: string; size_rem: number };
  }>;
}

export interface UIConfig {
  config_key: string;
  config_name: string;
  config_value: UIConfigValue;
  config_type: string;
  component_type: string;
  page_scope: string[];
  is_active: boolean;
}

/**
 * UI配置Hook - 从数据库读取UI配置
 * @param configKey 配置键
 * @returns 配置数据和加载状态
 */
export const useUIConfig = (configKey: string) => {
  const [config, setConfig] = useState<UIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await uiConfigApi.getByConfigKey(configKey);
        
        if (data) {
          setConfig(data as unknown as UIConfig);
        } else {
          // 未找到配置，使用默认值
          setConfig(null);
        }
      } catch (err) {
        console.error('获取UI配置失败:', err);
        setError(err instanceof Error ? err.message : '获取配置失败');
        setConfig(null);
      } finally {
        setLoading(false);
      }
    };

    if (configKey) {
      fetchConfig();
    }
  }, [configKey]);

  return { config, loading, error };
};

/**
 * 教师头像尺寸配置Hook - 专门用于教师头像组件
 * @param variant 尺寸变体 ('sm' | 'md' | 'lg')
 * @returns 头像尺寸配置
 */
export const useTeacherAvatarSize = (variant: 'sm' | 'md' | 'lg' = 'md') => {
  const { config, loading, error } = useUIConfig('teacher_avatar_size');
  
  const getSizeConfig = () => {
    if (!config) return null;
    
    // 如果指定了变体且存在，使用变体配置
    if (variant !== 'md' && config.config_value.variants?.[variant]) {
      return config.config_value.variants[variant];
    }
    
    // 否则使用默认配置
    return {
      mobile: config.config_value.mobile,
      desktop: config.config_value.desktop
    };
  };

  return {
    sizeConfig: getSizeConfig(),
    loading,
    error,
    variant
  };
};

/**
 * 更新UI配置Hook - 用于后台管理系统
 * @param configKey 配置键
 * @returns 更新函数和状态
 */
export const useUpdateUIConfig = (configKey: string) => {
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const updateConfig = async (newConfigValue: UIConfigValue) => {
    try {
      setUpdating(true);
      setUpdateError(null);

      await uiConfigApi.updateByConfigKey(configKey, {
        config_value: newConfigValue as any
      });

      return true;
    } catch (err) {
      console.error(`更新UI配置失败 (${configKey}):`, err);
      setUpdateError(err instanceof Error ? err.message : '更新配置失败');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return {
    updateConfig,
    updating,
    updateError
  };
};