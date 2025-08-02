import React from 'react';
import { Pagination } from '@/components/data-table/pagination';

interface PaginationProps {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    canPreviousPage: boolean;
    canNextPage: boolean;
    gotoPage: (page: number) => void;
    previousPage: () => void;
    nextPage: () => void;
    setPageSize: (size: number) => void;
}

interface TablePaginationProps {
    pagination: {
        pageIndex: number;
        pageSize: number;
    };
    setPagination: React.Dispatch<
        React.SetStateAction<{
            pageIndex: number;
            pageSize: number;
        }>
    >;
    pageCount: number;
}

export default function PaginationC({ pagination, setPagination, pageCount }: TablePaginationProps) {
    const { pageIndex, pageSize } = pagination;

    const canPreviousPage = pageIndex > 0;
    const canNextPage = pageIndex < pageCount - 1;

    const gotoPage = (page: number) => setPagination(prev => ({ ...prev, pageIndex: page }));

    const previousPage = () => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }));

    const nextPage = () => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }));

    const setPageSize = (size: number) =>
        setPagination(prev => ({
            ...prev,
            pageSize: size,
            pageIndex: 0
        }));

    const paginationProps: PaginationProps = {
        pageIndex,
        pageSize,
        pageCount,
        canPreviousPage,
        canNextPage,
        gotoPage,
        previousPage,
        nextPage,
        setPageSize
    };

    return <Pagination pagination={paginationProps} />;
}
