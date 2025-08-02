import type { NextAuthConfig } from 'next-auth';

const publicPaths = [
    '/login',
    '/register',
    '/api/auth/*',
    '/_next/*',
    '/favicon.ico',
    '/full-logo.svg',
    '/logo.svg',
    '/avatar/*'
];

export const authConfig = {
    pages: {
        signIn: '/login',
        newUser: '/'
    },
    providers: [],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isPublic = publicPaths.includes(nextUrl.pathname);
            if (isPublic) {
                return true;
            }
            if (!isPublic) {
                if (isLoggedIn) return true;
                return false;
            }
            if (isLoggedIn) {
                return Response.redirect(new URL('/', nextUrl as unknown as URL));
            }
            return true;
        }
    }
} satisfies NextAuthConfig;
