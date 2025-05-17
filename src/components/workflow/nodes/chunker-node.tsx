import React, { useEffect } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAtom } from 'jotai';
import { chunkWorkFlowAtom } from '@/atoms/workflow';
import BaseNode, { KeyValueRow } from '@/components/workflow/nodes/base-node';
import { chunkTypeOptions } from '@/lib/data-dictionary';

export function ChunkerNode({ isConnectable }: NodeProps) {
    const [chunkWorkFlow, setChunkWorkFlow] = useAtom(chunkWorkFlowAtom);
    const handleChange = (field: string, value: string) => {
        setChunkWorkFlow(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Sheet>
            <SheetTrigger>
                <BaseNode>
                    <BaseNode.Header className={'bg-cyan-500'}>分块策略</BaseNode.Header>
                    <BaseNode.Body className="p-3 space-y-3 text-sm">
                        <div className="text-sm text-gray-700 dark:text-gray-300">将文档内容分割为适合处理的块</div>

                        <div className="space-y-2">
                            <KeyValueRow
                                label="策略:"
                                value={chunkTypeOptions.find(item => item.value === chunkWorkFlow.strategy)?.label}
                            />
                            {chunkWorkFlow.strategy === 'custom' && (
                                <>
                                    {chunkWorkFlow.separators && (
                                        <KeyValueRow label="自定义字符:" value={chunkWorkFlow.separators} />
                                    )}
                                    <KeyValueRow label="最大字符数:" value={chunkWorkFlow.chunkSize} />
                                    <KeyValueRow label="字符重叠数:" value={chunkWorkFlow.chunkOverlap} />
                                </>
                            )}
                        </div>
                    </BaseNode.Body>
                    {/* Handles */}
                    <Handle
                        type="target"
                        position={Position.Left}
                        isConnectable={isConnectable}
                        className="w-4 h-4 bg-red-500 border-2 border-white dark:border-gray-800 rounded-full hover:brightness-110 transition-all duration-200"
                    />
                    <Handle
                        type="source"
                        position={Position.Right}
                        isConnectable={isConnectable}
                        className="w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full hover:brightness-110 transition-all duration-200"
                    />
                </BaseNode>
            </SheetTrigger>
            <SheetContent className={'p-4'}>
                <SheetTitle>Chunker</SheetTitle>
                <div className="space-y-4">
                    <div className="text-foreground text-sm leading-none font-medium">分块策略</div>
                    <RadioGroup
                        className="gap-2"
                        value={chunkWorkFlow.strategy}
                        onValueChange={value => handleChange('strategy', value)}
                    >
                        {chunkTypeOptions.map(item => (
                            <div
                                key={`${item.value}`}
                                className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none"
                            >
                                <RadioGroupItem value={item.value} className="order-1 after:absolute after:inset-0" />
                                <div className="grid grow gap-2">
                                    <Label htmlFor={`${item.value}`}>{item.label}</Label>
                                    <p className="text-muted-foreground text-xs">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
                {chunkWorkFlow.strategy === 'custom' && (
                    <>
                        <div className="space-y-4">
                            <Label className={'text-sm'}>自定义字符</Label>
                            <Input
                                type={'text'}
                                value={chunkWorkFlow.separators}
                                onChange={e => handleChange('separators', e.target.value)}
                            />
                        </div>

                        <div className="space-y-4">
                            <Label className={'text-sm'}>最大字符数</Label>
                            <Input
                                type={'number'}
                                value={chunkWorkFlow.chunkSize}
                                onChange={e => handleChange('chunkSize', e.target.value)}
                            />
                        </div>
                        <div className="space-y-4">
                            <Label className={'text-sm'}>字符重叠数</Label>
                            <Input
                                type={'number'}
                                value={chunkWorkFlow.chunkOverlap}
                                onChange={e => handleChange('chunkOverlap', e.target.value)}
                            />
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
