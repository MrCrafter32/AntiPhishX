import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function PUT(req) {
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
    const { imapHost, imapPort, imapSSL, imapEmail, imapPassword } = body;

    if (!imapHost || !imapPort || imapSSL === undefined || !imapEmail || !imapPassword) {
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

    await prisma.userIntegration.update({
      where: { userId: user.id },
      data: { imapHost, imapPort, imapSSL, imapEmail, imapPassword }
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { isFirstLogin: false }
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("PUT /imap/update error:", error);
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      code: "IMAP_UPDATE_ERROR",
      details: error.message
    }), { status: 500 });
  }
}