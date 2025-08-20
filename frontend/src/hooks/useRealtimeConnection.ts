/**
 * 实时连接状态监控和自动重连Hook
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * 连接状态枚举
 */
export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
  RECONNECTING = 'RECONNECTING'
}

/**
 * 连接配置接口
 */
export interface ConnectionConfig {
  /** 自动重连 */
  autoReconnect?: boolean;
  /** 重连间隔（毫秒） */
  reconnectInterval?: number;
  /** 最大重连次数 */
  maxReconnectAttempts?: number;
  /** 连接超时时间（毫秒） */
  connectionTimeout?: number;
  /** 心跳间隔（毫秒） */
  heartbeatInterval?: number;
}

/**
 * 连接状态信息
 */
export interface ConnectionInfo {
  status: ConnectionStatus;
  isConnected: boolean;
  reconnectAttempts: number;
  lastError: Error | null;
  lastConnectedAt: Date | null;
  lastDisconnectedAt: Date | null;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<ConnectionConfig> = {
  autoReconnect: true,
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  connectionTimeout: 10000,
  heartbeatInterval: 30000
};

/**
 * 实时连接监控Hook
 */
export const useRealtimeConnection = (config: ConnectionConfig = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    status: ConnectionStatus.DISCONNECTED,
    isConnected: false,
    reconnectAttempts: 0,
    lastError: null,
    lastConnectedAt: null,
    lastDisconnectedAt: null
  });
  
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  
  /**
   * 更新连接状态
   */
  const updateConnectionStatus = useCallback((status: ConnectionStatus, error?: Error) => {
    setConnectionInfo(prev => ({
      ...prev,
      status,
      isConnected: status === ConnectionStatus.CONNECTED,
      lastError: error || prev.lastError,
      lastConnectedAt: status === ConnectionStatus.CONNECTED ? new Date() : prev.lastConnectedAt,
      lastDisconnectedAt: status === ConnectionStatus.DISCONNECTED ? new Date() : prev.lastDisconnectedAt
    }));
  }, []);
  
  /**
   * 清理定时器
   */
  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
  }, []);
  
  /**
   * 启动心跳检测
   */
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    heartbeatIntervalRef.current = setInterval(() => {
      if (channelRef.current && channelRef.current.state === 'joined') {
        // 发送心跳
        channelRef.current.send({
          type: 'broadcast',
          event: 'heartbeat',
          payload: { timestamp: Date.now() }
        });
      } else {
        // 连接已断开，尝试重连
        if (finalConfig.autoReconnect && connectionInfo.reconnectAttempts < finalConfig.maxReconnectAttempts) {
          reconnect();
        }
      }
    }, finalConfig.heartbeatInterval);
  }, [finalConfig.heartbeatInterval, finalConfig.autoReconnect, finalConfig.maxReconnectAttempts, connectionInfo.reconnectAttempts]);
  
  /**
   * 连接到Supabase实时服务
   */
  const connect = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }
    
    updateConnectionStatus(ConnectionStatus.CONNECTING);
    
    // 设置连接超时
    connectionTimeoutRef.current = setTimeout(() => {
      updateConnectionStatus(ConnectionStatus.ERROR, new Error('连接超时'));
      if (finalConfig.autoReconnect && connectionInfo.reconnectAttempts < finalConfig.maxReconnectAttempts) {
        reconnect();
      }
    }, finalConfig.connectionTimeout);
    
    // 创建监控频道
    channelRef.current = supabase
      .channel('connection-monitor')
      .on('system', {}, (payload) => {
        console.log('🔧 系统事件:', payload);
        
        if (payload.status === 'SUBSCRIBED') {
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
          }
          updateConnectionStatus(ConnectionStatus.CONNECTED);
          setConnectionInfo(prev => ({ ...prev, reconnectAttempts: 0 }));
          startHeartbeat();
        } else if (payload.status === 'CHANNEL_ERROR') {
          updateConnectionStatus(ConnectionStatus.ERROR, new Error(payload.message || '频道错误'));
        } else if (payload.status === 'TIMED_OUT') {
          updateConnectionStatus(ConnectionStatus.ERROR, new Error('连接超时'));
          if (finalConfig.autoReconnect && connectionInfo.reconnectAttempts < finalConfig.maxReconnectAttempts) {
            reconnect();
          }
        } else if (payload.status === 'CLOSED') {
          updateConnectionStatus(ConnectionStatus.DISCONNECTED);
          if (finalConfig.autoReconnect && connectionInfo.reconnectAttempts < finalConfig.maxReconnectAttempts) {
            reconnect();
          }
        }
      })
      .subscribe((status, err) => {
        console.log('📊 订阅状态:', status, err);
        
        if (err) {
          updateConnectionStatus(ConnectionStatus.ERROR, err);
          if (finalConfig.autoReconnect && connectionInfo.reconnectAttempts < finalConfig.maxReconnectAttempts) {
            reconnect();
          }
        }
      });
  }, [updateConnectionStatus, finalConfig, connectionInfo.reconnectAttempts, startHeartbeat]);
  
  /**
   * 重新连接
   */
  const reconnect = useCallback(() => {
    if (connectionInfo.reconnectAttempts >= finalConfig.maxReconnectAttempts) {
      updateConnectionStatus(ConnectionStatus.ERROR, new Error('超过最大重连次数'));
      return;
    }
    
    updateConnectionStatus(ConnectionStatus.RECONNECTING);
    setConnectionInfo(prev => ({ ...prev, reconnectAttempts: prev.reconnectAttempts + 1 }));
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, finalConfig.reconnectInterval);
  }, [connect, connectionInfo.reconnectAttempts, finalConfig.maxReconnectAttempts, finalConfig.reconnectInterval, updateConnectionStatus]);
  
  /**
   * 断开连接
   */
  const disconnect = useCallback(() => {
    clearTimers();
    
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    
    updateConnectionStatus(ConnectionStatus.DISCONNECTED);
    setConnectionInfo(prev => ({ ...prev, reconnectAttempts: 0 }));
  }, [clearTimers, updateConnectionStatus]);
  
  /**
   * 手动重连
   */
  const manualReconnect = useCallback(() => {
    setConnectionInfo(prev => ({ ...prev, reconnectAttempts: 0 }));
    connect();
  }, [connect]);
  
  /**
   * 重置错误状态
   */
  const clearError = useCallback(() => {
    setConnectionInfo(prev => ({ ...prev, lastError: null }));
  }, []);
  
  // 组件挂载时自动连接
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, []);
  
  // 监听浏览器在线状态
  useEffect(() => {
    const handleOnline = () => {
      if (connectionInfo.status === ConnectionStatus.DISCONNECTED || connectionInfo.status === ConnectionStatus.ERROR) {
        manualReconnect();
      }
    };
    
    const handleOffline = () => {
      updateConnectionStatus(ConnectionStatus.DISCONNECTED, new Error('网络连接断开'));
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [connectionInfo.status, manualReconnect, updateConnectionStatus]);
  
  return {
    connectionInfo,
    connect,
    disconnect,
    reconnect: manualReconnect,
    clearError,
    isConnected: connectionInfo.isConnected,
    status: connectionInfo.status
  };
};