'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SubmitButton } from '@/components/common/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import * as React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { AuthSidePanel } from '@/components/auth/side-panel';
import apiClient from '@/lib/axios';
import { createSession } from '@/lib/session';
import { z } from 'zod';
import { useSetAtom } from 'jotai/index';
import { userInfoAtom } from '@/atoms';

const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

export default function Page() {
    const router = useRouter();
    const [isSuccessful, setIsSuccessful] = useState(false);
    const setUserInfo = useSetAtom(userInfoAtom);
    const handleSubmit = (formData: FormData) => {
        try {
            const validatedData = signInSchema.parse({
                email: formData.get('email'),
                password: formData.get('password')
            });

            apiClient.post(`/auth/login`, validatedData).then(async (res) => {
                const payload = {
                    user: {
                        id: res.data.data.id,
                        name: res.data.data.name,
                        avatar: res.data.data.avatar || '',
                        email: res.data.data.email,
                        permissions: res.data.data.projectMembers
                    },
                    accessToken: res.data.data.accessToken,
                    refreshToken: res.data.data.refreshToken
                };
                await createSession(payload);
                setUserInfo(payload.user);
                setIsSuccessful(true);
                router.push('/');
            }).catch(err => {
                console.log(err);
                toast.error('账户或密码错误！');
            });
        } catch (error) {
            console.log(error);
            toast.error('账户或密码错误！');
        }
    };


    return (
        <div className="grid min-h-screen lg:grid-cols-2 bg-background">
            {/* 左侧区域 */}
            <div className="flex flex-col p-6 md:p-12 lg:p-16">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="self-start mb-8"
                >
                    <Image
                        src="/full-logo.svg"
                        width={160}
                        height={80}
                        alt="logo"
                        className="hover:scale-105 transition-transform duration-300"
                    />
                </motion.div>

                {/* 表单内容  */}
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-md space-y-8 -mt-16">
                        <div className="text-center space-y-2">
                            <div className="text-center space-y-2">
                                <motion.h1
                                    initial={{ y: -10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-3xl font-bold text-foreground"
                                >
                                    👋 欢迎回来
                                </motion.h1>
                                <motion.p
                                    initial={{ y: -10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-muted-foreground text-sm"
                                >
                                    准备好构建你的下一个数据集了吗？我们开始吧。
                                </motion.p>
                            </div>

                            <motion.form
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                action={handleSubmit}
                                className="mt-8 space-y-6"
                            >
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="email">邮箱</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="x@example.com"
                                            required
                                            className="mt-1 h-11 focus-visible:ring-2 focus-visible:ring-primary"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password">密码</Label>
                                        </div>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            placeholder="*********"
                                            required
                                            className="mt-1 h-11 focus-visible:ring-2 focus-visible:ring-primary"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <SubmitButton
                                        isSuccessful={isSuccessful}
                                        className="w-full h-11 text-base font-medium bg-primary hover:bg-primary/90"
                                    >
                                        登录
                                    </SubmitButton>

                                    <p className="text-center text-sm text-muted-foreground">
                                        没有账户?{' '}
                                        <Link
                                            href="/register"
                                            className="font-semibold text-primary hover:text-primary/80 underline-offset-4 hover:underline"
                                        >
                                            立即注册
                                        </Link>
                                    </p>
                                </div>
                            </motion.form>
                        </div>
                    </div>
                </div>
            </div>

            {/* 右侧区域 */}
            <AuthSidePanel />
        </div>
    );
}
