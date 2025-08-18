import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  /** 子组件 */
  children: ReactNode;
  /** 错误回调 */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** 自定义错误UI */
  fallback?: (error: Error) => ReactNode;
  /** 自定义类名 */
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * 错误边界组件
 * 捕获子组件中的JavaScript错误并显示备用UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // 更新状态以显示错误UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    this.setState({
      error,
      errorInfo
    });

    // 调用错误回调
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 在开发环境中打印错误
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error info:', errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // 如果有自定义错误UI，使用它
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }

      // 默认错误UI
      return (
        <div className={`error-boundary ${this.props.className || ''}`}>
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">出现了一些问题</h2>
            <p className="error-message">
              {this.state.error.message || '未知错误'}
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="error-details">
                <summary>错误详情 (开发模式)</summary>
                <pre className="error-stack">
                  {this.state.error.stack}
                </pre>
                <pre className="error-component-stack">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <div className="error-actions">
              <button 
                onClick={this.handleRetry}
                className="retry-button"
              >
                重试
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="reload-button"
              >
                刷新页面
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 没有错误时正常渲染子组件
    return this.props.children;
  }
}

// 注入样式
const styles = `
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 2rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.error-content {
  text-align: center;
  max-width: 500px;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-title {
  color: #dc2626;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #7f1d1d;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.error-details {
  text-align: left;
  margin: 1rem 0;
  padding: 1rem;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 0.375rem;
}

.error-details summary {
  cursor: pointer;
  font-weight: 500;
  color: #991b1b;
  margin-bottom: 0.5rem;
}

.error-details summary:hover {
  color: #7f1d1d;
}

.error-stack,
.error-component-stack {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.25rem;
  padding: 0.75rem;
  margin: 0.5rem 0;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  line-height: 1.4;
  overflow-x: auto;
  white-space: pre-wrap;
  color: #7f1d1d;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}

.retry-button,
.reload-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button {
  background: #dc2626;
  color: white;
}

.retry-button:hover {
  background: #b91c1c;
}

.reload-button {
  background: #6b7280;
  color: white;
}

.reload-button:hover {
  background: #4b5563;
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .error-boundary {
    background: #1f2937;
    border-color: #374151;
  }
  
  .error-title {
    color: #f87171;
  }
  
  .error-message {
    color: #d1d5db;
  }
  
  .error-details {
    background: #374151;
    border-color: #4b5563;
  }
  
  .error-details summary {
    color: #f87171;
  }
  
  .error-stack,
  .error-component-stack {
    background: #1f2937;
    border-color: #374151;
    color: #d1d5db;
  }
}

@media (max-width: 640px) {
  .error-boundary {
    padding: 1rem;
  }
  
  .error-actions {
    flex-direction: column;
  }
  
  .retry-button,
  .reload-button {
    width: 100%;
  }
}
`;

// 注入样式到页面
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default ErrorBoundary;