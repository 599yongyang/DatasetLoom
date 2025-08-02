import { useSession } from 'next-auth/react';
import { type CurrentUser } from '@/server/auth';

export const useCurrentUser = () => {
    const { data: session } = useSession();
    return session?.user as CurrentUser | undefined;
};
