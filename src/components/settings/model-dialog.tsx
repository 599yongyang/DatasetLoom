import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { RefreshCw, Thermometer, Hash, ChevronsUpDown, Check } from 'lucide-react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { Slider } from '@/components/ui/slider';
import type { LlmModels, LlmProviders, ModelConfig } from '@prisma/client';
import { ModelIcon } from '@lobehub/icons';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { DEFAULT_MODEL_SETTINGS } from '@/constants/model';
import { useModelConfigSelect } from '@/hooks/query/use-llm';
import MultipleSelector, { type Option } from '@/components/ui/multiselect';
import { ModelConfigType } from '@/server/db/types';

const Ability: Option[] = [
    {
        value: ModelConfigType.TEXT,
        label: '对话能力'
    },
    {
        value: ModelConfigType.VISION,
        label: '视觉能力'
    },
    {
        value: ModelConfigType.COT,
        label: '推理能力'
    },
    {
        value: ModelConfigType.TOOL,
        label: '工具能力'
    },
    {
        value: ModelConfigType.EMBED,
        label: '嵌入能力'
    }
];

export function ModelDialog({
    open,
    setOpen,
    provider,
    model,
    refresh
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    provider: LlmProviders;
    model?: ModelConfig;
    refresh: () => void;
}) {
    const { projectId }: { projectId: string } = useParams();
    const { t } = useTranslation('project');
    const [modelList, setModelList] = useState<LlmModels[]>([]);
    const [modelData, setModelData] = useState<ModelConfig>({} as ModelConfig);
    const [value, setValue] = useState('');
    const [search, setSearch] = useState('');
    const [modelOpen, setModelOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<LlmProviders>({} as LlmProviders);
    const { refresh: refreshModelSelect } = useModelConfigSelect(projectId);
    const [abilityValue, setAbilityValue] = useState<Option[]>([]);
    const getProviderModels = () => {
        axios
            .get(`/api/ai/model?providerName=${provider.name}`)
            .then(response => {
                setModelList(response.data);
            })
            .catch(error => {
                toast.error('获取模型列表失败');
            });
    };

    // 获取远程模型列表
    async function getNewModels() {
        try {
            const response = await axios.post('/api/ai/remote-models', {
                providerName: provider.name,
                interfaceType: provider.interfaceType,
                apiUrl: provider.apiUrl,
                apiKey: provider.apiKey
            });
            console.log('获取的模型列表:', response.data);
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || '刷新失败，请检查Api地址与密钥配置是否正确';
            toast.error(message);
            console.error('获取模型失败:', error);
            return -1;
        }
    }

    // 同步模型列表到后端
    const refreshProviderModels = async () => {
        try {
            const data = await getNewModels();
            console.log('同步的模型列表:', data);
            if (typeof data === 'number') {
                return;
            }

            setModelList(data);
            toast.success('刷新模型成功');

            const syncResponse = await axios.post('/api/ai/model', {
                newModels: data,
                providerId: selectedProvider.id
            });
            if (syncResponse.status === 200) {
                console.log('同步模型成功');
            }
        } catch (error: any) {
            const message = error.message || '同步模型失败';
            toast.error(message);
            console.error('同步模型失败:', error);
        }
    };
    // 保存模型
    const handleSaveModel = () => {
        if (!modelData.modelId) {
            toast.warning('请选择模型');
            return;
        }
        axios
            .post(`/api/project/${projectId}/model-config`, {
                ...modelData,
                providerId: provider.id,
                projectId,
                type: abilityValue.map(item => item.value).join(',')
            })
            .then(response => {
                refresh();
                void refreshModelSelect();
                toast.success('保存成功');
                setOpen(false);
            })
            .catch(error => {
                toast.error('保存失败');
                console.error(error);
            });
    };

    useEffect(() => {
        if (model?.id) {
            setModelData({ ...model });
            setAbilityValue(
                model.type.split(',').map(
                    item =>
                        Ability.find(ability => ability.value === item) || {
                            value: 'unknown',
                            label: '未知能力'
                        }
                )
            );
        } else {
            setModelData({
                maxTokens: DEFAULT_MODEL_SETTINGS.maxTokens,
                temperature: DEFAULT_MODEL_SETTINGS.temperature
            } as ModelConfig);
        }
        getProviderModels();
    }, [provider, model]);

    const handleSelectChange = (modelId: string) => {
        const model = modelList.find(model => model.modelId === modelId);
        if (model) {
            setModelData(prev => ({ ...prev, modelName: model.modelName, modelId }));
        }
    };
    const handleChange = (field: string, value: string | number) => {
        setModelData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{model?.id ? t('model_dialog.edit_title') : t('model_dialog.add_title')}</DialogTitle>
                </DialogHeader>
                <div className="pt-2 pb-6 space-y-4 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-2 ">
                        <div className="space-y-2 md:col-span-5">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Label htmlFor="modelId" className="font-medium text-base">
                                    {t('model_dialog.model_name')}
                                </Label>
                            </div>
                            <div className="relative">
                                <Popover open={modelOpen} onOpenChange={setModelOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
                                            className="w-[380px] justify-between"
                                        >
                                            {modelData.modelId ? (
                                                <div className="flex items-center gap-2">
                                                    <ModelIcon model={modelData.modelId} type={'color'} size={20} />
                                                    {modelData.modelId}
                                                </div>
                                            ) : (
                                                '选择模型'
                                            )}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[380px] p-0">
                                        <Command shouldFilter={false}>
                                            <CommandInput
                                                value={search}
                                                placeholder="搜索模型..."
                                                onValueChange={setSearch}
                                            />
                                            <CommandList>
                                                <CommandEmpty>没有找到相关模型...</CommandEmpty>
                                                <CommandGroup>
                                                    {modelList
                                                        .filter(modelConfig =>
                                                            modelConfig.modelName
                                                                .toLowerCase()
                                                                .includes(search.toLowerCase())
                                                        )
                                                        .map(modelConfig => (
                                                            <CommandItem
                                                                key={modelConfig.id + modelConfig.modelId}
                                                                value={modelConfig.modelId}
                                                                onSelect={currentId => {
                                                                    handleSelectChange(currentId);
                                                                    setModelOpen(false);
                                                                }}
                                                            >
                                                                <div className="flex items-center justify-between w-full">
                                                                    <div className="flex items-center gap-2">
                                                                        <ModelIcon
                                                                            model={modelConfig.modelId}
                                                                            type={'color'}
                                                                            size={20}
                                                                        />
                                                                        {modelConfig.modelName}
                                                                    </div>
                                                                    <Check
                                                                        className={cn(
                                                                            'mr-2 h-4 w-4',
                                                                            value === modelConfig.modelId
                                                                                ? 'opacity-100'
                                                                                : 'opacity-0'
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
                            </div>
                        </div>

                        <div className="md:col-span-2 flex items-end">
                            <Button onClick={() => refreshProviderModels()}>
                                <RefreshCw className="h-4 w-4" />
                                {t('model_dialog.refresh_btn')}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1.5">
                            <Label className="font-medium text-base">{t('model_dialog.model_id')}</Label>
                            <Label className="text-xs text-muted-foreground">{t('model_dialog.model_id_info')}</Label>
                        </div>
                        <Input value={modelData.modelId} onChange={e => handleChange('modelId', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1.5">
                            <Label className="font-medium text-base">{t('model_dialog.model_name')}</Label>
                        </div>
                        <Input value={modelData.modelName} onChange={e => handleChange('modelName', e.target.value)} />
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1.5">
                            <Label htmlFor="type" className="font-medium text-base">
                                {t('model_dialog.model_type')}
                            </Label>
                        </div>
                        <MultipleSelector
                            value={abilityValue}
                            onChange={options => {
                                setAbilityValue(options);
                            }}
                            defaultOptions={Ability}
                            placeholder="选择模型能力"
                            hideClearAllButton
                            hidePlaceholderWhenSelected
                            emptyIndicator={<p className="text-center text-sm">No results found</p>}
                        />
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Thermometer className="h-4 w-4 text-muted-foreground" />
                                    <Label className="font-medium text-base">{t('model_dialog.temperature')}</Label>
                                </div>
                                <span className="font-medium text-lg text-primary">{modelData.temperature}</span>
                            </div>
                            <div className="px-1">
                                <Slider
                                    value={[modelData.temperature]}
                                    min={0}
                                    max={2}
                                    step={0.1}
                                    onValueChange={value => handleChange('temperature', value[0] ?? 1)}
                                    className="py-2"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>{t('model_dialog.temperature_accurate')}</span>
                                    <span>{t('model_dialog.temperature_balance')}</span>
                                    <span>{t('model_dialog.temperature_creative')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Hash className="h-4 w-4 text-muted-foreground" />
                                    <Label className="font-medium text-base"> {t('model_dialog.max_token')}</Label>
                                </div>
                                <span className="font-medium text-lg text-primary">{modelData.maxTokens}</span>
                            </div>
                            <div className="px-1">
                                <Slider
                                    value={[modelData.maxTokens]}
                                    min={1024}
                                    max={32768}
                                    step={1024}
                                    onValueChange={value => handleChange('maxTokens', value[0] ?? 1024)}
                                    className="py-2"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>1K</span>
                                    <span>8K</span>
                                    <span>16K</span>
                                    <span>24K</span>
                                    <span>32K</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 py-2 border-t bg-muted/10 relative z-10">
                    <Button onClick={() => setOpen(false)} variant="outline">
                        {t('model_dialog.cancel_btn')}
                    </Button>
                    <Button className="font-medium" onClick={() => handleSaveModel()}>
                        {t('model_dialog.save_btn')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
