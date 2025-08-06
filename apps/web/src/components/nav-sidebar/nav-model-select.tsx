'use client';

import * as React from 'react';
import {useEffect, useState} from 'react';
import {useParams} from 'next/navigation';
import {ModelSelect} from '@/components/common/model-select';
import {useModelConfigSelect} from '@/hooks/query/use-model-config';
import apiClient from "@/lib/axios";

export function NavModelSelect() {
    let {projectId}: { projectId: string } = useParams();
    const [modelValue, setModelValue] = useState('');

    useEffect(() => {
        if (modelValue) {
            void handleModelDefaultChange(modelValue);
        }
    }, [modelValue]);

    const {refresh} = useModelConfigSelect(projectId);
    const handleModelDefaultChange = (modelId: string) => {
        apiClient.patch(`/${projectId}/model-config/setDefault`, {modelId})
            .then(res => {
                console.log('设置默认模型成功');
                void refresh();
            })
            .catch(error => {
                console.log(error, '设置默认模型失败');
            });
    };
    return <ModelSelect value={modelValue} setValue={setModelValue}/>;
}
