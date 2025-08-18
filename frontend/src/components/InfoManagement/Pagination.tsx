/**
 * 分页组件
 * 用于信息管理页面的数据分页导航
 */

import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal
} from 'lucide-react';
import type { PaginationProps } from '../../types/infoManagement';
import { 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from '../ui/Select';

// ============================================================================
// 常量配置
// ============================================================================

/**
 * 默认每页显示数量选项
 */
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

/**
 * 分页按钮最大显示数量
 */
const MAX_VISIBLE_PAGES = 7;

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 生成分页页码数组
 * @param current 当前页码
 * @param total 总页数
 * @param maxVisible 最大显示页码数
 * @returns 页码数组，包含省略号标识
 */
const generatePageNumbers = (
  current: number,
  total: number,
  maxVisible: number = MAX_VISIBLE_PAGES
): (number | 'ellipsis')[] => {
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];
  const halfVisible = Math.floor(maxVisible / 2);

  // 总是显示第一页
  pages.push(1);

  if (current <= halfVisible + 1) {
    // 当前页在前半部分
    for (let i = 2; i <= Math.min(maxVisible - 1, total - 1); i++) {
      pages.push(i);
    }
    if (total > maxVisible - 1) {
      pages.push('ellipsis');
    }
  } else if (current >= total - halfVisible) {
    // 当前页在后半部分
    if (total > maxVisible - 1) {
      pages.push('ellipsis');
    }
    for (let i = Math.max(2, total - maxVisible + 2); i <= total - 1; i++) {
      pages.push(i);
    }
  } else {
    // 当前页在中间部分
    pages.push('ellipsis');
    for (let i = current - halfVisible + 1; i <= current + halfVisible - 1; i++) {
      pages.push(i);
    }
    pages.push('ellipsis');
  }

  // 总是显示最后一页（如果总页数大于1）
  if (total > 1) {
    pages.push(total);
  }

  return pages;
};

/**
 * 计算分页信息
 * @param current 当前页码
 * @param pageSize 每页数量
 * @param total 总记录数
 * @returns 分页信息对象
 */
const calculatePaginationInfo = (current: number, pageSize: number, total: number) => {
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (current - 1) * pageSize + 1;
  const endIndex = Math.min(current * pageSize, total);
  
  return {
    totalPages,
    startIndex,
    endIndex,
    hasPrevious: current > 1,
    hasNext: current < totalPages
  };
};

// ============================================================================
// 子组件
// ============================================================================

/**
 * 分页按钮组件
 */
interface PaginationButtonProps {
  page: number | 'ellipsis';
  current: number;
  onClick: (page: number) => void;
  disabled?: boolean;
}

const PaginationButton: React.FC<PaginationButtonProps> = ({
  page,
  current,
  onClick,
  disabled = false
}) => {
  if (page === 'ellipsis') {
    return (
      <div className="flex items-center justify-center w-10 h-10">
        <MoreHorizontal className="h-4 w-4 text-gray-400" />
      </div>
    );
  }

  const isActive = page === current;

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      <Button
        variant={isActive ? 'default' : 'outline'}
        size="sm"
        className={`w-10 h-10 p-0 ${
          isActive
            ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        onClick={() => onClick(page)}
        disabled={disabled || isActive}
      >
        {page}
      </Button>
    </motion.div>
  );
};

/**
 * 导航按钮组件
 */
interface NavigationButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tooltip?: string;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  icon,
  onClick,
  disabled = false,
  tooltip
}) => {
  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      <Button
        variant="outline"
        size="sm"
        className="w-10 h-10 p-0"
        onClick={onClick}
        disabled={disabled}
        title={tooltip}
      >
        {icon}
      </Button>
    </motion.div>
  );
};

/**
 * 分页信息显示组件
 */
interface PaginationInfoProps {
  startIndex: number;
  endIndex: number;
  total: number;
  className?: string;
}

const PaginationInfo: React.FC<PaginationInfoProps> = ({
  startIndex,
  endIndex,
  total,
  className = ''
}) => {
  return (
    <div className={`text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap ${className}`}>
      显示第 <span className="font-medium">{startIndex}</span> 到 <span className="font-medium">{endIndex}</span> 条，共 <span className="font-medium">{total}</span> 条记录
    </div>
  );
};

/**
 * 每页数量选择组件
 */
interface PageSizeSelectProps {
  pageSize: number;
  options: number[];
  onChange: (pageSize: number) => void;
  disabled?: boolean;
  className?: string;
}

const PageSizeSelect: React.FC<PageSizeSelectProps> = ({
  pageSize,
  options,
  onChange,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
        每页显示
      </span>
      <Select
        value={pageSize.toString()}
        onValueChange={(value) => onChange(Number(value))}
        disabled={disabled}
      >
        <SelectTrigger className="w-20 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option.toString()}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
        条
      </span>
    </div>
  );
};

// ============================================================================
// 主组件
// ============================================================================

/**
 * 分页组件
 */
export const Pagination: React.FC<PaginationProps> = ({
  current = 1,
  pageSize = 10,
  total = 0,
  onChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  showSizeChanger = true,
  showQuickJumper = false,
  showTotal = true,
  disabled = false,
  className = '',
  size = 'default'
}) => {
  // ============================================================================
  // 计算属性
  // ============================================================================
  
  const paginationInfo = useMemo(() => {
    return calculatePaginationInfo(current, pageSize, total);
  }, [current, pageSize, total]);
  
  const pageNumbers = useMemo(() => {
    return generatePageNumbers(current, paginationInfo.totalPages);
  }, [current, paginationInfo.totalPages]);
  
  const sizeClass = useMemo(() => {
    switch (size) {
      case 'small':
        return 'text-xs';
      case 'large':
        return 'text-base';
      default:
        return 'text-sm';
    }
  }, [size]);
  
  // ============================================================================
  // 事件处理
  // ============================================================================
  
  /**
   * 处理页码变化
   */
  const handlePageChange = useCallback((page: number) => {
    if (page < 1 || page > paginationInfo.totalPages || page === current || disabled) {
      return;
    }
    onChange(page, pageSize);
  }, [current, pageSize, paginationInfo.totalPages, disabled, onChange]);
  
  /**
   * 处理每页数量变化
   */
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    if (newPageSize === pageSize || disabled) {
      return;
    }
    
    // 计算新的页码，保持当前显示的第一条记录位置
    const currentFirstIndex = (current - 1) * pageSize + 1;
    const newPage = Math.ceil(currentFirstIndex / newPageSize);
    
    onPageSizeChange?.(newPageSize, newPage);
  }, [current, pageSize, disabled, onPageSizeChange]);
  
  /**
   * 跳转到第一页
   */
  const goToFirstPage = useCallback(() => {
    handlePageChange(1);
  }, [handlePageChange]);
  
  /**
   * 跳转到最后一页
   */
  const goToLastPage = useCallback(() => {
    handlePageChange(paginationInfo.totalPages);
  }, [handlePageChange, paginationInfo.totalPages]);
  
  /**
   * 跳转到上一页
   */
  const goToPreviousPage = useCallback(() => {
    handlePageChange(current - 1);
  }, [handlePageChange, current]);
  
  /**
   * 跳转到下一页
   */
  const goToNextPage = useCallback(() => {
    handlePageChange(current + 1);
  }, [handlePageChange, current]);
  
  // ============================================================================
  // 渲染条件判断
  // ============================================================================
  
  // 如果总数为0或只有一页，则不显示分页
  if (total === 0 || paginationInfo.totalPages <= 1) {
    return null;
  }
  
  // ============================================================================
  // 渲染
  // ============================================================================
  
  return (
    <div className={`flex items-center justify-between gap-4 ${sizeClass} ${className}`}>
      {/* 左侧：分页信息 */}
      <div className="flex items-center gap-4">
        {showTotal && (
          <PaginationInfo
            startIndex={paginationInfo.startIndex}
            endIndex={paginationInfo.endIndex}
            total={total}
          />
        )}
      </div>
      
      {/* 右侧：分页导航 */}
      {paginationInfo.totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* 跳转到第一页 */}
          <NavigationButton
            icon={<ChevronsLeft className="h-4 w-4" />}
            onClick={goToFirstPage}
            disabled={!paginationInfo.hasPrevious || disabled}
            tooltip="第一页"
          />
          
          {/* 上一页 */}
          <NavigationButton
            icon={<ChevronLeft className="h-4 w-4" />}
            onClick={goToPreviousPage}
            disabled={!paginationInfo.hasPrevious || disabled}
            tooltip="上一页"
          />
          
          {/* 页码按钮 */}
          <div className="flex items-center gap-1 mx-2">
            {pageNumbers.map((page, index) => (
              <PaginationButton
                key={page === 'ellipsis' ? `ellipsis-${index}` : page}
                page={page}
                current={current}
                onClick={handlePageChange}
                disabled={disabled}
              />
            ))}
          </div>
          
          {/* 下一页 */}
          <NavigationButton
            icon={<ChevronRight className="h-4 w-4" />}
            onClick={goToNextPage}
            disabled={!paginationInfo.hasNext || disabled}
            tooltip="下一页"
          />
          
          {/* 跳转到最后一页 */}
          <NavigationButton
            icon={<ChevronsRight className="h-4 w-4" />}
            onClick={goToLastPage}
            disabled={!paginationInfo.hasNext || disabled}
            tooltip="最后一页"
          />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 导出
// ============================================================================

export default Pagination;

// 导出工具函数和类型
export {
  generatePageNumbers,
  calculatePaginationInfo,
  DEFAULT_PAGE_SIZE_OPTIONS,
  MAX_VISIBLE_PAGES
};
export type { PaginationProps };