import { db } from "@/lib/db";
import { papers } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import { toast } from "react-hot-toast";
import { PaperForm } from "@/components/PaperForm";

type Props = {
  params: {
    paperId: string;
  };
};

const PaperPage = async ({ params: { paperId } }: Props) => {
  // const [isEditPage, setIsEditPage] = useState(false);
  // const pathname = usePathname();
  // function to check if the URL contains a certain string
  // let editPage = false;
  // if (pathname.includes("edit")) {
  //   editPage = true;
  // }

  // get paperId from params
  const { userId } = auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  const paper = await db
    .select()
    .from(papers)
    .where(eq(papers.id, parseInt(paperId)));

  if (!paper) {
    toast.error("You have no access to this paper");
    return redirect("/dashboard");
  }

  const currentPaper = paper[0];

  return <PaperForm initialData={currentPaper} />;
};

export default PaperPage;
