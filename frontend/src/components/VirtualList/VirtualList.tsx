/**
 * 虚拟化列表组件
 * 用于优化长列表的渲染性能，只渲染可见区域的项目
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { performanceMonitor } from '../../utils/performanceMonitor';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number | ((index: number, item: T) => number);
  containerHeight: number;
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  overscan?: number; // 额外渲染的项目数量
  className?: string;
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
  onItemsRendered?: (startIndex: number, endIndex: number, visibleStartIndex: number, visibleEndIndex: number) => void;
  scrollToIndex?: number;
  scrollToAlignment?: 'auto' | 'start' | 'center' | 'end';
  estimatedItemSize?: number;
  threshold?: number; // 滚动阈值
  loadingComponent?: React.ComponentType;
  emptyComponent?: React.ComponentType;
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
}

interface VirtualListState {
  scrollTop: number;
  scrollLeft: number;
  isScrolling: boolean;
  scrollDirection: 'forward' | 'backward';
}

interface ItemMetadata {
  offset: number;
  size: number;
}

/**
 * 虚拟化列表组件
 */
function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll,
  onItemsRendered,
  scrollToIndex,
  scrollToAlignment = 'auto',

  loadingComponent: LoadingComponent,
  emptyComponent: EmptyComponent,
  errorComponent: ErrorComponent
}: VirtualListProps<T>) {
  const [state, setState] = useState<VirtualListState>({
    scrollTop: 0,
    scrollLeft: 0,
    isScrolling: false,
    scrollDirection: 'forward'
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const isScrollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTop = useRef(0);
  const itemMetadataMap = useRef<Map<number, ItemMetadata>>(new Map());
  const measurementCache = useRef<Map<number, number>>(new Map());
  const [error, setError] = useState<Error | null>(null);

  // 获取项目高度
  const getItemHeight = useCallback((index: number): number => {
    if (typeof itemHeight === 'function') {
      const cached = measurementCache.current.get(index);
      if (cached !== undefined) {
        return cached;
      }
      const height = itemHeight(index, items[index]);
      measurementCache.current.set(index, height);
      return height;
    }
    return itemHeight;
  }, [itemHeight, items]);

  // 获取项目元数据
  const getItemMetadata = useCallback((index: number): ItemMetadata => {
    const cached = itemMetadataMap.current.get(index);
    if (cached) {
      return cached;
    }

    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += getItemHeight(i);
    }

    const size = getItemHeight(index);
    const metadata = { offset, size };
    itemMetadataMap.current.set(index, metadata);
    return metadata;
  }, [getItemHeight]);

  // 获取总高度
  const getTotalHeight = useCallback((): number => {
    if (items.length === 0) return 0;
    
    const lastItemMetadata = getItemMetadata(items.length - 1);
    return lastItemMetadata.offset + lastItemMetadata.size;
  }, [items.length, getItemMetadata]);

  // 查找项目索引
  const findNearestItem = useCallback((offset: number): number => {
    if (items.length === 0) return 0;

    let low = 0;
    let high = items.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const metadata = getItemMetadata(mid);

      if (metadata.offset === offset) {
        return mid;
      } else if (metadata.offset < offset) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return Math.max(0, Math.min(items.length - 1, low));
  }, [items.length, getItemMetadata]);

  // 计算可见范围
  const getVisibleRange = useCallback(() => {
    if (items.length === 0) {
      return {
        startIndex: 0,
        endIndex: 0,
        visibleStartIndex: 0,
        visibleEndIndex: 0
      };
    }

    const visibleStartIndex = findNearestItem(state.scrollTop);
    const visibleEndIndex = findNearestItem(state.scrollTop + containerHeight);

    const startIndex = Math.max(0, visibleStartIndex - overscan);
    const endIndex = Math.min(items.length - 1, visibleEndIndex + overscan);

    return {
      startIndex,
      endIndex,
      visibleStartIndex,
      visibleEndIndex
    };
  }, [items.length, state.scrollTop, containerHeight, findNearestItem, overscan]);

  // 渲染项目
  const renderItems = useMemo(() => {
    const startTime = performance.now();
    
    try {
      const { startIndex, endIndex } = getVisibleRange();
      const renderedItems: React.ReactNode[] = [];

      for (let index = startIndex; index <= endIndex; index++) {
        const item = items[index];
        if (!item) continue;

        const metadata = getItemMetadata(index);
        const style: React.CSSProperties = {
          position: 'absolute',
          top: metadata.offset,
          left: 0,
          width: '100%',
          height: metadata.size,
        };

        renderedItems.push(
          <div key={index} style={style}>
            {renderItem(item, index, style)}
          </div>
        );
      }

      const endTime = performance.now();
      performanceMonitor.addMetric(
        `虚拟列表渲染-${endIndex - startIndex + 1}项`,
        endTime - startTime,
        'custom'
      );

      return renderedItems;
    } catch (err) {
      setError(err as Error);
      return [];
    }
  }, [items, getVisibleRange, getItemMetadata, renderItem]);

  // 滚动处理
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    const scrollLeft = event.currentTarget.scrollLeft;
    const direction = scrollTop > lastScrollTop.current ? 'forward' : 'backward';

    setState(prevState => ({
      ...prevState,
      scrollTop,
      scrollLeft,
      isScrolling: true,
      scrollDirection: direction
    }));

    lastScrollTop.current = scrollTop;
    onScroll?.(scrollTop, scrollLeft);

    // 清除之前的超时
    if (isScrollingTimeoutRef.current) {
      clearTimeout(isScrollingTimeoutRef.current);
    }

    // 设置滚动结束超时
    isScrollingTimeoutRef.current = setTimeout(() => {
      setState(prevState => ({
        ...prevState,
        isScrolling: false
      }));
    }, 150);
  }, [onScroll]);

  // 滚动到指定索引
  const scrollToItem = useCallback((index: number, alignment: 'auto' | 'start' | 'center' | 'end' = 'auto') => {
    if (!scrollElementRef.current || index < 0 || index >= items.length) {
      return;
    }

    const metadata = getItemMetadata(index);
    let scrollTop = metadata.offset;

    switch (alignment) {
      case 'start':
        scrollTop = metadata.offset;
        break;
      case 'center':
        scrollTop = metadata.offset - (containerHeight - metadata.size) / 2;
        break;
      case 'end':
        scrollTop = metadata.offset - containerHeight + metadata.size;
        break;
      case 'auto':
      default:
        const currentScrollTop = state.scrollTop;
        const itemTop = metadata.offset;
        const itemBottom = metadata.offset + metadata.size;
        const viewportTop = currentScrollTop;
        const viewportBottom = currentScrollTop + containerHeight;

        if (itemTop < viewportTop) {
          scrollTop = itemTop;
        } else if (itemBottom > viewportBottom) {
          scrollTop = itemBottom - containerHeight;
        } else {
          return; // 项目已经可见，不需要滚动
        }
        break;
    }

    scrollElementRef.current.scrollTop = Math.max(0, Math.min(scrollTop, getTotalHeight() - containerHeight));
  }, [items.length, getItemMetadata, containerHeight, state.scrollTop, getTotalHeight]);

  // 处理scrollToIndex属性变化
  useEffect(() => {
    if (scrollToIndex !== undefined && scrollToIndex >= 0 && scrollToIndex < items.length) {
      scrollToItem(scrollToIndex, scrollToAlignment);
    }
  }, [scrollToIndex, scrollToAlignment, scrollToItem, items.length]);

  // 通知可见项目变化
  useEffect(() => {
    const { startIndex, endIndex, visibleStartIndex, visibleEndIndex } = getVisibleRange();
    onItemsRendered?.(startIndex, endIndex, visibleStartIndex, visibleEndIndex);
  }, [getVisibleRange, onItemsRendered]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (isScrollingTimeoutRef.current) {
        clearTimeout(isScrollingTimeoutRef.current);
      }
    };
  }, []);

  // 重置缓存
  const resetCache = useCallback(() => {
    itemMetadataMap.current.clear();
    measurementCache.current.clear();
  }, []);

  // 当items变化时重置缓存
  useEffect(() => {
    resetCache();
  }, [items, resetCache]);

  // 错误处理
  const handleRetry = useCallback(() => {
    setError(null);
    resetCache();
  }, [resetCache]);

  // 渲染错误状态
  if (error && ErrorComponent) {
    return <ErrorComponent error={error} retry={handleRetry} />;
  }

  // 渲染空状态
  if (items.length === 0 && EmptyComponent) {
    return <EmptyComponent />;
  }

  // 渲染加载状态
  if (items.length === 0 && LoadingComponent) {
    return <LoadingComponent />;
  }

  const totalHeight = getTotalHeight();

  return (
    <div
      ref={containerRef}
      className={`virtual-list-container ${className}`}
      style={{ height: containerHeight, overflow: 'hidden', position: 'relative' }}
    >
      <div
        ref={scrollElementRef}
        className="virtual-list-scroll"
        style={{
          height: '100%',
          overflow: 'auto',
          willChange: state.isScrolling ? 'scroll-position' : 'auto'
        }}
        onScroll={handleScroll}
      >
        <div
          className="virtual-list-spacer"
          style={{
            height: totalHeight,
            position: 'relative'
          }}
        >
          {renderItems}
        </div>
      </div>
    </div>
  );
}

/**
 * 默认空组件
 */
const DefaultEmptyComponent: React.FC = () => (
  <div className="flex items-center justify-center h-full text-gray-500">
    <div className="text-center">
      <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
      </svg>
      <p>暂无数据</p>
    </div>
  </div>
);

/**
 * 默认加载组件
 */
const DefaultLoadingComponent: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">加载中...</span>
  </div>
);

/**
 * 默认错误组件
 */
const DefaultErrorComponent: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => (
  <div className="flex flex-col items-center justify-center h-full text-red-600">
    <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
    <p className="mb-4">渲染出错: {error.message}</p>
    <button
      onClick={retry}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
    >
      重试
    </button>
  </div>
);

/**
 * 虚拟化网格组件
 */
interface VirtualGridProps<T> extends Omit<VirtualListProps<T>, 'itemHeight' | 'renderItem'> {
  itemWidth: number;
  itemHeight: number;
  columnCount: number;
  renderItem: (item: T, rowIndex: number, columnIndex: number, style: React.CSSProperties) => React.ReactNode;
}

function VirtualGrid<T>({
  items,
  itemWidth,
  itemHeight,
  columnCount,
  containerHeight,
  renderItem,
  ...props
}: VirtualGridProps<T>) {
  const rowCount = Math.ceil(items.length / columnCount);
  
  const getRowItems = useCallback((rowIndex: number) => {
    const startIndex = rowIndex * columnCount;
    const endIndex = Math.min(startIndex + columnCount, items.length);
    return items.slice(startIndex, endIndex);
  }, [items, columnCount]);

  const renderRow = useCallback((rowItems: T[], rowIndex: number, style: React.CSSProperties) => {
    return (
      <div style={{ ...style, display: 'flex' }}>
        {rowItems.map((item, columnIndex) => {
          const itemStyle: React.CSSProperties = {
            width: itemWidth,
            height: itemHeight,
            flexShrink: 0
          };
          return (
            <div key={columnIndex} style={itemStyle}>
              {renderItem(item, rowIndex, columnIndex, itemStyle)}
            </div>
          );
        })}
      </div>
    );
  }, [itemWidth, itemHeight, renderItem]);

  const rowItems = useMemo(() => {
    const rows: T[][] = [];
    for (let i = 0; i < rowCount; i++) {
      rows.push(getRowItems(i));
    }
    return rows;
  }, [rowCount, getRowItems]);

  return (
    <VirtualList
      items={rowItems}
      itemHeight={itemHeight}
      containerHeight={containerHeight}
      renderItem={renderRow}
      {...props}
    />
  );
}

export default VirtualList;
export { VirtualGrid, DefaultEmptyComponent, DefaultLoadingComponent, DefaultErrorComponent };
export type { VirtualListProps, VirtualGridProps };