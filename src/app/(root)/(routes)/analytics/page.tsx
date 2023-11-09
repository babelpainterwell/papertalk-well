import { Papers } from "@/components/Papers";
import { db } from "@/lib/db";
import { papers, DrizzlePaper } from "@/lib/db/schema";
import { eq, or, sql } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs";

const AnalyticsPage = async () => {
  const user = await currentUser();
  const userId = user?.id;

  const data = await db
    .select()
    .from(papers)
    .where(sql`${papers.id} > 0 and ${papers.ownerId} = ${userId}`);

  // console.log(data);

  return (
    <div className="h-full p-8 space-y-2">
      <Papers data={data} />
    </div>
  );
};

export default AnalyticsPage;
