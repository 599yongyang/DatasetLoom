import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { getDatasets } from '@/lib/db/datasets';
import { getProjectRoot } from '@/lib/utils/file';
import archiver from 'archiver';

interface ExportRequest {
    formatType: string;
    systemPrompt: string;
    confirmedOnly: boolean;
    includeCOT: boolean;
}

interface DatasetConfig {
    [key: string]: {
        file_name: string;
        columns: Record<string, string>;
        formatting?: string;
        tags?: Record<string, string>;
    };
}

type Params = Promise<{ projectId: string }>;

export async function POST(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId } = params;
        const { formatType, systemPrompt, confirmedOnly, includeCOT } = await request.json();

        // 获取项目根目录
        const projectRoot = await getProjectRoot();
        const tempDir = path.join(projectRoot, projectId);

        // 确保临时目录存在
        await fs.promises.mkdir(tempDir, { recursive: true });

        // 定义文件路径
        const filePaths = {
            config: path.join(tempDir, 'dataset_info.json'),
            alpaca: path.join(tempDir, 'alpaca.json'),
            sharegpt: path.join(tempDir, 'sharegpt.json'),
            zip: path.join(tempDir, `${projectId}_datasets.zip`)
        };

        // 获取数据集
        const datasets = await getDatasets(projectId, confirmedOnly);

        // 创建数据集配置
        const config: DatasetConfig = {
            [`[Easy Dataset] [${projectId}] Alpaca`]: {
                file_name: 'alpaca.json',
                columns: {
                    prompt: 'instruction',
                    query: 'input',
                    response: 'output',
                    system: 'system'
                }
            },
            [`[Easy Dataset] [${projectId}] ShareGPT`]: {
                file_name: 'sharegpt.json',
                formatting: 'sharegpt',
                columns: {
                    messages: 'messages'
                },
                tags: {
                    role_tag: 'role',
                    content_tag: 'content',
                    user_tag: 'user',
                    assistant_tag: 'assistant',
                    system_tag: 'system'
                }
            }
        };

        // 生成数据内容
        const alpacaData = datasets.map(({ question, answer, cot }) => ({
            instruction: question,
            input: '',
            output: includeCOT && cot ? `<think>${cot}</think>\n${answer}` : answer,
            system: systemPrompt || ''
        }));

        const sharegptData = datasets.map(({ question, answer, cot }) => {
            const messages = systemPrompt ? [{ role: 'system', content: systemPrompt }] : [];

            messages.push(
                { role: 'user', content: question },
                {
                    role: 'assistant',
                    content: includeCOT && cot ? `<think>${cot}</think>\n${answer}` : answer
                }
            );

            return { messages };
        });

        // 并行写入文件
        await Promise.all([
            fs.promises.writeFile(filePaths.config, JSON.stringify(config, null, 2)),
            fs.promises.writeFile(filePaths.alpaca, JSON.stringify(alpacaData, null, 2)),
            fs.promises.writeFile(filePaths.sharegpt, JSON.stringify(sharegptData, null, 2))
        ]);

        // 创建ZIP压缩包
        const output = fs.createWriteStream(filePaths.zip);
        const archive = archiver('zip', { zlib: { level: 9 } });

        await new Promise((resolve, reject) => {
            // @ts-ignore
            output.on('close', resolve);
            archive.on('error', reject);

            archive.pipe(output);
            archive.file(filePaths.config, { name: 'dataset_info.json' });
            archive.file(filePaths.alpaca, { name: 'alpaca.json' });
            archive.file(filePaths.sharegpt, { name: 'sharegpt.json' });
            archive.finalize();
        });

        // 读取ZIP文件内容
        const zipData = await fs.promises.readFile(filePaths.zip);

        // 清理临时文件
        await Promise.all([
            fs.promises.unlink(filePaths.config),
            fs.promises.unlink(filePaths.alpaca),
            fs.promises.unlink(filePaths.sharegpt),
            fs.promises.unlink(filePaths.zip)
        ]);

        // 返回ZIP文件下载
        return new NextResponse(zipData, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename=${projectId}_datasets.zip`
            }
        });
    } catch (error) {
        console.error('Error generating dataset files:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to generate dataset files' },
            { status: 500 }
        );
    }
}
