import { useState, useEffect, useMemo } from 'react';
import { uiConfigApi } from '../services/api';
import { useResponsiveValue } from './useResponsive';

/**
 * 页面头部图标配置数据类型定义
 */
export interface PageHeaderIconConfig {
  sizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  style: {
    borderRadius: string;
    background: string;
    shadow: string;
    border: string;
    backdrop: string; // 新增backdrop字段支持
    iconColor: string; // 新增iconColor字段支持
  };
}

/**
 * 配置验证和合并函数
 * 验证从数据库获取的配置并与默认配置合并
 */
const validateAndMergeConfig = (config: any): PageHeaderIconConfig => {
  const defaultConfig = getDefaultConfig();
  
  if (!config || typeof config !== 'object') {
    console.warn('配置对象无效，使用默认配置');
    return defaultConfig;
  }
  
  // 合并sizes配置
  const sizes = { ...defaultConfig.sizes };
  if (config.sizes && typeof config.sizes === 'object') {
    const sizeKeys = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    for (const key of sizeKeys) {
      if (typeof config.sizes[key] === 'number' && config.sizes[key] > 0) {
        sizes[key] = config.sizes[key];
      }
    }
  }
  
  // 合并spacing配置
  const spacing = { ...defaultConfig.spacing };
  if (config.spacing && typeof config.spacing === 'object') {
    const spacingKeys = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    for (const key of spacingKeys) {
      if (typeof config.spacing[key] === 'number' && config.spacing[key] >= 0) {
        spacing[key] = config.spacing[key];
      }
    }
  }
  
  // 合并style配置
  const style = { ...defaultConfig.style };
  if (config.style && typeof config.style === 'object') {
    const styleKeys = ['borderRadius', 'background', 'shadow', 'border', 'backdrop', 'iconColor'] as const;
    for (const key of styleKeys) {
      if (typeof config.style[key] === 'string' && config.style[key].trim()) {
        style[key] = config.style[key];
      }
    }
  }
  
  return { sizes, spacing, style };
};

/**
 * 获取默认配置
 * 当数据库配置不可用时使用的安全默认值
 */
const getDefaultConfig = (): PageHeaderIconConfig => ({
  sizes: { xs: 16, sm: 20, md: 24, lg: 28, xl: 32 },
  spacing: { xs: 4, sm: 6, md: 8, lg: 10, xl: 12 },
  style: {
    borderRadius: 'rounded-full',
    background: 'bg-white',
    shadow: 'shadow-lg',
    border: 'border-2 border-gray-100',
    backdrop: 'backdrop-blur-sm',
    iconColor: 'text-gray-700' // 默认图标颜色
  }
});

/**
 * 页面头部图标配置Hook
 * 从数据库读取页面头部图标的配置并提供响应式计算
 * @returns 配置数据、响应式值和加载状态
 */
export const usePageHeaderConfig = () => {
  const [config, setConfig] = useState<PageHeaderIconConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取配置数据
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        setLoading(true);
        setError(null);

        // 并行获取三个配置
        const [sizesData, spacingData, styleData] = await Promise.all([
          uiConfigApi.getByConfigKey('page_header_icon_sizes'),
          uiConfigApi.getByConfigKey('page_header_icon_spacing'),
          uiConfigApi.getByConfigKey('page_header_icon_style')
        ]);

        // 构建配置对象，允许部分配置缺失
        const configCandidate = {
          sizes: sizesData?.config_value,
          spacing: spacingData?.config_value,
          style: styleData?.config_value
        };
        
        // 使用新的验证和合并函数
        const mergedConfig = validateAndMergeConfig(configCandidate);
        setConfig(mergedConfig);
      } catch (err) {
        console.error('获取页面头部图标配置失败:', err);
        setError(err instanceof Error ? err.message : '获取配置失败');
        // 使用默认配置确保组件正常工作
        setConfig(getDefaultConfig());
      } finally {
        setLoading(false);
      }
    };

    fetchConfigs();
  }, []);

  // 安全的默认配置
  const defaultSizes = { xs: 16, sm: 20, md: 24, lg: 28, xl: 32 };
  const defaultSpacing = { xs: 4, sm: 6, md: 8, lg: 10, xl: 12 };
  
  // 响应式计算当前尺寸和间距
  const currentSize = useResponsiveValue(config?.sizes ?? defaultSizes);
  const currentSpacing = useResponsiveValue(config?.spacing ?? defaultSpacing);

  // 生成Tailwind CSS类名
  const iconClasses = useMemo(() => {
    if (!config) return '';
    
    const sizeClass = `w-${currentSize} h-${currentSize}`;
    const spacingClass = `mb-${currentSpacing}`;
    const { borderRadius, background, shadow, border } = config.style;
    
    return `${sizeClass} ${spacingClass} ${borderRadius} ${background} ${shadow} ${border} flex items-center justify-center`;
  }, [config, currentSize, currentSpacing]);

  // 生成内联样式（用于精确控制）
  const iconStyles = useMemo(() => {
    return {
      width: `${currentSize * 0.25}rem`, // 转换为rem单位
      height: `${currentSize * 0.25}rem`,
      marginBottom: `${currentSpacing * 0.25}rem`
    };
  }, [currentSize, currentSpacing]);

  return {
    config,
    loading,
    error,
    currentSize,
    currentSpacing,
    iconClasses,
    iconStyles
  };
};

/**
 * 页面头部图标尺寸Hook
 * 专门用于获取响应式图标尺寸
 * @param customConfig 自定义配置覆盖
 * @returns 当前断点下的图标尺寸配置
 */
export const usePageHeaderIconSize = (customConfig?: {
  containerSize?: { xs: number; sm: number; md: number; lg: number };
  iconSize?: { xs: number; sm: number; md: number; lg: number };
  spacing?: { xs: number; sm: number; md: number; lg: number };
}) => {
  const { config, loading, error } = usePageHeaderConfig();
  
  // 使用自定义配置或默认配置
  const containerSizes = customConfig?.containerSize || config?.sizes || { xs: 16, sm: 20, md: 24, lg: 28, xl: 32 };
  const iconSizes = customConfig?.iconSize || {
    xs: (customConfig?.containerSize?.xs || config?.sizes?.xs || 16) / 2,
    sm: (customConfig?.containerSize?.sm || config?.sizes?.sm || 20) / 2,
    md: (customConfig?.containerSize?.md || config?.sizes?.md || 24) / 2,
    lg: (customConfig?.containerSize?.lg || config?.sizes?.lg || 28) / 2
  };
  const spacingSizes = customConfig?.spacing || config?.spacing || { xs: 4, sm: 6, md: 8, lg: 10, xl: 12 };
  
  // 计算响应式值
  const containerSize = useResponsiveValue(containerSizes);
  const iconSize = useResponsiveValue(iconSizes);
  const spacing = useResponsiveValue(spacingSizes);
  
  return {
    containerSize: containerSizes,
    iconSize: iconSizes,
    spacing: spacingSizes,
    currentContainerSize: containerSize,
    currentIconSize: iconSize,
    currentSpacing: spacing,
    loading,
    error,
    // 便捷的Tailwind类名
    containerSizeClass: `w-${containerSize} h-${containerSize}`,
    iconSizeClass: `w-${iconSize} h-${iconSize}`,
    spacingClass: `mb-${spacing}`,
    // 内联样式
    containerStyle: {
      width: `${containerSize * 0.25}rem`,
      height: `${containerSize * 0.25}rem`
    },
    iconStyle: {
      width: `${iconSize * 0.25}rem`,
      height: `${iconSize * 0.25}rem`
    },
    spacingStyle: {
      marginBottom: `${spacing * 0.25}rem`
    }
  };
};

/**
 * 更新页面头部图标配置Hook
 * 用于后台管理系统更新配置
 * @returns 更新函数和状态
 */
export const useUpdatePageHeaderConfig = () => {
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const updateSizes = async (newSizes: PageHeaderIconConfig['sizes']) => {
    try {
      setUpdating(true);
      setUpdateError(null);

      await uiConfigApi.updateByConfigKey('page_header_icon_sizes', {
        config_value: newSizes
      });

      return true;
    } catch (err) {
      console.error('更新页面头部图标尺寸配置失败:', err);
      setUpdateError(err instanceof Error ? err.message : '更新配置失败');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const updateSpacing = async (newSpacing: PageHeaderIconConfig['spacing']) => {
    try {
      setUpdating(true);
      setUpdateError(null);

      await uiConfigApi.updateByConfigKey('page_header_icon_spacing', {
        config_value: newSpacing
      });

      return true;
    } catch (err) {
      console.error('更新页面头部图标间距配置失败:', err);
      setUpdateError(err instanceof Error ? err.message : '更新配置失败');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const updateStyle = async (newStyle: PageHeaderIconConfig['style']) => {
    try {
      setUpdating(true);
      setUpdateError(null);

      await uiConfigApi.updateByConfigKey('page_header_icon_style', {
        config_value: newStyle
      });

      return true;
    } catch (err) {
      console.error('更新页面头部图标样式配置失败:', err);
      setUpdateError(err instanceof Error ? err.message : '更新配置失败');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return {
    updateSizes,
    updateSpacing,
    updateStyle,
    updating,
    updateError
  };
};