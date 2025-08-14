import { auth } from "@clerk/nextjs/server";
import prisma from "./prisma";

export async function getUserId() {
  const { userId: clerkId } = await auth();
  return clerkId;
}

export async function getUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: clerkId },
    include: {
      integration: true,
    },
  });

  if (!user) {
    const newUser = await prisma.user.create({
      data: {
        id: clerkId,
        isFirstLogin: true,
      },
    });
    return newUser;
  }

  return user;
}