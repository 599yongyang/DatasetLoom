import { tmpdir } from 'os';
import { join, basename } from 'path';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import archiver from 'archiver';
import { getExportDatasetWithDPO, getExportDatasetWithRawOrSFT } from '@/server/db/dataset';
import { getImageFileUrl } from '@/server/db/image-file';
import { ContextType } from '@/server/db/types';
import type { DatasetExportType } from '@/lib/data-dictionary';

type ExportParams = {
    projectId: string;
    contextType: ContextType;
    fileFormat: 'alpaca' | 'sharegpt';
    exportType: DatasetExportType;
    dataType: string;
    confirmedOnly: boolean;
    includeCOT?: boolean;
};

// 获取导出数据
export async function getExportDataset(params: ExportParams) {
    const { projectId, contextType, dataType, confirmedOnly, fileFormat } = params;
    // 获取数据集
    const dataset =
        dataType === 'dpo'
            ? await getExportDatasetWithDPO(projectId, contextType, confirmedOnly)
            : await getExportDatasetWithRawOrSFT(params);
    // 格式化数据
    const formattedData =
        dataType === 'dpo'
            ? formatDPOData(dataset, fileFormat, contextType)
            : formatData(dataset, fileFormat, contextType);
    return formattedData;
}

//生成数据集
export async function exportDataset(params: ExportParams) {
    const { projectId, fileFormat, contextType, dataType, exportType, confirmedOnly } = params;
    const filename = `DatasetLoom-${projectId}-${dataType}.zip`;
    const zipPath = join(tmpdir(), filename);

    const output = createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(output);

    try {
        // 获取数据集
        const dataset =
            dataType === 'dpo'
                ? await getExportDatasetWithDPO(projectId, contextType, confirmedOnly)
                : await getExportDatasetWithRawOrSFT(params);
        // 处理媒体文件
        const enrichedData = await enrichWithMediaFiles(dataset, contextType, archive);

        // 格式化数据
        const formattedData =
            dataType === 'dpo'
                ? formatDPOData(enrichedData, fileFormat, contextType)
                : formatData(enrichedData, fileFormat, contextType);

        // 添加主数据集文件
        const datasetFilename = `${dataType}_dataset.json`;
        await addJsonToArchive(archive, datasetFilename, formattedData);

        if (exportType === 'LLAMA_FACTORY') {
            console.log('LLAMA_FACTORY');
            // 添加数据集信息文件
            const datasetInfo = getDatasetInfo(dataType, fileFormat, datasetFilename);
            console.log(datasetInfo, 'datasetInfo');
            if (datasetInfo) {
                await addJsonToArchive(archive, 'dataset_info.json', datasetInfo);
            }
        }

        await archive.finalize();
        return { filePath: zipPath, filename };
    } catch (error) {
        await fs.unlink(zipPath).catch(() => null);
        throw error;
    }
}

async function enrichWithMediaFiles(data: any[], contextType: string, archive: archiver.Archiver) {
    if (contextType === ContextType.TEXT) return data;

    return Promise.all(
        data.map(async item => {
            const { contextId } = item.questions;
            if (contextType === ContextType.IMAGE) {
                const image = await getImageFileUrl(contextId);
                if (image?.url) {
                    try {
                        await fs.access(image.url);
                        const filename = basename(image.url);
                        archive.file(image.url, { name: `images/${filename}` });
                        return { ...item, url: `images/${filename}` };
                    } catch {
                        console.warn(`文件不存在: ${image.url}`);
                        return item;
                    }
                }
            }
            return item;
        })
    );
}

function formatDPOData(data: any[], format: string, contextType: ContextType) {
    if (format !== 'sharegpt') return data;

    return data.map(item => {
        const base = {
            conversations: [
                {
                    from: 'human',
                    value: formatMediaPrompt(item.questions?.realQuestion || item.prompt, contextType)
                },
                { from: 'gpt', value: item.chosen }
            ],
            chosen: { from: 'gpt', value: item.chosen },
            rejected: { from: 'gpt', value: item.rejected }
        };
        return withMediaResource(base, item.url, contextType);
    });
}

function formatData(data: any[], format: string, contextType: ContextType) {
    if (format !== 'sharegpt') return data;
    return data.map(item => {
        // 基础对话结构
        const base = {
            conversations: [
                {
                    from: 'human',
                    value: formatMediaPrompt(item.questions?.realQuestion || item.question, contextType)
                },
                { from: 'gpt', value: item.answer }
            ]
        };

        return withMediaResource(base, item.url, contextType);
    });
}

function formatMediaPrompt(prompt: string, contextType: ContextType): string {
    switch (contextType) {
        case ContextType.IMAGE:
            return `<image>${prompt}`;
        case ContextType.VIDEO:
            return `<video>${prompt}`;
        case ContextType.AUDIO:
            return `<audio>${prompt}`;
        default:
            return prompt;
    }
}

//根据数据类型和文件格式生成数据集信息
function getDatasetInfo(dataType: string, fileFormat: string, datasetFilename: string) {
    const baseInfo = {
        DatasetLoom: {
            file_name: datasetFilename,
            ranking: dataType === 'dpo'
        }
    };

    if (dataType === 'dpo') {
        return {
            ...baseInfo,
            DatasetLoom: {
                ...baseInfo.DatasetLoom,
                columns:
                    fileFormat === 'alpaca'
                        ? {
                              prompt: 'instruction',
                              query: 'input',
                              chosen: 'chosen',
                              rejected: 'rejected'
                          }
                        : {
                              messages: 'conversations',
                              chosen: 'chosen',
                              rejected: 'rejected'
                          }
            }
        };
    }

    if (dataType === 'sft') {
        if (fileFormat === 'alpaca') {
            return {
                ...baseInfo,
                DatasetLoom: {
                    ...baseInfo.DatasetLoom,
                    columns: {
                        prompt: 'instruction',
                        query: 'input',
                        response: 'output'
                    }
                }
            };
        }

        if (fileFormat === 'sharegpt') {
            return {
                ...baseInfo,
                DatasetLoom: {
                    ...baseInfo.DatasetLoom,
                    columns: {
                        messages: 'conversations',
                        system: 'system',
                        tools: 'tools',
                        images: 'images',
                        videos: 'videos',
                        audios: 'audios'
                    }
                }
            };
        }
    }

    return null;
}

function withMediaResource(base: any, url: string | undefined, contextType: ContextType) {
    if (!url) return base;
    switch (contextType) {
        case ContextType.IMAGE:
            return { ...base, images: [url] };
        case ContextType.VIDEO:
            return { ...base, videos: [url] };
        case ContextType.AUDIO:
            return { ...base, audios: [url] };
        default:
            return base;
    }
}

async function addJsonToArchive(archive: archiver.Archiver, name: string, data: any) {
    let jsonString: string;
    try {
        jsonString = JSON.stringify(data, null, 2);
    } catch (err) {
        throw new Error('数据序列化失败: ' + err);
    }

    // 根据大小选择策略(>100MB)
    if (Buffer.byteLength(jsonString) > 100 * 1024 * 1024) {
        const tempFile = join(tmpdir(), `temp-${Date.now()}-${Math.random().toString(36).substring(2, 10)}.json`);
        await fs.writeFile(tempFile, jsonString);
        archive.file(tempFile, { name });
        archive.on('end', () => fs.unlink(tempFile).catch(() => {}));
    } else {
        archive.append(jsonString, { name });
    }
}
