"use server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Record } from "@/types/Record";

async function getRecords(): Promise<{
  records?: Record[];
  error?: string;
}> {
  const { userId } = await auth();

  if (!userId) {
    return { error: "User not found" };
  }

  try {
    const records = await db.record.findMany({
      where: { userId },
      orderBy: {
        date: "desc",
      },
      take: 10,
    });

    return { records };
  } catch (error) {
    console.error("Error fetching records:", error);
    return { error: "Database error" };
  }
}

export default getRecords;
