import {Injectable} from '@nestjs/common';
import {PrismaService} from '@/common/prisma/prisma.service';
import {createWriteStream} from 'fs';
import {ExportQaDatasetDto} from '@/dataset/qa/dto/export-qa-dataset.dto';
import {ContextType} from '@/common/prisma/enum';
import {basename, join} from 'path';
import {tmpdir} from 'os';
import fs from 'fs/promises';
import {ImagesService} from '@/knowledge/images/images.service';
import * as archiver from 'archiver';
import {ExportUtil} from '@/utils/export.util';
import {nanoid} from "nanoid";

@Injectable()
export class ExportDatasetService {

    constructor(private readonly prisma: PrismaService, private readonly imagesService: ImagesService) {
    }

    async getExportDataset(projectId: string, exportDto: ExportQaDatasetDto) {
        const {contextType, dataType, confirmedOnly, fileFormat} = exportDto;
        // 获取数据集
        const dataset =
            dataType === 'dpo'
                ? await this.getExportDatasetWithDPO(projectId, contextType, confirmedOnly)
                : await this.getExportDatasetWithRawOrSFT(projectId, exportDto);
        // 格式化数据
        return dataType === 'dpo'
            ? ExportUtil.formatDPOData(dataset, fileFormat, contextType)
            : ExportUtil.formatData(dataset, fileFormat, contextType);
    }

    async exportDataset(projectId: string, exportDto: ExportQaDatasetDto) {
        const {fileFormat, contextType, dataType, exportType, confirmedOnly} = exportDto;
        const filename = `DatasetLoom-${projectId}-${dataType}.zip`;
        const zipPath = join(tmpdir(), filename);

        const output = createWriteStream(zipPath);
        const archive = archiver('zip', {zlib: {level: 9}});
        archive.pipe(output);

        try {
            // 获取数据集
            const dataset =
                dataType === 'dpo'
                    ? await this.getExportDatasetWithDPO(projectId, contextType, confirmedOnly)
                    : await this.getExportDatasetWithRawOrSFT(projectId, exportDto);
            // 处理媒体文件
            const enrichedData = await this.enrichWithMediaFiles(dataset, contextType, archive);

            // 格式化数据
            const formattedData =
                dataType === 'dpo'
                    ? ExportUtil.formatDPOData(enrichedData, fileFormat, contextType)
                    : ExportUtil.formatData(enrichedData, fileFormat, contextType);

            // 添加主数据集文件
            const datasetFilename = `${dataType}_${nanoid()}_dataset.json`;
            await ExportUtil.addJsonToArchive(archive, datasetFilename, formattedData);

            if (exportType === 'LLAMA_FACTORY') {
                // 添加数据集信息文件
                const datasetInfo = ExportUtil.getDatasetInfo(dataType, fileFormat, datasetFilename);
                if (datasetInfo) {
                    await ExportUtil.addJsonToArchive(archive, 'dataset_info.json', datasetInfo);
                }
            }

            await archive.finalize();
            return {filePath: zipPath, filename};
        } catch (error) {
            await fs.unlink(zipPath).catch(() => null);
            throw error;
        }
    }

    private getExportDatasetWithDPO(projectId: string, contextType: string, confirmedOnly: boolean) {
        try {
            return this.prisma.preferencePair.findMany({
                where: {
                    projectId,
                    question: {
                        confirmed: confirmedOnly ? true : undefined,
                        contextType,
                    },
                },
                select: {
                    prompt: true,
                    chosen: true,
                    rejected: true,
                    question: {
                        select: {
                            contextId: true,
                            realQuestion: true,
                        },
                    },
                },
            });
        } catch (error) {
            console.error('Failed to export datasets in database');
            throw error;
        }
    }

    private getExportDatasetWithRawOrSFT(projectId: string, exportDto: ExportQaDatasetDto) {
        const {contextType, dataType, confirmedOnly, includeCOT} = exportDto;
        return this.prisma.datasetSamples.findMany({
            where: {
                projectId,
                questions: {
                    confirmed: confirmedOnly ? true : undefined,
                    contextType,
                },
                ...(dataType === 'sft' ? {isPrimaryAnswer: true} : {}),
            },
            select: {
                question: true,
                answer: true,
                cot: includeCOT,
                questions: {
                    select: {
                        contextId: true,
                        realQuestion: true,
                    },
                },
            },
        });
    }

    async enrichWithMediaFiles(data: any[], contextType: string, archive: archiver.Archiver) {
        if (contextType === ContextType.TEXT) return data;

        return Promise.all(
            data.map(async item => {
                const {contextId} = item.questions;
                if (contextType === ContextType.IMAGE) {
                    const image = await this.imagesService.getImageFileUrl(contextId);
                    if (image?.url) {
                        try {
                            await fs.access(image.url);
                            const filename = basename(image.url);
                            archive.file(image.url, {name: `images/${filename}`});
                            return {...item, url: `images/${filename}`};
                        } catch {
                            console.warn(`文件不存在: ${image.url}`);
                            return item;
                        }
                    }
                }
                return item;
            }),
        );
    }

}
