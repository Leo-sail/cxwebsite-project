/**
 * 样式历史版本管理组件
 * 提供样式变更历史记录、版本对比和回滚功能
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Alert,
  Divider,
  Grid,
  Paper,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  History as HistoryIcon,
  Restore as RestoreIcon,
  Compare as CompareIcon,
  Download as DownloadIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useTheme } from '../../hooks/useTheme';
import type { PageStyleConfiguration } from '../../services/pageStyleService';
import type { ComponentStyleConfiguration } from '../../services/componentStyleService';

/**
 * 样式历史记录接口
 */
interface StyleHistoryRecord {
  id: string;
  type: 'page' | 'component';
  targetName: string; // 页面名或组件名
  targetSection?: string; // 页面区块或组件变体
  version: number;
  styles: PageStyleConfiguration | ComponentStyleConfiguration;
  changeDescription: string;
  changeType: 'create' | 'update' | 'delete' | 'restore';
  changedProperties: string[];
  author: string;
  createdAt: string;
  isCurrent: boolean;
}

/**
 * 变更类型配置
 */
const CHANGE_TYPE_CONFIG = {
  create: { label: '创建', color: 'success' as const },
  update: { label: '更新', color: 'primary' as const },
  delete: { label: '删除', color: 'error' as const },
  restore: { label: '恢复', color: 'warning' as const }
};

/**
 * 模拟历史数据
 */
const MOCK_HISTORY: StyleHistoryRecord[] = [
  {
    id: 'hist-1',
    type: 'page',
    targetName: 'home',
    version: 3,
    styles: {
      layout: { maxWidth: '1200px', padding: '20px' },
      header: { height: '80px', background: '#ffffff' }
    },
    changeDescription: '调整首页布局最大宽度和内边距',
    changeType: 'update',
    changedProperties: ['layout.maxWidth', 'layout.padding'],
    author: '管理员',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isCurrent: true
  },
  {
    id: 'hist-2',
    type: 'page',
    targetName: 'home',
    version: 2,
    styles: {
      layout: { maxWidth: '1000px', padding: '16px' },
      header: { height: '80px', background: '#ffffff' }
    },
    changeDescription: '初始化首页样式配置',
    changeType: 'create',
    changedProperties: ['layout', 'header'],
    author: '管理员',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isCurrent: false
  },
  {
    id: 'hist-3',
    type: 'component',
    targetName: 'Button',
    version: 2,
    styles: {
      base: {
        padding: '12px 24px',
        borderRadius: '8px',
        background: '#3b82f6',
        color: '#ffffff'
      },
      hover: {
        background: '#2563eb'
      }
    },
    changeDescription: '更新按钮悬停效果',
    changeType: 'update',
    changedProperties: ['hover.background'],
    author: '设计师',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    isCurrent: true
  }
];

interface StyleHistoryManagerProps {
  open: boolean;
  onClose: () => void;
  type: 'page' | 'component';
  targetName: string;
  targetSection?: string;
  onRestoreVersion: (record: StyleHistoryRecord) => void;
}

/**
 * 样式历史版本管理组件
 */
export const StyleHistoryManager: React.FC<StyleHistoryManagerProps> = ({
  open,
  onClose,
  type,
  targetName,
  targetSection,
  onRestoreVersion
}) => {
  useTheme(); // 保持主题上下文连接
  const [historyRecords, setHistoryRecords] = useState<StyleHistoryRecord[]>(MOCK_HISTORY);
  const [filteredRecords, setFilteredRecords] = useState<StyleHistoryRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<StyleHistoryRecord | null>(null);
  const [compareRecord, setCompareRecord] = useState<StyleHistoryRecord | null>(null);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [recordToRestore, setRecordToRestore] = useState<StyleHistoryRecord | null>(null);
  const [filterChangeType, setFilterChangeType] = useState<string>('all');
  const [filterAuthor, setFilterAuthor] = useState<string>('all');
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  /**
   * 过滤历史记录
   */
  const filterRecords = useCallback(() => {
    let filtered = historyRecords.filter(record => 
      record.type === type && 
      record.targetName === targetName &&
      (!targetSection || record.targetSection === targetSection)
    );
    
    if (filterChangeType !== 'all') {
      filtered = filtered.filter(record => record.changeType === filterChangeType);
    }
    
    if (filterAuthor !== 'all') {
      filtered = filtered.filter(record => record.author === filterAuthor);
    }
    
    // 按时间倒序排列
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setFilteredRecords(filtered);
  }, [historyRecords, type, targetName, targetSection, filterChangeType, filterAuthor]);

  /**
   * 恢复版本
   */
  const restoreVersion = (record: StyleHistoryRecord) => {
    // 创建新的历史记录
    const newRecord: StyleHistoryRecord = {
      id: `hist-${Date.now()}`,
      type: record.type,
      targetName: record.targetName,
      targetSection: record.targetSection,
      version: Math.max(...historyRecords.map(r => r.version)) + 1,
      styles: record.styles,
      changeDescription: `恢复到版本 ${record.version}`,
      changeType: 'restore',
      changedProperties: Object.keys(record.styles),
      author: '当前用户',
      createdAt: new Date().toISOString(),
      isCurrent: true
    };
    
    // 更新历史记录
    setHistoryRecords(prev => [
      newRecord,
      ...prev.map(r => ({ ...r, isCurrent: false }))
    ]);
    
    onRestoreVersion(record);
    setAlert({ type: 'success', message: `已恢复到版本 ${record.version}` });
    setRestoreDialogOpen(false);
    setRecordToRestore(null);
  };

  /**
   * 导出历史记录
   */
  const exportHistory = () => {
    const dataStr = JSON.stringify(filteredRecords, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `style-history-${targetName}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  /**
   * 格式化时间
   */
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 1000 * 60) {
      return '刚刚';
    } else if (diff < 1000 * 60 * 60) {
      return `${Math.floor(diff / (1000 * 60))} 分钟前`;
    } else if (diff < 1000 * 60 * 60 * 24) {
      return `${Math.floor(diff / (1000 * 60 * 60))} 小时前`;
    } else {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  /**
   * 渲染样式差异
   */
  const renderStyleDiff = (current: Record<string, unknown>, previous: Record<string, unknown>) => {
    const changes: { property: string; current: string; previous: string }[] = [];
    
    const compareObjects = (curr: Record<string, unknown>, prev: Record<string, unknown>, prefix = '') => {
      Object.keys(curr || {}).forEach(key => {
        const currentValue = curr[key];
        const previousValue = prev?.[key];
        const propertyPath = prefix ? `${prefix}.${key}` : key;
        
        if (typeof currentValue === 'object' && currentValue !== null) {
          compareObjects(currentValue as Record<string, unknown>, previousValue as Record<string, unknown> || {}, propertyPath);
        } else if (currentValue !== previousValue) {
          changes.push({
            property: propertyPath,
            current: String(currentValue || ''),
            previous: String(previousValue || '')
          });
        }
      });
    };
    
    compareObjects(current, previous);
    
    return (
      <Box>
        {changes.length === 0 ? (
          <Typography color="text.secondary">无变更</Typography>
        ) : (
          <List dense>
            {changes.map((change, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={change.property}
                  secondary={
                    <Box>
                      <Typography component="span" color="error">
                        - {change.previous || '(空)'}
                      </Typography>
                      <br />
                      <Typography component="span" color="success.main">
                        + {change.current || '(空)'}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    );
  };

  // 获取所有作者
  const authors = [...new Set(historyRecords.map(record => record.author))];

  // 初始化过滤
  useEffect(() => {
    filterRecords();
  }, [historyRecords, type, targetName, targetSection, filterChangeType, filterAuthor, filterRecords]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            样式历史 - {targetName}{targetSection && ` (${targetSection})`}
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="导出历史">
              <IconButton onClick={exportHistory}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
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
        
        {/* 过滤器 */}
        <Box display="flex" gap={2} mb={3}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>变更类型</InputLabel>
            <Select
              value={filterChangeType}
              label="变更类型"
              onChange={(e) => setFilterChangeType(e.target.value)}
            >
              <MenuItem value="all">全部类型</MenuItem>
              {Object.entries(CHANGE_TYPE_CONFIG).map(([type, config]) => (
                <MenuItem key={type} value={type}>
                  {config.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>操作者</InputLabel>
            <Select
              value={filterAuthor}
              label="操作者"
              onChange={(e) => setFilterAuthor(e.target.value)}
            >
              <MenuItem value="all">全部用户</MenuItem>
              {authors.map(author => (
                <MenuItem key={author} value={author}>
                  {author}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        {/* 历史记录列表 */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom>
              版本历史
            </Typography>
            <Paper variant="outlined" sx={{ maxHeight: 500, overflow: 'auto' }}>
              <List>
                {filteredRecords.map((record, index) => (
                  <React.Fragment key={record.id}>
                    <ListItemButton
                      selected={selectedRecord?.id === record.id}
                      onClick={() => setSelectedRecord(record)}
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle2">
                              版本 {record.version}
                            </Typography>
                            {record.isCurrent && (
                              <Chip label="当前" size="small" color="primary" />
                            )}
                            <Chip 
                              label={CHANGE_TYPE_CONFIG[record.changeType].label}
                              size="small"
                              color={CHANGE_TYPE_CONFIG[record.changeType].color}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" gutterBottom>
                              {record.changeDescription}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                              <PersonIcon fontSize="small" />
                              <Typography variant="caption">
                                {record.author}
                              </Typography>
                              <AccessTimeIcon fontSize="small" />
                              <Typography variant="caption">
                                {formatTime(record.createdAt)}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="对比">
                            <IconButton 
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCompareRecord(record);
                                setCompareDialogOpen(true);
                              }}
                            >
                              <CompareIcon />
                            </IconButton>
                          </Tooltip>
                          {!record.isCurrent && (
                            <Tooltip title="恢复">
                              <IconButton 
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRecordToRestore(record);
                                  setRestoreDialogOpen(true);
                                }}
                              >
                                <RestoreIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItemButton>
                    {index < filteredRecords.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom>
              版本详情
            </Typography>
            {selectedRecord ? (
              <Paper variant="outlined" sx={{ p: 2, maxHeight: 500, overflow: 'auto' }}>
                <Typography variant="subtitle1" gutterBottom>
                  版本 {selectedRecord.version}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {selectedRecord.changeDescription}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  变更属性:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                  {selectedRecord.changedProperties.map(prop => (
                    <Chip key={prop} label={prop} size="small" variant="outlined" />
                  ))}
                </Box>
                
                <Typography variant="subtitle2" gutterBottom>
                  样式配置:
                </Typography>
                <Paper variant="outlined" sx={{ p: 1, bgcolor: 'grey.50' }}>
                  <pre style={{ fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(selectedRecord.styles, null, 2)}
                  </pre>
                </Paper>
              </Paper>
            ) : (
              <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography color="text.secondary">
                  选择一个版本查看详情
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
        
        {filteredRecords.length === 0 && (
          <Box textAlign="center" py={4}>
            <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              暂无历史记录
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>关闭</Button>
      </DialogActions>
      
      {/* 恢复确认对话框 */}
      <Dialog open={restoreDialogOpen} onClose={() => setRestoreDialogOpen(false)}>
        <DialogTitle>确认恢复版本</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            确定要恢复到版本 {recordToRestore?.version} 吗？
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {recordToRestore?.changeDescription}
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            恢复操作将创建一个新的版本记录，当前配置不会丢失。
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)}>取消</Button>
          <Button 
            onClick={() => recordToRestore && restoreVersion(recordToRestore)}
            color="primary"
          >
            确认恢复
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 版本对比对话框 */}
      <Dialog open={compareDialogOpen} onClose={() => setCompareDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>版本对比</DialogTitle>
        <DialogContent>
          {compareRecord && selectedRecord && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle1" gutterBottom>
                  版本 {compareRecord.version}
                </Typography>
                <Paper variant="outlined" sx={{ p: 1, bgcolor: 'grey.50', maxHeight: 300, overflow: 'auto' }}>
                  <pre style={{ fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(compareRecord.styles, null, 2)}
                  </pre>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle1" gutterBottom>
                  版本 {selectedRecord.version}
                </Typography>
                <Paper variant="outlined" sx={{ p: 1, bgcolor: 'grey.50', maxHeight: 300, overflow: 'auto' }}>
                  <pre style={{ fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(selectedRecord.styles, null, 2)}
                  </pre>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" gutterBottom>
                  变更差异
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
                  {renderStyleDiff(selectedRecord.styles, compareRecord.styles)}
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompareDialogOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default StyleHistoryManager;