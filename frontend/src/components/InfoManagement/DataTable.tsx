/**
 * 数据表格组件
 * 用于显示和管理信息管理页面的数据
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Checkbox,
  Menu,
  MenuItem,
  Chip,
  Tooltip,
  Box,
  Typography,
  CircularProgress,
  IconButton
} from '@mui/material';
import { TableHeader } from '../ui/table';
import { TooltipProvider, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  User,
  Hash
} from 'lucide-react';
import type {
  DataTableProps,
  TableColumn,
  TableData,
  SortDirection
} from '../../types/infoManagement';
import type { ContentTableType } from '../../types/contentSettings';

// ============================================================================
// 列配置
// ============================================================================

/**
 * 默认列配置
 */
const DEFAULT_COLUMNS: Record<ContentTableType, TableColumn[]> = {
  site_content: [
    {
      key: 'description',
      title: '描述',
      width: 350,
      searchable: true,
      render: (value) => value || <span className="text-gray-400">-</span>
    },
    {
      key: 'created_at',
      title: '创建时间',
      width: 200,
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('zh-CN')
    }
  ],
  navigation: [
    {
      key: 'title',
      title: '标题',
      width: 200,
      sortable: true,
      searchable: true
    },
    {
      key: 'url',
      title: 'URL',
      width: 250,
      searchable: true,
      render: (value) => (
        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
          {value}
        </code>
      )
    },
    {
      key: 'order',
      title: '排序',
      width: 80,
      sortable: true,
      render: (value) => (
        <Chip 
          label={value} 
          variant="outlined" 
          size="small"
          sx={{ fontFamily: 'monospace' }}
        />
      )
    },
    {
      key: 'is_active',
      title: '状态',
      width: 100,
      sortable: true,
      render: (value) => (
        <Chip 
          label={value ? '启用' : '禁用'}
          color={value ? 'primary' : 'default'}
          size="small"
        />
      )
    },
    {
      key: 'created_at',
      title: '创建时间',
      width: 150,
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('zh-CN')
    }
  ],
  ui_texts: [
    {
      key: 'key',
      title: '键名',
      width: 200,
      sortable: true,
      searchable: true,
      render: (value) => (
        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
          {value}
        </code>
      )
    },
    {
      key: 'value',
      title: '文本内容',
      width: 300,
      searchable: true,
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'category',
      title: '分类',
      width: 120,
      sortable: true,
      render: (value) => value ? (
        <Chip label={value} variant="outlined" size="small" />
      ) : (
        <span style={{ color: '#9ca3af' }}>-</span>
      )
    },
    {
      key: 'created_at',
      title: '创建时间',
      width: 150,
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('zh-CN')
    }
  ],
  page_sections: [
    {
      key: 'name',
      title: '区域名称',
      width: 200,
      sortable: true,
      searchable: true
    },
    {
      key: 'title',
      title: '显示标题',
      width: 200,
      searchable: true
    },
    {
      key: 'order',
      title: '排序',
      width: 80,
      sortable: true,
      render: (value) => (
        <Chip 
          label={value} 
          variant="outlined" 
          size="small"
          sx={{ fontFamily: 'monospace' }}
        />
      )
    },
    {
      key: 'is_visible',
      title: '可见性',
      width: 100,
      sortable: true,
      render: (value) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? '显示' : '隐藏'}
        </Badge>
      )
    },
    {
      key: 'created_at',
      title: '创建时间',
      width: 150,
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('zh-CN')
    }
  ],
  seo_metadata: [
    {
      key: 'page',
      title: '页面',
      width: 150,
      sortable: true,
      searchable: true,
      render: (value) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'title',
      title: 'SEO标题',
      width: 250,
      searchable: true,
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'description',
      title: 'SEO描述',
      width: 300,
      searchable: true,
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value || <span className="text-gray-400">-</span>}
        </div>
      )
    },
    {
      key: 'created_at',
      title: '创建时间',
      width: 150,
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('zh-CN')
    }
  ]
};

// ============================================================================
// 子组件
// ============================================================================

/**
 * 排序图标组件
 */
interface SortIconProps {
  direction?: SortDirection;
}

const SortIcon: React.FC<SortIconProps> = ({ direction }) => {
  if (direction === 'asc') {
    return <ArrowUp className="h-4 w-4" />;
  }
  if (direction === 'desc') {
    return <ArrowDown className="h-4 w-4" />;
  }
  return <ArrowUpDown className="h-4 w-4 opacity-50" />;
};

/**
 * 表头单元格组件
 */
interface TableHeaderCellProps {
  column: TableColumn;
  sortField?: string;
  sortDirection?: SortDirection;
  onSort?: (field: string, direction: SortDirection) => void;
}

const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  column,
  sortField,
  sortDirection,
  onSort
}) => {
  const isSorted = sortField === column.key;
  const currentDirection = isSorted ? sortDirection : undefined;
  
  const handleSort = useCallback(() => {
    if (!column.sortable || !onSort) return;
    
    let newDirection: SortDirection = 'asc';
    if (isSorted) {
      newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    }
    
    onSort(column.key, newDirection);
  }, [column.key, column.sortable, isSorted, currentDirection, onSort]);
  
  return (
    <TableHead
      className={`
        ${column.width ? `w-[${column.width}px]` : ''}
        ${column.sortable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''}
      `}
      onClick={handleSort}
    >
      <div className="flex items-center gap-2">
        <span>{column.title}</span>
        {column.sortable && (
          <SortIcon direction={currentDirection} />
        )}
      </div>
    </TableHead>
  );
};

/**
 * 行操作菜单组件
 */
interface RowActionsProps {
  record: TableData;
  onEdit?: (record: TableData) => void;
  onDelete?: (record: TableData) => void;
  onView?: (record: TableData) => void;
  onCopy?: (record: TableData) => void;
  customActions?: Array<{
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: (record: TableData) => void;
    variant?: 'default' | 'destructive';
  }>;
}

const RowActions: React.FC<RowActionsProps> = ({
  record,
  onEdit,
  onDelete,
  onView,
  onCopy,
  customActions = []
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: () => void) => {
    action();
    handleClose();
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{ padding: '4px' }}
      >
        <MoreHorizontal size={16} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {onView && (
          <MenuItem onClick={() => handleAction(() => onView(record))}>
            <Eye size={16} style={{ marginRight: 8 }} />
            查看详情
          </MenuItem>
        )}
        {onEdit && (
          <MenuItem onClick={() => handleAction(() => onEdit(record))}>
            <Edit size={16} style={{ marginRight: 8 }} />
            编辑
          </MenuItem>
        )}
        {onCopy && (
          <MenuItem onClick={() => handleAction(() => onCopy(record))}>
            <Copy size={16} style={{ marginRight: 8 }} />
            复制
          </MenuItem>
        )}
        
        {/* 自定义操作 */}
        {customActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <MenuItem
              key={index}
              onClick={() => handleAction(() => action.onClick(record))}
              sx={action.variant === 'destructive' ? { color: 'error.main' } : {}}
            >
              <Icon size={16} style={{ marginRight: 8 }} />
              {action.label}
            </MenuItem>
          );
        })}
        
        {onDelete && (
          <MenuItem
            onClick={() => handleAction(() => onDelete(record))}
            sx={{ color: 'error.main' }}
          >
            <Trash2 size={16} style={{ marginRight: 8 }} />
            删除
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

/**
 * 空状态组件
 */
interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = '暂无数据',
  description = '当前没有任何数据，请添加一些内容。',
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 text-6xl opacity-20">📋</div>
      <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

// ============================================================================
// 主组件
// ============================================================================

/**
 * 数据表格组件
 */
export const DataTable: React.FC<DataTableProps> = ({
  data = [],
  columns,
  tableName,
  loading = false,
  selectedRows = [],
  onRowSelect,
  onRowsSelect,
  sortField,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
  onView,
  onCopy,
  customActions,
  emptyState,
  className = '',
  rowClassName,
  cellClassName,
  enableSelection = true,
  enableActions = true,
  stickyHeader = true
}) => {
  // ============================================================================
  // 状态管理
  // ============================================================================
  
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  
  // ============================================================================
  // 计算属性
  // ============================================================================
  
  /**
   * 获取列配置
   */
  const tableColumns = useMemo(() => {
    if (columns) return columns;
    if (tableName) return DEFAULT_COLUMNS[tableName] || [];
    return [];
  }, [columns, tableName]);
  
  /**
   * 是否全选
   */
  const isAllSelected = useMemo(() => {
    return data.length > 0 && selectedRows.length === data.length;
  }, [data.length, selectedRows.length]);
  
  /**
   * 是否部分选中
   */
  const isIndeterminate = useMemo(() => {
    return selectedRows.length > 0 && selectedRows.length < data.length;
  }, [selectedRows.length, data.length]);
  
  // ============================================================================
  // 事件处理
  // ============================================================================
  
  /**
   * 处理全选
   */
  const handleSelectAll = useCallback((checked: boolean) => {
    if (!enableSelection || !onRowsSelect) return;
    
    if (checked) {
      const allIds = data.map(item => item.id);
      onRowsSelect(allIds);
    } else {
      onRowsSelect([]);
    }
  }, [enableSelection, onRowsSelect, data]);
  
  /**
   * 处理单行选择
   */
  const handleRowSelect = useCallback((id: string, checked: boolean) => {
    if (!enableSelection || !onRowSelect) return;
    onRowSelect(id, checked);
  }, [enableSelection, onRowSelect]);
  
  /**
   * 处理排序
   */
  const handleSort = useCallback((field: string, direction: SortDirection) => {
    onSort?.(field, direction);
  }, [onSort]);
  
  // ============================================================================
  // 渲染
  // ============================================================================
  
  if (data.length === 0 && !loading) {
    return (
      <div className={`border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
        <EmptyState {...emptyState} />
      </div>
    );
  }
  
  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${className}`}>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className={stickyHeader ? 'sticky top-0 bg-white dark:bg-gray-900 z-10' : ''}>
            <TableRow>
              {/* 选择列 */}
              {enableSelection && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onCheckedChange={handleSelectAll}
                    aria-label="选择全部"
                  />
                </TableHead>
              )}
              
              {/* 数据列 */}
              {tableColumns.map((column) => (
                <TableHeaderCell
                  key={column.key}
                  column={column}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              ))}
              
              {/* 操作列 */}
              {enableActions && (
                <TableHead className="w-12">
                  <span className="sr-only">操作</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            <AnimatePresence>
              {data.map((record, index) => {
                const isSelected = selectedRows.includes(record.id);
                const isHovered = hoveredRow === record.id;
                
                return (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className={`
                      border-b border-gray-200 dark:border-gray-700
                      hover:bg-gray-50 dark:hover:bg-gray-800
                      transition-colors duration-150
                      ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                      ${rowClassName ? rowClassName(record, index) : ''}
                    `}
                    onMouseEnter={() => setHoveredRow(record.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {/* 选择列 */}
                    {enableSelection && (
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleRowSelect(record.id, checked as boolean)}
                          aria-label={`选择行 ${record.id}`}
                        />
                      </TableCell>
                    )}
                    
                    {/* 数据列 */}
                    {tableColumns.map((column) => {
                      const value = record[column.key];
                      const cellContent = column.render ? column.render(value, record, index) : value;
                      
                      return (
                        <TableCell
                          key={column.key}
                          className={`
                            ${column.width ? `w-[${column.width}px]` : ''}
                            ${cellClassName ? cellClassName(column, record, index) : ''}
                          `}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>{cellContent}</div>
                              </TooltipTrigger>
                              {column.tooltip && (
                                <TooltipContent>
                                  {column.tooltip(value, record)}
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      );
                    })}
                    
                    {/* 操作列 */}
                    {enableActions && (
                      <TableCell>
                        <div className={`transition-opacity duration-150 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                          <RowActions
                            record={record}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onView={onView}
                            onCopy={onCopy}
                            customActions={customActions}
                          />
                        </div>
                      </TableCell>
                    )}
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
      
      {/* 加载状态 */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-500" />
            加载中...
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 导出
// ============================================================================

export default DataTable;

// 导出类型和配置
export { DEFAULT_COLUMNS };
export type { DataTableProps, TableColumn };