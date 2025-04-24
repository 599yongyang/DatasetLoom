'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { InfoIcon as InfoCircle, Save } from 'lucide-react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function PromptConfig() {
    let { projectId } = useParams();
    const { t } = useTranslation('project');
    const [formData, setFormData] = useState({
        globalPrompt: '',
        questionPrompt: '',
        answerPrompt: '',
        labelPrompt: '',
        domainTreePrompt: ''
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.promise(
            axios.put(`/api/project/${projectId}`, {
                ...formData,
                id: projectId
            }),
            {
                success: '保存成功',
                error: error => {
                    return error.response?.data?.message || '保存失败';
                }
            }
        );
    };

    const getProjectInfo = () => {
        axios.get(`/api/project/${projectId}`).then(res => {
            setFormData({
                globalPrompt: res.data.globalPrompt,
                questionPrompt: res.data.questionPrompt,
                answerPrompt: res.data.answerPrompt,
                labelPrompt: res.data.labelPrompt,
                domainTreePrompt: res.data.domainTreePrompt
            });
        });
    };

    useEffect(() => {
        getProjectInfo();
    }, []);

    return (
        <div className="@container/main flex flex-1 flex-col p-5 gap-2">
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* 信息提示 */}
                    <div className=" flex flex-1 gap-2 p-3 rounded-lg bg-blue-50 border-blue-100">
                        <InfoCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">{t('prompt_config.info')}</p>
                    </div>

                    {/* 全局提示词 */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-medium">{t('prompt_config.global')}</h3>
                        <Textarea
                            placeholder="请输入全局提示词（慎用，可能影响整体生成效果）"
                            className="min-h-[100px] resize-none"
                            value={formData.globalPrompt}
                            onChange={e => handleChange('globalPrompt', e.target.value)}
                        />
                    </div>

                    {/* 两列布局 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 生成问题提示词 */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-medium">{t('prompt_config.gen_question')}</h3>
                            <Textarea
                                placeholder="请输入自定义生成问题的提示词"
                                className="min-h-[180px] resize-none"
                                value={formData.questionPrompt}
                                onChange={e => handleChange('questionPrompt', e.target.value)}
                            />
                        </div>

                        {/* 生成答案提示词 */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-medium">{t('prompt_config.gen_answer')}</h3>
                            <Textarea
                                placeholder="请输入自定义生成答案的提示词"
                                className="min-h-[180px] resize-none"
                                value={formData.answerPrompt}
                                onChange={e => handleChange('answerPrompt', e.target.value)}
                            />
                        </div>

                        {/*/!* 问题打标提示词 *!/*/}
                        {/*<div className="space-y-3">*/}
                        {/*    <h3 className="text-lg font-medium">问题打标提示词</h3>*/}
                        {/*    <Textarea*/}
                        {/*        disabled={true}*/}
                        {/*        placeholder="请输入自定义问题打标的提示词（暂不支持配置）"*/}
                        {/*        className="min-h-[180px] resize-none"*/}
                        {/*        value={formData.labelPrompt}*/}
                        {/*        onChange={(e) => handleChange("labelPrompt", e.target.value)}*/}
                        {/*    />*/}
                        {/*</div>*/}

                        {/*/!* 构建领域树提示词 *!/*/}
                        {/*<div className="space-y-3">*/}
                        {/*    <h3 className="text-lg font-medium">构建领域树提示词</h3>*/}
                        {/*    <Textarea*/}
                        {/*        placeholder="请输入自定义构建领域树的提示词"*/}
                        {/*        className="min-h-[180px] resize-none"*/}
                        {/*        value={formData.domainTreePrompt}*/}
                        {/*        onChange={(e) => handleChange("domainTreePrompt", e.target.value)}*/}
                        {/*    />*/}
                        {/*</div>*/}
                    </div>

                    {/* 保存按钮 */}
                    <div className="flex justify-end">
                        <Button type="submit">
                            <Save /> {t('prompt_config.save_btn')}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
