'use client';
import { useState, useRef, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Text } from 'react-konva';
import useImage from 'use-image';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { stringToColor } from '@/lib/utils';
import { useParams } from 'next/navigation';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import axios from 'axios';
import { toast } from 'sonner';

interface SelectionArea {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    label?: string;
}

export default function Page() {
    const { projectId, imageId } = useParams();
    const [image] = useImage(`/api/view/${imageId}`, 'anonymous');
    const stageRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [labelInput, setLabelInput] = useState('');

    // 框选状态
    const [isSelecting, setIsSelecting] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [selectionArea, setSelectionArea] = useState<SelectionArea | null>(null);
    const [annotations, setAnnotations] = useState<SelectionArea[]>([]);

    // 开始选择：点击图片后记录起点
    const handleMouseDown = useCallback((e: any) => {
        const stage = e.target.getStage();
        const pointerPosition = stage?.getPointerPosition();

        if (!pointerPosition || !stage) return;

        // 确保点击在图片上
        const target = e.target;
        if (target === stage || target.getClassName() === 'Image') {
            setIsSelecting(true);
            setStartPos(pointerPosition);
            setSelectionArea({
                id: nanoid(),
                x: pointerPosition.x,
                y: pointerPosition.y,
                width: 0,
                height: 0
            });
        }
    }, []);

    // 拖动中：更新选择框大小
    const handleMouseMove = useCallback(() => {
        if (!isSelecting || !stageRef.current || !selectionArea) return;

        const stage = stageRef.current;
        const pos = stage.getPointerPosition();
        if (!pos) return;

        const newArea = {
            ...selectionArea,
            x: Math.min(startPos.x, pos.x),
            y: Math.min(startPos.y, pos.y),
            width: Math.abs(pos.x - startPos.x),
            height: Math.abs(pos.y - startPos.y)
        };

        setSelectionArea(newArea);
    }, [isSelecting, startPos, selectionArea]);

    // 结束选择
    const handleMouseUp = useCallback(() => {
        if (isSelecting) {
            setIsSelecting(false);
        }
    }, [isSelecting]);

    // 清除选择框
    const clearSelection = useCallback(() => {
        setSelectionArea(null);
        setLabelInput('');
    }, []);

    // 确认当前选择区域
    const confirmSelection = useCallback(() => {
        if (selectionArea) {
            const newAnnotation = {
                ...selectionArea,
                label: labelInput || `区域 ${annotations.length + 1}`
            };
            setAnnotations(prev => [...prev, newAnnotation]);
            clearSelection();
        }
    }, [selectionArea, labelInput, annotations.length, clearSelection]);

    // 删除标注
    const deleteAnnotation = useCallback((id: string) => {
        setAnnotations(prev => prev.filter(item => item.id !== id));
    }, []);

    // 保存到数据库
    const saveToDatabase = useCallback(async () => {
        if (annotations.length === 0) return;

        axios
            .post(`/api/project/${projectId}/images/block`, {
                imageId,
                annotations
            })
            .then(res => {
                toast.success('保存成功');
            })
            .catch(error => {
                console.log(error);
                toast.error('保存失败');
            });
    }, [annotations, projectId, imageId]);

    // 计算容器尺寸
    const containerStyle = {
        maxWidth: '100%',
        maxHeight: '80vh',
        overflow: 'auto',
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem',
        backgroundColor: '#f8fafc'
    };

    return (
        <div className="w-full mx-auto p-4 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">图片分块标注</h1>
                <Button onClick={saveToDatabase} disabled={annotations.length === 0}>
                    保存标注
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 左侧 - 图片区域 */}
                <div className="lg:col-span-2">
                    <div ref={containerRef} style={containerStyle}>
                        <Stage
                            ref={stageRef}
                            width={image?.width || 800}
                            height={image?.height || 600}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            style={{ cursor: isSelecting ? 'crosshair' : 'default' }}
                        >
                            <Layer>
                                {/* 图片 */}
                                {image && <KonvaImage image={image} width={image.width} height={image.height} />}

                                {/* 已确认的标注 */}
                                {annotations.map(area => (
                                    <React.Fragment key={area.id}>
                                        <Rect
                                            x={area.x}
                                            y={area.y}
                                            width={area.width}
                                            height={area.height}
                                            fill="rgba(0, 123, 255, 0.1)"
                                            stroke={stringToColor(area.label || '区域')}
                                            strokeWidth={2}
                                        />
                                        <Text
                                            x={area.x + 5}
                                            y={area.y - 20}
                                            text={area.label || `区域`}
                                            fontSize={12}
                                            fill={stringToColor(area.label || '区域')}
                                            fontFamily="Arial"
                                            width={area.width - 10}
                                            ellipsis
                                        />
                                    </React.Fragment>
                                ))}

                                {/* 当前框选矩形 */}
                                {selectionArea && selectionArea.width > 0 && selectionArea.height > 0 && (
                                    <React.Fragment key={selectionArea.id}>
                                        <Rect
                                            x={selectionArea.x}
                                            y={selectionArea.y}
                                            width={selectionArea.width}
                                            height={selectionArea.height}
                                            fill="rgba(0, 123, 255, 0.1)"
                                            stroke="#007bff"
                                            strokeWidth={2}
                                            dash={[5, 5]}
                                        />
                                        <Text
                                            x={selectionArea.x + 5}
                                            y={selectionArea.y + 5}
                                            text={`${Math.round(selectionArea.width)} × ${Math.round(selectionArea.height)}`}
                                            fontSize={12}
                                            fill="#007bff"
                                            fontFamily="Arial"
                                        />
                                    </React.Fragment>
                                )}
                            </Layer>
                        </Stage>
                    </div>
                </div>

                {/* 右侧 - 标注表单和列表 */}
                <div className="space-y-4">
                    {/* 标注表单 - 只在有选择区域时显示 */}
                    {selectionArea && selectionArea.width > 0 && selectionArea.height > 0 && (
                        <div className="space-y-4 p-4  border  rounded-lg">
                            <h3 className="font-semibold">当前标注信息</h3>
                            <div className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className={'flex justify-between'}>
                                        <Label>位置</Label>
                                        <div className="text-sm p-2">
                                            {Math.round(selectionArea.x)}, {Math.round(selectionArea.y)}
                                        </div>
                                    </div>
                                    <div className={'flex justify-between'}>
                                        <Label>尺寸</Label>
                                        <div className="text-sm p-2 ">
                                            {Math.round(selectionArea.width)} × {Math.round(selectionArea.height)}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="label">标注名称</Label>
                                    <Input
                                        id="label"
                                        className={'mt-2'}
                                        placeholder="输入标注名称"
                                        value={labelInput}
                                        onChange={e => setLabelInput(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={confirmSelection} size="sm" className="flex-1">
                                    确认标注
                                </Button>
                                <Button onClick={clearSelection} variant="outline" size="sm" className="flex-1">
                                    取消
                                </Button>
                            </div>
                        </div>
                    )}

                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>标注列表</span>
                                <Badge variant="outline">{annotations.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[500px]">
                                {annotations.length > 0 ? (
                                    <div className=" space-y-2">
                                        {annotations.map((area, index) => (
                                            <div key={area.id} className="group">
                                                <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                                    <div
                                                        className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5"
                                                        style={{ backgroundColor: stringToColor(area.label || '区域') }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium">{area.label}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {Math.round(area.width)} × {Math.round(area.height)} @ (
                                                            {Math.round(area.x)}, {Math.round(area.y)})
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => deleteAnnotation(area.id)}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                                {index < annotations.length - 1 && <Separator />}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Target className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <div className="text-sm text-gray-500 mb-1">暂无标注</div>
                                        <div className="text-xs text-gray-400">在左侧图片上拖拽选择区域开始标注</div>
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
