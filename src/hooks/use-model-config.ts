import { useEffect } from 'react';
import axios from 'axios';
import { useSetAtom } from 'jotai';
import { modelConfigListAtom, selectedModelInfoAtom } from '@/atoms';
import { type ModelConfig } from '@prisma/client';

export const useModelConfig = (projectId: string) => {
    const setModelConfigList = useSetAtom(modelConfigListAtom);
    const setSelectedModelInfo = useSetAtom(selectedModelInfoAtom);

    useEffect(() => {
        axios
            .get(`/api/project/${projectId}/model-config`)
            .then(res => {
                const list = res.data.data.filter((item: ModelConfig) => {
                    const isOllama = item.providerName.toLowerCase() === 'ollama';
                    const hasRequiredFields = item.modelName && item.endpoint;

                    if (!hasRequiredFields) return false;

                    if (!isOllama) {
                        return Boolean(item.apiKey);
                    }
                    //ollama 只需要 modelName 和 endpoint
                    return true;
                });
                setModelConfigList(list);
                if (res.data.defaultModelConfigId) {
                    // @ts-ignore
                    const modelConfig = res.data.data.find(item => item.id === res.data.defaultModelConfigId);
                    setSelectedModelInfo(modelConfig);
                } else {
                    setSelectedModelInfo({} as ModelConfig);
                }
            })
            .catch(err => {
                console.log(err);
            });
    }, [projectId]);
};
