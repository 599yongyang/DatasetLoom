'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';

import { SubmitButton } from '@/components/submit-button';

import { register, type RegisterActionState } from '../actions';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineShadowText } from '@/components/ui/line-shadow-text';
import Form from 'next/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import * as React from 'react';

export default function Page() {
    const router = useRouter();

    const [isSuccessful, setIsSuccessful] = useState(false);

    const [state, formAction] = useActionState<RegisterActionState, FormData>(register, {
        status: 'idle'
    });

    useEffect(() => {
        if (state.status === 'user_exists') {
            toast.error('Account already exists!');
        } else if (state.status === 'failed') {
            toast.error('Failed to create account!');
        } else if (state.status === 'invalid_data') {
            toast.error('Failed validating your submission!');
        } else if (state.status === 'success') {
            toast.success('Account created successfully!');
            setIsSuccessful(true);
            router.push('/project');
        }
    }, [state]);

    const handleSubmit = (formData: FormData) => {
        formAction(formData);
    };

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <div className={'flex flex-col gap-6'}>
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-xl">
                                <div className="text-balance text-5xl font-semibold leading-none tracking-tighter">
                                    Dataset{' '}
                                    <LineShadowText className="italic" shadowColor={'black'}>
                                        Loom
                                    </LineShadowText>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form action={handleSubmit}>
                                <div className="grid gap-6">
                                    <div className="grid gap-6">
                                        <div className="grid gap-3">
                                            <Label htmlFor="name">Full name</Label>
                                            <Input id="name" name="name" placeholder="Your Name" type="text" required />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="m@example.com"
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <div className="flex items-center">
                                                <Label htmlFor="password">Password</Label>
                                                {/*<a*/}
                                                {/*    href="#"*/}
                                                {/*    className="ml-auto text-sm underline-offset-4 hover:underline"*/}
                                                {/*>*/}
                                                {/*    Forgot your password?*/}
                                                {/*</a>*/}
                                            </div>
                                            <Input id="password" name="password" type="password" required />
                                        </div>
                                        <SubmitButton isSuccessful={isSuccessful}>Sign Up</SubmitButton>
                                    </div>
                                </div>
                            </Form>
                        </CardContent>
                    </Card>
                    <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                        By clicking continue, you agree to our <a href="#">Terms of Service</a> and{' '}
                        <a href="#">Privacy Policy</a>.
                    </div>
                </div>
            </div>
        </div>
    );
}
