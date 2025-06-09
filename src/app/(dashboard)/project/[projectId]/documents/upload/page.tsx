'use client';

import DocumentParser from '@/components/documents/document-parser';

export default function Page() {
    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <DocumentParser />
        </div>
    );
}
