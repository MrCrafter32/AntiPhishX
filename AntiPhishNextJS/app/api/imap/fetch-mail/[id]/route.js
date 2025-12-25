import { NextResponse } from "next/server";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export async function GET(request, { params }) {
    try {
        const { userId: clerkId } = await auth();
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
            return NextResponse.json({
                error: "User not found",
                code: "USER_NOT_FOUND",
                details: "User record does not exist in database"
            }, { status: 404 });
        }
        const integrationDetails = await prisma.userIntegration.findUnique({
            where: { userId: user.id },
        });

        if (!integrationDetails) {
            return NextResponse.json({
                error: "No email integration configured",
                code: "NO_INTEGRATION",
                details: "User has not configured email integration"
            }, { status: 400 });
        }

        const { id } = params;
        const mailId = id;

        if (!mailId) {
            return NextResponse.json({
                error: "Mail ID is required",
                code: "MISSING_MAIL_ID",
                details: "Mail ID parameter is missing from request"
            }, { status: 400 });
        }

        if (integrationDetails.type === "GOOGLE") {
            const refreshToken = integrationDetails.googleRefreshToken;
            const tokenUrl = 'https://oauth2.googleapis.com/token';

            const tokenResponse = await fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_id: GOOGLE_CLIENT_ID,
                    client_secret: GOOGLE_CLIENT_SECRET,
                    refresh_token: refreshToken,
                    grant_type: 'refresh_token',
                }),
            });
            const tokenData = await tokenResponse.json();
            if (!tokenResponse.ok) {
                throw new Error(tokenData.error_description || tokenData.error || 'Failed to refresh access token');
            }

            const { access_token } = tokenData;

            const messageData = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${mailId}?format=raw`, {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }).then(res => res.json());

            if (!messageData || !messageData.raw) {
                console.error("Message data or raw property is missing.");
                return NextResponse.json({
                    error: "Message not found or invalid format",
                    code: "MESSAGE_INVALID",
                    details: "Gmail message data is missing or corrupted"
                }, { status: 404 });
            }
            
            const rawEmail = Buffer.from(messageData.raw, 'base64url').toString();
            const parsed = await simpleParser(rawEmail);

            const mailDetails = {
                id: mailId,
                subject: parsed.subject || "No subject",
                from: parsed.from?.text || "Unknown sender",
                date: parsed.date?.toISOString() || "Unknown date",
                htmlBody: parsed.html || "No HTML content available",
                textBody: parsed.text || "No text content available",
            };

            return NextResponse.json(mailDetails, { status: 200 });
            
        } else if (integrationDetails.type === "IMAP") {
            try {
                if (!integrationDetails.imapHost || !integrationDetails.imapEmail || !integrationDetails.imapPassword) {
                    return NextResponse.json({
                        error: "IMAP details are incomplete",
                        code: "IMAP_CONFIG_INCOMPLETE",
                        details: "IMAP host, email, or password is missing"
                    }, { status: 400 });
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
                let lock;
                try {
                    lock = await client.getMailboxLock("INBOX");

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

                    return NextResponse.json(mailDetails, { status: 200 });
                } finally {
                    if (lock) {
                        lock.release();
                    }
                    await client.logout();
                }
            } catch (error) {
                console.error("Error fetching mail via IMAP:", error);
                return NextResponse.json({
                    error: "Failed to fetch mail via IMAP",
                    code: "IMAP_FETCH_ERROR",
                    details: error.message
                }, { status: 500 });
            }
        } else {
             return NextResponse.json({
                 error: "Unsupported integration type",
                 code: "UNSUPPORTED_INTEGRATION",
                 details: `Integration type '${integrationDetails.type}' is not supported`
             }, { status: 400 });
        }
    } catch (error) {
        console.error("Error fetching mail:", error);
        return NextResponse.json({
            error: "Internal server error",
            code: "FETCH_MAIL_ERROR",
            details: error.message
        }, { status: 500 });
    }
}
