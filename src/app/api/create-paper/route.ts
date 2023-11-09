// api: create-paper

import { db } from "@/lib/db";
import { papers } from "@/lib/db/schema";
import { loadS3IntoPinecone } from "@/lib/pinecone";
import { getS3Url } from "@/lib/s3";
import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request, res: Response) {
  // const { userId } = await auth();
  const user = await currentUser();

  if (!user || !user.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { file_key, file_name, paperTitle, description } = body;
    const userName = `${user?.firstName} ${user?.lastName}`;
    const userId = user?.id;

    console.log(file_key, file_name);

    await loadS3IntoPinecone(file_key);

    const result = await db
      .insert(papers)
      .values({
        ownerId: userId,
        userName: userName,
        paperTitle: paperTitle,
        abstract: "No Abstract Provided",
        description: description,
        pdfUrl: getS3Url(file_key),
        fileKey: file_key,
      })
      .returning({
        insertedId: papers.id,
      });

    const paper_id = result[0].insertedId;

    return NextResponse.json(
      {
        paper_id: paper_id,
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
