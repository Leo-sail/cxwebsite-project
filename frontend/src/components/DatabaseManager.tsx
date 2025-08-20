import React, { useState } from 'react';
import {
  useDatabaseQuery,
  useTablePermissions,
  useTableColumns,
  useTableExists
} from '../hooks/useDatabaseQuery';
import { TABLE_NAMES, type TableName } from '../services/databaseQueryService';

/**
 * 数据库管理组件
 * 用于展示和测试新的SQL查询方案功能
 */
const DatabaseManager: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [testTableName, setTestTableName] = useState<string>('');
  
  // 使用综合数据库查询Hook
  const {
    tables,
    tablesInfo,
    stats,
    health,
    queryTablePermissions,
    queryTableColumns,
    queryTableExists,
    refreshAll,
    isLoading,
    hasError,
    errors
  } = useDatabaseQuery();

  // 选定表的权限和列信息
  const tablePermissions = useTablePermissions(selectedTable || null);
  const tableColumns = useTableColumns(selectedTable || null);
  const tableExistsResult = useTableExists(testTableName || null);

  /**
   * 处理表选择
   */
  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
  };

  /**
   * 处理测试表存在性
   */
  const handleTestTableExists = () => {
    if (testTableName.trim()) {
      // 触发useTableExists Hook的重新查询
      setTestTableName(testTableName.trim());
    }
  };

  /**
   * 渲染加载状态
   */
  const renderLoadingState = () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span className="ml-2 text-gray-600">加载中...</span>
    </div>
  );

  /**
   * 渲染错误状态
   */
  const renderErrorState = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <h3 className="text-red-800 font-semibold mb-2">错误信息</h3>
      <ul className="text-red-700 text-sm space-y-1">
        {errors.map((error, index) => (
          <li key={index}>• {error}</li>
        ))}
      </ul>
    </div>
  );

  /**
   * 渲染健康检查状态
   */
  const renderHealthStatus = () => {
    if (health.loading) return <span className="text-yellow-600">检查中...</span>;
    if (health.error) return <span className="text-red-600">异常</span>;
    if (health.data?.status === 'healthy') return <span className="text-green-600">正常</span>;
    return <span className="text-gray-600">未知</span>;
  };

  /**
   * 渲染表权限信息
   */
  const renderPermissions = (permissions: any) => {
    if (!permissions) return null;
    
    const permissionItems = [
      { key: 'can_select', label: 'SELECT', color: permissions.can_select ? 'text-green-600' : 'text-red-600' },
      { key: 'can_insert', label: 'INSERT', color: permissions.can_insert ? 'text-green-600' : 'text-red-600' },
      { key: 'can_update', label: 'UPDATE', color: permissions.can_update ? 'text-green-600' : 'text-red-600' },
      { key: 'can_delete', label: 'DELETE', color: permissions.can_delete ? 'text-green-600' : 'text-red-600' }
    ];

    return (
      <div className="flex flex-wrap gap-2">
        {permissionItems.map(({ key, label, color }) => (
          <span key={key} className={`px-2 py-1 rounded text-xs font-medium ${color} bg-gray-100`}>
            {label}: {permissions[key] ? '✓' : '✗'}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">数据库管理控制台</h1>
        <p className="text-gray-600">基于SQL的数据库查询方案</p>
        
        {/* 操作按钮 */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={refreshAll}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '刷新中...' : '刷新所有数据'}
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">数据库状态:</span>
            {renderHealthStatus()}
          </div>
        </div>
      </div>

      {/* 错误信息 */}
      {hasError && renderErrorState()}

      {/* 数据库概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 表统计 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">表统计</h3>
          {tables.loading ? (
            renderLoadingState()
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">总表数:</span>
                <span className="font-semibold">{tables.data?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">预定义表:</span>
                <span className="font-semibold">{Object.keys(TABLE_NAMES).length}</span>
              </div>
            </div>
          )}
        </div>

        {/* 数据库统计 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">数据库统计</h3>
          {stats.loading ? (
            renderLoadingState()
          ) : stats.data ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Schema数:</span>
                <span className="font-semibold">{stats.data.schema_count || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">函数数:</span>
                <span className="font-semibold">{stats.data.function_count || 'N/A'}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">暂无统计数据</p>
          )}
        </div>

        {/* 表存在性测试 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">表存在性测试</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={testTableName}
                onChange={(e) => setTestTableName(e.target.value)}
                placeholder="输入表名"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleTestTableExists}
                disabled={!testTableName.trim() || tableExistsResult.loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                测试
              </button>
            </div>
            
            {tableExistsResult.loading && <p className="text-yellow-600 text-sm">检查中...</p>}
            {tableExistsResult.error && <p className="text-red-600 text-sm">{tableExistsResult.error}</p>}
            {tableExistsResult.data !== null && (
              <p className={`text-sm font-medium ${
                tableExistsResult.data ? 'text-green-600' : 'text-red-600'
              }`}>
                表 "{testTableName}" {tableExistsResult.data ? '存在' : '不存在'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 表列表 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">数据库表列表</h3>
          <p className="text-gray-600 text-sm mt-1">点击表名查看详细信息</p>
        </div>
        
        <div className="p-6">
          {tables.loading ? (
            renderLoadingState()
          ) : tables.data ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {tables.data.map((tableName) => (
                <button
                  key={tableName}
                  onClick={() => handleTableSelect(tableName)}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    selectedTable === tableName
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{tableName}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Object.values(TABLE_NAMES).includes(tableName as TableName) ? '预定义' : '其他'}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">暂无表数据</p>
          )}
        </div>
      </div>

      {/* 选定表的详细信息 */}
      {selectedTable && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 表权限 */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">表权限</h3>
              <p className="text-gray-600 text-sm mt-1">表: {selectedTable}</p>
            </div>
            
            <div className="p-6">
              {tablePermissions.loading ? (
                renderLoadingState()
              ) : tablePermissions.error ? (
                <p className="text-red-600 text-sm">{tablePermissions.error}</p>
              ) : tablePermissions.data ? (
                <div className="space-y-4">
                  {renderPermissions(tablePermissions.data)}
                  {tablePermissions.data.error_message && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-yellow-800 text-sm">
                        <strong>注意:</strong> {tablePermissions.data.error_message}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">暂无权限数据</p>
              )}
            </div>
          </div>

          {/* 表结构 */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">表结构</h3>
              <p className="text-gray-600 text-sm mt-1">列信息</p>
            </div>
            
            <div className="p-6">
              {tableColumns.loading ? (
                renderLoadingState()
              ) : tableColumns.error ? (
                <p className="text-red-600 text-sm">{tableColumns.error}</p>
              ) : tableColumns.data ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {tableColumns.data.map((column, index) => (
                    <div key={index} className="border border-gray-200 rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900">{column.column_name}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {column.data_type}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>可空: {column.is_nullable === 'YES' ? '是' : '否'}</div>
                        {column.column_default && (
                          <div>默认值: {column.column_default}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">暂无列信息</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 表详细信息 */}
      {tablesInfo.data && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">表详细信息</h3>
            <p className="text-gray-600 text-sm mt-1">所有表的元数据信息</p>
          </div>
          
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      表名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Schema
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      类型
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      所有者
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tablesInfo.data.map((table, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {table.table_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {table.table_schema}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {table.table_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {table.table_owner || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseManager;