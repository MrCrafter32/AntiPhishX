import { NextResponse } from "next/server";
import { getIntegrationDetails } from "@/lib/imap";

export async function GET(req, { params }) {
  const { userId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const details = await getIntegrationDetails(userId);
    return NextResponse.json(details);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch IMAP details" }, { status: 500 });
  }
}
