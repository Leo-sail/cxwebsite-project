import React from 'react';
import { Typography, Alert } from '@mui/material';

/**
 * 动态组件渲染器属性接口
 */
export interface DynamicComponentRendererProps {
  /** 组件区域标识 */
  area?: string;
  /** 自定义样式类名 */
  className?: string;
  /** 点击事件处理函数 */
  onClick?: () => void;
}

/**
 * 动态组件渲染器
 * 注意：component_text_storage 表已被删除，此组件暂时返回空内容
 */
const DynamicComponentRenderer: React.FC<DynamicComponentRendererProps> = ({
  area,
  className = '',
  onClick
}) => {
  return (
    <div className={className} onClick={onClick}>
      <Alert severity="info">
        <Typography variant="body2">
          动态组件渲染器暂时不可用 (区域: {area || '未指定'})
        </Typography>
        <Typography variant="caption">
          component_text_storage 数据表已被删除
        </Typography>
      </Alert>
    </div>
  );
};

export default DynamicComponentRenderer;