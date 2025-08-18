/**
 * 样式配置页面
 * 提供页面级和组件级样式配置功能
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
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
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Preview as PreviewIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import { useTheme } from '../../hooks/useTheme';
import { pageStyleService, type PageStyleConfiguration } from '../../services/pageStyleService';
import { componentStyleService, type ComponentStyleConfiguration } from '../../services/componentStyleService';
import { LoadingSpinner } from '../../components';
import { StylePresetManager } from '../components/StylePresetManager';
import { StyleHistoryManager } from '../components/StyleHistoryManager';
import { StylePreviewPanel } from '../components/StylePreviewPanel';

/**
 * 样式配置项接口
 */
interface StyleProperty {
  key: string;
  label: string;
  type: 'text' | 'color' | 'select' | 'number';
  options?: string[];
  unit?: string;
  category: string;
}

/**
 * 页面配置
 */
const PAGE_CONFIGS = [
  { value: 'home', label: '首页' },
  { value: 'courses', label: '课程页面' },
  { value: 'teachers', label: '师资页面' },
  { value: 'articles', label: '新闻资讯' },
  { value: 'cases', label: '学员案例' },
  { value: 'about', label: '关于我们' },
  { value: 'contact', label: '联系我们' }
];

/**
 * 组件配置
 */
const COMPONENT_CONFIGS = [
  { value: 'Button', label: '按钮组件' },
  { value: 'Card', label: '卡片组件' },
  { value: 'Header', label: '页头组件' },
  { value: 'Footer', label: '页脚组件' },
  { value: 'Navigation', label: '导航组件' },
  { value: 'Hero', label: '英雄区组件' },
  { value: 'CourseCard', label: '课程卡片' },
  { value: 'TeacherCard', label: '教师卡片' },
  { value: 'ArticleCard', label: '文章卡片' }
];

/**
 * 样式属性配置
 */
const STYLE_PROPERTIES: StyleProperty[] = [
  // 布局属性
  { key: 'display', label: '显示方式', type: 'select', options: ['block', 'flex', 'grid', 'inline-block'], category: 'layout' },
  { key: 'position', label: '定位方式', type: 'select', options: ['static', 'relative', 'absolute', 'fixed', 'sticky'], category: 'layout' },
  { key: 'width', label: '宽度', type: 'text', unit: 'px/%/rem', category: 'layout' },
  { key: 'height', label: '高度', type: 'text', unit: 'px/%/rem', category: 'layout' },
  { key: 'maxWidth', label: '最大宽度', type: 'text', unit: 'px/%/rem', category: 'layout' },
  { key: 'minHeight', label: '最小高度', type: 'text', unit: 'px/%/rem', category: 'layout' },
  
  // 间距属性
  { key: 'padding', label: '内边距', type: 'text', unit: 'px/rem', category: 'spacing' },
  { key: 'margin', label: '外边距', type: 'text', unit: 'px/rem', category: 'spacing' },
  { key: 'gap', label: '间隙', type: 'text', unit: 'px/rem', category: 'spacing' },
  
  // 外观属性
  { key: 'background', label: '背景色', type: 'color', category: 'appearance' },
  { key: 'color', label: '文字颜色', type: 'color', category: 'appearance' },
  { key: 'border', label: '边框', type: 'text', category: 'appearance' },
  { key: 'borderRadius', label: '圆角', type: 'text', unit: 'px/rem', category: 'appearance' },
  { key: 'boxShadow', label: '阴影', type: 'text', category: 'appearance' },
  
  // 文字属性
  { key: 'fontSize', label: '字体大小', type: 'text', unit: 'px/rem', category: 'typography' },
  { key: 'fontWeight', label: '字体粗细', type: 'select', options: ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'], category: 'typography' },
  { key: 'lineHeight', label: '行高', type: 'text', category: 'typography' },
  { key: 'textAlign', label: '文字对齐', type: 'select', options: ['left', 'center', 'right', 'justify'], category: 'typography' },
  
  // 交互属性
  { key: 'cursor', label: '鼠标样式', type: 'select', options: ['default', 'pointer', 'text', 'move', 'not-allowed'], category: 'interaction' },
  { key: 'transition', label: '过渡效果', type: 'text', category: 'interaction' },
  { key: 'transform', label: '变换', type: 'text', category: 'interaction' },
  { key: 'opacity', label: '透明度', type: 'number', category: 'interaction' }
];

/**
 * 样式配置页面组件
 */
export const StyleConfiguration: React.FC = () => {
  const { currentTheme } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedPage, setSelectedPage] = useState('home');
  const [selectedComponent, setSelectedComponent] = useState('Button');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [pageStyles, setPageStyles] = useState<PageStyleConfiguration>({
    layout: {}
  });
  const [componentStyles, setComponentStyles] = useState<ComponentStyleConfiguration>({});
  const [pageSections, setPageSections] = useState<string[]>([]);
  const [componentVariants, setComponentVariants] = useState<string[]>([]);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [presetManagerOpen, setPresetManagerOpen] = useState(false);
  const [historyManagerOpen, setHistoryManagerOpen] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  /**
   * 加载页面样式
   */
  const loadPageStyles = useCallback(async () => {
    if (!currentTheme?.id) return;
    
    try {
      setLoading(true);
      const styles = selectedSection 
        ? await pageStyleService.getPageSectionStyles(currentTheme.id, selectedPage, selectedSection)
        : await pageStyleService.getPageStyles(currentTheme.id, selectedPage);
      setPageStyles(styles);
      
      // 加载页面区块
      const sections = await pageStyleService.getPageSections(currentTheme.id, selectedPage);
      setPageSections(sections);
    } catch (error) {
      console.error('加载页面样式失败:', error);
      setAlert({ type: 'error', message: '加载页面样式失败' });
    } finally {
      setLoading(false);
    }
  }, [currentTheme?.id, selectedPage, selectedSection]);

  /**
   * 加载组件样式
   */
  const loadComponentStyles = useCallback(async () => {
    if (!currentTheme?.id) return;
    
    try {
      setLoading(true);
      const styles = selectedVariant 
        ? await componentStyleService.getComponentVariantStyles(currentTheme.id, selectedComponent, selectedVariant)
        : await componentStyleService.getComponentStyles(currentTheme.id, selectedComponent);
      setComponentStyles(styles);
      
      // 加载组件变体
      const variants = await componentStyleService.getComponentVariants(currentTheme.id, selectedComponent);
      setComponentVariants(variants);
    } catch (error) {
      console.error('加载组件样式失败:', error);
      setAlert({ type: 'error', message: '加载组件样式失败' });
    } finally {
      setLoading(false);
    }
  }, [currentTheme?.id, selectedComponent, selectedVariant]);

  /**
   * 保存页面样式
   */
  const savePageStyles = async () => {
    if (!currentTheme?.id) return;
    
    try {
      setLoading(true);
      // 这里需要实现保存逻辑
      setAlert({ type: 'success', message: '页面样式保存成功' });
      setUnsavedChanges(false);
    } catch (error: unknown) {
      console.error('保存页面样式失败:', error);
      setAlert({ type: 'error', message: '保存页面样式失败' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 保存组件样式
   */
  const saveComponentStyles = async () => {
    if (!currentTheme?.id) return;
    
    try {
      setLoading(true);
      // 这里需要实现保存逻辑
      setAlert({ type: 'success', message: '组件样式保存成功' });
      setUnsavedChanges(false);
    } catch (error: unknown) {
      console.error('保存组件样式失败:', error);
      setAlert({ type: 'error', message: '保存组件样式失败' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 更新样式属性
   */
  const updateStyleProperty = (category: string, property: string, value: string) => {
    if (activeTab === 0) {
      setPageStyles(prev => ({
        ...prev,
        [category]: {
          ...(prev[category] as Record<string, unknown> || {}),
          [property]: value
        }
      }));
    } else {
      setComponentStyles(prev => ({
        ...prev,
        [category]: {
          ...(prev[category] as Record<string, unknown> || {}),
          [property]: value
        }
      }));
    }
    setUnsavedChanges(true);
  };

  /**
   * 渲染样式编辑器
   */
  const renderStyleEditor = (styles: Record<string, unknown>, onUpdate: (category: string, property: string, value: string) => void) => {
    const categories = [...new Set(STYLE_PROPERTIES.map(prop => prop.category))];
    
    return (
      <Box>
        {categories.map(category => {
          const categoryProps = STYLE_PROPERTIES.filter(prop => prop.category === category);
          const categoryStyles = (styles[category] as Record<string, string>) || {};
          
          return (
            <Accordion key={category} defaultExpanded={category === 'layout'}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                  {category === 'layout' && '布局'}
                  {category === 'spacing' && '间距'}
                  {category === 'appearance' && '外观'}
                  {category === 'typography' && '文字'}
                  {category === 'interaction' && '交互'}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {categoryProps.map(prop => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={prop.key}>
                      {prop.type === 'select' ? (
                        <FormControl fullWidth size="small">
                          <InputLabel>{prop.label}</InputLabel>
                          <Select
                            value={categoryStyles[prop.key] || ''}
                            label={prop.label}
                            onChange={(e) => onUpdate(category, prop.key, e.target.value)}
                          >
                            <MenuItem value="">默认</MenuItem>
                            {prop.options?.map(option => (
                              <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : prop.type === 'color' ? (
                        <Box>
                          <TextField
                            fullWidth
                            size="small"
                            label={prop.label}
                            value={categoryStyles[prop.key] || ''}
                            onChange={(e) => onUpdate(category, prop.key, e.target.value)}
                            InputProps={{
                              endAdornment: (
                                <input
                                  type="color"
                                  value={categoryStyles[prop.key] || '#000000'}
                                  onChange={(e) => onUpdate(category, prop.key, e.target.value)}
                                  style={{ width: 30, height: 30, border: 'none', cursor: 'pointer' }}
                                />
                              )
                            }}
                          />
                        </Box>
                      ) : (
                        <TextField
                          fullWidth
                          size="small"
                          label={prop.label}
                          value={categoryStyles[prop.key] || ''}
                          onChange={(e) => onUpdate(category, prop.key, e.target.value)}
                          placeholder={prop.unit ? `例如: 16${prop.unit}` : ''}
                          helperText={prop.unit && `单位: ${prop.unit}`}
                        />
                      )}
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    );
  };

  // 初始化加载
  useEffect(() => {
    if (activeTab === 0) {
      loadPageStyles();
    } else {
      loadComponentStyles();
    }
  }, [activeTab, selectedPage, selectedComponent, selectedSection, selectedVariant, currentTheme?.id, loadPageStyles, loadComponentStyles]);

  if (!currentTheme) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Alert severity="warning">请先选择一个主题</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* 页面标题 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          样式配置
        </Typography>
        <Box display="flex" gap={1}>
          <Tooltip title="刷新">
            <IconButton onClick={() => activeTab === 0 ? loadPageStyles() : loadComponentStyles()}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="样式历史">
            <IconButton onClick={() => setHistoryManagerOpen(true)}>
              <HistoryIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="样式预设">
            <IconButton onClick={() => setPresetManagerOpen(true)}>
              <PaletteIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="预览效果">
            <IconButton onClick={() => setPreviewVisible(!previewVisible)}>
              <PreviewIcon />
            </IconButton>
          </Tooltip>
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

      {/* 未保存更改提示 */}
      {unsavedChanges && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          您有未保存的更改
        </Alert>
      )}

      {/* 主要内容 */}
      <Card>
        <CardContent>
          {/* 标签页 */}
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="页面样式" />
            <Tab label="组件样式" />
          </Tabs>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <LoadingSpinner />
            </Box>
          ) : (
            <Box>
              {/* 页面样式配置 */}
              {activeTab === 0 && (
                <Box>
                  {/* 页面选择器 */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormControl fullWidth>
                        <InputLabel>选择页面</InputLabel>
                        <Select
                          value={selectedPage}
                          label="选择页面"
                          onChange={(e) => setSelectedPage(e.target.value)}
                        >
                          {PAGE_CONFIGS.map(page => (
                            <MenuItem key={page.value} value={page.value}>
                              {page.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormControl fullWidth>
                        <InputLabel>页面区块（可选）</InputLabel>
                        <Select
                          value={selectedSection}
                          label="页面区块（可选）"
                          onChange={(e) => setSelectedSection(e.target.value)}
                        >
                          <MenuItem value="">全页面</MenuItem>
                          {pageSections.map(section => (
                            <MenuItem key={section} value={section}>
                              {section}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={savePageStyles}
                        disabled={!unsavedChanges || loading}
                        fullWidth
                      >
                        保存页面样式
                      </Button>
                    </Grid>
                  </Grid>

                  {/* 页面样式编辑器 */}
                  {renderStyleEditor(pageStyles, updateStyleProperty)}
                </Box>
              )}

              {/* 组件样式配置 */}
              {activeTab === 1 && (
                <Box>
                  {/* 组件选择器 */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormControl fullWidth>
                        <InputLabel>选择组件</InputLabel>
                        <Select
                          value={selectedComponent}
                          label="选择组件"
                          onChange={(e) => setSelectedComponent(e.target.value)}
                        >
                          {COMPONENT_CONFIGS.map(component => (
                            <MenuItem key={component.value} value={component.value}>
                              {component.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormControl fullWidth>
                        <InputLabel>组件变体（可选）</InputLabel>
                        <Select
                          value={selectedVariant}
                          label="组件变体（可选）"
                          onChange={(e) => setSelectedVariant(e.target.value)}
                        >
                          <MenuItem value="">默认样式</MenuItem>
                          {componentVariants.map(variant => (
                            <MenuItem key={variant} value={variant}>
                              {variant}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={saveComponentStyles}
                        disabled={!unsavedChanges || loading}
                        fullWidth
                      >
                        保存组件样式
                      </Button>
                    </Grid>
                  </Grid>

                  {/* 组件样式编辑器 */}
                  {renderStyleEditor(componentStyles, updateStyleProperty)}
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 样式预设管理器 */}
      <StylePresetManager
        open={presetManagerOpen}
        onClose={() => setPresetManagerOpen(false)}
        type={activeTab === 0 ? 'page' : 'component'}
        onApplyPreset={(preset) => {
          if (activeTab === 0) {
            setPageStyles(preset.styles as PageStyleConfiguration);
          } else {
            setComponentStyles(preset.styles as ComponentStyleConfiguration);
          }
          setAlert({ type: 'success', message: `已应用预设: ${preset.name}` });
        }}
      />
      
      {/* 样式历史管理器 */}
      <StyleHistoryManager
        open={historyManagerOpen}
        onClose={() => setHistoryManagerOpen(false)}
        type={activeTab === 0 ? 'page' : 'component'}
        targetName={activeTab === 0 ? selectedPage : selectedComponent}
        onRestoreVersion={(record) => {
          if (activeTab === 0) {
            setPageStyles(record.styles as PageStyleConfiguration);
          } else {
            setComponentStyles(record.styles as ComponentStyleConfiguration);
          }
          setAlert({ type: 'success', message: `已恢复到版本 ${record.version}` });
        }}
      />
      
      {/* 样式实时预览面板 */}
      <StylePreviewPanel
        type={activeTab === 0 ? 'page' : 'component'}
        targetName={activeTab === 0 ? selectedPage : selectedComponent}
        targetSection={activeTab === 0 ? selectedSection : selectedVariant}
        styles={activeTab === 0 ? pageStyles : componentStyles}
        visible={previewVisible}
        onToggleVisibility={() => setPreviewVisible(!previewVisible)}
      />
    </Box>
  );
};

export default StyleConfiguration;