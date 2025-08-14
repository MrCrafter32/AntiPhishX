import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { userId: clerkId } = await params;
    
    if (!clerkId) {
      return NextResponse.json({
        error: "User ID is required",
        code: "MISSING_USER_ID",
        details: "User ID parameter is missing from request"
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { isFirstLogin: true },
    });

    if (!user) {
      return NextResponse.json({
        error: "User not found",
        code: "USER_NOT_FOUND",
        details: "User record does not exist in database"
      }, { status: 404 });
    }

    return NextResponse.json({ isFirstLogin: user.isFirstLogin });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({
      error: "Internal server error",
      code: "FETCH_USER_ERROR",
      details: error.message
    }, { status: 500 });
  }
}
