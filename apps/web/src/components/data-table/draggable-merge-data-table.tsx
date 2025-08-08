import { useState, useMemo, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
    type Row,
    type RowData,
    getExpandedRowModel
} from '@tanstack/react-table';
import { Pagination } from '@/components/data-table/pagination';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    DragOverlay,
    type DragStartEvent
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Merge } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import type { DragOverEvent } from '@dnd-kit/core/dist/types';
import { ProjectRole } from '@repo/shared-types'
import { WithPermission } from '../common/permission-wrapper';
import { useParams } from 'next/navigation';

interface RowWithIdAndName {
    id?: string;
    name?: string;
}

interface DataTableProps<TData extends RowData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pageCount: number;
    pagination: { pageIndex: number; pageSize: number };
    setPagination: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>;
    rowSelection?: Record<string, boolean>;
    setRowSelection: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    onMerge?: (activeRow: TData, overRow: TData) => Promise<void>;
    getId?: (row: TData) => string;
    getRowDescription?: (row: TData) => string; // 新增：获取行描述信息用于确认对话框
}

export function DraggableMergeDataTable<TData extends RowData & RowWithIdAndName, TValue>({
    columns,
    data,
    pageCount,
    pagination,
    setPagination,
    rowSelection,
    setRowSelection,
    onMerge,
    getId = (row: TData) => row?.id?.toString() ?? 'fallback-id',
    getRowDescription = (row: TData) => `${row?.name} (ID: ${row?.id})`
}: DataTableProps<TData, TValue>) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isMerging, setIsMerging] = useState(false);
    const [overId, setOverId] = useState<string | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const { projectId }: { projectId: string } = useParams();
    const [pendingMerge, setPendingMerge] = useState<{
        activeRow: TData | null;
        overRow: TData | null;
    }>({ activeRow: null, overRow: null });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8
            }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    const table = useReactTable({
        data,
        columns,
        state: {
            rowSelection,
            pagination
        },
        getRowId: row => getId(row),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        pageCount,
        manualPagination: true
    });

    const rowIds = useMemo(() => table.getRowModel().rows.map(row => row.id), [table.getRowModel().rows]);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    }, []);

    const handleDragOver = useCallback((event: DragOverEvent) => {
        setOverId((event?.over?.id as string) ?? null);
    }, []);

    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            const { active, over } = event;
            setActiveId(null);
            setOverId(null);

            if (!onMerge || !over || active.id === over.id) return;

            const activeRow = table.getRow(active.id as string)?.original;
            const overRow = table.getRow(over.id as string)?.original;

            if (activeRow && overRow) {
                // 先显示确认对话框，不立即执行合并
                setPendingMerge({ activeRow, overRow });
                setShowConfirmDialog(true);
            }
        },
        [onMerge, table]
    );

    const confirmMerge = useCallback(async () => {
        if (!pendingMerge.activeRow || !pendingMerge.overRow || !onMerge) return;

        setShowConfirmDialog(false);
        setIsMerging(true);

        try {
            await onMerge(pendingMerge.activeRow, pendingMerge.overRow);
            // toast.success("合并成功");
        } catch (error) {
            console.error('合并操作失败:', error);
            // toast.error("合并操作失败，请重试");
        } finally {
            setIsMerging(false);
            setPendingMerge({ activeRow: null, overRow: null });
        }
    }, [pendingMerge, onMerge]);

    const cancelMerge = useCallback(() => {
        setShowConfirmDialog(false);
        setPendingMerge({ activeRow: null, overRow: null });
        console.log('合并操作已取消');
    }, []);

    const activeRow = useMemo(() => (activeId ? table.getRow(activeId) : null), [activeId, table]);

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="relative flex flex-col gap-4 pb-2 overflow-auto">
                    <div className="overflow-hidden rounded-lg border">
                        <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
                            <Table>
                                <TableHeader className="bg-muted sticky top-0 z-10">
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <TableRow key={headerGroup.id}>
                                            <WithPermission required={ProjectRole.EDITOR} projectId={projectId}>
                                                <TableHead className="w-10"></TableHead>
                                            </WithPermission>
                                            {headerGroup.headers.map(header => (
                                                <TableHead key={header.id} colSpan={header.colSpan}>
                                                    {!header.isPlaceholder &&
                                                        flexRender(header.column.columnDef.header, header.getContext())}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody className="**:data-[slot=table-cell]:first:w-8">
                                    {renderTableBody(table, overId, isMerging)}
                                </TableBody>
                            </Table>
                        </SortableContext>

                        <DragOverlay>
                            {activeRow && (
                                <TableRow className="bg-blue-50 shadow-lg border border-blue-300">
                                    {activeRow.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            )}
                        </DragOverlay>
                    </div>
                    <Pagination table={table} />
                </div>
            </DndContext>

            {/* 合并确认对话框 */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认合并数据?</AlertDialogTitle>
                        <AlertDialogDescription>
                            <div className="space-y-2 my-4">
                                <div className="p-3 bg-red-50 rounded-md">
                                    <div className="font-medium">源数据:</div>
                                    <div>{getRowDescription(pendingMerge.activeRow!)}</div>
                                </div>
                                <div className="flex justify-center py-2">
                                    <Merge className="h-5 w-5 text-gray-500 transform rotate-180" />
                                </div>
                                <div className="p-3 bg-blue-50 rounded-md">
                                    <div className="font-medium">目标数据:</div>
                                    <div>{getRowDescription(pendingMerge.overRow!)}</div>
                                </div>
                            </div>
                            此操作将把源数据合并到目标数据中，且不可撤销。请确认是否继续?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={cancelMerge}>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmMerge}>确认合并</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function renderTableBody<TData>(
    table: ReturnType<typeof useReactTable<TData>>,
    overId: string | null,
    isMerging: boolean
) {
    if (!table.getRowModel().rows?.length) {
        // 确保 colspan 数量正确，根据你的表头列数调整
        // 由于你有一个拖拽列 + 其他列，所以至少是 2
        const columnCount = Math.max(2, table.getAllColumns().length + 1);

        return (
            <TableRow>
                <TableCell colSpan={columnCount} className="h-24 text-center">
                    没有数据
                </TableCell>
            </TableRow>
        );
    }

    return table
        .getRowModel()
        .rows.map(row => <SortableRow key={row.id} row={row} isOver={overId === row.id} isMerging={isMerging} />);
}


interface SortableRowProps<TData> {
    row: Row<TData>;
    isOver: boolean;
    isMerging: boolean;
}

function SortableRow<TData>({ row, isOver, isMerging }: SortableRowProps<TData>) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
    const { projectId }: { projectId: string } = useParams();
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 100 : 'auto'
    };

    return (
        <TableRow
            ref={setNodeRef}
            style={style}
            data-state={row.getIsSelected() && 'selected'}
            className={`
                ${isOver ? 'bg-blue-100 border-l-4 border-blue-500' : ''}
                ${isMerging ? 'animate-pulse' : ''}
                relative
            `}
        >
            <WithPermission required={ProjectRole.EDITOR} projectId={projectId}>
                <TableCell className="w-10">
                    <button
                        {...attributes}
                        {...listeners}
                        className="p-1 rounded-md hover:bg-gray-200 transition-colors"
                        aria-label="拖拽合并"
                    >
                        <GripVertical className="h-4 w-4 text-gray-500" />
                    </button>
                    {isOver && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center text-blue-500">
                            <Merge className="h-4 w-4 mr-1" />
                            <span className="text-xs font-medium">合并到此处</span>
                        </div>
                    )}
                </TableCell>
            </WithPermission>
            {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
            ))}
        </TableRow>
    );
}
