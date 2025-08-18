/**
 * Table相关的工具函数、常量和类型定义
 */

/**
 * 默认表格样式配置
 */
export const DEFAULT_TABLE_STYLES = {
  variants: {
    default: {
      table: 'border border-gray-200',
      header: 'bg-gray-50 border-b border-gray-200',
      cell: 'px-4 py-3 border-b border-gray-100',
      row: 'hover:bg-gray-50'
    },
    striped: {
      table: 'border border-gray-200',
      header: 'bg-gray-50 border-b border-gray-200',
      cell: 'px-4 py-3 border-b border-gray-100',
      row: 'odd:bg-gray-50 hover:bg-gray-100'
    },
    bordered: {
      table: 'border-2 border-gray-300',
      header: 'bg-gray-50 border-b-2 border-gray-300',
      cell: 'px-4 py-3 border border-gray-200',
      row: 'hover:bg-gray-50'
    },
    hover: {
      table: '',
      header: 'bg-gray-50 border-b border-gray-200',
      cell: 'px-4 py-3',
      row: 'hover:bg-gray-100 hover:shadow-sm transition-all duration-200'
    },
    compact: {
      table: 'border border-gray-200',
      header: 'bg-gray-50 border-b border-gray-200',
      cell: 'px-2 py-1 border-b border-gray-100 text-sm',
      row: 'hover:bg-gray-50'
    }
  },
  sizes: {
    xs: { cell: 'px-2 py-1 text-xs' },
    sm: { cell: 'px-3 py-2 text-sm' },
    md: { cell: 'px-4 py-3 text-base' },
    lg: { cell: 'px-6 py-4 text-lg' },
    xl: { cell: 'px-8 py-6 text-xl' }
  }
};