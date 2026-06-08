import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/middleware";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = requireAuth(req);
    if (errorResponse) return errorResponse;

    const userTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, user!.userId));

    return NextResponse.json({ tasks: userTasks }, { status: 200 });
  } catch (error) {
    console.error("Fetch Tasks Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = requireAuth(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const parsedData = taskSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsedData.error },
        { status: 400 },
      );
    }

    const [newTask] = await db
      .insert(tasks)
      .values({
        title: parsedData.data.title,
        description: parsedData.data.description,
        userId: user!.userId,
      })
      .returning();
    return NextResponse.json(
      { message: "Task created successfully", task: newTask },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create Tasks Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
