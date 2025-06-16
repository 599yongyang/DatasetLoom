'use client';
import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ProjectsWithCounts } from '@/schema/project';
import { Database, MessageCircleQuestion } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import axios from 'axios';
import { ConfirmAlert } from '@/components/confirm-alert';
import { useAtom } from 'jotai/index';
import { selectedProjectAtom } from '@/atoms';
import { WithPermission } from '../permission-wrapper';
import { ProjectRole } from '@/schema/types';

export function ProjectCards({ projects, getProjects }: { projects: ProjectsWithCounts[]; getProjects: () => void }) {
    const { t } = useTranslation('project');
    const [selectedProject, setSelectedProject] = useAtom(selectedProjectAtom);
    const router = useRouter();
    const deleteProject = (id: string) => {
        toast.promise(axios.delete(`/api/project/${id}`), {
            success: () => {
                getProjects();
                if (selectedProject === id) {
                    setSelectedProject('');
                }
                return '删除成功';
            },
            error: error => {
                return error.response?.data?.message || '删除失败';
            }
        });
    };
    const handleView = (id: string, modelCount: number) => {
        if (modelCount > 0) {
            router.push(`/project/${id}/documents`);
        } else {
            router.push(`/project/${id}/settings/model-config`);
        }
    };

    return (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-20 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
            {projects.map(project => (
                <Card key={project.id} className="@container/card">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[450px]/card:text-3xl">
                            {project.name}
                        </CardTitle>
                        <CardDescription className="max-h-10 ">{project.description}</CardDescription>

                        <CardAction className="flex flex-col gap-2">
                            <Badge variant="outline">
                                <MessageCircleQuestion />
                                {project._count.Questions} {t('questions')}
                            </Badge>
                            <Badge variant="outline">
                                <Database />
                                {project._count.DatasetSamples} {t('datasets')}
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex justify-between">
                        <div className="text-sm">
                            {t('create_time')}：{new Date(project.createdAt).toLocaleString('zh-CN')}
                        </div>
                        <div className={'flex gap-2'}>
                            <Button
                                size={'sm'}
                                className="hover:cursor-pointer"
                                variant="outline"
                                onClick={() => handleView(project.id, project._count.ModelConfig)}
                            >
                                {t('view')}
                            </Button>

                            <WithPermission required={ProjectRole.ADMIN} projectId={project.id}>
                                <ConfirmAlert
                                    title={'确认要删除此项目吗？'}
                                    message={'操作不可恢复,请谨慎操作!!!'}
                                    onConfirm={() => deleteProject(project.id)}
                                >
                                    <Button
                                        size={'sm'}
                                        className="hover:cursor-pointer hover:bg-red-500 text-white bg-red-500"
                                    >
                                        {t('delete')}
                                    </Button>
                                </ConfirmAlert>
                            </WithPermission>
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
