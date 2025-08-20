// 数据库测试工具
// 注意：此文件需要在浏览器环境中运行，因为它依赖于Supabase客户端

import { 
  getAllTables, 
  getTablesInfo, 
  checkTablePermissions, 
  getTableColumns,
  tableExists,
  getDatabaseStats,
  performHealthCheck,
  TABLE_NAMES
} from '../services/databaseQueryService';

// 如果要在Node.js中测试，需要单独配置Supabase客户端
console.log('数据库测试工具');
console.log('请在浏览器控制台中运行此测试，或者访问 /admin/database-manager 页面进行测试');
console.log('测试功能已集成到 DatabaseManager 组件中');

// 导出测试函数供浏览器环境使用
export const testInstructions = {
  message: '请访问 /admin/database-manager 页面进行数据库功能测试',
  steps: [
    '1. 启动开发服务器: npm run dev',
    '2. 访问管理后台: http://localhost:5173/admin',
    '3. 登录后点击"数据库管理"菜单',
    '4. 在数据库管理页面中查看所有测试结果'
  ]
};

if (typeof window === 'undefined') {
  // Node.js 环境
  console.log(testInstructions.message);
  testInstructions.steps.forEach(step => console.log(step));
} else {
  // 浏览器环境 - 保留原有的测试代码
  // 这里可以添加浏览器环境的测试逻辑
  
  // 数据库服务已通过静态导入加载
  console.log('数据库服务已加载，可以进行测试');
}

/**
 * 数据库查询服务测试工具
 * 用于验证新的SQL查询方案是否正常工作
 */

/**
 * 执行完整的数据库测试
 */
export async function runDatabaseTests() {
  console.log('🚀 开始执行数据库查询服务测试...');
  
  const results = {
    health_check: null as any,
    table_list: null as any,
    table_info: null as any,
    permissions_check: null as any,
    column_info: null as any,
    database_stats: null as any,
    errors: [] as string[]
  };
  
  try {
    // 1. 健康检查
    console.log('\n📋 执行健康检查...');
    results.health_check = await performHealthCheck();
    console.log('健康检查结果:', results.health_check);
    
    // 2. 获取表列表
    console.log('\n📊 获取所有表列表...');
    const tables = await getAllTables();
    results.table_list = {
      count: tables.length,
      tables: tables,
      expected_tables: Object.values(TABLE_NAMES),
      missing_tables: Object.values(TABLE_NAMES).filter(t => !tables.includes(t)),
      extra_tables: tables.filter(t => !Object.values(TABLE_NAMES).includes(t as any))
    };
    console.log('表列表结果:', results.table_list);
    
    // 3. 获取表详细信息
    console.log('\n📈 获取表详细信息...');
    const tablesInfo = await getTablesInfo();
    results.table_info = {
      count: tablesInfo.length,
      tables_with_rls: tablesInfo.filter(t => t.rls_enabled).length,
      tables_with_pk: tablesInfo.filter(t => t.has_primary_key).length,
      total_columns: tablesInfo.reduce((sum, t) => sum + t.column_count, 0),
      details: tablesInfo
    };
    console.log('表信息结果:', results.table_info);
    
    // 4. 权限检查（检查前3个表）
    console.log('\n🔐 检查表权限...');
    const permissionChecks = [];
    for (const tableName of tables.slice(0, 3)) {
      const permissions = await checkTablePermissions(tableName);
      permissionChecks.push(permissions);
    }
    results.permissions_check = {
      checked_tables: permissionChecks.length,
      results: permissionChecks
    };
    console.log('权限检查结果:', results.permissions_check);
    
    // 5. 列信息检查（检查第一个表）
    if (tables.length > 0) {
      console.log('\n📝 获取列信息...');
      const firstTable = tables[0];
      const columns = await getTableColumns(firstTable);
      results.column_info = {
        table_name: firstTable,
        column_count: columns.length,
        columns: columns
      };
      console.log(`表 ${firstTable} 的列信息:`, results.column_info);
    }
    
    // 6. 数据库统计
    console.log('\n📊 获取数据库统计信息...');
    const stats = await getDatabaseStats();
    results.database_stats = stats;
    console.log('数据库统计:', stats);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    results.errors.push(errorMessage);
    console.error('测试执行失败:', error);
  }
  
  console.log('\n✅ 数据库测试完成!');
  return results;
}

/**
 * 验证数据库查询服务的完整性
 */
export async function validateDatabaseService() {
  console.log('🔍 验证数据库查询服务...');
  
  try {
    // 使用SQL方案获取表列表
    const sqlTables = await getAllTables();
    const sqlTablesInfo = await getTablesInfo();
    
    console.log('\n📊 数据库查询结果:');
    console.log(`- 发现表数量: ${sqlTables.length}`);
    console.log(`- 表列表: ${sqlTables.join(', ')}`);
    console.log(`- 详细信息条数: ${sqlTablesInfo.length}`);
    
    // 预期的表列表
    const expectedTables = Object.values(TABLE_NAMES);
    const missingTables = expectedTables.filter(t => !sqlTables.includes(t));
    const extraTables = sqlTables.filter(t => !expectedTables.includes(t as any));
    
    console.log('\n🎯 验证分析:');
    console.log(`- 预期表数量: ${expectedTables.length}`);
    console.log(`- 实际发现: ${sqlTables.length}`);
    console.log(`- 缺失表: ${missingTables.length > 0 ? missingTables.join(', ') : '无'}`);
    console.log(`- 额外表: ${extraTables.length > 0 ? extraTables.join(', ') : '无'}`);
    
    const validation = {
      table_count: sqlTables.length,
      tables: sqlTables,
      expected_count: expectedTables.length,
      missing_tables: missingTables,
      extra_tables: extraTables,
      completeness: `${((sqlTables.length / expectedTables.length) * 100).toFixed(1)}%`,
      success: missingTables.length === 0
    };
    
    console.log('\n📈 验证结果:', validation);
    return validation;
    
  } catch (error) {
    console.error('验证测试失败:', error);
    throw error;
  }
}

/**
 * 验证特定表是否存在
 */
export async function validateTableExistence() {
  console.log('🔍 验证表存在性...');
  
  const testTables = Object.values(TABLE_NAMES);
  const results = [];
  
  for (const tableName of testTables) {
    const exists = await tableExists(tableName);
    results.push({ table: tableName, exists });
    console.log(`- ${tableName}: ${exists ? '✅ 存在' : '❌ 不存在'}`);
  }
  
  const existingCount = results.filter(r => r.exists).length;
  console.log(`\n📊 总结: ${existingCount}/${testTables.length} 个表存在`);
  
  return results;
}

/**
 * 快速验证核心功能
 */
export async function quickValidation() {
  console.log('⚡ 快速验证核心功能...');
  
  try {
    const tables = await getAllTables();
    const expectedCount = Object.values(TABLE_NAMES).length;
    
    const isValid = tables.length >= expectedCount;
    
    console.log(`发现 ${tables.length} 个表，预期至少 ${expectedCount} 个`);
    console.log(`验证结果: ${isValid ? '✅ 通过' : '❌ 失败'}`);
    
    return {
      success: isValid,
      found_tables: tables.length,
      expected_minimum: expectedCount,
      tables: tables
    };
  } catch (error) {
    console.error('快速验证失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}