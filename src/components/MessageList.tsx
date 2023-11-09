"use client";

import { cn } from "@/lib/utils";
import { Message } from "ai/react";
import { Loader2 } from "lucide-react";
import React from "react";
import { messages as _messages } from "@/lib/db/schema";
import axios from "axios";
import { useState, useEffect } from "react";

type Props = {
  isLoading: boolean;
  messages: Message[];
};

type Comment = {
  id: number;
  messageId: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

type MessageWithComment = Message & {
  comment?: Comment; // Optional property, since a message might not have a comment
};

const MessageList = ({ messages, isLoading }: Props) => {
  const [messagesWithComments, setMessagesWithComments] = useState<
    MessageWithComment[]
  >([]);
  22;
  useEffect(() => {
    const fetchComments = async () => {
      // Map each message to a request to get its comment
      const commentRequests = messages.map((message) =>
        axios.get(`/api/get-comment?messageId=${message.id}`).catch((e) => {
          console.error(`There is no comment for message: ${message.id}:`, e);
        })
      );

      // Wait for all requests to finish
      const commentsResponses = await Promise.all(commentRequests);

      // Combine messages with their comments
      const combinedData = messages.map((message, index) => {
        const commentResponse = commentsResponses[index];
        return {
          ...message,
          comment: commentResponse?.data.comment || null,
        };
      });

      const sortedCombinedData = combinedData.sort(
        (a, b) => parseInt(a.id) - parseInt(b.id)
      );

      setMessagesWithComments(sortedCombinedData);
    };

    fetchComments();
  }, [messages]);

  if (isLoading) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (messagesWithComments.length === 0) return <></>;

  return (
    <div className="flex flex-col gap-2 px-4">
      {messagesWithComments.map((message) => {
        return (
          <div
            key={message.id}
            className={cn("flex", {
              "justify-end pl-10": message.role === "user",
              "justify-start pr-10": message.role === "assistant",
            })}
          >
            <div className="flex-block mb-1 mt-1">
              <div
                className={cn(
                  "rounded-lg px-3 text-sm py-1 shadow-md ring-1 ring-gray-900/10 mb-2",
                  {
                    "bg-black text-white": message.role === "user",
                  }
                )}
              >
                <p>{message.content}</p>
              </div>

              {/* Comment container */}
              {message.comment && (
                <div className="rounded-lg px-3 text-sm py-1 shadow-md ring-1 ring-gray-900/10 bg-orange-200">
                  <p className="text-sm text-muted-foreground mb-1">
                    Comment from instructor:{" "}
                    <div hidden>{message.comment.messageId}</div>
                  </p>
                  <p>{message.comment.content}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
