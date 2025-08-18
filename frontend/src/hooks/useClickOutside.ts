/**
 * 点击外部区域Hook
 */
import { useEffect, type RefObject } from 'react';

/**
 * 点击外部区域Hook
 * @param ref 元素引用
 * @param handler 点击外部时的回调函数
 */
function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(() => {
    /**
     * 处理点击事件
     */
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // 如果ref不存在或者点击的是ref内部元素，则不执行回调
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      
      handler(event);
    };

    // 添加事件监听器
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    // 清理事件监听器
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [ref, handler]);
}

export default useClickOutside;