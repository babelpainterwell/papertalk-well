// api/chats

import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const url = new URL(req.url);
    const paperIdParam = url.searchParams.get("paperId");
    if (!paperIdParam) {
      return NextResponse.json(
        { error: "paperId is required" },
        { status: 400 }
      );
    }

    const paperId = parseInt(paperIdParam, 10);
    if (isNaN(paperId)) {
      return NextResponse.json(
        { error: "paperId must be a number" },
        { status: 400 }
      );
    }
    const _chat = await db
      .select()
      .from(chats)
      .where(eq(chats.paperId, paperId));

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
