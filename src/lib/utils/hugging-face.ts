import * as hub from '@huggingface/hub';
import type { RepoDesignation } from '@huggingface/hub';
import { generateFileContent } from '@/lib/utils';
import { toast } from 'sonner';

export interface RemoteRepositoryData {
    token: string;
    repositoryName: string;
}

export interface UploadToHuggingFaceProps {
    remoteRepositoryData: RemoteRepositoryData;
    data: any;
    fileFormat: string;
    projectId: string;
    dataType: string;
}

export const uploadToHuggingFace = async (props: UploadToHuggingFaceProps) => {
    const { remoteRepositoryData, data, fileFormat, projectId, dataType } = props;
    const toastId = toast.loading('数据准备中...');

    try {
        const { name: username } = await hub.whoAmI({ accessToken: remoteRepositoryData.token });
        const repo: RepoDesignation = {
            type: 'dataset',
            name: `${username}/${remoteRepositoryData.repositoryName}`
        };

        // 检查仓库是否存在，不存在则创建
        try {
            await hub.checkRepoAccess({ repo, accessToken: remoteRepositoryData.token });
        } catch (e: any) {
            if (e instanceof hub.HubApiError && e.statusCode === 404) {
                await hub.createRepo({
                    repo,
                    accessToken: remoteRepositoryData.token,
                    license: 'mit',
                    private: true
                });
            } else {
                throw e;
            }
        }

        // 生成文件内容
        const { content, extension, mimeType } = generateFileContent(data, fileFormat);
        const blob = new Blob([content], { type: mimeType });
        const filePath = `datasets-${projectId}-${dataType}-${Date.now()}.${extension}`;

        // 开始上传并监听进度
        const files = [{ path: filePath, content: blob }];

        for await (const progressEvent of hub.uploadFilesWithProgress({
            repo,
            accessToken: remoteRepositoryData.token,
            files
        })) {
            if (progressEvent.event === 'phase') {
                console.log('当前阶段:', progressEvent.phase);
                if (progressEvent.phase === 'preuploading') {
                    toast.info('准备上传到 Hugging Face...', { id: toastId, duration: 10000 });
                }
            } else if (progressEvent.event === 'fileProgress') {
                const percent = Math.round(progressEvent.progress * 100);
                if (percent < 99) {
                    toast.info(`正在上传中...（${percent}%)`, { id: toastId, duration: 10000 });
                }
            }
        }

        // 上传完成
        toast.success('上传到 Hugging Face 完成', {
            id: toastId,
            duration: 2000
        });

        return filePath;
    } catch (error) {
        console.error('Upload failed:', error);
        toast.error('上传到 Hugging Face 失败', {
            id: toastId,
            duration: 3000
        });
        throw error;
    }
};
