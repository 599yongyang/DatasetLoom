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

export default function Page() {
    return (
        <div className="@container/main">
            {/* Hero Section */}
            <section className="w-full py-12 md:py-24 lg:py-32 bg-purple-50 flex flex-col items-center justify-center text-center px-4">
                <div className="flex items-center justify-center mb-6">
                    <div className="bg-purple-500 p-2 rounded">
                        <BrainCircuit size={40} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 ml-2">数据集广场</h1>
                </div>
                <p className="text-lg text-gray-600 max-w-[800px] mb-8">
                    发现和探索各种公开数据集资源，助力您的模型训练和研究
                </p>
                <div className="w-full max-w-3xl relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <Search size={20} />
                    </div>
                    <Input
                        type="search"
                        placeholder="搜索数据集关键词..."
                        className="w-full pl-10 py-6  border-gray-200 text-gray-900 rounded-full shadow-sm"
                    />
                </div>
            </section>

            {/* Datasets Section */}
            <section className="w-full py-12  px-4 md:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center mb-6">
                        <BrainCircuit />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">数据集分类</h2>
                    </div>

                    <Tabs defaultValue="all" className="mb-8 dark:text-white">
                        <TabsList className=" p-1 rounded-lg border border-gray-200">
                            <TabsTrigger value="all" className="data-[state=active]:bg-gray-100">
                                <List />
                                全部
                            </TabsTrigger>
                            <TabsTrigger value="hot" className="data-[state=active]:bg-gray-100">
                                <Flame />
                                热门推荐
                            </TabsTrigger>
                            <TabsTrigger value="chinese" className="data-[state=active]:bg-gray-100">
                                中文资源
                            </TabsTrigger>
                            <TabsTrigger value="english" className="data-[state=active]:bg-gray-100">
                                英文资源
                            </TabsTrigger>
                            <TabsTrigger value="research" className="data-[state=active]:bg-gray-100">
                                研究数据
                            </TabsTrigger>
                            <TabsTrigger value="multimodal" className="data-[state=active]:bg-gray-100">
                                多模态
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex items-center mb-8">
                        <p className="text-gray-600 dark:text-white">
                            找到 <span className="text-gray-900 font-medium dark:text-white">{sites.length}</span>{' '}
                            个数据集资源
                        </p>
                        <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-600 ">
                            {sites.length}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {sites.map((site, index) => (
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
            <Card className="overflow-hidden border-gray-200 hover:border-blue-500 hover:shadow-md transition-all">
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
