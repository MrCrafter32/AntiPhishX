import { NextResponse } from "next/server";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { google } from "googleapis";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export async function GET(request) {
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

        const integrationType = await prisma.userIntegration.findFirst({
            where: { userId: user.id },
            select: { type: true }
        });
        
        if (!integrationType) {
            return NextResponse.json({
                error: "No email integration configured",
                code: "NO_INTEGRATION",
                details: "User has not configured email integration"
            }, { status: 400 });
        }

        if (integrationType.type === "GOOGLE") {
            const integrationDetails = await prisma.userIntegration.findUnique({
                where: { userId: user.id },
                select: { googleRefreshToken: true }
            });

            if (!integrationDetails || !integrationDetails.googleRefreshToken) {
                return NextResponse.json({
                    error: "Google integration not found or refresh token missing",
                    code: "GOOGLE_TOKEN_MISSING",
                    details: "Google OAuth refresh token is required"
                }, { status: 404 });
            }
            
            const oauth2Client = new google.auth.OAuth2(
                GOOGLE_CLIENT_ID,
                GOOGLE_CLIENT_SECRET
            );

            oauth2Client.setCredentials({
                refresh_token: integrationDetails.googleRefreshToken,
            });

            const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

            const listResponse = await gmail.users.messages.list({
                userId: 'me',
                maxResults: 15,
            });

            const messages = listResponse.data.messages || [];
            if (messages.length === 0) {
                return NextResponse.json([], { status: 200 });
            }

            const detailedMessagePromises = messages.map(message => 
                gmail.users.messages.get({
                    userId: 'me',
                    id: message.id,
                    format: 'raw' 
                })
            );

            const detailedMessageResults = await Promise.all(detailedMessagePromises);
            const detailedMessages = detailedMessageResults.map(res => res.data);
            
            const mails = [];
            for (const message of detailedMessages) {
                try {
                    if (!message.raw) {
                        continue; 
                    }

                    const rawEmailBuffer = Buffer.from(message.raw, 'base64url');
                    const parsed = await simpleParser(rawEmailBuffer);
                    
                    mails.push({
                        id: message.id,
                        subject: parsed.subject || "No subject",
                        from: parsed.from?.text || "Unknown sender",
                        date: parsed.date?.toISOString() || "Unknown date",
                        htmlBody: parsed.html || "",
                        textBody: parsed.text || "",
                        preview: parsed.text?.substring(0, 100) || parsed.html?.substring(0,100) || "No preview available."
                    });
                } catch (parseError) {
                    console.error("Error parsing message:", parseError);
                }
            }
            
            return NextResponse.json(mails, { status: 200 });

        } else {
            const integrationDetails = await prisma.userIntegration.findUnique({
                where: { userId: user.id },
            });

            if (!integrationDetails || integrationDetails.type !== "IMAP") {
                return NextResponse.json({
                    error: "IMAP integration not found",
                    code: "IMAP_INTEGRATION_MISSING",
                    details: "User has not configured IMAP integration"
                }, { status: 404 });
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
            const lock = await client.getMailboxLock("INBOX");

            try {
                const uids = await client.search({ all: true });
                const recentUids = uids.slice(-50).reverse();

                const messages = client.fetch(recentUids, {
                    envelope: true,
                    bodyStructure: true,
                    source: true,
                });

                const mails = [];
                for await (const message of messages) {
                    try {
                        if (!message.source) {
                            continue;
                        }
                        const parsed = await simpleParser(message.source);

                        mails.push({
                            id: message.uid,
                            subject: parsed.subject || "No subject",
                            from: parsed.from?.text || "Unknown sender",
                            date: parsed.date?.toISOString() || "Unknown date",
                            htmlBody: parsed.html || "",
                            textBody: parsed.text || "",
                            preview:
                                parsed.text?.substring(0, 100) ||
                                parsed.html?.substring(0, 100) ||
                                "No preview available."
                        });
                    } catch (parseError) {
                        console.error("Error parsing message:", parseError);
                    }
                }

                return NextResponse.json(mails);
            } finally {
                lock.release();
                await client.logout();
            }
        }
    } catch (error) {
        console.error("Error fetching inbox:", error);
        return NextResponse.json({
            error: "Internal server error",
            code: "FETCH_INBOX_ERROR",
            details: error.message
        }, { status: 500 });
    }
}