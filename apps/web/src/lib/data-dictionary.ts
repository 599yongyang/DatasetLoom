import { CheckCircle2Icon, CircleX, Clock, LoaderIcon } from 'lucide-react';
import { ParseStatusType } from '@prisma-enum';

export const chunkTypeOptions = [
    { value: 'auto', label: '自动', desc: '自动进行分块设置' },
    { value: 'custom', label: '自定义', desc: '可自定义分块规则参数' }
    // { value: 'page', label: '逐页', desc: '逐页进行分块(暂只支持pdf文件)' }
];

export const workflowStatusOptions = [
    {
        value: 0,
        label: '待执行',
        icon: Clock,
        iconClassName: 'text-gray-500'
    },
    {
        value: 1,
        label: '执行中',
        icon: LoaderIcon,
        iconClassName: 'text-blue-500'
    },
    {
        value: 2,
        label: '执行完成',
        icon: CheckCircle2Icon,
        iconClassName: 'text-emerald-500'
    },
    {
        value: 3,
        label: '执行失败',
        icon: CircleX,
        iconClassName: 'text-red-500'
    }
];

export enum WorkflowStatus {
    WAITING = 0,
    RUNNING = 1,
    COMPLETE = 2,
    FAILED = 3
}

export type ProjectRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';
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

export type ModelConfigType = 'COT' | 'EMBED' | 'TEXT' | 'TOOL' | 'VISION' | 'ALL';

export type DatasetExportType = 'LOCAL_GENERAL' | 'LLAMA_FACTORY' | 'HF';

export type UIParseStatusType = 'PENDING' | 'DONE' | 'FAILED';
export const ParseStatusTypeMap: Record<UIParseStatusType, string> = {
    PENDING: '解析中',
    DONE: '完成',
    FAILED: '错误'
};
