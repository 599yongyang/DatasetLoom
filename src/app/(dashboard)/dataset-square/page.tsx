'use client';
import { BrainCircuit, ExternalLink, Flame, List, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { sites } from '@/constants/sites';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Page() {
    const [list, setList] = useState(sites);
    const [tab, setTab] = useState('all');
    useEffect(() => {
        if (tab === 'all') {
            setList(sites);
            return;
        }
        const filteredSites = sites.filter(site => site.labels && site.labels.includes(tab));
        setList(filteredSites);
    }, [tab]);

    return (
        <div className="@container/main">
            <section className="w-full p-4 md:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className={'flex items-center justify-between'}>
                        <Tabs value={tab} onValueChange={value => setTab(value)} className="mb-5">
                            <TabsList className="flex-wrap h-auto p-1 rounded-lg bg-gray-50 border border-gray-200">
                                <TabsTrigger
                                    value="all"
                                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200"
                                >
                                    <List className="h-4 w-4 mr-1" />
                                    全部
                                </TabsTrigger>
                                <TabsTrigger
                                    value="热门推荐"
                                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200"
                                >
                                    <Flame className="h-4 w-4 mr-1 text-orange-500" />
                                    热门推荐
                                </TabsTrigger>
                                <TabsTrigger
                                    value="中文资源"
                                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200"
                                >
                                    中文资源
                                </TabsTrigger>
                                <TabsTrigger
                                    value="英文资源"
                                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200"
                                >
                                    英文资源
                                </TabsTrigger>
                                <TabsTrigger
                                    value="研究数据"
                                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200"
                                >
                                    研究数据
                                </TabsTrigger>
                                <TabsTrigger
                                    value="多模态"
                                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200"
                                >
                                    多模态
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="flex items-center gap-2">
                            <p className="text-gray-600 text-sm">
                                共找到 <span className="text-blue-600 font-medium">{sites.length}</span> 个数据集资源
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {list.map((site, index) => (
                            <DatasetCard
                                key={index}
                                title={site.name}
                                description={site.description}
                                imageSrc={site.image}
                                link={site.link}
                                labels={site.labels}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

function DatasetCard({
    title,
    description,
    imageSrc,
    link,
    labels
}: {
    title: string;
    description: string;
    imageSrc: string;
    link: string;
    labels: string[];
}) {
    return (
        <Link href={link} target={'_blank'}>
            <Card className="h-full flex flex-col border-gray-200 group-hover:border-blue-500 group-hover:shadow-md transition-all overflow-hidden">
                <div className="relative">
                    <Image
                        src={imageSrc ?? '/placeholder.svg'}
                        alt={title}
                        width={400}
                        height={200}
                        className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-blue-600 px-2 py-1 rounded text-xs text-white">
                        数据集
                    </div>
                </div>
                <CardContent className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center justify-between">
                        {title}
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                            <ExternalLink />
                        </Button>
                    </h3>
                    <p className="text-gray-600 text-sm">{description}</p>
                </CardContent>
                <CardFooter className="gap-2">
                    {labels.map((label, index) => (
                        <Badge key={index} variant="secondary">
                            {label}
                        </Badge>
                    ))}
                </CardFooter>
            </Card>
        </Link>
    );
}
