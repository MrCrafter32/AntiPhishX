import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      imapHost,
      imapPort,
      imapSSL,
      imapEmail,
      imapPassword
    } = body;

    if (!imapHost || !imapPort || imapSSL === undefined || !imapEmail || !imapPassword) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    await prisma.userIntegration.upsert({
      where: { userId: session.user.id },
      update: {
        type: "IMAP",
        imapHost,
        imapPort: parseInt(imapPort),
        imapSSL,
        imapEmail,
        imapPassword,
      },
      create: {
        userId: session.user.id,
        type: "IMAP",
        imapHost,
        imapPort: parseInt(imapPort),
        imapSSL,
        imapEmail,
        imapPassword,
      }
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { isFirstLogin: false },
    });
    session.user.isFirstLogin = false;
    session.isFirstLogin = false;

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error("POST /setup/imap error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
