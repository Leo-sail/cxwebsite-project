import React, { useState, useMemo, useCallback } from 'react';
import { useTheme } from '../../hooks/useTheme';

/**
 * 表格列定义接口
 */
export interface TableColumn<T = TableRowData> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  fixed?: 'left' | 'right';
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  sorter?: (a: T, b: T) => number;
  filters?: Array<{ text: string; value: unknown }>;
  onFilter?: (value: unknown, record: T) => boolean;
  ellipsis?: boolean;
  className?: string;
}

/**
 * 表格数据行接口
 */
export interface TableRowData {
  key?: string | number;
  [key: string]: unknown;
}

/**
 * 排序配置接口
 */
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

/**
 * 筛选配置接口
 */
export interface FilterConfig {
  [key: string]: unknown[];
}

/**
 * 分页配置接口
 */
export interface PaginationConfig {
  current?: number;
  pageSize: number;
  total?: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => string;
  pageSizeOptions?: string[];
  onChange?: (page: number, pageSize: number) => void;
}

/**
 * 表格属性接口
 */
export interface ThemedTableProps<T = TableRowData> {
  columns: TableColumn<T>[];
  dataSource: T[];
  loading?: boolean;
  variant?: 'default' | 'striped' | 'bordered' | 'hover' | 'compact';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  pagination?: PaginationConfig | false;
  rowSelection?: {
    type?: 'checkbox' | 'radio';
    selectedRowKeys?: (string | number)[];
    onChange?: (selectedRowKeys: (string | number)[], selectedRows: T[]) => void;
    getCheckboxProps?: (record: T) => { disabled?: boolean; name?: string };
  };
  expandable?: {
    expandedRowKeys?: (string | number)[];
    onExpand?: (expanded: boolean, record: T) => void;
    expandedRowRender?: (record: T, index: number) => React.ReactNode;
    rowExpandable?: (record: T) => boolean;
  };
  scroll?: { x?: number | string; y?: number | string };
  sticky?: boolean;
  showHeader?: boolean;
  title?: () => React.ReactNode;
  footer?: () => React.ReactNode;
  empty?: React.ReactNode;
  rowKey?: string | ((record: T) => string | number);
  onRow?: (record: T, index: number) => React.HTMLAttributes<HTMLTableRowElement>;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 主题化表格组件
 */
export const ThemedTable = <T extends TableRowData = TableRowData>({
  columns,
  dataSource,
  loading = false,
  variant = 'default',
  size = 'md',
  pagination,
  rowSelection,
  expandable,
  scroll,
  sticky = false,
  showHeader = true,
  title,
  footer,
  empty,
  rowKey = 'key',
  onRow,
  className = '',
  style,
  ...props
}: ThemedTableProps<T>) => {
  const { currentTheme } = useTheme();
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filterConfig] = useState<FilterConfig>({});
  const [expandedKeys, setExpandedKeys] = useState<(string | number)[]>(
    expandable?.expandedRowKeys || []
  );
  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>(
    rowSelection?.selectedRowKeys || []
  );

  /**
   * 获取行的key值
   */
  const getRowKey = useCallback((record: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    const key = record[rowKey as keyof T];
    return (typeof key === 'string' || typeof key === 'number') ? key : index;
  }, [rowKey]);

  /**
   * 处理排序
   */
  const handleSort = useCallback((column: TableColumn<T>) => {
    if (!column.sortable) return;

    const newDirection = 
      sortConfig?.key === column.key && sortConfig.direction === 'asc' 
        ? 'desc' 
        : 'asc';
    
    setSortConfig({ key: column.key, direction: newDirection });
  }, [sortConfig]);



  /**
   * 处理展开/收起
   */
  const handleExpand = useCallback((record: T) => {
    const key = getRowKey(record, 0);
    const newExpandedKeys = expandedKeys.includes(key)
      ? expandedKeys.filter(k => k !== key)
      : [...expandedKeys, key];
    
    setExpandedKeys(newExpandedKeys);
    expandable?.onExpand?.(!expandedKeys.includes(key), record);
  }, [expandedKeys, expandable, getRowKey]);

  /**
   * 处理行选择
   */
  const handleRowSelect = useCallback((record: T, selected: boolean) => {
    const key = getRowKey(record, 0);
    let newSelectedKeys: (string | number)[];
    
    if (rowSelection?.type === 'radio') {
      newSelectedKeys = selected ? [key] : [];
    } else {
      newSelectedKeys = selected
        ? [...selectedKeys, key]
        : selectedKeys.filter(k => k !== key);
    }
    
    setSelectedKeys(newSelectedKeys);
    const selectedRows = dataSource.filter(item => 
      newSelectedKeys.includes(getRowKey(item, 0))
    );
    rowSelection?.onChange?.(newSelectedKeys, selectedRows);
  }, [selectedKeys, rowSelection, dataSource, getRowKey]);

  /**
   * 处理全选
   */
  const handleSelectAll = useCallback((selected: boolean) => {
    const newSelectedKeys = selected 
      ? dataSource.map((item, index) => getRowKey(item, index))
      : [];
    
    setSelectedKeys(newSelectedKeys);
    const selectedRows = selected ? dataSource : [];
    rowSelection?.onChange?.(newSelectedKeys, selectedRows);
  }, [dataSource, rowSelection, getRowKey]);

  /**
   * 处理后的数据（排序和筛选）
   */
  const processedData = useMemo(() => {
    let result = [...dataSource];

    // 应用筛选
    Object.entries(filterConfig).forEach(([columnKey, values]) => {
      if (values.length > 0) {
        const column = columns.find(col => col.key === columnKey);
        if (column?.onFilter) {
          result = result.filter(record => 
            values.some(value => column.onFilter!(value, record))
          );
        }
      }
    });

    // 应用排序
    if (sortConfig) {
      const column = columns.find(col => col.key === sortConfig.key);
      if (column) {
        result.sort((a, b) => {
          let compareResult = 0;
          
          if (column.sorter) {
            compareResult = column.sorter(a, b);
          } else if (column.dataIndex) {
            const aValue = a[column.dataIndex];
            const bValue = b[column.dataIndex];
            
            if (aValue < bValue) compareResult = -1;
            else if (aValue > bValue) compareResult = 1;
          }
          
          return sortConfig.direction === 'desc' ? -compareResult : compareResult;
        });
      }
    }

    return result;
  }, [dataSource, sortConfig, filterConfig, columns]);

  /**
   * 获取表格样式类名
   */
  const getTableClasses = () => {
    const baseClasses = [
      'themed-table',
      `themed-table--${variant}`,
      `themed-table--${size}`,
      'w-full border-collapse'
    ];

    if (sticky) baseClasses.push('themed-table--sticky');
    if (loading) baseClasses.push('themed-table--loading');
    
    return baseClasses.join(' ');
  };

  /**
   * 获取表格样式
   */
  const getTableStyles = () => {
    const styles: React.CSSProperties = {
      ...style,
      '--table-border-color': `var(--color-border-${currentTheme})`,
      '--table-header-bg': `var(--color-bg-secondary-${currentTheme})`,
      '--table-row-hover-bg': `var(--color-bg-hover-${currentTheme})`,
      '--table-selected-bg': `var(--color-bg-selected-${currentTheme})`,
    } as React.CSSProperties;

    if (scroll?.y) {
      styles.maxHeight = scroll.y;
      styles.overflowY = 'auto';
    }

    return styles;
  };

  /**
   * 渲染表头
   */
  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <thead className="themed-table__header">
        <tr>
          {/* 选择列 */}
          {rowSelection && (
            <th className="themed-table__cell themed-table__cell--selection">
              {rowSelection.type !== 'radio' && (
                <input
                  type="checkbox"
                  checked={selectedKeys.length === dataSource.length && dataSource.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="themed-table__checkbox"
                />
              )}
            </th>
          )}
          
          {/* 展开列 */}
          {expandable && (
            <th className="themed-table__cell themed-table__cell--expand"></th>
          )}
          
          {/* 数据列 */}
          {columns.map((column) => (
            <th
              key={column.key}
              className={`themed-table__cell themed-table__cell--header ${
                column.className || ''
              }`}
              style={{
                width: column.width,
                minWidth: column.minWidth,
                maxWidth: column.maxWidth,
                textAlign: column.align || 'left'
              }}
              onClick={() => handleSort(column)}
            >
              <div className="flex items-center gap-2">
                <span>{column.title}</span>
                {column.sortable && (
                  <span className="themed-table__sort-icon">
                    {sortConfig?.key === column.key ? (
                      sortConfig.direction === 'asc' ? '↑' : '↓'
                    ) : (
                      '↕'
                    )}
                  </span>
                )}
              </div>
            </th>
          ))}
        </tr>
      </thead>
    );
  };

  /**
   * 渲染表格行
   */
  const renderRow = (record: T, index: number) => {
    const key = getRowKey(record, index);
    const isSelected = selectedKeys.includes(key);
    const isExpanded = expandedKeys.includes(key);
    const rowProps = onRow?.(record, index) || {};

    return (
      <React.Fragment key={key}>
        <tr
          {...rowProps}
          className={`themed-table__row ${
            isSelected ? 'themed-table__row--selected' : ''
          } ${rowProps.className || ''}`}
        >
          {/* 选择列 */}
          {rowSelection && (
            <td className="themed-table__cell themed-table__cell--selection">
              <input
                type={rowSelection.type || 'checkbox'}
                name={rowSelection.type === 'radio' ? 'table-radio' : undefined}
                checked={isSelected}
                onChange={(e) => handleRowSelect(record, e.target.checked)}
                className="themed-table__checkbox"
                {...(rowSelection.getCheckboxProps?.(record) || {})}
              />
            </td>
          )}
          
          {/* 展开列 */}
          {expandable && (
            <td className="themed-table__cell themed-table__cell--expand">
              {expandable.rowExpandable?.(record) !== false && (
                <button
                  onClick={() => handleExpand(record)}
                  className="themed-table__expand-btn"
                >
                  {isExpanded ? '−' : '+'}
                </button>
              )}
            </td>
          )}
          
          {/* 数据列 */}
          {columns.map((column) => {
            const value = column.dataIndex ? record[column.dataIndex] : undefined;
            const cellContent = column.render 
              ? column.render(value, record, index)
              : value as React.ReactNode;

            return (
              <td
                key={column.key}
                className={`themed-table__cell ${column.className || ''}`}
                style={{
                  textAlign: column.align || 'left',
                  width: column.width,
                  minWidth: column.minWidth,
                  maxWidth: column.maxWidth
                }}
              >
                {column.ellipsis ? (
                  <div className="truncate" title={String(cellContent)}>
                    {cellContent}
                  </div>
                ) : (
                  cellContent
                )}
              </td>
            );
          })}
        </tr>
        
        {/* 展开行 */}
        {expandable && isExpanded && expandable.expandedRowRender && (
          <tr className="themed-table__expanded-row">
            <td 
              colSpan={
                columns.length + 
                (rowSelection ? 1 : 0) + 
                (expandable ? 1 : 0)
              }
              className="themed-table__cell themed-table__cell--expanded"
            >
              {expandable.expandedRowRender(record, index)}
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  /**
   * 渲染表格主体
   */
  const renderBody = () => {
    if (loading) {
      return (
        <tbody>
          <tr>
            <td 
              colSpan={
                columns.length + 
                (rowSelection ? 1 : 0) + 
                (expandable ? 1 : 0)
              }
              className="themed-table__cell themed-table__cell--loading"
            >
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
                <span className="ml-2">加载中...</span>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    if (processedData.length === 0) {
      return (
        <tbody>
          <tr>
            <td 
              colSpan={
                columns.length + 
                (rowSelection ? 1 : 0) + 
                (expandable ? 1 : 0)
              }
              className="themed-table__cell themed-table__cell--empty"
            >
              <div className="flex items-center justify-center py-8 text-gray-500">
                {empty || '暂无数据'}
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody className="themed-table__body">
        {processedData.map((record, index) => renderRow(record, index))}
      </tbody>
    );
  };

  return (
    <div className={`themed-table-wrapper ${className}`}>
      {/* 表格标题 */}
      {title && (
        <div className="themed-table__title mb-4">
          {title()}
        </div>
      )}

      {/* 表格容器 */}
      <div 
        className="themed-table__container"
        style={{
          overflowX: scroll?.x ? 'auto' : undefined,
          maxWidth: scroll?.x
        }}
      >
        <table 
          className={getTableClasses()}
          style={getTableStyles()}
          {...props}
        >
          {renderHeader()}
          {renderBody()}
        </table>
      </div>

      {/* 表格底部 */}
      {footer && (
        <div className="themed-table__footer mt-4">
          {footer()}
        </div>
      )}

      {/* 分页 */}
      {pagination && (
        <div className="themed-table__pagination mt-4">
          <TablePagination {...pagination} />
        </div>
      )}
    </div>
  );
};

/**
 * 表格分页组件
 */
export const TablePagination: React.FC<PaginationConfig> = ({
  current = 1,
  pageSize,
  total = 0,
  showSizeChanger = true,
  showQuickJumper = false,
  showTotal,
  pageSizeOptions = ['10', '20', '50', '100'],
  onChange
}) => {
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (current - 1) * pageSize + 1;
  const endIndex = Math.min(current * pageSize, total);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== current) {
      onChange?.(page, pageSize);
    }
  };

  const handleSizeChange = (newSize: number) => {
    const newPage = Math.ceil(((current - 1) * pageSize + 1) / newSize);
    onChange?.(newPage, newSize);
  };

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (current > 4) {
        pages.push('...');
      }
      
      const start = Math.max(2, current - 2);
      const end = Math.min(totalPages - 1, current + 2);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (current < totalPages - 3) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-between">
      {/* 总数显示 */}
      <div className="text-sm text-gray-600">
        {showTotal ? (
          showTotal(total, [startIndex, endIndex])
        ) : (
          `共 ${total} 条，第 ${startIndex}-${endIndex} 条`
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* 页面大小选择器 */}
        {showSizeChanger && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">每页</span>
            <select
              value={pageSize}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span className="text-sm text-gray-600">条</span>
          </div>
        )}

        {/* 页码导航 */}
        <div className="flex items-center gap-1">
          {/* 上一页 */}
          <button
            onClick={() => handlePageChange(current - 1)}
            disabled={current <= 1}
            className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            上一页
          </button>

          {/* 页码 */}
          {renderPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && handlePageChange(page)}
              disabled={typeof page === 'string'}
              className={`px-3 py-1 text-sm border border-gray-300 rounded ${
                page === current
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'hover:bg-gray-50'
              } ${typeof page === 'string' ? 'cursor-default' : ''}`}
            >
              {page}
            </button>
          ))}

          {/* 下一页 */}
          <button
            onClick={() => handlePageChange(current + 1)}
            disabled={current >= totalPages}
            className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            下一页
          </button>
        </div>

        {/* 快速跳转 */}
        {showQuickJumper && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">跳至</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const page = parseInt((e.target as HTMLInputElement).value);
                  handlePageChange(page);
                }
              }}
            />
            <span className="text-sm text-gray-600">页</span>
          </div>
        )}
      </div>
    </div>
  );
};



export default ThemedTable;