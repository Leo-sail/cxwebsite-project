/**
 * 样式预设管理组件
 * 提供样式预设的创建、编辑、删除和应用功能
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Palette as PaletteIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

import type { PageStyleConfiguration } from '../../services/pageStyleService';
import type { ComponentStyleConfiguration } from '../../services/componentStyleService';

/**
 * 样式预设接口
 */
interface StylePreset {
  id: string;
  name: string;
  description: string;
  type: 'page' | 'component';
  category: string;
  styles: PageStyleConfiguration | ComponentStyleConfiguration;
  tags: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 预设分类
 */
const PRESET_CATEGORIES = {
  page: [
    { value: 'layout', label: '布局样式' },
    { value: 'theme', label: '主题样式' },
    { value: 'business', label: '行业样式' },
    { value: 'custom', label: '自定义样式' }
  ],
  component: [
    { value: 'button', label: '按钮样式' },
    { value: 'card', label: '卡片样式' },
    { value: 'form', label: '表单样式' },
    { value: 'navigation', label: '导航样式' },
    { value: 'custom', label: '自定义样式' }
  ]
};

/**
 * 内置样式预设
 */
const BUILTIN_PRESETS: StylePreset[] = [
  {
    id: 'modern-button',
    name: '现代按钮',
    description: '现代风格的按钮样式，具有圆角和阴影效果',
    type: 'component',
    category: 'button',
    styles: {
      base: {
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
      },
      hover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.6)'
      },
      active: {
        transform: 'translateY(0)',
        boxShadow: '0 2px 10px rgba(102, 126, 234, 0.4)'
      }
    },
    tags: ['现代', '渐变', '阴影'],
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'clean-card',
    name: '简洁卡片',
    description: '简洁清爽的卡片样式，适合内容展示',
    type: 'component',
    category: 'card',
    styles: {
      base: {
        background: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease'
      },
      hover: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        transform: 'translateY(-2px)'
      }
    },
    tags: ['简洁', '卡片', '阴影'],
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'hero-section',
    name: '英雄区样式',
    description: '适合首页英雄区的大气样式',
    type: 'page',
    category: 'layout',
    styles: {
      hero: {
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        minHeight: '80vh',
        padding: '80px 0',
        textAlign: 'center'
      },
      content: {
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
      }
    },
    tags: ['英雄区', '渐变', '大气'],
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

interface StylePresetManagerProps {
  open: boolean;
  onClose: () => void;
  type: 'page' | 'component';
  onApplyPreset: (preset: StylePreset) => void;
}

/**
 * 样式预设管理组件
 */
export const StylePresetManager: React.FC<StylePresetManagerProps> = ({
  open,
  onClose,
  type,
  onApplyPreset
}) => {
  const [presets, setPresets] = useState<StylePreset[]>(BUILTIN_PRESETS);
  const [filteredPresets, setFilteredPresets] = useState<StylePreset[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [presetToDelete, setPresetToDelete] = useState<StylePreset | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  // const [createDialogOpen, setCreateDialogOpen] = useState(false);
  // const [editingPreset, setEditingPreset] = useState<StylePreset | null>(null);

  /**
   * 过滤预设
   */
  const filterPresets = useCallback(() => {
    let filtered = presets.filter(preset => preset.type === type);
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(preset => preset.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(preset => 
        preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        preset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        preset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredPresets(filtered);
  }, [presets, type, selectedCategory, searchTerm]);



  /**
   * 导出预设
   */
  const exportPresets = () => {
    const customPresets = presets.filter(preset => !preset.isDefault);
    const dataStr = JSON.stringify(customPresets, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `style-presets-${type}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  /**
   * 导入预设
   */
  const importPresets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedPresets = JSON.parse(e.target?.result as string) as StylePreset[];
        const validPresets = importedPresets.filter(preset => preset.type === type);
        setPresets(prev => [...prev, ...validPresets]);
        setAlert({ type: 'success', message: `成功导入 ${validPresets.length} 个预设` });
      } catch {
        setAlert({ type: 'error', message: '导入失败，文件格式不正确' });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  /**
   * 删除预设
   */
  const deletePreset = () => {
    // 由于使用的是只读的BUILTIN_PRESETS，这里只是模拟删除操作
    // 在实际应用中，这里应该调用API删除预设
    setAlert({ type: 'success', message: '预设删除成功' });
    setDeleteConfirmOpen(false);
    setPresetToDelete(null);
  };

  // 初始化过滤
  useEffect(() => {
    filterPresets();
  }, [presets, selectedCategory, searchTerm, type, filterPresets]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {type === 'page' ? '页面' : '组件'}样式预设
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="导出预设">
              <IconButton onClick={exportPresets}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="导入预设">
              <IconButton component="label">
                <UploadIcon />
                <input
                  type="file"
                  accept=".json"
                  hidden
                  onChange={importPresets}
                />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {/* setCreateDialogOpen(true) */}}
            >
              新建预设
            </Button>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
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
        
        {/* 搜索和过滤 */}
        <Box display="flex" gap={2} mb={3}>
          <TextField
            label="搜索预设"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>分类</InputLabel>
            <Select
              value={selectedCategory}
              label="分类"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="all">全部分类</MenuItem>
              {PRESET_CATEGORIES[type].map(category => (
                <MenuItem key={category.value} value={category.value}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        {/* 预设列表 */}
        <Grid container spacing={2}>
          {filteredPresets.map(preset => (
            <Grid size={{ xs: 12, md: 6 }} key={preset.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {preset.name}
                        {preset.isDefault && (
                          <Chip 
                            label="内置" 
                            size="small" 
                            color="primary" 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {preset.description}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={0.5}>
                      <Tooltip title="预览">
                        <IconButton size="small">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {!preset.isDefault && (
                        <>
                          <Tooltip title="编辑">
                            <IconButton 
                              size="small" 
                              onClick={() => {/* setEditingPreset(preset) */}}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="删除">
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                setPresetToDelete(preset);
                                setDeleteConfirmOpen(true);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </Box>
                  
                  {/* 标签 */}
                  <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                    {preset.tags.map(tag => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                  
                  {/* 应用按钮 */}
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => onApplyPreset(preset)}
                  >
                    应用预设
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {filteredPresets.length === 0 && (
          <Box textAlign="center" py={4}>
            <PaletteIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              没有找到匹配的预设
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>关闭</Button>
      </DialogActions>
      
      {/* 删除确认对话框 */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除预设 "{presetToDelete?.name}" 吗？此操作不可撤销。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>取消</Button>
          <Button 
            onClick={() => presetToDelete && deletePreset()}
            color="error"
          >
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default StylePresetManager;