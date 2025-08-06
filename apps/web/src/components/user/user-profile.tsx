'use client';

import {ImagePlusIcon} from 'lucide-react';

import {useFileUpload} from '@/hooks/use-file-upload';
import {Button} from '@/components/ui/button';
import {Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useState} from 'react';
import {toast} from 'sonner';
import {updateUserInfo, UserInfo} from "@/lib/session";
import {BACKEND_URL} from "@/constants/config";
import apiClient from "@/lib/axios";

export function UserProfile({open, setOpen, user}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    user: UserInfo
}) {
    const [name, setName] = useState(user?.name!);
    const [{files}, {openFileDialog, getInputProps}] = useFileUpload({
        accept: 'image/*'
    });
    const currentImage = files[0]?.preview || (user.avatar ? BACKEND_URL + user.avatar : '');
    const handelSubmit = async () => {
        const formData = new FormData();
        if (files[0]?.file) {
            const file = files[0].file as File;
            formData.append('file', file);
        }
        formData.append('name', name);

        try {
            apiClient.patch('/user', formData).then(async (res) => {
                await updateUserInfo({
                    avatar: res.data.data.avatar,
                    name: res.data.data.name,
                });
                toast.success('修改成功');
                // await update({refresh: true});
                setOpen(false);
                // window.location.reload();
            });
        } catch (error) {
            toast.error('Failed to upload file, please try again!');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
                className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
                <DialogHeader className="contents space-y-0 text-left">
                    <DialogTitle className="border-b px-6 py-4 text-base">修改个人信息</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto">
                    <div className="mt-2 px-6 justify-center flex">
                        <div
                            className="border-background bg-muted relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 shadow-xs shadow-black/10">
                            {currentImage && (
                                <img
                                    src={currentImage}
                                    className="size-full object-cover"
                                    width={80}
                                    height={80}
                                    alt="Profile image"
                                />
                            )}
                            <button
                                type="button"
                                className="focus-visible:border-ring focus-visible:ring-ring/50 absolute flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
                                onClick={openFileDialog}
                                aria-label="Change profile picture"
                            >
                                <ImagePlusIcon size={16} aria-hidden="true"/>
                            </button>
                            <input {...getInputProps()} className="sr-only" aria-label="Upload profile picture"/>
                        </div>
                    </div>
                    <div className="px-6 pt-4 pb-6">
                        <form className="space-y-4">
                            <div className="*:not-first:mt-2">
                                <Label>邮箱</Label>
                                <div className="relative">
                                    <Input
                                        disabled={true}
                                        className="peer pe-9"
                                        defaultValue={user?.email!}
                                        type="text"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="*:not-first:mt-2">
                                <Label>昵称</Label>
                                <div className="relative">
                                    <Input
                                        value={name}
                                        defaultValue={user?.name!}
                                        onChange={e => setName(e.target.value)}
                                        className="peer pe-9"
                                        placeholder="Username"
                                        type="text"
                                        required
                                    />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <DialogFooter className="border-t px-6 py-4">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            取消
                        </Button>
                    </DialogClose>
                    <Button type="button" onClick={handelSubmit}>
                        保存修改
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
