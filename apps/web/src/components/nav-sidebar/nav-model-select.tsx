'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ModelSelect } from '@/components/common/model-select';
import apiClient from '@/lib/axios';
import { ModelConfigType } from '@repo/shared-types';
import { useAtom, useAtomValue } from 'jotai/index';
import { modelConfigListAtom, selectedModelInfoAtom } from '@/atoms';

export function NavModelSelect() {
    const { projectId }: { projectId: string } = useParams();
    const [model, setModel] = useAtom(selectedModelInfoAtom);
    const modelList = useAtomValue(modelConfigListAtom);
    const [modelValue, setModelValue] = useState('');

    const handleModelChange = async (newModelId: string) => {
        try {
            await apiClient.patch(`/${projectId}/model-config/setDefault`, { modelId: newModelId });
            console.log('设置默认模型成功');
            setModelValue(newModelId);
            setModel(modelList.find(item => item.id === newModelId)!);
        } catch (error) {
            console.error('设置默认模型失败:', error);
        }
    };

    return <ModelSelect value={model.id ?? modelValue} setValue={handleModelChange} exclude={ModelConfigType.EMBED} />;
}
