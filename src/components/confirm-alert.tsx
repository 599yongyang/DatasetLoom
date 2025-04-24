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
import { Button } from '@/components/ui/button';
import { type LucideIcon, Trash2 } from 'lucide-react';
import { type ReactNode } from 'react';

export function ConfirmAlert({
    icon: Icon,
    title,
    message,
    onConfirm,
    onCancel,
    children
}: {
    icon?: LucideIcon;
    title: string;
    message?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    children?: ReactNode;
}) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {children || (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:cursor-pointer hover:text-red-500"
                    >
                        <Trash2 size={30} />
                    </Button>
                )}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{message}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel}>取消</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>确认</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
