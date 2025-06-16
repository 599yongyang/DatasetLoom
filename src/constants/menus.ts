import {
    FileText,
    MessageCircleQuestion,
    Database,
    Settings,
    Info,
    Brain,
    ListTodo,
    SquareTerminal,
    BotMessageSquare,
    SquareSplitVertical,
    Workflow
} from 'lucide-react';

import type { IMenu } from '@/schema/menu';
import type { CurrentUser } from '@/server/auth';
import { ProjectRole } from '@/schema/types';
import { hasPermission } from '@/lib/utils/auth-helper';

export const getMenuConfig = (projectId: string, user: CurrentUser): IMenu[] => {
    const permissions = user?.permissions.find(permission => permission.projectId === projectId);
    const menuItems: IMenu[] = [
        {
            title: 'documents',
            icon: FileText,
            to: `/project/${projectId}/documents`,
            role: ProjectRole.VIEWER
        },
        {
            title: 'chunks',
            icon: SquareSplitVertical,
            to: `/project/${projectId}/chunks`,
            role: ProjectRole.VIEWER
        },
        {
            title: 'questions',
            icon: MessageCircleQuestion,
            to: `/project/${projectId}/questions`,
            role: ProjectRole.VIEWER
        },
        {
            title: 'datasets',
            icon: Database,
            to: `/project/${projectId}/datasets`,
            role: ProjectRole.VIEWER
        },
        {
            title: 'chat',
            icon: BotMessageSquare,
            to: `/project/${projectId}/chat`,
            role: ProjectRole.VIEWER
        },
        {
            title: 'workflow',
            icon: Workflow,
            to: `/project/${projectId}/workflow`,
            role: ProjectRole.VIEWER
        },
        {
            title: 'settings',
            icon: Settings,
            to: `/project/${projectId}/settings`,
            role: ProjectRole.VIEWER,
            children: [
                {
                    title: 'project_info',
                    icon: Info,
                    to: `/project/${projectId}/settings/project-info`,
                    role: ProjectRole.VIEWER
                },
                {
                    title: 'project_member',
                    icon: Info,
                    to: `/project/${projectId}/settings/project-member`,
                    role: ProjectRole.ADMIN
                },
                {
                    title: 'model_config',
                    icon: Brain,
                    to: `/project/${projectId}/settings/model-config`,
                    role: ProjectRole.ADMIN
                },
                {
                    title: 'parser_config',
                    icon: ListTodo,
                    to: `/project/${projectId}/settings/parser-config`,
                    role: ProjectRole.ADMIN
                },
                {
                    title: 'prompt_config',
                    icon: SquareTerminal,
                    to: `/project/${projectId}/settings/prompt-config`,
                    role: ProjectRole.ADMIN
                }
            ]
        }
    ];

    return filterMenuByRole(menuItems, permissions?.role as ProjectRole);
};

const filterMenuByRole = (menuList: IMenu[], userRole: ProjectRole): IMenu[] => {
    return menuList.reduce<IMenu[]>((acc, item) => {
        const { role, children } = item;

        // 当前菜单是否有权限
        const hasAccess = hasPermission(userRole, role as ProjectRole);

        // 如果有权限，并且没有子菜单，则直接加入结果
        if (hasAccess && !children) {
            acc.push(item);
            return acc;
        }

        // 如果有子菜单，递归过滤子菜单
        if (children && children.length > 0) {
            const filteredChildren = filterMenuByRole(children, userRole);
            if (filteredChildren.length > 0) {
                acc.push({
                    ...item,
                    children: filteredChildren
                });
            }
        }

        return acc;
    }, []);
};
