import { Injectable } from '@nestjs/common';
import { ModelConfigWithProvider } from '@/common/prisma/type';
import { doubleCheckModelOutput } from '@/utils/model.util';
import { AIService } from '@/common/ai/ai.service';
import { documentAnalysisSchema } from '@/common/ai/prompts/schema';
import { PrismaService } from '@/common/prisma/prisma.service';
import { DocumentGraphService } from '@/knowledge/document/document-graph.service';
import { labelSystemPrompt } from '@/common/ai/prompts/system';
import Handlebars from 'handlebars';
import { PromptTemplateService } from '@/setting/prompt-template/prompt-template.service';
import { ResponseUtil } from '@/utils/response.util';
import { AiGenDto } from '@/common/dto/ai-gen.dto';

@Injectable()
export class TagRelGenerator {
    constructor(
        private readonly aiService: AIService,
        private readonly prisma: PrismaService,
        private readonly chunkGraphService: DocumentGraphService,
        private readonly promptTemplateService: PromptTemplateService
    ) {
    }

    async generate(genTagRelDto: AiGenDto, modelConfig: ModelConfigWithProvider) {
        try {
            const { projectId, templateId, variablesData, itemId } = genTagRelDto;

            // 获取文本块内容
            const chunks = await this.prisma.chunks.findMany({
                where: { documentId: itemId }
            });

            if (!chunks || chunks.length === 0) {
                return ResponseUtil.error('暂无可分析文本块');
            }

            if (!templateId) {
                return ResponseUtil.error('请选择一个模板');
            }

            const promptTemplate = await this.promptTemplateService.getInfoById(templateId, projectId);
            if (!promptTemplate) {
                throw new Error('Prompt template not found');
            }

            const template = Handlebars.compile(promptTemplate.content);

            // 使用 Promise.all 等待所有异步操作完成
            const results = await Promise.allSettled(
                chunks.map(async (chunk) => {
                    try {
                        const prompt = template({
                            ...variablesData,
                            context: chunk.content
                        });

                        const { text } = await this.aiService.chat(modelConfig, prompt, labelSystemPrompt);

                        const modelOutput = await doubleCheckModelOutput(
                            text,
                            documentAnalysisSchema
                        );

                        // 更新 chunk 数据
                        await this.prisma.chunks.update({
                            where: { id: chunk.id },
                            data: {
                                summary: modelOutput.summary,
                                domain: modelOutput.domain,
                                subDomain: modelOutput.subDomain,
                                tags: Array.isArray(modelOutput.tags)
                                    ? modelOutput.tags.join(',')
                                    : '',
                                language: ''
                            }
                        });

                        // 处理实体和关系图谱
                        if (modelOutput.entities && modelOutput.relations) {
                            await this.chunkGraphService.createChunkGraph(
                                chunk.id,
                                modelOutput.entities,
                                modelOutput.relations
                            );
                        }

                        return { chunkId: chunk.id, success: true };
                    } catch (error) {
                        console.error(`处理分块 ${chunk.id} 时出错:`, error);
                        return { chunkId: chunk.id, success: false, error };
                    }
                })
            );

            // 处理结果，记录错误但不中断整个过程
            const errors = results
                .map((result, index) => ({ result, index }))
                .filter(({ result }) => result.status === 'rejected' ||
                    (result.status === 'fulfilled' && !result.value.success))
                .map(({ result, index }) => ({
                    chunkId: chunks[index]?.id,
                    error: result.status === 'rejected'
                        ? result.reason
                        : result.value.error
                }));

            if (errors.length > 0) {
                console.error('部分分块处理失败:', errors);
            }

            return results;
        } catch (error) {
            console.error('处理时出错:', error);
            throw error;
        }
    }
}
