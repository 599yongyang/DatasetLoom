'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { modelConfigListAtom, selectedModelInfoAtom } from '@/atoms';
import { useAtom, useAtomValue } from 'jotai';
import { ProviderIcon } from '@lobehub/icons';
import axios from 'axios';
import { type ModelConfig } from '@prisma/client';

export function ModelSelect() {
    let { projectId } = useParams();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const modelConfigList = useAtomValue(modelConfigListAtom);
    const [selectedModelInfo, setSelectedModelInfo] = useAtom(selectedModelInfoAtom);
    const [value, setValue] = useState('');
    const [search, setSearch] = useState('');
    const [modelName, setModelName] = useState('');
    const updateDefaultModel = async (id: string) => {
        if (!projectId) return;
        const res = await axios.put(`/api/project/${projectId}`, { defaultModelConfigId: id });
        if (res.status === 200) {
            let modelConfig = modelConfigList.find(modelConfig => modelConfig.id === id);
            setSelectedModelInfo(modelConfig as ModelConfig);
            console.log('更新成功');
        }
    };

    useEffect(() => {
        if (value) {
            updateDefaultModel(value);
        }
    }, [value]);

    useEffect(() => {
        if (selectedModelInfo && selectedModelInfo.id) {
            setValue(selectedModelInfo.id);
            setModelName(selectedModelInfo.modelName);
        }
    }, [selectedModelInfo]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-[350px] justify-between">
                    {value ? (
                        <div className="flex items-center gap-2">
                            <ProviderIcon
                                provider={modelConfigList.find(modelConfig => modelConfig.id === value)?.providerId}
                                size={20}
                                type="color"
                            />
                            {modelName}
                        </div>
                    ) : (
                        '选择模型'
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
                <Command shouldFilter={false}>
                    <CommandInput value={search} placeholder="搜索模型..." onValueChange={setSearch} />
                    <CommandList>
                        <CommandEmpty>
                            <p className={'pb-1'}>暂无可用模型</p>
                            <Button
                                variant="link"
                                className="hover:cursor-pointer"
                                onClick={() => router.push(`/project/${projectId}/settings/model-config`)}
                            >
                                前往模型页面配置
                            </Button>
                        </CommandEmpty>
                        <CommandGroup>
                            {modelConfigList
                                .filter(modelConfig =>
                                    modelConfig.modelName.toLowerCase().includes(search.toLowerCase())
                                )
                                .map(modelConfig => (
                                    <CommandItem
                                        key={modelConfig.id}
                                        value={modelConfig.id} // 这里保持使用id作为value
                                        onSelect={currentId => {
                                            setValue(currentId);
                                            setOpen(false);
                                        }}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-2">
                                                <ProviderIcon
                                                    provider={modelConfig.providerId}
                                                    size={20}
                                                    type="color"
                                                />
                                                {modelConfig.modelName}
                                            </div>
                                            <Check
                                                className={cn(
                                                    'mr-2 h-4 w-4',
                                                    value === modelConfig.id ? 'opacity-100' : 'opacity-0'
                                                )}
                                            />
                                        </div>
                                    </CommandItem>
                                ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
