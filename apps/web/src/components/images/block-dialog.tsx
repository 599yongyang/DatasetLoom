import {useEffect, useCallback, useRef, useState, useMemo} from 'react';
import {Stage, Layer, Image as KonvaImage, Rect, Text} from 'react-konva';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Move, SquareDashedMousePointer, Target, Trash2, ZoomIn, ZoomOut, RefreshCw, Loader2} from 'lucide-react';
import {Label} from '@/components/ui/label';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {ScrollArea} from '@/components/ui/scroll-area';
import {stringToColor} from '@/lib/utils';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';
import {useParams} from 'next/navigation';
import useImage from 'use-image';
import {nanoid} from 'nanoid';
import {toast} from 'sonner';
import React from 'react';
import apiClient from "@/lib/axios";
import {BACKEND_URL} from "@/constants/config";

interface SelectionArea {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    label?: string;
}

export default function BlockImageDialog({
                                             open,
                                             setOpen,
                                             imageId,
                                             imageUrl,
                                             refresh
                                         }: {
    open: boolean;
    setOpen: (open: boolean) => void;
    imageId: string;
    imageUrl: string;
    refresh: () => void;
}) {
    const {projectId} = useParams();
    const [image] = useImage(BACKEND_URL + imageUrl, 'anonymous');
    const stageRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [labelInput, setLabelInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // 视图控制状态
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({x: 0, y: 0});
    const [isDragMode, setIsDragMode] = useState(false);
    const [isSpacePressed, setIsSpacePressed] = useState(false);
    const [lastPointerPosition, setLastPointerPosition] = useState({x: 0, y: 0});

    // 标注状态
    const [isSelecting, setIsSelecting] = useState(false);
    const [startPos, setStartPos] = useState({x: 0, y: 0});
    const [selectionArea, setSelectionArea] = useState<SelectionArea | null>(null);
    const [annotations, setAnnotations] = useState<SelectionArea[]>([]);
    useEffect(() => {
        if (open) {
            setAnnotations([]);
            setSelectionArea(null);
            setLabelInput('');
            resetView(); // 可选：重置视图
        }
    }, [open]);
    // 键盘事件监听
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                setIsSpacePressed(true);
                if (!selectionArea) {
                    setIsDragMode(true);
                }
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                setIsSpacePressed(false);
                setIsDragMode(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [selectionArea]);

    // 图像加载后重置视图
    useEffect(() => {
        if (image) {
            resetView();
        }
    }, [image]);

    // 视图重置
    const resetView = useCallback(() => {
        if (!image || !stageRef.current || !containerRef.current) return;

        const container = containerRef.current;
        const scaleX = container.clientWidth / image.width;
        const scaleY = container.clientHeight / image.height;
        const newScale = Math.min(scaleX, scaleY) * 0.9;

        setScale(newScale);
        setPosition({
            x: (container.clientWidth - image.width * newScale) / 2,
            y: (container.clientHeight - image.height * newScale) / 2
        });
    }, [image]);

    // 鼠标滚轮缩放
    const handleWheel = useCallback(
        (e: any) => {
            e.evt.preventDefault();

            const stage = e.target.getStage();
            if (!stage || !image) return;

            const pointer = stage.getPointerPosition();
            if (!pointer) return;

            const mousePointTo = {
                x: (pointer.x - position.x) / scale,
                y: (pointer.y - position.y) / scale
            };

            const minScale = Math.min(stage.width() / image.width, stage.height() / image.height) * 0.3;

            const newScale = e.evt.deltaY > 0 ? Math.max(minScale, scale * 0.9) : Math.min(3, scale * 1.1);

            setScale(newScale);
            setPosition({
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale
            });
        },
        [scale, position, image]
    );

    // 拖拽处理
    const handleDragStart = useCallback(
        (e: any) => {
            if (!isDragMode) return;
            const stage = e.target.getStage();
            setLastPointerPosition(stage?.getPointerPosition() || {x: 0, y: 0});
        },
        [isDragMode]
    );

    const handleDragMove = useCallback(
        (e: any) => {
            if (!isDragMode || !image || !stageRef.current) return;

            const stage = stageRef.current;
            const pointerPos = stage.getPointerPosition();
            if (!pointerPos || !lastPointerPosition) return;

            const dx = pointerPos.x - lastPointerPosition.x;
            const dy = pointerPos.y - lastPointerPosition.y;

            setPosition(prev => {
                const newX = prev.x + dx;
                const newY = prev.y + dy;

                const maxX = (image.width * scale - stage.width()) / 2;
                const maxY = (image.height * scale - stage.height()) / 2;

                return {
                    x: Math.max(-maxX, Math.min(maxX, newX)),
                    y: Math.max(-maxY, Math.min(maxY, newY))
                };
            });
            setLastPointerPosition(pointerPos);
        },
        [isDragMode, lastPointerPosition, scale, image]
    );

    const handleDragEnd = useCallback(() => {
        setIsDragMode(false);
    }, []);

    // 标注处理
    const handleMouseDown = useCallback(
        (e: any) => {
            if (isDragMode) return;

            const stage = e.target.getStage();
            if (!stage || !image) return;

            const pointerPosition = stage.getPointerPosition();
            if (!pointerPosition) return;

            const imagePos = {
                x: (pointerPosition.x - position.x) / scale,
                y: (pointerPosition.y - position.y) / scale
            };

            if (imagePos.x < 0 || imagePos.y < 0 || imagePos.x > image.width || imagePos.y > image.height) {
                return;
            }

            const target = e.target;
            if (target === stage || target.getClassName() === 'Image') {
                setIsSelecting(true);
                setStartPos(imagePos);
                setSelectionArea({
                    id: nanoid(),
                    x: imagePos.x,
                    y: imagePos.y,
                    width: 0,
                    height: 0
                });
            }
        },
        [scale, position, isDragMode, image]
    );

    const handleMouseMove = useCallback(
        (e: any) => {
            if (isDragMode || !isSelecting || !stageRef.current || !selectionArea || !image) return;

            const stage = stageRef.current;
            const pointerPos = stage.getPointerPosition();
            if (!pointerPos) return;

            const imagePos = {
                x: (pointerPos.x - position.x) / scale,
                y: (pointerPos.y - position.y) / scale
            };

            const clampedX = Math.max(0, Math.min(imagePos.x, image.width));
            const clampedY = Math.max(0, Math.min(imagePos.y, image.height));

            const newArea = {
                ...selectionArea,
                x: Math.min(startPos.x, clampedX),
                y: Math.min(startPos.y, clampedY),
                width: Math.abs(clampedX - startPos.x),
                height: Math.abs(clampedY - startPos.y)
            };

            setSelectionArea(newArea);
        },
        [isSelecting, startPos, selectionArea, scale, position, isDragMode, image]
    );

    const handleMouseUp = useCallback(() => {
        if (isSelecting) {
            setIsSelecting(false);
        }
    }, [isSelecting]);

    // 标注操作
    const clearSelection = useCallback(() => {
        setSelectionArea(null);
        setLabelInput('');
    }, []);

    const confirmSelection = useCallback(() => {
        if (!selectionArea || !image) return;

        if (selectionArea.width < 5 || selectionArea.height < 5) {
            toast.warning('标注区域太小');
            return;
        }

        if (
            selectionArea.x < 0 ||
            selectionArea.y < 0 ||
            selectionArea.x + selectionArea.width > image.width ||
            selectionArea.y + selectionArea.height > image.height
        ) {
            toast.warning('标注区域超出图像范围');
            return;
        }

        const newAnnotation = {
            ...selectionArea,
            label: labelInput || `区域 ${annotations.length + 1}`
        };
        setAnnotations(prev => [...prev, newAnnotation]);
        clearSelection();
    }, [selectionArea, labelInput, annotations.length, clearSelection, image]);

    const deleteAnnotation = useCallback((id: string) => {
        setAnnotations(prev => prev.filter(item => item.id !== id));
    }, []);

    // 保存到数据库
    const saveToDatabase = useCallback(async () => {
        if (annotations.length === 0) {
            toast.warning('请至少添加一个标注');
            return;
        }

        setIsSaving(true);
        try {
            await apiClient.post(`/${projectId}/image-chunk/create`, {
                imageId,
                annotations
            });
            toast.success('保存成功');
            refresh();
            setOpen(false);
        } catch (error) {
            console.error('保存失败:', error);
            toast.error('保存失败');
        } finally {
            setIsSaving(false);
        }
    }, [annotations, projectId, imageId, setOpen]);

    // 容器样式
    const containerStyle = useMemo(
        () => ({
            maxWidth: '100%',
            maxHeight: '85vh',
            overflow: 'auto',
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            backgroundColor: '#f8fafc'
        }),
        []
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-4xl min-h-[95vh] max-h-[95vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <SquareDashedMousePointer className="w-5 h-5 text-primary"/>
                        <span>图片分块标注</span>
                    </DialogTitle>
                    <div className="absolute right-12 top-4 flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setScale(prev => Math.max(0.1, prev * 0.9))}
                            disabled={scale <= 0.1}
                        >
                            <ZoomOut className="w-4 h-4"/>
                        </Button>
                        <span className="text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setScale(prev => Math.min(3, prev * 1.1))}
                            disabled={scale >= 3}
                        >
                            <ZoomIn className="w-4 h-4"/>
                        </Button>
                        <Button variant="outline" size="sm" onClick={resetView}>
                            <RefreshCw className="w-4 h-4"/>
                        </Button>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
                    {/* 左侧 - 分块预览 */}
                    <div className="space-y-4 flex flex-col">
                        <div className="relative bg-gray-50 rounded-lg overflow-hidden border flex-1 min-h-[300px]">
                            <div ref={containerRef} style={containerStyle}>
                                <Stage
                                    ref={stageRef}
                                    width={image?.width || 800}
                                    height={image?.height || 600}
                                    scaleX={scale}
                                    scaleY={scale}
                                    x={position.x}
                                    y={position.y}
                                    onWheel={handleWheel}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onDragStart={handleDragStart}
                                    onDragMove={handleDragMove}
                                    onDragEnd={handleDragEnd}
                                    draggable={isDragMode}
                                    style={{
                                        cursor: isDragMode ? 'grab' : isSelecting ? 'crosshair' : 'default'
                                    }}
                                >
                                    <Layer>
                                        {/* 图片 */}
                                        {image && (
                                            <KonvaImage image={image} width={image.width} height={image.height}/>
                                        )}

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
                    </div>

                    {/* 右侧 - 标注表单和列表 */}
                    <div className="space-y-4">
                        {/* 标注表单 - 只在有选择区域时显示 */}
                        {selectionArea && selectionArea.width > 0 && selectionArea.height > 0 && (
                            <div className="space-y-4 p-4 border rounded-lg">
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
                                            <div className="text-sm p-2">
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

                        <Card className="max-h-[52vh]">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>标注列表</span>
                                    <Badge variant="outline">{annotations.length}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[500px]">
                                    {annotations.length > 0 ? (
                                        <div className="space-y-2">
                                            {annotations.map((area, index) => (
                                                <div key={area.id} className="group">
                                                    <div
                                                        className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                                        <div
                                                            className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5"
                                                            style={{
                                                                backgroundColor: stringToColor(area.label || '区域')
                                                            }}
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
                                                            <Trash2 className="w-3 h-3"/>
                                                        </Button>
                                                    </div>
                                                    {index < annotations.length - 1 && <Separator/>}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center">
                                            <div
                                                className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Target className="w-6 h-6 text-gray-400"/>
                                            </div>
                                            <div className="text-sm text-gray-500 mb-1">暂无标注</div>
                                            <div className="text-xs text-gray-400">
                                                在左侧图片上拖拽选择区域开始标注
                                            </div>
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <DialogFooter className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {isDragMode ? (
                            <span className="flex items-center gap-1">
                                <Move className="w-4 h-4"/> 拖拽模式 - 松开空格键返回标注
                            </span>
                        ) : (
                            <span className="flex items-center gap-1">
                                <SquareDashedMousePointer className="w-4 h-4"/> 标注模式 - 按住空格键拖拽画布
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            关闭
                        </Button>
                        <Button
                            onClick={saveToDatabase}
                            disabled={annotations.length === 0 || isSaving}
                            className="flex items-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin"/>
                                    保存中...
                                </>
                            ) : (
                                '保存标注'
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
