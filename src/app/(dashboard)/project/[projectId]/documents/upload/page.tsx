'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Cpu, FileText, Settings, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StepOne from '@/components/documents/step-one';
import StepTwo from '@/components/documents/step-two';
import StepThree from '@/components/documents/step-three';
import StepFour from '@/components/documents/step-four';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetParserConfig } from '@/hooks/query/use-parser-config';
import { useAtomValue } from 'jotai/index';
import { chunkConfigHashAtom } from '@/atoms';
import { useTranslation } from 'react-i18next';

export interface UploadFormDataType {
    sourceType: string;
    selectedFiles: File[];
    webFileUrls: string[];
    webUrls: string[];
    selectedService: string;
    strategy: string;
    separators: string;
    chunkSize: number;
    chunkOverlap: number;
}

export default function Page() {
    const { projectId }: { projectId: string } = useParams();
    const { t } = useTranslation('document');
    const router = useRouter();
    const { data: parserConfigList } = useGetParserConfig(projectId);
    const chunkConfigHash = useAtomValue(chunkConfigHashAtom);
    const [currentStep, setCurrentStep] = useState(1);
    const [uploadFormData, setUploadFormData] = useState<UploadFormDataType>({
        sourceType: 'local',
        selectedFiles: [],
        webFileUrls: [],
        webUrls: [],
        selectedService: '',
        strategy: 'auto',
        separators: '',
        chunkSize: 3000,
        chunkOverlap: 150
    });

    const steps = [
        { id: 1, title: t('upload_steps.one.title'), description: t('upload_steps.one.desc') },
        { id: 2, title: t('upload_steps.two.title'), description: t('upload_steps.two.desc') },
        { id: 3, title: t('upload_steps.three.title'), description: t('upload_steps.three.desc') },
        { id: 4, title: t('upload_steps.four.title'), description: t('upload_steps.four.desc') }
    ];
    const handleChange = (field: string, value: any) => {
        setUploadFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const canProceedToNextStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    (uploadFormData.sourceType === 'local' && uploadFormData.selectedFiles.length > 0) ||
                    (uploadFormData.sourceType === 'webUrl' &&
                        uploadFormData.webUrls.filter(url => url.trim() !== '').length > 0) ||
                    (uploadFormData.sourceType === 'webFile' &&
                        uploadFormData.webFileUrls.filter(url => url.trim() !== '').length > 0)
                );
            case 2:
                return (
                    uploadFormData.selectedService !== '' &&
                    uploadFormData.chunkSize > 0 &&
                    uploadFormData.chunkOverlap >= 0
                );
            case 3:
                return chunkConfigHash !== '';
            default:
                return true;
        }
    };

    useEffect(() => {
        console.log(uploadFormData);
    }, [uploadFormData]);
    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="w-full max-w-6xl mx-auto p-2 space-y-6">
                <div className="text-center space-y-2">
                    <p className=" font-bold">{t('upload_steps.title')}</p>
                </div>
                {parserConfigList.length === 0 && (
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className={'flex flex-1'}>
                            {t('upload_steps.upload_alert.pre')}{' '}
                            <Button
                                variant="link"
                                className="p-0 h-auto text-primary hover:cursor-pointer"
                                onClick={() => router.push(`/project/${projectId}/settings/parser-config`)}
                            >
                                {t('upload_steps.upload_alert.link')}
                            </Button>
                            {t('upload_steps.upload_alert.suffix')}
                        </AlertDescription>
                    </Alert>
                )}

                {/* 步骤指示器 */}
                <div className="relative mb-5">
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
                            {steps[currentStep - 1]?.title}
                        </CardTitle>
                        <CardDescription>{steps[currentStep - 1]?.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* 步骤 1: 选择内容来源 */}
                        {currentStep === 1 && <StepOne uploadFormData={uploadFormData} handleChange={handleChange} />}

                        {/* 步骤 2: 选择解析服务 */}
                        {currentStep === 2 && (
                            <StepTwo
                                uploadFormData={uploadFormData}
                                handleChange={handleChange}
                                parserConfigList={parserConfigList}
                            />
                        )}

                        {/* 步骤 3: 解析与结果 */}
                        {currentStep === 3 && <StepThree uploadFormData={uploadFormData} />}
                        {currentStep === 4 && <StepFour />}
                    </CardContent>
                </Card>

                {/* 导航按钮 */}
                <footer className="sticky bottom-0 left-0 right-0 z-10  bg-white ">
                    <div className=" flex justify-between px-10 ">
                        <div>
                            {currentStep !== 1 && (
                                <Button variant="outline" onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}>
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    {t('upload_steps.prev')}
                                </Button>
                            )}
                        </div>
                        <div>
                            {currentStep !== 4 && (
                                <Button
                                    onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                                    disabled={!canProceedToNextStep()}
                                >
                                    {t('upload_steps.next')}
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
