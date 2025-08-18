import {
  TrashIcon,
  PencilIcon,
  HeartIcon,
  ShareIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import React from 'react';

/**
 * 滑动动作接口定义
 */
export interface SwipeAction {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  backgroundColor?: string;
  onClick: () => void;
  destructive?: boolean;
}

/**
 * 预定义的滑动动作集合
 */
export const SwipeActions = {
  delete: (onClick: () => void): SwipeAction => ({
    id: 'delete',
    label: '删除',
    icon: TrashIcon,
    backgroundColor: '#ef4444',
    onClick,
    destructive: true
  }),

  edit: (onClick: () => void): SwipeAction => ({
    id: 'edit',
    label: '编辑',
    icon: PencilIcon,
    backgroundColor: '#3b82f6',
    onClick
  }),

  favorite: (onClick: () => void): SwipeAction => ({
    id: 'favorite',
    label: '收藏',
    icon: HeartIcon,
    backgroundColor: '#f59e0b',
    onClick
  }),

  share: (onClick: () => void): SwipeAction => ({
    id: 'share',
    label: '分享',
    icon: ShareIcon,
    backgroundColor: '#10b981',
    onClick
  }),

  more: (onClick: () => void): SwipeAction => ({
    id: 'more',
    label: '更多',
    icon: EllipsisHorizontalIcon,
    backgroundColor: '#6b7280',
    onClick
  })
};

// 默认导出
export default SwipeActions;