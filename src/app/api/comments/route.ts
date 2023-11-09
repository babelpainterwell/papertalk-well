import { db } from "@/lib/db";
import { comments } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized access." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { content, messageId } = body;

    if (!content || !messageId) {
      return NextResponse.json(
        { error: "Parameters 'content' and 'messageId' are required." },
        { status: 400 }
      );
    }

    const result = await db
      .insert(comments)
      .values({ messageId: messageId, userId: userId, content: content })
      .returning();

    // Return the new comment
    return NextResponse.json(
      {
        id: result[0].id,
        messageId: result[0].messageId,
        userId: result[0].userId,
        content: result[0].content,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
