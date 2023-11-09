import ChatComponent from "@/components/ChatComponent";
import PDFViewer from "@/components/PDFViewer";
import { db } from "@/lib/db";
import { chats, papers } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
// import { toast } from "react-hot-toast";

type Props = {
  params: {
    chatId: string;
  };
};

const ChatPage = async ({ params: { chatId } }: Props) => {
  // get chatId from params
  try {
    const { userId } = await auth();
    if (!userId) {
      return redirect("/sign-in");
    }

    const _chats = await db
      .select()
      .from(chats)
      .rightJoin(papers, eq(chats.paperId, papers.id))
      .where(eq(chats.id, parseInt(chatId)));

    if (_chats.length != 1) {
      console.error("Chat not found");
      return redirect("/dashboard");
    }

    const pdf_url = _chats[0].papers.pdfUrl;

    return (
      <div className="flex max-h-screen overflow-scroll">
        <div className="flex w-full max-h-screen overflow-scroll">
          {/* pdf viewer */}
          <div className="max-h-screen p-4 oveflow-scroll flex-[7]">
            <PDFViewer pdf_url={pdf_url || ""} />
          </div>
          {/* chat component */}
          <div className="flex-[5] border-l-4 border-l-slate-200">
            <ChatComponent chatId={parseInt(chatId)} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error(error);
    return redirect("/dashboard");
  }
};

export default ChatPage;
