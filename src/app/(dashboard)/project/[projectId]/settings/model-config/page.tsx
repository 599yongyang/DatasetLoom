'use client';
import { useParams } from 'next/navigation';
import { ProviderIcon } from '@lobehub/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, Edit, Languages, Plus, ScanEye, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import type { ModelConfig } from '@prisma/client';
import { ModelDialog } from '@/components/settings/model-dialog';
import { ConfirmAlert } from '@/components/confirm-alert';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { modelConfigListAtom, selectedModelInfoAtom } from '@/atoms';

export default function Page() {
    let { projectId } = useParams();
    const { t } = useTranslation('project');
    const [models, setModels] = useState<ModelConfig[]>([]);
    const [open, setOpen] = useState(false);
    const [modelConfigList, setModelConfigList] = useAtom(modelConfigListAtom);
    const [selectedModelInfo, setSelectedModelInfo] = useAtom(selectedModelInfoAtom);
    const getModels = async () => {
        const res = await axios.get(`/api/project/${projectId}/model-config`);
        setModels(res.data.data);
        const list = res.data.data.filter((item: ModelConfig) => {
            const isOllama = item.providerName.toLowerCase() === 'ollama';
            const hasRequiredFields = item.modelName && item.endpoint;

            if (!hasRequiredFields) return false;

            if (!isOllama) {
                return Boolean(item.apiKey);
            }
            return true;
        });
        setModelConfigList(list);
    };
    const [currentModel, setCurrentModel] = useState<ModelConfig>({} as ModelConfig);
    const showEdit = (model: ModelConfig) => {
        setCurrentModel(model);
        setOpen(true);
    };

    const deleteModel = (modeId: string) => {
        axios
            .delete(`/api/project/${projectId}/model-config/${modeId}`)
            .then(response => {
                const data = modelConfigList.filter(item => item.id !== modeId);
                setModelConfigList(data);
                if (data.length > 0) {
                    setSelectedModelInfo(data[0] as ModelConfig);
                } else {
                    setSelectedModelInfo({} as ModelConfig);
                }

                toast.success('删除成功');
                getModels();
            })
            .catch(error => {
                toast.error('删除失败');
            });
    };

    useEffect(() => {
        getModels();
    }, []);

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="container mx-auto py-2 px-3 max-w-6xl">
                <div className="flex justify-between items-center mb-8">
                    <h1>{t('model_config.title')}</h1>
                    <Button onClick={() => setOpen(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        {t('model_config.add_btn')}
                    </Button>
                </div>

                <div className="space-y-4">
                    {models.map(model => (
                        <div
                            key={model.id}
                            className="overflow-hidden shadow-sm p-3 rounded-lg hover:shadow-md transition-all duration-300 group"
                        >
                            <div className="p-0">
                                <div className="flex items-center justify-between p-2">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                                            <ProviderIcon
                                                key={model.providerId}
                                                provider={model.providerId}
                                                size={40}
                                                type={'color'}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                                {model.modelName}
                                            </h3>
                                            <p className="text-muted-foreground text-sm">{model.providerName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {(model.apiKey && model.endpoint) ||
                                        (model.providerId === 'ollama' && model.endpoint && model.modelName) ? (
                                            <Badge
                                                variant="outline"
                                                className="gap-1 px-3 py-1 bg-green-50 text-green-600 border-green-200 font-normal"
                                            >
                                                <Check className="h-3.5 w-3.5" />
                                                {model.endpoint}
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="outline"
                                                className="gap-1 px-3 py-1 bg-amber-50 text-amber-600 border-amber-200 font-normal"
                                            >
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                {model.endpoint}
                                                {(() => {
                                                    const fields = [];
                                                    if (!model.modelName) fields.push(t('model'));
                                                    if (!model.apiKey && model.providerId !== 'ollama')
                                                        fields.push(t('api_key'));
                                                    if (fields.length === 0) return null;
                                                    return <span>未配置 {fields.join('、')}</span>;
                                                })()}
                                            </Badge>
                                        )}

                                        {model.type === 'text' ? (
                                            <Button variant="outline" className="font-normal">
                                                <Languages />
                                                {t('model_config.lan_model')}
                                            </Button>
                                        ) : (
                                            <Button variant="outline" className="font-normal">
                                                <ScanEye />
                                                {t('model_config.vision_model')}
                                            </Button>
                                        )}
                                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => showEdit(model)}
                                                className="h-9 w-9 rounded-full text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>

                                            <ConfirmAlert
                                                title={'确定要删除此模型配置吗？'}
                                                onConfirm={() => deleteModel(model.id)}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-full text-destructive hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </ConfirmAlert>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <ModelDialog open={open} getModels={getModels} setOpen={setOpen} model={currentModel} />
        </div>
    );
}
