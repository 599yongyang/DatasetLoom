import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { RefreshCw, Key, Globe, Tag, Thermometer, Hash, ChevronsUpDown, Check, ChevronDownIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios, { AxiosError } from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { Slider } from '@/components/ui/slider';
import { SelectIcon } from '@radix-ui/react-select';
import type { LlmModels, LlmProviders, ModelConfig } from '@prisma/client';
import { ProviderIcon } from '@lobehub/icons';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai/index';
import { selectedModelInfoAtom } from '@/atoms';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import * as React from 'react';

export function ModelDialog({
    open,
    getModels,
    setOpen,
    model
}: {
    open: boolean;
    getModels: () => void;
    setOpen: (open: boolean) => void;
    model?: ModelConfig;
}) {
    const { projectId } = useParams();
    const { t } = useTranslation('project');
    const [providerList, setProviderList] = useState<LlmProviders[]>([]);
    const [modelList, setModelList] = useState<LlmModels[]>([]);
    const [modelData, setModelData] = useState<ModelConfig>({} as ModelConfig);
    const [selectedModelInfo, setSelectedModelInfo] = useAtom(selectedModelInfoAtom);
    const [value, setValue] = useState('');
    const [search, setSearch] = useState('');
    const [modelOpen, setModelOpen] = useState(false);
    // 使用 useEffect 监听 model 的变化
    useEffect(() => {
        if (model?.id) {
            setModelData({ ...model });
            getProviderModels(model.providerId);
        } else {
            setModelData({
                providerId: 'ollama',
                providerName: 'Ollama',
                endpoint: 'http://127.0.0.1:11434/api',
                apiKey: '',
                modelId: '',
                modelName: '',
                type: 'text',
                temperature: 0.7,
                maxTokens: 8192,
                topK: 0,
                topP: 0,
                status: 1
            } as ModelConfig);
            getProviderModels('ollama');
        }
    }, [model]);

    const [selectedProvider, setSelectedProvider] = useState<LlmProviders>({} as LlmProviders);

    // 获取提供商列表
    const getProvidersList = () => {
        axios.get('/api/llm/providers').then(response => {
            console.log('获取的模型列表:', response.data);
            setProviderList(response.data);
        });
    };

    const getProviderModels = (providerId: string) => {
        axios
            .get(`/api/llm/model?providerId=${providerId}`)
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
            const response = await axios.post('/api/llm/remote-models', modelData);
            console.log('获取的模型列表:', response.data);
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || '获取模型失败，请检查配置';
            toast.error(message);
            console.error('获取模型失败:', error);
            return [];
        }
    }

    // 同步模型列表到后端
    const refreshProviderModels = async () => {
        try {
            const data = await getNewModels();

            if (!data || data.length === 0) {
                toast.info('没有新的模型需要刷新');
                return;
            }

            setModelList(data);
            toast.success('刷新模型成功');

            const syncResponse = await axios.post('/api/llm/model', {
                newModels: data,
                providerId: selectedProvider.id
            });

            if (syncResponse.status === 200) {
                toast.success('同步模型成功');
            } else {
                toast.warning('模型同步未返回成功状态码');
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
        if (!modelData.endpoint) {
            toast.warning('请输入接口地址');
            return;
        }
        axios
            .post(`/api/project/${projectId}/model-config`, modelData)
            .then(response => {
                setSelectedModelInfo(response.data);
                toast.success('保存成功');
                getModels();
                setOpen(false);
            })
            .catch(error => {
                toast.error('保存失败');
                console.error(error);
            });
    };

    useEffect(() => {
        getProvidersList();
    }, []);

    const handleChange = (field: string, value: string | number) => {
        setModelData(prev => ({ ...prev, [field]: value }));
        if (field === 'modelId') {
            const model = modelList.find(model => model.modelId === value);
            if (model) {
                setModelData(prev => ({ ...prev, modelName: model.modelName }));
            }
        }
    };

    const onChangeProvider = (newValue: string) => {
        const provider = providerList.find(item => item.id === newValue);
        if (provider) {
            setSelectedProvider(provider);
            handleChange('endpoint', provider.apiUrl);
            handleChange('providerName', provider.name);
        }
        handleChange('providerId', newValue);
        getProviderModels(newValue);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{model?.id ? t('model_dialog.edit_title') : t('model_dialog.add_title')}</DialogTitle>
                </DialogHeader>
                <div className="pt-2 pb-6 space-y-4 relative z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1.5">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <Label htmlFor="provider" className="font-medium text-base">
                                {t('model_dialog.provider')}
                            </Label>
                        </div>
                        <div className="relative">
                            <Select value={modelData.providerId} onValueChange={value => onChangeProvider(value)}>
                                <SelectTrigger className=" w-full">
                                    <SelectValue placeholder="选择模型提供商" />
                                </SelectTrigger>
                                <SelectContent>
                                    {providerList.map(item => (
                                        <SelectItem key={item.id} className={'h-10 text-sm'} value={item.id}>
                                            <SelectIcon>
                                                <ProviderIcon
                                                    key={item.id}
                                                    provider={item.id}
                                                    size={40}
                                                    type={'color'}
                                                />
                                            </SelectIcon>
                                            {item.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1.5">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <Label htmlFor="endpoint" className="font-medium text-base">
                                {t('model_dialog.api_url')}
                            </Label>
                        </div>
                        <div className="relative">
                            <Input
                                id="endpoint"
                                value={modelData.endpoint}
                                onChange={e => handleChange('endpoint', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1.5">
                            <Key className="h-4 w-4 text-muted-foreground" />
                            <Label htmlFor="apiKey" className="font-medium text-base">
                                {t('model_dialog.api_key')}
                            </Label>
                        </div>
                        <div className="relative">
                            <Input
                                id="apiKey"
                                type="password"
                                value={modelData.apiKey}
                                onChange={e => handleChange('apiKey', e.target.value)}
                                placeholder="sk-••••••••••••••••••••••••"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-7 gap-2 ">
                        <div className="space-y-2 md:col-span-5">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Tag className="h-4 w-4 text-muted-foreground" />
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
                                                <div className="flex items-center gap-2">{modelData.modelName}</div>
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
                                                                    handleChange('modelId', currentId);
                                                                    handleChange('modelName', modelConfig.modelName);
                                                                    setModelOpen(false);
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
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            <Label htmlFor="type" className="font-medium text-base">
                                {t('model_dialog.model_type')}
                            </Label>
                        </div>
                        <Select value={modelData.type} onValueChange={value => handleChange('type', value)}>
                            <SelectTrigger id="type" className="w-full">
                                <SelectValue placeholder="选择模型标签" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="text">{t('model_config.lan_model')}</SelectItem>
                                <SelectItem value="vision">{t('model_config.vision_model')}</SelectItem>
                            </SelectContent>
                        </Select>
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
                        {' '}
                        {t('model_dialog.save_btn')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
