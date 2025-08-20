import type {ColumnDef} from '@tanstack/react-table';
import {useTranslation} from 'react-i18next';
import {Badge} from '@/components/ui/badge';
import {toast} from 'sonner';
import {Checkbox} from '@/components/ui/checkbox';
import {useParams} from 'next/navigation';
import {formatBytes} from '@/hooks/use-file-upload';
import {ConfirmAlert} from '@/components/common/confirm-alert';
import {ParseStatusType, ProjectRole} from '@repo/shared-types';
import {WithPermission} from '@/components/common/permission-wrapper';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import type {ImageFile} from '@/types/interfaces';
import {IconCircleCheckFilled, IconLoader} from '@tabler/icons-react';
import {Button} from '@/components/ui/button';
import {SquareDashedMousePointer} from 'lucide-react';
import {ParseStatusTypeMap, type UIParseStatusType} from '@/constants/data-dictionary';
import {BACKEND_URL} from "@/constants/config";
import apiClient from "@/lib/axios";

export function useImagesTableColumns({
                                          mutateImages,
                                          onOpenDialog
                                      }: {
    mutateImages: () => void;
    onOpenDialog?: (image: ImageFile) => void;
}) {
    const {t} = useTranslation('knowledge');
    const {projectId}: { projectId: string } = useParams();
    const deleteImage = (fileId: string) => {
        toast.promise(
            apiClient.delete(`/${projectId}/images/delete`, {
                params: {ids: fileId},
            }),
            {
                loading: '数据删除中',
                success: _ => {
                    mutateImages();
                    return '删除成功';
                },
                error: error => {
                    return error.message || '删除失败';
                }
            }
        );
    };

    const columns: ColumnDef<ImageFile>[] = [
        {
            id: 'select',
            header: ({table}) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
                        }
                        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                    />
                </div>
            ),
            cell: ({row}) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={value => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                </div>
            ),
            enableHiding: false
        },
        {
            accessorKey: 'image',
            header: t('image_table_columns.image'),
            cell: ({row}) => (
                <div className={'w-10 h-10'}>
                    <img
                        src={`${BACKEND_URL}${row.original.url}`}
                        className="size-full object-cover"
                        width={20}
                        height={20}
                        alt={row.original.fileName}
                    />
                </div>
            )
        },
        {
            accessorKey: 'image_name',
            header: t('image_table_columns.image_name'),
            cell: ({row}) => (
                <div className="text-foreground max-w-[30vw] px-0 text-left">
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <p className={'truncate'}>{row.original.fileName}</p>
                            </TooltipTrigger>
                            <TooltipContent
                                side="bottom"
                                className="max-w-[50vw] p-2 bg-white shadow-lg rounded-md border border-gray-200"
                            >
                                {row.original.fileName}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            ),
            enableHiding: false
        },

        {
            accessorKey: 'size',
            header: t('image_table_columns.size'),
            cell: ({row}) => <div>{formatBytes(row.original.size)}</div>
        },
        {
            accessorKey: 'dimensions',
            header: t('image_table_columns.dimensions'),
            cell: ({row}) => (
                <div>
                    {row.original.width} X {row.original.height}
                </div>
            )
        },
        {
            accessorKey: 'ocr',
            header: t('image_table_columns.ocr'),
            cell: ({row}) => (
                <div className="text-foreground max-w-[30vw] px-0 text-left">
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <p className={'truncate'}>{row.original.ocrText}</p>
                            </TooltipTrigger>
                            <TooltipContent
                                side="bottom"
                                className="max-w-[50vw] p-2 bg-white shadow-lg rounded-md border border-gray-200"
                            >
                                {row.original.ocrText}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            ),
            enableHiding: false
        },
        {
            accessorKey: 'object',
            header: t('image_table_columns.object'),
            cell: ({row}) => (
                <div className={'space-x-1'}>
                    {row.original.tags !== '' &&
                        row.original.tags.split(',').map(tag => (
                            <Badge key={tag} variant="outline" className="text-muted-foreground">
                                {tag}
                            </Badge>
                        ))}
                </div>
            )
        },
        {
            accessorKey: 'status',
            header: t('image_table_columns.status'),
            cell: ({row}) => (
                <Badge variant="outline" className="text-muted-foreground px-1.5">
                    {row.original.status === ParseStatusType.DONE ? (
                        <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400"/>
                    ) : (
                        <IconLoader/>
                    )}
                    {ParseStatusTypeMap[row.original.status as UIParseStatusType]}
                </Badge>
            )
        },
        {
            accessorKey: 'createdAt',
            header: t('image_table_columns.createdAt'),
            cell: ({row}) => <div className="w-32">{new Date(row.original.createdAt).toLocaleString('zh-CN')}</div>
        },
        {
            id: 'actions',
            header: () => <div className="text-center">{t('image_table_columns.actions')}</div>,
            cell: ({row}) => {
                return (
                    <div className="flex flex-1 justify-center gap-2">
                        <WithPermission required={ProjectRole.EDITOR} projectId={projectId}>
                            <Button variant="ghost" onClick={() => onOpenDialog?.(row.original)}>
                                <SquareDashedMousePointer/>
                            </Button>
                        </WithPermission>

                        <WithPermission required={ProjectRole.ADMIN} projectId={projectId}>
                            <ConfirmAlert
                                title={t('delete_title')}
                                message={row.original.fileName}
                                onConfirm={() => deleteImage(row.original.id)}
                            />
                        </WithPermission>
                    </div>
                );
            }
        }
    ];

    return columns;
}
