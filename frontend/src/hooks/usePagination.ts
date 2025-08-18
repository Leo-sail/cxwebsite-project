/**
 * 分页Hook
 */
import { useState, useMemo } from 'react';

interface PaginationConfig {
  initialPage?: number;
  initialPageSize?: number;
  total: number;
}

interface PaginationReturn {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  setPageSize: (size: number) => void;
}

/**
 * 分页Hook
 * @param config 分页配置
 * @returns 分页状态和控制函数
 */
function usePagination({
  initialPage = 1,
  initialPageSize = 10,
  total,
}: PaginationConfig): PaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  /**
   * 计算分页信息
   */
  const paginationInfo = useMemo(() => {
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize - 1, total - 1);
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;

    return {
      totalPages,
      startIndex,
      endIndex,
      hasNextPage,
      hasPreviousPage,
    };
  }, [currentPage, pageSize, total]);

  /**
   * 跳转到指定页
   */
  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, paginationInfo.totalPages));
    setCurrentPage(validPage);
  };

  /**
   * 下一页
   */
  const goToNextPage = () => {
    if (paginationInfo.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  /**
   * 上一页
   */
  const goToPreviousPage = () => {
    if (paginationInfo.hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  /**
   * 第一页
   */
  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  /**
   * 最后一页
   */
  const goToLastPage = () => {
    setCurrentPage(paginationInfo.totalPages);
  };

  /**
   * 设置每页大小
   */
  const handleSetPageSize = (size: number) => {
    setPageSize(size);
    // 重新计算当前页，确保不超出范围
    const newTotalPages = Math.ceil(total / size);
    if (currentPage > newTotalPages) {
      setCurrentPage(Math.max(1, newTotalPages));
    }
  };

  return {
    currentPage,
    pageSize,
    ...paginationInfo,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    setPageSize: handleSetPageSize,
  };
}

export default usePagination;