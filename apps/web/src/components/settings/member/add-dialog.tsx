'use client';

import React, { useState } from 'react';
import { UserRoundPlusIcon, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInputList } from '@/hooks/use-input-list';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { availableRoles, projectRoleMap } from '@/constants/data-dictionary';
import { ProjectRole } from '@repo/shared-types';
import { SubmitButton } from '@/components/common/submit-button';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/axios';

export function ProjectMemberDialog({
                                        open,
                                        setOpen,
                                        refresh
                                    }: {
    open: boolean;
    setOpen: (open: boolean) => void;
    refresh: () => void;
}) {
    const { projectId } = useParams();
    const [isSuccessful, setIsSuccessful] = useState(false);
    const { list: emails, add: addEmails, remove: removeEmails, update: updateEmails } = useInputList(['']);
    const [role, setRole] = useState(ProjectRole.VIEWER);
    const handleSubmit = () => {
        if (!emails.filter(email => email.trim() !== '').length) {
            toast.error('请填写邮箱');
            return;
        }
        toast.promise(
            apiClient.post(`/${projectId}/project-member/create`, { emails, role }),
            {
                loading: '保存中',
                success: async data => {
                    setIsSuccessful(true);
                    setOpen(false);
                    refresh();
                    return '操作成功';
                },
                error: error => {
                    return error.response?.data?.error || '操作失败';
                }
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className={'sm:max-w-[400px]'}>
                <div className="flex flex-col gap-2">
                    <div
                        className="flex size-11 shrink-0 items-center justify-center rounded-full border"
                        aria-hidden="true"
                    >
                        <UserRoundPlusIcon className="opacity-80" size={16} />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-left">添加项目成员</DialogTitle>
                    </DialogHeader>
                </div>

                <div className="space-y-5">
                    <div className="space-y-4">
                        <div className="*:not-first:mt-2">
                            <Label>邮箱</Label>
                            <div className="space-y-3">
                                {emails.map((email, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            key={index}
                                            id={`team-email-${index + 1}`}
                                            placeholder="x@example.com"
                                            type="email"
                                            value={email}
                                            onChange={e => updateEmails(index, e.target.value)}
                                        />
                                        {emails.length > 1 && (
                                            <Button variant="outline" size={'icon'} onClick={() => removeEmails(index)}>
                                                <X />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button type="button" onClick={addEmails} className="text-sm underline hover:no-underline">
                            + 继续添加
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div className="*:not-first:mt-2">
                            <Label>项目权限</Label>
                            <div className="space-y-3">
                                <Select value={role} onValueChange={value => setRole(value as ProjectRole)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="选择权限等级" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableRoles.map(role => (
                                            <SelectItem key={role} value={role}>
                                                {projectRoleMap[role]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <SubmitButton className={'w-full'} onClick={handleSubmit} isSuccessful={isSuccessful}>
                        添加成员
                    </SubmitButton>
                </div>
            </DialogContent>
        </Dialog>
    );
}
