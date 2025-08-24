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

//分块策略
export const chunkStrategyOptions = [
    { value: 'auto', label: '自动', desc: '自动进行分块设置' },
    { value: 'custom', label: '自定义', desc: '可自定义分块规则参数' }
];

//清洗规则
export const cleanRuleOptions = [
    { id: 'remove-extra-whitespace', name: '去除多余空白', description: '去除连续的空格和制表符' },
    { id: 'remove-html-tags', name: '去除HTML标签', description: '移除所有的HTML标签' },
    { id: 'remove-invisible-chars', name: '去除不可见字符', description: '去除控制字符（除了换行和制表符）' },
    { id: 'normalize-unicode', name: 'Unicode标准化', description: '标准化Unicode字符' },
    { id: 'remove-redundant-newlines', name: '去除多余换行', description: '限制连续换行数量' },
    { id: 'remove-urls', name: '去除URL链接', description: '移除所有的URL链接' },
    { id: 'remove-emails', name: '去除邮箱地址', description: '移除所有的邮箱地址' },
    { id: 'full-width-to-half-width', name: '全角字符转换半角字符', description: '将全角字符转换为半角字符' }
];
