"use client";

import * as z from "zod";
import axios from "axios";
import { set, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { DrizzlePaper } from "@/lib/db/schema";
import { toast } from "react-hot-toast";
import { UploadCloud } from "lucide-react";
import { StopCircle } from "lucide-react";
import { FileSignature } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
// import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { uploadToS3 } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import { Inbox, Loader2, CheckCircle } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";

const formSchema = z.object({
  paperTitle: z.string().min(1, {
    message: "Paper title is required.",
  }),
  description: z.string().min(1, {
    message: "Description is required.",
  }),
});

interface PaperFormProps {
  initialData: DrizzlePaper | null;
}

export const PaperForm = ({ initialData }: PaperFormProps) => {
  const router = useRouter();
  //   const { user } = useUser();
  //   const userName = `${user?.firstName} ${user?.lastName}`;
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  //   const [isEditing, setIsEditing] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      paperTitle: "",
      description: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
      paperTitle,
      description,
    }: //   userName,
    {
      file_key: string;
      file_name: string;
      paperTitle: string;
      description: string;
      //   userName: string;
    }) => {
      const response = await axios.post("/api/create-paper", {
        file_key,
        file_name,
        paperTitle,
        description,
        // userName,
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
      toast.success("File selected. Ready to upload.");
    },
  });

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    if (initialData) {
      //   setIsEditing(true);
      try {
        setUploading(true);
        await axios.patch(`/api/paper/${initialData.id}`, values);
      } catch (error) {
        console.error(error);
        toast.error("Update Failed. Please try again.");
      } finally {
        setUploading(false);
        toast.success("Paper updated!");
        // setIsEditing(false);
        router.push(`/paper/${initialData.id}/view`);
      }
    } else {
      const { paperTitle, description } = values;
      if (!file) {
        toast.error("No file selected");
        return;
      }
      setUploading(true);
      try {
        const data = await uploadToS3(file);
        if (!data?.file_key || !data.file_name) {
          toast.error("Failed to upload to S3");
          return;
        }
        mutate(
          {
            file_key: data.file_key,
            file_name: data.file_name,
            paperTitle,
            description,
            // userName,
          },
          {
            onSuccess: (data) => {
              toast.success("Paper created!");
              router.push(`/paper/${data.paper_id}/view`);
            },
            onError: (err) => {
              toast.error("Error creating paper");
              setFile(null);
              console.error(err);
            },
          }
        );
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setUploading(false);
      }
    }
  };

  const onSubmit = form.handleSubmit(handleFormSubmit);

  return (
    <div className="h-full p-4 space-y-2 max-w-3xl mx-auto">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-8 pb-10">
          <div className="space-y-2 w-full col-span-2">
            <div>
              <h3 className="text-lg font-medium">General Information</h3>
              <p className="text-sm text-muted-foreground">
                General information about your paper
              </p>
            </div>
            <Separator className="bg-primary/10" />
          </div>
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
                  {initialData ? "Updating..." : "Uploading the paper ..."}
                  {/* Uploading the paper ... */}
                </p>
              </>
            ) : file || initialData ? (
              <CheckCircle className="w-10 h-10 text-green-500" />
            ) : (
              <>
                <Inbox className="w-10 h-10 text-blue-500" />
                <p className="mt-2 text-sm text-slate-400">Drop Paper Here</p>
              </>
            )}
          </div>
          <FormField
            name="paperTitle"
            control={form.control}
            render={({ field }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel>Paper Title</FormLabel>
                <FormControl>
                  <Input
                    disabled={uploading}
                    placeholder="Attention is All You Need"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Make sure you enter the paper title correctly, otherwise it
                  will affect the quality of model feedbacks
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="description"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={uploading}
                    rows={7}
                    className="bg-background resize-none"
                    placeholder={`Description for your paper (500 characters max)`}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Description for your paper. Please share why you think
                  it&apos;s important or what your thoughts are as a reviwer
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="w-full flex justify-center">
            <Button size="lg" disabled={isPending}>
              {isPending
                ? [<StopCircle size={20} className="mr-3" />, " Creating ..."]
                : initialData
                ? [
                    <FileSignature size={20} className="mr-3" />,
                    " Edit Your Paper",
                  ]
                : [<UploadCloud size={20} className="mr-3" />, " Create Paper"]}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
