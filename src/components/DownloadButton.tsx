import React from "react";
import { saveAs } from "file-saver"; // You would need to install file-saver or use a similar library
import { Button } from "./ui/button";
import { Download } from "lucide-react";

type Props = {
  messages: any[];
  comments: any[];
  responses: any[];
};

const DownloadButton = ({ messages, comments, responses }: Props) => {
  // comment.messageId is the id of the model feedback message that the comment is attached to
  //   console.log(comments.length);
  //   console.log(messages.length);
  // Create a lookup table for comments keyed by messageId for efficient access
  const commentsLookup = comments.reduce((acc, comment) => {
    acc[comment.messageId - 1] = comment.content;
    return acc;
  }, {});
  const responsesLookup = responses.reduce((acc, response) => {
    acc[response.messageId] = response.content;
    return acc;
  }, {});
  // console.log(Object.keys(commentsLookup));
  // console.log(messages);
  //   console.log(commentsLookup[88]);
  // console.log("Responses Lookup:", responsesLookup);

  // Prepare the dataset for download
  const dataset = messages
    .map((message) => {
      const { id, content } = message;
      // console.log(id);
      const commentContent = commentsLookup[id];
      const responseContent = responsesLookup[id];

      // If there is no commentContent or responseContent, return null to filter it out.
      if (commentContent === undefined && responseContent === undefined) {
        return null;
      }

      if (commentContent === undefined) {
        return {
          messages: [
            { role: "user", content: content },
            { role: "assistant", content: responseContent },
          ],
        };
      }

      return {
        messages: [
          { role: "user", content: content },
          { role: "assistant", content: commentContent },
        ],
      };
    })
    .filter(Boolean); // Filter out any null entries

  // Download the dataset as a JSON file
  const handleDownload = () => {
    console.log("Download initiated");
    const blob = new Blob([JSON.stringify(dataset, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, "dataset.json");
  };

  return (
    <Button variant={"ghost"} onClick={handleDownload}>
      <Download size={20} />
    </Button>
  );
};

export default DownloadButton;
