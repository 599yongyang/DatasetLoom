'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Copy } from 'lucide-react';
import { useParams } from 'next/navigation';
import { ChunkList } from '@/components/documents/chunk-list';
import type { Chunks, UploadFiles } from '@prisma/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { useChunks } from '@/hooks/query/use-chunks';
import { useFiles } from '@/hooks/query/use-files';
import { FileSection } from '@/components/documents/file-section';
import { useGenerateQuestion } from '@/hooks/use-generate-question';
import { Loading } from '@/components/loading';

type SelectedChunk = {
    id: string;
    name: string;
};

export default function Page() {
    const { projectId }: { projectId: string } = useParams();
    const { t } = useTranslation('document');
    const { generateMultipleQuestion } = useGenerateQuestion();

    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [selectedChunks, setSelectedChunks] = useState<SelectedChunk[]>([]);
    const [fileInput, setFileInput] = useState('');
    const [status, setStatus] = useState('all');

    const { uploadedFiles, total, refresh: refreshFiles } = useFiles(projectId);

    const filteredFiles = useMemo(() => {
        if (!uploadedFiles) return [];
        return uploadedFiles.filter((file: UploadFiles) =>
            file.fileName.toLowerCase().includes(fileInput.toLowerCase())
        );
    }, [uploadedFiles, fileInput]);

    const { chunks, isLoading, refresh } = useChunks(projectId, selectedFiles, status);

    useEffect(() => {
        if (selectedFiles.length > 0) {
            refresh();
        }
    }, [selectedFiles]);

    // 全选/取消全选
    const toggleAll = () => {
        setSelectedChunks(prev =>
            prev.length === chunks.length
                ? []
                : chunks.map((chunk: Chunks) => {
                      return { id: chunk.id, name: chunk.name };
                  })
        );
    };

    const handleGenerateQuestion = async () => {
        await generateMultipleQuestion(projectId, selectedChunks);
        await refresh();
        setSelectedChunks([]);
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <FileSection
                filteredFiles={filteredFiles}
                total={total}
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
                setFileInput={setFileInput}
                fileInput={fileInput}
                refreshFiles={refreshFiles}
            />

            {/* Tabs Section */}
            <Tabs defaultValue="smart-split" className="w-full">
                {/*<div className="border-b mb-6">*/}
                {/*    <TabsList className="bg-transparent h-12">*/}
                {/*        <TabsTrigger*/}
                {/*            value="smart-split"*/}
                {/*            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12 px-4"*/}
                {/*        >*/}
                {/*            智能分割*/}
                {/*        </TabsTrigger>*/}
                {/*        <TabsTrigger*/}
                {/*            value="domain-analysis"*/}
                {/*            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12 px-4"*/}
                {/*        >*/}
                {/*            领域分析*/}
                {/*        </TabsTrigger>*/}
                {/*    </TabsList>*/}
                {/*</div>*/}

                <TabsContent value="smart-split" className="mt-0 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center pl-2 gap-2">
                            <Checkbox id="select-all" onCheckedChange={toggleAll} />
                            <label htmlFor="select-all" className="text-sm font-medium">
                                {t('chunk.info', { count: chunks.length, selected: selectedChunks.length })}
                            </label>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="状态" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('chunk.select_item.all')}</SelectItem>
                                    <SelectItem value="generated">{t('chunk.select_item.generated')}</SelectItem>
                                    <SelectItem value="ungenerated">{t('chunk.select_item.unGenerated')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                onClick={handleGenerateQuestion}
                                className="flex items-center gap-2 w-full sm:w-auto"
                            >
                                <Copy className="h-4 w-4" />
                                {t('chunk.gen_btn')}
                            </Button>
                        </div>
                    </div>

                    {/* Text Blocks */}

                    {isLoading ? (
                        <Loading />
                    ) : (
                        <ChunkList
                            chunks={chunks}
                            projectId={projectId}
                            getChunks={refresh}
                            selectedChunks={selectedChunks}
                            onSelectedChange={setSelectedChunks}
                        />
                    )}
                </TabsContent>

                <TabsContent value="domain-analysis">
                    <Card>
                        <CardContent className="flex items-center justify-center h-40">
                            <p className="text-muted-foreground">领域分析内容将显示在这里</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
