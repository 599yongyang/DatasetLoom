import {Injectable} from '@nestjs/common';
import {ModelConfigWithProvider} from '@/common/prisma/type';
import {doubleCheckModelOutput} from '@/utils/model.util';
import {AIService} from "@/common/ai/ai.service";
import {documentAnalysisSchema} from "@/common/ai/prompts/schema";
import { getLabelPrompt, Language } from '@/common/ai/prompts/label';
import {Chunks, Projects} from '@prisma/client';
import {PrismaService} from "@/common/prisma/prisma.service";
import {DocumentChunkGraphService} from "@/chunk/document-chunk/document-chunk-graph.service";

@Injectable()
export class TagRelGenerator {
    constructor(private readonly aiService: AIService, private readonly prisma: PrismaService, private readonly chunkGraphService: DocumentChunkGraphService) {
    }

    async generate(chunk: Chunks, modelConfig: ModelConfigWithProvider, project: Projects, language: string) {

        try {
            // 1. 构建提示并检查token长度
            const prompt = getLabelPrompt({
                text: chunk.content,
                language: language as Language,
                globalPrompt: project.globalPrompt,
                domainTreePrompt: project.domainTreePrompt,
            });

            // 2. 调用大模型
            const {text} = await this.aiService.chat(modelConfig, prompt);
            // console.debug('模型响应:', text);

            // 3. 验证和解析输出
            const modelOutput = await doubleCheckModelOutput(text, documentAnalysisSchema);
            // console.debug('解析后的输出:', modelOutput);

            // 5. 保存结果
            await this.prisma.chunks.update({
                where: {id: chunk.id},
                data: {
                    id: chunk.id,
                    projectId: project.id,
                    summary: modelOutput.summary,
                    domain: modelOutput.domain,
                    subDomain: modelOutput.subDomain,
                    tags: Array.isArray(modelOutput.tags) ? modelOutput.tags.join(',') : '',
                    language
                }
            });

            if (modelOutput.entities && modelOutput.relations) {
                return this.chunkGraphService.createChunkGraph(chunk.id, modelOutput.entities, modelOutput.relations);
            }
        } catch (error) {
            console.error('处理分块时出错:', error);
            throw error;
        }
    }
}
