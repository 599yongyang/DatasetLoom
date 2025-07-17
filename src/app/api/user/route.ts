import { NextResponse } from 'next/server';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';
import { getUserById, updatePassword, updateUser } from '@/server/db/users';
import { auth } from '@/server/auth';

const FileSchema = z.object({
    file: z
        .instanceof(Blob)
        .refine(file => file.size <= 5 * 1024 * 1024, {
            message: 'File size should be less than 5MB'
        })
        .refine(file => ['image/jpeg', 'image/png'].includes(file.type), {
            message: 'File type should be JPEG or PNG'
        })
});

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'avatar');

export async function POST(request: Request) {
    if (request.body === null) {
        return new Response('Request body is empty', { status: 400 });
    }

    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return new Response('Unauthorized', { status: 401 });
        }
        const formData = await request.formData();
        const file = formData.get('file') as Blob;
        const name = formData.get('name') as string;
        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        let url = '';
        if (file) {
            const validatedFile = FileSchema.safeParse({ file });
            if (!validatedFile.success) {
                const errorMessage = validatedFile.error.errors.map(error => error.message).join(', ');

                return NextResponse.json({ error: errorMessage }, { status: 400 });
            }
            const originalFile = formData.get('file') as File;
            const fileExt = path.extname(originalFile.name);
            const newFileName = nanoid() + fileExt;
            const buffer = Buffer.from(await file.arrayBuffer());
            try {
                await fs.access(UPLOAD_DIR);
            } catch {
                await fs.mkdir(UPLOAD_DIR, { recursive: true });
            }
            const filePath = path.join(UPLOAD_DIR, newFileName);
            await fs.writeFile(filePath, buffer);
            url = `/avatar/${encodeURIComponent(newFileName)}`;
        }

        await updateUser(name, url, session.user.id);
        return NextResponse.json({ message: 'Profile saved successfully' });
    } catch (error) {
        console.error('Error saving user profile:', error);
        return NextResponse.json({ error: 'Failed to save user profile' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return new Response('Unauthorized', { status: 401 });
        }
        const { password, newPassword } = await request.json();
        const user = await getUserById(session.user.id);
        if (!user) {
            return NextResponse.json({ error: '用户不存在' }, { status: 404 });
        }
        if (user.password !== password) {
            return NextResponse.json({ error: '密码错误' }, { status: 400 });
        }
        await updatePassword(user.id, newPassword);
        return NextResponse.json({ message: 'Password update successfully' });
    } catch (error) {
        console.error('Error update user password:', error);
        return NextResponse.json({ error: 'Failed to update user password' }, { status: 500 });
    }
}
