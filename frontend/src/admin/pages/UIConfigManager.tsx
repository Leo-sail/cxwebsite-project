/**
 * UI配置管理页面
 * 专门用于管理数据库中的ui_configs表配置
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Chip,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { uiConfigApi } from '../../services/api';
import type { UIConfig } from '../../types/database';
import { LoadingSpinner } from '../../components';

/**
 * UI配置类型定义
 */
interface UIConfigFormData {
  config_key: string;
  config_name: string;
  config_type: string;
  component_type: string;
  page_scope: string[];
  config_value: Record<string, any>;
  is_active: boolean | null;
  sort_order: number;
}

/**
 * 预定义的配置模板
 */
const CONFIG_TEMPLATES = {
  page_header_icon_style: {
    config_name: '页面头部图标样式配置',
    config_type: 'style',
    component_type: 'page_header_icon',
    page_scope: ['teachers', 'student-cases', 'courses'],
    config_value: {
      background: 'bg-blue-50',
      borderRadius: 'rounded-xl',
      backdrop: 'backdrop-blur-sm',
      iconColor: 'text-gray-700'
    }
  },
  page_header_icon_sizes: {
    config_name: '页面头部图标尺寸配置',
    config_type: 'size',
    component_type: 'page_header_icon',
    page_scope: ['teachers', 'student-cases', 'courses'],
    config_value: {
      mobile: { width: 'w-16', height: 'h-16', size_rem: 4 },
      desktop: { width: 'w-20', height: 'h-20', size_rem: 5 }
    }
  },
  page_header_icon_spacing: {
    config_name: '页面头部图标间距配置',
    config_type: 'spacing',
    component_type: 'page_header_icon',
    page_scope: ['teachers', 'student-cases', 'courses'],
    config_value: {
      mobile: { margin: 'mb-4', padding: 'p-3' },
      desktop: { margin: 'mb-6', padding: 'p-4' }
    }
  }
};

/**
 * 配置类型选项
 */
const CONFIG_TYPES = [
  { value: 'style', label: '样式配置' },
  { value: 'size', label: '尺寸配置' },
  { value: 'spacing', label: '间距配置' },
  { value: 'layout', label: '布局配置' },
  { value: 'theme', label: '主题配置' }
];

/**
 * 组件类型选项
 */
const COMPONENT_TYPES = [
  { value: 'page_header_icon', label: '页面头部图标' },
  { value: 'teacher_avatar', label: '教师头像' },
  { value: 'course_card', label: '课程卡片' },
  { value: 'article_card', label: '文章卡片' },
  { value: 'navigation', label: '导航组件' },
  { value: 'footer', label: '页脚组件' }
];

/**
 * 页面范围选项
 */
const PAGE_SCOPE_OPTIONS = [
  { value: 'home', label: '首页' },
  { value: 'teachers', label: '师资页面' },
  { value: 'student-cases', label: '学员案例' },
  { value: 'courses', label: '课程页面' },
  { value: 'articles', label: '新闻资讯' },
  { value: 'about', label: '关于我们' },
  { value: 'contact', label: '联系我们' }
];

/**
 * UI配置管理组件
 */
export const UIConfigManager: React.FC = () => {
  // 状态管理
  const [configs, setConfigs] = useState<UIConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [editingConfig, setEditingConfig] = useState<UIConfig | null>(null);
  const [formData, setFormData] = useState<UIConfigFormData>({
    config_key: '',
    config_name: '',
    config_type: 'style',
    component_type: 'page_header_icon',
    page_scope: [],
    config_value: {},
    is_active: true,
    sort_order: 0
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [configValueJson, setConfigValueJson] = useState('');

  /**
   * 加载所有UI配置
   */
  const loadConfigs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await uiConfigApi.getAll();
      setConfigs(data);
    } catch (error) {
      console.error('加载UI配置失败:', error);
      setAlert({ type: 'error', message: '加载UI配置失败' });
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 初始化加载
   */
  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  /**
   * 处理表单数据变更
   */
  const handleFormChange = (field: keyof UIConfigFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * 处理配置值JSON变更
   */
  const handleConfigValueChange = (value: string) => {
    setConfigValueJson(value);
    try {
      const parsed = JSON.parse(value);
      setFormData(prev => ({
        ...prev,
        config_value: parsed
      }));
    } catch (error) {
      // JSON格式错误，不更新formData
    }
  };

  /**
   * 应用配置模板
   */
  const applyTemplate = (templateKey: string) => {
    const template = CONFIG_TEMPLATES[templateKey as keyof typeof CONFIG_TEMPLATES];
    if (template) {
      setFormData({
        config_key: templateKey,
        ...template,
        is_active: true,
        sort_order: 0
      });
      setConfigValueJson(JSON.stringify(template.config_value, null, 2));
    }
  };

  /**
   * 开始编辑配置
   */
  const startEdit = (config: UIConfig) => {
    setEditingConfig(config);
    setFormData({
      config_key: config.config_key,
      config_name: config.config_name,
      config_type: config.config_type,
      component_type: config.component_type,
      page_scope: config.page_scope || [],
      config_value: config.config_value as Record<string, any>,
      is_active: config.is_active,
      sort_order: config.sort_order || 0
    });
    setConfigValueJson(JSON.stringify(config.config_value, null, 2));
    setShowCreateForm(true);
  };

  /**
   * 保存配置
   */
  const saveConfig = async () => {
    try {
      setSaving(true);
      
      // 验证JSON格式
      let configValue;
      try {
        configValue = JSON.parse(configValueJson);
      } catch (error) {
        setAlert({ type: 'error', message: '配置值JSON格式错误' });
        return;
      }

      const configData = {
        ...formData,
        config_value: configValue
      };

      if (editingConfig) {
        // 更新现有配置
        await uiConfigApi.update(editingConfig.id, configData);
        setAlert({ type: 'success', message: '配置更新成功' });
      } else {
        // 创建新配置
        await uiConfigApi.create(configData);
        setAlert({ type: 'success', message: '配置创建成功' });
      }

      // 重新加载配置列表
      await loadConfigs();
      
      // 重置表单
      setShowCreateForm(false);
      setEditingConfig(null);
      setFormData({
        config_key: '',
        config_name: '',
        config_type: 'style',
        component_type: 'page_header_icon',
        page_scope: [],
        config_value: {},
        is_active: true,
        sort_order: 0
      });
      setConfigValueJson('');
    } catch (error) {
      console.error('保存配置失败:', error);
      setAlert({ type: 'error', message: '保存配置失败' });
    } finally {
      setSaving(false);
    }
  };

  /**
   * 删除配置
   */
  const deleteConfig = async (config: UIConfig) => {
    if (!confirm(`确定要删除配置 "${config.config_name}" 吗？`)) {
      return;
    }

    try {
      await uiConfigApi.delete(config.id);
      setAlert({ type: 'success', message: '配置删除成功' });
      await loadConfigs();
    } catch (error) {
      console.error('删除配置失败:', error);
      setAlert({ type: 'error', message: '删除配置失败' });
    }
  };

  /**
   * 切换配置激活状态
   */
  const toggleConfigActive = async (config: UIConfig) => {
    try {
      await uiConfigApi.update(config.id, {
        is_active: !config.is_active
      });
      setAlert({ type: 'success', message: `配置已${config.is_active ? '禁用' : '启用'}` });
      await loadConfigs();
    } catch (error) {
      console.error('切换配置状态失败:', error);
      setAlert({ type: 'error', message: '切换配置状态失败' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* 页面标题 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          UI配置管理
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadConfigs}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            刷新
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateForm(true)}
          >
            新建配置
          </Button>
        </Box>
      </Box>

      {/* 警告信息 */}
      {alert && (
        <Alert 
          severity={alert.type} 
          onClose={() => setAlert(null)}
          sx={{ mb: 2 }}
        >
          {alert.message}
        </Alert>
      )}

      {/* 配置列表 */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <LoadingSpinner />
        </Box>
      ) : (
        <Box>
          {configs.map((config) => (
            <Box key={config.id} sx={{ mb: 2 }}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h6" component="h3">
                        {config.config_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        配置键: {config.config_key}
                      </Typography>
                      <Box display="flex" gap={1} mt={1}>
                        <Chip 
                          label={CONFIG_TYPES.find(t => t.value === config.config_type)?.label || config.config_type}
                          size="small"
                          color="primary"
                        />
                        <Chip 
                          label={COMPONENT_TYPES.find(t => t.value === config.component_type)?.label || config.component_type}
                          size="small"
                          color="secondary"
                        />
                        <Chip 
                          label={config.is_active ? '已启用' : '已禁用'}
                          size="small"
                          color={config.is_active ? 'success' : 'default'}
                        />
                      </Box>
                    </Box>
                    <Box display="flex" gap={1}>
                      <Tooltip title="编辑">
                        <IconButton onClick={() => startEdit(config)} size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={config.is_active ? '禁用' : '启用'}>
                        <IconButton onClick={() => toggleConfigActive(config)} size="small">
                          <VisibilityIcon color={config.is_active ? 'primary' : 'disabled'} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="删除">
                        <IconButton onClick={() => deleteConfig(config)} size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  {/* 页面范围 */}
                  {config.page_scope && config.page_scope.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        适用页面:
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {config.page_scope.map((scope) => (
                          <Chip 
                            key={scope}
                            label={PAGE_SCOPE_OPTIONS.find(p => p.value === scope)?.label || scope}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {/* 配置值预览 */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="body2">配置值</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box component="pre" sx={{ 
                        backgroundColor: 'grey.100', 
                        p: 2, 
                        borderRadius: 1, 
                        overflow: 'auto',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace'
                      }}>
                        {JSON.stringify(config.config_value, null, 2)}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {/* 创建/编辑配置对话框 */}
      {showCreateForm && (
        <Card sx={{ mt: 3, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {editingConfig ? '编辑配置' : '创建新配置'}
          </Typography>
          
          {/* 快速模板 */}
          {!editingConfig && (
            <Box mb={3}>
              <Typography variant="body2" gutterBottom>
                快速模板:
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {Object.keys(CONFIG_TEMPLATES).map((templateKey) => (
                  <Button
                    key={templateKey}
                    variant="outlined"
                    size="small"
                    onClick={() => applyTemplate(templateKey)}
                  >
                    {templateKey}
                  </Button>
                ))}
              </Box>
              <Divider sx={{ my: 2 }} />
            </Box>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <TextField
                fullWidth
                label="配置键"
                value={formData.config_key}
                onChange={(e) => handleFormChange('config_key', e.target.value)}
                disabled={!!editingConfig}
                required
              />
              <TextField
                fullWidth
                label="配置名称"
                value={formData.config_name}
                onChange={(e) => handleFormChange('config_name', e.target.value)}
                required
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <FormControl fullWidth>
                <InputLabel>配置类型</InputLabel>
                <Select
                  value={formData.config_type}
                  label="配置类型"
                  onChange={(e) => handleFormChange('config_type', e.target.value)}
                >
                  {CONFIG_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>组件类型</InputLabel>
                <Select
                  value={formData.component_type}
                  label="组件类型"
                  onChange={(e) => handleFormChange('component_type', e.target.value)}
                >
                  {COMPONENT_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>页面范围</InputLabel>
                <Select
                  multiple
                  value={formData.page_scope}
                  label="页面范围"
                  onChange={(e) => handleFormChange('page_scope', e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip 
                          key={value} 
                          label={PAGE_SCOPE_OPTIONS.find(p => p.value === value)?.label || value}
                          size="small" 
                        />
                      ))}
                    </Box>
                  )}
                >
                  {PAGE_SCOPE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <TextField
                fullWidth
                label="排序顺序"
                type="number"
                value={formData.sort_order}
                onChange={(e) => handleFormChange('sort_order', parseInt(e.target.value) || 0)}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active ?? false}
                    onChange={(e) => handleFormChange('is_active', e.target.checked)}
                  />
                }
                label="启用配置"
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="配置值 (JSON格式)"
                multiline
                rows={8}
                value={configValueJson}
                onChange={(e) => handleConfigValueChange(e.target.value)}
                placeholder='例如: {\n  "background": "bg-blue-50",\n  "borderRadius": "rounded-xl"\n}'
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }
                }}
                required
              />
            </Box>
          </Box>
          
          <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
            <Button
              variant="outlined"
              onClick={() => {
                setShowCreateForm(false);
                setEditingConfig(null);
              }}
            >
              取消
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={saveConfig}
              disabled={saving || !formData.config_key || !formData.config_name || !configValueJson}
            >
              {saving ? '保存中...' : '保存'}
            </Button>
          </Box>
        </Card>
      )}
    </Box>
  );
};

export default UIConfigManager;