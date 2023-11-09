import { Papers } from "@/components/Papers";
import { db } from "@/lib/db";
import { papers } from "@/lib/db/schema";
import { eq, or, sql } from "drizzle-orm";
import { DrizzlePaper } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs";

const RootPage = async () => {
  // const data: DrizzlePaper[] = await db.select().from(papers);
  // .where(sql`${papers.id} > 0`);
  // console.log(data);
  const user = await currentUser();
  const userId = user?.id;

  const data = await db
    .select()
    .from(papers)
    .where(sql`${papers.id} > 0`);

  // console.log(data);

  return (
    <div className="h-full p-8 space-y-2">
      {/* <SearchInput />
      <Categories data={categories} />
      <Companions data={data} /> */}
      <Papers data={data} />
    </div>
  );
};

export default RootPage;
