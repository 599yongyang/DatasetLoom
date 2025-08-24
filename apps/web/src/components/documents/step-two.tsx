import { AlertTriangle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import { PARSER_SERVICE_LIST } from '@/constants/parser';
import { useParams, useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { ParserConfig } from '@/types/interfaces';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import type { UploadFormDataType } from '@/app/(dashboard)/project/[projectId]/common/upload/page';
import { Checkbox } from '@/components/ui/checkbox';
import { chunkStrategyOptions, cleanRuleOptions } from '@/constants/data-dictionary';

const PARSER_SERVICES = [
    {
        id: 'native',
        nameKey: 'upload_steps.parsers.native.name',
        descriptionKey: 'upload_steps.parsers.native.desc',
        icon: FileText,
        category: 'document',
        supportedInputs: ['local', 'webFile'],
        supportedTypes: ['pdf', 'docx', 'doc', 'txt', 'md', 'epub'],
        requiresApiKey: false,
        features: ['快速处理', '基础文本提取']
    },
    ...PARSER_SERVICE_LIST
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
    const { t } = useTranslation(['chunk', 'knowledge']);
    const tChunk = (key: string) => t(`chunk:${key}`);
    const tDocument = (key: string) => t(`knowledge:${key}`);
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

    useEffect(() => {
        console.log(uploadFormData.separators);
    }, [uploadFormData.separators]);
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
                        <RadioGroup className="gap-2" defaultValue="native"
                                    onValueChange={value => handleChange('selectedService', value)}>
                            {getAvailableServices().map(service => (
                                <div key={service.id}
                                     className=" border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                                    <RadioGroupItem
                                        value={service.id}
                                        className="order-1 after:absolute after:inset-0"
                                    />
                                    <div className="flex grow items-start gap-3">
                                        {service && <service.icon />}
                                        <div className="grid grow gap-2">
                                            <Label>
                                                {tDocument(service.nameKey)}
                                                {service.id !== 'native' && (
                                                    <Badge variant="outline" className="text-xs text-green-600">
                                                        已配置
                                                    </Badge>
                                                )}
                                            </Label>
                                            <p className="text-muted-foreground text-xs">
                                                {tDocument(service.descriptionKey)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </RadioGroup>
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
                        {chunkStrategyOptions.map(item => (
                            <div
                                key={`${item.value}`}
                                className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none"
                            >
                                <RadioGroupItem value={item.value} className="order-1 after:absolute after:inset-0" />
                                <div className="grid grow gap-2">
                                    <Label htmlFor={`${item.value}`}>
                                        {tChunk(`strategy_dialog.strategy.options.${item.value}.label`)}
                                    </Label>
                                    <p className="text-muted-foreground text-xs">
                                        {tChunk(`strategy_dialog.strategy.options.${item.value}.desc`)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                {uploadFormData.strategy === 'custom' && (
                    <>
                        <div className={'grid grid-cols-3 gap-4'}>
                            <div className="space-y-4">
                                <Label className={'text-sm'}>{tChunk('strategy_dialog.chunk_size')}</Label>
                                <Input
                                    type={'number'}
                                    value={uploadFormData.chunkSize}
                                    onChange={e => handleChange('chunkSize', Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-4">
                                <Label className={'text-sm'}>{tChunk('strategy_dialog.chunk_overlap')}</Label>
                                <Input
                                    type={'number'}
                                    value={uploadFormData.chunkOverlap}
                                    onChange={e => handleChange('chunkOverlap', Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-4">
                                <Label className={'text-sm'}>{tChunk('strategy_dialog.separators')}</Label>
                                <Input
                                    type={'text'}
                                    value={uploadFormData.separators.join(',')}
                                    placeholder={'多个请以逗号进行连接'}
                                    onChange={e => handleChange('separators', e.target.value.split(','))}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
            <Separator />
            <div className="space-y-4">
                <h4 className="font-medium">数据清洗规则</h4>
                <div className="grid grid-cols-4 gap-4">
                    {cleanRuleOptions.map((rule) => (
                        <div key={rule.id}
                             className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                            <Checkbox className="order-1 after:absolute after:inset-0"
                                      checked={uploadFormData.cleanRules.includes(rule.id)}
                                      onCheckedChange={(checked) => handleChange('cleanRules', checked ? [...uploadFormData.cleanRules, rule.id] : uploadFormData.cleanRules.filter(id => id !== rule.id))}
                            />
                            <div className="grid grow gap-2">
                                <Label>
                                    {rule.name}
                                </Label>
                                <p className="text-muted-foreground text-xs">
                                    {rule.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
