import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { SquareSplitVertical } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAtomValue } from 'jotai/index';
import { selectedModelInfoAtom } from '@/atoms';
import { i18n } from '@/i18n';

const items = [
    { value: 'auto', label: '自动', desc: '自动进行分块设置' },
    { value: 'custom', label: '自定义', desc: '可自定义分块规则参数' },
    { value: 'page', label: '逐页', desc: '逐页进行分块(暂只支持pdf文件)' }
];

export function ChunkStrategyDialog({
    children,
    fileIds,
    fileExt,
    open: controlledOpen,
    onOpenChange
}: {
    children?: ReactNode;
    fileIds: string[];
    fileExt: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    const { projectId } = useParams();
    const model = useAtomValue(selectedModelInfoAtom);
    const [localOpen, setLocalOpen] = useState(false);
    const isOpen = controlledOpen !== undefined ? controlledOpen : localOpen;
    const setIsOpen = onOpenChange || setLocalOpen;
    const [formData, setFormData] = useState({
        fileIds: fileIds,
        strategy: 'auto',
        separators: '',
        chunkSize: 3000,
        chunkOverlap: 150
    });
    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = () => {
        axios
            .post(`/api/project/${projectId}/documents/chunker`, {
                ...formData,
                modelConfigId: model.id,
                fileIds,
                language: i18n.language
            })
            .then(res => {
                if (res.data.success) {
                    toast.success('分块成功');
                    setIsOpen(false);
                } else {
                    toast.error('分块失败');
                }
            })
            .catch(err => {
                console.log(err);
            });
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                {children || (
                    <Button variant="ghost" size="icon" className={'hover:cursor-pointer'}>
                        <SquareSplitVertical size={30} />
                    </Button>
                )}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Chunker 策略</AlertDialogTitle>
                </AlertDialogHeader>
                <div className={'space-y-4'}>
                    <div className="space-y-4">
                        <div className="text-foreground text-sm leading-none font-medium">分块策略</div>
                        <RadioGroup
                            className="gap-2"
                            value={formData.strategy}
                            onValueChange={value => handleChange('strategy', value)}
                        >
                            {items.map(item => (
                                <div
                                    key={`${item.value}`}
                                    className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none"
                                >
                                    <RadioGroupItem
                                        value={item.value}
                                        disabled={fileExt !== '.pdf' && item.value === 'page'}
                                        className="order-1 after:absolute after:inset-0"
                                    />
                                    <div className="grid grow gap-2">
                                        <Label htmlFor={`${item.value}`}>{item.label}</Label>
                                        <p className="text-muted-foreground text-xs">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    {formData.strategy === 'custom' && (
                        <>
                            <div className="space-y-4">
                                <Label className={'text-sm'}>自定义字符</Label>
                                <Input
                                    type={'text'}
                                    value={formData.separators}
                                    onChange={e => handleChange('separators', e.target.value)}
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className={'text-sm'}>最大字符数</Label>
                                <Input
                                    type={'number'}
                                    value={formData.chunkSize}
                                    onChange={e => handleChange('chunkSize', e.target.value)}
                                />
                            </div>
                            <div className="space-y-4">
                                <Label className={'text-sm'}>字符重叠数</Label>
                                <Input
                                    type={'number'}
                                    value={formData.chunkOverlap}
                                    onChange={e => handleChange('chunkOverlap', e.target.value)}
                                />
                            </div>
                        </>
                    )}
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <Button onClick={handleSubmit}>确认</Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
