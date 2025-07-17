import { type NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { readFileSync } from 'fs';
import { getImageFileById } from '@/server/db/image-file';

export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    try {
        const imageFile = await getImageFileById(id);
        if (!imageFile) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        const ext = path.extname(imageFile.url).toLowerCase();
        const mimeMap: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };
        const file = readFileSync(imageFile.url);
        return new NextResponse(file, {
            headers: { 'Content-Type': mimeMap[ext] ?? 'application/octet-stream' }
        });
    } catch {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
}
