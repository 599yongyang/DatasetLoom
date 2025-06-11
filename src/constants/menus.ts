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

export const getMenuConfig = (projectId: string, user: CurrentUser): IMenu[] => {
    const permissions = user?.permissions.find(permission => permission.projectId === projectId);
    // const isAdminOrOwner = permissions?.role === 'OWNER' || permissions?.role === 'ADMIN';
    const isAdminOrOwner = true;

    const menuItems: IMenu[] = [
        {
            title: 'documents',
            icon: FileText,
            to: `/project/${projectId}/documents`
        },
        {
            title: 'chunks',
            icon: SquareSplitVertical,
            to: `/project/${projectId}/chunks`
        },
        {
            title: 'questions',
            icon: MessageCircleQuestion,
            to: `/project/${projectId}/questions`
        },
        {
            title: 'datasets',
            icon: Database,
            to: `/project/${projectId}/datasets`
        }
    ];

    if (isAdminOrOwner) {
        menuItems.push({
            title: 'settings',
            icon: Settings,
            to: `/project/${projectId}/settings`,
            children: [
                {
                    title: 'project_info',
                    icon: Info,
                    to: `/project/${projectId}/settings/project-info`
                },
                {
                    title: 'model_config',
                    icon: Brain,
                    to: `/project/${projectId}/settings/model-config`
                },
                {
                    title: 'parser_config',
                    icon: ListTodo,
                    to: `/project/${projectId}/settings/parser-config`
                },
                {
                    title: 'prompt_config',
                    icon: SquareTerminal,
                    to: `/project/${projectId}/settings/prompt-config`
                }
            ]
        });
    }

    menuItems.push(
        {
            title: 'playground',
            icon: BotMessageSquare,
            to: `/project/${projectId}/playground`
        },
        {
            title: 'workflow',
            icon: Workflow,
            to: `/project/${projectId}/workflow`
        }
    );

    return menuItems;
};
