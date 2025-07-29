'use client';

import { Fragment, useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAtomValue } from 'jotai';
import { Check, ChevronsUpDown } from 'lucide-react';
import { ModelIcon } from '@lobehub/icons';
import type { ModelConfigType } from '@/lib/data-dictionary';
import type { ModelConfig } from '@prisma/client';

import { cn, onWheel } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { modelConfigListAtom, selectedModelInfoAtom } from '@/atoms';
import * as React from 'react';
import { ModelTypeIconMap } from '@/components/icons';

interface ModelSelectProps {
    value: string;
    setValue: (value: string) => void;
    showConfigButton?: boolean;
    filter?: ModelConfigType;
    className?: string;
}

export function ModelSelect({ value, setValue, showConfigButton = true, filter, className }: ModelSelectProps) {
    const { projectId } = useParams();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const modelConfigList = useAtomValue(modelConfigListAtom);
    const selectedModelInfo = useAtomValue(selectedModelInfoAtom);

    // Filter models based on the filter prop
    const filteredModels = useMemo(() => {
        return modelConfigList
            .filter(modelConfig => !filter || modelConfig.type.includes(filter))
            .filter(modelConfig => modelConfig.modelName.includes(search));
    }, [modelConfigList, search, filter]);

    // Group models by provider
    const groupedModels = useMemo(() => {
        return filteredModels.reduce(
            (acc, model: any) => {
                const key = model.provider.name;
                if (!acc[key]) acc[key] = [];
                acc[key].push(model);
                return acc;
            },
            {} as Record<string, ModelConfig[]>
        );
    }, [filteredModels]);

    useEffect(() => {
        if (!value && selectedModelInfo?.id) {
            setValue(selectedModelInfo.id);
        }
    }, [value, selectedModelInfo, setValue]);

    const handleModelSelect = (currentId: string) => {
        setValue(currentId);
        setOpen(false);
    };

    const handleConfigNavigation = () => {
        router.push(`/project/${projectId}/settings/model-config`);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn('justify-between', className)}
                >
                    {modelConfigList
                        .filter(modelConfig => !filter || modelConfig.type.includes(filter))
                        .find(modelConfig => modelConfig.id === value) ? (
                        <div className="flex items-center gap-2">
                            <ModelIcon
                                model={modelConfigList.find(modelConfig => modelConfig.id === value)?.modelId}
                                size={20}
                                type="color"
                            />
                            {modelConfigList.find(modelConfig => modelConfig.id === value)?.modelName}
                        </div>
                    ) : (
                        '选择模型'
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 min-w-[300px]" onWheel={onWheel}>
                <Command shouldFilter={false}>
                    <CommandInput value={search} placeholder="搜索模型..." onValueChange={setSearch} />
                    <CommandList>
                        <CommandEmpty>
                            <p className="pb-1">未找到此模型</p>
                            {showConfigButton && (
                                <Button
                                    variant="link"
                                    className="hover:cursor-pointer"
                                    onClick={handleConfigNavigation}
                                >
                                    前往模型页面配置
                                </Button>
                            )}
                        </CommandEmpty>

                        {Object.entries(groupedModels).map(([providerName, modelConfigs]) => (
                            <CommandGroup key={providerName} heading={providerName}>
                                {modelConfigs.map(config => (
                                    <CommandItem key={config.id} value={config.id} onSelect={handleModelSelect}>
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-2 pr-2">
                                                <ModelIcon model={config.modelId} size={20} type="color" />
                                                {config.modelName}
                                                {config.type.split(',').map(type => (
                                                    <React.Fragment key={type}>
                                                        {ModelTypeIconMap[type as keyof typeof ModelTypeIconMap] ||
                                                            null}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                            <Check
                                                className={cn(
                                                    'mr-2 h-4 w-4',
                                                    value === config.id ? 'opacity-100' : 'opacity-0'
                                                )}
                                            />
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
