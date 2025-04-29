import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { ObjectId } from "mongodb";

export async function POST(request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { imapHost, imapPort, imapSSL, imapEmail, imapPassword } = await request.json();

    try {
        const integrationDetails = await prisma.userIntegration.findUnique({
            where: { userId: new ObjectId(userId) },
        });

        if (!integrationDetails) {
            return NextResponse.json({ error: "IMAP integration not found" }, { status: 404 });
        }

        await prisma.userIntegration.update({
            where: { userId: new ObjectId(userId) },
            data: {
                imapHost,
                imapPort: parseInt(imapPort, 10), // Convert imapPort to an integer
                imapSSL,
                imapEmail,
                imapPassword,
            },
        });

        return NextResponse.json({ message: "IMAP settings updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error updating IMAP settings:", error);
        return NextResponse.json({ error: "Failed to update IMAP settings" }, { status: 500 });
    }
}