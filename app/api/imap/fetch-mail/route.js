import { NextResponse } from "next/server";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const { searchParams } = new URL(request.url);
        const mailId = searchParams.get("id");

        if (!mailId) {
            return NextResponse.json({ error: "Mail ID is required" }, { status: 400 });
        }

        const integrationDetails = await prisma.userIntegration.findUnique({
            where: { userId: new ObjectId(userId) },
        });

        if (!integrationDetails || integrationDetails.type !== "IMAP") {
            return NextResponse.json({ error: "IMAP integration not found" }, { status: 404 });
        }

        const client = new ImapFlow({
            host: integrationDetails.imapHost,
            port: integrationDetails.imapPort,
            secure: integrationDetails.imapSSL,
            auth: {
                user: integrationDetails.imapEmail,
                pass: integrationDetails.imapPassword,
            },
        });

        await client.connect();
        await client.getMailboxLock("INBOX");

        const message = await client.fetchOne(mailId, {
            uid: true,
            envelope: true,
            source: true,
            bodyStructure: true,
        }, { uid: true });

        if (!message?.source) {
            throw new Error("Message source not found");
        }

        const parsed = await simpleParser(message.source);

        const mailDetails = {
            id: mailId,
            subject: parsed.subject || "No subject",
            from: parsed.from?.text || "Unknown sender",
            date: parsed.date?.toISOString() || "Unknown date",
            htmlBody: parsed.html || "No HTML content available",
            textBody: parsed.text || "No text content available",
        };

        return NextResponse.json(mailDetails);
    } catch (error) {
        console.error("Error fetching mail:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
