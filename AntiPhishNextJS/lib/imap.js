import prisma from "./prisma";

export async function getIntegrationDetails(clerkId) {
    const details = await prisma.userIntegration.findUnique({
        where: {
            userId: clerkId,
        },
    }); 

    return details;
}

export async function connectToIMAP(clerkId) {
    const integrationDetails = await getIntegrationDetails(clerkId);

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
