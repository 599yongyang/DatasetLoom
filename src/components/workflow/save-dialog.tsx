'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import type { WorkFlow } from '@prisma/client';

export default function SaveDialog({
    open,
    setOpen,
    formData,
    setFormData
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    formData: WorkFlow;
    setFormData: (formData: WorkFlow) => void;
}) {
    const { projectId, workflowId } = useParams<{ projectId: string; workflowId: string }>();
    const router = useRouter();
    const handleSave = () => {
        axios
            .post(`/api/project/${projectId}/workflow`, formData)
            .then(res => {
                if (res.status === 200) {
                    toast.success('保存成功！');
                    router.push(`/project/${projectId}/workflow`);
                }
            })
            .catch(err => {
                console.log(err);
            });
    };
    return (
        <Dialog open={open}>
            <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
                <DialogHeader className="contents space-y-0 text-left">
                    <DialogTitle className="border-b px-6 py-4 text-base">工作流配置</DialogTitle>
                </DialogHeader>
                <DialogDescription className="sr-only">
                    Make changes to your profile here. You can change your photo and set a username.
                </DialogDescription>
                <div className="overflow-y-auto">
                    <div className="px-6 pt-4 pb-6">
                        <form className="space-y-4">
                            <div className="*:not-first:mt-2">
                                <Label>名称</Label>
                                <div className="relative">
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="peer pe-9"
                                        placeholder="Username"
                                        defaultValue="margaret-villard-69"
                                        type="text"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="*:not-first:mt-2">
                                <Label>描述</Label>
                                <Textarea
                                    value={formData.description ?? ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </form>
                    </div>
                </div>
                <DialogFooter className="border-t px-6 py-4">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        取消
                    </Button>
                    <Button type="button" onClick={handleSave}>
                        保存
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
