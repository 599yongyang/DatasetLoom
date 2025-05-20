import { CheckCircle2Icon, CircleX, Clock, LoaderIcon } from 'lucide-react';

export const chunkTypeOptions = [
    { value: 'auto', label: '自动', desc: '自动进行分块设置' },
    { value: 'custom', label: '自定义', desc: '可自定义分块规则参数' },
    { value: 'page', label: '逐页', desc: '逐页进行分块(暂只支持pdf文件)' }
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
