/**
 * 实时连接状态显示组件
 */
import React from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Collapse,
  Alert,
  Button,
  Stack
} from '@mui/material';
import {
  WifiOff as WifiOffIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useRealtimeConnection, ConnectionStatus } from '../hooks/useRealtimeConnection';

/**
 * 组件属性接口
 */
interface RealtimeStatusProps {
  /** 是否显示详细信息 */
  showDetails?: boolean;
  /** 是否显示在顶部 */
  position?: 'top' | 'bottom' | 'inline';
  /** 自定义样式 */
  sx?: object;
}

/**
 * 获取状态颜色
 */
const getStatusColor = (status: ConnectionStatus) => {
  switch (status) {
    case ConnectionStatus.CONNECTED:
      return 'success';
    case ConnectionStatus.CONNECTING:
    case ConnectionStatus.RECONNECTING:
      return 'warning';
    case ConnectionStatus.ERROR:
    case ConnectionStatus.DISCONNECTED:
      return 'error';
    default:
      return 'default';
  }
};

/**
 * 获取状态图标
 */
const getStatusIcon = (status: ConnectionStatus) => {
  switch (status) {
    case ConnectionStatus.CONNECTED:
      return <CheckCircleIcon />;
    case ConnectionStatus.CONNECTING:
    case ConnectionStatus.RECONNECTING:
      return <ScheduleIcon />;
    case ConnectionStatus.ERROR:
    case ConnectionStatus.DISCONNECTED:
      return <ErrorIcon />;
    default:
      return <WifiOffIcon />;
  }
};

/**
 * 获取状态文本
 */
const getStatusText = (status: ConnectionStatus) => {
  switch (status) {
    case ConnectionStatus.CONNECTED:
      return '已连接';
    case ConnectionStatus.CONNECTING:
      return '连接中';
    case ConnectionStatus.RECONNECTING:
      return '重连中';
    case ConnectionStatus.ERROR:
      return '连接错误';
    case ConnectionStatus.DISCONNECTED:
      return '已断开';
    default:
      return '未知状态';
  }
};

/**
 * 实时连接状态组件
 */
export const RealtimeStatus: React.FC<RealtimeStatusProps> = ({
  showDetails = false,
  position = 'inline',
  sx = {}
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const { connectionInfo, reconnect, clearError } = useRealtimeConnection();
  
  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  const handleReconnect = () => {
    clearError();
    reconnect();
  };
  
  const statusColor = getStatusColor(connectionInfo.status);
  const statusIcon = getStatusIcon(connectionInfo.status);
  const statusText = getStatusText(connectionInfo.status);
  
  const baseStyles = {
    position: position === 'top' ? 'fixed' : position === 'bottom' ? 'fixed' : 'relative',
    top: position === 'top' ? 16 : 'auto',
    bottom: position === 'bottom' ? 16 : 'auto',
    right: position !== 'inline' ? 16 : 'auto',
    zIndex: position !== 'inline' ? 1300 : 'auto',
    ...sx
  };
  
  return (
    <Box sx={baseStyles}>
      <Stack direction="row" spacing={1} alignItems="center">
        {/* 状态指示器 */}
        <Chip
          icon={statusIcon}
          label={statusText}
          color={statusColor}
          variant="outlined"
          size="small"
        />
        
        {/* 重连按钮 */}
        {(connectionInfo.status === ConnectionStatus.ERROR || 
          connectionInfo.status === ConnectionStatus.DISCONNECTED) && (
          <Tooltip title="重新连接">
            <IconButton
              size="small"
              onClick={handleReconnect}
              color="primary"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}
        
        {/* 详情展开按钮 */}
        {showDetails && (
          <Tooltip title={expanded ? "收起详情" : "展开详情"}>
            <IconButton
              size="small"
              onClick={handleToggleExpanded}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Tooltip>
        )}
      </Stack>
      
      {/* 详细信息 */}
      {showDetails && (
        <Collapse in={expanded}>
          <Box sx={{ mt: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              连接详情
            </Typography>
            
            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>状态:</strong> {statusText}
              </Typography>
              
              <Typography variant="body2">
                <strong>重连次数:</strong> {connectionInfo.reconnectAttempts}
              </Typography>
              
              {connectionInfo.lastConnectedAt && (
                <Typography variant="body2">
                  <strong>最后连接:</strong> {connectionInfo.lastConnectedAt.toLocaleString()}
                </Typography>
              )}
              
              {connectionInfo.lastDisconnectedAt && (
                <Typography variant="body2">
                  <strong>最后断开:</strong> {connectionInfo.lastDisconnectedAt.toLocaleString()}
                </Typography>
              )}
              
              {connectionInfo.lastError && (
                <Alert severity="error">
                  <Typography variant="body2">
                    <strong>错误信息:</strong> {connectionInfo.lastError.message}
                  </Typography>
                  <Button
                    size="small"
                    onClick={clearError}
                    sx={{ mt: 1 }}
                  >
                    清除错误
                  </Button>
                </Alert>
              )}
            </Stack>
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

/**
 * 简化的状态指示器组件
 */
export const RealtimeStatusIndicator: React.FC<{ size?: 'small' | 'medium' }> = ({ 
  size = 'small' 
}) => {
  const { connectionInfo } = useRealtimeConnection();
  const statusColor = getStatusColor(connectionInfo.status);
  
  return (
    <Tooltip title={`实时连接: ${getStatusText(connectionInfo.status)}`}>
      <Box
        sx={{
          width: size === 'small' ? 8 : 12,
          height: size === 'small' ? 8 : 12,
          borderRadius: '50%',
          backgroundColor: 
            statusColor === 'success' ? 'success.main' :
            statusColor === 'warning' ? 'warning.main' :
            statusColor === 'error' ? 'error.main' : 'grey.400',
          display: 'inline-block'
        }}
      />
    </Tooltip>
  );
};

export default RealtimeStatus;