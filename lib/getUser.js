import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "./prisma";
import { ObjectId } from "mongodb";


export async function getUserId() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return null;
    }
    return session.user.id;
}

export async function getUserEmail() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return null;
    }
    return session.user.email;
}

export async function getUserType() {
    const session = await getServerSession(authOptions);
    const user = await prisma.UserIntegration.findUnique({
        where: {
            userId: new ObjectId(session.user.id),
        },
    });
    
    return user.type;
}