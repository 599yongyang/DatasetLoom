import React from 'react';
import { clsx } from 'clsx';

type BaseNodeProps = {
    children?: React.ReactNode;
    className?: string;
};

type BaseNodeComponent = React.FC<BaseNodeProps> & {
    Header: React.FC<{ children: React.ReactNode; className?: string }>;
    Body: React.FC<{ children: React.ReactNode; className?: string }>;
};

const BaseNode: BaseNodeComponent = ({ children, className }) => {
    return (
        <div
            className={clsx(
                ' w-64 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg',
                className
            )}
        >
            {children}
        </div>
    );
};

// Header 插槽
BaseNode.Header = ({ children, className }) => {
    return <div className={clsx('px-4 py-2 text-white font-semibold', className)}>{children}</div>;
};

// Body 插槽
BaseNode.Body = ({ children, className }) => {
    return <div className={clsx('p-3 space-y-2 text-center', className)}>{children}</div>;
};

type KeyValueRowProps = {
    label: string;
    value: string | number | null | undefined;
};

export function KeyValueRow({ label, value }: KeyValueRowProps) {
    return (
        <div className="flex justify-between px-1 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            <div className="w-30 text-gray-500">{label}</div>
            <div className="truncate font-medium text-gray-900 dark:text-gray-200">{value ?? 'N/A'}</div>
        </div>
    );
}

export default BaseNode;
