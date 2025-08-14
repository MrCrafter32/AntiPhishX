import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
    try {
        const { clerkId, code, redirectUri } = await req.json();
        
        if (!clerkId || !code || !redirectUri) {
            return NextResponse.json({
                error: 'Missing required fields',
                code: 'MISSING_REQUIRED_FIELDS',
                details: 'clerkId, code, and redirectUri are all required'
            }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId },
            select: { id: true },
        });
        
        if (!user) {
            return NextResponse.json({
                error: 'User not found',
                code: 'USER_NOT_FOUND',
                details: 'User record does not exist in database'
            }, { status: 404 });
        }

        const userId = user.id;
        const tokenUrl = 'https://oauth2.googleapis.com/token';

        const tokenResponse = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });

        const tokenData = await tokenResponse.json();
        if (!tokenResponse.ok) {
            throw new Error(tokenData.error || tokenData.error_description || 'Failed to fetch tokens');
        }

        const { refresh_token, access_token, expires_in } = tokenData;

        if (!refresh_token) {
            console.error('OAuth Error: No refresh token received.');
            return NextResponse.json({
                error: 'No refresh token received',
                code: 'NO_REFRESH_TOKEN',
                details: 'Google OAuth did not provide a refresh token'
            }, { status: 400 });
        }

        try {
            await prisma.userIntegration.upsert({
                where: { userId: userId },
                update: {
                    googleRefreshToken: refresh_token,
                },
                create: {
                    type: 'GOOGLE',
                    userId: userId,
                    googleRefreshToken: refresh_token,
                },
            });

            await prisma.user.update({
                where: { id: userId },
                data: {
                    isFirstLogin: false,
                },
            });
            return NextResponse.json({ message: 'Google authentication successful!' }, { status: 200 });
        } catch (error) {
            console.error('Database Error: Failed to save Google integration.', error);
            return NextResponse.json({
                error: 'Failed to save Google integration',
                code: 'DATABASE_SAVE_ERROR',
                details: error.message
            }, { status: 500 });
        }
        
    } catch (error) {
        console.error('Token Exchange Error:', error);
        return NextResponse.json({
            error: 'Google OAuth failed',
            code: 'GOOGLE_OAUTH_ERROR',
            details: error.message
        }, { status: 500 });
    }
}
