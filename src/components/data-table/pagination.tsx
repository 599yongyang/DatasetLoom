import type { Table } from '@tanstack/react-table';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface PaginationControlsProps<TData> {
    table: Table<TData>;
}

export const Pagination = <TData,>({ table }: PaginationControlsProps<TData>) => {
    const { t } = useTranslation('common');
    return (
        <div className="flex items-center justify-between px-4">
            <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                {t('pagination.select_row', {
                    selected_count: table.getFilteredSelectedRowModel().rows.length,
                    row_count: table.getFilteredRowModel().rows.length
                })}
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
                <div className="hidden items-center gap-2 lg:flex">
                    <Label htmlFor="rows-per-page" className="text-sm font-medium">
                        {t('pagination.page_rows')}
                    </Label>
                    <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={value => {
                            table.setPageSize(Number(value));
                        }}
                    >
                        <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                            <SelectValue placeholder={table.getState().pagination.pageSize} />
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
                        current: table.getState().pagination.pageIndex + 1,
                        page: table.getPageCount()
                    })}
                </div>
                <div className="ml-auto flex items-center gap-2 lg:ml-0">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">{t('pagination.first')}</span>
                        <IconChevronsLeft />
                    </Button>
                    <Button
                        variant="outline"
                        className="size-8"
                        size="icon"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only"> {t('pagination.previous')}</span>
                        <IconChevronLeft />
                    </Button>
                    <Button
                        variant="outline"
                        className="size-8"
                        size="icon"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">{t('pagination.next')}</span>
                        <IconChevronRight />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden size-8 lg:flex"
                        size="icon"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">{t('pagination.last')}</span>
                        <IconChevronsRight />
                    </Button>
                </div>
            </div>
        </div>
    );
};
