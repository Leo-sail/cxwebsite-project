/**
 * 数据表格组件 - 支持响应式设计
 * 移动端显示卡片视图，桌面端显示表格视图
 */
import { type ReactNode } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '../utils';
import LoadingSpinner from './LoadingSpinner';
import Pagination from './Pagination';
import { useResponsive } from '../hooks/useResponsive';
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  width?: string;
  sortable?: boolean;
  render?: (value: unknown, record: T, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  empty?: ReactNode;
  rowKey?: keyof T | ((record: T) => string | number);
  className?: string;
  sortConfig?: SortConfig;
  onSort?: (key: string) => void;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number) => void;
  };
  onRowClick?: (record: T, index: number) => void;
}

/**
 * 数据表格组件
 */
function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  empty,
  rowKey = 'id',
  className,
  sortConfig,
  onSort,
  pagination,
  onRowClick,
}: DataTableProps<T>) {
  const { isMobile, isTablet } = useResponsive();
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext?.theme === 'dark';

  // 响应式配置
  const cardSpacing = isMobile ? 'space-y-3' : 'space-y-4';
  const cardPadding = isMobile ? 'p-3' : 'p-4';
  const cardRadius = isMobile ? 'rounded-lg' : 'rounded-xl';
  const tablePadding = isMobile ? 'px-4 py-3' : isTablet ? 'px-5 py-3' : 'px-6 py-4';
  const headerPadding = isMobile ? 'px-4 py-2' : isTablet ? 'px-5 py-3' : 'px-6 py-3';
  /**
   * 获取行的唯一键
   */
  const getRowKey = (record: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    const keyValue = record[rowKey];
    return (typeof keyValue === 'string' || typeof keyValue === 'number') ? keyValue : index;
  };

  /**
   * 获取单元格值
   */
  const getCellValue = (record: T, column: Column<T>) => {
    if (typeof column.key === 'string' && column.key.includes('.')) {
      // 支持嵌套属性，如 'user.name'
      const keys = column.key.split('.');
      let value: unknown = record;
      for (const key of keys) {
        value = (value as Record<string, unknown>)?.[key];
        if (value === undefined || value === null) break;
      }
      return value;
    }
    return record[column.key as keyof T];
  };

  /**
   * 处理排序
   */
  const handleSort = (key: string) => {
    if (onSort) {
      onSort(key);
    }
  };

  /**
   * 获取排序图标
   */
  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return null;
    }

    return sortConfig.direction === 'asc' ? (
      <ChevronUpIcon className="h-4 w-4" />
    ) : (
      <ChevronDownIcon className="h-4 w-4" />
    );
  };

  /**
   * 渲染空状态
   */
  const renderEmpty = () => {
    if (empty) {
      return empty;
    }

    const emptyPadding = isMobile ? 'py-8' : 'py-12';
    const iconSize = isMobile ? 'h-10 w-10' : 'h-12 w-12';

    return (
      <div className={cn('text-center', emptyPadding)}>
        <div className={isDark ? 'text-gray-400' : 'text-gray-500'}>
          <svg
            className={cn('mx-auto', iconSize, isDark ? 'text-gray-500' : 'text-gray-400')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className={cn(
            'mt-2 text-sm font-medium',
            isMobile ? 'text-xs' : 'text-sm',
            isDark ? 'text-gray-200' : 'text-gray-900'
          )}>暂无数据</h3>
          <p className={cn(
            'mt-1 text-sm',
            isMobile ? 'text-xs' : 'text-sm',
            isDark ? 'text-gray-400' : 'text-gray-500'
          )}>没有找到相关记录</p>
        </div>
      </div>
    );
  };

  /**
   * 渲染移动端卡片视图
   */
  const renderMobileCards = (): ReactNode => {
    const loadingPadding = isMobile ? 'px-3 py-8' : 'px-4 py-12';
    const containerPadding = isMobile ? 'px-3 py-3' : 'px-4 py-4';

    if (loading) {
      return (
        <div className={loadingPadding}>
          <LoadingSpinner size={isMobile ? 'md' : 'lg'} text="加载中..." className="justify-center" />
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className={containerPadding}>
          {renderEmpty()}
        </div>
      );
    }

    return (
      <div className={cardSpacing}>
        {data.map((record, index) => {
          const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
          const cardBorder = isDark ? 'border-gray-700' : 'border-gray-200';
          const cardShadow = isDark ? 'shadow-lg' : 'shadow-sm';
          const hoverEffect = onRowClick ? (
            isDark 
              ? 'cursor-pointer hover:bg-gray-700 hover:shadow-xl active:scale-[0.98]' 
              : 'cursor-pointer hover:shadow-md hover:bg-gray-50 active:scale-[0.98]'
          ) : '';

          return (
            <div
              key={getRowKey(record, index)}
              className={cn(
                cardBg,
                cardRadius,
                cardShadow,
                'border',
                cardBorder,
                cardPadding,
                'space-y-3',
                'transition-all duration-200',
                hoverEffect
              )}
              onClick={() => onRowClick?.(record, index)}
            >
              {columns.map((column, columnIndex) => {
                const value = getCellValue(record, column);
                const content: ReactNode = column.render
                  ? column.render(value, record, index)
                  : String(value ?? '');

                const labelTextSize = isMobile ? 'text-xs' : 'text-sm';
                const contentTextSize = isMobile ? 'text-xs' : 'text-sm';
                const labelColor = isDark ? 'text-gray-400' : 'text-gray-500';
                const contentColor = isDark ? 'text-gray-200' : 'text-gray-900';

                return (
                  <div key={columnIndex} className="flex justify-between items-start gap-3">
                    <span className={cn(
                      labelTextSize,
                      'font-medium',
                      labelColor,
                      'min-w-0 flex-shrink-0'
                    )}>
                      {column.title}:
                    </span>
                    <span className={cn(
                      contentTextSize,
                      contentColor,
                      'text-right flex-1 min-w-0 break-words'
                    )}>
                      {content}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* 移动端卡片视图 */}
      {isMobile ? (
        renderMobileCards()
      ) : (
        /* 桌面端表格视图 */
        <div className={cn(
          'overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg',
          isDark ? 'ring-gray-700' : 'ring-black'
        )}>
          <div className="overflow-x-auto">
            <table className={cn(
              'min-w-full divide-y',
              isDark ? 'divide-gray-700' : 'divide-gray-200'
            )}>
            {/* 表头 */}
            <thead className={isDark ? 'bg-gray-800' : 'bg-gray-50'}>
              <tr>
                {columns.map((column, index) => {
                  const columnKey = typeof column.key === 'string' ? column.key : String(column.key);
                  const isSortable = column.sortable && onSort;
                  
                  return (
                    <th
                      key={index}
                      scope="col"
                      className={cn(
                        headerPadding,
                        'text-xs font-medium uppercase tracking-wider transition-colors',
                        isDark ? 'text-gray-300' : 'text-gray-500',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right',
                        isSortable && (isDark ? 'cursor-pointer hover:bg-gray-800' : 'cursor-pointer hover:bg-gray-100')
                      )}
                      style={{ width: column.width }}
                      onClick={() => isSortable && handleSort(columnKey)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column.title}</span>
                        {isSortable && (
                          <span className="flex-shrink-0">
                            {getSortIcon(columnKey) || (
                              <div className="flex flex-col">
                                <ChevronUpIcon className={cn(
                                  'h-3 w-3',
                                  isDark ? 'text-gray-500' : 'text-gray-300'
                                )} />
                                <ChevronDownIcon className={cn(
                                  'h-3 w-3 -mt-1',
                                  isDark ? 'text-gray-500' : 'text-gray-300'
                                )} />
                              </div>
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* 表体 */}
            <tbody className={cn(
              isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200',
              'divide-y'
            )}>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className={tablePadding}>
                    <LoadingSpinner size={isTablet ? 'md' : 'lg'} text="加载中..." className="justify-center" />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className={tablePadding}>
                    {renderEmpty()}
                  </td>
                </tr>
              ) : (
                data.map((record, index) => (
                  <tr
                    key={getRowKey(record, index)}
                    className={cn(
                      'transition-colors',
                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick?.(record, index)}
                  >
                    {columns.map((column, columnIndex) => {
                      const value = getCellValue(record, column);
                      const content: ReactNode = column.render
                        ? column.render(value, record, index)
                        : String(value ?? '');

                      const cellTextSize = isTablet ? 'text-xs' : 'text-sm';

                      return (
                        <td
                          key={columnIndex}
                          className={cn(
                            tablePadding,
                            'whitespace-nowrap',
                            cellTextSize,
                            isDark ? 'text-gray-200' : 'text-gray-900',
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right'
                          )}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* 分页 */}
      {pagination && !loading && data.length > 0 && (
        <div className={cn(
          'border-t',
          tablePadding,
          isDark ? 'border-gray-700' : 'border-gray-200'
        )}>
          <Pagination
            currentPage={pagination.current}
            totalPages={Math.ceil(pagination.total / pagination.pageSize)}
            onPageChange={pagination.onChange}
            totalItems={pagination.total}
            itemsPerPage={pagination.pageSize}
          />
        </div>
      )}
    </div>
  );
}

export default DataTable;