/**
 * 内容设置容器组件
 * 整合数据管理、表格操作、预览和分页功能
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import type { 
  TabStats, 
  ContentData, 
  SortConfig, 
  FilterConfig 
} from '../../types/contentSettings';
import { ContentTableType } from '../../types/contentSettings';
import { CONTENT_TABLE_TYPE_VALUES } from '../../types/tableTypes';
import {
  useContentData,
  useTableOperations,
  usePagination,
  useTableConfig
} from '../../hooks/useContentSettings';
// 组件导入
import DataTable from './DataTable';
import EditModal from './EditModal';
import TabNavigation from './TabNavigation';
// import ConfirmDialog from './ConfirmDialog'; // 暂时注释，稍后修复

/**
 * 内容设置容器组件
 */
const ContentSettingsContainer: React.FC = () => {
  // 状态管理
  const [activeTab, setActiveTab] = useState<ContentTableType>('site_content' as ContentTableType);
  const [editingItem, setEditingItem] = useState<ContentData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Record<string, unknown>[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'desc' });
  // const [filterConfig, setFilterConfig] = useState<FilterConfig>({ search: '', isActive: undefined });

  // 使用自定义Hooks
  const {
    data,
    loading,
    // error: dataError,
    // counts,
    fetchSingleTableData,
    refreshData
  } = useContentData();

  const { tableConfig } = useTableConfig(activeTab);

  const {
    createRecord,
    updateRecord,
    deleteRecord,
    batchDelete,
    loading: operationLoading,
    // error: operationError
  } = useTableOperations();

  // const { 
  //   isPreviewMode,
  //   enablePreview,
  //   disablePreview,
  //   applyChanges,
  //   // discardChanges,
  //   // hasChanges
  // } = usePreview();
  
  // 使用预览相关功能
  // const handlePreviewToggle = () => {
  //   if (isPreviewMode) {
  //     disablePreview();
  //   } else {
  //     enablePreview();
  //   }
  // };
  
  // const handleApplyChanges = () => {
  //   applyChanges();
  // };
  
  // const handleDiscardChanges = () => {
  //   discardChanges();
  // };

  const {
    pagination,
    // updatePagination,
    goToPage,
    // changePageSize,
    changeSort,
    resetPagination
  } = usePagination();

  // 获取当前表的数据
  const currentData = useMemo(() => {
    return data[activeTab] || [];
  }, [data, activeTab]);

  // 计算分页数据
  const paginatedData = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return currentData.slice(startIndex, endIndex);
  }, [currentData, pagination.page, pagination.pageSize]);

  // 计算标签页统计
  const tabStats = useMemo((): Record<ContentTableType, TabStats> => {
    const stats: Record<ContentTableType, TabStats> = {} as Record<ContentTableType, TabStats>;
    
    CONTENT_TABLE_TYPE_VALUES.forEach((tableType: ContentTableType) => {
      const tableData = data[tableType] || [];
      const total = tableData.length;
      const active = tableData.filter((item: any) => item.is_active !== false).length;
      const inactive = total - active;
      
      stats[tableType] = { total, active, inactive };
    });
    
    return stats;
  }, [data]);

  // 事件处理函数
  const handleTabChange = useCallback((tab: ContentTableType) => {
    setActiveTab(tab);
    setSelectedItems([]);
    resetPagination();
  }, [resetPagination]);

  const handleSort = useCallback((key: string) => {
    setSortConfig(prev => {
      const newDirection = prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc';
      changeSort(key, newDirection);
      return { key, direction: newDirection };
    });
  }, [changeSort]);

  const handleFilter = useCallback((filters: FilterConfig) => {
    // setFilterConfig(filters);
    console.log('Filter applied:', filters);
    goToPage(1); // 重置到第一页
  }, [goToPage]);

  const handleCreate = useCallback(() => {
    setEditingItem(null);
    setIsEditModalOpen(true);
  }, []);

  const handleEdit = useCallback((item: Record<string, unknown>) => {
    setEditingItem(item as ContentData);
    setIsEditModalOpen(true);
  }, []);

  const handleDelete = useCallback((item: Record<string, unknown>) => {
    setItemToDelete((item.id as string) || '');
    setIsConfirmDialogOpen(true);
  }, []);

  const handleBatchDelete = useCallback(() => {
    if (selectedItems.length === 0) {
      toast.error('请选择要删除的项目');
      return;
    }
    setIsConfirmDialogOpen(true);
  }, [selectedItems]);

  const handleSave = useCallback(async (formData: any) => {
    try {
      let success = false;
      
      if (editingItem) {
        // 更新
        success = await updateRecord(activeTab, editingItem.id, formData);
        if (success) {
          toast.success('更新成功');
        }
      } else {
        // 创建
        success = await createRecord(activeTab, formData);
        if (success) {
          toast.success('创建成功');
        }
      }
      
      if (success) {
        setIsEditModalOpen(false);
        setEditingItem(null);
        await refreshData(activeTab);
      }
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败');
    }
  }, [editingItem, activeTab, updateRecord, createRecord, refreshData]);

  const confirmDelete = useCallback(async () => {
    try {
      let success = false;
      
      if (itemToDelete) {
        // 单个删除
        success = await deleteRecord(activeTab, itemToDelete);
        if (success) {
          toast.success('删除成功');
        }
      } else if (selectedItems.length > 0) {
        // 批量删除
        success = await batchDelete(activeTab, selectedItems.map(item => (item as any).id));
        if (success) {
          toast.success(`成功删除 ${selectedItems.length} 个项目`);
          setSelectedItems([]);
        }
      }
      
      if (success) {
        setIsConfirmDialogOpen(false);
        setItemToDelete(null);
        await refreshData(activeTab);
      }
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败');
    }
  }, [itemToDelete, selectedItems, activeTab, deleteRecord, batchDelete, refreshData]);

  // 生命周期管理
  useEffect(() => {
    // 初始化数据加载
    fetchSingleTableData(activeTab, pagination);
  }, [activeTab, pagination, fetchSingleTableData]);

  // 渲染
  return (
    <div className="content-settings-container">
      {/* 标签页导航 */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabStats={tabStats as Record<ContentTableType, { total: number; active: number; inactive: number }>}
      />

      {/* 数据表格 */}
      <DataTable
        data={paginatedData}
        columns={tableConfig?.fields?.map((field: { name: string; label: string; type: string }) => ({
          key: field.name,
          title: field.label,
          type: field.type === 'date' ? 'datetime' : field.type as any,
          sortable: true
        })) || []}
        loading={loading[activeTab] || operationLoading}
        // error={dataError[activeTab] || operationError}
        sortConfig={sortConfig}
        onSort={handleSort}
        onFilter={handleFilter}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleCreate}
        onBatchDelete={handleBatchDelete}
        selectedItems={selectedItems}
        onSelect={setSelectedItems}
        pagination={{
          page: pagination.page,
          pageSize: pagination.pageSize,
          total: currentData.length,
          totalPages: Math.ceil(currentData.length / pagination.pageSize),
          // onChange: goToPage,
          // onShowSizeChange: changePageSize
        }}
      />

      {/* 编辑模态框 */}
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
        initialData={editingItem || undefined}
        tableType={activeTab}
        loading={operationLoading}
      />

      {/* 确认删除对话框 - 暂时使用简单的confirm */}
      {isConfirmDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => {
            setIsConfirmDialogOpen(false);
            setItemToDelete(null);
          }} />
          <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">确认删除</h3>
            <p className="text-gray-600 mb-6">
              {itemToDelete
                ? '确定要删除这个项目吗？此操作不可撤销。'
                : `确定要删除选中的 ${selectedItems.length} 个项目吗？此操作不可撤销。`
              }
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                onClick={() => {
                  setIsConfirmDialogOpen(false);
                  setItemToDelete(null);
                }}
              >
                取消
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                onClick={confirmDelete}
                disabled={operationLoading}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentSettingsContainer;