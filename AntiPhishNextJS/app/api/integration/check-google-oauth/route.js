import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkClient } from '@clerk/backend'

export async function GET(request) {
    try {
        const clerkauth = await auth();
        const clerkId = clerkauth?.userId;
        
        if (!clerkId) {
            return NextResponse.json({
                error: "Unauthorized",
                code: "UNAUTHORIZED",
                details: "User authentication required"
            }, { status: 401 });
        }

        const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const tokens = await clerkClient.users.getUserOauthAccessToken(clerkId, 'google');
        const googleToken = tokens?.data?.[0]?.token;
        const hasGoogleOAuth = googleToken && googleToken.length > 0;

        if (!hasGoogleOAuth) {
            return NextResponse.json({
                error: "Google OAuth not configured",
                code: "GOOGLE_OAUTH_NOT_CONFIGURED",
                details: "User has not connected their Google account"
            }, { status: 400 });
        }

        return NextResponse.json({ hasGoogleOAuth });
    } catch (error) {
        console.error("Error checking Google OAuth:", error);
        return NextResponse.json({
            error: "Internal server error",
            code: "CHECK_GOOGLE_OAUTH_ERROR",
            details: error.message
        }, { status: 500 });
    }
}
