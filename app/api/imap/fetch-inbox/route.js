    import { NextResponse } from "next/server";
    const { ImapFlow } = require('imapflow');
    import { ObjectId } from "mongodb";
    const pino = require('pino');

    export async function GET(request) {
        pino.level = 'silent';
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Authorization token is required" }, { status: 401 });
        }
        const sessionId = authHeader.split(" ")[1];

        if (!sessionId) {
            return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
        }

        const userId = sessionId;

        if (!userId) {
            return NextResponse.json({ error: "Invalid session ID" }, { status: 401 });
        }
        const integrationDetails = await prisma.UserIntegration.findUnique({
            where: {
                userId: new ObjectId(userId),
            }
        });
        
        if (!integrationDetails) {
            return NextResponse.json({
                error: "Integration details not found",
            }, { status: 404 });
        }
        if (integrationDetails.type === "IMAP") {
            const client = new ImapFlow({
                host: integrationDetails.imapHost,
                port: integrationDetails.imapPort,
                secure: integrationDetails.imapSSL,
                auth: {
                    user: integrationDetails.imapEmail,
                    pass: integrationDetails.imapPassword
                },
                logger: pino
            });

            
            try {
                await client.connect();
                client.on('fetch', (msg) => {
                    if (msg.envelope && msg.envelope.date) {
                        msg.envelope.date = msg.envelope.date.toString();
                    }
                });
                let lock = await client.getMailboxLock('INBOX');

                const mailboxStatus = await client.status('INBOX', { messages: true });
                const totalMessages = mailboxStatus.messages;
                const start = Math.max(1, totalMessages - 99);
                const messages = await client.fetch(`${totalMessages}:${start}`, { envelope: true });
                
                let mailList = [];
                
                for await (let msg of messages) {
                    mailList.unshift({ // Use unshift to push emails in reverse order
                        id: msg.uid.toString(),
                        subject: msg.envelope.subject,
                        from: msg.envelope.from[0].address,
                        date: msg.envelope.date,
                        
                    });
                    console.log(msg)
                }

                //log length of mailList
                // console.log(mailList)
                console.log("Mail list length:", mailList.length);
                return NextResponse.json(mailList, { status: 200 });
            } catch (error) {
                console.error("Error fetching mails:", error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            } finally {
                await client.logout();
            }
        }
    }
