import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return new Response(JSON.stringify({
      error: "Unauthorized",
      code: "UNAUTHORIZED",
      details: "User authentication required"
    }), { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      type,
      imapHost,
      imapPort,
      imapSSL,
      imapEmail,
      imapPassword
    } = body;

    if (!type || (type !== "IMAP" && type !== "GOOGLE")) {
      return new Response(JSON.stringify({
        error: "Invalid integration type",
        code: "INVALID_INTEGRATION_TYPE",
        details: "Integration type must be either 'IMAP' or 'GOOGLE'"
      }), { status: 400 });
    }

    if (type === "IMAP" && (!imapHost || !imapPort || imapSSL === undefined || !imapEmail || !imapPassword)) {
      return new Response(JSON.stringify({
        error: "Missing IMAP fields",
        code: "MISSING_IMAP_FIELDS",
        details: "All IMAP configuration fields are required: host, port, SSL, email, password"
      }), { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true }
    });

    if (!user) {
      return new Response(JSON.stringify({
        error: "User not found",
        code: "USER_NOT_FOUND",
        details: "User record does not exist in database"
      }), { status: 404 });
    }

    await prisma.userIntegration.upsert({
      where: { userId: user.id },
      update: {
        type,
        ...(type === "IMAP"
          ? {
              imapHost,
              imapPort: parseInt(imapPort),
              imapSSL,
              imapEmail,
              imapPassword,
            }
          : {
              imapHost: null,
              imapPort: null,
              imapSSL: null,
              imapEmail: null,
              imapPassword: null,
            }),
      },
      create: {
        userId: user.id,
        type,
        ...(type === "IMAP"
          ? {
              imapHost,
              imapPort: parseInt(imapPort),
              imapSSL,
              imapEmail,
              imapPassword,
            }
          : {}),
      }
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { isFirstLogin: false },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error("POST /setup/imap error:", error);
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      code: "SETUP_IMAP_ERROR",
      details: error.message
    }), { status: 500 });
  }
}

export async function GET(req) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return new Response(JSON.stringify({
      error: "Unauthorized",
      code: "UNAUTHORIZED",
      details: "User authentication required"
    }), { status: 401 });
  }

  try {
    const isFirstLogin = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        isFirstLogin: true,
      }
    });

    if (isFirstLogin === null) {
      return new Response(JSON.stringify({
        error: "User not found",
        code: "USER_NOT_FOUND",
        details: "User record does not exist in database"
      }), { status: 404 });
    } else{
      return new Response(JSON.stringify({ isFirstLogin }), { status: 200 });
    }

  } catch (error) {
    console.error("GET /setup/imap error:", error);
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      code: "GET_SETUP_IMAP_ERROR",
      details: error.message
    }), { status: 500 });
  }
}
