import type { LucideIcon } from 'lucide-react';
import { z } from 'zod';
import { ProjectRole } from './types';

const LucideIconSchema = z.custom<LucideIcon>(
    data => {
        return typeof data === 'function';
    },
    {
        message: 'Invalid Lucide icon'
    }
);
const ProjectRoleEnum = z.enum(Object.values(ProjectRole) as [string, ...string[]]);

export const ChildrenMenuItemSchema = z.object({
    title: z.string(),
    label: z.string().optional(),
    icon: LucideIconSchema,
    role: ProjectRoleEnum,
    to: z.string().url()
});

export const MenuItemSchema = z.object({
    title: z.string(),
    label: z.string().optional(),
    icon: LucideIconSchema,
    to: z.string().url(),
    role: ProjectRoleEnum,
    children: z.array(ChildrenMenuItemSchema).optional()
});

export type IChildrenMenuItem = z.infer<typeof ChildrenMenuItemSchema>;
export type MenuItem = z.infer<typeof MenuItemSchema>;
export type IMenu = MenuItem;

export const MenuArraySchema = z.array(MenuItemSchema);
