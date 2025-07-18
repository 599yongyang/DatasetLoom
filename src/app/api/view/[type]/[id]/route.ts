import { type NextRequest, NextResponse } from 'next/server';
import { createReadStream } from 'fs';
import { getImageFileById } from '@/server/db/image-file';
import { getUserById } from '@/server/db/users';
import path from 'path';

// 获取文件路径
async function getFilePath(type: string, id: string): Promise<string | null> {
    if (type === 'image') {
        const imageFile = await getImageFileById(id);
        return imageFile?.url ?? null;
    } else {
        const user = await getUserById(id);
        return user?.avatar ?? null;
    }
}

// GET 接口
export async function GET(_req: NextRequest, props: { params: Promise<{ type: string; id: string }> }) {
    const params = await props.params;
    const { type, id } = params;
    try {
        const filePath = await getFilePath(type, id);

        if (!filePath) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        const MIME_MAP: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };

        const file = createReadStream(filePath);
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_MAP[ext] ?? 'application/octet-stream';
        return new NextResponse(file as any as ReadableStream, {
            headers: { 'Content-Type': contentType }
        });
    } catch (error) {
        console.error(`Error fetching file: ${error}`);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
