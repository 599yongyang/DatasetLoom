'use client';

import { useEffect, useState } from 'react';
import { PromptEditor } from '@/components/prompt-template/editor/prompt-editor';
import { VariableConfigForm } from '@/components/prompt-template/editor/variable-config-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    AlertCircle,
    CheckCircle,
    Settings,
    Trash2,
    Info, TriangleAlert
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PromptTemplateType } from '@repo/shared-types';
import { useGetPromptTemplateById } from '@/hooks/query/use-prompt-template';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/axios';
import { toast } from 'sonner';
import TooltipBtn from '@/components/ui/tooltip-btn';

// 系统预置变量定义（不参与用户配置）
const SYSTEM_REQUIRED_VARIABLES: Record<PromptTemplateType, string[]> = {
    [PromptTemplateType.LABEL]: ['context'],
    [PromptTemplateType.QUESTION]: ['context'],
    [PromptTemplateType.ANSWER]: ['context', 'question'],
    [PromptTemplateType.OTHER]: []
};

//所有系统变量说明（用于提示）
const SYSTEM_VARIABLES: Record<string, { description: string }> = {
    context: { description: '上下文或文档内容' },
    question: { description: '用户提出的问题' }
};

export default function Page() {
    const { projectId, id }: { projectId: string; id: string } = useParams();
    const router = useRouter();
    const { data: promptTemplate } = useGetPromptTemplateById({ projectId, promptId: id });
    const [content, setContent] = useState(promptTemplate?.content ?? '');
    const [variableList, setVariableList] = useState<string[]>([]);
    const [variableConfigs, setVariableConfigs] = useState<Record<string, any>>(promptTemplate?.variables || {});
    const [activeVariable, setActiveVariable] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (promptTemplate) {
            setContent(promptTemplate.content ?? '');
            setVariableConfigs(promptTemplate.variables || {});
        }
    }, [promptTemplate]);

    // 提取所有变量（包括系统变量）
    useEffect(() => {
        const allVars = extractVariables(content);
        setVariableList(allVars);

        // 清理已不存在变量的配置
        const newConfigs = { ...variableConfigs };
        let hasChanges = false;
        Object.keys(newConfigs).forEach(key => {
            if (!allVars.includes(key) || isSystemVariable(key)) {
                delete newConfigs[key];
                hasChanges = true;
            }
        });
        if (hasChanges) {
            setVariableConfigs(newConfigs);
        }
    }, [content]);

    // 提取变量
    const extractVariables = (content: string) => {
        const variableRegex = /\{\{([^}]+)\}\}/g;
        const matches = content.matchAll(variableRegex);
        return Array.from(new Set(
            Array.from(matches)
                .map(m => m[1])
                .filter((v): v is string => v !== undefined)
        ));
    };

    //判断是否为系统变量
    const isSystemVariable = (variable: string) => {
        return Object.values(SYSTEM_REQUIRED_VARIABLES).some(vars => vars.includes(variable));
    };

    //获取当前类型所需系统变量
    const getRequiredSystemVars = () => {
        return SYSTEM_REQUIRED_VARIABLES[promptTemplate?.type || PromptTemplateType.QUESTION] || [];
    };

    //检查是否缺失必需系统变量
    const getMissingSystemVars = () => {
        const required = getRequiredSystemVars();
        return required.filter(varName => !content.includes(`{{${varName}}}`));
    };

    const missingSystemVars = getMissingSystemVars();

    const handleSaveConfig = (config: any) => {
        setVariableConfigs(prev => ({
            ...prev,
            [config.name]: config
        }));
        setActiveVariable(null);
    };

    const handleRemoveConfig = (variableName: string) => {
        const newConfigs = { ...variableConfigs };
        delete newConfigs[variableName];
        setVariableConfigs(newConfigs);
    };

    const isVariableConfigured = (variable: string) => {
        return variableConfigs.hasOwnProperty(variable);
    };

    const onSave = () => {
        if (missingSystemVars.length > 0) {
            toast.warning(`缺少必需的系统变量：${missingSystemVars.map(v => `{{${v}}}`).join(', ')}`);
            return;
        }

        apiClient.patch(`/${projectId}/prompt-template`, {
            id: id,
            content: content,
            variables: JSON.stringify(variableConfigs)
        }).then(res => {
            toast.success('操作成功');
            router.push(`/project/${projectId}/settings/prompt-template`);
        }).catch(error => {
            console.error('Error:', error);
            toast.error(error.response?.data?.error || '操作失败');
        });


    };


    return (
        <div className="container">
            <Card className="shadow-lg h-[88vh]">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <span>Prompt 模板编辑</span>
                            {isDirty && (
                                <Badge variant="secondary" className="text-xs">
                                    未保存
                                </Badge>
                            )}
                        </CardTitle>

                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            <Button size="sm" onClick={onSave} disabled={missingSystemVars.length > 0}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                保存
                            </Button>
                        </div>
                    </div>

                    {/*系统变量缺失警告 */}
                    {missingSystemVars.length > 0 &&
                        (<div className="rounded-md border px-4 py-3">
                            <p className="text-sm">
                                <TriangleAlert
                                    className="me-3 -mt-0.5 inline-flex text-amber-500"
                                    size={16}
                                    aria-hidden="true"
                                />
                                缺少必需变量：{missingSystemVars.map(v => <code key={v}
                                                                               className="px-1.5 py-0.5 mx-1 bg-red-100 text-red-800 rounded text-xs font-mono">{`{{${v}}}`}</code>)}

                            </p>
                        </div>)
                    }

                    {/*系统变量提示 */}
                    <div className="mt-2 flex flex-wrap gap-1 text-xs text-muted-foreground items-center min-h-[20px]">
                        <Info className="w-3 h-3 flex-shrink-0" />
                        <span>系统变量：</span>
                        {getRequiredSystemVars().map(varName => (
                            <TooltipBtn key={varName} tooltip={SYSTEM_VARIABLES[varName]?.description ?? varName}>
                                <Badge variant="secondary"
                                       className="font-mono text-xs px-1.5 py-0.5 opacity-80 flex items-center">
                                    {`{{${varName}}}`}
                                </Badge>
                            </TooltipBtn>
                        ))}
                    </div>


                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* 编辑器区域 */}
                        <div className="lg:col-span-2 space-y-4">
                            <PromptEditor
                                value={content}
                                onChange={(newValue: string) => {
                                    setContent(newValue);
                                    setIsDirty(true);
                                }}
                            />
                            {/* 变量管理区域 */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Settings className="w-4 h-4 text-muted-foreground" />
                                    <h3 className="font-medium text-sm">模板变量</h3>
                                    <Separator className="flex-1" />
                                </div>

                                {variableList.length === 0 ? (
                                    <div className="text-center py-4 text-muted-foreground bg-muted/30 rounded-lg">
                                        <AlertCircle className="w-6 h-6 mx-auto mb-1" />
                                        <p className="text-sm">{`在编辑器中添加 {{变量名}} 来创建变量`}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            {variableList.map((variable) => {
                                                const isSystem = isSystemVariable(variable);
                                                return (
                                                    <Badge
                                                        key={variable}
                                                        variant={isSystem ? 'secondary' : (activeVariable === variable ? 'default' : 'outline')}
                                                        className={`cursor-pointer hover:bg-primary/20 transition-colors py-1.5 px-2.5 text-xs ${isSystem ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                        onClick={() => !isSystem && setActiveVariable(activeVariable === variable ? null : variable)}
                                                    >
                                                        <span className="font-mono">{`{{${variable}}}`}</span>
                                                        {!isSystem && isVariableConfigured(variable) && (
                                                            <CheckCircle className="w-3 h-3 ml-1 text-green-500" />
                                                        )}
                                                        {isSystem && (
                                                            <span className="ml-1 text-xs opacity-60">系统</span>
                                                        )}
                                                    </Badge>
                                                );
                                            })}
                                        </div>

                                        {/* 用户变量配置提示 */}
                                        {!missingSystemVars.length && variableList.some(v => !isSystemVariable(v) && !isVariableConfigured(v)) && (
                                            <Alert className="py-2 px-3 text-xs">
                                                <AlertCircle className="h-3 w-3" />
                                                <AlertDescription>
                                                    未配置：{
                                                    variableList
                                                        .filter(v => !isSystemVariable(v) && !isVariableConfigured(v))
                                                        .join(', ')
                                                }
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 右侧配置区域 */}
                        <div className="space-y-4">
                            {/* 变量配置表单 */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Settings className="w-4 h-4 text-muted-foreground" />
                                    <h3 className="font-medium text-sm">
                                        {activeVariable ? `配置变量: {{${activeVariable}}}` : '变量配置'}
                                    </h3>
                                    <Separator className="flex-1" />
                                </div>

                                {activeVariable ? (
                                    isSystemVariable(activeVariable) ? (
                                        <div className="border rounded-lg p-4 bg-red-50">
                                            <AlertCircle className="w-5 h-5 text-red-500 mb-2" />
                                            <p className="text-sm text-red-700">
                                                <strong> {`{{${activeVariable}}}`}</strong> 是系统预置变量，不可配置。
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="border rounded-lg p-4 bg-background">
                                            <VariableConfigForm
                                                variable={activeVariable}
                                                initialConfig={variableConfigs[activeVariable]}
                                                onSave={handleSaveConfig}
                                                onCancel={() => setActiveVariable(null)}
                                            />
                                        </div>
                                    )
                                ) : (
                                    <div
                                        className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/30">
                                        <Settings className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-sm">点击变量来配置其属性</p>
                                        <p className="text-xs mt-1">支持文本、数字、选择框等类型</p>
                                    </div>
                                )}
                            </div>

                            {/* 已配置变量列表 */}
                            {Object.keys(variableConfigs).length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-sm">已配置变量</h3>
                                        <Separator className="flex-1" />
                                    </div>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {Object.entries(variableConfigs).map(([name, config]) => (
                                            <div
                                                key={name}
                                                className="flex items-center justify-between p-2 rounded-md border bg-muted/30 hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs">{`{{${name}}}`}</span>
                                                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                                        {config.type}
                                                    </Badge>
                                                </div>
                                                <div className="flex gap-0.5">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0"
                                                        onClick={() => setActiveVariable(name)}
                                                    >
                                                        <Settings className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleRemoveConfig(name)}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
