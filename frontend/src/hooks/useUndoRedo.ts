/**
 * 撤销重做功能Hook
 * 提供通用的撤销重做状态管理
 */
import { useState, useCallback, useRef } from 'react';

/**
 * 历史记录项接口
 */
export interface HistoryItem<T> {
  /** 状态数据 */
  state: T;
  /** 操作描述 */
  description?: string;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 撤销重做配置
 */
export interface UndoRedoConfig {
  /** 最大历史记录数量 */
  maxHistorySize?: number;
  /** 是否启用自动保存 */
  autoSave?: boolean;
  /** 自动保存间隔（毫秒） */
  autoSaveInterval?: number;
}

/**
 * 撤销重做Hook
 */
export const useUndoRedo = <T>(
  initialState: T,
  config: UndoRedoConfig = {}
) => {
  const {
    maxHistorySize = 50,
    autoSave = false,
    autoSaveInterval = 1000
  } = config;

  // 历史记录栈
  const [history, setHistory] = useState<HistoryItem<T>[]>([
    {
      state: initialState,
      description: '初始状态',
      timestamp: Date.now()
    }
  ]);

  // 当前位置索引
  const [currentIndex, setCurrentIndex] = useState(0);

  // 自动保存定时器
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const lastSavedState = useRef<T>(initialState);

  // 当前状态
  const currentState = history[currentIndex]?.state || initialState;

  // 是否可以撤销
  const canUndo = currentIndex > 0;

  // 是否可以重做
  const canRedo = currentIndex < history.length - 1;

  /**
   * 添加新的历史记录
   */
  const pushState = useCallback((newState: T, description?: string) => {
    setHistory(prevHistory => {
      // 如果当前不在最新位置，删除后面的历史记录
      const newHistory = prevHistory.slice(0, currentIndex + 1);
      
      // 添加新状态
      newHistory.push({
        state: newState,
        description: description || `操作 ${newHistory.length}`,
        timestamp: Date.now()
      });

      // 限制历史记录数量
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
        setCurrentIndex(prev => Math.max(0, prev - 1));
      } else {
        setCurrentIndex(newHistory.length - 1);
      }

      return newHistory;
    });
  }, [currentIndex, maxHistorySize]);

  /**
   * 撤销操作
   */
  const undo = useCallback(() => {
    if (canUndo) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [canUndo]);

  /**
   * 重做操作
   */
  const redo = useCallback(() => {
    if (canRedo) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [canRedo]);

  /**
   * 跳转到指定历史记录
   */
  const goToHistory = useCallback((index: number) => {
    if (index >= 0 && index < history.length) {
      setCurrentIndex(index);
    }
  }, [history.length]);

  /**
   * 清除历史记录
   */
  const clearHistory = useCallback(() => {
    setHistory([{
      state: currentState,
      description: '重置状态',
      timestamp: Date.now()
    }]);
    setCurrentIndex(0);
  }, [currentState]);

  /**
   * 获取历史记录列表
   */
  const getHistory = useCallback(() => {
    return history.map((item, index) => ({
      ...item,
      isCurrent: index === currentIndex
    }));
  }, [history, currentIndex]);

  /**
   * 自动保存功能
   */
  const enableAutoSave = useCallback((newState: T) => {
    if (!autoSave) return;

    // 清除之前的定时器
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    // 设置新的定时器
    autoSaveTimer.current = setTimeout(() => {
      // 检查状态是否有变化
      if (JSON.stringify(newState) !== JSON.stringify(lastSavedState.current)) {
        pushState(newState, '自动保存');
        lastSavedState.current = newState;
      }
    }, autoSaveInterval);
  }, [autoSave, autoSaveInterval, pushState]);

  /**
   * 批量操作
   */
  const batch = useCallback((operations: (() => T)[], description?: string) => {
    let result = currentState;
    
    operations.forEach(operation => {
      result = operation();
    });
    
    pushState(result, description || '批量操作');
    return result;
  }, [currentState, pushState]);

  /**
   * 获取统计信息
   */
  const getStats = useCallback(() => {
    return {
      totalOperations: history.length,
      currentPosition: currentIndex + 1,
      canUndo,
      canRedo,
      memoryUsage: JSON.stringify(history).length
    };
  }, [history, currentIndex, canUndo, canRedo]);

  return {
    // 状态
    currentState,
    canUndo,
    canRedo,
    
    // 操作方法
    pushState,
    undo,
    redo,
    goToHistory,
    clearHistory,
    batch,
    
    // 工具方法
    getHistory,
    getStats,
    enableAutoSave
  };
};

/**
 * 内容编辑撤销重做Hook
 * 专门用于内容编辑场景
 */
export const useContentUndoRedo = <T extends { id: string; updated_at?: string }>(
  initialContent: T
) => {
  const undoRedo = useUndoRedo(initialContent, {
    maxHistorySize: 100,
    autoSave: true,
    autoSaveInterval: 2000
  });

  /**
   * 保存内容变更
   */
  const saveContentChange = useCallback((newContent: T, description?: string) => {
    const contentWithTimestamp = {
      ...newContent,
      updated_at: new Date().toISOString()
    };
    
    undoRedo.pushState(contentWithTimestamp, description);
  }, [undoRedo]);

  /**
   * 撤销内容变更
   */
  const undoContentChange = useCallback(() => {
    undoRedo.undo();
    return undoRedo.currentState;
  }, [undoRedo]);

  /**
   * 重做内容变更
   */
  const redoContentChange = useCallback(() => {
    undoRedo.redo();
    return undoRedo.currentState;
  }, [undoRedo]);

  return {
    ...undoRedo,
    saveContentChange,
    undoContentChange,
    redoContentChange
  };
};

export default useUndoRedo;