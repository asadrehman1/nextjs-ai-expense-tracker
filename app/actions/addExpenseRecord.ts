"use server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface RecordData {
  text: string;
  amount: number;
  category: string;
  date: string;
}

interface RecordResult {
  data?: RecordData;
  error?: string;
}

async function addExpenseRecord(formData: FormData): Promise<RecordResult> {
  const textValue = formData.get("text");
  const amountValue = formData.get("amount");
  const categoryValue = formData.get("category");
  const dateValue = formData.get("date");

  // Check for input values
  if (
    !textValue ||
    textValue === "" ||
    !amountValue ||
    !categoryValue ||
    categoryValue === "" ||
    !dateValue ||
    dateValue === ""
  ) {
    return { error: "Text, amount, category, or date is missing" };
  }

  const text: string = textValue.toString();
  const amount: number = parseFloat(amountValue.toString());
  const category: string = categoryValue.toString();
  // Convert date to ISO-8601 format while preserving the user's input date
  let date: string;
  try {
    // Parse the date string (YYYY-MM-DD format) and create a date at noon UTC to avoid timezone issues
    const inputDate = dateValue.toString();
    const [year, month, day] = inputDate.split("-");
    const dateObj = new Date(
      Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0)
    );
    date = dateObj.toISOString();
  } catch (error) {
    console.error("Invalid date format:", error); // Log the error
    return { error: "Invalid date format" };
  }

  // Get logged in user
  const { userId } = await auth();

  // Check for user
  if (!userId) {
    return { error: "User not found" };
  }

  try {
    const createdRecord = await db.record.create({
      data: {
        text,
        amount,
        category,
        date,
        userId,
      },
    });

    const recordData: RecordData = {
      text: createdRecord.text,
      amount: createdRecord.amount,
      category: createdRecord.category,
      date: createdRecord.date?.toISOString() || date,
    };

    revalidatePath("/");

    return { data: recordData };
  } catch (error) {
    console.error("Error adding expense record:", error);
    return {
      error: "An unexpected error occurred while adding the expense record.",
    };
  }
}

export default addExpenseRecord;
