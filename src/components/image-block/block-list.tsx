'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, MoreHorizontal, MapPin, Ruler, MessageSquarePlus } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { useParams } from 'next/navigation';
import { formatBytes } from '@/hooks/use-file-upload';
import type { ImageBlockWithImage } from '@/server/db/schema/image-block';
import AddQuestionDialog from '@/components/images/add-question-dialog';
import type { ImageBlock } from '@prisma/client';
import { useImageBlocks } from '@/hooks/query/use-image-block';
import PaginationC from '@/components/ui/pagination';

export default function ImageBlockList() {
    const { projectId }: { projectId: string } = useParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    });
    const {
        data,
        total,
        refresh: refreshFiles
    } = useImageBlocks({
        projectId,
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        label: searchQuery
    });
    const pageCount = useMemo(() => Math.ceil(total / pagination.pageSize) || 0, [total, pagination.pageSize]);

    const [currentBlock, setCurrentBlock] = useState<ImageBlockWithImage>();
    const [questionDialog, setQuestionDialog] = useState(false);

    const handleDelete = (block: ImageBlockWithImage) => {
        console.log('删除分块:', block);
    };

    const handleCreateQuestions = (block: ImageBlockWithImage) => {
        setCurrentBlock(block);
        setQuestionDialog(true);
    };

    return (
        <div className="flex flex-1 flex-col gap-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {data.map(block => {
                    return (
                        <div
                            key={block.id}
                            className="group border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                            {/* 图片预览 */}
                            <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                <div
                                    className=" w-full h-full object-contain"
                                    style={{
                                        backgroundImage: `url(/api/view/image/${block.imageId})`,
                                        backgroundPosition: `-${block.x}px -${block.y}px`,
                                        backgroundSize: 'auto',
                                        width: `${block.width}px`,
                                        height: `${block.height}px`
                                    }}
                                ></div>

                                {/*悬停操作*/}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button size="sm" variant="secondary" onClick={() => handleCreateQuestions(block)}>
                                        <MessageSquarePlus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* 信息区域 */}
                            <div className="p-3 space-y-2">
                                <div className="flex items-start justify-between">
                                    <h3 className="font-medium text-sm truncate flex-1">{block.label}</h3>
                                    <div className={'flex gap-2'}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(block)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    删除
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                <div className=" flex justify-between text-xs text-gray-500 ">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />({block.x}, {block.y})
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Ruler className="w-3 h-3" />
                                        {block.width} × {block.height}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>{formatBytes(block.image.size)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <PaginationC pagination={pagination} setPagination={setPagination} pageCount={pageCount} />
            {currentBlock && (
                <AddQuestionDialog
                    questionDialog={questionDialog}
                    setQuestionDialog={setQuestionDialog}
                    imageId={currentBlock.image.id}
                    name={currentBlock.image.fileName}
                    width={currentBlock.image.width}
                    height={currentBlock.image.height}
                    block={[currentBlock as ImageBlock]}
                />
            )}
        </div>
    );
}
