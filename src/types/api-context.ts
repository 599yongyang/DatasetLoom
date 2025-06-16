import type { CurrentUser } from '@/server/auth';
import type { NextRequest } from 'next/server';

export type ApiContext = {
    req: NextRequest;
    user: CurrentUser;
    [key: string]: any;
};
