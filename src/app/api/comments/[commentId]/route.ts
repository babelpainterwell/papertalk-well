import { db } from "@/lib/db";
import { comments } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function DELETE(
  req: Request,
  { params }: { params: { commentId: string } }
) {
  try {
    const { userId } = await auth();

    if (!params.commentId) {
      return new NextResponse("Comment ID required", { status: 400 });
    }

    const commentIdNumber = parseInt(params.commentId);
    if (isNaN(commentIdNumber)) {
      return new NextResponse("Invalid comment ID", { status: 400 });
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized access." },
        { status: 401 }
      );
    }

    // const url = new URL(req.url);
    // const commentIdParam = url.searchParams.get("commentId");
    // if (!commentIdNumber) {
    //   return NextResponse.json(
    //     { error: "Parameter 'commentId' is required." },
    //     { status: 400 }
    //   );
    // }

    // const commentId = parseInt(commentIdParam, 10);
    // if (isNaN(commentId)) {
    //   return NextResponse.json(
    //     { error: "Parameter 'commentId' must be a number." },
    //     { status: 400 }
    //   );
    // }

    await db.delete(comments).where(eq(comments.id, commentIdNumber));

    // Return a success response
    return NextResponse.json(
      { message: "Comment deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { commentId: string } }
) {
  try {
    if (!params.commentId) {
      return new NextResponse("Comment ID required", { status: 400 });
    }

    const commentIdNumber = parseInt(params.commentId);
    if (isNaN(commentIdNumber)) {
      return new NextResponse("Invalid comment ID", { status: 400 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized access." },
        { status: 401 }
      );
    }

    // const url = new URL(req.url);
    // const commentIdParam = url.searchParams.get("commentId");
    const body = await req.json();
    const content = body.content;

    if (!commentIdNumber || !content) {
      return NextResponse.json(
        { error: "Parameters 'commentId' and 'content' are required." },
        { status: 400 }
      );
    }

    // const commentId = parseInt(commentIdParam, 10);
    // if (isNaN(commentId)) {
    //   return NextResponse.json(
    //     { error: "Parameter 'commentId' must be a number." },
    //     { status: 400 }
    //   );
    // }

    await db
      .update(comments)
      .set({ content: content, updatedAt: new Date() })
      .where(eq(comments.id, commentIdNumber));

    // Return a success response
    return NextResponse.json(
      { message: "Comment updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
