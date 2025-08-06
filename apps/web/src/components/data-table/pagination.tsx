import type { Table } from '@tanstack/react-table';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface CommonPaginationProps {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    canPreviousPage?: boolean;
    canNextPage?: boolean;
    gotoPage?: (page: number) => void;
    previousPage?: () => void;
    nextPage?: () => void;
    setPageSize?: (size: number) => void;
}

interface PaginationProps<TData> {
    table?: Table<TData>;
    pagination?: CommonPaginationProps;
}

export const Pagination = <TData,>({ table, pagination: customPagination }: PaginationProps<TData>) => {
    const { t } = useTranslation('common');
    // 如果传入的是 table，则使用 table 提供的方法和状态
    const resolvedPagination = table
        ? {
              pageIndex: table.getState().pagination.pageIndex,
              pageSize: table.getState().pagination.pageSize,
              pageCount: table.getPageCount(),
              canPreviousPage: table.getCanPreviousPage(),
              canNextPage: table.getCanNextPage(),
              gotoPage: table.setPageIndex,
              previousPage: table.previousPage,
              nextPage: table.nextPage,
              setPageSize: table.setPageSize
          }
        : customPagination;

    if (!resolvedPagination) return null;

    const {
        pageIndex,
        pageSize,
        pageCount,
        canPreviousPage,
        canNextPage,
        gotoPage,
        previousPage,
        nextPage,
        setPageSize
    } = resolvedPagination;
    return (
        <div className="flex items-center justify-between px-4">
            <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                {table?.getIsSomePageRowsSelected() ? (
                    <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                        {t('pagination.select_row', {
                            selected_count: table.getFilteredSelectedRowModel().rows.length,
                            row_count: table.getFilteredRowModel().rows.length
                        })}
                    </div>
                ) : (
                    <></>
                )}
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
                <div className="hidden items-center gap-2 lg:flex">
                    <Label htmlFor="rows-per-page" className="text-sm font-medium">
                        {t('pagination.page_rows')}
                    </Label>
                    <Select value={`${pageSize}`} onValueChange={value => setPageSize?.(Number(value))}>
                        <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                            <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 30, 40, 50].map(pageSize => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex w-fit items-center justify-center text-sm font-medium">
                    {t('pagination.page_count', {
                        current: pageIndex + 1,
                        page: pageCount
                    })}
                </div>
                <div className="ml-auto flex items-center gap-2 lg:ml-0">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => gotoPage?.(0)}
                        disabled={!canPreviousPage}
                    >
                        <span className="sr-only">{t('pagination.first')}</span>
                        <IconChevronsLeft />
                    </Button>
                    <Button
                        variant="outline"
                        className="size-8"
                        size="icon"
                        onClick={() => previousPage?.()}
                        disabled={!canPreviousPage}
                    >
                        <span className="sr-only"> {t('pagination.previous')}</span>
                        <IconChevronLeft />
                    </Button>
                    <Button
                        variant="outline"
                        className="size-8"
                        size="icon"
                        onClick={() => nextPage?.()}
                        disabled={!canNextPage}
                    >
                        <span className="sr-only">{t('pagination.next')}</span>
                        <IconChevronRight />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden size-8 lg:flex"
                        size="icon"
                        onClick={() => gotoPage?.(pageCount - 1)}
                        disabled={!canNextPage}
                    >
                        <span className="sr-only">{t('pagination.last')}</span>
                        <IconChevronsRight />
                    </Button>
                </div>
            </div>
        </div>
    );
};
