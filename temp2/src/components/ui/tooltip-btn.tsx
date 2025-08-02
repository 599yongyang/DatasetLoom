import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function TooltipBtn({ children, tooltip }: { children: React.ReactNode; tooltip: string }) {
    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent className="px-2 py-1 text-xs">{tooltip}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
