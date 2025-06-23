import { AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React, { useEffect } from 'react';
import { PARSER_SERVICE_LIST } from '@/constants/parser';
import { useParams, useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { ParserConfig } from '@prisma/client';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import type { UploadFormDataType } from '@/app/(dashboard)/project/[projectId]/documents/upload/page';

const PARSER_SERVICES = [
    {
        id: 'native',
        name: '原生解析',
        description: '使用内置解析器，适合简单文档',
        icon: FileText,
        category: 'document',
        supportedInputs: ['local', 'webFile'],
        supportedTypes: ['pdf', 'docx', 'txt', 'md', 'epub'],
        requiresApiKey: false,
        features: ['快速处理', '基础文本提取']
    },
    ...PARSER_SERVICE_LIST
];
const items = [
    { value: 'auto', label: '自动', desc: '自动进行分块设置' },
    { value: 'custom', label: '自定义', desc: '可自定义分块规则参数' }
];
export default function StepTwo({
    uploadFormData,
    handleChange,
    parserConfigList
}: {
    uploadFormData: UploadFormDataType;
    handleChange: (field: string, value: any) => void;
    parserConfigList: ParserConfig[];
}) {
    const { projectId }: { projectId: string } = useParams();
    const router = useRouter();
    const { t } = useTranslation('chunk');
    const getAvailableServices = () => {
        return PARSER_SERVICES.filter(service => {
            if (!service.supportedInputs.includes(uploadFormData.sourceType)) return false;

            // 检查服务是否已配置（除了原生解析）
            if (service.id !== 'native') {
                const config = parserConfigList.find(
                    config => config.serviceId.toLowerCase() === service.id.toLowerCase()
                );
                if (!config?.apiKey) {
                    return false;
                }
            }

            if (uploadFormData.sourceType === 'local' && uploadFormData.selectedFiles.length > 0) {
                const fileExtensions = uploadFormData.selectedFiles.map(
                    file => file.name.split('.').pop()?.toLowerCase() || ''
                );
                return !service.supportedTypes || service.supportedTypes.some(type => fileExtensions.includes(type));
            }

            return true;
        });
    };
    useEffect(() => {
        if (uploadFormData.selectedService === '' && getAvailableServices().length > 0) {
            handleChange('selectedService', getAvailableServices()[0]?.id);
        }
    }, [getAvailableServices().length]);

    return (
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
                                onClick={() => router.push(`/project/${projectId}/settings/parser-config`)}
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
                                    uploadFormData.selectedService === service.id
                                        ? 'border-primary bg-primary/5 shadow-md'
                                        : 'border-muted hover:border-muted-foreground/50 hover:bg-muted/50'
                                }`}
                                onClick={() => handleChange('selectedService', service.id)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="mt-1">{service && <service.icon />}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-medium ">{service.name}</h4>
                                                {service.id !== 'native' && (
                                                    <Badge variant="outline" className="text-xs text-green-600">
                                                        已配置
                                                    </Badge>
                                                )}
                                            </div>
                                            {uploadFormData.selectedService === service.id && (
                                                <CheckCircle className="w-5 h-5 text-primary" />
                                            )}
                                        </div>
                                        <p className="text-muted-foreground text-sm mb-2">{service.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Separator />
            <div className={'space-y-4'}>
                <h4 className="font-medium">分块设置</h4>
                <div className="space-y-4">
                    <RadioGroup
                        className="gap-2 flex-1 flex"
                        value={uploadFormData.strategy}
                        onValueChange={value => handleChange('strategy', value)}
                    >
                        {items.map(item => (
                            <div
                                key={`${item.value}`}
                                className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none"
                            >
                                <RadioGroupItem value={item.value} className="order-1 after:absolute after:inset-0" />
                                <div className="grid grow gap-2">
                                    <Label htmlFor={`${item.value}`}>
                                        {t(`strategy_dialog.strategy.options.${item.value}.label`)}
                                    </Label>
                                    <p className="text-muted-foreground text-xs">
                                        {t(`strategy_dialog.strategy.options.${item.value}.desc`)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                {uploadFormData.strategy === 'custom' && (
                    <>
                        <div className="space-y-4">
                            <Label className={'text-sm'}>{t('strategy_dialog.separators')}</Label>
                            <Input
                                type={'text'}
                                value={uploadFormData.separators}
                                onChange={e => handleChange('separators', e.target.value)}
                            />
                        </div>

                        <div className="space-y-4">
                            <Label className={'text-sm'}>{t('strategy_dialog.chunk_size')}</Label>
                            <Input
                                type={'number'}
                                value={uploadFormData.chunkSize}
                                onChange={e => handleChange('chunkSize', e.target.value)}
                            />
                        </div>
                        <div className="space-y-4">
                            <Label className={'text-sm'}>{t('strategy_dialog.chunk_overlap')}</Label>
                            <Input
                                type={'number'}
                                value={uploadFormData.chunkOverlap}
                                onChange={e => handleChange('chunkOverlap', e.target.value)}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
