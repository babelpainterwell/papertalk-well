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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { redirect, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState } from "react";
import axios from "axios";
import Image from "next/image";
import DownloadButton from "./DownloadButton";

type AnalyticsProps = {
  messages: any[];
  comments: any[];
  responses: any[];
  paper: DrizzlePaper;
};

export const Analytics = ({
  messages,
  comments,
  responses,
  paper,
}: AnalyticsProps) => {
  // console.log(comments);
  const router = useRouter();

  const onNavigate = (url: string) => {
    return router.push(url);
  };

  const { id, paperTitle } = paper;
  // const comment = `This is another test comment`;

  const [localComments, setLocalComments] = useState(comments);
  const [commentContent, setCommentContent] = useState("");

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

  if (messages.length === 0) {
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
          No stats for this paper.
        </p>
      </div>
    );
  }

  return (
    <div className="relative max-h-screen overflow-scroll ms-3 me-3">
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit">
        <div className="ms-2 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">{paperTitle}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              This paper has in total {messages.length} messages; You have left{" "}
              {comments.length} comments;
            </p>
          </div>
          <div className="me-3">
            <DownloadButton messages={messages} comments={comments} />
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
          {messages.map((message, index) => {
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
              <TableRow key={id}>
                <TableCell>
                  <Checkbox checked={!!relatedComment} />
                </TableCell>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">
                  {relatedResponse?.userName}
                </TableCell>
                <TableCell>{content}</TableCell>
                <TableCell>
                  {relatedResponse
                    ? relatedResponse.content
                    : `Weird.. No model feedback is found`}
                </TableCell>
                <TableCell>{createdAt.toLocaleString()}</TableCell>
                <TableCell className="text-muted-foreground min-w-[300px]">
                  {relatedComment
                    ? relatedComment.content
                    : `You have not left any comment yet`}
                </TableCell>
                <TableCell className="min-w-[100px]">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-18 h-8">
                        Edit <Wand2 className="w-3 h-3 ml-1" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[800px]">
                      <DialogHeader>
                        <DialogTitle>Edit Comment</DialogTitle>
                        <DialogDescription>
                          Viewers will be able to see your comment
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4  gap-4">
                          <Label htmlFor="question" className="text-right">
                            Question
                          </Label>
                          <Textarea
                            id="question"
                            defaultValue={content}
                            className="col-span-3"
                            disabled
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                          <Label htmlFor="model" className="text-right">
                            Model Feedback
                          </Label>
                          <Textarea
                            id="model"
                            defaultValue={relatedResponse?.content}
                            className="col-span-3"
                            disabled
                            rows={6}
                          />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                          <Label htmlFor="comment" className="text-right">
                            Your Comment
                          </Label>
                          <Textarea
                            id="comment"
                            placeholder="Type your comment here"
                            className="col-span-3"
                            rows={6}
                            onChange={(e) => setCommentContent(e.target.value)}
                            defaultValue={relatedComment?.content}
                          />
                        </div>
                      </div>

                      <DialogFooter className="sm:justify-start">
                        <DialogClose asChild>
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => {
                              if (!relatedComment) {
                                toast.error(
                                  "You have to create a comment first"
                                );
                              } else {
                                handleDelete(relatedComment.id);
                              }
                            }}
                          >
                            Delete Comment
                          </Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button type="button" variant="secondary">
                            Cancel
                          </Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button
                            type="button"
                            variant="default"
                            onClick={() => {
                              if (!relatedComment) {
                                handleCreate(
                                  commentContent,
                                  relatedResponse.feedbackMessageId
                                );
                              } else {
                                handleUpdate(relatedComment.id, commentContent);
                              }
                            }}
                          >
                            {!relatedComment ? "Add" : "Update"}
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
