'use client';

import React, {useState, useMemo} from 'react';
import {Button} from '@/components/ui/button';
import {Trash2, Ruler, MessageSquarePlus, Tag, SquareDashedMousePointer} from 'lucide-react';
import {useParams} from 'next/navigation';
import {formatBytes} from '@/hooks/use-file-upload';
import {Badge} from '@/components/ui/badge';
import {useImages} from '@/hooks/query/use-images';
import AddQuestionDialog from '@/components/images/add-question-dialog';
import type {ImageWithImageBlock} from '@/types/interfaces';
import BlockHighlight from '@/components/image-block/block-highlight';
import PaginationC from '@/components/ui/pagination';
import BlockImageDialog from '@/components/images/block-dialog';
import {ConfirmAlert} from '@/components/common/confirm-alert';
import {toast} from 'sonner';
import {useTranslation} from 'react-i18next';
import apiClient from "@/lib/axios";

export default function ImageAggregationList({searchQuery}: { searchQuery: string }) {
    const {t: tCommon} = useTranslation('common');

    const {projectId}: { projectId: string } = useParams();
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    });
    const {
        data,
        total,
        refresh: refreshFiles
    } = useImages({
        projectId,
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        fileName: searchQuery
    });
    const pageCount = useMemo(() => Math.ceil(total / pagination.pageSize) || 0, [total, pagination.pageSize]);
    const [questionDialog, setQuestionDialog] = useState(false);
    const [blockImageDialog, setBlockImageDialog] = useState(false);
    const [currentImage, setCurrentImage] = useState<ImageWithImageBlock>();

    const handleDelete = (image: ImageWithImageBlock) => {
        apiClient.delete(`/${projectId}/image-chunk/deleteByImageId?imageId=${image.id}`)
            .then(() => {
                toast.success(tCommon('messages.operate_success'));
                void refreshFiles();
            })
            .catch(error => {
                toast.error(tCommon('messages.operate_fail'));
                console.error(error);
            });
    };

    const handleCreateQuestions = (image: ImageWithImageBlock) => {
        setCurrentImage(image);
        setQuestionDialog(true);
    };

    const handleBlockImage = (image: ImageWithImageBlock) => {
        setCurrentImage(image);
        setBlockImageDialog(true);
    };

    return (
        <div className="flex flex-1 flex-col gap-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {data.map(image => {
                    return (
                        <div
                            key={image.id}
                            className="group border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                            {/* 图片预览 */}
                            <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                <BlockHighlight image={image}/>
                                <div className="absolute top-2 right-2">
                                    <Badge>{image.ImageBlock.length}个标注</Badge>
                                </div>
                                <div
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button size="sm" variant="secondary" onClick={() => handleCreateQuestions(image)}>
                                        <MessageSquarePlus className="w-4 h-4"/>
                                    </Button>
                                    <Button size="sm" variant="secondary" onClick={() => handleBlockImage(image)}>
                                        <SquareDashedMousePointer className="w-4 h-4"/>
                                    </Button>
                                    <ConfirmAlert
                                        title={'确认要删除此图像中的所有标注分块嘛？'}
                                        onConfirm={() => handleDelete(image)}
                                    >
                                        <Button size="sm" variant="secondary">
                                            <Trash2 className="w-4 h-4 text-red-600"/>
                                        </Button>
                                    </ConfirmAlert>
                                </div>
                            </div>

                            {/* 信息区域 */}
                            <div className="p-3 space-y-2">
                                <div className="flex items-start justify-between">
                                    <h3 className="font-medium text-sm truncate flex-1">{image.fileName}</h3>
                                </div>

                                <div className=" flex justify-between text-xs text-gray-500 ">
                                    <div className="flex items-center gap-1">
                                        <Ruler className="w-3 h-3"/>
                                        {image.width} × {image.height}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>{formatBytes(image.size)}</span>
                                    </div>
                                </div>
                                {image.tags && (
                                    <div className={'flex items-center gap-2'}>
                                        <Tag className="w-4 h-4"/>
                                        {image.tags.split(',').map((tag) => (
                                            <Badge key={tag} variant="outline" className="text-muted-foreground">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <PaginationC pagination={pagination} setPagination={setPagination} pageCount={pageCount}/>
            {currentImage && (
                <AddQuestionDialog
                    questionDialog={questionDialog}
                    setQuestionDialog={setQuestionDialog}
                    image={currentImage}
                />
            )}
            {currentImage && (
                <BlockImageDialog
                    open={blockImageDialog}
                    setOpen={setBlockImageDialog}
                    imageId={currentImage.id}
                    imageUrl={currentImage.url}
                    refresh={refreshFiles}
                />
            )}
        </div>
    );
}
