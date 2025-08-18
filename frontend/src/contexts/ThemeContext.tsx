/**
 * 简化的主题上下文
 * 提供基本的主题切换功能
 */
import { createContext, useState, type ReactNode } from 'react';
import { useTheme } from '../hooks/useTheme';

/**
 * 主题类型
 */
type Theme = 'light' | 'dark';

/**
 * 主题上下文接口
 */
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

/**
 * 主题上下文
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * 主题提供者属性接口
 */
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

/**
 * 主题提供者组件
 */
export function ThemeProvider({ children, defaultTheme = 'light' }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook 函数已移动到 ../hooks/useThemeHooks.ts

/**
 * 导出主题上下文
 */
export { ThemeContext };
export type { Theme, ThemeContextType, ThemeProviderProps };

/**
 * 主题切换组件
 */
export function ThemeToggle() {
  const { currentTheme, switchTheme } = useTheme();
  const isDark = currentTheme?.colors?.background === '#000000';

  const handleToggle = () => {
    // 简单的明暗主题切换逻辑
    const targetTheme = isDark ? 'light' : 'dark';
    switchTheme(targetTheme);
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="切换主题"
    >
      <div style={{ backgroundColor: currentTheme?.colors?.background || '#ffffff' }}>
        {isDark ? '🌙' : '☀️'}
      </div>
    </button>
  );
}

/**
 * 主题选择器组件
 */
export function ThemeSelector() {
  const { availableThemes, switchTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="theme-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        主题:
      </label>
      <select
        id="theme-select"
        onChange={(e) => switchTheme(e.target.value)}
        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <option value="">选择主题</option>
        {availableThemes.map((theme, index) => (
          <option key={index} value={(theme as any).colors?.primary || 'default'}>
            主题 {index + 1}
          </option>
        ))}
      </select>
    </div>
  );
}