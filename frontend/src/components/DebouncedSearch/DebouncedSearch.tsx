/**
 * 防抖搜索组件
 * 支持防抖、历史记录、建议、快捷键等功能
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { performanceMonitor } from '../../utils/performanceMonitor';
import { memoryCache } from '../../utils/cacheManager';

interface SearchSuggestion {
  id: string;
  text: string;
  category?: string;
  icon?: React.ReactNode;
  metadata?: Record<string, any>;
}

interface DebouncedSearchProps {
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  debounceMs?: number;
  minLength?: number;
  maxLength?: number;
  maxSuggestions?: number;
  maxHistory?: number;
  showHistory?: boolean;
  showSuggestions?: boolean;
  showClearButton?: boolean;
  showSearchIcon?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  loading?: boolean;
  value?: string;
  suggestions?: SearchSuggestion[];
  onSearch: (query: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  renderSuggestion?: (suggestion: SearchSuggestion, isHighlighted: boolean) => React.ReactNode;
  renderNoResults?: () => React.ReactNode;
  renderLoading?: () => React.ReactNode;
  getSuggestions?: (query: string) => Promise<SearchSuggestion[]> | SearchSuggestion[];
  validateInput?: (query: string) => boolean | string;
  transformQuery?: (query: string) => string;
  highlightMatch?: boolean;
  caseSensitive?: boolean;
  enableShortcuts?: boolean;
  shortcuts?: Record<string, () => void>;
}

interface DebouncedSearchState {
  query: string;
  isOpen: boolean;
  highlightedIndex: number;
  isLoading: boolean;
  suggestions: SearchSuggestion[];
  history: string[];
  error: string | null;
  lastSearchTime: number;
}

const STORAGE_KEY = 'debounced-search-history';
const CACHE_KEY = 'search-suggestions';

/**
 * 防抖搜索组件
 */
const DebouncedSearch: React.FC<DebouncedSearchProps> = ({
  placeholder = '搜索...',
  className = '',
  style,
  debounceMs = 300,
  minLength = 1,
  maxLength = 100,
  maxSuggestions = 10,
  maxHistory = 10,
  showHistory = true,
  showSuggestions = true,
  showClearButton = true,
  showSearchIcon = true,
  autoFocus = false,
  disabled = false,
  loading = false,
  value,
  suggestions: externalSuggestions = [],
  onSearch,
  onSuggestionSelect,
  onFocus,
  onBlur,
  onKeyDown,
  renderSuggestion,
  renderNoResults,
  renderLoading,
  getSuggestions,
  validateInput,
  transformQuery,
  highlightMatch = true,
  caseSensitive = false,
  enableShortcuts = true,
  shortcuts = {}
}) => {
  const [state, setState] = useState<DebouncedSearchState>({
    query: value || '',
    isOpen: false,
    highlightedIndex: -1,
    isLoading: false,
    suggestions: [],
    history: [],
    error: null,
    lastSearchTime: 0
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 加载搜索历史
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY);
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        setState(prev => ({ ...prev, history }));
      }
    } catch (error) {
      console.warn('Failed to load search history:', error);
    }
  }, []);

  // 保存搜索历史
  const saveHistory = useCallback((newHistory: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }, []);

  // 添加到历史记录
  const addToHistory = useCallback((query: string) => {
    if (!query.trim() || query.length < minLength) return;

    setState(prev => {
      const newHistory = [query, ...prev.history.filter(item => item !== query)]
        .slice(0, maxHistory);
      saveHistory(newHistory);
      return { ...prev, history: newHistory };
    });
  }, [minLength, maxHistory, saveHistory]);

  // 清除历史记录
  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, history: [] }));
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // 获取建议
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < minLength) {
      setState(prev => ({ ...prev, suggestions: [], isLoading: false }));
      return;
    }

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    const startTime = performance.now();

    try {
      let suggestions: SearchSuggestion[] = [];

      // 检查缓存
      const cacheKey = `${CACHE_KEY}-${query.toLowerCase()}`;
      const cached = memoryCache.get(cacheKey);
      
      if (cached) {
        suggestions = cached;
      } else if (getSuggestions) {
        const result = await getSuggestions(query);
        suggestions = Array.isArray(result) ? result : await result;
        
        // 缓存结果
        memoryCache.set(cacheKey, suggestions, 5 * 60 * 1000); // 5分钟缓存
      } else {
        suggestions = externalSuggestions;
      }

      // 过滤和限制建议数量
      const filteredSuggestions = suggestions
        .filter(suggestion => {
          const text = caseSensitive ? suggestion.text : suggestion.text.toLowerCase();
          const searchQuery = caseSensitive ? query : query.toLowerCase();
          return text.includes(searchQuery);
        })
        .slice(0, maxSuggestions);

      const endTime = performance.now();
      performanceMonitor.addMetric(
        `搜索建议获取-${query}`,
        endTime - startTime,
        'custom'
      );

      setState(prev => ({
        ...prev,
        suggestions: filteredSuggestions,
        isLoading: false,
        highlightedIndex: filteredSuggestions.length > 0 ? 0 : -1
      }));
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setState(prev => ({
          ...prev,
          suggestions: [],
          isLoading: false,
          error: error.message
        }));
      }
    }
  }, [minLength, getSuggestions, externalSuggestions, maxSuggestions, caseSensitive]);

  // 防抖搜索
  const debouncedSearch = useCallback((query: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (showSuggestions) {
        fetchSuggestions(query);
      }
    }, debounceMs);
  }, [debounceMs, showSuggestions, fetchSuggestions]);

  // 执行搜索
  const executeSearch = useCallback((query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || trimmedQuery.length < minLength) return;

    // 验证输入
    if (validateInput) {
      const validation = validateInput(trimmedQuery);
      if (validation !== true) {
        setState(prev => ({ ...prev, error: typeof validation === 'string' ? validation : '输入无效' }));
        return;
      }
    }

    // 转换查询
    const finalQuery = transformQuery ? transformQuery(trimmedQuery) : trimmedQuery;
    
    addToHistory(finalQuery);
    setState(prev => ({ 
      ...prev, 
      isOpen: false, 
      lastSearchTime: Date.now(),
      error: null 
    }));
    
    onSearch(finalQuery);
  }, [minLength, validateInput, transformQuery, addToHistory, onSearch]);

  // 处理输入变化
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    
    if (newQuery.length > maxLength) return;

    setState(prev => ({ 
      ...prev, 
      query: newQuery, 
      isOpen: newQuery.length >= minLength,
      error: null 
    }));

    if (newQuery.length >= minLength) {
      debouncedSearch(newQuery);
    } else {
      setState(prev => ({ ...prev, suggestions: [], isLoading: false }));
    }
  }, [maxLength, minLength, debouncedSearch]);

  // 处理键盘事件
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    const { key } = event;
    const { suggestions, highlightedIndex, query, history } = state;
    const allItems = showSuggestions ? suggestions : [];
    const historyItems = showHistory && query.length < minLength ? history : [];
    const totalItems = [...allItems, ...historyItems.map(h => ({ id: h, text: h }))];;

    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        setState(prev => ({
          ...prev,
          highlightedIndex: Math.min(highlightedIndex + 1, totalItems.length - 1),
          isOpen: true
        }));
        break;

      case 'ArrowUp':
        event.preventDefault();
        setState(prev => ({
          ...prev,
          highlightedIndex: Math.max(highlightedIndex - 1, -1)
        }));
        break;

      case 'Enter':
        event.preventDefault();
        if (highlightedIndex >= 0 && totalItems[highlightedIndex]) {
          const selectedItem = totalItems[highlightedIndex];
          handleSuggestionClick(selectedItem);
        } else {
          executeSearch(query);
        }
        break;

      case 'Escape':
        setState(prev => ({ ...prev, isOpen: false, highlightedIndex: -1 }));
        inputRef.current?.blur();
        break;

      case 'Tab':
        if (highlightedIndex >= 0 && totalItems[highlightedIndex]) {
          event.preventDefault();
          const selectedItem = totalItems[highlightedIndex];
          setState(prev => ({ ...prev, query: selectedItem.text }));
        }
        break;

      default:
        // 处理快捷键
        if (enableShortcuts && event.ctrlKey) {
          const shortcutKey = `ctrl+${key.toLowerCase()}`;
          if (shortcuts[shortcutKey]) {
            event.preventDefault();
            shortcuts[shortcutKey]();
          }
        }
        break;
    }

    onKeyDown?.(event);
  }, [state, showSuggestions, showHistory, minLength, executeSearch, enableShortcuts, shortcuts, onKeyDown]);

  // 处理建议点击
  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    setState(prev => ({ 
      ...prev, 
      query: suggestion.text, 
      isOpen: false, 
      highlightedIndex: -1 
    }));
    
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    } else {
      executeSearch(suggestion.text);
    }
  }, [onSuggestionSelect, executeSearch]);

  // 处理焦点
  const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    setState(prev => ({ 
      ...prev, 
      isOpen: prev.query.length >= minLength || (showHistory && prev.history.length > 0)
    }));
    onFocus?.(event);
  }, [minLength, showHistory, onFocus]);

  // 处理失焦
  const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    // 延迟关闭，允许点击建议
    setTimeout(() => {
      setState(prev => ({ ...prev, isOpen: false, highlightedIndex: -1 }));
    }, 200);
    onBlur?.(event);
  }, [onBlur]);

  // 清除输入
  const handleClear = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      query: '', 
      isOpen: false, 
      suggestions: [], 
      highlightedIndex: -1,
      error: null 
    }));
    inputRef.current?.focus();
  }, []);

  // 高亮匹配文本
  const highlightText = useCallback((text: string, query: string) => {
    if (!highlightMatch || !query.trim()) return text;

    const searchQuery = caseSensitive ? query : query.toLowerCase();
    const searchText = caseSensitive ? text : text.toLowerCase();
    const index = searchText.indexOf(searchQuery);

    if (index === -1) return text;

    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);

    return (
      <>
        {before}
        <mark className="bg-yellow-200 text-yellow-900">{match}</mark>
        {after}
      </>
    );
  }, [highlightMatch, caseSensitive]);

  // 渲染建议项
  const renderSuggestionItem = useCallback((suggestion: SearchSuggestion, index: number, isHistory = false) => {
    const isHighlighted = index === state.highlightedIndex;
    
    if (renderSuggestion) {
      return renderSuggestion(suggestion, isHighlighted);
    }

    return (
      <div
        key={suggestion.id}
        className={`px-4 py-2 cursor-pointer flex items-center space-x-2 ${
          isHighlighted ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
        }`}
        onClick={() => handleSuggestionClick(suggestion)}
        onMouseEnter={() => setState(prev => ({ ...prev, highlightedIndex: index }))}
      >
        {suggestion.icon || (
          isHistory ? (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )
        )}
        <div className="flex-1">
          <div className="text-sm">
            {highlightText(suggestion.text, state.query)}
          </div>
          {suggestion.category && (
            <div className="text-xs text-gray-500">{suggestion.category}</div>
          )}
        </div>
      </div>
    );
  }, [state.highlightedIndex, state.query, renderSuggestion, handleSuggestionClick, highlightText]);

  // 计算显示的项目
  const displayItems = useMemo(() => {
    const items: React.ReactNode[] = [];
    let currentIndex = 0;

    // 添加建议
    if (showSuggestions && state.query.length >= minLength) {
      state.suggestions.forEach((suggestion) => {
        items.push(renderSuggestionItem(suggestion, currentIndex));
        currentIndex++;
      });
    }

    // 添加历史记录
    if (showHistory && state.query.length < minLength && state.history.length > 0) {
      if (items.length > 0) {
        items.push(
          <div key="divider" className="border-t border-gray-200 my-1" />
        );
      }
      
      items.push(
        <div key="history-header" className="px-4 py-2 text-xs text-gray-500 font-medium flex items-center justify-between">
          <span>搜索历史</span>
          <button
            onClick={clearHistory}
            className="text-blue-600 hover:text-blue-700"
          >
            清除
          </button>
        </div>
      );

      state.history.forEach((historyItem) => {
        const suggestion: SearchSuggestion = { id: historyItem, text: historyItem };
        items.push(renderSuggestionItem(suggestion, currentIndex, true));
        currentIndex++;
      });
    }

    return items;
  }, [showSuggestions, showHistory, state.query, state.suggestions, state.history, minLength, renderSuggestionItem, clearHistory]);

  // 清理副作用
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 同步外部 value
  useEffect(() => {
    if (value !== undefined && value !== state.query) {
      setState(prev => ({ ...prev, query: value }));
    }
  }, [value, state.query]);

  return (
    <div ref={containerRef} className={`relative ${className}`} style={style}>
      {/* 搜索输入框 */}
      <div className="relative">
        {showSearchIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        )}
        
        <input
          ref={inputRef}
          type="text"
          value={state.query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            showSearchIcon ? 'pl-10' : ''
          } ${
            showClearButton && state.query ? 'pr-10' : ''
          } ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          } ${
            state.error ? 'border-red-500' : ''
          }`}
        />
        
        {showClearButton && state.query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {(loading || state.isLoading) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* 错误信息 */}
      {state.error && (
        <div className="mt-1 text-sm text-red-600">
          {state.error}
        </div>
      )}

      {/* 建议下拉框 */}
      {state.isOpen && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {state.isLoading && renderLoading ? (
            renderLoading()
          ) : state.isLoading ? (
            <div className="px-4 py-3 text-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2"></div>
              搜索中...
            </div>
          ) : displayItems.length > 0 ? (
            displayItems
          ) : renderNoResults ? (
            renderNoResults()
          ) : (
            <div className="px-4 py-3 text-center text-gray-500">
              暂无结果
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DebouncedSearch;
export type { DebouncedSearchProps, SearchSuggestion };