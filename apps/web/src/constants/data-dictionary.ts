import { ModelConfigType, PromptTemplateType, ProjectRole } from '@repo/shared-types';
import type { Option } from '@/components/ui/multiselect';

export const projectRoleMap: Record<ProjectRole, string> = {
    OWNER: '所有者',
    ADMIN: '可管理',
    EDITOR: '可修改',
    VIEWER: '只可查看'
};
export const projectRoleDescMap: Record<ProjectRole, string> = {
    OWNER: '',
    ADMIN: '拥有对项目数据的全部操作权限（增删改查），并可编辑项目配置',
    EDITOR: '可以新增和编辑数据，但不能删除内容，也无权访问项目配置',
    VIEWER: '仅允许查看数据，不可编辑或删除，也无法看到项目配置'
};
export const projectRoles: ProjectRole[] = Object.keys(projectRoleMap) as ProjectRole[];
export const availableRoles = projectRoles.filter(role => role !== 'OWNER');
export const projectRoleColorMap = {
    OWNER: 'bg-purple-100 text-purple-800',
    ADMIN: 'bg-orange-100 text-orange-800',
    EDITOR: 'bg-blue-100 text-blue-800',
    VIEWER: 'bg-green-100 text-green-800'
};

export type UIContextType = 'TEXT' | 'IMAGE';
export const ContextTypeMap: Record<UIContextType, string> = {
    TEXT: '文档',
    IMAGE: '图像'
};


export type DatasetExportType = 'LOCAL_GENERAL' | 'LLAMA_FACTORY' | 'HF';

export type UIParseStatusType = 'PENDING' | 'DONE' | 'FAILED';
export const ParseStatusTypeMap: Record<UIParseStatusType, string> = {
    PENDING: '解析中',
    DONE: '完成',
    FAILED: '错误'
};

export const fileTypeOption = [
    { value: 'pdf', label: 'PDF' },
    { value: 'txt', label: 'TXT' },
    { value: 'doc', label: 'DOC' },
    { value: 'md', label: 'MD' },
    { value: 'epub', label: 'EPUB' }
];

export const promptTemplateTypeOptions = [
    { value: PromptTemplateType.LABEL, label: '标签（用于图谱分析）' },
    { value: PromptTemplateType.QUESTION, label: '问题生成' },
    { value: PromptTemplateType.ANSWER, label: '答案生成' },
    { value: PromptTemplateType.OTHER, label: '其他' }
];

export const modelConfigTypeOptions: Option[] = [
    { value: ModelConfigType.TEXT, label: '对话能力' },
    { value: ModelConfigType.VISION, label: '视觉能力' },
    { value: ModelConfigType.COT, label: '推理能力' },
    { value: ModelConfigType.TOOL, label: '工具能力' },
    { value: ModelConfigType.EMBED, label: '嵌入能力' }
];

