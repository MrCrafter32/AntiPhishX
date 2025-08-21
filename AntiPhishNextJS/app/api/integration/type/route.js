import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkClient } from '@clerk/backend'
import prisma from "@/lib/prisma";

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

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ type: null });
    }

    const integration = await prisma.userIntegration.findUnique({
      where: { userId: user.id },
      select: { type: true }
    });

    return NextResponse.json({ type: integration?.type || null });
  } catch (err) {
    console.error("Get integration type error:", err);
    return NextResponse.json({
      error: "Internal server error",
      code: "GET_INTEGRATION_TYPE_ERROR",
      details: err.message
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const clerkauth = await auth();
    const clerkId = clerkauth?.userId;
    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
    
    if (!clerkId) {
      return NextResponse.json({
        error: "Unauthorized",
        code: "UNAUTHORIZED",
        details: "User authentication required"
      }, { status: 401 });
    }

    const { type } = await request.json();
    if (type !== "IMAP" && type !== "GOOGLE") {
      return NextResponse.json({
        error: "Invalid type",
        code: "INVALID_INTEGRATION_TYPE",
        details: "Integration type must be either 'IMAP' or 'GOOGLE'"
      }, { status: 400 });
    }

    if (type === "GOOGLE") {
      const tokens = await clerkClient.users.getUserOauthAccessToken(clerkId, 'oauth_google');
      if (!tokens || tokens.length === 0) {
        return NextResponse.json({
          error: "Google not connected",
          code: "GOOGLE_NOT_CONNECTED",
          details: "User must connect their Google account before setting integration type"
        }, { status: 400 });
      }
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({
        error: "User not found",
        code: "USER_NOT_FOUND",
        details: "User record does not exist in database"
      }, { status: 404 });
    }

    await prisma.userIntegration.upsert({
      where: { userId: user.id },
      update: { type },
      create: { userId: user.id, type },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Set integration type error:", err);
    return NextResponse.json({
      error: "Internal server error",
      code: "SET_INTEGRATION_TYPE_ERROR",
      details: err.message
    }, { status: 500 });
  }
}


