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
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { ModelIcon } from '@lobehub/icons';
import axios from 'axios';
import { datasetWorkFlowAtom, questionsWorkFlowAtom } from '@/atoms/workflow';
import { useModelConfigSelect } from '@/hooks/query/use-llm';

export function ModelSelect({ type }: { type: 'head' | 'workflow-question' | 'workflow-dataset' }) {
    let { projectId } = useParams();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const modelConfigList = useAtomValue(modelConfigListAtom);
    const [selectedModelInfo, setSelectedModelInfo] = useAtom(selectedModelInfoAtom);
    const setQuestionsWorkFlow = useSetAtom(questionsWorkFlowAtom);
    const setDatasetWorkFlow = useSetAtom(datasetWorkFlowAtom);
    const [value, setValue] = useState('');
    const [search, setSearch] = useState('');
    const [modelName, setModelName] = useState('');
    const { refresh } = useModelConfigSelect(projectId as string);
    const handleModelDefaultChange = (modelId: string) => {
        axios
            .patch(`/api/project/${projectId}/model-config/${modelId}`)
            .then(res => {
                console.log('设置默认模型成功');
                void refresh();
            })
            .catch(error => {
                console.log(error, '设置默认模型失败');
            });
    };

    useEffect(() => {
        if (value && type === 'head') {
            void handleModelDefaultChange(value);
        } else if (value && type === 'workflow-question') {
            let modelConfig = modelConfigList.find(modelConfig => modelConfig.id === value);
            if (modelConfig) {
                const { modelName, id: modelConfigId, temperature, maxTokens } = modelConfig;
                setQuestionsWorkFlow(prev => ({ ...prev, modelName, modelConfigId, temperature, maxTokens }));
                setModelName(modelName);
            }
        } else if (value && type === 'workflow-dataset') {
            let modelConfig = modelConfigList.find(modelConfig => modelConfig.id === value);
            if (modelConfig) {
                const { modelName, id: modelConfigId, temperature, maxTokens } = modelConfig;
                setDatasetWorkFlow(prev => ({ ...prev, modelName, modelConfigId, temperature, maxTokens }));
                setModelName(modelName);
            }
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
                <Button variant="outline" role="combobox" aria-expanded={open} className=" w-full justify-between">
                    {modelConfigList.find(modelConfig => modelConfig.id === value) ? (
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
                                .map((modelConfig: any) => (
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
