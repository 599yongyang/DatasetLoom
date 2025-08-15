import { PromptTemplateType } from '@repo/shared-types';
import { VariablesConfig } from '@/types/form';

export interface PromptTemplate {
    id: string;
    name: string;
    description: string;
    type: PromptTemplateType;
    content: string;
    variables: VariablesConfig;
    createdAt: string;
    updatedAt: Date;
    projectId: string;
}



