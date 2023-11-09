import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { papers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: { paperId: string } }
) {
  try {
    const body = await req.json();
    const user = await currentUser();
    // const { src, name, description, instructions, seed, categoryId } = body;
    const { paperTitle, description } = body;

    if (!params.paperId) {
      return new NextResponse("Paper ID required", { status: 400 });
    }

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!paperTitle || !description) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Assuming paperId should be a number, parse and validate it.
    const paperIdNumber = parseInt(params.paperId);
    if (isNaN(paperIdNumber)) {
      return new NextResponse("Invalid paper ID", { status: 400 });
    }

    const updatedPaper = await db
      .update(papers)
      .set({ paperTitle: paperTitle, description: description }) // Assuming your schema has 'title' instead of 'paperTitle'.
      .where(eq(papers.id, paperIdNumber))
      .returning({ updatedId: papers.id });

    // If no rows are updated, it could mean the paper doesn't exist.
    if (updatedPaper.length === 0) {
      return new NextResponse("No paper found with the given ID", {
        status: 404,
      });
    }

    // Success response.
    return new NextResponse(JSON.stringify(updatedPaper), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log("[PAPER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { paperId: string } }
) {
  try {
    // Assuming 'auth()' is an async function; if not, you should not use 'await'.
    const { userId } = await auth();

    // Verify if the user is authenticated.
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Validate the paperId.
    const paperIdNumber = parseInt(params.paperId);
    if (isNaN(paperIdNumber)) {
      return new NextResponse("Invalid paper ID", { status: 400 });
    }

    // Delete the paper from the database.
    const deletedPaper = await db
      .delete(papers)
      .where(eq(papers.id, paperIdNumber))
      .returning({ deletedId: papers.id });

    // If no rows are deleted, the paper doesn't exist.
    if (deletedPaper.length === 0) {
      return new NextResponse("No paper found with the given ID", {
        status: 404,
      });
    }

    // Success response with the ID of the deleted paper.
    return new NextResponse(JSON.stringify(deletedPaper), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[PAPER_DELETE]", error); // Use console.error for proper error logging.
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
