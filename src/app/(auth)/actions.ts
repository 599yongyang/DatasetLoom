'use server';

import { z } from 'zod';

import { signIn } from '@/server/auth';
import { createUser, getUserByEmail } from '@/lib/db/users';
import type { Users } from '@prisma/client';

const signUpSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6)
});
const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

export interface LoginActionState {
    status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

export const login = async (_: LoginActionState, formData: FormData): Promise<LoginActionState> => {
    try {
        const validatedData = signInSchema.parse({
            email: formData.get('email'),
            password: formData.get('password')
        });
        await signIn('credentials', {
            email: validatedData.email,
            password: validatedData.password,
            redirect: false
        });
        return { status: 'success' };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { status: 'invalid_data' };
        }

        return { status: 'failed' };
    }
};

export interface RegisterActionState {
    status: 'idle' | 'in_progress' | 'success' | 'failed' | 'user_exists' | 'invalid_data';
}

export const register = async (_: RegisterActionState, formData: FormData): Promise<RegisterActionState> => {
    try {
        const validatedData = signUpSchema.parse({
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password')
        });

        const user = await getUserByEmail(validatedData.email);

        if (user) {
            return { status: 'user_exists' } as RegisterActionState;
        }
        const data = {
            email: validatedData.email,
            password: validatedData.password,
            name: validatedData.name
        };
        await createUser(data as Users);
        await signIn('credentials', {
            email: validatedData.email,
            password: validatedData.password,
            redirect: false
        });

        return { status: 'success' };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { status: 'invalid_data' };
        }

        return { status: 'failed' };
    }
};
