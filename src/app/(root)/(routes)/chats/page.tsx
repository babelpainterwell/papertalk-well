import { Papers } from "@/components/Papers";
import { db } from "@/lib/db";
import { papers, chats, DrizzlePaper } from "@/lib/db/schema";
import { eq, or, sql, inArray } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Image from "next/image";

const ChatsPage = async () => {
  const user = await currentUser();
  const userId = user?.id;

  if (!userId) {
    return redirect("/sign-in");
  }

  try {
    const _chats = await db
      .select({ paperId: chats.paperId })
      .from(chats)
      .where(eq(chats.userId, userId));

    if (_chats.length === 0) {
      return (
        <div className="pt-10 flex flex-col items-center justify-center space-y-3">
          <div className="relative w-60 h-60">
            <Image
              fill
              className="grayscale"
              src="/placeholder.svg"
              alt="Empty"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            You have no ongoing chats.
          </p>
        </div>
      );
    }

    const papaerIds =
      _chats.length > 0 ? _chats.map((chat) => chat.paperId) : [];

    const _papers =
      papaerIds.length > 0
        ? await db.select().from(papers).where(inArray(papers.id, papaerIds))
        : [];

    return (
      <div className="h-full p-8 space-y-2">
        <Papers data={_papers} />
      </div>
    );
  } catch (error) {
    console.error(error);
    return redirect("/dashboard");
  }
};

export default ChatsPage;
