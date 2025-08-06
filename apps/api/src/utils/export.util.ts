import { ContextType } from '@/common/prisma/enum';
import * as archiver from 'archiver';
import { join } from 'path';
import { tmpdir } from 'os';
import fs from 'fs/promises';

export class ExportUtil {
  static formatDPOData(data: any[], format: string, contextType: ContextType) {
    if (format !== 'sharegpt') return data;

    return data.map(item => {
      const base = {
        conversations: [
          {
            from: 'human',
            value: this.formatMediaPrompt(item.questions?.realQuestion || item.prompt, contextType),
          },
          { from: 'gpt', value: item.chosen },
        ],
        chosen: { from: 'gpt', value: item.chosen },
        rejected: { from: 'gpt', value: item.rejected },
      };
      return this.withMediaResource(base, item.url, contextType);
    });
  }

  static formatData(data: any[], format: string, contextType: ContextType) {
    if (format !== 'sharegpt') return data;
    return data.map(item => {
      // 基础对话结构
      const base = {
        conversations: [
          {
            from: 'human',
            value: this.formatMediaPrompt(item.questions?.realQuestion || item.question, contextType),
          },
          { from: 'gpt', value: item.answer },
        ],
      };

      return this.withMediaResource(base, item.url, contextType);
    });
  }


  static getDatasetInfo(dataType: string, fileFormat: string, datasetFilename: string) {
    const baseInfo = {
      DatasetLoom: {
        file_name: datasetFilename,
        ranking: dataType === 'dpo',
      },
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
                rejected: 'rejected',
              }
              : {
                messages: 'conversations',
                chosen: 'chosen',
                rejected: 'rejected',
              },
        },
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
              response: 'output',
            },
          },
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
              audios: 'audios',
            },
          },
        };
      }
    }

    return null;
  }

  static async addJsonToArchive(archive: archiver.Archiver, name: string, data: any) {
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
      archive.on('end', () => fs.unlink(tempFile).catch(() => {
      }));
    } else {
      archive.append(jsonString, { name });
    }
  }

  private static formatMediaPrompt(prompt: string, contextType: ContextType): string {
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

  private static withMediaResource(base: any, url: string | undefined, contextType: ContextType) {
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
}
