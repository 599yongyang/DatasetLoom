'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Grid3X3, Images, Search } from 'lucide-react';

import ImageBlockList from '@/components/image-block/block-list';
import ImageAggregationList from '@/components/image-block/aggregation-list';

type ViewMode = 'block' | 'aggregation';

export default function ImageBlocksList() {
    const [viewMode, setViewMode] = useState<ViewMode>('aggregation');
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="sticky top-0 z-10 bg-background/80 s flex items-center justify-between gap-2">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        {/* 搜索 */}
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="搜索分块名称..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* 视图切换 */}
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        <Button
                            variant={viewMode === 'aggregation' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('aggregation')}
                            className="h-8"
                        >
                            <Images className="w-4 h-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'block' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('block')}
                            className="h-8"
                        >
                            <Grid3X3 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
            {/* 内容区域 */}
            <div>
                <ScrollArea className="h-[80vh]">
                    {viewMode === 'block' ? <ImageBlockList /> : <ImageAggregationList />}
                </ScrollArea>
            </div>
        </div>
    );
}
