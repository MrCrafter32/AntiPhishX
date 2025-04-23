import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


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