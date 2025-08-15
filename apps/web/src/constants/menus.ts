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
    LayoutDashboard
} from 'lucide-react';

import type { IMenu } from '@/schema/menu';
import { ProjectRole } from '@repo/shared-types';
import { UserInfo } from '@/lib/session';
import { hasPermission } from '@/lib/utils';

export const getMenuConfig = (projectId: string, user: UserInfo): IMenu[] => {
    const permissions = user?.permissions.find(permission => permission.projectId === projectId);
    const menuItems: IMenu[] = [
        {
            title: 'dashboard',
            icon: LayoutDashboard,
            to: `/project/${projectId}/dashboard`,
            role: ProjectRole.VIEWER
        },
        {
            title: 'knowledge.title',
            icon: FileText,
            to: `/project/${projectId}/knowledge/document`,
            role: ProjectRole.VIEWER,
            children: [
                {
                    title: 'knowledge.document',
                    icon: FileText,
                    to: `/project/${projectId}/knowledge/document`,
                    role: ProjectRole.VIEWER
                },
                {
                    title: 'knowledge.image',
                    icon: FileText,
                    to: `/project/${projectId}/knowledge/image`,
                    role: ProjectRole.VIEWER
                }
            ]
        },
        {
            title: 'chunk.title',
            icon: SquareSplitVertical,
            to: `/project/${projectId}/chunk/document`,
            role: ProjectRole.VIEWER,
            children: [
                {
                    title: 'chunk.document',
                    icon: FileText,
                    to: `/project/${projectId}/chunk/document`,
                    role: ProjectRole.VIEWER
                },
                {
                    title: 'chunk.image',
                    icon: FileText,
                    to: `/project/${projectId}/chunk/image`,
                    role: ProjectRole.VIEWER
                }
            ]
        },
        {
            title: 'question',
            icon: MessageCircleQuestion,
            to: `/project/${projectId}/question`,
            role: ProjectRole.VIEWER
        },
        {
            title: 'dataset.title',
            icon: Database,
            to: `/project/${projectId}/dataset/qa`,
            role: ProjectRole.VIEWER,
            children: [
                {
                    title: 'dataset.qa',
                    icon: Database,
                    to: `/project/${projectId}/dataset/qa`,
                    role: ProjectRole.VIEWER
                }
            ]
        },
        {
            title: 'chat',
            icon: BotMessageSquare,
            to: `/project/${projectId}/chat`,
            role: ProjectRole.VIEWER
        },
        {
            title: 'settings.title',
            icon: Settings,
            to: `/project/${projectId}/settings`,
            role: ProjectRole.VIEWER,
            children: [
                {
                    title: 'settings.project_info',
                    icon: Info,
                    to: `/project/${projectId}/settings/project-info`,
                    role: ProjectRole.VIEWER
                },
                {
                    title: 'settings.project_member',
                    icon: Info,
                    to: `/project/${projectId}/settings/project-member`,
                    role: ProjectRole.ADMIN
                },
                {
                    title: 'settings.model_config',
                    icon: Brain,
                    to: `/project/${projectId}/settings/model-config`,
                    role: ProjectRole.ADMIN
                },
                {
                    title: 'settings.parser_config',
                    icon: ListTodo,
                    to: `/project/${projectId}/settings/parser-config`,
                    role: ProjectRole.ADMIN
                },
                {
                    title: 'settings.prompt_config',
                    icon: SquareTerminal,
                    to: `/project/${projectId}/settings/prompt-template`,
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
