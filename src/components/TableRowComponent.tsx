import React from "react";
import { useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Wand2 } from "lucide-react";
import { Textarea } from "./ui/textarea";
import toast from "react-hot-toast";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useChat } from "ai/react";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

// define Props
type Props = {
  paperTitle: string;
  id: number;
  relatedComment: any;
  index: number;
  relatedResponse: any;
  content: string;
  createdAt: Date;
  handleDelete: any;
  handleCreate: any;
  handleUpdate: any;
};

const TableRowComponent = ({
  paperTitle,
  id,
  relatedComment,
  index,
  relatedResponse,
  content,
  createdAt,
  handleDelete,
  handleCreate,
  handleUpdate,
}: Props) => {
  // student_question = content
  // current_response = {relatedComment?.content ? relatedComment?.content : relatedResponse?.content}
  // human_feedback = humanFeedbackInput

  // remember to set current response after the instructor generates new comment, which is the commentContent
  // how to display the received messages[0]
  // set commentContent to be the received messages[0].content
  // set current_response to be the received messages[0].content

  const [commentContent, setCommentContent] = useState(relatedComment?.content); // the final delivery to be stored in database
  const [student_question, setStudent_question] = useState(content);
  const temp = relatedComment?.content
    ? relatedComment?.content
    : relatedResponse?.content;
  const [current_response, setCurrent_response] = useState(temp);
  const [human_feedback, setHuman_feedback] = useState("");

  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: "/api/tempComment",
    body: {
      paperTitle,
      student_question,
      current_response,
      human_feedback,
    },
  });

  useEffect(() => {
    // Check if messages array exists and has at least one message
    if (messages && messages.length > 0) {
      // Get the latest message
      console.log(messages);
      const latestMessage = messages[messages.length - 1];

      // Update the commentContent and current_response state
      // Adjust based on the structure of your message object
      setCommentContent(latestMessage.content);
      setCurrent_response(latestMessage.content);
    }
  }, [messages]); // Effect runs when `messages` changes

  return (
    <TableRow key={id}>
      <TableCell>
        <Checkbox checked={!!relatedComment} />
      </TableCell>
      <TableCell>{index + 1}</TableCell>
      <TableCell className="font-medium">{relatedResponse?.userName}</TableCell>
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
          : `Click the button on the right to refine the model answer`}
      </TableCell>
      <TableCell className="min-w-[100px]">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-18 h-8">
              Refine <Wand2 className="w-3 h-3 ml-1" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Refine Model Answer</DialogTitle>
              <DialogDescription>
                Viewers will be able to see your refined answer
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
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-4 gap-4 mt-2">
                <Label htmlFor="model" className="text-right">
                  Model Answer
                </Label>
                <Textarea
                  id="model"
                  defaultValue={relatedResponse?.content}
                  className="col-span-3"
                  disabled
                  rows={6}
                />
              </div>
              {/* <div className="grid grid-cols-4 gap-4 mt-2"> */}
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-4 gap-4 mt-2"
              >
                <div className="flex items-center justify-end">
                  <Button className="pr-0">
                    Refine
                    <Sparkles className="w-12" />
                  </Button>
                </div>
                {/* check if there is a given comment otherwise provide the model feedback to the chatbot */}
                <Textarea
                  id="comment"
                  placeholder="Give your suggestions on how to refine the model answer or update your previous refined answer. Note that you can directly edit the answer below"
                  className="col-span-3"
                  rows={3}
                  onChange={(e) => {
                    setHuman_feedback(e.target.value); // Update human_feedback state
                    handleInputChange(e); // Call the additional input change handler
                  }}
                  value={input}
                />
              </form>
              {/* </div> */}
              <div className="grid mt-2 gap-4">
                <Textarea
                  id="feedback"
                  placeholder="AI generated refined will be shown here. You can also edit it directly."
                  className="col-span-3"
                  rows={8}
                  onChange={(e) => setCommentContent(e.target.value)}
                  value={commentContent}
                />
                <DialogDescription>
                  Note that you can directly edit the refined answer above
                </DialogDescription>
              </div>
            </div>

            <DialogFooter className="sm:justify-end">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    if (!relatedComment) {
                      toast.error("You have to create a comment first");
                    } else {
                      handleDelete(relatedComment.id);
                    }
                  }}
                >
                  Delete Refined Answer
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel Editing
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
};

export default TableRowComponent;
