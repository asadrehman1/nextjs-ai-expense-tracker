"use server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

async function getBestWorstExpense(): Promise<{
  bestExpense?: number;
  worstExpense?: number;
  error?: string;
}> {
  const { userId } = await auth();

  if (!userId) {
    return { error: "User not found" };
  }

  try {
    const records = await db.record.findMany({
      where: { userId },
      select: { amount: true },
    });

    if (!records || records.length === 0) {
      return { bestExpense: 0, worstExpense: 0 };
    }

    const amounts = records.map((record) => record.amount);

    // Calculate best and worst expense amounts
    const bestExpense = Math.max(...amounts);
    const worstExpense = Math.min(...amounts);

    return { bestExpense, worstExpense };
  } catch (error) {
    console.error("Error fetching expense amounts:", error);
    return { error: "Database error" };
  }
}

export default getBestWorstExpense;
