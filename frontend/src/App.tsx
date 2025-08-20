/**
 * 主应用组件
 */
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { router } from './router';
import { queryClient } from './services/queryClient';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './contexts/ThemeContext';
import { GlobalLoading } from './components/GlobalLoading';
import { CSPProvider, getDevelopmentCSPConfig, getProductionCSPConfig } from './components/CSPProvider';
import './App.css';

/**
 * 主应用组件
 */
function App() {
  // 根据环境选择CSP配置
  const cspConfig = import.meta.env.PROD 
    ? getProductionCSPConfig() 
    : getDevelopmentCSPConfig();

  return (
    <CSPProvider config={cspConfig}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <RouterProvider router={router} />
            <GlobalLoading />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </CSPProvider>
  );
}

export default App;
