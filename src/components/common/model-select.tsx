'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { modelConfigListAtom, selectedModelInfoAtom } from '@/atoms';
import { useAtomValue } from 'jotai';
import { ModelIcon } from '@lobehub/icons';
import type { ModelConfigType } from '@/lib/data-dictionary';

export function ModelSelect({
    value,
    setValue,
    showConfigButton = true,
    filter,
    className
}: {
    value: string;
    setValue: (value: string) => void;
    showConfigButton?: boolean;
    filter?: ModelConfigType;
    className?: string;
}) {
    let { projectId } = useParams();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const modelConfigList = useAtomValue(modelConfigListAtom);
    const selectedModelInfo = useAtomValue(selectedModelInfoAtom);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!value && selectedModelInfo?.id) {
            setValue(selectedModelInfo.id);
        }
    }, [value, selectedModelInfo]);

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
            <PopoverContent className="w-full p-0">
                <Command shouldFilter={false}>
                    <CommandInput value={search} placeholder="搜索模型..." onValueChange={setSearch} />
                    <CommandList>
                        <CommandEmpty>
                            <p className={'pb-1'}>未找到此模型</p>
                            {showConfigButton && (
                                <Button
                                    variant="link"
                                    className="hover:cursor-pointer"
                                    onClick={() => router.push(`/project/${projectId}/settings/model-config`)}
                                >
                                    前往模型页面配置
                                </Button>
                            )}
                        </CommandEmpty>
                        <CommandGroup>
                            {modelConfigList
                                .filter(
                                    modelConfig =>
                                        modelConfig.modelName.toLowerCase().includes(search.toLowerCase()) &&
                                        (!filter || modelConfig.type.includes(filter))
                                )
                                .map((modelConfig: any) => (
                                    <CommandItem
                                        key={modelConfig.id}
                                        value={modelConfig.id}
                                        onSelect={currentId => {
                                            setValue(currentId);
                                            setOpen(false);
                                        }}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-2">
                                                <ModelIcon model={modelConfig.modelId} size={20} type="color" />
                                                {modelConfig.modelName} | {modelConfig.provider.name}
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
