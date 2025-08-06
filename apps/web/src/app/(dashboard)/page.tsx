'use client';
import { ProjectCards } from '@/components/project/project-cards';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import * as React from 'react';
import { ProjectDialog } from '@/components/project/project-dialog';
import { useTranslation } from 'react-i18next';
import { useGetProjects } from '@/hooks/query/use-project';

export default function Page() {
    const { t } = useTranslation('project');
    const { projects, refresh } = useGetProjects();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    return (
        <div>
            <div className="flex flex-1 justify-center space-x-2 m-8">
                <Input
                    value={name}
                    className={'w-1/4'}
                    placeholder={t('search_info')}
                    onChange={e => setName(e.target.value)}
                />
                <Button type="submit" onClick={() => setOpen(true)}>
                    {t('create_btn')}
                </Button>
            </div>
            <div className="@container/main flex flex-1 flex-col gap-2">
                <ProjectCards
                    projects={projects.filter(project => project.name.toLowerCase().includes(name.toLowerCase()))}
                    getProjects={refresh}
                />
            </div>
            {open && <ProjectDialog open={open} setOpen={setOpen} />}
        </div>
    );
}
