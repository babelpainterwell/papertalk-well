"use client";
import { uploadToS3 } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import { Inbox, Loader2, CheckCircle } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { auth, useUser } from "@clerk/nextjs";

// https://github.com/aws/aws-sdk-js-v3/issues/4126

const FileUpload = () => {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);

  const [paperTitle, setPaperTitle] = React.useState("");
  const [abstract, setAbstract] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null); // Explicitly typing the state
  const [fileStatus, setFileStatus] = React.useState(false);

  const { user } = useUser();
  const userName = `${user?.firstName} ${user?.lastName}`;

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
      paperTitle,
      abstract,
      description,
      userName,
    }: {
      file_key: string;
      file_name: string;
      paperTitle: string;
      abstract: string;
      description: string;
      userName: string;
    }) => {
      const response = await axios.post("/api/create-paper", {
        file_key,
        file_name,
        paperTitle,
        abstract,
        description,
        userName,
      });
      return response.data;
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        // bigger than 10mb!
        toast.error("File too large");
        return;
      }
      setFile(file); // Store the file data, don't upload yet
      if (file) {
        setFileStatus(true);
        toast.success("File selected. Waiting for upload ...");
      } else {
        toast.error("No file selected");
      }
    },
  });

  const handleFormSubmit = async () => {
    if (!file) {
      toast.error("No file selected");
      return;
    }
    try {
      setUploading(true);
      const data = await uploadToS3(file);
      if (!data?.file_key || !data.file_name) {
        toast.error("Something went wrong");
        return;
      }
      mutate(
        {
          file_key: data.file_key,
          file_name: data.file_name,
          paperTitle,
          abstract,
          description,
          userName,
        },
        {
          onSuccess: ({ paper_id }) => {
            toast.success("Paper created!");
            router.push(`/paper/${paper_id}`);
          },
          onError: (err) => {
            toast.error("Error creating paper");
            setFileStatus(false);
            console.error(err);
          },
        }
      );
    } catch (error) {
      console.error(error);
      toast.error("Error occurred during upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-2 bg-white rounded-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleFormSubmit();
        }}
      >
        <div
          {...getRootProps({
            className:
              "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
          })}
        >
          <input {...getInputProps()} />
          {uploading || isPending ? (
            <>
              {/* loading state */}
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
              <p className="mt-2 text-sm text-slate-400">
                Uploading the paper ...
              </p>
            </>
          ) : fileStatus ? (
            <CheckCircle className="w-10 h-10 text-green-500" />
          ) : (
            <>
              <Inbox className="w-10 h-10 text-blue-500" />
              <p className="mt-2 text-sm text-slate-400">Drop Paper Here</p>
            </>
          )}
        </div>

        <input
          type="text"
          value={paperTitle}
          onChange={(e) => setPaperTitle(e.target.value)}
          placeholder="Paper Title"
        />
        <textarea
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
          placeholder="Abstract"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
        <button type="submit" disabled={uploading}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default FileUpload;
