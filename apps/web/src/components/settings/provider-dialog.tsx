import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useParams} from 'next/navigation';
import * as React from 'react';
import {ImagePlusIcon} from 'lucide-react';
import {ModelProvider, ProviderIcon} from '@lobehub/icons';
import {Popover, PopoverTrigger} from '../ui/popover';
import {PopoverContent} from '@/components/ui/popover';
import {useEffect, useState} from 'react';
import type {ModelProviders} from '@/types/interfaces';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {toast} from 'sonner';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {onWheel} from '@/lib/utils';
import apiClient from "@/lib/axios";

export function ProviderDialog({
                                   open,
                                   setOpen,
                                   refresh
                               }: {
    open: boolean;
    setOpen: (open: boolean) => void;
    refresh: () => void;
}) {
    const {projectId}: { projectId: string } = useParams();
    const defaultProvider = {
        icon: '',
        name: '',
        apiKey: '',
        apiUrl: '',
        interfaceType: 'openAICompatible',
        projectId: projectId
    } as ModelProviders;
    const [provider, setProvider] = useState<ModelProviders>(defaultProvider);
    const handleChange = (field: string, value: string | number) => {
        setProvider(prev => ({...prev, [field]: value}));
    };
    useEffect(() => {
        setProvider(defaultProvider);
    }, [open]);

    const handleSubmit = () => {
        if (!provider.name) {
            toast.error('请填写模型名称');
            return;
        }
        apiClient.post(`/${projectId}/providers/create`, {...provider})
            .then(_ => {
                toast.success('保存成功');
                setOpen(false);
                refresh();
            })
            .catch(error => {
                console.error(error);
                toast.error(`保存失败:${error.response.data.error}`);
            });
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent
                className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
                <AlertDialogHeader className="contents space-y-0 text-left">
                    <AlertDialogTitle className="border-b px-6 py-4 text-base">添加服务商</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="overflow-y-auto">
                    <div className="px-6 flex flex-1 items-center justify-between">
                        <div
                            className="border-background bg-muted relative flex size-18 items-center justify-center overflow-hidden rounded-full border-4 shadow-xs shadow-black/10">
                            {provider.icon && <ProviderIcon provider={provider.icon} size={60} type={'avatar'}/>}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        size={'icon'}
                                        className="focus-visible:border-ring focus-visible:ring-ring/50 absolute flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
                                    >
                                        <ImagePlusIcon size={16} aria-hidden="true"/>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 h-100 overflow-y-auto" onWheel={onWheel}>
                                    <div className={'grid grid-cols-5 gap-4 p-2.5'}>
                                        {Object.values(ModelProvider).map(item => (
                                            <div
                                                key={item}
                                                onClick={() => {
                                                    handleChange('icon', item);
                                                    handleChange('name', item);
                                                }}
                                            >
                                                <ProviderIcon key={item} provider={item} size={34} type={'avatar'}/>
                                            </div>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                        {provider.icon && <ProviderIcon provider={provider.icon} size={40} type={'combine-color'}/>}
                    </div>
                    <div className="px-6 pt-4 pb-6">
                        <div className="p-1">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Label className="font-medium text-base">服务商名称</Label>
                            </div>
                            <Input value={provider.name} onChange={e => handleChange('name', e.target.value)}/>
                        </div>
                        <div className="p-1">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Label htmlFor="type" className="font-medium text-base">
                                    接口类型
                                </Label>
                            </div>
                            <Select
                                value={provider.interfaceType}
                                onValueChange={value => handleChange('interfaceType', value)}
                            >
                                <SelectTrigger id="interfaceType" className="w-full">
                                    <SelectValue placeholder="选择接口类型"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="openAICompatible">OpenAI兼容接口</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="p-1">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Label className="font-medium text-base">API 地址</Label>
                            </div>
                            <Input value={provider.apiUrl} onChange={e => handleChange('apiUrl', e.target.value)}/>
                        </div>
                        <div className="p-1">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Label className="font-medium text-base">API Key</Label>
                            </div>
                            <Input value={provider.apiKey} onChange={e => handleChange('apiKey', e.target.value)}/>
                        </div>
                    </div>
                </div>
                <AlertDialogFooter className="border-t px-6 py-4">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        取消
                    </Button>
                    <Button type="button" onClick={handleSubmit}>
                        保存
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
