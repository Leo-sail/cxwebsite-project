import React, { Component, type ReactNode } from 'react';
import { Box, Alert, Typography, Button, Collapse } from '@mui/material';
import { DynamicComponentErrorHandler } from '../utils/errorHandler';
import type { ErrorInfo } from '../utils/errorHandler';

/**
 * 错误边界组件属性接口
 */
interface DynamicComponentErrorBoundaryProps {
  children: ReactNode;
  /** 组件名称，用于错误上下文 */
  componentName?: string;
  /** 是否显示详细错误信息 */
  showDetails?: boolean;
  /** 自定义错误UI */
  fallback?: (error: ErrorInfo, retry: () => void) => ReactNode;
  /** 错误回调 */
  onError?: (error: ErrorInfo) => void;
}

/**
 * 错误边界组件状态接口
 */
interface DynamicComponentErrorBoundaryState {
  hasError: boolean;
  error: ErrorInfo | null;
  showDetails: boolean;
}

/**
 * 动态组件错误边界
 * 捕获子组件渲染过程中的错误，提供友好的错误显示和恢复机制
 */
export class DynamicComponentErrorBoundary extends Component<
  DynamicComponentErrorBoundaryProps,
  DynamicComponentErrorBoundaryState
> {
  constructor(props: DynamicComponentErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      showDetails: false
    };
  }

  /**
   * 捕获错误并更新状态
   * @param error 错误对象
   * @param errorInfo React错误信息
   * @returns 更新后的状态
   */
  static getDerivedStateFromError(_error: Error): Partial<DynamicComponentErrorBoundaryState> {
    return {
      hasError: true
    };
  }

  /**
   * 组件捕获错误时调用
   * @param error 错误对象
   * @param errorInfo React错误信息
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorData = DynamicComponentErrorHandler.handleError(error, {
      componentName: this.props.componentName || 'DynamicComponent',
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    });

    this.setState({ error: errorData });
    this.props.onError?.(errorData);
  }

  /**
   * 重试渲染
   */
  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      showDetails: false
    });
  };

  /**
   * 切换详细信息显示
   */
  toggleDetails = () => {
    this.setState(prev => ({
      showDetails: !prev.showDetails
    }));
  };

  /**
   * 渲染错误UI
   */
  renderError() {
    const { fallback, showDetails: showDetailsProp = false } = this.props;
    const { error, showDetails } = this.state;

    if (!error) return null;

    // 使用自定义错误UI
    if (fallback) {
      return fallback(error, this.handleRetry);
    }

    return (
      <Box sx={{ p: 2, border: '1px solid #f44336', borderRadius: 1, bgcolor: '#fff5f5' }}>
        <Alert 
          severity="error" 
          action={
            <Box>
              {(showDetailsProp || process.env.NODE_ENV === 'development') && (
                <Button size="small" onClick={this.toggleDetails} sx={{ mr: 1 }}>
                  {showDetails ? '隐藏详情' : '显示详情'}
                </Button>
              )}
              <Button size="small" onClick={this.handleRetry} variant="contained">
                重新加载
              </Button>
            </Box>
          }
        >
          <Typography variant="body2" component="div">
            <strong>组件渲染失败</strong>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {error.userMessage}
            </Typography>
          </Typography>
        </Alert>

        <Collapse in={showDetails}>
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              错误详情
            </Typography>
            <Typography variant="caption" component="div" sx={{ mb: 1 }}>
              <strong>错误类型:</strong> {error.type}
            </Typography>
            <Typography variant="caption" component="div" sx={{ mb: 1 }}>
              <strong>严重级别:</strong> {error.severity}
            </Typography>
            <Typography variant="caption" component="div" sx={{ mb: 1 }}>
              <strong>时间:</strong> {error.timestamp.toLocaleString()}
            </Typography>
            {error.originalError && (
              <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                <strong>错误消息:</strong> {error.originalError.message}
              </Typography>
            )}
            {error.context && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                  <strong>上下文信息:</strong>
                </Typography>
                <Box 
                  component="pre" 
                  sx={{ 
                    fontSize: '0.75rem', 
                    bgcolor: '#fff', 
                    p: 1, 
                    borderRadius: 1,
                    overflow: 'auto',
                    maxHeight: '200px'
                  }}
                >
                  {JSON.stringify(error.context, null, 2)}
                </Box>
              </Box>
            )}
          </Box>
        </Collapse>
      </Box>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderError();
    }

    return this.props.children;
  }
}

/**
 * 高阶组件：为组件添加错误边界
 * @param WrappedComponent 要包装的组件
 * @param options 错误边界选项
 * @returns 包装后的组件
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    componentName?: string;
    showDetails?: boolean;
    fallback?: (error: ErrorInfo, retry: () => void) => ReactNode;
    onError?: (error: ErrorInfo) => void;
  } = {}
) {
  const WithErrorBoundaryComponent = (props: P) => (
    <DynamicComponentErrorBoundary {...options}>
      <WrappedComponent {...props} />
    </DynamicComponentErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = 
    `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundaryComponent;
}

export default DynamicComponentErrorBoundary;