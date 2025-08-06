'use client';

import { useFormStatus } from 'react-dom';

import { Icons } from '@/components/icons';

import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

export function SubmitButton({
    children,
    isSuccessful,
    className,
    ...props
}: {
    children: React.ReactNode;
    isSuccessful: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const { pending } = useFormStatus();

    return (
        <Button
            {...props}
            type={pending ? 'button' : 'submit'}
            aria-disabled={pending || isSuccessful}
            disabled={pending || isSuccessful}
            className={cn('relative', className)}
        >
            {children}

            {(pending || isSuccessful) && (
                <span className="animate-spin absolute right-4">
                    <Icons.loader />
                </span>
            )}

            <output aria-live="polite" className="sr-only">
                {pending || isSuccessful ? 'Loading' : 'Submit form'}
            </output>
        </Button>
    );
}
