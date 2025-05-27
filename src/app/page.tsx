'use client';
import { ProjectCards } from '@/components/project/project-cards';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import * as React from 'react';
import { SiteHeader } from '@/components/site-header';
import { ProjectDialog } from '@/components/project/project-dialog';
import { useTranslation } from 'react-i18next';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { motion } from 'framer-motion';
import { useGetProjects } from '@/hooks/query/use-project';

export default function Page() {
    const { t } = useTranslation('project');
    const { projects, refresh } = useGetProjects();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');

    return (
        <div>
            <SiteHeader />

            {projects.length > 0 ? (
                <>
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
                            projects={projects.filter(project =>
                                project.name.toLowerCase().includes(name.toLowerCase())
                            )}
                            getProjects={refresh}
                        />
                    </div>
                </>
            ) : (
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <AuroraBackground>
                        <motion.div
                            initial={{ opacity: 0.0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: 0.3,
                                duration: 0.8,
                                ease: 'easeInOut'
                            }}
                            className="relative flex flex-col gap-4 items-center justify-center px-4"
                        >
                            <div className="text-3xl md:text-7xl font-bold dark:text-white text-center">
                                Dataset Loom
                            </div>
                            <div className="font-extralight text-base md:text-4xl dark:text-neutral-200 py-4">
                                面向大模型的智能数据集构建工具
                            </div>
                            <Button type="submit" className={'cursor-pointer'} onClick={() => setOpen(true)}>
                                {t('create_first_btn')}
                            </Button>
                        </motion.div>
                    </AuroraBackground>
                </div>
            )}
            {open && <ProjectDialog open={open} setOpen={setOpen} />}
        </div>
    );
}
