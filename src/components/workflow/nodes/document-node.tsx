import { Handle, type NodeProps, Position } from '@xyflow/react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import React, { useEffect } from 'react';
import { formatBytes } from '@/hooks/use-file-upload';
import BaseNode from '@/components/workflow/nodes/base-node';
import { useAtom } from 'jotai/index';
import { documentWorkFlowAtom } from '@/atoms/workflow';
import FileIcons, { type FileLike } from '@/components/file-icons';
import { UploadFiles } from '@/components/documents/upload-files';

export function DocumentNode({ isConnectable }: NodeProps) {
    const [documents, setDocuments] = useAtom(documentWorkFlowAtom);
    return (
        <Sheet>
            <SheetTrigger>
                <BaseNode className={'w-100'}>
                    <BaseNode.Header className={'bg-blue-500'}>文档处理</BaseNode.Header>
                    <BaseNode.Body className={'text-center'}>
                        <div className="text-sm text-gray-700 dark:text-gray-300">支持PDF、DOCX、TXT等格式</div>
                        {documents?.data?.map((file, index) => (
                            <div key={file.fileName} className="flex items-center gap-3 overflow-hidden">
                                <div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded border">
                                    <FileIcons file={file as FileLike} />
                                </div>
                                <div className="flex min-w-0 flex-1 justify-between">
                                    <p className="truncate text-[13px] font-medium">{file.fileName}</p>
                                    <p className="text-muted-foreground text-xs justify-end">
                                        {formatBytes(file.size || file.parserFileSize || 0)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </BaseNode.Body>
                    {/* Handles */}
                    <Handle
                        type="target"
                        position={Position.Left}
                        isConnectable={isConnectable}
                        className="w-4 h-4 bg-red-500 border-2 border-white dark:border-gray-800 rounded-full hover:brightness-110 transition-all duration-200"
                    />
                    <Handle
                        type="source"
                        position={Position.Right}
                        isConnectable={isConnectable}
                        className="w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full hover:brightness-110 transition-all duration-200"
                    />
                </BaseNode>
            </SheetTrigger>
            <SheetContent className={'p-4 w-[1000px] sm:w-[1000px]'}>
                <SheetTitle>文档选取</SheetTitle>

                <UploadFiles
                    type={'workflow'}
                    maxFiles={100}
                    initialFiles={documents?.data?.map(file => {
                        return {
                            id: file.id,
                            name: file.fileName,
                            size: file.size!,
                            type: file.fileExt!,
                            url: file.path!
                        };
                    })}
                />
            </SheetContent>
        </Sheet>
    );
}
