import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileQuestion, Hash, Tags, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { useParams } from 'next/navigation';
import { ConfirmAlert } from '@/components/common/confirm-alert';
import type { ChunksVO } from '@/server/db/schema/chunks';
import React, { useState } from 'react';
import { ProjectRole } from 'src/server/db/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChunkInfoSheet } from '@/components/chunks/chunk-info-sheet';
import { useAtomValue } from 'jotai/index';
import { selectedModelInfoAtom } from '@/atoms';
import i18n from 'i18next';
import { WithPermission } from '@/components/common/permission-wrapper';

export function useTextChunkTableColumns({
    mutateChunks,
    onOpenDialog
}: {
    mutateChunks: () => void;
    onOpenDialog?: (chunk: ChunksVO) => void;
}) {
    const { t } = useTranslation('chunk');
    const { projectId }: { projectId: string } = useParams();
    const [open, setOpen] = useState(false);
    const model = useAtomValue(selectedModelInfoAtom);
    const handleAnalysis = async (chunkId: string) => {
        toast.promise(
            axios.put(`/api/project/${projectId}/chunks`, {
                modelConfigId: model.id,
                chunkId: chunkId,
                language: i18n.language
            }),
            {
                position: 'top-right',
                loading: '分析分块内容中...',
                success: _ => {
                    mutateChunks();
                    return '分析完成';
                },
                error: error => {
                    if (axios.isCancel(error)) {
                        return '请求已取消'; // 显示友好提示
                    }
                    return error.response?.data?.error || '处理失败';
                }
            }
        );
    };

    const handleDeleteChunk = async (chunkId: string) => {
        try {
            const response = await axios.delete(`/api/project/${projectId}/chunks/${chunkId}`);
            if (response.status === 200) {
                toast.success('删除成功');
                mutateChunks();
            }
        } catch (error) {
            toast.error('删除失败');
        }
    };
    const columns: ColumnDef<ChunksVO>[] = [
        {
            id: 'select',
            header: ({ table }) => (
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
            cell: ({ row }) => (
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
            id: 'content',
            header: t('table_columns.info'),
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div>
                        {/* 文件名和分块信息 */}
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-2">
                                <Hash className="h-3 w-3 text-gray-400" />
                                <span className="font-medium  text-sm">{item.name}</span>
                            </div>

                            {/*{item.Questions.length > 0 && (*/}
                            {/*    <TooltipProvider delayDuration={0}>*/}
                            {/*        <Tooltip>*/}
                            {/*            <TooltipTrigger asChild>*/}
                            {/*                <div className="flex items-center gap-1">*/}
                            {/*                    <Button*/}
                            {/*                        variant="link"*/}
                            {/*                        className="text-xs font-medium text-green-700   px-2 py-1 rounded"*/}
                            {/*                    >*/}
                            {/*                        {t('question', { count: item.Questions.length })}*/}
                            {/*                    </Button>*/}
                            {/*                </div>*/}
                            {/*            </TooltipTrigger>*/}
                            {/*            <TooltipContent*/}
                            {/*                side="bottom"*/}
                            {/*                className="max-w-[50vw] p-2 bg-white shadow-lg rounded-md border border-gray-200"*/}
                            {/*            >*/}
                            {/*                <div className="space-y-2">*/}
                            {/*                    <h4 className="text-xs font-semibold text-gray-700 mb-1">*/}
                            {/*                        生成的问题列表*/}
                            {/*                    </h4>*/}
                            {/*                    {item.Questions.length > 0 ? (*/}
                            {/*                        <ul className="space-y-1 max-h-[200px] overflow-y-auto">*/}
                            {/*                            {item.Questions.map((question, index) => (*/}
                            {/*                                <li*/}
                            {/*                                    key={index}*/}
                            {/*                                    className="text-xs text-gray-600 p-1 hover:bg-gray-50 rounded"*/}
                            {/*                                >*/}
                            {/*                                    <div className="flex items-start gap-2">*/}
                            {/*                                        <span className="text-gray-500">{index + 1}.</span>*/}
                            {/*                                        <span>{question.question}</span>*/}
                            {/*                                    </div>*/}
                            {/*                                </li>*/}
                            {/*                            ))}*/}
                            {/*                        </ul>*/}
                            {/*                    ) : (*/}
                            {/*                        <p className="text-xs text-gray-500">暂无生成的问题</p>*/}
                            {/*                    )}*/}
                            {/*                </div>*/}
                            {/*            </TooltipContent>*/}
                            {/*        </Tooltip>*/}
                            {/*    </TooltipProvider>*/}
                            {/*)}*/}
                        </div>

                        {/* 文本块内容 */}
                        <div className="mb-4 w-full max-w-[60vw]">
                            <div
                                className="text-gray-700 text-sm leading-relaxed break-words whitespace-normal"
                                style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    wordBreak: 'break-word'
                                }}
                            >
                                {item.content}
                            </div>
                        </div>

                        {/* 标签 */}
                        <div className="flex flex-wrap gap-2">
                            {item.tags
                                ?.split(',')
                                ?.filter((tag: string) => tag.trim()) // 过滤掉空字符串
                                ?.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                        {tag}
                                    </Badge>
                                ))}
                        </div>
                    </div>
                );
            }
        },
        {
            id: 'metadata',
            header: t('table_columns.metadata'),
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="py-1 space-y-1">
                        {/* 领域信息 */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">{t('table_columns.fileName')}</span>
                            </div>
                            <div className="text-xs text-gray-800 font-medium">
                                <TooltipProvider delayDuration={0}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="text-xs text-gray-800 font-medium max-w-[5vw]  inline-block truncate">
                                                {item.documentName}
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent className="px-2 py-1 text-xs">
                                            {item.documentName}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                        {/* 领域信息 */}
                        {item.domain && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-500">{t('table_columns.domain')}</span>
                                </div>
                                <div className="text-xs text-gray-800 font-medium">
                                    {item.domain} / {item.subDomain}
                                </div>
                            </div>
                        )}
                        {/* 分块大小 */}
                        <div className="space-y-1">
                            <span className="text-xs text-gray-500">{t('table_columns.size')}</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-sm font-bold text-blue-500">{item.size.toLocaleString()}</span>
                                <span className="text-xs text-gray-500">characters</span>
                            </div>
                        </div>
                    </div>
                );
            },
            size: 160
        },
        {
            id: 'actions',
            header: () => <div className="text-center">{t('table_columns.actions')}</div>,
            cell: ({ row }) => {
                return (
                    <div className="flex flex-1 justify-center gap-1">
                        <WithPermission required={ProjectRole.EDITOR} projectId={projectId}>
                            <Button variant="ghost" size="icon" onClick={() => handleAnalysis(row.original.id)}>
                                <Tags />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onOpenDialog?.(row.original)}>
                                <FileQuestion />
                            </Button>
                            <ChunkInfoSheet item={row.original} refresh={mutateChunks} />
                        </WithPermission>
                        <WithPermission required={ProjectRole.ADMIN} projectId={projectId}>
                            <ConfirmAlert
                                title={`确认要删除【${row.original.name}】此文本块嘛？`}
                                message={'此操作不可逆，请谨慎操作！'}
                                onConfirm={() => handleDeleteChunk(row.original.id)}
                            >
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-red-500">
                                    <Trash2 />
                                </Button>
                            </ConfirmAlert>
                        </WithPermission>
                    </div>
                );
            }
        }
    ];
    return columns;
}
