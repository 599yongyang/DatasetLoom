'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
    X,
    Plus,
    Save,
    ArrowLeft
} from 'lucide-react';

type VariableType = 'text' | 'number' | 'textarea' | 'select' | 'boolean' | 'range';

interface VariableConfig {
    name: string;
    type: VariableType;
    defaultValue?: string;
    description?: string;
    required?: boolean;
    options?: { label: string; value: string }[];
    min?: number;
    max?: number;
    step?: number;
}

export function VariableConfigForm({
                                       variable,
                                       initialConfig,
                                       onSave,
                                       onCancel
                                   }: {
    variable: string;
    initialConfig?: VariableConfig;
    onSave: (config: VariableConfig) => void;
    onCancel?: () => void;
}) {
    console.log(initialConfig)
    const [type, setType] = useState<VariableType>(initialConfig?.type || 'text');
    const [defaultValue, setDefaultValue] = useState(initialConfig?.defaultValue || '');
    const [description, setDescription] = useState(initialConfig?.description || '');
    const [required, setRequired] = useState(initialConfig?.required || false);
    const [options, setOptions] = useState<{ label: string; value: string }[]>(
        initialConfig?.options || []
    );
    const [newOption, setNewOption] = useState('');
    const [min, setMin] = useState(initialConfig?.min?.toString() || '');
    const [max, setMax] = useState(initialConfig?.max?.toString() || '');
    const [step, setStep] = useState(initialConfig?.step?.toString() || '1');

    useEffect(() => {
        if (initialConfig) {
            setType(initialConfig.type || 'text');
            setDefaultValue(initialConfig.defaultValue || '');
            setDescription(initialConfig.description || '');
            setRequired(initialConfig.required || false);
            setOptions(initialConfig.options || []);
            setMin(initialConfig.min?.toString() || '');
            setMax(initialConfig.max?.toString() || '');
            setStep(initialConfig.step?.toString() || '1');
        }
    }, [initialConfig]);

    const handleAddOption = () => {
        if (newOption.trim()) {
            setOptions([
                ...options,
                { label: newOption, value: newOption.toLowerCase().replace(/\s+/g, '-') }
            ]);
            setNewOption('');
        }
    };

    const handleRemoveOption = (index: number) => {
        setOptions(options.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        const config: VariableConfig = {
            name: variable,
            type,
            defaultValue,
            description,
            required,
        };

        if (type === 'select') {
            config.options = options;
        }

        if (type === 'number' || type === 'range') {
            if (min) config.min = parseFloat(min);
            if (max) config.max = parseFloat(max);
            if (step) config.step = parseFloat(step);
        }

        onSave(config);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs">描述</Label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="变量的描述信息"
                        className="min-h-[40px] text-xs"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="type" className="text-xs">类型</Label>
                    <Select value={type} onValueChange={(v) => setType(v as VariableType)}>
                        <SelectTrigger id="type" className="h-8 text-xs w-full">
                            <SelectValue placeholder="选择变量类型" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="text">文本输入</SelectItem>
                            <SelectItem value="textarea">多行文本</SelectItem>
                            <SelectItem value="number">数字</SelectItem>
                            <SelectItem value="select">下拉选择</SelectItem>
                            <SelectItem value="boolean">开关</SelectItem>
                            <SelectItem value="range">滑块</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                        id="required"
                        checked={required}
                        onCheckedChange={setRequired}
                        className="h-4 w-7"
                    />
                    <Label htmlFor="required" className="text-xs">必填</Label>
                </div>

                {(type === 'text' || type === 'textarea' || type === 'number') && (
                    <div className="space-y-2">
                        <Label htmlFor="defaultValue" className="text-xs">
                            默认值
                        </Label>
                        {type === 'textarea' ? (
                            <Textarea
                                id="defaultValue"
                                value={defaultValue}
                                onChange={(e) => setDefaultValue(e.target.value)}
                                placeholder="请输入默认值"
                                className="text-xs"
                            />
                        ) : (
                            <Input
                                id="defaultValue"
                                type={type === 'number' ? 'number' : 'text'}
                                value={defaultValue}
                                onChange={(e) => setDefaultValue(e.target.value)}
                                placeholder="请输入默认值"
                                className="h-8 text-xs"
                            />
                        )}
                    </div>
                )}

                {type === 'select' && (
                    <div className="space-y-2">
                        <Label className="text-xs">选项配置</Label>
                        <div className="flex gap-1">
                            <Input
                                value={newOption}
                                onChange={(e) => setNewOption(e.target.value)}
                                placeholder="输入选项名称"
                                className="h-8 text-xs flex-1"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2"
                                onClick={handleAddOption}
                                disabled={!newOption.trim()}
                            >
                                <Plus className="w-3 h-3" />
                            </Button>
                        </div>
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                            {options.map((opt, i) => (
                                <div key={i} className="flex items-center justify-between p-1.5 rounded border bg-background text-xs">
                                    <span>{opt.label}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 w-5 p-0"
                                        onClick={() => handleRemoveOption(i)}
                                    >
                                        <X className="w-2.5 h-2.5" />
                                    </Button>
                                </div>
                            ))}
                            {options.length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-1">
                                    暂无选项
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {(type === 'number' || type === 'range') && (
                    <div className="grid grid-cols-3 gap-1">
                        <div className="space-y-1">
                            <Label htmlFor="min" className="text-xs">最小值</Label>
                            <Input
                                id="min"
                                type="number"
                                value={min}
                                onChange={(e) => setMin(e.target.value)}
                                placeholder="最小值"
                                className="h-8 text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="max" className="text-xs">最大值</Label>
                            <Input
                                id="max"
                                type="number"
                                value={max}
                                onChange={(e) => setMax(e.target.value)}
                                placeholder="最大值"
                                className="h-8 text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="step" className="text-xs">步长</Label>
                            <Input
                                id="step"
                                type="number"
                                value={step}
                                onChange={(e) => setStep(e.target.value)}
                                placeholder="步长"
                                className="h-8 text-xs"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-2 pt-2">
                {onCancel && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs flex-1"
                        onClick={onCancel}
                    >
                        <ArrowLeft className="w-3 h-3 mr-1" />
                        取消
                    </Button>
                )}
                <Button
                    size="sm"
                    className="h-8 px-3 text-xs flex-1"
                    onClick={handleSubmit}
                >
                    <Save className="w-3 h-3 mr-1" />
                    保存
                </Button>
            </div>
        </div>
    );
}
