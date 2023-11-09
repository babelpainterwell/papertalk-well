import { db } from "@/lib/db";
import { papers } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import { toast } from "react-hot-toast";
import FileUpload from "@/components/FileUpload";
import { PaperForm } from "@/components/PaperForm";

const CreatePaperPage = async () => {
  // null here is a placeholder
  return (
    <div className="container">
      {/* <FileUpload /> */}
      <PaperForm initialData={null} />
    </div>
  );
};

export default CreatePaperPage;
