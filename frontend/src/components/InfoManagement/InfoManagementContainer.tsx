/**
 * 信息管理容器组件
 * 整合顶部导航、数据表格、编辑弹窗和分页等功能
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  RefreshCw,
  Download,
  Upload,
  Settings,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2
} from 'lucide-react';
import { cn } from '../../utils';

// 导入子组件
import { TopTabNavigation } from './TopTabNavigation';
import { DataTable } from './DataTable';
import { EditModal } from './EditModal';
import { Pagination } from './Pagination';

// 导入自定义Hook和服务
import { useInfoManagement } from '../../hooks/useInfoManagement';

// 导入类型
import type {
  InfoManagementContainerProps,
  TableData,
  TableConfig
} from '../../types/infoManagement';
import type { ContentTableType } from '../../types/contentSettings';

// ============================================================================
// 常量配置
// ============================================================================

/**
 * 默认标签配置
 */
const DEFAULT_TABS = [
  {
    key: 'site_content' as ContentTableType,
    label: '站点内容',
    description: '管理网站的基础内容信息',
    icon: '🏠'
  },
  {
    key: 'navigation_items' as ContentTableType,
    label: '导航管理',
    description: '管理网站导航菜单',
    icon: '🧭'
  },
  {
    key: 'ui_text_elements' as ContentTableType,
    label: 'UI文本',
    description: '管理界面文本内容',
    icon: '📝'
  },
  {
    key: 'page_sections' as ContentTableType,
    label: '页面区域',
    description: '管理页面区域内容',
    icon: '📄'
  },
  {
    key: 'seo_metadata' as ContentTableType,
    label: 'SEO元数据',
    description: '管理SEO相关信息',
    icon: '🔍'
  }
];

/**
 * 默认操作配置
 */
const DEFAULT_ACTIONS = [
  {
    key: 'add',
    label: '新增',
    icon: 'Plus',
    variant: 'contained',
    primary: true
  },
  {
    key: 'refresh',
    label: '刷新',
    icon: 'RefreshCw',
    variant: 'outlined'
  },
  {
    key: 'export',
    label: '导出',
    icon: 'Download',
    variant: 'outlined'
  },
  {
    key: 'import',
    label: '导入',
    icon: 'Upload',
    variant: 'outlined'
  }
];

// ============================================================================
// 子组件
// ============================================================================

/**
 * 加载状态组件
 */
interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = '加载中...' }) => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center gap-3 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>{message}</span>
      </div>
    </div>
  );
};

/**
 * 错误状态组件
 */
interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="flex items-center gap-3 text-red-500">
        <AlertTriangle className="h-5 w-5" />
        <span>加载失败: {error}</span>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outlined" size="small">
          <RefreshCw className="h-4 w-4 mr-2" />
          重试
        </Button>
      )}
    </div>
  );
};

/**
 * 操作确认对话框组件
 */
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'default',
  loading = false
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className="flex items-center gap-2">
        {variant === 'destructive' ? (
          <AlertTriangle className="h-5 w-5 text-red-500" />
        ) : (
          <HelpCircle className="h-5 w-5 text-blue-500" />
        )}
        {title}
      </DialogTitle>
      <DialogContent>
        {description}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          color={variant === 'destructive' ? 'error' : 'primary'}
          variant="contained"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : null}
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================================================
// 主组件
// ============================================================================

/**
 * 信息管理容器组件
 */
export const InfoManagementContainer: React.FC<InfoManagementContainerProps> = ({
  initialTab = 'site_content' as ContentTableType,
  className = ''
}) => {
  // ============================================================================
  // 状态管理
  // ============================================================================
  
  const [currentTab, setCurrentTab] = useState<ContentTableType>(initialTab);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: 'default' | 'destructive';
  }>({ open: false, title: '', description: '', onConfirm: () => {} });
  
  // 使用自定义Hook管理状态
  const {
    state,
    loadData,
    createRecord,
    updateRecord,
    deleteRecord,
    batchDeleteRecords,
    setSearch,
    setFilters,
    setSort,
    setPage,
    setPageSize,
    toggleRowSelection,
    setSelectedRows,
    clearSelection,
    openEditModal,
    closeEditModal,
    openDeleteConfirm,
    closeDeleteConfirm,
    refresh,
    reset,
    hasSelection,
    isAllSelected,
    isIndeterminate
  } = useInfoManagement(currentTab);
  
  // ============================================================================
  // 计算属性
  // ============================================================================
  
  /**
   * 当前标签配置
   */
  const currentTabConfig = useMemo(() => {
    return DEFAULT_TABS.find(tab => tab.key === currentTab) || DEFAULT_TABS[0];
  }, [currentTab]);
  
  /**
   * 是否有选中的行
   */
  const hasSelectedRows = useMemo(() => {
    return state.selectedRows?.length > 0;
  }, [state.selectedRows]);
  
  /**
   * 批量操作按钮状态
   */
  const batchActionsDisabled = useMemo(() => {
    return !hasSelectedRows || state.loading;
  }, [hasSelectedRows, state.loading]);
  
  // ============================================================================
  // 事件处理
  // ============================================================================
  
  /**
   * 处理标签切换
   */
  const handleTabChange = useCallback((tabKey: string) => {
    const newTab = tabKey as ContentTableType;
    setCurrentTab(newTab);
    
    // 清空选中状态
    clearSelection();
  }, [clearSelection]);
  
  /**
   * 处理操作点击
   */
  const handleActionClick = useCallback(async (actionKey: string) => {
    switch (actionKey) {
      case 'add':
        openEditModal('create');
        break;
        
      case 'refresh':
        await loadData();
        toast.success('数据已刷新');
        break;
        
      case 'export':
        try {
          // TODO: 实现导出功能
          toast.success('数据导出成功');
        } catch (error) {
          toast.error('数据导出失败');
        }
        break;
        
      case 'import':
        // 触发文件选择
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.csv,.xlsx';
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            try {
              // TODO: 实现导入功能
              toast.success('数据导入成功');
            } catch (error) {
              toast.error('数据导入失败');
            }
          }
        };
        input.click();
        break;
        
      case 'batch_delete':
        if (hasSelectedRows) {
          setConfirmDialog({
            open: true,
            title: '批量删除确认',
            description: `确定要删除选中的 ${state.selectedRows?.length || 0} 条记录吗？此操作不可撤销。`,
            onConfirm: handleBatchDelete,
            variant: 'destructive'
          });
        }
        break;
        
      default:
        console.warn(`未处理的操作: ${actionKey}`);
    }
  }, [hasSelectedRows, state.selectedRows?.length, loadData, openEditModal]);
  
  /**
   * 处理批量删除
   */
  const handleBatchDelete = useCallback(async () => {
    try {
      if (state.selectedRows && state.selectedRows.length > 0) {
        const selectedIds = state.selectedRows.map((row: any) => row.id);
        await deleteRecord(selectedIds);
        setConfirmDialog(prev => ({ ...prev, open: false }));
        toast.success(`成功删除 ${state.selectedRows.length} 条记录`);
      }
    } catch (error) {
      toast.error('批量删除失败');
    }
  }, [deleteRecord, state.selectedRows]);
  
  /**
   * 处理搜索
   */
  const handleSearch = useCallback((searchText: string) => {
    // TODO: 实现搜索功能
    console.log('搜索:', searchText);
  }, []);
  
  // ============================================================================
  // 副作用
  // ============================================================================
  
  // 标签切换时重新加载数据
  useEffect(() => {
    loadData();
  }, [currentTab, loadData]);
  
  // ============================================================================
  // 渲染
  // ============================================================================
  
  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 ${className}`}>
        {/* 顶部导航 */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
          <TopTabNavigation
            activeTable={currentTab}
            onTabChange={setCurrentTab}
            className="px-6 py-4"
          />
        </div>
        
        {/* 操作栏 */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="contained"
                onClick={() => handleActionClick('add')}
                startIcon={<Plus className="h-4 w-4" />}
              >
                新增
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleActionClick('refresh')}
                startIcon={<RefreshCw className="h-4 w-4" />}
              >
                刷新
              </Button>
            </div>
            {hasSelectedRows && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleActionClick('batch_delete')}
                  disabled={batchActionsDisabled}
                  startIcon={<Trash2 className="h-4 w-4" />}
                >
                  批量删除 ({state.selectedRowKeys.length})
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* 主内容区域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Card className="flex-1 m-4 overflow-hidden">
            <CardContent className="p-0 h-full flex flex-col">
              {/* 数据表格 */}
              <div className="flex-1 overflow-hidden">
                {state.error ? (
                  <ErrorState
                    error={state.error}
                    onRetry={() => loadData()}
                  />
                ) : state.loading && state.data.length === 0 ? (
                  <LoadingState message="正在加载数据..." />
                ) : (
                  <DataTable
                    data={state.data}
                    tableName={currentTab}
                    loading={state.loading}
                    selectedRowKeys={state.selectedRows?.map((row: any) => row.id) || []}
                    onSelectionChange={setSelectedRows}
                    onEdit={openEditModal}
                    onDelete={(record: TableData) => {
                      setConfirmDialog({
                        open: true,
                        title: '删除确认',
                        description: '确定要删除这条记录吗？此操作不可撤销。',
                        onConfirm: () => {
                          deleteRecord([record.id]);
                          setConfirmDialog(prev => ({ ...prev, open: false }));
                        },
                        variant: 'destructive'
                      });
                    }}
                    onView={(record: TableData) => {
                      // TODO: 实现查看功能
                      console.log('查看:', record);
                    }}
                    onSort={(sortConfig: any) => {
                      setSort(sortConfig);
                    }}
                    sortConfig={state.sortConfig}
                  />
                )}
              </div>
              
              {/* 分页 */}
              {!state.error && state.data.length > 0 && (
                <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
                  <Pagination
                    current={state.pagination.page}
                    pageSize={state.pagination.pageSize}
                    total={state.pagination.total}
                    onChange={setPage}
                    onPageSizeChange={setPageSize}
                    disabled={state.loading}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* 编辑弹窗 */}
        <EditModal
          isOpen={state.isEditModalOpen}
          onCancel={closeEditModal}
          onSubmit={async (data: any) => {
            if (state.editingRecord) {
              await updateRecord(state.editingRecord.id, data);
            } else {
              await createRecord(data);
            }
          }}
          initialData={state.editingRecord}
          tableType={currentTab}
          mode={state.editingRecord ? 'edit' : 'create'}
          loading={state.loading}
        />
        
        {/* 确认对话框 */}
        <ConfirmDialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          description={confirmDialog.description}
          variant={confirmDialog.variant}
          loading={state.loading}
        />
    </div>
  );
};

// ============================================================================
// 导出
// ============================================================================

export default InfoManagementContainer;

// 导出配置和类型
export {
  DEFAULT_TABS,
  DEFAULT_ACTIONS
};
export type {
  InfoManagementContainerProps,
  TableConfig
};