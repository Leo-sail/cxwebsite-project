-- =====================================================
-- Supabase数据库标准化查询工具
-- 用于替代有问题的MCP list_tables功能
-- =====================================================

-- 1. 获取所有表的基本信息
-- =====================================================
CREATE OR REPLACE VIEW public.v_table_overview AS
SELECT 
    t.table_name,
    t.table_type,
    t.is_insertable_into,
    COUNT(c.column_name) as column_count,
    string_agg(c.column_name, ', ' ORDER BY c.ordinal_position) as column_list,
    obj_description(pgc.oid) as table_comment
FROM information_schema.tables t
LEFT JOIN information_schema.columns c 
    ON t.table_name = c.table_name AND c.table_schema = 'public'
LEFT JOIN pg_class pgc 
    ON pgc.relname = t.table_name AND pgc.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
WHERE t.table_schema = 'public'
GROUP BY t.table_name, t.table_type, t.is_insertable_into, pgc.oid
ORDER BY t.table_name;

-- 2. 获取表的详细结构信息
-- =====================================================
CREATE OR REPLACE VIEW public.v_table_columns AS
SELECT 
    c.table_name,
    c.column_name,
    c.ordinal_position,
    c.data_type,
    c.character_maximum_length,
    c.is_nullable,
    c.column_default,
    col_description(pgc.oid, c.ordinal_position) as column_comment,
    CASE 
        WHEN pk.column_name IS NOT NULL THEN 'YES'
        ELSE 'NO'
    END as is_primary_key,
    CASE 
        WHEN fk.column_name IS NOT NULL THEN 'YES'
        ELSE 'NO'
    END as is_foreign_key
FROM information_schema.columns c
LEFT JOIN pg_class pgc 
    ON pgc.relname = c.table_name AND pgc.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
LEFT JOIN (
    SELECT 
        kcu.table_name,
        kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public'
) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
LEFT JOIN (
    SELECT 
        kcu.table_name,
        kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
) fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name
WHERE c.table_schema = 'public'
ORDER BY c.table_name, c.ordinal_position;

-- 3. 获取表的权限信息
-- =====================================================
CREATE OR REPLACE VIEW public.v_table_privileges AS
SELECT 
    table_name,
    privilege_type,
    grantee,
    is_grantable,
    grantor
FROM information_schema.table_privileges 
WHERE table_schema = 'public'
ORDER BY table_name, privilege_type, grantee;

-- 4. 获取表的RLS策略信息
-- =====================================================
CREATE OR REPLACE VIEW public.v_table_rls_status AS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    forcerowsecurity as rls_forced,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 5. 获取表的索引信息
-- =====================================================
CREATE OR REPLACE VIEW public.v_table_indexes AS
SELECT 
    t.relname as table_name,
    i.relname as index_name,
    ix.indisunique as is_unique,
    ix.indisprimary as is_primary,
    array_to_string(array_agg(a.attname ORDER BY c.ordinality), ', ') as columns
FROM pg_class t
JOIN pg_index ix ON t.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN unnest(ix.indkey) WITH ORDINALITY AS c(attnum, ordinality) ON true
JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = c.attnum
WHERE t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND t.relkind = 'r'
GROUP BY t.relname, i.relname, ix.indisunique, ix.indisprimary
ORDER BY t.relname, i.relname;

-- =====================================================
-- 标准化查询函数
-- =====================================================

-- 函数1：获取所有表名（替代list_tables）
CREATE OR REPLACE FUNCTION public.get_all_tables()
RETURNS TABLE(table_name text) AS $$
BEGIN
    RETURN QUERY
    SELECT t.table_name::text
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
    ORDER BY t.table_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 函数2：获取表的完整信息
CREATE OR REPLACE FUNCTION public.get_table_info(p_table_name text DEFAULT NULL)
RETURNS TABLE(
    table_name text,
    column_count bigint,
    has_primary_key boolean,
    rls_enabled boolean,
    table_comment text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.table_name::text,
        COUNT(c.column_name) as column_count,
        EXISTS(
            SELECT 1 FROM information_schema.table_constraints tc
            WHERE tc.table_name = t.table_name 
              AND tc.table_schema = 'public' 
              AND tc.constraint_type = 'PRIMARY KEY'
        ) as has_primary_key,
        COALESCE(pt.rowsecurity, false) as rls_enabled,
        obj_description(pgc.oid) as table_comment
    FROM information_schema.tables t
    LEFT JOIN information_schema.columns c 
        ON t.table_name = c.table_name AND c.table_schema = 'public'
    LEFT JOIN pg_tables pt 
        ON pt.tablename = t.table_name AND pt.schemaname = 'public'
    LEFT JOIN pg_class pgc 
        ON pgc.relname = t.table_name AND pgc.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    WHERE t.table_schema = 'public'
      AND (p_table_name IS NULL OR t.table_name = p_table_name)
    GROUP BY t.table_name, pt.rowsecurity, pgc.oid
    ORDER BY t.table_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 函数3：验证表访问权限
CREATE OR REPLACE FUNCTION public.check_table_access(p_table_name text)
RETURNS TABLE(
    table_name text,
    can_select boolean,
    can_insert boolean,
    can_update boolean,
    can_delete boolean,
    error_message text
) AS $$
DECLARE
    v_error text;
BEGIN
    -- 检查表是否存在
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = p_table_name) THEN
        RETURN QUERY SELECT p_table_name, false, false, false, false, 'Table does not exist';
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        p_table_name,
        has_table_privilege(current_user, 'public.' || p_table_name, 'SELECT') as can_select,
        has_table_privilege(current_user, 'public.' || p_table_name, 'INSERT') as can_insert,
        has_table_privilege(current_user, 'public.' || p_table_name, 'UPDATE') as can_update,
        has_table_privilege(current_user, 'public.' || p_table_name, 'DELETE') as can_delete,
        NULL::text as error_message;
        
EXCEPTION
    WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
        RETURN QUERY SELECT p_table_name, false, false, false, false, v_error;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 常用查询示例
-- =====================================================

-- 示例1：获取所有表名（替代MCP list_tables）
-- SELECT * FROM public.get_all_tables();

-- 示例2：获取所有表的概览信息
-- SELECT * FROM public.v_table_overview;

-- 示例3：获取特定表的详细信息
-- SELECT * FROM public.get_table_info('component_text_storage');

-- 示例4：检查表访问权限
-- SELECT * FROM public.check_table_access('component_text_storage');

-- 示例5：获取所有表的列信息
-- SELECT * FROM public.v_table_columns WHERE table_name = 'component_text_storage';

-- 示例6：检查RLS状态
-- SELECT * FROM public.v_table_rls_status;

-- 示例7：获取表权限信息
-- SELECT * FROM public.v_table_privileges WHERE table_name = 'component_text_storage';

-- =====================================================
-- 诊断查询
-- =====================================================

-- 诊断1：对比MCP list_tables和SQL查询结果
/*
WITH mcp_tables AS (
    -- 这里需要手动输入MCP list_tables的结果
    SELECT unnest(ARRAY['teachers', 'ui_configs', 'student_cases', 'admin_users', 'articles']) as table_name
),
sql_tables AS (
    SELECT table_name FROM public.get_all_tables()
)
SELECT 
    COALESCE(m.table_name, s.table_name) as table_name,
    CASE WHEN m.table_name IS NOT NULL THEN 'YES' ELSE 'NO' END as in_mcp_result,
    CASE WHEN s.table_name IS NOT NULL THEN 'YES' ELSE 'NO' END as in_sql_result,
    CASE 
        WHEN m.table_name IS NULL THEN 'Missing in MCP'
        WHEN s.table_name IS NULL THEN 'Missing in SQL'
        ELSE 'OK'
    END as status
FROM mcp_tables m
FULL OUTER JOIN sql_tables s ON m.table_name = s.table_name
ORDER BY table_name;
*/

-- 诊断2：检查所有表的基本健康状态
/*
SELECT 
    t.table_name,
    t.column_count,
    t.has_primary_key,
    t.rls_enabled,
    CASE 
        WHEN t.column_count = 0 THEN 'ERROR: No columns'
        WHEN NOT t.has_primary_key THEN 'WARNING: No primary key'
        WHEN NOT t.rls_enabled THEN 'INFO: RLS disabled'
        ELSE 'OK'
    END as health_status
FROM public.get_table_info() t
ORDER BY 
    CASE 
        WHEN t.column_count = 0 THEN 1
        WHEN NOT t.has_primary_key THEN 2
        WHEN NOT t.rls_enabled THEN 3
        ELSE 4
    END,
    t.table_name;
*/

-- =====================================================
-- 权限设置（如果需要）
-- =====================================================

-- 为视图和函数设置适当的权限
-- GRANT SELECT ON public.v_table_overview TO authenticated;
-- GRANT SELECT ON public.v_table_columns TO authenticated;
-- GRANT SELECT ON public.v_table_privileges TO authenticated;
-- GRANT SELECT ON public.v_table_rls_status TO authenticated;
-- GRANT SELECT ON public.v_table_indexes TO authenticated;
-- GRANT EXECUTE ON FUNCTION public.get_all_tables() TO authenticated;
-- GRANT EXECUTE ON FUNCTION public.get_table_info(text) TO authenticated;
-- GRANT EXECUTE ON FUNCTION public.check_table_access(text) TO authenticated;

-- =====================================================
-- 使用说明
-- =====================================================
/*
这个工具集提供了以下功能：

1. 视图（Views）：
   - v_table_overview: 表概览信息
   - v_table_columns: 表列详细信息
   - v_table_privileges: 表权限信息
   - v_table_rls_status: RLS状态信息
   - v_table_indexes: 索引信息

2. 函数（Functions）：
   - get_all_tables(): 获取所有表名（替代list_tables）
   - get_table_info(): 获取表的完整信息
   - check_table_access(): 验证表访问权限

3. 使用方式：
   - 直接查询视图获取信息
   - 调用函数进行特定操作
   - 使用诊断查询检查数据库健康状态

4. 优势：
   - 可靠性高，直接查询PostgreSQL系统表
   - 功能完整，提供比MCP list_tables更多信息
   - 标准化，统一的查询接口
   - 可扩展，易于添加新功能
*/