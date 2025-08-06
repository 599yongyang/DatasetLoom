'use client';

import {useState} from 'react';
import {RotateCcwKey} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Label} from '@/components/ui/label';
import * as React from 'react';
import PasswordInput from '@/components/ui/password-input';
import {toast} from 'sonner';
import apiClient from '@/lib/axios';
import {deleteSession} from "@/lib/session";

export function EditPassword({open, setOpen}: { open: boolean; setOpen: (open: boolean) => void }) {
    const [passwordFrom, setPasswordFrom] = useState({
        password: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const handleChange = (field: string, value: string) => {
        setPasswordFrom(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        if (passwordFrom.newPassword !== passwordFrom.confirmNewPassword) {
            toast.error('新密码和确认密码不一致');
            return;
        }
        if (passwordFrom.password.length < 6) {
            toast.error('密码长度不能小于6位');
            return;
        }
        toast.promise(apiClient.patch('/user/set-password', passwordFrom), {
            loading: '修改中...',
            success: async () => {
                await deleteSession();
                return '修改成功';
            },
            error: errr => {
                return errr.response?.data?.error || '操作失败';
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <div className="flex flex-col gap-2">
                    <div
                        className="flex size-11 shrink-0 items-center justify-center rounded-full border"
                        aria-hidden="true"
                    >
                        <RotateCcwKey className="opacity-80"/>
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-left">修改密码</DialogTitle>
                    </DialogHeader>
                </div>

                <form className="space-y-5">
                    <div className="space-y-4">
                        <div className="*:not-first:mt-2">
                            <Label>旧密码</Label>
                            <PasswordInput
                                placeholder="*********"
                                value={passwordFrom.password ?? ''}
                                onChange={value => handleChange('password', value)}
                            />
                        </div>
                        <div className="*:not-first:mt-2">
                            <Label>新密码</Label>
                            <PasswordInput
                                placeholder="*********"
                                value={passwordFrom.newPassword ?? ''}
                                onChange={value => handleChange('newPassword', value)}
                            />
                        </div>
                        <div className="*:not-first:mt-2">
                            <Label>确认新密码</Label>
                            <PasswordInput
                                placeholder="*********"
                                value={passwordFrom.confirmNewPassword ?? ''}
                                onChange={value => handleChange('confirmNewPassword', value)}
                            />
                        </div>
                    </div>
                    <Button type="button" className="w-full" onClick={handleSubmit}>
                        确认修改
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
