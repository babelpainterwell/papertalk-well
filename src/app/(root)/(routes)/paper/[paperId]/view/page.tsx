import { db } from "@/lib/db";
import { papers, chats, messages, comments, responses } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { eq, inArray, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import { Analytics } from "@/components/Analytics";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

type Props = {
  params: {
    paperId: string;
  };
};

const ViewPaperPage = async ({ params: { paperId } }: Props) => {
  // get paperId from params
  const { userId } = auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  try {
    const paper = await db
      .select()
      .from(papers)
      .where(eq(papers.id, parseInt(paperId)));

    if (paper.length === 0) {
      console.error("Paper not found");
      return redirect("/dashboard");
    }

    const currentPaper = paper[0];

    if (currentPaper.ownerId !== userId) {
      console.error("You have no access to this paper");
      return redirect("/dashboard");
    }

    // get all the chats related to the paperId
    const _chats = await db
      .select()
      .from(chats)
      .where(eq(chats.paperId, currentPaper.id));

    const chatsId = _chats.map((chat) => chat.id);
    if (chatsId.length === 0) {
      console.error("No chats found for this paper.");
      return redirect("/analytics");
    }

    // Proceed with fetching messages if chats are found
    const _messages =
      chatsId.length > 0
        ? await db
            .select()
            .from(messages)
            .where(
              and(inArray(messages.chatId, chatsId), eq(messages.role, "user"))
            )
        : [];

    // Similarly, fetch feedback messages if chats are found
    const _feedbackMessages =
      chatsId.length > 0
        ? await db
            .select()
            .from(messages)
            .where(
              and(
                inArray(messages.chatId, chatsId),
                eq(messages.role, "assistant")
              )
            )
        : [];

    // console.log(_messages);

    const messagesId = _messages.map((message) => message.id);
    const feedbackMessagesId = _feedbackMessages.map((message) => message.id);

    // get all the comments whose messageId is in the messagesId
    const _comments =
      feedbackMessagesId.length > 0
        ? await db
            .select()
            .from(comments)
            .where(inArray(comments.messageId, feedbackMessagesId))
        : [];

    // console.log(_comments);

    // get all the responses to the messages
    const _responses =
      messagesId.length > 0
        ? await db
            .select()
            .from(responses)
            .where(inArray(responses.messageId, messagesId))
        : [];

    return (
      <div className="flex h-screen overflow-scroll">
        <div className="flex w-full max-h-screen overflow-scroll">
          {/* chat component */}
          <div className="flex-[7] border-l-4 border-l-slate-200">
            <Analytics
              messages={_messages}
              comments={_comments}
              responses={_responses}
              paper={currentPaper}
            />
          </div>
        </div>
      </div>
    );
  } catch (e) {
    console.error(e);
    return redirect("/dashboard");
  }
};

export default ViewPaperPage;
