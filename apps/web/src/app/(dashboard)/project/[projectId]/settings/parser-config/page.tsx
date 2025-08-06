'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useParams} from 'next/navigation';
import {Globe, Shield, Key, AlertCircle} from 'lucide-react';
import {ScrollArea} from '@/components/ui/scroll-area';
import * as React from 'react';
import {PARSER_SERVICE_LIST} from '@/constants/parser';
import PasswordInput from '@/components/ui/password-input';
import {Separator} from '@/components/ui/separator';
import type {ParserConfig} from '@prisma/client';
import {Badge} from '@/components/ui/badge';
import {useGetParserConfig} from '@/hooks/query/use-parser-config';
import {toast} from 'sonner';
import {useTranslation} from 'react-i18next';
import apiClient from "@/lib/axios";

export default function ServiceConfigPage() {
    const {projectId}: { projectId: string } = useParams();
    const {t} = useTranslation('knowledge');
    const {data: parserConfigList, refresh} = useGetParserConfig(projectId);
    const defaultParser = parserConfigList.find(config => config.serviceId === PARSER_SERVICE_LIST[0]?.id);
    const [selectedParser, setSelectedParser] = useState(PARSER_SERVICE_LIST[0]);
    const [parserConfig, setParserConfig] = useState<ParserConfig>({
        apiUrl: defaultParser?.apiUrl || PARSER_SERVICE_LIST[0]?.baseUrl,
        serviceName: defaultParser?.serviceName || t(PARSER_SERVICE_LIST[0]!.nameKey),
        serviceId: defaultParser?.serviceId || PARSER_SERVICE_LIST[0]?.id,
        apiKey: defaultParser?.apiKey || ''
    } as ParserConfig);

    const handelChangeParser = (service: any) => {
        setSelectedParser(service);
        const data = parserConfigList.find(config => config.serviceId === service.id);
        setParserConfig({
            apiUrl: service.baseUrl,
            serviceName: service.id,
            serviceId: service.id,
            ...data
        } as ParserConfig);
    };
    const handleChange = (field: string, value: string) => {
        setParserConfig(prev => ({...prev, [field]: value}));
    };
    const getStatus = (id: string) => {
        const status = parserConfigList.find(config => config.serviceId === id);
        if (!status) {
            return (
                <Badge variant="outline" className={`text-xs text-yellow-600 bg-yellow-50 border-yellow-200`}>
                    未配置
                </Badge>
            );
        } else {
            return (
                <Badge variant="outline" className={`text-xs text-green-600 bg-green-50 border-green-200`}>
                    已配置
                </Badge>
            );
        }
    };

    const handelSave = () => {
        if (!parserConfig.apiKey || !parserConfig.apiUrl) {
            toast.warning('请填写API Key和API URL');
            return;
        }
        apiClient.post(`/${projectId}/parser-config`, parserConfig)
            .then(response => {
                toast.success('保存成功');
                void refresh();
            })
            .catch(error => {
                toast.error('保存失败');
            });
        console.log(parserConfig);
    };

    return (
        <>
            <div className="@container/main flex  gap-2">
                <div className="w-66  border-r  ">
                    <ScrollArea className="h-[calc(88vh-80px)]">
                        <div className="px-2">
                            {PARSER_SERVICE_LIST.map(service => (
                                <div
                                    key={service.id}
                                    className={`flex items-center justify-between p-2.5 mx-2 mb-1 rounded-lg cursor-pointer transition-colors ${
                                        selectedParser?.id === service.id
                                            ? 'bg-gray-300  border-blue-200 dark:bg-gray-500'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-500'
                                    }`}
                                    onClick={() => handelChangeParser(service)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <service.icon/>
                                        <span className="text-sm font-medium text-gray-700">{t(service.nameKey)}</span>
                                    </div>
                                    {/*<Switch/>*/}
                                    <div className="flex items-center gap-2">{getStatus(service.id)}</div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                <ScrollArea className="h-[88vh] flex-1">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                {selectedParser && (
                                    <>
                                        <selectedParser.icon className={'w-6 h-6 text-blue-500'}/>
                                        <h1 className="text-2xl font-bold text-gray-900">{t(selectedParser.nameKey)}</h1>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center space-x-4">
                                {/*<Switch/>*/}
                                <Button size={'sm'} onClick={handelSave}>
                                    保存
                                </Button>
                            </div>
                        </div>
                        <Separator/>
                        <div className="pt-4 pb-6 space-y-4 relative z-10">
                            {/* 基本配置 */}
                            <div className="space-y-6">
                                <div className="space-y-6">
                                    {/* API Key */}
                                    <div className="space-y-3">
                                        <Label className="text-base font-medium flex items-center gap-2">
                                            <Key className="w-4 h-4"/>
                                            API Key
                                        </Label>
                                        <PasswordInput
                                            placeholder={'••••••••••••••••••••••••'}
                                            value={parserConfig?.apiKey ?? ''}
                                            onChange={value => handleChange('apiKey', value)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-base font-medium flex items-center gap-2">
                                            <Globe className="w-4 h-4"/>
                                            服务地址
                                        </Label>
                                        <Input
                                            placeholder="https://your-instance.com/api"
                                            onChange={e => handleChange('apiUrl', e.target.value)}
                                            value={parserConfig?.apiUrl || selectedParser?.baseUrl}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            默认使用官方服务地址，如使用自部署实例请修改此地址
                                        </p>
                                    </div>

                                    {/* 连接测试 */}
                                    <div className="space-y-3">
                                        <div className="flex flex-col @sm:flex-row @sm:items-center gap-4"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                                        <Shield className="w-4 h-4 text-blue-600"/>
                                        安全说明
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        您的API密钥将安全存储在本地，不会发送到任何外部服务器。
                                        请确保不要与他人共享您的API密钥。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </>
    );
}
