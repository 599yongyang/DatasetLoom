import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Pagination } from '@/components/data-table/pagination';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pageCount: number;
    pagination: { pageIndex: number; pageSize: number };
    setPagination: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>;
    rowSelection?: Record<string, boolean>;
    setRowSelection?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pageCount,
    pagination,
    setPagination,
    rowSelection: controlledRowSelection,
    setRowSelection: controlledSetRowSelection
}: DataTableProps<TData, TValue>) {
    // 如果外部没有传入 rowSelection 和 setRowSelection，则内部自己维护一个状态
    const [defaultRowSelection, setDefaultRowSelection] = useState<Record<string, boolean>>({});

    const table = useReactTable({
        data,
        columns,
        state: {
            rowSelection: controlledRowSelection ?? defaultRowSelection,
            pagination
        },
        getRowId: row => {
            const id = (row as { id: unknown }).id;
            if (id === undefined || id === null) {
                console.warn('Row ID is undefined or null. Using fallback ID.');
                return 'fallback-id';
            }
            return id.toString();
        },
        enableRowSelection: true,
        onRowSelectionChange: controlledSetRowSelection ?? setDefaultRowSelection,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        pageCount,
        manualPagination: true
    });

    return (
        <div className="relative flex flex-col gap-4 pb-2 overflow-auto">
            <div className="overflow-hidden rounded-lg border">
                <Table>
                    <TableHeader className="bg-muted sticky top-0 z-10">
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id} colSpan={header.colSpan}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className="**:data-[slot=table-cell]:first:w-8">
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <Pagination table={table} />
        </div>
    );
}
