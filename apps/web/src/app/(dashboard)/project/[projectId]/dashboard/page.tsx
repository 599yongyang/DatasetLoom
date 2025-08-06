'use client';

import { ModelUsagesChart } from '@/components/dashboard/model-usage-chart';
import { DatasetCards } from '@/components/dashboard/dataset-cards';
import { DomainChart } from '@/components/dashboard/domain-chart';
import { ModelUseRankChart } from '@/components/dashboard/model-use-rank-chart';

export default function Page() {
    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-2 md:gap-4 md:py-4">
                    <DatasetCards />
                    <div className="grid grid-cols-1 gap-4 px-4 lg:px-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-2">
                        <DomainChart />
                        <ModelUseRankChart />
                    </div>
                    <div className="px-4 lg:px-4">
                        <ModelUsagesChart />
                    </div>
                </div>
            </div>
        </div>
    );
}
