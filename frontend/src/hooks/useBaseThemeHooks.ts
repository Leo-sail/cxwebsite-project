import { useContext } from 'react';
import { BaseThemeContext } from '../contexts/BaseThemeContext';
import type { BaseThemeContextType } from '../contexts/BaseThemeContext';

/**
 * 使用基础主题上下文的Hook
 */
export function useBaseTheme(): BaseThemeContextType {
  const context = useContext(BaseThemeContext);
  if (context === undefined) {
    throw new Error('useBaseTheme must be used within a BaseThemeProvider');
  }
  return context;
}

// 为了向后兼容，导出useThemeContext别名
export const useThemeContext = useBaseTheme;