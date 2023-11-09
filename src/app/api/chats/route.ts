// api/chats

import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const paperIdParam = url.searchParams.get("paperId");
    const userIdParam = url.searchParams.get("userId"); // Retrieve the userId from query params

    // Check if both paperId and userId are provided
    if (!paperIdParam || !userIdParam) {
      return NextResponse.json(
        { error: "paperId and userId are required" },
        { status: 400 }
      );
    }

    const paperId = parseInt(paperIdParam, 10);
    // const userId = parseInt(userIdParam, 10);
    // Check if paperId and userId are valid numbers
    if (isNaN(paperId)) {
      return NextResponse.json(
        { error: "paperId and userId must be numbers" },
        { status: 400 }
      );
    }

    const _chat = await db
      .select()
      .from(chats)
      .where(and(eq(chats.paperId, paperId), eq(chats.userId, userIdParam)));

    if (_chat.length !== 1) {
      return NextResponse.json({ chat: null }, { status: 200 });
    }
    // return the chat
    return NextResponse.json(
      {
        chat: {
          id: _chat[0].id,
          paperId: _chat[0].paperId,
          // paperTitle: _chat[0].paperTitle,
          // pdfUrl: _chat[0].pdfUrl,
          createdAt: _chat[0].createdAt,
          // fileKey: _chat[0].fileKey,
          userId: _chat[0].userId,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { paperId } = body;

    const chat_id = await db
      .insert(chats)
      .values({
        paperId: paperId,
        // paperTitle: paperTitle,
        // pdfUrl: pdfUrl,
        userId: userId,
        // fileKey: fileKey,
      })
      .returning({
        insertedId: chats.id,
      });

    return NextResponse.json(
      {
        chat_id: chat_id[0].insertedId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
