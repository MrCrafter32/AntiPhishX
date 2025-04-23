import { getUserId } from "@/lib/getUser";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import prisma from "./prisma";

export async function getIntegrationDetails() {
    const session = await getServerSession(authOptions);
    if (!session) {
        throw new Error("Session not found");
    }
    const userId = session.user?.id;
    if (!userId) {
        throw new Error("User not found");
    }


    const IntegrationDetails = await prisma.userIntegration.findUnique({
        where: {
            userId: userId,
        },
    }); 
    return IntegrationDetails;
}

export async function connectToIMAP() {
    const integrationDetails = await getIntegrationDetails();

    const client = new ImapFlow({
                    host: integrationDetails.imapHost,
                    port: integrationDetails.imapPort,
                    secure: integrationDetails.imapSSL,
                    auth: {
                        user: integrationDetails.imapEmail,
                        pass: integrationDetails.imapPassword
                    }
                });
    return client;
    
}
