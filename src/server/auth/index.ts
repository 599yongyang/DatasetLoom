import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { authConfig } from './config';
import { getUserByEmail } from '@/lib/db/users';

export type CurrentUser = {
    id: string;
    name?: string | null;
    avatar?: string | null;
    email?: string | null;
    role: string;
    permissions: { projectId: string; role: string }[];
};

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut
} = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await getUserByEmail(credentials.email as string);
                if (!user) return null;

                if (credentials.password === user.password) {
                    return user;
                } else return null;
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }: { token: any; user: any }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.avatar = user.avatar;
                token.permissions = user.projectMembers;
            }
            return token;
        },
        async session({ session, token }) {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id as string,
                    avatar: token.avatar as string,
                    role: token.role as string,
                    permissions: token.permissions as string[]
                }
            };
        }
    }
});
