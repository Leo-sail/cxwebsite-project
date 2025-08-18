/**
 * 全局键盘快捷键管理Hook
 * 提供统一的快捷键注册、管理和处理功能
 */
import { useEffect, useCallback, useRef } from 'react';

/**
 * 快捷键配置接口
 */
export interface ShortcutConfig {
  /** 快捷键组合，如 'ctrl+s', 'cmd+z' */
  key: string;
  /** 快捷键描述 */
  description: string;
  /** 快捷键处理函数 */
  handler: (event: KeyboardEvent) => void;
  /** 是否阻止默认行为 */
  preventDefault?: boolean;
  /** 是否阻止事件冒泡 */
  stopPropagation?: boolean;
  /** 是否启用 */
  enabled?: boolean;
  /** 作用域，用于区分不同组件的快捷键 */
  scope?: string;
}

/**
 * 快捷键管理器类
 */
class ShortcutManager {
  private shortcuts: Map<string, ShortcutConfig[]> = new Map();
  private isListening = false;

  /**
   * 注册快捷键
   */
  register(config: ShortcutConfig): () => void {
    const normalizedKey = this.normalizeKey(config.key);
    const existing = this.shortcuts.get(normalizedKey) || [];
    existing.push(config);
    this.shortcuts.set(normalizedKey, existing);

    if (!this.isListening) {
      this.startListening();
    }

    // 返回取消注册函数
    return () => {
      this.unregister(normalizedKey, config);
    };
  }

  /**
   * 取消注册快捷键
   */
  private unregister(key: string, config: ShortcutConfig): void {
    const existing = this.shortcuts.get(key) || [];
    const filtered = existing.filter(c => c !== config);
    
    if (filtered.length === 0) {
      this.shortcuts.delete(key);
    } else {
      this.shortcuts.set(key, filtered);
    }

    if (this.shortcuts.size === 0) {
      this.stopListening();
    }
  }

  /**
   * 开始监听键盘事件
   */
  private startListening(): void {
    if (this.isListening) return;
    
    document.addEventListener('keydown', this.handleKeyDown);
    this.isListening = true;
  }

  /**
   * 停止监听键盘事件
   */
  private stopListening(): void {
    if (!this.isListening) return;
    
    document.removeEventListener('keydown', this.handleKeyDown);
    this.isListening = false;
  }

  /**
   * 处理键盘事件
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    const key = this.getEventKey(event);
    const configs = this.shortcuts.get(key);
    
    if (!configs) return;

    // 按作用域和启用状态过滤
    const enabledConfigs = configs.filter(config => 
      config.enabled !== false
    );

    if (enabledConfigs.length === 0) return;

    // 执行第一个匹配的快捷键
    const config = enabledConfigs[0];
    
    if (config.preventDefault !== false) {
      event.preventDefault();
    }
    
    if (config.stopPropagation) {
      event.stopPropagation();
    }

    try {
      config.handler(event);
    } catch (error) {
      console.error('快捷键处理错误:', error);
    }
  };

  /**
   * 标准化快捷键字符串
   */
  private normalizeKey(key: string): string {
    return key.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/cmd/g, 'meta')
      .replace(/command/g, 'meta')
      .split('+')
      .sort()
      .join('+');
  }

  /**
   * 从事件获取快捷键字符串
   */
  private getEventKey(event: KeyboardEvent): string {
    const parts: string[] = [];
    
    if (event.ctrlKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    if (event.metaKey) parts.push('meta');
    
    const key = event.key.toLowerCase();
    if (key !== 'control' && key !== 'alt' && key !== 'shift' && key !== 'meta') {
      parts.push(key);
    }
    
    return parts.sort().join('+');
  }

  /**
   * 获取所有已注册的快捷键
   */
  getShortcuts(): ShortcutConfig[] {
    const allShortcuts: ShortcutConfig[] = [];
    this.shortcuts.forEach(configs => {
      allShortcuts.push(...configs);
    });
    return allShortcuts;
  }

  /**
   * 清除所有快捷键
   */
  clear(): void {
    this.shortcuts.clear();
    this.stopListening();
  }
}

// 全局快捷键管理器实例
const globalShortcutManager = new ShortcutManager();

/**
 * 键盘快捷键Hook
 */
export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
  const unregisterFunctions = useRef<(() => void)[]>([]);

  // 注册快捷键
  useEffect(() => {
    // 清除之前的注册
    unregisterFunctions.current.forEach(fn => fn());
    unregisterFunctions.current = [];

    // 注册新的快捷键
    shortcuts.forEach(shortcut => {
      const unregister = globalShortcutManager.register(shortcut);
      unregisterFunctions.current.push(unregister);
    });

    // 清理函数
    return () => {
      unregisterFunctions.current.forEach(fn => fn());
      unregisterFunctions.current = [];
    };
  }, [shortcuts]);

  // 获取所有快捷键
  const getAllShortcuts = useCallback(() => {
    return globalShortcutManager.getShortcuts();
  }, []);

  return {
    getAllShortcuts
  };
};

/**
 * 单个快捷键Hook
 */
export const useKeyboardShortcut = (
  key: string,
  handler: () => void,
  options: Omit<ShortcutConfig, 'key' | 'handler'> = { description: '' }
) => {
  const shortcut: ShortcutConfig = {
    key,
    handler,
    description: options.description || '',
    preventDefault: options.preventDefault,
    stopPropagation: options.stopPropagation,
    enabled: options.enabled,
    scope: options.scope
  };

  useKeyboardShortcuts([shortcut]);
};

/**
 * 常用快捷键常量
 */
export const COMMON_SHORTCUTS = {
  SAVE: 'ctrl+s',
  UNDO: 'ctrl+z',
  REDO: 'ctrl+y',
  COPY: 'ctrl+c',
  PASTE: 'ctrl+v',
  CUT: 'ctrl+x',
  SELECT_ALL: 'ctrl+a',
  DELETE: 'delete',
  ESCAPE: 'escape',
  ENTER: 'enter',
  TAB: 'tab',
  SHIFT_TAB: 'shift+tab'
} as const;

export default useKeyboardShortcuts;