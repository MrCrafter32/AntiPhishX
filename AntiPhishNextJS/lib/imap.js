import prisma from "./prisma";

export async function getIntegrationDetails(userId) {
    // console.log("Fetching integration details for user ID:", userId);


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
