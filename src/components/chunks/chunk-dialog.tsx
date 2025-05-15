import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { type ReactNode } from 'react';
import { Markdown } from '@/components/playground/markdown';

export function ChunkDialog({
    title,
    chunkContent,
    children
}: {
    title: string;
    chunkContent: string;
    children?: ReactNode;
}) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                </AlertDialogHeader>
                <div className={'max-h-[80vh] overflow-auto'}>
                    <Markdown>{chunkContent}</Markdown>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>关闭</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
