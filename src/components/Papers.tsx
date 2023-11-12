"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { DrizzlePaper } from "@/lib/db/schema";
// import { MessagesSquare } from "lucide-react";
// import { auth } from "@clerk/nextjs";
import { redirect, usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { UserAvatar } from "./User-Avatar";
// import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import axios from "axios";
import { useRouter } from "next/navigation";

import { Card, CardFooter, CardHeader, CardContent } from "./ui/card";
import { toast } from "react-hot-toast";
import { Bot } from "lucide-react";
import { KanbanSquareDashed } from "lucide-react";
import { PencilLine } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";

interface PaperProps {
  data: DrizzlePaper[];
}

export const Papers = ({ data }: PaperProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // function to check if the URL contains a certain string
  const urlContains = (keyword: string) => {
    return pathname.includes(keyword);
  };

  const createChat = async (paper: DrizzlePaper) => {
    try {
      const response = await axios.post("/api/chats", {
        paperId: paper.id,
        // pdfUrl: paper.pdfUrl,
        // paperTitle: paper.paperTitle,
        // fileKey: paper.fileKey,
      });
      // Chat created, redirect to the chat page
      toast.success("A New Chat Created!");
      router.push(`/chat/${response.data.chat_id}`);
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Error creating chat");
      // Handle error appropriately
    }
  };

  const handleClick = async (paper: DrizzlePaper) => {
    try {
      const response = await axios.get(
        `/api/chats?paperId=${paper.id}&userId=${user.id}`
      );
      if (response.data.chat) {
        // Chat exists, redirect to the chat page
        router.push(`/chat/${response.data.chat.id}`);
      } else {
        // No chat exists, create a new one
        await createChat(paper);
      }
    } catch (error) {
      console.error("Error checking for chat:", error);
      toast.error("Error occurred while starting chat");
    }
  };

  if (data.length === 0) {
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
        <p className="text-sm text-muted-foreground">No papers found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-10">
      {data.map((item) => (
        <Card
          key={item.id}
          // className="bg-primary/5 rounded-xl cursor-pointer hover:opacity-75 transition border-0 ms-3 me-3 mt-3 mb-3 min-h-[286px]"
          className="flex flex-col h-full bg-primary/5 rounded-xl cursor-pointer hover:opacity-75 transition border-0 ms-3 me-3 min-h-[350px]"
        >
          <div className="mt-3 ms-3">
            {/* <Badge className="bg-sky-300">@{item.userName}</Badge> */}
            {urlContains("analytics") ? (
              <Badge variant={"default"}>@{item.userName}</Badge>
            ) : (
              <Badge className="bg-sky-300">@{item.userName}</Badge>
            )}
          </div>
          <CardHeader className="flex items-center text-center text-muted-foreground">
            <div>
              <p className="font-bold">{item.paperTitle}</p>
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center text-center text-muted-foreground">
            <p className="text-xs text-left">
              {item.description.length > 500
                ? item.description.slice(0, 500) + "..."
                : item.description}
            </p>
          </CardContent>

          <CardFooter className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
            <div>
              {urlContains("analytics") ? (
                <Link href={`paper/${item.id}`}>
                  <Button variant="outline" className="ms-1 pl-3 pr-3">
                    <PencilLine size={20} />
                  </Button>
                </Link>
              ) : (
                <></>
              )}
            </div>
            <div>
              {/* Conditionally render the button based on URL */}
              {urlContains("analytics") && (
                <div className="flex items-center">
                  {/* <Link href={`paper/${item.id}`}>
                    <Button variant="outline" className="ms-1 pl-3 pr-3">
                      <PencilLine size={20} />
                    </Button>
                  </Link> */}
                  <Link href={`paper/${item.id}/view`}>
                    <Button variant="default">
                      <KanbanSquareDashed size={16} className="me-2" />
                      View Analytics
                    </Button>
                  </Link>
                </div>
              )}
              {urlContains("dashboard") && (
                <Button variant="default" onClick={() => handleClick(item)}>
                  <Bot size={16} className="me-2" />
                  Start Chatting
                </Button>
              )}
              {urlContains("chats") && (
                <Button variant="default" onClick={() => handleClick(item)}>
                  <Bot size={16} className="me-2" />
                  Continue Chatting
                </Button>
              )}
            </div>
            {/* <div className="flex items-center">
              <p className="lowercase me-1">@{item.userName}</p>
              
            </div> */}
          </CardFooter>
          {/* </Link> */}
        </Card>
      ))}
    </div>
  );
};

// const CardSwiper = ({
//   description,
//   abstract,
// }: {
//   description: string;
//   abstract: string;
// }) => {
//   const contents = [
//     {
//       content: description,
//       label: "Description",
//     },
//     {
//       content: abstract,
//       label: "Abstract",
//     },
//   ];

//   return (
//     <ScrollArea className="w-full whitespace-nowrap rounded-md border">
//       <div className="flex w-max space-x-4 p-4">
//         {contents.map((contentItem, index) => (
//           <div key={index} className="shrink-0">
//             <p className="text-xs text-left">{contentItem.content}</p>
//           </div>
//         ))}
//       </div>
//       <ScrollBar orientation="horizontal" />
//     </ScrollArea>
//   );
// };
