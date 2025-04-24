// app/api/upload/route.ts 或 pages/api/upload.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

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

// 保存路径指向 public/uploads
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function POST(request: Request) {
    if (request.body === null) {
        return new Response('Request body is empty', { status: 400 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as Blob;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const validatedFile = FileSchema.safeParse({ file });

        if (!validatedFile.success) {
            const errorMessage = validatedFile.error.errors.map(error => error.message).join(', ');

            return NextResponse.json({ error: errorMessage }, { status: 400 });
        }

        const originalFile = formData.get('file') as File;
        const filename = originalFile.name;
        const contentType = originalFile.type;
        const buffer = Buffer.from(await file.arrayBuffer());

        // 确保 public/uploads 存在
        try {
            await fs.access(UPLOAD_DIR);
        } catch {
            await fs.mkdir(UPLOAD_DIR, { recursive: true });
        }

        const filePath = path.join(UPLOAD_DIR, filename);
        await fs.writeFile(filePath, buffer);
        const url = `/uploads/${encodeURIComponent(filename)}`;

        return NextResponse.json({
            url,
            name: filename,
            contentType
        });
    } catch (error) {
        console.error('Error saving file:', error);
        return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
    }
}
