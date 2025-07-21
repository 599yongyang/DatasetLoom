import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Upload, X } from 'lucide-react';
import { UploadFilesNew } from '@/components/documents/upload-files-new';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import React, { useEffect } from 'react';
import { useInputList } from '@/hooks/use-input-list';
import type { FileUploadOptions } from '@/hooks/use-file-upload';
import { useTranslation } from 'react-i18next';

export default function StepOne({
    uploadFormData,
    handleChange
}: {
    uploadFormData: {
        sourceType: string;
        webFileUrls: string[];
        webUrls: string[];
        selectedFiles: File[];
    };
    handleChange: (field: string, value: any) => void;
}) {
    const { t } = useTranslation('knowledge');

    const {
        list: webFileUrls,
        add: addWebFileUrl,
        remove: removeWebFileUrl,
        update: updateWebFileUrl
    } = useInputList(['']);
    const { list: webUrls, add: addWebUrls, remove: removeWebUrls, update: updateWebUrls } = useInputList(['']);
    const uploadOptions: FileUploadOptions = {
        multiple: true,
        accept: '.docx,.doc,.pdf,.md,.epub,.txt,.pptx, .ppt, .xlsx, .xls',
        maxFiles: 10,
        maxSize: 100 * 1024 * 1024
    };

    useEffect(() => {
        handleChange('webUrls', webUrls);
        handleChange('webFileUrls', webFileUrls);
    }, [webUrls, webFileUrls]);

    return (
        <div className="space-y-4">
            <Tabs value={uploadFormData.sourceType} onValueChange={value => handleChange('sourceType', value)}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="local" className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        {t('source_type.local')}
                    </TabsTrigger>
                    {/*<TabsTrigger value="webFile" className="flex items-center gap-2">*/}
                    {/*    <Link className="w-4 h-4"/>*/}
                    {/*    在线文件*/}
                    {/*</TabsTrigger>*/}
                    <TabsTrigger value="webUrl" className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        {t('source_type.web_url')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="local" className="space-y-4">
                    <UploadFilesNew
                        setLocalFiles={files => handleChange('selectedFiles', files)}
                        options={uploadOptions}
                    />
                </TabsContent>

                <TabsContent value="webFile" className="space-y-6">
                    <div className="space-y-4">
                        <div className="*:not-first:mt-2">
                            <Label htmlFor="web-url" className="text-base font-medium">
                                文件链接地址
                            </Label>
                            <div className="space-y-3">
                                {webFileUrls.map((webFileUrl, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            key={index}
                                            placeholder="https://example.com/document.pdf"
                                            value={webFileUrl}
                                            onChange={e => updateWebFileUrl(index, e.target.value)}
                                        />
                                        {webFileUrls.length > 1 && (
                                            <Button
                                                variant="outline"
                                                size={'icon'}
                                                onClick={() => removeWebFileUrl(index)}
                                            >
                                                <X />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground">输入可直接访问的文档链接</p>
                        </div>
                        <Button onClick={addWebFileUrl}>+ 添加更多</Button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">文档链接</h4>
                                <p className="text-sm text-blue-700">PDF, DOC, DOCX 等文档的直接下载链接</p>
                            </div>
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <h4 className="font-medium text-green-900 mb-2">云存储链接</h4>
                                <p className="text-sm text-green-700">Google Drive, Dropbox 等共享链接</p>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="webUrl" className="space-y-6">
                    <div className="space-y-4">
                        <div className="*:not-first:mt-2">
                            <Label htmlFor="web-url" className="text-base font-medium">
                                {t('upload_steps.one.web_site_title')}
                            </Label>
                            <div className="space-y-3">
                                {webUrls.map((webUrl, index) => (
                                    <div key={webUrl} className="flex gap-2">
                                        <Input
                                            key={index}
                                            placeholder="https://example.com"
                                            value={webUrl}
                                            onChange={e => updateWebUrls(index, e.target.value)}
                                        />
                                        {webUrls.length > 1 && (
                                            <Button
                                                variant="outline"
                                                size={'icon'}
                                                onClick={() => removeWebUrls(index)}
                                            >
                                                <X />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground">{t('upload_steps.one.web_site_desc')}</p>
                        </div>
                        <Button onClick={addWebUrls}>+ {t('upload_steps.add_more_btn')}</Button>

                        <div className="p-4 bg-blue-50  border border-blue-200 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-3">支持的网站类型</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                                <div>• 新闻文章和博客</div>
                                <div>• 产品页面和文档</div>
                                <div>• 学术论文和报告</div>
                                <div>• 社交媒体内容</div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
