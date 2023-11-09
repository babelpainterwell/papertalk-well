// api/get-comment

import { db } from "@/lib/db";
import { comments } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized access." },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const messageIdParam = url.searchParams.get("messageId");
    if (!messageIdParam) {
      return NextResponse.json(
        { error: "Parameter 'messageId' is required." },
        { status: 400 }
      );
    }

    const messageId = parseInt(messageIdParam, 10);
    if (isNaN(messageId)) {
      return NextResponse.json(
        { error: "Parameter 'messageId' must be a number." },
        { status: 400 }
      );
    }

    const _comment = await db
      .select()
      .from(comments)
      .where(eq(comments.messageId, messageId));

    if (_comment.length === 0) {
      return NextResponse.json({ comment: null }, { status: 404 });
    }

    // Return the comment
    return NextResponse.json({ comment: _comment[0] }, { status: 200 });
  } catch (error) {
    console.error(error); // Log the error for server-side debugging
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
