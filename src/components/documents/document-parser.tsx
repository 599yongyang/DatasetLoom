'use client';

import React, { useEffect } from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Upload,
    Globe,
    FileText,
    CheckCircle,
    Loader2,
    Cpu,
    ChevronRight,
    ChevronLeft,
    Settings,
    AlertTriangle,
    X,
    XCircle
} from 'lucide-react';
import { UploadFilesNew } from '@/components/documents/upload-files-new';
import type { FileUploadOptions } from '@/hooks/use-file-upload';
import { useParams, useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '../ui/alert';
import { useGetParserConfig } from '@/hooks/query/use-parser-config';
import { PARSER_SERVICE_LIST } from '@/constants/parser';
import axios from 'axios';

type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

const parsingServices = [
    {
        id: 'native',
        name: '原生解析',
        description: '使用内置解析器，适合简单文档',
        icon: FileText,
        category: 'document',
        supportedInputs: ['local', 'webFile'],
        supportedTypes: ['pdf', 'docx', 'txt', 'md'],
        requiresApiKey: false,
        features: ['快速处理', '基础文本提取']
    },
    ...PARSER_SERVICE_LIST
];

const steps = [
    { id: 1, title: '选择内容来源', description: '上传文件或输入链接' },
    { id: 2, title: '选择解析服务', description: '选择适合的解析引擎' },
    { id: 3, title: '解析与结果', description: '开始解析并查看结果' }
];

export default function DocumentParser() {
    const { projectId }: { projectId: string } = useParams();
    const router = useRouter();
    const { data: parserConfigList } = useGetParserConfig(projectId);
    const [currentStep, setCurrentStep] = useState(1);
    const [sourceType, setSourceType] = useState('local');
    const [status, setStatus] = useState<ProcessingStatus>('idle');
    const [progress, setProgress] = useState(0);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const {
        list: webFileUrls,
        add: addWebFileUrl,
        remove: removeWebFileUrl,
        update: updateWebFileUrl
    } = useInputList(['']);
    const { list: webUrls, add: addWebUrls, remove: removeWebUrls, update: updateWebUrls } = useInputList(['']);
    const [selectedService, setSelectedService] = useState('');

    const getAvailableServices = () => {
        return parsingServices.filter(service => {
            if (!service.supportedInputs.includes(sourceType)) return false;

            // 检查服务是否已配置（除了原生解析）
            if (service.id !== 'native') {
                const config = parserConfigList.find(
                    config => config.serviceId.toLowerCase() === service.id.toLowerCase()
                );
                if (!config?.apiKey) {
                    return false;
                }
            }

            if (sourceType === 'local' && selectedFiles.length > 0) {
                const fileExtensions = selectedFiles.map(file => file.name.split('.').pop()?.toLowerCase() || '');
                return !service.supportedTypes || service.supportedTypes.some(type => fileExtensions.includes(type));
            }

            return true;
        });
    };

    const selectedServiceData = parsingServices.find(s => s.id === selectedService);

    useEffect(() => {
        console.log(selectedFiles);
    }, [selectedFiles]);

    const handleProcess = async () => {
        console.log(selectedService, selectedFiles, webUrls, webFileUrls, sourceType);
        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('localFiles', file);
        });
        formData.append('sourceType', sourceType);
        formData.append('selectedService', selectedService);
        formData.append('webFileUrls', JSON.stringify(webFileUrls));
        formData.append('webUrls', JSON.stringify(webUrls));
        setStatus('processing');
        axios
            .post(`/api/project/${projectId}/documents/parser`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(res => {
                if (res.data.success) {
                    setStatus('completed');
                } else {
                    setStatus('error');
                }
            })
            .catch(error => {
                setStatus('error');
            });
    };

    const resetProcess = () => {
        setCurrentStep(1);
        setStatus('idle');
        setProgress(0);
        setSelectedFiles([]);
        setSelectedService('');
    };

    const canProceedToNextStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    (sourceType === 'local' && selectedFiles.length > 0) ||
                    (sourceType === 'webUrl' && webUrls.filter(url => url.trim() !== '').length > 0) ||
                    (sourceType === 'webFile' && webFileUrls.filter(url => url.trim() !== '').length > 0)
                );
            case 2:
                return selectedService !== '';
            default:
                return true;
        }
    };

    const uploadOptions: FileUploadOptions = {
        initialFiles: selectedFiles.map(file => {
            return {
                id: file.name,
                name: file.name,
                size: file.size,
                type: file.type,
                url: file.name
            };
        }),
        multiple: true,
        accept: '.docx,.doc,.pdf,.md,.epub,.txt,.pptx, .ppt, .xlsx, .xls, .jpeg, .jpg, .png',
        maxFiles: 10,
        maxSize: 100 * 1024 * 1024
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-2 space-y-6">
            <div className="text-center space-y-2">
                <p className=" font-bold">按步骤完成文档解析，获得高质量的结构化输出</p>
            </div>
            {parserConfigList.length === 0 && (
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className={'flex flex-1'}>
                        您还没有配置任何解析服务。请先前往
                        <Button
                            variant="link"
                            className="p-0 h-auto text-primary hover:cursor-pointer"
                            onClick={() => router.push(`/project/${projectId}/settings/parser-config`)}
                        >
                            解析服务配置页面
                        </Button>
                        配置您需要的服务。
                    </AlertDescription>
                </Alert>
            )}

            {/* 步骤指示器 */}
            <div className="relative mb-12">
                <div className="absolute top-4 left-0 right-0 h-1 bg-muted z-0">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />
                </div>
                <div className="flex justify-between ">
                    {steps.map(step => (
                        <div key={step.id} className="flex flex-col items-center z-1">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                                    currentStep > step.id
                                        ? 'bg-green-500 text-white'
                                        : currentStep === step.id
                                          ? 'bg-primary text-primary-foreground'
                                          : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
                            </div>
                            <div className="mt-2 text-center">
                                <div className="text-sm font-medium">{step.title}</div>
                                <div className="text-xs text-muted-foreground">{step.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 步骤内容 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {currentStep === 1 && <Upload className="w-5 h-5" />}
                        {currentStep === 2 && <Cpu className="w-5 h-5" />}
                        {currentStep === 3 && <Settings className="w-5 h-5" />}
                        {currentStep === 4 && <FileText className="w-5 h-5" />}
                        步骤 {currentStep}: {steps[currentStep - 1]?.title}
                    </CardTitle>
                    <CardDescription>{steps[currentStep - 1]?.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* 步骤 1: 选择内容来源 */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <Tabs value={sourceType} onValueChange={setSourceType}>
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="local" className="flex items-center gap-2">
                                        <Upload className="w-4 h-4" />
                                        本地文件
                                    </TabsTrigger>
                                    {/*<TabsTrigger value="webFile" className="flex items-center gap-2">*/}
                                    {/*    <Link className="w-4 h-4"/>*/}
                                    {/*    在线文件*/}
                                    {/*</TabsTrigger>*/}
                                    <TabsTrigger value="webUrl" className="flex items-center gap-2">
                                        <Globe className="w-4 h-4" />
                                        网站内容
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="local" className="space-y-4">
                                    <UploadFilesNew setLocalFiles={setSelectedFiles} options={uploadOptions} />
                                </TabsContent>

                                <TabsContent value="webFile" className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="*:not-first:mt-2">
                                            <Label htmlFor="web-url" className="text-base font-medium">
                                                文件链接地址
                                            </Label>
                                            <div className="space-y-3">
                                                {webFileUrls.map((webFileUrl, index) => (
                                                    <div className="flex gap-2">
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
                                                <p className="text-sm text-blue-700">
                                                    PDF, DOC, DOCX 等文档的直接下载链接
                                                </p>
                                            </div>
                                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                                <h4 className="font-medium text-green-900 mb-2">云存储链接</h4>
                                                <p className="text-sm text-green-700">
                                                    Google Drive, Dropbox 等共享链接
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="webUrl" className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="*:not-first:mt-2">
                                            <Label htmlFor="web-url" className="text-base font-medium">
                                                网站地址
                                            </Label>
                                            <div className="space-y-3">
                                                {webUrls.map((webUrl, index) => (
                                                    <div className="flex gap-2">
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
                                            <p className="text-sm text-muted-foreground">输入要解析的网站或网页地址</p>
                                        </div>
                                        <Button onClick={addWebUrls}>+ 添加更多</Button>

                                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                            <h4 className="font-medium text-purple-900 mb-3">支持的网站类型</h4>
                                            <div className="grid grid-cols-2 gap-2 text-sm text-purple-700">
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
                    )}

                    {/* 步骤 2: 选择解析服务 */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <div className="grid gap-4">
                                {getAvailableServices().length === 0 ? (
                                    <Alert>
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>
                                            没有可用的解析服务。 请检查：
                                            <br />• 是否已在配置页面启用相关服务
                                            <br />• 选择的文件格式是否被支持
                                            <br />• 服务配置是否正确
                                            <Button
                                                variant="link"
                                                className=" text-primary hover:cursor-pointer"
                                                onClick={() =>
                                                    router.push(`/project/${projectId}/settings/parser-config`)
                                                }
                                            >
                                                立即去配置
                                            </Button>
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <div className="grid gap-4">
                                        {getAvailableServices().map(service => (
                                            <div
                                                key={service.id}
                                                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                                    selectedService === service.id
                                                        ? 'border-primary bg-primary/5 shadow-md'
                                                        : 'border-muted hover:border-muted-foreground/50 hover:bg-muted/50'
                                                }`}
                                                onClick={() => setSelectedService(service.id)}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="mt-1">{service && <service.icon />}</div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-3">
                                                                <h4 className="font-medium ">{service.name}</h4>
                                                                {service.id !== 'native' && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-xs text-green-600"
                                                                    >
                                                                        已配置
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {selectedService === service.id && (
                                                                <CheckCircle className="w-5 h-5 text-primary" />
                                                            )}
                                                        </div>
                                                        <p className="text-muted-foreground text-sm mb-2">
                                                            {service.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 步骤 3: 解析与结果 */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-medium mb-2">开始解析</h3>
                                <p className="text-muted-foreground">
                                    使用 <span className="font-medium">{selectedServiceData?.name}</span> 解析您的内容
                                </p>
                            </div>

                            <div className="flex gap-3 justify-center">
                                {status === 'idle' && (
                                    <Button onClick={handleProcess} size="lg" className="px-8">
                                        <FileText className="w-4 h-4 mr-2" />
                                        开始解析
                                    </Button>
                                )}

                                {status === 'processing' && (
                                    <Button disabled size="lg" className="px-8">
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        解析中...
                                    </Button>
                                )}
                                {status === 'error' && (
                                    <Button onClick={resetProcess} size="lg" className="px-8">
                                        <XCircle className="w-4 h-4 mr-2" />
                                        解析失败，请重试
                                    </Button>
                                )}

                                {status === 'completed' && (
                                    <div className="flex gap-3">
                                        <Button
                                            size="lg"
                                            className="px-8"
                                            onClick={() => router.push(`/project/${projectId}/documents`)}
                                        >
                                            解析完成，前往知识库查看结果
                                        </Button>
                                        <Button variant="outline" onClick={resetProcess} size="lg">
                                            重新开始
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {status === 'completed' && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-2 text-green-800 mb-2">
                                            <CheckCircle className="w-5 h-5" />
                                            <span className="font-medium">解析完成!</span>
                                        </div>
                                        <p className="text-sm text-green-700">
                                            使用 {selectedServiceData?.name} 成功解析内容，生成了高质量的结构化文档。
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 导航按钮 */}
            <div className="flex justify-between">
                <div>
                    {currentStep !== 1 && (
                        <Button variant="outline" onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}>
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            上一步
                        </Button>
                    )}
                </div>
                <div>
                    {currentStep !== 3 && (
                        <Button
                            onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                            disabled={!canProceedToNextStep()}
                        >
                            下一步
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

function useInputList(initialValue: string[]) {
    const [list, setList] = useState<string[]>(initialValue);

    const add = () => setList([...list.filter(url => url !== ''), '']);
    const remove = (index: number) => setList(list.filter((_, i) => i !== index));
    const update = (index: number, value: string) => {
        const newList = [...list];
        newList[index] = value;
        setList(newList);
    };

    return { list, add, remove, update };
}
