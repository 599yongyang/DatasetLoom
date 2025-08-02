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
import { useTranslation } from 'react-i18next';

const items = [
    { value: 'auto', label: '自动', desc: '自动进行分块设置' },
    { value: 'custom', label: '自定义', desc: '可自定义分块规则参数' }
    // { value: 'page', label: '逐页', desc: '逐页进行分块(暂只支持pdf文件)' }
];

export function ChunkStrategyDialog({
    children,
    fileIds,
    fileExt,
    open: controlledOpen,
    onOpenChange,
    refresh
}: {
    children?: ReactNode;
    fileIds: string[];
    fileExt: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    refresh: () => void;
}) {
    const { projectId } = useParams();
    const { t } = useTranslation('chunk');
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

    const handleSubmit = async () => {
        try {
            const source = axios.CancelToken.source();
            const loadingToastId = toast.loading('处理分块中...', {
                position: 'top-right',
                action: {
                    label: '取消',
                    onClick: () => {
                        source.cancel('用户取消了操作');
                        toast.dismiss(loadingToastId);
                        toast.info('已取消生成', { position: 'top-right' });
                    }
                }
            });
            // 发起分块请求
            const chunkResponse = await axios.post(`/api/project/${projectId}/documents/chunker`, {
                ...formData,
                modelConfigId: model.id,
                fileIds,
                language: i18n.language
            });

            if (!chunkResponse.data.success) {
                throw new Error(chunkResponse.data.message || '分块请求失败');
            }
            setIsOpen(false);
            // 确认分块结果
            const confirmResponse = await axios.put(
                `/api/project/${projectId}/documents/chunker`,
                {
                    chunkConfigHash: chunkResponse.data.hash,
                    modelConfigId: model.id,
                    language: i18n.language
                },
                {
                    cancelToken: source.token
                }
            );

            if (!confirmResponse.data.success) {
                throw new Error(confirmResponse.data.message || '分块确认失败');
            }

            // 成功处理
            toast.success('分块成功', { id: loadingToastId });
            refresh();
        } catch (error) {
            console.error('分块过程中出错:', error);
            toast.error('分块过程中发生未知错误');
        }
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
                    <AlertDialogTitle>{t('strategy_dialog.title')}</AlertDialogTitle>
                </AlertDialogHeader>
                <div className={'space-y-4'}>
                    <div className="space-y-4">
                        <div className="text-foreground text-sm leading-none font-medium">
                            {t('strategy_dialog.strategy.title')}
                        </div>
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
                                        <Label htmlFor={`${item.value}`}>
                                            {t(`strategy_dialog.strategy.options.${item.value}.label`)}
                                        </Label>
                                        <p className="text-muted-foreground text-xs">
                                            {t(`strategy_dialog.strategy.options.${item.value}.desc`)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    {formData.strategy === 'custom' && (
                        <>
                            <div className="space-y-4">
                                <Label className={'text-sm'}>{t('strategy_dialog.separators')}</Label>
                                <Input
                                    type={'text'}
                                    value={formData.separators}
                                    onChange={e => handleChange('separators', e.target.value)}
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className={'text-sm'}>{t('strategy_dialog.chunk_size')}</Label>
                                <Input
                                    type={'number'}
                                    value={formData.chunkSize}
                                    onChange={e => handleChange('chunkSize', e.target.value)}
                                />
                            </div>
                            <div className="space-y-4">
                                <Label className={'text-sm'}>{t('strategy_dialog.chunk_overlap')}</Label>
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
                    <AlertDialogCancel>{t('strategy_dialog.cancel_btn')}</AlertDialogCancel>
                    <Button onClick={handleSubmit}>{t('strategy_dialog.confirm_btn')}</Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
