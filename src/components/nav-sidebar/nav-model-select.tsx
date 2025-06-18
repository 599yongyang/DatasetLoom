'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useModelConfigSelect } from '@/hooks/query/use-llm';
import { useParams } from 'next/navigation';
import { ModelSelect } from '@/components/common/model-select';

export function NavModelSelect() {
    let { projectId }: { projectId: string } = useParams();
    const [modelValue, setModelValue] = useState('');

    useEffect(() => {
        if (modelValue) {
            void handleModelDefaultChange(modelValue);
        }
    }, [modelValue]);

    const { refresh } = useModelConfigSelect(projectId);
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
    return <ModelSelect value={modelValue} setValue={setModelValue} />;
}
