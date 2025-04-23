// /api/auth/google/callback/route.js
import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/getUser';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: 'http://mrcrafter.tech:3000/api/auth/google/callback',
      grant_type: 'authorization_code'
    })
  });

  const userId = getUserId();


  const tokenData = await tokenResponse.json();

//   Optionally store tokens in DB against userId
    await prisma.UserIntegration.upsert({
        where: {
            userId: new ObjectId(userId),
        },
        update: {
            googleToken: tokenData.access_token,
            googleRefreshToken: tokenData.refresh_token,
            expiresAt: tokenData.expires_in,
            tokenType: tokenData.token_type,
        },
        create: {
            userId: new ObjectId(userId),
            googleToken: tokenData.access_token,
            googleRefreshToken: tokenData.refresh_token,
            expiresAt: tokenData.expires_in,
            tokenType: tokenData.token_type,
        },
    });

  return NextResponse.json(tokenData);
}
