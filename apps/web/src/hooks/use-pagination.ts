import { useState, useEffect, useMemo } from 'react';

interface UsePaginationProps {
  defaultPageSize?: number;
  resetDeps?: any[];
}

export function usePagination({
  defaultPageSize = 10,
  resetDeps = []
}: UsePaginationProps = {}) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: defaultPageSize
  });

  // 当依赖项变化时重置到第一页
  useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, resetDeps);

  const resetPagination = () => {
    setPagination({
      pageIndex: 0,
      pageSize: defaultPageSize
    });
  };

  return {
    pagination,
    setPagination,
    resetPagination
  };
}
