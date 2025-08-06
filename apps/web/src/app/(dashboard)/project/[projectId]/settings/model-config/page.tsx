'use client';

import {useEffect, useState} from 'react';
import {Search, Plus, Key, Globe, Edit, Trash2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Switch} from '@/components/ui/switch';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Label} from '@/components/ui/label';
import * as React from 'react';
import type {ModelProviders, ModelConfig} from '@prisma/client';
import {ModelIcon, ProviderIcon} from '@lobehub/icons';
import {useParams} from 'next/navigation';
import {toast} from 'sonner';
import PasswordInput from '@/components/ui/password-input';
import {ModelDialog} from '@/components/settings/model-dialog';
import {useGetModelConfig, useModelConfigSelect} from '@/hooks/query/use-model-config';
import {ConfirmAlert} from '@/components/common/confirm-alert';
import {ProviderDialog} from '@/components/settings/provider-dialog';
import {ModelTypeIconMap} from '@/components/icons';
import apiClient from "@/lib/axios";

export default function Page() {
    const {projectId}: { projectId: string } = useParams();

    const [selectedProvider, setSelectedProvider] = useState<ModelProviders>({} as ModelProviders);
    const [providerList, setProviderList] = useState<ModelProviders[]>([]);
    const [isChange, setIsChange] = useState(false);
    const [openModel, setOpenModel] = useState<boolean>(false);
    const [openProvider, setOpenProvider] = useState(false);
    const [model, setModel] = useState<ModelConfig>({} as ModelConfig);

    const {data: modelConfig, refresh: refreshModelConfig} = useGetModelConfig(projectId, selectedProvider.id);
    const {refresh} = useModelConfigSelect(projectId);
    const getProvidersList = () => {
        apiClient.get(`/${projectId}/providers`).then(response => {
            setProviderList(response.data.data);
            setSelectedProvider(response.data.data[0]);
        });
    };
    const deleteModel = (modeId: string) => {
        apiClient.delete(`/${projectId}/model-config/${modeId}`)
            .then(response => {
                toast.success('删除成功');
                void refreshModelConfig();
                void refresh();
            })
            .catch(error => {
                toast.error('删除失败');
            });
    };
    const handelChangeProvider = (provider: ModelProviders) => {
        setSelectedProvider(provider);
        setIsChange(false);
    };
    useEffect(() => {
        getProvidersList();
    }, []);

    const handleChange = (field: string, value: string) => {
        setSelectedProvider(prev => ({...prev, [field]: value}));
        setIsChange(true);
    };

    const handleSave = async () => {
        apiClient.patch(`/${projectId}/providers/update`, {...selectedProvider})
            .then(res => {
                toast.success('保存成功');
                getProvidersList();
                setIsChange(false);
            })
            .catch(error => {
                toast.error('保存失败');
            });
    };

    const handleModelStatusChange = (status: boolean, modelId: string) => {
        apiClient.patch(`/${projectId}/model-config/setStatus`, {id: modelId, status})
            .then(res => {
                toast.success('切换成功');
                void refreshModelConfig();
                void refresh();
            })
            .catch(error => {
                toast.error('切换失败');
                console.log(error);
            });
    };

    return (
        <div className="@container/main flex  gap-2">
            <div className="w-66  border-r  ">
                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"/>
                        <Input type="text" placeholder="搜索服务商..." className="pl-10 pr-10"/>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                            onClick={() => setOpenProvider(true)}
                        >
                            <Plus className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>

                <ScrollArea className="h-[calc(88vh-80px)]">
                    <div className="px-2">
                        {providerList.map(provider => (
                            <div
                                key={provider.id}
                                className={`flex items-center justify-between p-2.5 mx-2 mb-1 rounded-lg cursor-pointer transition-colors ${
                                    selectedProvider.id === provider.id
                                        ? 'bg-gray-300  border-blue-200 dark:bg-gray-500'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-500'
                                }`}
                                onClick={() => handelChangeProvider(provider)}
                            >
                                <div className="flex items-center space-x-3">
                                    <ProviderIcon key={provider.icon} provider={provider.icon} size={22}/>
                                    <span className="text-sm font-medium text-gray-700">{provider.name}</span>
                                </div>
                                {/*<Switch/>*/}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            <ScrollArea className="h-[88vh] flex-1">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <ProviderIcon key={selectedProvider.icon} provider={selectedProvider.icon} size={30}/>
                            <h1 className="text-2xl font-bold text-gray-900">{selectedProvider.name}</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/*<Switch/>*/}
                            {isChange && (
                                <Button size={'sm'} onClick={handleSave}>
                                    保存
                                </Button>
                            )}
                        </div>
                    </div>
                    <Separator/>
                    <div className="pt-4 pb-6 space-y-4 relative z-10">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Key className="h-4 w-4 text-muted-foreground"/>
                                <Label htmlFor="apiKey" className="font-medium text-base">
                                    API Key
                                </Label>
                            </div>
                            <div style={{position: 'relative'}}>
                                <PasswordInput
                                    value={selectedProvider?.apiKey ?? ''}
                                    onChange={value => handleChange('apiKey', value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Globe className="h-4 w-4 text-muted-foreground"/>
                                <Label className="font-medium text-base">API 地址</Label>
                            </div>
                            <div className="relative">
                                <Input
                                    value={selectedProvider.apiUrl ?? ''}
                                    onChange={e => handleChange('apiUrl', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 mt-3">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg flex-1 flex justify-items-center items-center">
                                        <div>模型列表</div>
                                        {/*<div className="relative ml-2">*/}
                                        {/*    <Search*/}
                                        {/*        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"/>*/}
                                        {/*    <Input placeholder="搜索模型" className="pl-10 w-48 h-8"/>*/}
                                        {/*</div>*/}
                                    </CardTitle>

                                    <div className="flex items-center space-x-2">
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                setOpenModel(true);
                                                setModel({} as ModelConfig);
                                            }}
                                        >
                                            添加模型
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {modelConfig?.map(model => (
                                        <div
                                            key={model.id}
                                            className="flex items-center justify-between p-2.5 border rounded-lg"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <ModelIcon model={model.modelId} type={'color'} size={22}/>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{model.modelName}</h4>
                                                    <p className="text-sm text-gray-500">{model.modelId}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {model.type.split(',').map(type => (
                                                    <React.Fragment key={type}>
                                                        {ModelTypeIconMap[type as keyof typeof ModelTypeIconMap] ||
                                                            null}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <Switch
                                                    checked={model.status}
                                                    onCheckedChange={checked =>
                                                        handleModelStatusChange(checked, model.id)
                                                    }
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setOpenModel(true);
                                                        setModel(model);
                                                    }}
                                                >
                                                    <Edit/>
                                                </Button>
                                                <ConfirmAlert
                                                    title={'确定要删除此模型配置吗？'}
                                                    onConfirm={() => deleteModel(model.id)}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={`text-red-500 hover:cursor-pointer hover:text-red-500`}
                                                    >
                                                        <Trash2/>
                                                    </Button>
                                                </ConfirmAlert>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </ScrollArea>
            {selectedProvider && openModel && (
                <ModelDialog
                    open={openModel}
                    setOpen={setOpenModel}
                    provider={selectedProvider}
                    model={model}
                    refresh={refreshModelConfig}
                />
            )}
            <ProviderDialog open={openProvider} setOpen={setOpenProvider} refresh={getProvidersList}/>
        </div>
    );
}
