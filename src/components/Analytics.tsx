"use client";

import { Separator } from "./ui/separator";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DrizzlePaper } from "@/lib/db/schema";
import { redirect, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState } from "react";
import axios from "axios";
import DownloadButton from "./DownloadButton";
import TableRowComponent from "./TableRowComponent";

type AnalyticsProps = {
  all_messages: any[];
  comments: any[];
  responses: any[];
  paper: DrizzlePaper;
};

export const Analytics = ({
  all_messages,
  comments,
  responses,
  paper,
}: AnalyticsProps) => {
  const router = useRouter();

  const onNavigate = (url: string) => {
    return router.push(url);
  };

  const { id, paperTitle } = paper;
  // const comment = `This is another test comment`;

  const [localComments, setLocalComments] = useState(comments);

  // Function to delete a comment
  const handleDelete = async (commentId: number) => {
    try {
      // Replace with your API call to delete the comment
      await axios.delete(`/api/comments/${commentId}`);
      // Update local state
      const updatedComments = localComments.filter(
        (comment) => comment.id !== commentId
      );
      setLocalComments(updatedComments);
      toast.success("Comment deleted successfully");
      onNavigate(`/paper/${id}/view`);
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  // Function to update a comment
  const handleUpdate = async (commentId: number, newContent: string) => {
    try {
      // Replace with your API call to update the comment
      await axios.patch(`/api/comments/${commentId}`, { content: newContent });
      // Update local state
      const updatedComments = localComments.map((comment) =>
        comment.id === commentId ? { ...comment, content: newContent } : comment
      );
      setLocalComments(updatedComments);
      toast.success("Comment updated successfully");
      onNavigate(`/paper/${id}/view`);
    } catch (error) {
      toast.error("Failed to update comment");
    }
  };

  // Function to create a comment
  // the messageId should be the corrsponding response
  const handleCreate = async (newContent: string, messageId: number) => {
    try {
      const response = await axios.post(`/api/comments`, {
        content: newContent,
        messageId: messageId,
      });
      // Update local state
      const newComment = response.data;
      setLocalComments([...localComments, newComment]);
      toast.success("Comment created successfully");
      onNavigate(`/paper/${id}/view`);
    } catch (error) {
      toast.error("Failed to create comment");
    }
  };

  return (
    <div className="relative max-h-screen overflow-scroll ms-3 me-3">
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit">
        <div className="ms-2 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">{paperTitle}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              This paper has in total {all_messages.length} messages; You have
              left {comments.length} comments;
            </p>
          </div>
          <div className="me-3">
            <DownloadButton messages={all_messages} comments={comments} />
          </div>
        </div>

        <Separator className="bg-primary/10 mb-2" />
      </div>

      <Table>
        <TableCaption>
          A list of recent activities of paper - <strong>{paperTitle}</strong>
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>No.</TableHead>
            <TableHead className="w-[100px]">User Name</TableHead>
            <TableHead>Question</TableHead>
            <TableHead>Model Feedback</TableHead>
            <TableHead>CreatedAt</TableHead>
            <TableHead>Instructor Comment</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {all_messages.map((message, index) => {
            // Destructure the message object
            const { id, content, createdAt } = message;
            // Find the response for this message
            const relatedResponse = responses.find(
              (response) => response.messageId === id
            );
            // Find the comment for this message
            const relatedComment = localComments.find(
              (comment) =>
                comment.messageId === relatedResponse?.feedbackMessageId
            );

            // Return JSX for each message

            return (
              <TableRowComponent
                paperTitle={paperTitle}
                id={id}
                key={id}
                relatedComment={relatedComment}
                index={index}
                relatedResponse={relatedResponse}
                content={content}
                createdAt={createdAt}
                handleDelete={handleDelete}
                handleCreate={handleCreate}
                handleUpdate={handleUpdate}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
