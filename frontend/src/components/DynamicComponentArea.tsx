import React from 'react';
import { Box } from '@mui/material';

/**
 * 动态组件区域属性接口
 */
export interface DynamicComponentAreaProps {
  /** 区域名称，用于过滤显示的组件 */
  area: string;
  /** 组件类型过滤（可选） */
  type?: string;
  /** 容器类名 */
  containerClassName?: string;
}

/**
 * 动态组件区域组件
 * 由于component_text_storage表已被删除，此组件现在返回空内容
 * 保留接口以维持现有代码的兼容性
 */
export const DynamicComponentArea: React.FC<DynamicComponentAreaProps> = ({
  area,
  type,
  containerClassName
}) => {
  // 返回空的Box以保持布局结构
  return (
    <Box
      className={containerClassName}
      data-area={area}
      data-component-type={type}
    >
      {/* 组件区域已禁用 - component_text_storage表不存在 */}
    </Box>
  );
};

export default DynamicComponentArea;