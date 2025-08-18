/**
 * 信息管理系统数据表格组件
 * 提供数据展示、排序、筛选、分页和批量操作功能
 */

import React, { useState, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Check,
  X
} from 'lucide-react';
import type { 
  TableColumn, 
  SortConfig
} from '../../types/contentSettings';
import { 
  Button, 
  Select, 
  LoadingSpinner, 
  EmptyState, 
  SearchBox,
  ActionButtons
} from './BaseComponents';
import { cn } from '../../utils';

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface DataTableProps {
  data: Record<string, unknown>[];
  columns: TableColumn[];
  loading?: boolean;
  pagination?: PaginationInfo;
  sortConfig?: SortConfig | null;
  filterConfig?: Record<string, unknown>;
  selectedItems?: Record<string, unknown>[];
  showSelection?: boolean;
  showSearch?: boolean;
  showActions?: boolean;
  emptyText?: string;
  onSort?: (key: string) => void;
  onFilter?: (filters: Record<string, unknown>) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSelect?: (items: Record<string, unknown>[]) => void;
  onSelectAll?: (checked: boolean) => void;
  onEdit?: (item: Record<string, unknown>) => void;
  onDelete?: (item: Record<string, unknown>) => void;
  onPreview?: (item: Record<string, unknown>) => void;
  onAdd?: () => void;
  onRefresh?: () => void;
  onBatchDelete?: (items: Record<string, unknown>[]) => void;
  className?: string;
}

// ============================================================================
// 表格头部组件
// ============================================================================

interface TableHeaderProps {
  columns: TableColumn[];
  sortConfig: SortConfig | null;
  onSort: (key: string) => void;
  showSelection: boolean;
  selectedCount: number;
  totalCount: number;
  onSelectAll: (checked: boolean) => void;
}

/**
 * 表格头部组件
 * 处理列标题、排序和全选功能
 */
const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  sortConfig,
  onSort,
  showSelection,
  selectedCount,
  totalCount,
  onSelectAll
}) => {
  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;

  return (
    <thead className="bg-muted/50">
      <tr>
        {showSelection && (
          <th className="w-12 px-4 py-3">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(input) => {
                if (input) input.indeterminate = isIndeterminate;
              }}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
          </th>
        )}
        
        {columns.map((column) => (
          <th
            key={column.key}
            className={cn(
              'px-4 py-3 text-left text-sm font-medium text-muted-foreground',
              column.sortable && 'cursor-pointer hover:text-foreground',
              column.width && `w-${column.width}`
            )}
            onClick={() => column.sortable && onSort(column.key)}
          >
            <div className="flex items-center space-x-1">
              <span>{column.title}</span>
              {column.sortable && (
                <div className="flex flex-col">
                  <ChevronUp 
                    className={cn(
                      'h-3 w-3',
                      sortConfig?.key === column.key && sortConfig.direction === 'asc'
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    )}
                  />
                  <ChevronDown 
                    className={cn(
                      'h-3 w-3 -mt-1',
                      sortConfig?.key === column.key && sortConfig.direction === 'desc'
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    )}
                  />
                </div>
              )}
            </div>
          </th>
        ))}
        
        <th className="w-24 px-4 py-3 text-right text-sm font-medium text-muted-foreground">
          操作
        </th>
      </tr>
    </thead>
  );
};

// ============================================================================
// 表格行组件
// ============================================================================

interface TableRowProps {
  item: Record<string, unknown>;
  columns: TableColumn[];
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: (item: Record<string, unknown>) => void;
  onDelete: (item: Record<string, unknown>) => void;
  onPreview?: (item: Record<string, unknown>) => void;
  showSelection: boolean;
}

/**
 * 表格行组件
 * 渲染单行数据和操作按钮
 */
const TableRow: React.FC<TableRowProps> = ({
  item,
  columns,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onPreview,
  showSelection
}) => {
  const [showActions, setShowActions] = useState(false);

  /**
   * 渲染单元格内容
   */
  const renderCellContent = (column: TableColumn, value: unknown): React.ReactNode => {
    if (column.render) {
      return column.render(value, item);
    }

    // 处理不同数据类型的显示
    switch (column.type) {
      case 'boolean':
        return value ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <X className="h-4 w-4 text-red-600" />
        );
      
      case 'datetime':
        return value ? new Date(value as string | number | Date).toLocaleString('zh-CN') : '-';
      
      case 'json':
        return (
          <code className="text-xs bg-muted px-1 py-0.5 rounded">
            {JSON.stringify(value)}
          </code>
        );
      
      case 'text':
        if (typeof value === 'string' && value.length > 50) {
          return (
            <span title={value}>
              {value.substring(0, 50)}...
            </span>
          );
        }
        return value ? String(value) : '-';
      
      case 'number':
        return value !== null && value !== undefined ? Number(value) : '-';
      
      default:
        return value ? String(value) : '-';
    }
  };

  return (
    <tr 
      className={cn(
        'border-b hover:bg-muted/50 transition-colors',
        isSelected && 'bg-muted/30'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {showSelection && (
        <td className="px-4 py-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
        </td>
      )}
      
      {columns.map((column) => (
        <td key={column.key} className="px-4 py-3 text-sm">
          {renderCellContent(column, item[column.key]) as React.ReactNode}
        </td>
      ))}
      
      <td className="px-4 py-3 text-right">
        <div className={cn(
          'flex items-center justify-end space-x-1 transition-opacity',
          showActions ? 'opacity-100' : 'opacity-0'
        )}>
          {onPreview && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPreview(item)}
              className="h-8 w-8 p-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(item)}
            className="h-8 w-8 p-0"
          >
            编辑
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(item)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            删除
          </Button>
        </div>
      </td>
    </tr>
  );
};

// ============================================================================
// 分页组件
// ============================================================================

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

/**
 * 分页组件
 * 提供页码导航和每页条数选择
 */
const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  onPageSizeChange
}) => {
  const { page: current, pageSize, total, totalPages } = pagination;
  
  const startItem = (current - 1) * pageSize + 1;
  const endItem = Math.min(current * pageSize, total);

  const pageSizeOptions = [
    { value: '10', label: '10 条/页' },
    { value: '20', label: '20 条/页' },
    { value: '50', label: '50 条/页' },
    { value: '100', label: '100 条/页' }
  ];

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <div className="flex items-center space-x-4">
        <span className="text-sm text-muted-foreground">
          显示 {startItem} 到 {endItem} 条，共 {total} 条
        </span>
        
        <Select
          value={pageSize.toString()}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          options={pageSizeOptions}
          className="w-32"
        />
      </div>
      
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={current === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(current - 1)}
          disabled={current === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="px-3 py-1 text-sm">
          {current} / {totalPages}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(current + 1)}
          disabled={current === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={current === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// 主数据表格组件
// ============================================================================

/**
 * 数据表格组件
 * 集成数据展示、排序、筛选、分页和批量操作功能
 */
export const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  loading = false,
  pagination,
  sortConfig,
  filterConfig,
  selectedItems = [],
  showSelection = false,
  showSearch = true,
  showActions = true,
  emptyText = '暂无数据',
  onSort,
  onFilter,
  onPageChange,
  onPageSizeChange,
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onPreview,
  onAdd,
  onRefresh,
  onBatchDelete,
  className
}) => {
  const [searchValue, setSearchValue] = useState<string>((filterConfig?.search as string) || '');

  /**
   * 处理搜索
   */
  const handleSearch = (value: string) => {
    setSearchValue(value);
    onFilter?.({ ...filterConfig, search: value });
  };

  /**
   * 清除搜索
   */
  const handleClearSearch = () => {
    setSearchValue('');
    onFilter?.({ ...filterConfig, search: '' });
  };

  /**
   * 获取选中项的ID列表
   */
  const selectedIds = useMemo(() => {
    return selectedItems.map(item => item.id);
  }, [selectedItems]);

  /**
   * 检查项目是否被选中
   */
  const isItemSelected = (item: Record<string, unknown>) => {
    return selectedIds.includes(item.id);
  };

  /**
   * 处理单项选择
   */
  const handleItemSelect = (item: Record<string, unknown>, checked: boolean) => {
    if (checked) {
      onSelect?.([...selectedItems, item]);
    } else {
      onSelect?.(selectedItems.filter((selected: Record<string, unknown>) => (selected as any).id !== (item as any).id));
    }
  };

  /**
   * 处理全选
   */
  const handleSelectAll = (checked: boolean) => {
    if (onSelectAll) {
      onSelectAll(checked);
    } else {
      if (checked) {
        onSelect?.(data);
      } else {
        onSelect?.([]);
      }
    }
  };

  return (
    <div className={cn('bg-background rounded-lg border', className)}>
      {/* 工具栏 */}
      {(showSearch || showActions) && (
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            {showSearch && (
              <SearchBox
                value={searchValue}
                onChange={handleSearch}
                onClear={handleClearSearch}
                placeholder="搜索内容..."
                className="w-64"
              />
            )}
            
            {selectedItems.length > 0 && onBatchDelete && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onBatchDelete(selectedItems)}
              >
                批量删除 ({selectedItems.length})
              </Button>
            )}
          </div>
          
          {showActions && (
            <ActionButtons
              onAdd={onAdd}
              onRefresh={onRefresh}
              loading={loading}
            />
          )}
        </div>
      )}
      
      {/* 表格内容 */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            title={emptyText}
            description="没有找到匹配的数据"
            action={
              onAdd ? (
                <Button onClick={onAdd}>
                  添加第一条数据
                </Button>
              ) : null
            }
          />
        ) : (
          <table className="w-full">
            <TableHeader
              columns={columns}
              sortConfig={sortConfig || null}
              onSort={onSort!}
              showSelection={showSelection}
              selectedCount={selectedItems.length}
              totalCount={data.length}
              onSelectAll={handleSelectAll}
            />
            
            <tbody>
              {data.map((item: Record<string, unknown>) => (
                <TableRow
                  key={(item.id as string) || Math.random().toString()}
                  item={item}
                  columns={columns}
                  isSelected={isItemSelected(item)}
                  onSelect={(checked) => handleItemSelect(item, checked)}
                  onEdit={onEdit!}
                  onDelete={onDelete!}
                  onPreview={onPreview}
                  showSelection={showSelection}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* 分页 */}
      {pagination && data.length > 0 && (
        <Pagination
          pagination={pagination}
          onPageChange={onPageChange!}
          onPageSizeChange={onPageSizeChange!}
        />
      )}
    </div>
  );
};

export default DataTable;