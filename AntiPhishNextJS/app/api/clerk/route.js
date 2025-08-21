import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyWebhook } from '@clerk/nextjs/webhooks'

export async function POST(request) {
    try {
        const payload = await verifyWebhook(request);
        
        const { type, data } = payload;

        if (!type || !data) {
            return NextResponse.json({
                error: "Invalid webhook payload",
                code: "INVALID_WEBHOOK_PAYLOAD",
                details: "Webhook must contain type and data fields"
            }, { status: 400 });
        }

        if (type === "user.created") {
            await prisma.user.upsert({
                where: { clerkId: data.id },
                update: {
                    email: data.email_addresses?.[0]?.email_address || "",
                    name: data.first_name && data.last_name
                        ? `${data.first_name} ${data.last_name}`
                        : data.username || "",
                },
                create: {
                    clerkId: data.id,
                    email: data.email_addresses?.[0]?.email_address || "",
                    name: data.first_name && data.last_name
                        ? `${data.first_name} ${data.last_name}`
                        : data.username || "",
                },
            });
        } else if (type === "user.updated") {
            await prisma.user.upsert({
                where: { clerkId: data.id },
                update: {
                    email: data.email_addresses?.[0]?.email_address || "",
                    name: data.first_name && data.last_name
                        ? `${data.first_name} ${data.last_name}`
                        : data.username || "",
                },
                create: {
                    clerkId: data.id,
                    email: data.email_addresses?.[0]?.email_address || "",
                    name: data.first_name && data.last_name
                        ? `${data.first_name} ${data.last_name}`
                        : data.username || "",
                },
            });
        } else if (type === "user.deleted") {
            const record = await prisma.user.findUnique({
                where: { clerkId: data.id },
            });
            if (record) {
            await prisma.user.delete({
                where: { clerkId: data.id },
            });}
        } else {
            return NextResponse.json({ message: "Event ignored" }, { status: 200 });
        }
        return NextResponse.json({ message: "Webhook processed" }, { status: 200 });
    } catch (error) {
        console.error("Clerk webhook error:", error);
        return NextResponse.json({
            error: "Internal server error",
            code: "CLERK_WEBHOOK_ERROR",
            details: error.message
        }, { status: 500 });
    }
}
