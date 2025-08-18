/**
 * 样式实时预览面板组件
 * 提供样式配置的实时预览功能
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Tabs,
  Tab,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  PhoneIphone as PhoneIcon,
  Tablet as TabletIcon,
  Computer as ComputerIcon,
  Code as CodeIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

import type { PageStyleConfiguration } from '../../services/pageStyleService';
import type { ComponentStyleConfiguration } from '../../services/componentStyleService';

/**
 * 预览设备类型
 */
type PreviewDevice = 'mobile' | 'tablet' | 'desktop';

/**
 * 设备配置
 */
const DEVICE_CONFIG = {
  mobile: {
    label: '手机',
    icon: PhoneIcon,
    width: 375,
    height: 667,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  tablet: {
    label: '平板',
    icon: TabletIcon,
    width: 768,
    height: 1024,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  desktop: {
    label: '桌面',
    icon: ComputerIcon,
    width: 1200,
    height: 800,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  }
};

/**
 * 预览模式
 */
type PreviewMode = 'live' | 'iframe' | 'code';

interface StylePreviewPanelProps {
  type: 'page' | 'component';
  targetName: string;
  targetSection?: string;
  styles: PageStyleConfiguration | ComponentStyleConfiguration;
  visible: boolean;
  onToggleVisibility: () => void;
}

/**
 * 样式实时预览面板组件
 */
export const StylePreviewPanel: React.FC<StylePreviewPanelProps> = ({
  type,
  targetName,
  targetSection,
  styles,
  visible,
  onToggleVisibility
}) => {
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [previewMode] = useState<PreviewMode>('live');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /**
   * 生成CSS样式字符串
   */
  const generateCSS = useCallback(() => {
    if (type === 'page') {
      const pageStyles = styles as PageStyleConfiguration;
      return `
        /* 页面样式 - ${targetName} */
        .preview-container {
          max-width: ${pageStyles.layout?.maxWidth || '1200px'};
          margin: ${pageStyles.layout?.margin || '0 auto'};
          padding: ${pageStyles.layout?.padding || '20px'};
          background: ${pageStyles.layout?.background || '#ffffff'};
        }
        
        .preview-header {
          height: ${pageStyles.header?.height || '80px'};
          background: ${pageStyles.header?.background || '#ffffff'};
          border-bottom: ${pageStyles.header?.borderBottom || '1px solid #e0e0e0'};
          display: flex;
          align-items: center;
          padding: ${pageStyles.header?.padding || '0 20px'};
        }
        
        .preview-content {
          padding: ${pageStyles.content?.padding || '40px 0'};
          background: ${pageStyles.content?.background || 'transparent'};
          min-height: ${pageStyles.content?.minHeight || '400px'};
        }
        
        .preview-sidebar {
          width: ${pageStyles.sidebar?.width || '250px'};
          background: ${pageStyles.sidebar?.background || '#f5f5f5'};
          padding: ${pageStyles.sidebar?.padding || '20px'};
        }
        
        .preview-footer {
          background: ${pageStyles.footer?.background || '#333333'};
          color: ${pageStyles.footer?.color || '#ffffff'};
          padding: ${pageStyles.footer?.padding || '20px'};
          text-align: ${pageStyles.footer?.textAlign || 'center'};
        }
      `;
    } else {
      const componentStyles = styles as ComponentStyleConfiguration;
      return `
        /* 组件样式 - ${targetName} */
        .preview-component {
          padding: ${componentStyles.base?.padding || '12px 24px'};
          margin: ${componentStyles.base?.margin || '8px'};
          border: ${componentStyles.base?.border || 'none'};
          border-radius: ${componentStyles.base?.borderRadius || '4px'};
          background: ${componentStyles.base?.background || '#3b82f6'};
          color: ${componentStyles.base?.color || '#ffffff'};
          font-size: ${componentStyles.base?.fontSize || '14px'};
          font-weight: ${componentStyles.base?.fontWeight || '500'};
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-block;
        }
        
        .preview-component:hover {
          background: ${componentStyles.hover?.background || '#2563eb'};
          color: ${componentStyles.hover?.color || '#ffffff'};
          transform: ${componentStyles.hover?.transform || 'none'};
        }
        
        .preview-component:active {
          background: ${componentStyles.active?.background || '#1d4ed8'};
          transform: ${componentStyles.active?.transform || 'scale(0.98)'};
        }
        
        .preview-component:focus {
          outline: ${componentStyles.focus?.outline || '2px solid #3b82f6'};
          outline-offset: ${componentStyles.focus?.outlineOffset || '2px'};
        }
        
        .preview-component:disabled {
          background: ${componentStyles.disabled?.background || '#9ca3af'};
          color: ${componentStyles.disabled?.color || '#ffffff'};
          cursor: not-allowed;
          opacity: ${componentStyles.disabled?.opacity || '0.6'};
        }
      `;
    }
  }, [type, styles, targetName]);

  /**
   * 生成预览HTML
   */
  const generatePreviewHTML = useCallback(() => {
    if (type === 'page') {
      return `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>页面预览 - ${targetName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            ${generateCSS()}
          </style>
        </head>
        <body>
          <div class="preview-container">
            <header class="preview-header">
              <h1>网站标题</h1>
            </header>
            <main class="preview-content">
              <h2>页面内容</h2>
              <p>这是 ${targetName} 页面的预览效果。您可以在这里看到样式配置的实时效果。</p>
              <div style="margin: 20px 0;">
                <button class="preview-component">示例按钮</button>
                <button class="preview-component" style="margin-left: 10px;">另一个按钮</button>
              </div>
            </main>
            <footer class="preview-footer">
              <p>&copy; 2024 考研培训机构. 保留所有权利.</p>
            </footer>
          </div>
        </body>
        </html>
      `;
    } else {
      return `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>组件预览 - ${targetName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 40px;
              background: #f5f5f5;
            }
            .preview-container {
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            ${generateCSS()}
          </style>
        </head>
        <body>
          <div class="preview-container">
            <h2>组件预览 - ${targetName}</h2>
            <p style="margin: 20px 0; color: #666;">以下是组件的不同状态预览：</p>
            
            <div style="margin: 20px 0;">
              <h3 style="margin-bottom: 10px;">正常状态</h3>
              <div class="preview-component">正常按钮</div>
            </div>
            
            <div style="margin: 20px 0;">
              <h3 style="margin-bottom: 10px;">悬停状态 (请将鼠标悬停)</h3>
              <div class="preview-component">悬停按钮</div>
            </div>
            
            <div style="margin: 20px 0;">
              <h3 style="margin-bottom: 10px;">禁用状态</h3>
              <div class="preview-component" style="pointer-events: none; opacity: 0.6;">禁用按钮</div>
            </div>
            
            <div style="margin: 20px 0;">
              <h3 style="margin-bottom: 10px;">多个组件</h3>
              <div class="preview-component" style="margin-right: 10px;">按钮 1</div>
              <div class="preview-component" style="margin-right: 10px;">按钮 2</div>
              <div class="preview-component">按钮 3</div>
            </div>
          </div>
        </body>
        </html>
      `;    }
  }, [type, targetName, generateCSS]);

  /**
   * 刷新预览
   */
  const refreshPreview = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(generatePreviewHTML());
        doc.close();
      }
    }
  }, [generatePreviewHTML]);

  /**
   * 切换全屏
   */
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  /**
   * 导出预览代码
   */
  const exportPreviewCode = () => {
    const html = generatePreviewHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `preview-${targetName}-${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 当样式变化时自动刷新预览
  useEffect(() => {
    if (visible && previewMode === 'iframe') {
      const timer = setTimeout(refreshPreview, 300);
      return () => clearTimeout(timer);
    }
  }, [styles, visible, previewMode, refreshPreview]);

  if (!visible) {
    return (
      <Box position="fixed" top={100} right={20} zIndex={1000}>
        <Tooltip title="显示预览">
          <IconButton
            onClick={onToggleVisibility}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  const deviceConfig = DEVICE_CONFIG[previewDevice];

  return (
    <>
      <Card
        sx={{
          position: 'fixed',
          top: isFullscreen ? 0 : 100,
          right: isFullscreen ? 0 : 20,
          width: isFullscreen ? '100vw' : deviceConfig.width + 40,
          height: isFullscreen ? '100vh' : deviceConfig.height + 120,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <CardContent sx={{ p: 2, pb: 1 }}>
          {/* 预览控制栏 */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              预览 - {targetName}{targetSection && ` (${targetSection})`}
            </Typography>
            <Box display="flex" gap={1}>
              <Tooltip title="隐藏预览">
                <IconButton size="small" onClick={onToggleVisibility}>
                  <VisibilityOffIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="刷新">
                <IconButton size="small" onClick={refreshPreview}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="查看代码">
                <IconButton size="small" onClick={() => setCodeDialogOpen(true)}>
                  <CodeIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="导出">
                <IconButton size="small" onClick={exportPreviewCode}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={isFullscreen ? '退出全屏' : '全屏'}>
                <IconButton size="small" onClick={toggleFullscreen}>
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {/* 设备和模式选择 */}
          <Box display="flex" gap={2} mb={2}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>设备</InputLabel>
              <Select
                value={previewDevice}
                label="设备"
                onChange={(e) => setPreviewDevice(e.target.value as PreviewDevice)}
              >
                {Object.entries(DEVICE_CONFIG).map(([key, config]) => {
                  const IconComponent = config.icon;
                  return (
                    <MenuItem key={key} value={key}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <IconComponent fontSize="small" />
                        {config.label}
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            
            <Chip 
              label={`${deviceConfig.width} × ${deviceConfig.height}`}
              size="small"
              variant="outlined"
            />
          </Box>
        </CardContent>
        
        {/* 预览区域 */}
        <Box 
          flex={1} 
          sx={{ 
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            mx: 2,
            mb: 2,
            overflow: 'hidden'
          }}
        >
          <iframe
            ref={iframeRef}
            key={refreshKey}
            srcDoc={generatePreviewHTML()}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: 'white'
            }}
            title={`预览 - ${targetName}`}
          />
        </Box>
      </Card>
      
      {/* 代码查看对话框 */}
      <Dialog open={codeDialogOpen} onClose={() => setCodeDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>预览代码</DialogTitle>
        <DialogContent>
          <Tabs value={0}>
            <Tab label="HTML" />
          </Tabs>
          <Paper variant="outlined" sx={{ mt: 2, p: 2, bgcolor: 'grey.50', maxHeight: 400, overflow: 'auto' }}>
            <pre style={{ fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap' }}>
              {generatePreviewHTML()}
            </pre>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCodeDialogOpen(false)}>关闭</Button>
          <Button onClick={exportPreviewCode} variant="contained">
            导出 HTML
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StylePreviewPanel;