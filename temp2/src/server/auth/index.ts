import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { authConfig } from './config';
import type { ProjectRole } from '@/lib/data-dictionary';
import { getUserByEmail } from '@/server/db/users';

export type CurrentUser = {
    id: string;
    name?: string | null;
    avatar?: string | null;
    email?: string | null;
    role: string;
    permissions: { projectId: string; role: ProjectRole }[];
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
        async jwt({ token, user, trigger }: any) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.avatar = user.avatar;
                token.role = user.role;
                token.permissions = user.projectMembers;
            }

            if (trigger === 'update') {
                const email = token.email as string;
                const updatedUser = await getUserByEmail(email);
                if (updatedUser) {
                    token.id = updatedUser.id;
                    token.name = updatedUser.name;
                    token.avatar = updatedUser.avatar;
                    token.role = updatedUser.role;
                    token.permissions = updatedUser.projectMembers;
                }
            }

            return token;
        },
        async session({ session, token, trigger }) {
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
