'use server';

import { jwtVerify, SignJWT } from 'jose';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { ProjectRole } from '@repo/shared-types';

export type UserInfo = {
    id: string;
    email: string;
    name: string;
    avatar: string;
    permissions: Array<{
        projectId: string;
        role: ProjectRole;
    }>;
};

export type Session = {
    user: UserInfo;
    accessToken: string;
    refreshToken: string;
};


const secretKey = process.env.NEXT_PUBLIC_SESSION_SECRET_KEY!;
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(payload: Session) {
    const expiredAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    const session = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(encodedKey);

    (await cookies()).set('session', session, {
        httpOnly: true,
        secure: true,
        expires: expiredAt,
        sameSite: 'lax',
        path: '/'
    });
}

export async function getSession() {
    const cookie = (await cookies()).get('session')?.value;
    if (!cookie) return null;

    try {
        const { payload } = await jwtVerify(
            cookie,
            encodedKey,
            {
                algorithms: ['HS256']
            }
        );

        return payload as Session;
    } catch (err) {
        console.error('Failed to verify the session', err);
        redirect('/login');
    }
}

export async function deleteSession() {
    (await cookies()).delete('session');
}

export async function updateTokens({
                                       accessToken,
                                       refreshToken
                                   }: {
    accessToken: string;
    refreshToken: string;
}) {
    const cookie = (await cookies()).get('session')?.value;
    if (!cookie) return null;

    const { payload } = await jwtVerify<Session>(
        cookie,
        encodedKey
    );

    if (!payload) throw new Error('Session not found');

    const newPayload: Session = {
        user: {
            ...payload.user
        },
        accessToken,
        refreshToken
    };

    await createSession(newPayload);
}


export async function updateUserInfo({ avatar, name }: { avatar: string; name: string; }) {
    const cookie = (await cookies()).get('session')?.value;
    if (!cookie) return null;

    const { payload } = await jwtVerify<Session>(
        cookie,
        encodedKey
    );

    if (!payload) throw new Error('Session not found');

    const newPayload: Session = {
        user: {
            ...payload.user,
            avatar,
            name
        },
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken
    };

    await createSession(newPayload);
}


export async function updateUserPermissions(permissions: Array<{
    projectId: string;
    role: ProjectRole;
}>) {
    const cookie = (await cookies()).get('session')?.value;
    if (!cookie) return null;

    const { payload } = await jwtVerify<Session>(
        cookie,
        encodedKey
    );

    if (!payload) throw new Error('Session not found');

    const newPayload: Session = {
        user: {
            ...payload.user,
            permissions
        },
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken
    };
    await createSession(newPayload);
}
